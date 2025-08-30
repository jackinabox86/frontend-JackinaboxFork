import { describe, it, expect, beforeAll } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlanningStore } from "@/stores/planningStore";
import { usePrice } from "@/features/cx/usePrice";
import { Ref, ref } from "vue";
import { useGameDataStore } from "@/stores/gameDataStore";
import { buildingsStore } from "@/database/stores";
import { useBuildingData } from "@/database/services/useBuildingData";

// test data
import exchanges from "@/tests/test_data/api_data_exchanges.json";
import cx_definition from "@/tests/test_data/api_data_cx_definition.json";
import buildings from "@/tests/test_data/api_data_buildings.json";
import planet_single from "@/tests/test_data/api_data_planet_etherwind.json";
import { flushPromises } from "@vue/test-utils";

const fakeCXUuid: string = "2a83a2ca-db0c-49d2-9c43-0db08c1675bb";

describe("usePrice", async () => {
	let planningStore: any;
	let gameDataStore: any;

	beforeAll(async () => {
		setActivePinia(createPinia());
		planningStore = usePlanningStore();
		gameDataStore = useGameDataStore();

		exchanges.map((e) => {
			gameDataStore.exchanges[e.TickerId] = e;
		});

		planningStore.cxs[fakeCXUuid] = cx_definition;

		//@ts-expect-error mock data
		await buildingsStore.setMany(buildings);
		const { preloadBuildings } = await useBuildingData();

		await preloadBuildings();
		await flushPromises();
	});

	it("cache clearing, just trigger", async () => {
		const cx: Ref<string | undefined> = ref(undefined);
		usePrice(cx, ref(undefined));
		cx.value = "foo";
	});

	describe("calculateInfrastructureCosts", async () => {
		it("should calculate infrastructure costs using mocked getMaterialIOTotalPrice", async () => {
			const mockPlanet = planet_single;

			const { calculateInfrastructureCosts } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			// @ts-expect-error mock planet data
			const result = await calculateInfrastructureCosts(mockPlanet);

			// Each building ticker should have a cost of -100
			Object.keys(result).forEach((r) => {
				expect(result[r]).toBeGreaterThan(0);
			});
		});
	});

	describe("getPrice", async () => {
		it("unknown cx uuid", async () => {
			const { getPrice } = await usePrice(ref("meow"), ref("foo"));

			expect(getPrice("LSE", "BUY")).toBe(0);
		});

		it("with cx uuid and planet material and ticker preference", async () => {
			const { getPrice } = await usePrice(
				ref(fakeCXUuid),
				ref("OT-580c")
			);

			expect(getPrice("LSE", "BUY")).toBe(25);
			expect(getPrice("FEO", "BUY")).toBe(500);
		});

		it("with cx uuid and planet exchange pref", async () => {
			const { getPrice } = await usePrice(
				ref(fakeCXUuid),
				ref("UV-796b")
			);

			expect(getPrice("LSE", "BUY")).toBe(9240);
			expect(getPrice("FEO", "BUY")).toBe(500);
		});

		it("with cx uuid and empire exchange pref", async () => {
			const { getPrice } = await usePrice(ref(fakeCXUuid), ref("foo"));

			expect(getPrice("LSE", "BUY")).toBe(9240);
		});

		it("nothing set on empire", async () => {
			planningStore.cxs[fakeCXUuid].cx_data.cx_empire = [];
			const { getPrice } = await usePrice(ref(fakeCXUuid), ref("foo"));

			expect(getPrice("LSE", "BUY")).toBe(9030.470166275736);
		});
	});

	describe("getMaterialIOTotalPrice", async () => {
		it("undefined empire uuid", async () => {
			const { getMaterialIOTotalPrice } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getMaterialIOTotalPrice(
				[
					{ ticker: "C", input: 1, output: 0 },
					{ ticker: "N", input: 1, output: 3 },
				],
				"BUY"
			);

			expect(result).toBe(-487.5322427382275);
		});
	});

	describe("enhanceMaterialIOMaterial", async () => {
		it("undefined empire uuid", async () => {
			const { enhanceMaterialIOMaterial } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = enhanceMaterialIOMaterial([
				// @ts-expect-error mock data
				{ ticker: "C", delta: -1 },
				// @ts-expect-error mock data
				{ ticker: "N", delta: 2 },
			]);

			expect(result[0].price).toBe(-721.683823950678);
			expect(result[1].price).toBe(234.15158121245042);
		});
	});

	describe("getExchangeCodeKey", async () => {
		it("Too many splits", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			expect(() => getExchangeCodeKey("FOO_MOO_MEOW")).toThrowError();
		});

		it("UNIVERSE", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("PP30D_UNIVERSE");

			expect(result.exchangeCode).toBe("PP30D_UNIVERSE");
			expect(result.key).toBe("PriceAverage");
		});

		it("PP7Ds", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("PP7D_AI1");

			expect(result.exchangeCode).toBe("PP7D_AI1");
			expect(result.key).toBe("PriceAverage");
		});

		it("PP30Ds", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("PP30D_AI1");

			expect(result.exchangeCode).toBe("PP30D_AI1");
			expect(result.key).toBe("PriceAverage");
		});

		it("CX BUY", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("AI1_BUY");

			expect(result.exchangeCode).toBe("AI1");
			expect(result.key).toBe("Ask");
		});

		it("CX SELL", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("AI1_SELL");

			expect(result.exchangeCode).toBe("AI1");
			expect(result.key).toBe("Bid");
		});

		it("CX AVG", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("AI1_AVG");

			expect(result.exchangeCode).toBe("AI1");
			expect(result.key).toBe("PriceAverage");
		});

		it("Invalid two part", async () => {
			const { getExchangeCodeKey } = await usePrice(
				ref(undefined),
				ref(undefined)
			);

			const result = getExchangeCodeKey("FOO_MOO");

			expect(result.exchangeCode).toBe("PP30D_UNIVERSE");
			expect(result.key).toBe("PriceAverage");
		});
	});
});
