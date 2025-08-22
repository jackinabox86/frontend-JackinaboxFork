<template>
	<Handle v-if="data.hasInput" type="target" :position="Position.Left" />
	<Handle v-if="data.hasOutput" type="source" :position="Position.Right" />
	<div
		class="flex flex-col text-white border border-black"
		:class="`material-tile ${materialClass}`"
		:style="`height: ${nodeDimensions.height}px; width: ${nodeDimensions.width}px;`">
		<div class="flex flex-1 justify-center items-center text-xs">
			{{ formatNumber(data.amount, 2, true) }}
		</div>
		<div class="font-bold flex flex-1 justify-center items-center">
			{{ data.materialTicker }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { PropType } from "vue";
	import { Handle, Position } from "@vue-flow/core";

	import { IFlowNodeData } from "../graph.types";
	import { nodeDimensions } from "../dagre.config";
	import { formatNumber } from "@/util/numbers";

	import { useMaterialData } from "@/features/game_data/useMaterialData";

	const props = defineProps({
		id: {
			type: String,
			required: true,
		},
		data: {
			type: Object as PropType<IFlowNodeData>,
			required: true,
		},
	});

	const { getMaterial } = useMaterialData();

	const materialClass = `material-category-${getMaterial(
		props.data.materialTicker
	)
		.CategoryName.replaceAll(" ", "-")
		.replaceAll("(", "")
		.replaceAll(")", "")}`;
</script>

<style></style>
