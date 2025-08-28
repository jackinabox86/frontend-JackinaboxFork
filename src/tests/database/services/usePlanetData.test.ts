import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

// Mock the planets store (could be empty)
vi.mock("@/database/stores", () => ({
	planetsStore: {},
}));

// Mock useDB
vi.mock("@/database/composables/useDB", () => ({
	useDB: vi.fn(),
}));

import { useDB } from "@/database/composables/useDB";
import { usePlanetData } from "@/database/services/usePlanetData";

// Sample planet mock
const mockPlanet1 = {
	PlanetNaturalId: "P1",
	PlanetName: "Earth",
	Surface: true,
	Gravity: 1,
	Pressure: 1,
	Temperature: 25,
};

const mockPlanet2 = {
	PlanetNaturalId: "P2",
	PlanetName: "Mars",
	Surface: false,
	Gravity: 0.5,
	Pressure: 0.5,
	Temperature: -20,
};

// test data
import planet_single from "@/tests/test_data/api_data_planet_single.json";

describe("usePlanetData", () => {
	let getMock: any;
	let preloadMock: any;

	beforeEach(() => {
		getMock = vi.fn(async (id: string) => {
			if (id === mockPlanet1.PlanetNaturalId) return mockPlanet1;
			if (id === mockPlanet2.PlanetNaturalId) return mockPlanet2;
			return undefined;
		});

		preloadMock = vi.fn(async () => {});

		// @ts-ignore
		useDB.mockReturnValue({
			allData: ref([mockPlanet1, mockPlanet2]),
			get: getMock,
			preload: preloadMock,
		});
	});

	it("getPlanet returns the planet", async () => {
		const { getPlanet } = usePlanetData();
		const planet = await getPlanet("P1");
		expect(planet.PlanetName).toBe("Earth");
		expect(getMock).toHaveBeenCalledWith("P1");
	});

	it("getPlanetName returns formatted name", async () => {
		const { getPlanetName } = usePlanetData();
		const name = await getPlanetName("P1");
		expect(name).toBe("Earth (P1)");
	});

	it("loadPlanetName caches the name", async () => {
		const { loadPlanetName, planetNames } = usePlanetData();
		const name = await loadPlanetName("P1");

		expect(name).toBe("Earth (P1)");
		expect(planetNames.value["P1"]).toBe("Earth (P1)");
	});

	it("reload calls preload", async () => {
		const { reload } = usePlanetData();
		await reload();
		expect(preloadMock).toHaveBeenCalled();
	});

	it("loadPlanetNames caches multiple planet names", async () => {
		const { loadPlanetNames, planetNames } = usePlanetData();

		await loadPlanetNames(["P1", "P2", "P1"]); // includes duplicate P1

		expect(planetNames.value["P1"]).toBe("Earth (P1)");
		expect(planetNames.value["P2"]).toBe("Mars (P2)");
		expect(getMock).toHaveBeenCalledTimes(2); // each planet fetched only once
	});

	it("getPlanetName returns planetNaturalId on error", async () => {
		const { getPlanetName } = usePlanetData();

		// simulate getPlanet throwing an error by passing unknown ID
		const unknownId = "UNKNOWN";

		const name = await getPlanetName(unknownId);

		expect(name).toBe(unknownId);
	});

	describe("getPlanetSpecialMaterials", async () => {
		const specialMaterialCases = [
			{
				planet: { Surface: true },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
				],
				description: "With Surface",
			},
			{
				planet: { Surface: false },
				areaCost: 25,
				result: [
					{
						ticker: "AEF",
						input: 9,
						output: 0,
					},
				],
				description: "No Surface",
			},
			{
				planet: { Surface: true, Gravity: 0.249 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "MGC",
						input: 1,
						output: 0,
					},
				],
				description: "Low Gravity",
			},
			{
				planet: { Surface: true, Gravity: 2.51 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "BL",
						input: 1,
						output: 0,
					},
				],
				description: "High Gravity",
			},
			{
				planet: { Surface: true, Pressure: 0.249 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "SEA",
						input: 25,
						output: 0,
					},
				],
				description: "Low Pressure",
			},
			{
				planet: { Surface: true, Pressure: 2.01 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "HSE",
						input: 1,
						output: 0,
					},
				],
				description: "Low Pressure",
			},
			{
				planet: { Surface: true, Temperature: -25.01 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "INS",
						input: 250,
						output: 0,
					},
				],
				description: "Low Temperature",
			},
			{
				planet: { Surface: true, Temperature: 75.01 },
				areaCost: 25,
				result: [
					{
						ticker: "MCG",
						input: 100,
						output: 0,
					},
					{
						ticker: "TSH",
						input: 1,
						output: 0,
					},
				],
				description: "High Temperature",
			},
		];

		it.each(specialMaterialCases)(
			"Planet Special Materials: $description",
			async ({ planet, areaCost, result }) => {
				const { getPlanetSpecialMaterials } = usePlanetData();

				expect(
					// @ts-expect-error mock planet data
					getPlanetSpecialMaterials(planet, areaCost)
				).toStrictEqual(result);
			}
		);
	});
});
