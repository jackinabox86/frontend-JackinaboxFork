<script setup lang="ts">
	/*
		Allowing the drawer to render is quite the performance-hit
		due to many HTML elements being created.
	*/
	import { computed, ComputedRef, onMounted, ref, Ref } from "vue";

	// Composables
	import { useMaterialData } from "@/database/services/useMaterialData";
	import { useExchangeData } from "@/features/game_data/useExchangeData";
	import { usePostHog } from "@/lib/usePostHog";
	const { capture } = usePostHog();

	// Components
	import MaterialDataChart from "@/features/market_exploration/components/MaterialDataChart.vue";
	import MaterialCXOverviewTable from "@/features/cx/components/MaterialCXOverviewTable.vue";

	// Util
	import { formatNumber } from "@/util/numbers";
	import { capitalizeString } from "@/util/text";

	// Interfaces & Types
	import { IMaterial } from "@/features/api/gameData.types";
	import { IMaterialExchangeOverview } from "@/features/game_data/useMaterialData.types";
	import { PSelectOption } from "@/ui/ui.types";

	// UI
	import { PTooltip, PSelect } from "@/ui";
	import { NDrawer, NDrawerContent, NTable } from "naive-ui";

	// Props
	const props = defineProps({
		ticker: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: false,
			default: undefined,
		},
		disableDrawer: {
			type: Boolean,
			required: false,
			default: true,
		},
		max: {
			type: Number,
			required: false,
			default: undefined,
		},
		enablePopover: {
			type: Boolean,
			required: false,
			default: true,
		},
	});

	const { getMaterial, getMaterialClass } = useMaterialData();
	const { getMaterialExchangeOverview } = useExchangeData();

	const refShowDrawer: Ref<boolean> = ref(false);
	const refExchangeOverview: Ref<IMaterialExchangeOverview | undefined> =
		ref(undefined);

	const refChartValue: Ref<string> = ref("volume_max");
	const refChartValueOptions: Ref<PSelectOption[]> = ref([
		{
			label: "Traded Volume",
			value: "volume_max",
		},
		{
			label: "Average Price",
			value: "price_average",
		},
		{
			label: "Daily Minimum Price",
			value: "price_min",
		},
		{
			label: "Daily Maximum Price",
			value: "price_max",
		},
	]);

	const material = ref<IMaterial | null>(null);
	const categoryCssClass = ref<string>("");

	const indicatorPercentage: ComputedRef<number> = computed(() => {
		if (props.amount && props.max) {
			return (props.amount / props.max) * 100;
		}
		return 0;
	});

	const indicatorStyle: ComputedRef<string> = computed(() => {
		const percentage: number = 100 - indicatorPercentage.value;

		let color: string = "";

		if (percentage > 75) {
			color = "rgb(255, 0, 0)";
		} else if (percentage > 50) {
			color = "rgb(255, 165, 0)";
		} else if (percentage > 25) {
			color = "rgb(255, 299, 71)";
		} else {
			color = "rgb(60, 179, 113)";
		}

		const style: string =
			"background: linear-gradient(transparent " +
			percentage.toFixed(4) +
			"%, " +
			color +
			" 0%);";

		return style;
	});

	function toggleDrawer(): void {
		if (!props.disableDrawer) {
			refShowDrawer.value = !refShowDrawer.value;
			capture("materialtile_market_drawer", { material: props.ticker });
		}
	}

	onMounted(async () => {
		try {
			material.value = await getMaterial(props.ticker);
			categoryCssClass.value = getMaterialClass(props.ticker);
		} catch (err) {
			console.error("Failed to fetch material:", err);
		}
		try {
			if (props.enablePopover)
				refExchangeOverview.value = getMaterialExchangeOverview(
					props.ticker
				);
		} catch {
			refExchangeOverview.value = undefined;
		}
	});
</script>

<template>
	<div class="inline-block" :class="`material-tile#${ticker}`">
		<div
			class="flex flex-row items-center justify-center w-full material-tile"
			:class="[
				categoryCssClass,
				{ 'hover:cursor-pointer': !disableDrawer || enablePopover },
			]"
			@click="toggleDrawer">
			<PTooltip v-if="refExchangeOverview !== undefined && enablePopover">
				<template #trigger>
					<div
						class="flex justify-center items-center"
						:class="{ 'px-2': !!amount }">
						<div v-if="amount" class="pr-1">
							{{ formatNumber(amount) }}x
						</div>
						<div class="font-bold text-nowrap">
							{{ ticker }}
						</div>
					</div>
				</template>
				<MaterialCXOverviewTable
					v-if="refExchangeOverview"
					:key="`material-tile#CXOverview#${ticker}`"
					:ticker="ticker"
					:overview-data="refExchangeOverview" />
			</PTooltip>
			<template v-else>
				<div
					class="flex flex-row w-full justify-center items-center"
					:class="{ 'px-2': !!amount }">
					<div v-if="amount" class="pr-1">
						{{ formatNumber(amount) }}x
					</div>
					<div class="font-bold text-nowrap">{{ ticker }}</div>
				</div>
			</template>
			<PTooltip v-if="max">
				<template #trigger>
					<div
						class="!w-[7px] !my-0 border-white/50"
						:style="indicatorStyle">
						&nbsp;
					</div>
				</template>
				<n-table>
					<tbody>
						<tr>
							<th>Value</th>
							<td>{{ formatNumber(amount) }}</td>
						</tr>
						<tr>
							<th>Maximum</th>
							<td>{{ formatNumber(max) }}</td>
						</tr>
						<tr>
							<th>% / Max</th>
							<td>
								{{ formatNumber(indicatorPercentage) }}
								%
							</td>
						</tr>
					</tbody>
				</n-table>
			</PTooltip>
		</div>
	</div>

	<n-drawer
		v-if="refShowDrawer && material"
		v-model:show="refShowDrawer"
		:width="500"
		placement="right">
		<n-drawer-content title="Material Information">
			<div class="flex gap-x-5">
				<div class="flex items-center">
					<div
						:class="categoryCssClass"
						class="text-nowrap p-2 px-4 text-2xl text-shadow-[0_1px_1px_rgb(34,34,34)]">
						{{ material.Ticker }}
					</div>
				</div>
				<div class="flex-grow">
					<div
						class="w-full grid grid-cols-[25%_auto] child:odd:font-bold">
						<div>Category</div>
						<div>
							{{ capitalizeString(material.CategoryName) }}
						</div>
						<div>Weight</div>
						<div>
							{{ formatNumber(material.Weight, 4) }}
							t
						</div>
						<div>Volume</div>
						<div>
							{{ formatNumber(material.Volume, 4) }}
							m³
						</div>
					</div>
				</div>
			</div>
			<h3 class="font-bold text-lg py-5">Markets</h3>
			<MaterialCXOverviewTable
				v-if="refExchangeOverview"
				:ticker="ticker"
				:overview-data="refExchangeOverview" />

			<div class="flex py-5">
				<div class="my-auto grow">
					<h3 class="font-bold text-lg">Market History</h3>
				</div>
				<div>
					<PSelect
						v-model:value="refChartValue"
						class="!w-[200px]"
						size="sm"
						:options="refChartValueOptions" />
				</div>
			</div>

			<MaterialDataChart
				:material-ticker="ticker"
				:display-value="refChartValue" />
		</n-drawer-content>
	</n-drawer>
</template>
