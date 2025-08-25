import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { ProductionGraph } from "@/features/production_chain/productionGraph";
import { useGameDataStore } from "@/stores/gameDataStore";

// test data
import buildings from "@/tests/test_data/api_data_buildings.json";
import recipes from "@/tests/test_data/api_data_recipes.json";

describe("productionNode", async () => {
	let gameDataStore: ReturnType<typeof useGameDataStore>;

	beforeEach(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();

		// @ts-expect-error mock data
		gameDataStore.setBuildings(buildings);
		gameDataStore.setRecipes(recipes);
	});

	it("constructor", async () => {
		const graph = new ProductionGraph();

		expect(graph.selectedRecipes).toStrictEqual([]);
		expect(graph.terminals).toStrictEqual([]);
		expect(Object.keys(graph.nodes).length).toBe(344);
	});

	it("getNode", async () => {
		const graph = new ProductionGraph();
		const node = graph.getNode("RAT");

		expect(node?.materialTicker).toBe("RAT");
	});

	it("subGraph", async () => {
		const graph = new ProductionGraph();
		const sub = graph.subGraph(graph.getOrCreateNode("RAT"));

		expect(sub.edges.length).toBe(10);
		expect(sub.nodes.length).toBe(11);
	});

	it("createGraph", async () => {
		const graph = new ProductionGraph();
		const result = graph.createGraph("RAT", 1, [], []);

		expect(result.edges.length).toBe(10);
		expect(result.nodes.length).toBe(8);
	});
});
