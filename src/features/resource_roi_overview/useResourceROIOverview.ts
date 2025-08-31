import { ref, Ref } from "vue";

// API
import { useQuery } from "@/lib/query_cache/useQuery";

// Composables
import {
	boundaryGravityHigh,
	boundaryGravityLow,
	boundaryPressureHigh,
	boundaryPressureLow,
	boundaryTemperatureHigh,
	boundaryTemperatureLow,
} from "@/database/services/usePlanetData";
import { usePlan } from "@/features/planning_data/usePlan";
import { usePlanCalculation } from "@/features/planning/usePlanCalculation";
import { usePlanetData } from "@/database/services/usePlanetData";

// Static
import { optimalProduction } from "@/features/roi_overview/assets/optimalProduction";

// Util
import { BOUNDARY_DESCRIPTOR } from "@/util/numbers.types";
import { boundaryDescriptor } from "@/util/numbers";

// Types & Interfaces
import { IPlanet } from "@/features/api/gameData.types";
import { IResourceROIResult } from "@/features/resource_roi_overview/useResourceROIOverview.types";
import { until } from "@vueuse/core";

export function useResourceROIOverview(cxUuid: Ref<string | undefined>) {
	const { createBlankDefinition } = usePlan();
	const { planetNames, loadPlanetNames } = usePlanetData();

	const planetResults: Ref<IPlanet[]> = ref([]);
	const resultData: Ref<IResourceROIResult[]> = ref([]);

	const progressSearchingPlanets = ref(false);
	const progressCurrent = ref(0);
	const progressTotal = ref(0);

	// Filter for all extraction buildings
	const filteredOptimalProduction = optimalProduction.filter((e) =>
		["RIG", "EXT", "COL"].includes(e.ticker)
	);

	async function searchPlanets(materialTicker: string): Promise<IPlanet[]> {
		progressSearchingPlanets.value = true;

		await useQuery("PostPlanetSearch", {
			searchData: {
				Materials: [materialTicker],
				COGC: [],
				IncludeRocky: true,
				IncludeGaseous: true,
				IncludeLowGravity: true,
				IncludeHighGravity: true,
				IncludeLowPressure: true,
				IncludeHighPressure: true,
				IncludeLowTemperature: true,
				IncludeHighTemperature: true,
				MustBeFertile: false,
				MustHaveLocalMarket: false,
				MustHaveChamberOfCommerce: false,
				MustHaveWarehouse: false,
				MustHaveAdministrationCenter: false,
				MustHaveShipyard: false,
			},
		})
			.execute()
			.then((data: IPlanet[]) => {
				planetResults.value = data;
			});

		// reset total + current
		progressCurrent.value = 0;
		progressTotal.value = planetResults.value.length;
		progressSearchingPlanets.value = false;

		return planetResults.value;
	}

	async function calculate(
		materialTicker: string
	): Promise<IResourceROIResult[]> {
		// fetch planets
		const planets: IPlanet[] = await searchPlanets(materialTicker);
		const localResults: IResourceROIResult[] = [];

		// trigger planet name loading and wait on it
		await loadPlanetNames(planets.map((p) => p.PlanetNaturalId));

		for (const planetData of planets) {
			// environmental material additions
			const environmentSurface: string[] = [];
			const environmentGravity: string[] = [];
			const environmentPressure: string[] = [];
			const environmentTemperature: string[] = [];

			// surface
			if (planetData.Surface) environmentSurface.push("MCG");
			if (!planetData.Surface) environmentSurface.push("AEF");

			// gravity
			const gravityType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				planetData.Gravity,
				boundaryGravityLow,
				boundaryGravityHigh
			);
			if (gravityType === "LOW") environmentGravity.push("MGC");
			else if (gravityType === "HIGH") environmentGravity.push("BL");

			// pressure
			const pressureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				planetData.Pressure,
				boundaryPressureLow,
				boundaryPressureHigh
			);
			if (pressureType === "LOW") environmentPressure.push("SEA");
			else if (pressureType === "HIGH") environmentPressure.push("HSE");

			// temperature

			const temperatureType: BOUNDARY_DESCRIPTOR = boundaryDescriptor(
				planetData.Temperature,
				boundaryTemperatureLow,
				boundaryTemperatureHigh
			);
			if (temperatureType === "LOW") environmentTemperature.push("INS");
			else if (temperatureType === "HIGH")
				environmentTemperature.push("TSH");

			// iterate over optimal buildings
			for (const optimal of filteredOptimalProduction) {
				// create a blank definition from planet data
				const definition = ref(
					createBlankDefinition(
						planetData.PlanetNaturalId,
						planetData.COGCProgramActive
					)
				);

				// set all the experts to 5
				definition.value.baseplanner_data.planet.experts.forEach(
					(expert) => (expert.amount = 5)
				);

				// set infrastructure
				definition.value.baseplanner_data.infrastructure = [
					{ building: "HB1", amount: optimal.HB1 },
					{ building: "HB2", amount: optimal.HB2 },
					{ building: "HB3", amount: optimal.HB3 },
					{ building: "HB4", amount: optimal.HB4 },
					{ building: "HB5", amount: optimal.HB5 },
					{ building: "HBB", amount: optimal.HBB },
					{ building: "HBC", amount: optimal.HBC },
					{ building: "HBM", amount: optimal.HBM },
					{ building: "HBL", amount: optimal.HBL },
					{ building: "STO", amount: optimal.sto },
				];

				// artificially set cogc to resource extraction
				definition.value.baseplanner_data.planet.cogc =
					"RESOURCE_EXTRACTION";

				const calculation = await usePlanCalculation(
					definition,
					undefined,
					undefined,
					cxUuid
				);

				const {
					handleCreateBuilding,

					overviewData,
					calculate,
				} = await usePlanCalculation(
					definition,
					undefined,
					undefined,
					cxUuid
				);

				// create building
				await handleCreateBuilding(optimal.ticker);
				const resultData = await calculate();

				// add recipe

				for (const productionBuilding of resultData.production
					.buildings) {
					if (
						productionBuilding.recipeOptions
							.map((e) => e.Outputs.map((m) => m.Ticker))
							.flat()
							.includes(materialTicker)
					) {
						// manipulate definition daata

						definition.value.baseplanner_data.buildings[0].amount =
							optimal.amount;
						definition.value.baseplanner_data.buildings[0].active_recipes =
							[
								{
									recipeid: `${productionBuilding.name}#${materialTicker}`,
									amount: 1,
								},
							];

						const newResult = await calculate();

						// find daily yield from material i/o for given materialticker
						const dailyYield: number =
							newResult.materialio.find(
								(f) => f.ticker === materialTicker
							)?.output ?? 0;

						await until(calculation.overviewData).toMatch(
							(v) => v.dailyProfit != 0
						);

						// all matches, push the result
						localResults.push({
							planetNaturalId: planetData.PlanetNaturalId,
							planetName:
								planetNames.value[planetData.PlanetNaturalId],
							buildingTicker: productionBuilding.name,
							dailyYield,
							percentMaxDailyYield: 0,
							cogm: newResult.production.buildings[0]
								.activeRecipes[0].cogm,
							outputProfit:
								newResult.production.buildings[0]
									.activeRecipes[0].cogm?.totalProfit ?? 0,
							dailyProfit: overviewData.value.profit,
							planCost: overviewData.value.totalConstructionCost,
							planROI: overviewData.value.roi,
							distanceAI1:
								planetData.Distances.find(
									(e) => e.name === "Antares Station"
								)?.distance ?? 0,
							distanceCI1:
								planetData.Distances.find(
									(e) => e.name === "Benten Station"
								)?.distance ?? 0,
							distanceIC1:
								planetData.Distances.find(
									(e) => e.name === "Hortus Station"
								)?.distance ?? 0,
							distanceNC1:
								planetData.Distances.find(
									(e) => e.name === "Moria Station"
								)?.distance ?? 0,
							planetSurface: environmentSurface,
							planetGravity: environmentGravity,
							planetPressure: environmentPressure,
							planetTemperature: environmentTemperature,
						});
					}
				}
			}

			progressCurrent.value++;
			await new Promise((r) => setTimeout(r, 0));
		}

		// calculate the max yield of all, then set the percent of max yield
		const maxDailyYield: number = Math.max(
			...localResults.map((e) => e.dailyYield)
		);

		localResults.map(
			(r) => (r.percentMaxDailyYield = r.dailyYield / maxDailyYield)
		);

		// sort by dailyYield, descending
		localResults.sort((a, b) => (a.dailyYield > b.dailyYield ? -1 : 1));

		resultData.value = localResults;
		return resultData.value;
	}

	return {
		searchPlanets,
		calculate,
		planetResults,
		resultData,
		// progress
		progressCurrent,
		progressTotal,
		progressSearchingPlanets,
	};
}
