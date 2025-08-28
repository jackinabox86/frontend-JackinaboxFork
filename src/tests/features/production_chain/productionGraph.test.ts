import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { ProductionGraph } from "@/features/production_chain/productionGraph";
import { useGameDataStore } from "@/stores/gameDataStore";

// test data
import materials from "@/tests/test_data/api_data_materials.json";
import buildings from "@/tests/test_data/api_data_buildings.json";
import recipes from "@/tests/test_data/api_data_recipes.json";
import { materialsStore } from "@/database/stores";
import { useMaterialData } from "@/database/services/useMaterialData";
import { flushPromises } from "@vue/test-utils";

describe("productionNode", async () => {
	let gameDataStore: ReturnType<typeof useGameDataStore>;

	beforeEach(async () => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();

		await materialsStore.setMany(materials);
		const { preload } = useMaterialData();

		await preload();
		await flushPromises();

		// @ts-expect-error mock data
		gameDataStore.setBuildings(buildings);
		gameDataStore.setRecipes(recipes);
	});

	it("constructor", async () => {
		const graph = new ProductionGraph();
		await graph.init();

		expect(graph.selectedRecipes).toStrictEqual([]);
		expect(graph.terminals).toStrictEqual([]);
		expect(Object.keys(graph.nodes).length).toBe(344);
	});

	it("getNode", async () => {
		const graph = new ProductionGraph();
		await graph.init();
		const node = graph.getNode("RAT");

		expect(node?.materialTicker).toBe("RAT");
	});

	it("subGraph", async () => {
		const graph = new ProductionGraph();
		await graph.init();
		const sub = graph.subGraph(graph.getOrCreateNode("RAT"));

		expect(sub.edges.length).toBe(10);
		expect(sub.nodes.length).toBe(11);
	});

	it("createGraph", async () => {
		const graph = new ProductionGraph();
		await graph.init();
		const result = graph.createGraph("RAT", 1, [], []);

		expect(result.edges.length).toBe(10);
		expect(result.nodes.length).toBe(8);
	});
});
