import { computed, ref, Ref } from "vue";
import dayjs from "dayjs";

// Util
import { formatDate } from "@/util/date";

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
	function sanitizeData(data: IExploration[]): IExploration[] {
		let prevValue: number = Infinity;

		let prev_first: number = Infinity;
		let prev_max: number = Infinity;
		let prev_min: number = Infinity;
		let prev_last: number = Infinity;

		if (data.length > 0) {
			prev_first = data[0].price_first;
			prev_max = data[0].price_max;
			prev_min = data[0].price_min;
			prev_last = data[0].price_last;
		}

		for (let i = 0; i < data.length; i++) {
			// sanitize volume data
			if (data[i].volume_max === prevValue) data[i].volume_max = 0;
			else prevValue = data[i].volume_max;

			// sanitize chart candles data
			if (
				i > 0 &&
				(data[i].price_first > 3 * prev_first ||
					data[i].price_max > 3 * prev_max ||
					data[i].price_min > 3 * prev_min ||
					data[i].price_last > 3 * prev_last)
			) {
				if (data[i].price_first > 3 * prev_first)
					data[i].price_first = Math.round(3 * prev_first);
				if (data[i].price_max > 3 * prev_max)
					data[i].price_max = Math.round(3 * prev_max);
				if (data[i].price_min > 3 * prev_min)
					data[i].price_min = Math.round(3 * prev_min);
				if (data[i].price_last > 3 * prev_last)
					data[i].price_last = Math.round(3 * prev_last);
			} else {
				prev_first = data[i].price_first;
				prev_max = data[i].price_max;
				prev_min = data[i].price_min;
				prev_last = data[i].price_last;
			}
		}

		return data;
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
