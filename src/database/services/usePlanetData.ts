import { IPlanet } from "@/features/api/gameData.types";
import { useDB } from "../composables/useDB";
import { planetsStore } from "../stores";
import { ref } from "vue";

import { IMaterialIOMinimal } from "@/features/planning/usePlanCalculation.types";
import { BOUNDARY_DESCRIPTOR } from "@/util/numbers.types";
import { boundaryDescriptor } from "@/util/numbers";

/**
 * Planetary type static boundaries
 */

// Gravity
export const boundaryGravityLow: number = 0.25;
export const boundaryGravityHigh: number = 2.5;

// Pressure
export const boundaryPressureLow: number = 0.25;
export const boundaryPressureHigh: number = 2.0;

// Temperature
export const boundaryTemperatureLow: number = -25.0;
export const boundaryTemperatureHigh: number = 75.0;

export function usePlanetData() {
	const { allData, get, preload } = useDB(planetsStore, "PlanetNaturalId");

	// reactive caches
	const planetNames = ref<Record<string, string>>({});

	async function getPlanet(planetNaturalId: string): Promise<IPlanet> {
		const planet = await get(planetNaturalId);

		if (!planet) {
			throw new Error(`Planet ${planetNaturalId} not available.`);
		}

		return planet;
	}

	async function getPlanetName(planetNaturalId: string): Promise<string> {
		try {
			const planet = await getPlanet(planetNaturalId);

			if (planet.PlanetName != planet.PlanetNaturalId) {
				return `${planet.PlanetName} (${planet.PlanetNaturalId})`;
			} else return planet.PlanetName;
		} catch {
			return planetNaturalId;
		}
	}

	async function loadPlanetName(planetNaturalId: string): Promise<string> {
		if (!planetNames.value[planetNaturalId])
			planetNames.value[planetNaturalId] = await getPlanetName(
				planetNaturalId
			);

		return planetNames.value[planetNaturalId];
	}

	async function loadPlanetNames(planetNaturalIds: string[]) {
		const uniqueIds = [...new Set(planetNaturalIds)];

		await Promise.all(
			uniqueIds.map(async (id) => {
				if (!planetNames.value[id])
					planetNames.value[id] = await getPlanetName(id);
			})
		);
	}

	/**
	 * Gets a planets additional building materials based on
	 * its conditions like Surface, Temperature or Gravity
	 *
	 * @author jplacht
	 *
	 * @param {IPlanet} planet Planet Data
	 * @param {number} areaCost Buildings AreaCost
	 * @returns {IMaterialIOMinimal[]} Special Construction Materials
	 */
	function getPlanetSpecialMaterials(
		planet: IPlanet,
		areaCost: number
	): IMaterialIOMinimal[] {
		const additions: IMaterialIOMinimal[] = [];

		// Rocky
		if (planet.Surface)
			additions.push({ ticker: "MCG", input: areaCost * 4, output: 0 });
		// Gaseous
		else
			additions.push({
				ticker: "AEF",
				input: Math.ceil(areaCost / 3),
				output: 0,
			});

		const gravityType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
			planet.Gravity,
			boundaryGravityLow,
			boundaryGravityHigh
		);

		const pressureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
			planet.Pressure,
			boundaryPressureLow,
			boundaryPressureHigh
		);

		const temperatureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
			planet.Temperature,
			boundaryTemperatureLow,
			boundaryTemperatureHigh
		);

		// Gravity
		if (gravityType === "LOW")
			additions.push({ ticker: "MGC", input: 1, output: 0 });
		else if (gravityType === "HIGH")
			additions.push({ ticker: "BL", input: 1, output: 0 });

		// Pressure
		if (pressureType === "LOW")
			additions.push({ ticker: "SEA", input: areaCost, output: 0 });
		else if (pressureType === "HIGH")
			additions.push({ ticker: "HSE", input: 1, output: 0 });

		// Temperature
		if (temperatureType === "LOW")
			additions.push({ ticker: "INS", input: areaCost * 10, output: 0 });
		else if (temperatureType === "HIGH")
			additions.push({ ticker: "TSH", input: 1, output: 0 });

		return additions;
	}

	return {
		planets: allData,
		reload: preload,
		getPlanet,
		getPlanetName,
		loadPlanetName,
		loadPlanetNames,
		planetNames,
		getPlanetSpecialMaterials,
	};
}
