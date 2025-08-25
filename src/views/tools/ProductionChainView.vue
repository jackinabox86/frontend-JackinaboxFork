<script setup lang="ts">
	import { onMounted, ref, Ref } from "vue";

	// Unhead
	import { useHead } from "@unhead/vue";
	useHead({
		title: "Production Chain | PRUNplanner",
	});

	// Components
	import WrapperGameDataLoader from "@/features/wrapper/components/WrapperGameDataLoader.vue";
	import HelpDrawer from "@/features/help/components/HelpDrawer.vue";
	import GraphVueFlow from "@/features/production_chain/components/GraphVueFlow.vue";
	import GraphAnalysisMaterials from "@/features/production_chain/components/GraphAnalysisMaterials.vue";
	import GraphAnalysisExpertise from "@/features/production_chain/components/GraphAnalysisExpertise.vue";
	import GraphAnalysisWorkforce from "@/features/production_chain/components/GraphAnalysisWorkforce.vue";

	// Composables
	import { useGraph } from "@/features/production_chain/useGraph";
	const { create } = useGraph();
	import { useMaterialData } from "@/features/game_data/useMaterialData";
	const { materialSelectOptions } = useMaterialData();

	// Types & Interfaces
	import { IGraphFlow } from "@/features/production_chain/productionGraph.types";
	import { PSelectOption } from "@/ui/ui.types";
	import {
		NodeColorType,
		NodeColorTypeOptions,
	} from "@/features/production_chain/components/ChainNode.types";

	// UI
	import {
		PForm,
		PFormItem,
		PFormSeperator,
		PInput,
		PSelect,
		PInputNumber,
	} from "@/ui";

	const graphData: Ref<IGraphFlow | null> = ref(null);

	const selectedMaterial: Ref<string> = ref("RAT");
	const selectedAmount: Ref<number> = ref(1);
	const selectedRecipes: Ref<Record<string, string>> = ref({});
	const selectedTerminals: Ref<string> = ref("");
	const recipeOptions: Ref<Record<string, PSelectOption[]>> = ref({});
	const selectedNodeColorType: Ref<NodeColorType> = ref("Material");

	function generate(resetSelection: boolean = false): void {
		if (resetSelection) selectedRecipes.value = {};

		graphData.value = create(
			selectedMaterial.value,
			selectedAmount.value,
			Object.values(selectedRecipes.value),
			selectedTerminals.value
		);

		selectedRecipes.value = graphData.value.recipeSelection;
		recipeOptions.value = graphData.value.recipeOptions;
	}

	onMounted(() => generate());
</script>

<template>
	<WrapperGameDataLoader load-recipes load-buildings>
		<div class="min-h-screen flex flex-col">
			<div
				class="px-6 py-3 border-b border-white/10 flex flex-row justify-between gap-x-3">
				<h1 class="text-2xl font-bold my-auto">Production Chains</h1>
				<HelpDrawer file-name="tools_production_chain" />
			</div>
			<div
				class="flex-grow grid grid-cols-1 xl:grid-cols-[400px_auto_300px] gap-3 divide-x divide-white/10">
				<div class="px-6 py-3">
					<h3 class="font-bold pb-3">Configuration</h3>
					<PForm>
						<PFormItem label="Material">
							<PSelect
								v-model:value="selectedMaterial"
								:options="materialSelectOptions"
								searchable
								class="w-full"
								@update:value="generate(true)" />
						</PFormItem>
						<PFormItem label="Recipe Runs">
							<PInputNumber
								v-model:value="selectedAmount"
								:min="1"
								show-buttons
								class="w-full"
								@update:value="generate()" />
						</PFormItem>
						<PFormItem label="Node Color">
							<PSelect
								v-model:value="selectedNodeColorType"
								:options="NodeColorTypeOptions"
								searchable
								class="w-full"
								@update:value="generate(true)" />
						</PFormItem>
						<PFormItem label="Terminals">
							<PInput
								v-model:value="selectedTerminals"
								placeholder="Comma-separated Material Tickers"
								class="w-full"
								@update:value="generate()" />
						</PFormItem>
						<PFormSeperator>
							<div class="text-xs !text-white/60">
								Terminals are materials whose inputs are
								excluded from the graph, useful if you buy them
								on the CX or locally and don't need to produce
								them.
							</div>
						</PFormSeperator>
					</PForm>
					<template v-if="graphData">
						<h3 class="font-bold py-3">Recipe Selection</h3>
						<PForm>
							<template
								v-for="[building, options] in Object.entries(
									recipeOptions
								)"
								:key="building">
								<PFormItem
									v-if="options.length > 1"
									:label="building">
									<PSelect
										v-model:value="
											selectedRecipes[building]
										"
										:options="options"
										class="w-full"
										@update:value="generate()" />
								</PFormItem>
							</template>
						</PForm>
					</template>

					<GraphAnalysisMaterials
						v-if="graphData"
						:material-analysis="graphData.materialAnalysis" />
				</div>
				<div class="py-3 pr-3">
					<GraphVueFlow
						v-if="graphData"
						:nodes="graphData.nodes"
						:edges="graphData.edges"
						:selected-node-color-type="selectedNodeColorType" />
				</div>
				<div class="pl-3 pr-6 py-3">
					<GraphAnalysisExpertise
						v-if="graphData"
						:expertise-analysis="graphData.expertiseAnalysis" />

					<GraphAnalysisWorkforce
						v-if="graphData"
						:workforce-analysis="graphData.workforceAnalysis" />
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
