import { computed, ComputedRef } from "vue";

// Util
import { boundaryDescriptor } from "@/util/numbers";

// Composables
import {
	boundaryGravityHigh,
	boundaryGravityLow,
	boundaryPressureHigh,
	boundaryPressureLow,
	boundaryTemperatureHigh,
	boundaryTemperatureLow,
} from "@/database/services/usePlanetData";

// Types & Interfaces
import { IPlanet } from "@/features/api/gameData.types";
import {
	IPlanetSearchResult,
	IPlanetSearchResultResource,
} from "@/features/planet_search/usePlanetSearchResults.types";
import { BOUNDARY_DESCRIPTOR } from "@/util/numbers.types";

export function usePlanetSearchResults(
	searchData: IPlanet[],
	searchMaterials: string[]
) {
	/**
	 * Computed Ref with table-ready planet search data
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPlanetSearchResult[]>}
	 */
	const results: ComputedRef<IPlanetSearchResult[]> = computed(() => {
		if (searchData.length === 0) return [];

		const r: IPlanetSearchResult[] = searchData.map((e) => {
			// handle resources
			const searchResources: Record<string, IPlanetSearchResultResource> =
				{};
			const additionalResources: IPlanetSearchResultResource[] = [];
			e.Resources.forEach((er) => {
				if (!searchMaterials.includes(er.MaterialTicker)) {
					additionalResources.push({
						ticker: er.MaterialTicker,
						dailyExtraction: er.DailyExtraction,
						maxExtraction: er.ExtractionMax,
					});
				} else {
					searchResources[er.MaterialTicker] = {
						ticker: er.MaterialTicker,
						dailyExtraction: er.DailyExtraction,
						maxExtraction: er.ExtractionMax,
					};
				}
			});
			// sort additional resources
			additionalResources.sort((a, b) => (a.ticker > b.ticker ? 1 : -1));

			// environmental material additions
			const environmentSurface: string[] = [];
			const environmentGravity: string[] = [];
			const environmentPressure: string[] = [];
			const environmentTemperature: string[] = [];

			// surface
			if (e.Surface) environmentSurface.push("MCG");
			else environmentSurface.push("AEF");

			// gravity
			const gravityType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				e.Gravity,
				boundaryGravityLow,
				boundaryGravityHigh
			);
			if (gravityType === "LOW") environmentGravity.push("MGC");
			else if (gravityType === "HIGH") environmentGravity.push("BL");

			// pressure
			const pressureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				e.Pressure,
				boundaryPressureLow,
				boundaryPressureHigh
			);
			if (pressureType === "LOW") environmentPressure.push("SEA");
			else if (pressureType === "HIGH") environmentPressure.push("HSE");

			// temperature

			const temperatureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				e.Temperature,
				boundaryTemperatureLow,
				boundaryTemperatureHigh
			);
			if (temperatureType === "LOW") environmentTemperature.push("INS");
			else if (temperatureType === "HIGH")
				environmentTemperature.push("TSH");

			// infrastructures
			const infrastructures: string[] = [];

			if (e.HasLocalMarket) infrastructures.push("LM");
			if (e.HasChamberOfCommerce) infrastructures.push("COGM");
			if (e.HasWarehouse) infrastructures.push("WAR");
			if (e.HasAdministrationCenter) infrastructures.push("ADM");
			if (e.HasShipyard) infrastructures.push("SHY");

			infrastructures.sort((a, b) => (a > b ? 1 : -1));

			return {
				planetId: e.PlanetNaturalId,
				planetName: e.PlanetName,
				fertility: e.Fertility === -1 ? 0 : 1 + e.Fertility * (10 / 33),
				cogcProgram:
					e.COGCProgramActive !== null ? e.COGCProgramActive : "—",
				environmentSurface,
				environmentGravity,
				environmentPressure,
				environmentTemperature,
				distanceAI1: e.Distances[1].distance,
				distanceCI1: e.Distances[2].distance,
				distanceIC1: e.Distances[3].distance,
				distanceNC1: e.Distances[0].distance,
				checkDistance:
					e.CheckDistances !== null
						? e.CheckDistances.Distance
						: null,
				searchResources,
				additionalResources,
				infrastructures,
			};
		});

		return r;
	});

	/**
	 * Boolean if the search includes a max distance check
	 * @author jplacht
	 *
	 * @type {ComputedRef<string | null>}
	 */
	const hasCheckDistance: ComputedRef<string | null> = computed(() => {
		if (searchData.length > 0 && searchData[0].CheckDistances !== null) {
			return searchData[0].CheckDistances.SystemName;
		} else {
			return null;
		}
	});

	return {
		results,
		hasCheckDistance,
	};
}
