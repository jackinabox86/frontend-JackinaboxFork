import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { ProductionNode } from "@/features/production_chain/productionNode";
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
	});

	it("constructor, id, type", async () => {
		const node = new ProductionNode("RAT");
		expect(node.materialTicker).toBe("RAT");
		expect(node.id).toBe("NODE#RAT");
		expect(node.type).toBe("chain");
	});

	it("addRecipe", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");

		node.addRecipe(rat_recipes[0]);
		expect(node.recipes.length).toBe(1);

		// cant add same recipe twice
		node.addRecipe(rat_recipes[0]);
		expect(node.recipes.length).toBe(1);
	});

	it("getOutput", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");
		rat_recipes.forEach((r) => node.addRecipe(r));

		// undefined, as nothing selected
		const result = node.getOutput("RAT", []);
		expect(result).toBeUndefined();

		// check selected
		const selected = node.getOutput("RAT", [
			"FP#1xGRN 1xALG 1xNUT=>10xRAT",
		]);
		expect(selected).toStrictEqual({ materialTicker: "RAT", quantity: 10 });
	});

	it("getInput", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");
		rat_recipes.forEach((r) => node.addRecipe(r));

		// undefined, as nothing selected
		const result = node.getInput([]);
		expect(result).toStrictEqual([
			{
				materialTicker: "H2O",
				quantity: 10,
			},
			{
				materialTicker: "PG",
				quantity: 1,
			},
		]);

		// check selected
		const selected = node.getInput(["FP#1xGRN 1xALG 1xNUT=>10xRAT"]);
		expect(selected).toStrictEqual([
			{
				materialTicker: "ALG",
				quantity: 1,
			},
			{
				materialTicker: "NUT",
				quantity: 1,
			},
			{
				materialTicker: "GRN",
				quantity: 1,
			},
		]);
	});

	it("getRecipe, single match", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");
		rat_recipes.forEach((r) => node.addRecipe(r));

		const result = node.getRecipe([]);
		expect(result).toBeDefined();
	});

	it("getRecipe, exclusion", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("O");
		rat_recipes.forEach((r) => node.addRecipe(r));

		const result = node.getRecipe([]);
		expect(result).toBeDefined();
		expect(result?.BuildingTicker).toBe("COL");
	});

	it("getRecipe, multiple match error", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");
		rat_recipes.forEach((r) => node.addRecipe(r));

		expect(() =>
			node.getRecipe([
				"FP#1xGRN 1xALG 1xVEG=>10xRAT",
				"FP#1xGRN 1xBEA 1xNUT=>10xRAT",
			])
		).toThrowError();
	});

	it("getBuildingData", async () => {
		const rat_recipes = recipes.filter((f) => f.BuildingTicker === "FP");

		const node = new ProductionNode("RAT");
		rat_recipes.forEach((r) => node.addRecipe(r));

		const result = await node.getBuildingData([]);
		expect(result?.Ticker).toBe("FP");

		node.recipes = [];
		const building = await node.getBuildingData(["foo"]);
		expect(building).toBeUndefined();
	});
});
