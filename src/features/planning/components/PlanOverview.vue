<script setup lang="ts">
	import { PropType } from "vue";

	// Util
	import { formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import {
		IOverviewData,
		IVisitationData,
	} from "@/features/planning/usePlanCalculation.types";

	// UI
	import { PTable } from "@/ui";

	defineProps({
		visitationData: {
			type: Object as PropType<IVisitationData>,
			required: true,
		},
		overviewData: {
			type: Object as PropType<IOverviewData>,
			required: true,
		},
	});
</script>

<template>
	<PTable striped>
		<tbody class="child:child:first:font-bold child:child:last:text-end">
			<tr>
				<td>Storage</td>
				<td>
					{{ formatNumber(visitationData.storageFilled) }}
					<span class="font-light text-white/50"> d </span>
				</td>
			</tr>
			<tr>
				<td>Daily Cost</td>
				<td>
					{{ formatNumber(overviewData.dailyCost) }}
					<span class="font-light text-white/50"> $ </span>
				</td>
			</tr>
			<tr>
				<td>Degradation</td>
				<td>
					{{ formatNumber(overviewData.dailyDegradationCost) }}
					<span class="font-light text-white/50"> $ </span>
				</td>
			</tr>
			<tr>
				<td>Daily Profit</td>
				<td
					:class="
						overviewData.profit >= 0
							? '!text-positive'
							: '!text-negative'
					">
					{{ formatNumber(overviewData.profit) }}
					<span class="font-light text-white/50"> $ </span>
				</td>
			</tr>
			<tr>
				<td>Plan Cost</td>
				<td>
					{{ formatNumber(overviewData.totalConstructionCost) }}
					<span class="font-light text-white/50"> $ </span>
				</td>
			</tr>
			<tr>
				<td>ROI</td>
				<td
					:class="
						overviewData.roi > 0
							? '!text-positive'
							: '!text-negative'
					">
					{{ formatNumber(overviewData.roi) }}
					<span class="font-light text-white/50"> d </span>
				</td>
			</tr>
		</tbody>
	</PTable>
</template>
