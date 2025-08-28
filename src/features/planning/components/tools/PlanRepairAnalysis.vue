<script setup lang="ts">
	import { computed, ComputedRef, PropType, Ref, ref, watch } from "vue";

	// Composables
	import { usePrice } from "@/features/cx/usePrice";

	// Components
	import { Chart } from "highcharts-vue";

	// Types & Interfaces
	import {
		IPlanRepairAnalysisDataProp,
		IPlanRepairAnalysisElement,
	} from "@/features/planning/components/tools/planRepairAnalysis.types";
	import { PSelectOption } from "@/ui/ui.types";
	import { IMaterialIOMinimal } from "@/features/planning/usePlanCalculation.types";
	import { Options } from "highcharts";

	// UI
	import { PButton, PForm, PFormItem, PSelect } from "@/ui";
	import { CloseSharp } from "@vicons/material";

	const props = defineProps({
		data: {
			type: Array as PropType<IPlanRepairAnalysisDataProp[]>,
			required: true,
		},
		cxUuid: {
			type: String,
			required: false,
			default: undefined,
		},
		planetNaturalId: {
			type: String,
			required: false,
			default: undefined,
		},
	});

	const emit = defineEmits<{
		(e: "close"): void;
	}>();

	const DAY_MIN: number = 0;
	const DAY_MAX: number = 180;

	// Local State
	const localData: Ref<IPlanRepairAnalysisDataProp[]> = ref(props.data);
	const localCxUuid: Ref<string | undefined> = ref(props.cxUuid);
	const localPlanetNaturalId: Ref<string | undefined> = ref(
		props.planetNaturalId
	);

	// Prop Watcher
	watch(
		() => props.data,
		(newData: IPlanRepairAnalysisDataProp[]) => {
			localData.value = newData;
		}
	);
	watch(
		() => props.cxUuid,
		(newData: string | undefined) => {
			localCxUuid.value = newData;
		}
	);
	watch(
		() => props.planetNaturalId,
		(newData: string | undefined) => {
			localPlanetNaturalId.value = newData;
		}
	);

	const selectionOptions: Ref<PSelectOption[]> = ref(
		localData.value.map((b, i) => {
			return { label: b.name, value: i };
		})
	);

	const selectedBuilding: Ref<undefined | number> = ref(
		localData.value.length > 0 ? 0 : undefined
	);

	const { getPrice } = await usePrice(localCxUuid, localPlanetNaturalId);

	const rep: ComputedRef<IPlanRepairAnalysisElement[]> = computed(() => {
		const r: IPlanRepairAnalysisElement[] = [];

		if (selectedBuilding.value === undefined) return r;

		let i: number;

		let previous: number = 0;

		const materials: IMaterialIOMinimal[] =
			localData.value[selectedBuilding.value].constructionMaterials;

		for (i = DAY_MIN; i <= DAY_MAX; i++) {
			const efficiency: number =
				0.33 + 0.67 / (1 + Math.exp((1789 / 25000) * (i - 100.87)));

			const dailyRevenue: number =
				efficiency *
				localData.value[selectedBuilding.value].dailyRevenue;
			previous += dailyRevenue;
			const dailyRevenue_norm: number = previous / (i + 1);

			const mat: { ticker: string; amount: number }[] = materials.map(
				(m) => {
					return {
						ticker: m.ticker,
						amount:
							m.input -
							Math.floor(
								(m.input * (180 - Math.min(180, i))) / 180
							),
					};
				}
			);

			const rep: number = mat.reduce(
				(sum, element) =>
					sum + element.amount * getPrice(element.ticker, "BUY"),
				0
			);
			const repSum: number = rep / (i + 1);
			const profit: number = dailyRevenue_norm - repSum;

			r.push({
				day: i,
				efficiency: efficiency,
				dailyRevenue: dailyRevenue,
				dailyRevenue_integral: previous,
				dailyRevenue_norm: dailyRevenue_norm,
				materials: mat,
				repair: repSum,
				dailyRepair: rep,
				profit: i === 0 ? 0 : profit,
			});
		}

		// manipulate the first entries profit, if there are at least two
		if (r.length >= 2) {
			r[0].profit = r[1].profit;
		}

		return r;
	});

	const maxValue: ComputedRef<number> = computed(() => {
		return Math.max(...rep.value.map((o) => o.profit));
	});

	const maxDay: ComputedRef<number> = computed(() => {
		return rep.value.findIndex((e) => e.profit === maxValue.value);
	});

	const singleMat: ComputedRef<
		{ name: string; data: (number | undefined)[] }[]
	> = computed(() => {
		if (rep.value.length === 0) return [];

		const mats = rep.value[0].materials.map((m) => m.ticker);

		return mats.map((mat) => {
			return {
				name: mat,
				data: rep.value.map((r) => {
					const b = r.materials.find((e) => e.ticker === mat);
					if (b) {
						return b.amount * getPrice(b.ticker, "BUY");
					}
				}),
			};
		});
	});

	const chartOptions: ComputedRef<Options> = computed(() => {
		return {
			chart: {
				type: "line",
				height: "400px",
			},
			yAxis: {
				title: {
					text: "Profit / Day",
				},
				labels: {
					format: "${text}",
				},
			},
			xAxis: {
				title: {
					text: "Days since Repair",
				},
			},
			tooltip: {
				headerFormat: "Day: <strong>{point.key}</strong><br />",
				pointFormat: "$ {y:.2f}",
			},
			series: [
				{
					name: "Repair Analyis",
					data: rep.value.map((r) => r.profit),
				},
				{
					name: "Last Optimal Profit",
					data: [{ x: maxDay.value, y: maxValue.value }],
					marker: {
						symbol: "diamond",
					},
					dataLabels: {
						enabled: true,
						format: "Day: <strong>{x}</strong><br />$ {y:.2f}",
					},
				},
			],
			title: {
				text: "",
			},
		} as Options;
	});

	const costOptions: ComputedRef<Options> = computed(() => {
		const s = [
			{
				name: "Total Cost",
				data: rep.value.map((r) => r.dailyRepair),
			},
		].concat(singleMat.value as { name: string; data: number[] }[]);

		return {
			chart: {
				type: "line",
				height: "400px",
			},
			tooltip: {
				headerFormat:
					"<strong>{series.name}</strong><br />Day: <strong>{point.key}</strong><br />",
				pointFormat: "$ {y:.2f}",
			},
			yAxis: {
				title: {
					text: "Cost",
				},
				labels: {
					format: "${text}",
				},
			},
			xAxis: {
				title: {
					text: "Days since Repair",
				},
			},
			series: s,
			title: {
				text: "",
			},
		} as Options;
	});
</script>

<template>
	<div class="pb-3 flex flex-row justify-between child:my-auto">
		<h2 class="text-white/80 font-bold text-lg">Repair Analysis</h2>
		<PButton size="sm" type="secondary" @click="emit('close')">
			<template #icon><CloseSharp /></template>
		</PButton>
	</div>
	<div class="text-white/50 pb-3">
		The Repair Analysis is based on the work of
		<a
			href="https://docs.google.com/spreadsheets/d/1ELsfw4ii1hQFWDd-BL4JzwqHc-wGVXbJtvAeprv0pZ0/edit?gid=753753671#gid=753753671"
			target="_blank"
			class="underline">
			MoonSugarTravels PrUn building repair calculator
		</a>
		who deeply analyzed the degradation mechanics and how to find the
		optimal intersection of profitability and repair cost.
	</div>
	<div class="w-1/2 min-w-[400px] pb-3">
		<PForm>
			<PFormItem label="Building">
				<PSelect
					v-model:value="selectedBuilding"
					:options="selectionOptions"
					class="w-full" />
			</PFormItem>
		</PForm>
	</div>
	<template v-if="selectionOptions.length > 0">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
			<div>
				<h2 class="text-lg font-bold pb-3">Profit Curve</h2>
				<chart
					v-if="rep.length > 0"
					ref="chart"
					class="hc"
					:options="chartOptions as Options" />
			</div>
			<div>
				<h2 class="text-lg font-bold pb-3">Repair Cost Breakdown</h2>
				<chart
					v-if="rep.length > 0"
					ref="chart"
					class="hc"
					:options="costOptions as Options" />
			</div>
		</div>
	</template>
</template>
