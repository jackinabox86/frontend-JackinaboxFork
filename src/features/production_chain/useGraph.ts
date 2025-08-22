import dagre from "@dagrejs/dagre";

import { Position } from "@vue-flow/core";
import {
	IFlowEdge,
	IFlowNode,
	IGraphFlow,
	IProductionGraphData,
} from "./graph.types";
import { ProductionGraph } from "./productionGraph";
import { ProductionNode } from "./productionNode";
import { ProductionEdge } from "./productionEdge";
import { dagreSetGraphConfig, dagreSetNodeConfig } from "./dagre.config";
import { formatNumber } from "@/util/numbers";

export function useGraph() {
	const graph: ProductionGraph = new ProductionGraph();

	function createFlowNodes(nodes: ProductionNode[]): IFlowNode[] {
		const flowNodes: IFlowNode[] = [];

		nodes.forEach((node) => {
			flowNodes.push({
				id: node.id,
				type: node.type,
				label: node.materialTicker,
				position: { x: 0, y: 0 },
				class: "light",
				targetPosition: Position.Left,
				sourcePosition: Position.Right,
				data: {
					materialTicker: node.materialTicker,
					amount: node.amount,
					hasInput: node.hasInput,
					hasOutput: node.hasOutput,
				},
			});
		});

		return flowNodes;
	}

	function createFlowEdges(edges: ProductionEdge[]): IFlowEdge[] {
		const flowEdges: IFlowEdge[] = [];

		edges.forEach((edge) => {
			flowEdges.push({
				id: edge.id,
				source: `NODE#${edge.source}`,
				target: `NODE#${edge.target}`,
				animated: false,
				type: "default",
				label: formatNumber(edge.quantitiy, 2),
			});
		});

		return flowEdges;
	}

	function applyDagreLayout(
		nodes: IFlowNode[],
		edges: IFlowEdge[]
	): IFlowNode[] {
		const g = new dagre.graphlib.Graph();
		g.setGraph(dagreSetGraphConfig);
		g.setDefaultEdgeLabel(function () {
			return {};
		});

		// add nodes
		nodes.forEach((fn) =>
			g.setNode(
				fn.id,
				Object.assign({ label: fn.label }, dagreSetNodeConfig)
			)
		);

		// add edges
		edges.forEach((fe) => g.setEdge(fe.source, fe.target));

		// execute layouting
		dagre.layout(g);

		// update node positions based on dagree
		g.nodes().forEach((gnode) => {
			const fnode: IFlowNode | undefined = nodes.find(
				(f) => f.label === g.node(gnode).label
			);
			if (fnode) {
				fnode.position = {
					x: g.node(gnode).x,
					y: g.node(gnode).y,
				};
			}
		});

		return nodes;
	}

	function create(materialTicker: string, recipeAmount: number): IGraphFlow {
		const graphData: IProductionGraphData = graph.createGraph(
			materialTicker,
			recipeAmount
		);

		let flowNodes = createFlowNodes(graphData.nodes);
		const flowEdges = createFlowEdges(graphData.edges);

		// apply dagrejs layouting
		flowNodes = applyDagreLayout(flowNodes, flowEdges);

		return {
			nodes: flowNodes,
			edges: flowEdges,
			recipeOptions: graphData.recipeOptions,
			recipeSelection: graphData.recipeSelection,
		};
	}

	return {
		create,
	};
}
