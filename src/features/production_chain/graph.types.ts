import { PSelectOption } from "@/ui/ui.types";
import { ProductionEdge } from "./productionEdge";
import { ProductionNode } from "./productionNode";
import type { Position } from "@vue-flow/core";

export interface IProductionGraphIO {
	materialTicker: string;
	quantity: number;
}

export interface IProductionGraphSubgraph {
	nodes: ProductionNode[];
	edges: ProductionEdge[];
}

export interface IProductionGraphData {
	nodes: ProductionNode[];
	edges: ProductionEdge[];
	recipeOptions: Record<string, PSelectOption[]>;
	recipeSelection: Record<string, string>;
}

export interface IFlowNodeData {
	materialTicker: string;
	amount: number;
	hasInput: boolean;
	hasOutput: boolean;
}

export interface IFlowNode {
	id: string;
	type?: string;
	label: string;
	position: { x: number; y: number };
	class: string;
	targetPosition: Position;
	sourcePosition: Position;
	data: IFlowNodeData;
}

export interface IFlowEdge {
	id: string;
	source: string;
	target: string;
	animated: boolean;
	type: string;
	label: string;
}

export interface IGraphFlow {
	nodes: IFlowNode[];
	edges: IFlowEdge[];
	recipeOptions: Record<string, PSelectOption[]>;
	recipeSelection: Record<string, string>;
	//   cogcs: Record<COGCBONUSTYPE, number>;
	//   workforce: Record<string, number>;
}
