<script setup lang="ts">
	import { PropType } from "vue";

	// Util
	import { formatAmount, formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import { IFIOSitesRepairTablePlanetElement } from "@/features/fio/useFIORepair.types";

	// UI
	import { XNDataTable, XNDataTableColumn } from "@skit/x.naive-ui";

	defineProps({
		repairData: {
			type: Array as PropType<IFIOSitesRepairTablePlanetElement[]>,
			required: true,
		},
	});
</script>

<template>
	<h2 class="text-white/80 font-bold text-lg pb-3">Planets</h2>

	<x-n-data-table :data="repairData" striped>
		<x-n-data-table-column
			key="planetName"
			title="Planet"
			sorter="default" />
		<x-n-data-table-column
			key="amountProductionBuildings"
			title="Buildings"
			sorter="default" />
		<x-n-data-table-column
			key="averageCondition"
			title="⌀ Condition"
			sorter="default">
			<template #render-cell="{ rowData }">
				{{ formatNumber(rowData.averageCondition * 100) }} %
			</template>
		</x-n-data-table-column>
		<x-n-data-table-column
			key="minCondition"
			title="Min. Condition"
			sorter="default">
			<template #render-cell="{ rowData }">
				{{ formatNumber(rowData.minCondition * 100) }} %
			</template>
		</x-n-data-table-column>
		<x-n-data-table-column
			key="maxLastRepairDays"
			title="Repair Age"
			sorter="default">
			<template #render-cell="{ rowData }">
				{{ formatAmount(rowData.maxLastRepairDays) }}
			</template>
		</x-n-data-table-column>
	</x-n-data-table>
</template>
