<script setup lang="ts">
	import { PropType } from "vue";

	// Composables
	import { useExchangeData } from "@/database/services/useExchangeData";
	const { exchangeTypesArray } = await useExchangeData();

	// Util
	import { formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import { IMaterialExchangeOverview } from "@/database/services/useExchangeData.types";

	// UI
	import { NTable } from "naive-ui";

	defineProps({
		ticker: {
			type: String,
			required: true,
		},
		overviewData: {
			type: Object as PropType<IMaterialExchangeOverview>,
			required: true,
		},
	});
</script>

<template>
	<n-table :key="`CX#OverviewTable#${ticker}`" striped>
		<thead>
			<tr>
				<th>{{ ticker }}</th>
				<th>AI1</th>
				<th>CI1</th>
				<th>IC1</th>
				<th>NC1</th>
			</tr>
		</thead>
		<tbody class="child:child:first:font-bold">
			<tr>
				<td>Ask</td>
				<td v-for="cx in exchangeTypesArray" :key="`Ask#${cx}`">
					{{ formatNumber(overviewData.Ask[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>Bid</td>
				<td v-for="cx in exchangeTypesArray" :key="`Bid#${cx}`">
					{{ formatNumber(overviewData.Bid[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>Average</td>
				<td v-for="cx in exchangeTypesArray" :key="`Average#${cx}`">
					{{ formatNumber(overviewData.Average[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>PP7D</td>
				<td v-for="cx in exchangeTypesArray" :key="`PP7D#${cx}`">
					{{ formatNumber(overviewData.PP7D[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>PP30D</td>
				<td v-for="cx in exchangeTypesArray" :key="`PP30D#${cx}`">
					{{ formatNumber(overviewData.PP30D[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>7D Universe</td>
				<td colspan="4" class="text-center">
					{{ formatNumber(overviewData.Universe7D, 2, true) }}
				</td>
			</tr>
			<tr>
				<td>30D Universe</td>
				<td colspan="4" class="text-center">
					{{ formatNumber(overviewData.Universe30D, 2, true) }}
				</td>
			</tr>
			<tr>
				<td>Supply</td>
				<td v-for="cx in exchangeTypesArray" :key="`Supply#${cx}`">
					{{ formatNumber(overviewData.Supply[cx], 2, true) }}
				</td>
			</tr>
			<tr>
				<td>Demand</td>
				<td v-for="cx in exchangeTypesArray" :key="`Demand#${cx}`">
					{{ formatNumber(overviewData.Demand[cx], 2, true) }}
				</td>
			</tr>
		</tbody>
	</n-table>
</template>
