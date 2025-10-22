import { describe, it, expect } from "vitest";

import {
	PLANETSEARCHCOGC,
	PLANETSEARCHINFRASTRUCTURE,
	PLANETSEARCHOPTIONMATERIALS,
	PLANETSEARCHSYSTEMS,
} from "@/features/planet_search/searchConstants";

describe("searchConstants", async () => {
	it("PLANETSEARCHOPTIONMATERIALS", async () => {
		expect(PLANETSEARCHOPTIONMATERIALS.length).toBe(36);
	});

	it("PLANETSEARCHINFRASTRUCTURE", async () => {
		expect(PLANETSEARCHINFRASTRUCTURE.length).toBe(6);
	});

	it("PLANETSEARCHCOGC", async () => {
		expect(PLANETSEARCHCOGC.length).toBe(14);
	});

	it("PLANETSEARCHSYSTEMS", async () => {
		expect(PLANETSEARCHSYSTEMS.length).toBe(698);
	});
});
