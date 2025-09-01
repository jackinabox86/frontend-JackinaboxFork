<script setup lang="ts">
	import { PropType } from "vue";

	import MaterialTile from "@/features/material_tile/components/MaterialTile.vue";

	// Util
	import { formatNumber } from "@/util/numbers";

	// Components

	// Types & Interfaces
	import { IGraphFlowMaterialAnalysis } from "@/features/production_chain/productionGraph.types";

	// UI
	import { NTable } from "naive-ui";

	defineProps({
		materialAnalysis: {
			type: Object as PropType<IGraphFlowMaterialAnalysis>,
			required: true,
		},
	});
</script>

<template>
	<h3 class="font-bold py-3">Materials</h3>
	<n-table striped>
		<thead>
			<tr>
				<th>Material</th>
				<th>Amount</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="material in materialAnalysis"
				:key="material.materialTicker">
				<td>
					<MaterialTile
						:key="material.materialTicker"
						:ticker="material.materialTicker" />
				</td>
				<td>
					{{ formatNumber(material.amount) }}
				</td>
			</tr>
		</tbody>
	</n-table>
</template>
