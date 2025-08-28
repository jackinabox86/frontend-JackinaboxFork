import { setActivePinia, createPinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { useGameDataStore } from "@/stores/gameDataStore";
import { useBuildingData } from "@/features/game_data/useBuildingData";
import { IBuilding, IPlanetResource } from "@/features/api/gameData.types";

// test data
import building_single_tnp from "@/tests/test_data/api_data_building_single_tnp.json";
import building_single_hbl from "@/tests/test_data/api_data_building_single_hbl.json";

describe("useBuildingData", async () => {
	let gameDataStore: any;

	beforeAll(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();
	});

	beforeEach(() => {
		gameDataStore.buildings = {};
	});

	it("getTotalWorkforce", async () => {
		gameDataStore.buildings["TNP"] = building_single_tnp;

		const TNP: IBuilding = gameDataStore.buildings["TNP"];

		const { getTotalWorkforce } = await useBuildingData();

		expect(TNP).toBeDefined();
		expect(getTotalWorkforce(TNP)).toBe(80);
	});

	describe("getBuilding", async () => {
		it("Get valid building", async () => {
			gameDataStore.buildings["TNP"] = building_single_tnp;
			const { getBuilding } = await useBuildingData();

			expect(getBuilding("TNP")).toStrictEqual(
				gameDataStore.buildings["TNP"]
			);
		});

		it("Get invalid, non-existing building", async () => {
			const { getBuilding } = await useBuildingData();

			expect(() => getBuilding("FOO")).toThrowError();
		});
	});

	describe("getProductionBuildingOptions", async () => {
		it("Available production building", async () => {
			gameDataStore.buildings["TNP"] = building_single_tnp;
			const { getProductionBuildingOptions } = await useBuildingData();

			const result = getProductionBuildingOptions();

			expect(result.length).toBe(1);
			expect(result[0].value).toBe("TNP");
			expect(result[0].label).toBe("TNP (Technetium Processing)");
		});

		it("Skip non-production building", async () => {
			gameDataStore.buildings["HBL"] = building_single_hbl;
			const { getProductionBuildingOptions } = await useBuildingData();

			const result = getProductionBuildingOptions();

			expect(result.length).toBe(0);
		});

		it("Available production building matching COGC", async () => {
			gameDataStore.buildings["TNP"] = building_single_tnp;
			const { getProductionBuildingOptions } = await useBuildingData();

			const result = getProductionBuildingOptions([], "CHEMISTRY");

			expect(result.length).toBe(1);
			expect(result[0].value).toBe("TNP");
			expect(result[0].label).toBe("TNP (Technetium Processing)");
		});

		it("Available production building not matching COGC", async () => {
			gameDataStore.buildings["TNP"] = building_single_tnp;
			const { getProductionBuildingOptions } = await useBuildingData();

			const result = getProductionBuildingOptions([], "AGRICULTURE");

			expect(result.length).toBe(0);
		});
	});

	describe("getBuildingRecipes", async () => {
		it("Resource Building, no planet resource", async () => {
			const { getBuildingRecipes } = await useBuildingData();

			const result = getBuildingRecipes("EXT");
			expect(result.length).toBe(0);
		});

		it("Resource Building, planet resources", async () => {
			const { getBuildingRecipes } = await useBuildingData();

			const fakePlanetResources: IPlanetResource[] = [
				{
					MaterialId: "foo",
					ResourceType: "GASEOUS",
					Factor: 1,
					DailyExtraction: 3,
					MaterialTicker: "O",
					ExtractionMax: 3,
				},
			];

			const result = getBuildingRecipes("COL", fakePlanetResources);
			expect(result.length).toBe(1);
			expect(result[0].BuildingTicker).toBe("COL");
			expect(result[0].RecipeId).toBe("COL#O");
		});

		it("Production Building, error", async () => {
			const { getBuildingRecipes } = await useBuildingData();
			expect(() => getBuildingRecipes("PP1")).toThrowError();
		});

		it("Production Building, with recipe", async () => {
			const { getBuildingRecipes } = await useBuildingData();
			const fakeRecipe = {
				RecipeId: "PP1#150xPE=>1xBDE",
				BuildingTicker: "PP1",
				RecipeName: "150xPE=>1xBDE",
				TimeMs: 25920000,
				Inputs: [
					{
						Ticker: "PE",
						Amount: 150,
					},
				],
				Outputs: [
					{
						Ticker: "BDE",
						Amount: 1,
					},
				],
			};

			gameDataStore.recipes[fakeRecipe.BuildingTicker] = [fakeRecipe];

			const result = getBuildingRecipes(fakeRecipe.BuildingTicker);

			expect(result.length).toBe(1);
			expect(result[0].BuildingTicker).toBe(fakeRecipe.BuildingTicker);
		});
	});

	describe("getBuildingConstructionMaterials", async () => {
		beforeEach(() => {
			vi.resetAllMocks();
		});

		it("No Planet", async () => {
			const testBuilding = {
				BuildingCosts: [
					{ CommodityTicker: "Moo", Amount: 2 },
					{ CommodityTicker: "Foo", Amount: 1 },
				],
			};

			vi.mock("@/features/game_data/usePlanetData", async () => {
				return {
					...(await vi.importActual(
						"@/features/game_data/usePlanetData"
					)),
					getPlanetSpecialMaterials: vi.fn().mockResolvedValue([]),
				};
			});

			const { getBuildingConstructionMaterials } =
				await useBuildingData();

			const result = getBuildingConstructionMaterials(
				// @ts-expect-error mock data
				testBuilding,
				undefined
			);
			expect(result).toStrictEqual([
				{
					input: 2,
					output: 0,
					ticker: "Moo",
				},
				{
					input: 1,
					output: 0,
					ticker: "Foo",
				},
			]);
		});

		it("With planet special material", async () => {
			const testBuilding = {
				AreaCost: 1,
				BuildingCosts: [
					{ CommodityTicker: "Moo", Amount: 2 },
					{ CommodityTicker: "Foo", Amount: 1 },
				],
			};

			const { getBuildingConstructionMaterials } =
				await useBuildingData();

			// @ts-expect-error mock data
			const result = getBuildingConstructionMaterials(testBuilding, {
				Surface: true,
			});
			expect(result).toStrictEqual([
				{
					input: 2,
					output: 0,
					ticker: "Moo",
				},
				{
					input: 1,
					output: 0,
					ticker: "Foo",
				},
				{
					input: 4,
					output: 0,
					ticker: "MCG",
				},
			]);
		});
	});

	describe("getBuildingWorkforceMaterials", async () => {
		it("Calculate a buildings workforce material io", async () => {
			const { getBuildingWorkforceMaterials } = await useBuildingData();

			const testBuilding = {
				Pioneers: 20,
				Settlers: 30,
				Technicians: 40,
				Engineers: 50,
				Scientists: 60,
			};

			// @ts-expect-error mock building data
			const result = getBuildingWorkforceMaterials(testBuilding);

			expect(result).toStrictEqual([
				{
					input: 16.3,
					output: 0,
					ticker: "DW",
				},
				{
					input: 5.4,
					output: 0,
					ticker: "RAT",
				},
				{
					input: 0.1,
					output: 0,
					ticker: "OVE",
				},
				{
					input: 0.04,
					output: 0,
					ticker: "PWO",
				},
				{
					input: 0.1,
					output: 0,
					ticker: "COF",
				},
				{
					input: 0.15,
					output: 0,
					ticker: "EXO",
				},
				{
					input: 0.15,
					output: 0,
					ticker: "PT",
				},
				{
					input: 0.06,
					output: 0,
					ticker: "REP",
				},
				{
					input: 0.3,
					output: 0,
					ticker: "KOM",
				},
				{
					input: 0.75,
					output: 0,
					ticker: "MED",
				},
				{
					input: 0.2,
					output: 0,
					ticker: "HMS",
				},
				{
					input: 0.04,
					output: 0,
					ticker: "SCN",
				},
				{
					input: 0.04,
					output: 0,
					ticker: "SC",
				},
				{
					input: 0.4,
					output: 0,
					ticker: "ALE",
				},
				{
					input: 3.5000000000000004,
					output: 0,
					ticker: "FIM",
				},
				{
					input: 0.1,
					output: 0,
					ticker: "HSS",
				},
				{
					input: 0.05,
					output: 0,
					ticker: "PDA",
				},
				{
					input: 0.1,
					output: 0,
					ticker: "VG",
				},
				{
					input: 0.5,
					output: 0,
					ticker: "GIN",
				},
				{
					input: 4.2,
					output: 0,
					ticker: "MEA",
				},
				{
					input: 0.12,
					output: 0,
					ticker: "LC",
				},
				{
					input: 0.06,
					output: 0,
					ticker: "WS",
				},
				{
					input: 0.06,
					output: 0,
					ticker: "NST",
				},
				{
					input: 0.6,
					output: 0,
					ticker: "WIN",
				},
			]);
		});
	});
});
