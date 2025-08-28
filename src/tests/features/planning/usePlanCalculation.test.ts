import { nextTick, ref } from "vue";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// Stores
import { useGameDataStore } from "@/stores/gameDataStore";
import { usePlanningStore } from "@/stores/planningStore";

// Util
import { inertClone } from "@/util/data";

// test data
import plan_etherwind from "@/tests/test_data/api_data_plan_etherwind.json";
import planet_etherwind from "@/tests/test_data/api_data_planet_etherwind.json";
import recipes from "@/tests/test_data/api_data_recipes.json";
import buildings from "@/tests/test_data/api_data_buildings.json";
import materials from "@/tests/test_data/api_data_materials.json";
import exchanges from "@/tests/test_data/api_data_exchanges.json";

vi.mock("@/database/services/usePlanetData", async () => {
	const actual: any = await vi.importActual(
		"@/database/services/usePlanetData"
	);

	return {
		usePlanetData: vi.fn(() => ({
			getPlanet: vi.fn().mockResolvedValue(planet_etherwind),
			getPlanetSpecialMaterials:
				actual.usePlanetData().getPlanetSpecialMaterials,
		})),
	};
});

// Composables
import { usePlanCalculation } from "@/features/planning/usePlanCalculation";

describe("usePlanCalculation", async () => {
	let gameDataStore: ReturnType<typeof useGameDataStore>;
	let planningStore: ReturnType<typeof usePlanningStore>;

	beforeAll(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();
		planningStore = usePlanningStore();

		buildings.forEach((b) => {
			// @ts-expect-error mock data
			gameDataStore.buildings[b.Ticker] = b;
		});

		recipes.forEach((r) => {
			if (!gameDataStore.recipes[r.BuildingTicker]) {
				gameDataStore.recipes[r.BuildingTicker] = [];
			}

			gameDataStore.recipes[r.BuildingTicker].push(r);
		});

		materials.forEach((m) => {
			gameDataStore.materials[m.Ticker] = m;
		});

		exchanges.forEach((e) => {
			gameDataStore.exchanges[e.TickerId] = e;
		});

		vi.resetAllMocks();
	});

	it("refreshkey", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);

		const { refreshKey } = calculation;

		expect(refreshKey.value).toBe(0);

		// upate store
		// @ts-expect-error mock data
		planningStore.cxs = "foo";
		await nextTick();
		expect(refreshKey.value).toBe(1);
	});

	it("validate result", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);

		const { result } = calculation;

		expect(result.value.corphq).toBeFalsy();
		expect(result.value.cogc).toBe("RESOURCE_EXTRACTION");
		expect(result.value.workforce.pioneer.required).toBe(2170);
		expect(result.value.materialio.length).toBe(18);

		// area
		expect(result.value.area).toStrictEqual({
			areaLeft: 6,
			areaTotal: 1000,
			areaUsed: 994,
			permits: 3,
		});
	});

	it("validate overviewData", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);
		const { overviewData } = calculation;

		expect(overviewData.value.dailyCost).toBe(38364.71626045736);
		expect(overviewData.value.roi).toBe(25.909127634141438);
	});

	it("validate visitationData", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);
		const { visitationData } = calculation;

		expect(visitationData.value.storageFilled).toBe(22.342256698594255);
	});

	it("validate constructionMaterials", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);
		const { constructionMaterials } = calculation;

		expect(constructionMaterials.value).toBeDefined();
		expect(constructionMaterials.value.length).toBe(9);
	});

	it("unknown recipe error", async () => {
		const manipData = inertClone(plan_etherwind);
		manipData.baseplanner_data.buildings[0].active_recipes[0] = {
			recipeid: "foo",
			amount: 1,
		};

		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(manipData),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);

		const { result } = calculation;

		expect(() => result.value).toThrowError();
	});

	it("validate existing and saveable", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);
		const { existing, saveable } = calculation;

		expect(existing.value).toBeTruthy();
		expect(saveable.value).toBeTruthy();
	});

	it("backendData", async () => {
		const calculation = await usePlanCalculation(
			// @ts-expect-error mock data
			ref(plan_etherwind),
			ref(undefined),
			ref(undefined),
			ref(undefined)
		);
		const { backendData } = calculation;

		expect(backendData.value).toStrictEqual({
			buildings: [
				{
					active_recipes: [
						{
							amount: 1,
							recipeid: "EXT#SIO",
						},
					],
					amount: 1,
					name: "EXT",
				},
				{
					active_recipes: [
						{
							amount: 2,
							recipeid: "FP#10xH2O=>7xDW",
						},
						{
							amount: 1,
							recipeid: "FP#1xCAF 3xDW=>3xCOF",
						},
						{
							amount: 1,
							recipeid: "FP#1xMUS 1xVEG 1xMAI=>10xRAT",
						},
					],
					amount: 19,
					name: "FP",
				},
				{
					active_recipes: [
						{
							amount: 6,
							recipeid: "HYF#22xH2O 3xNS=>2xCAF",
						},
						{
							amount: 3,
							recipeid: "HYF#14xH2O 1xNS=>8xHCP",
						},
						{
							amount: 1,
							recipeid: "HYF#4xNS=>12xMUS",
						},
						{
							amount: 2,
							recipeid: "HYF#16xH2O 1xNS=>6xVEG",
						},
						{
							amount: 2,
							recipeid: "HYF#20xH2O 2xNS=>12xMAI",
						},
					],
					amount: 11,
					name: "HYF",
				},
				{
					active_recipes: [
						{
							amount: 1,
							recipeid: "INC#4xHCP 2xMAI=>4xC",
						},
					],
					amount: 7,
					name: "INC",
				},
				{
					active_recipes: [
						{
							amount: 1,
							recipeid: "RIG#H2O",
						},
					],
					amount: 21,
					name: "RIG",
				},
			],
			empire_uuid: undefined,
			faction: "NONE",
			infrastructure: [
				{
					amount: 22,
					building: "HB1",
				},
				{
					amount: 3,
					building: "HB2",
				},
				{
					amount: 0,
					building: "HB3",
				},
				{
					amount: 0,
					building: "HB4",
				},
				{
					amount: 0,
					building: "HB5",
				},
				{
					amount: 0,
					building: "HBB",
				},
				{
					amount: 0,
					building: "HBC",
				},
				{
					amount: 0,
					building: "HBM",
				},
				{
					amount: 0,
					building: "HBL",
				},
				{
					amount: 1,
					building: "STO",
				},
			],
			name: "EW COF RAT DW C",
			override_empire: false,
			permits_total: 3,
			permits_used: 1,
			planet: {
				cogc: "RESOURCE_EXTRACTION",
				corphq: false,
				experts: [
					{
						amount: 3,
						type: "Agriculture",
					},
					{
						amount: 0,
						type: "Chemistry",
					},
					{
						amount: 0,
						type: "Construction",
					},
					{
						amount: 0,
						type: "Electronics",
					},
					{
						amount: 2,
						type: "Food_Industries",
					},
					{
						amount: 0,
						type: "Fuel_Refining",
					},
					{
						amount: 0,
						type: "Manufacturing",
					},
					{
						amount: 0,
						type: "Metallurgy",
					},
					{
						amount: 1,
						type: "Resource_Extraction",
					},
				],
				permits: 3,
				planetid: "KW-688c",
				workforce: [
					{
						lux1: true,
						lux2: true,
						type: "pioneer",
					},
					{
						lux1: true,
						lux2: true,
						type: "settler",
					},
					{
						lux1: false,
						lux2: false,
						type: "technician",
					},
					{
						lux1: false,
						lux2: false,
						type: "engineer",
					},
					{
						lux1: false,
						lux2: false,
						type: "scientist",
					},
				],
			},
			planet_id: "KW-688c",
		});
	});
});
