import { ProductionEdge } from "./productionEdge";
import { ProductionNode } from "./productionNode";

import { useBuildingData } from "../game_data/useBuildingData";
import { IRecipe } from "../api/gameData.types";
import {
	IProductionGraphData,
	IProductionGraphIO,
	IProductionGraphSubgraph,
} from "./graph.types";
import { PSelectOption } from "@/ui/ui.types";

export class ProductionGraph {
	private nodes: Record<string, ProductionNode>;
	private selectedRecipes: string[] = [];
	private terminals: string[] = [];

	public constructor() {
		this.nodes = {};

		// initialize all nodes from building data
		Object.values(useBuildingData().getAllBuildingRecipes()).forEach(
			(buildingRecipes: IRecipe[]) =>
				buildingRecipes.forEach((recipe: IRecipe) => {
					// outputs, also get added the recipe
					recipe.Outputs.forEach((output) => {
						const node = this.getOrCreateNode(output.Ticker);
						node.addRecipe(recipe);
					});
					// inputs just get added as nodes
					recipe.Inputs.forEach((input) =>
						this.getOrCreateNode(input.Ticker)
					);
				})
		);
	}

	getOrCreateNode(materialTicker: string): ProductionNode {
		if (!this.nodes[materialTicker]) {
			this.nodes[materialTicker] = new ProductionNode(materialTicker);
		}
		return this.nodes[materialTicker];
	}

	getNode(materialTicker: string): ProductionNode | undefined {
		return this.nodes[materialTicker];
	}

	subGraph(node: ProductionNode): IProductionGraphSubgraph {
		let nodes: ProductionNode[] = [];
		let edges: ProductionEdge[] = [];

		// add the start node
		nodes.push(node);

		// define the amount that this node produces
		node.amount =
			node.getOutput(node.materialTicker, this.selectedRecipes)
				?.quantity ?? 0 * node.recipeAmount;

		// find all the inputs we need for this node
		if (!this.terminals.includes(node.materialTicker)) {
			node.getInput(this.selectedRecipes).forEach((input) => {
				const inputNeed: number = input.quantity * node.recipeAmount;
				const inputNode: ProductionNode | undefined = this.getNode(
					input.materialTicker
				);

				if (inputNode) {
					const inputNodeOutput: IProductionGraphIO | undefined =
						inputNode.getOutput(
							inputNode.materialTicker,
							this.selectedRecipes
						);

					// if the producer node is not producing, this is a natural resource
					if (!inputNodeOutput) {
						inputNode.amount = inputNeed;
					} else {
						// input recipe amount to be adjusted
						inputNode.recipeAmount =
							inputNeed / inputNodeOutput.quantity;
					}

					// push in a edge
					edges.push(
						new ProductionEdge(
							node.materialTicker,
							input.materialTicker,
							inputNeed
						)
					);

					// recursively continue with new subgraph
					nodes = nodes.concat(this.subGraph(inputNode).nodes);
					edges = edges.concat(this.subGraph(inputNode).edges);
				}
			});
		}

		return {
			nodes,
			edges,
		};
	}

	createGraph(
		materialTicker: string,
		recipeAmount: number
	): IProductionGraphData {
		let nodes: ProductionNode[] = [];
		let edges: ProductionEdge[] = [];

		// OutputMaterial: RecipeNames[]
		const recipeOptions: Record<string, PSelectOption[]> = {};
		const recipeSelection: Record<string, string> = {};

		// get the initial node
		const initialNode = this.getNode(materialTicker);

		if (initialNode) {
			initialNode.recipeAmount = recipeAmount;
			nodes = nodes.concat(this.subGraph(initialNode).nodes);
			edges = edges.concat(this.subGraph(initialNode).edges);
		}

		// make nodes + edges unique, # NOTE: O(1)

		const nodeMap = new Map<string, ProductionNode>();
		const edgeMap = new Map<string, ProductionEdge>();

		for (const node of nodes) {
			// unique node map
			if (!nodeMap.has(node.id)) {
				if (node.materialTicker !== materialTicker) node.amount = 0;
			}
			nodeMap.set(node.id, node);

			// generate recipe options
			const outputTicker: string | undefined = node.getOutput(
				node.materialTicker,
				this.selectedRecipes
			)?.materialTicker;
			if (outputTicker) {
				recipeOptions[outputTicker] = node.recipes.map((r) => ({
					label: r.RecipeId,
					value: r.RecipeId,
				}));

				// set the initial selection
				const r = node.getRecipe(this.selectedRecipes);
				if (r) recipeSelection[outputTicker] = r.RecipeId;
			}
		}

		// handle unique edges and node adjustments
		for (const edge of edges) {
			if (!edgeMap.has(edge.id)) edgeMap.set(edge.id, edge);

			const targetNode = [...nodeMap.values()].find(
				(n) => n.materialTicker === edge.target
			);
			const sourceNode = [...nodeMap.values()].find(
				(n) => n.materialTicker === edge.source
			);

			if (targetNode) {
				targetNode.amount += edge.quantitiy;
				targetNode.hasInput = true;
			}

			if (sourceNode) sourceNode.hasOutput = true;
		}

		return {
			nodes: Array.from(nodeMap.values()),
			edges: Array.from(edgeMap.values()),
			recipeOptions,
			recipeSelection,
		};
	}
}
