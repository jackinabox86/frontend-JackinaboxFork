<script setup lang="ts">
	import { ref, Ref } from "vue";

	// Components
	import WrapperGameDataLoader from "@/features/wrapper/components/WrapperGameDataLoader.vue";
	import HelpDrawer from "@/features/help/components/HelpDrawer.vue";

	// Composables
	import { useGraph } from "@/features/production_chain/useGraph";
	const { create } = useGraph();

	// Types & Interfaces
	import { IGraphFlow } from "@/features/production_chain/graph.types";

	// Vue Flow
	import { VueFlow } from "@vue-flow/core";
	import { MiniMap } from "@vue-flow/minimap";
	import ChainNode from "@/features/production_chain/components/ChainNode.vue";

	// UI
	import { PButton } from "@/ui";

	const graphData: Ref<IGraphFlow | null> = ref(null);

	function generate(): void {
		graphData.value = create("RAD", 1);
	}
</script>

<template>
	<WrapperGameDataLoader load-recipes>
		<div class="min-h-screen flex flex-col">
			<div
				class="px-6 py-3 border-b border-white/10 flex flex-row justify-between gap-x-3">
				<h1 class="text-2xl font-bold my-auto">Production Chains</h1>
				<HelpDrawer file-name="tools_production_chain" />
			</div>
			<div class="px-6 py-3">
				<PButton @click="generate">Generate Graph</PButton>
				<br />
				<br />
				<div v-if="graphData" style="width: 100%; height: 85vh">
					<VueFlow
						:nodes="graphData.nodes"
						:edges="graphData.edges"
						:nodes-connectable="false">
						<MiniMap
							pannable
							zoomable
							node-color="#bf000c"
							node-stroke-color="#bf000c" />

						<template #node-chain="props">
							<ChainNode :id="props.id" :data="props.data" />
						</template>
					</VueFlow>
				</div>
			</div>
		</div>
	</WrapperGameDataLoader>
</template>

<style>
	/* these are necessary styles for vue flow */
	@import "@vue-flow/core/dist/style.css";

	/* this contains the default theme, these are optional styles */
	@import "@vue-flow/core/dist/theme-default.css";
</style>
