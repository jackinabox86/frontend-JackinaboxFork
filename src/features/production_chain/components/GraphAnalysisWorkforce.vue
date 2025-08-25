<script setup lang="ts">
	import { PropType } from "vue";

	// Util
	import { formatAmount } from "@/util/numbers";
	import { capitalizeString } from "@/util/text";

	// Types & Interfaces
	import { IGraphFlowWorkforceAnalysis } from "@/features/production_chain/productionGraph.types";
	import { WORKFORCECOLORS } from "@/features/production_chain/components/ChainNode.types";

	// UI
	import { NTable } from "naive-ui";

	defineProps({
		workforceAnalysis: {
			type: Array as PropType<IGraphFlowWorkforceAnalysis>,
			required: true,
		},
	});
</script>

<template>
	<h3 class="font-bold py-3">Workforce</h3>
	<n-table striped>
		<thead>
			<tr>
				<th>Workforce</th>
				<th class="!text-end">Required</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="workforce in workforceAnalysis"
				:key="workforce.workforce">
				<td>
					<span
						class="py-1 px-2"
						:style="`background-color: ${
							WORKFORCECOLORS[workforce.workforce]
						};`">
						{{ capitalizeString(workforce.workforce) }}
					</span>
				</td>
				<td class="text-end">
					{{ formatAmount(workforce.value) }}
				</td>
			</tr>
		</tbody>
	</n-table>
</template>
