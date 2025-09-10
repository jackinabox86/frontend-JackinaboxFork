<script setup lang="ts">
	import { ComputedRef, PropType, Ref, computed, ref } from "vue";

	// Util
	import { formatNumber } from "@/util/numbers";

	// Components
	import MaterialTile from "@/features/material_tile/components/MaterialTile.vue";
	import COGMButton from "@/features/roi_overview/components/COGMButton.vue";
	import PlanetPOPRButton from "@/features/government/components/PlanetPOPRButton.vue";
	import ResourceROITableFilters from "@/features/resource_roi_overview/components/ResourceROITableFilters.vue";

	// Types & Interfaces
	import { IResourceROIResult } from "@/features/resource_roi_overview/useResourceROIOverview.types";
	import { PSelectOption } from "@/ui/ui.types";

	// UI
	import { XNDataTable, XNDataTableColumn } from "@skit/x.naive-ui";

	const props = defineProps({
		searchedMaterial: {
			type: String,
			required: true,
		},
		resultData: {
			type: Array as PropType<IResourceROIResult[]>,
			required: true,
		},
	});

	const filterBuilding: Ref<string | null> = ref(null);
	const filterPostiveROI: Ref<boolean> = ref(false);
	const filterPlanet: Ref<string | null> = ref(null);

	const filterOptionBuilding: ComputedRef<PSelectOption[]> = computed(() =>
		Array.from(new Set(props.resultData.map((e) => e.buildingTicker)))
			.sort()
			.map((e) => ({ label: e, value: e }))
	);

	const filterOptionPlanet: ComputedRef<PSelectOption[]> = computed(() =>
		Array.from(new Set(props.resultData.map((e) => e.planetName)))
			.sort()
			.map((e) => ({ label: e, value: e }))
	);

	const localResult: ComputedRef<IResourceROIResult[]> = computed(() => {
		let filtered = props.resultData;

		if (filterBuilding.value !== null)
			filtered = filtered.filter(
				(f) => f.buildingTicker === filterBuilding.value
			);

		if (filterPlanet.value !== null)
			filtered = filtered.filter(
				(f) => f.planetName === filterPlanet.value
			);

		if (filterPostiveROI.value)
			filtered = filtered.filter((f) => f.planROI >= 0);

		return filtered;
	});
</script>

<template>
	<ResourceROITableFilters
		v-model:filter-planet="filterPlanet"
		v-model:filter-building="filterBuilding"
		v-model:filter-positive-r-o-i="filterPostiveROI"
		:planet-options="filterOptionPlanet"
		:building-options="filterOptionBuilding"
		:searched-material="searchedMaterial" />
	<XNDataTable :data="localResult" striped :pagination="{ pageSize: 50 }">
		<XNDataTableColumn key="planetName" title="Planet" sorter="default">
			<template #render-cell="{ rowData }">
				<router-link
					:to="`/plan/${rowData.planetNaturalId}`"
					class="text-link-primary font-bold hover:underline">
					{{ rowData.planetName }}
				</router-link>
			</template>
		</XNDataTableColumn>
		<XNDataTableColumn key="production" title="Production">
			<XNDataTableColumn
				key="buildingTicker"
				title="Building"
				sorter="default">
				<template #render-cell="{ rowData }">
					<span class="font-bold">{{ rowData.buildingTicker }}</span>
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn
				key="dailyYield"
				title="Daily Yield"
				sorter="default">
				<template #render-cell="{ rowData }">
					{{ formatNumber(rowData.dailyYield) }}
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn
				key="percentMaxDailyYield"
				title="$ Max. Yield"
				sorter="default">
				<template #render-cell="{ rowData }">
					{{ formatNumber(rowData.percentMaxDailyYield * 100) }} %
				</template>
			</XNDataTableColumn>
		</XNDataTableColumn>
		<XNDataTableColumn key="planet" title="Planet Conditions">
			<XNDataTableColumn key="popr" title="POPR">
				<template #render-cell="{ rowData }">
					<PlanetPOPRButton
						:planet-natural-id="rowData.planetNaturalId"
						button-size="sm" />
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn key="planetSurface" title="Surface">
				<template #render-cell="{ rowData }">
					<MaterialTile
						v-for="element in rowData.planetSurface"
						:key="element"
						:ticker="element" />
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn key="planetPressure" title="Pressure">
				<template #render-cell="{ rowData }">
					<MaterialTile
						v-for="element in rowData.planetPressure"
						:key="element"
						:ticker="element" />
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn key="planetGravity" title="Gravity">
				<template #render-cell="{ rowData }">
					<MaterialTile
						v-for="element in rowData.planetGravity"
						:key="element"
						:ticker="element" />
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn key="planetTemperature" title="Temperature">
				<template #render-cell="{ rowData }">
					<MaterialTile
						v-for="element in rowData.planetTemperature"
						:key="element"
						:ticker="element" />
				</template>
			</XNDataTableColumn>
		</XNDataTableColumn>
		<XNDataTableColumn key="profit" title="Profit">
			<XNDataTableColumn key="cogm" title="COGM">
				<template #render-cell="{ rowData }">
					<COGMButton :cogm-data="rowData.cogm" />
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn
				key="planCost"
				title="Plan Cost"
				sorter="default">
				<template #title>
					<div class="text-end">Plan Cost</div>
				</template>
				<template #render-cell="{ rowData }">
					<div class="text-end">
						{{ formatNumber(rowData.planCost) }}
						<span class="pl-1 font-light text-white/50"> $ </span>
					</div>
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn
				key="outputProfit"
				title="Output Profit"
				sorter="default">
				<template #title>
					<div class="text-end">Output Profit</div>
				</template>
				<template #render-cell="{ rowData }">
					<div
						class="text-end"
						:class="
							rowData.outputProfit > 0
								? 'text-positive'
								: 'text-negative'
						">
						{{ formatNumber(rowData.outputProfit) }}
						<span class="pl-1 font-light text-white/50"> $ </span>
					</div>
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn
				key="dailyProfit"
				title="Daily Profit"
				sorter="default">
				<template #title>
					<div class="text-end">Daily Profit</div>
				</template>
				<template #render-cell="{ rowData }">
					<div
						class="text-end"
						:class="
							rowData.dailyProfit > 0
								? 'text-positive'
								: 'text-negative'
						">
						{{ formatNumber(rowData.dailyProfit) }}
						<span class="pl-1 font-light text-white/50"> $ </span>
					</div>
				</template>
			</XNDataTableColumn>
			<XNDataTableColumn key="planROI" title="Plan ROI" sorter="default">
				<template #title>
					<div class="text-end">Plan ROI</div>
				</template>
				<template #render-cell="{ rowData }">
					<div
						class="text-end"
						:class="
							rowData.planROI > 0
								? 'text-positive'
								: 'text-negative'
						">
						{{ formatNumber(rowData.planROI) }}
						<span class="pl-1 font-light text-white/50"> d </span>
					</div>
				</template>
			</XNDataTableColumn>
		</XNDataTableColumn>
	</XNDataTable>
</template>
