import { computed, ref, Ref } from "vue";
import dayjs from "dayjs";

// Util
import { formatDate } from "@/util/date";
import { clamp } from "@/util/numbers";

// Composables
import { useQuery } from "@/lib/query_cache/useQuery";

// Types & Interfaces
import { IExploration } from "@/features/market_exploration/marketExploration.types";

export function useMarketExplorationChart(
	exchangeTicker: Ref<string>,
	materialTicker: Ref<string>
) {
	const maxDate = new Date();
	const minDate = new Date(Date.UTC(2022, 6 - 1, 1));

	const data: Ref<IExploration[]> = ref([]);
	const loading: Ref<boolean> = ref(false);
	const error: Ref<boolean> = ref(false);

	const isLoading = computed(() => loading.value);
	const hasError = computed(() => error.value);
	const dataChart = computed(() => data.value);

	const dataCandlestick = computed(() => {
		return data.value.map((d) => [
			dayjs(d.Datetime, "YYYY-MM-DD").unix() * 1000,
			d.price_first,
			d.price_max,
			d.price_min,
			d.price_last,
		]);
	});

	const dataVolume = computed(() => {
		return data.value.map((d) => [
			dayjs(d.Datetime).unix() * 1000,
			d.volume_max,
		]);
	});

	const dataDelta = computed(() => {
		return data.value.map((d) => [
			dayjs(d.Datetime).unix() * 1000,
			d.delta_supply_demand,
		]);
	});

	const chartOptions = computed(() => {
		return {
			chart: {
				height: 900,
			},
			tooltip: {
				split: true,
			},
			yAxis: [
				{
					title: {
						text: "Candlestick",
					},
					height: "55%",
					resize: {
						enabled: true,
					},
					startOnTick: false,
				},
				{
					title: {
						text: "Volume",
					},
					height: "15%",
					top: "60%",
					offset: 0,
					resize: {
						enabled: true,
					},
				},
				{
					title: {
						text: "Δ Supply/Demand",
					},
					height: "15%",
					top: "80%",
					offset: 0,
					resize: {
						enabled: true,
					},
				},
			],
			series: [
				{
					id: "candles",
					name: `${materialTicker.value}`,
					type: "candlestick",
					data: dataCandlestick.value,
				} as Highcharts.SeriesOptionsType,
				{
					id: "volume",
					name: `${materialTicker.value}: Traded Volume`,
					type: "column",
					yAxis: 1,
					data: dataVolume.value,
					color: "#659bf1",
				} as Highcharts.SeriesOptionsType,
				{
					id: "delta",
					name: `${materialTicker.value}: Δ Supply/Demand`,
					type: "column",
					yAxis: 2,
					data: dataDelta.value,
					color: "green",
					negativeColor: "red",
				} as Highcharts.SeriesOptionsType,
			],
		};
	});

	/**
	 * Fetches market exploration data from the backend and stores it in the composable
	 * @author jplacht
	 *
	 * @async
	 * @returns {Promise<void>} Void, data stored in data property
	 */
	async function fetchData(): Promise<void> {
		loading.value = true;
		error.value = false;
		data.value = [];

		await useQuery("GetExplorationData", {
			exchangeTicker: exchangeTicker.value,
			materialTicker: materialTicker.value,
			payload: {
				start: formatDate(minDate),
				end: formatDate(maxDate),
			},
		})
			.execute()
			.then((result: IExploration[]) => {
				data.value = sanitizeData(result);
			})
			.catch(() => {
				error.value = true;
			})
			.finally(() => {
				loading.value = false;
			});
	}

	/**
	 * Skips volume_max parameter if it is the same as previous day
	 *
	 * Decision to do so made after various discussions via discord.
	 * FIO /exchanges/full data does not have 0 for non-trading days.
	 *
	 * @author jplacht
	 *
	 * @param {IExploration[]} data Exploration API Data
	 * @returns {IExploration[]} Cleaned Up exploration data
	 */
	function sanitizeData(
		data: IExploration[],
		multiplier: number = 3
	): IExploration[] {
		if (data.length === 0) return [];

		// clamps to previous ranged value
		const clampToPrevRange = (cur: number, prev: number): number => {
			if (!isFinite(prev)) {
				return cur;
			}
			const a = prev / multiplier;
			const b = prev * multiplier;
			const min = Math.min(a, b);
			const max = Math.max(a, b);
			return Math.round(clamp(cur, min, max));
		};

		// two datapoints being identical
		const sameRelevantFields = (
			a: IExploration,
			b: IExploration
		): boolean =>
			a.price_first === b.price_first &&
			a.price_last === b.price_last &&
			a.price_average === b.price_average &&
			a.price_min === b.price_min &&
			a.price_max === b.price_max;

		// sanitized data
		const out: IExploration[] = [{ ...data[0] }];

		// last trusted, non spiking datapoint
		let baseline = { ...data[0] };

		for (let i = 1; i < data.length; i++) {
			const previousTrusted = baseline;
			const currentOriginal = data[i];
			const currentModified: IExploration = { ...currentOriginal };

			// if all relevant fields are identical, set volume to 0
			if (sameRelevantFields(previousTrusted, currentOriginal)) {
				currentModified.volume_max = 0;
			}

			// clamp each value relative to baseline
			const first = clampToPrevRange(
				currentModified.price_first,
				previousTrusted.price_first
			);
			const max = clampToPrevRange(
				currentModified.price_max,
				previousTrusted.price_max
			);
			const min = clampToPrevRange(
				currentModified.price_min,
				previousTrusted.price_min
			);
			const last = clampToPrevRange(
				currentModified.price_last,
				previousTrusted.price_last
			);
			const avg = clampToPrevRange(
				currentModified.price_average,
				previousTrusted.price_average
			);

			// determine if any field was clamped
			const wasClamped =
				first !== currentModified.price_first ||
				max !== currentModified.price_max ||
				min !== currentModified.price_min ||
				last !== currentModified.price_last ||
				avg !== currentModified.price_average;

			// apply sanitized values
			currentModified.price_first = first;
			currentModified.price_max = max;
			currentModified.price_min = min;
			currentModified.price_last = last;
			currentModified.price_average = avg;

			out.push(currentModified);

			// only update baseline if no clamp happened
			if (!wasClamped) {
				baseline = { ...currentOriginal };
			}
		}

		return out;
	}

	return {
		fetchData,
		sanitizeData,
		isLoading,
		hasError,
		// data
		dataChart,
		dataCandlestick,
		dataVolume,
		dataDelta,
		// chart
		chartOptions,
	};
}
