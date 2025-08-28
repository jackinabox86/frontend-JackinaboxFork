// Stores
import { useGameDataStore } from "@/stores/gameDataStore";

// Composables
import { usePlanetData } from "@/database/services/usePlanetData";
import { useMaterialIOUtil } from "@/features/planning/util/materialIO.util";
import { useWorkforceCalculation } from "@/features/planning/calculations/workforceCalculations";

// Util
import { calculateExtraction } from "@/features/planning/calculations/extractionCalculations";
import { inertClone } from "@/util/data";

// Interfaces & Types
import {
	IBuilding,
	IPlanet,
	IPlanetResource,
	IRecipe,
	PLANET_RESOURCETYPE_TYPE,
} from "@/features/api/gameData.types";
import { PSelectOption } from "@/ui/ui.types";
import {
	IMaterialIOMinimal,
	IWorkforceRecord,
} from "@/features/planning/usePlanCalculation.types";
import { PLAN_COGCPROGRAM_TYPE } from "@/stores/planningStore.types";
import { IRecipesRecord } from "@/stores/gameDataStore.types";

export async function useBuildingData() {
	const gameDataStore = useGameDataStore();

	const { getPlanetSpecialMaterials } = usePlanetData();
	const { combineMaterialIOMinimal } = await useMaterialIOUtil();
	const { calculateWorkforceConsumption } = await useWorkforceCalculation();

	/**
	 * Maps resource buildings to their respective extraction / collection
	 * types to check against planetary resources
	 * @author jplacht
	 *
	 * @type {Record<string, PLANET_RESOURCETYPE_TYPE>} e.g. {EXT: "MINERAL"}
	 */
	const resourceBuildingTicker: Record<string, PLANET_RESOURCETYPE_TYPE> = {
		EXT: "MINERAL",
		COL: "GASEOUS",
		RIG: "LIQUID",
	};

	/**
	 * Gets building data by building ticker from gamedata store
	 *
	 * @author jplacht
	 *
	 * @param {string} buildingTicker Ticker, e.g. "PP1"
	 * @returns {IBuilding} Building Data
	 */
	function getBuilding(buildingTicker: string): IBuilding {
		const findBuilding: IBuilding | undefined =
			gameDataStore.buildings[buildingTicker];

		if (findBuilding) return inertClone(findBuilding);

		throw new Error(
			`No data: Building '${buildingTicker}'. Ensure ticker is valid and game data has been loaded.`
		);
	}

	function getAllBuildingRecipes(): IRecipesRecord {
		return gameDataStore.recipes;
	}

	/**
	 * Transforms all gamedata store building information to Naive UI
	 * n-select component options, allows to check for COGC and only
	 * return those options where the cogc matches
	 *
	 * @author jplacht
	 *
	 * @param {string[]} [existing=[]] Buildingticker to be excluded
	 * @param {(PLAN_COGCPROGRAM_TYPE | undefined)} [cogc=undefined] COGC to match against
	 * @returns {PSelectOption[]} {label: string, value: string}[]
	 */
	function getProductionBuildingOptions(
		existing: string[] = [],
		cogc: PLAN_COGCPROGRAM_TYPE | undefined = undefined
	): PSelectOption[] {
		const options: PSelectOption[] = [];

		Object.values(gameDataStore.buildings)
			.filter(
				(b) =>
					b.Habitation === null &&
					b.Type !== "PLANETARY" &&
					b.Type !== "INFRASTRUCTURE"
			)
			.forEach((building) => {
				// only production buildings that are not in existing list
				if (!existing.includes(building.Ticker)) {
					// check for matching COGC
					if (cogc && building.Expertise != cogc) {
						return [];
					}

					options.push({
						value: building.Ticker,
						label:
							building.Ticker +
							" (" +
							building.Name.replace(/([A-Z])/g, " $1")
								.trim()
								.charAt(0)
								.toUpperCase() +
							building.Name.replace(/([A-Z])/g, " $1")
								.trim()
								.slice(1) +
							")",
					});
				}
			});

		return options;
	}

	/**
	 * Gets all available recipes for given buildingTicker and
	 * available planetary resources, creates new recipes for resource
	 * extraction as those are not part of the recipe data payloads.
	 *
	 * @author jplacht
	 *
	 * @param {string} buildingTicker Buildigticker e.g. "EXT"
	 * @param {IPlanetResource[]} [planetResources=[]] Planetary Resource
	 * @returns {IRecipe[]} Recipe Data
	 */
	function getBuildingRecipes(
		buildingTicker: string,
		planetResources: IPlanetResource[] = []
	): IRecipe[] {
		/**
		 * Resource extraction buildings can only hold recipe options if
		 * there is a planetary resource available matching their potential
		 * extraction type.
		 */
		if (Object.keys(resourceBuildingTicker).includes(buildingTicker)) {
			// use planet resources to fetch recipes
			if (planetResources.length === 0) return [];

			const searchType: PLANET_RESOURCETYPE_TYPE =
				resourceBuildingTicker[buildingTicker];
			const relevantResources: IPlanetResource[] = planetResources.filter(
				(r) => r.ResourceType === searchType
			);

			// create individual resource recipes
			const resourceRecipes: IRecipe[] = relevantResources.map((res) => {
				const { timeMs, extractionAmount } = calculateExtraction(
					res.ResourceType,
					res.DailyExtraction
				);

				return {
					RecipeId: `${buildingTicker}#${res.MaterialTicker}`,
					BuildingTicker: buildingTicker,
					RecipeName: buildingTicker,
					TimeMs: timeMs,
					Inputs: [],
					Outputs: [
						{
							Ticker: res.MaterialTicker,
							Amount: extractionAmount,
						},
					],
				};
			});

			return resourceRecipes;
		} else {
			if (!Object.keys(gameDataStore.recipes).includes(buildingTicker)) {
				throw new Error(
					`No recipe data: Building '${buildingTicker}'. Ensure ticker is valid and game data has been loaded.`
				);
			}

			/**
			 * Loose reactivity as recipe information gets transformed in
			 * plan calculations. E.g. by setting the correct times based
			 * on building efficiency
			 */
			return inertClone(gameDataStore.recipes[buildingTicker]);
		}
	}

	/**
	 * Sums up all building workforces
	 *
	 * @author jplacht
	 *
	 * @param {IBuilding} building Building Data
	 * @returns {number} Sum of all workforce types
	 */
	function getTotalWorkforce(building: IBuilding): number {
		return (
			building.Pioneers +
			building.Settlers +
			building.Technicians +
			building.Engineers +
			building.Scientists
		);
	}

	/**
	 * Gets a buildings construction materials based on the
	 * building costs itself and potentially existing additional
	 * planetary building requirements based on the planets conditions.
	 *
	 * @author jplacht
	 *
	 * @param {IBuilding} building Building data
	 * @param {(IPlanet | undefined)} planet Planet data
	 * @returns {IMaterialIOMinimal[]} Array of construction materials
	 */
	function getBuildingConstructionMaterials(
		building: IBuilding,
		planet: IPlanet | undefined
	): IMaterialIOMinimal[] {
		const materials: IMaterialIOMinimal[] = [];

		building.BuildingCosts.forEach((m) => {
			materials.push({
				ticker: m.CommodityTicker,
				input: m.Amount,
				output: 0,
			});
		});

		// get and add additional planet construction materials
		if (planet) {
			return combineMaterialIOMinimal([
				materials,
				getPlanetSpecialMaterials(planet, building.AreaCost),
			]);
		} else {
			return materials;
		}
	}

	/**
	 * Gets a buildings workforce consumption materials by using its
	 * required workforce to fake a WorkforceRecord and calculate
	 * consumption materials based on this
	 *
	 * @author jplacht
	 *
	 * @param {IBuilding} building Building Data
	 * @param {boolean} [lux1=true] Lux1 given
	 * @param {boolean} [lux2=true] Lux2 given
	 * @returns {IMaterialIOMinimal[]} Workforce Consumption Material IO
	 */
	function getBuildingWorkforceMaterials(
		building: IBuilding,
		lux1: boolean = true,
		lux2: boolean = true
	): IMaterialIOMinimal[] {
		// create a faked WorkforceRecord based on the buildings workforce
		const buildingWorkforce: IWorkforceRecord = {
			pioneer: {
				name: "pioneer",
				required: building.Pioneers,
				capacity: building.Pioneers,
				left: 0,
				lux1: lux1,
				lux2: lux2,
				efficiency: 1,
			},
			settler: {
				name: "settler",
				required: building.Settlers,
				capacity: building.Settlers,
				left: 0,
				lux1: lux1,
				lux2: lux2,
				efficiency: 1,
			},
			technician: {
				name: "technician",
				required: building.Technicians,
				capacity: building.Technicians,
				left: 0,
				lux1: lux1,
				lux2: lux2,
				efficiency: 1,
			},
			engineer: {
				name: "engineer",
				required: building.Engineers,
				capacity: building.Engineers,
				left: 0,
				lux1: lux1,
				lux2: lux2,
				efficiency: 1,
			},
			scientist: {
				name: "scientist",
				required: building.Scientists,
				capacity: building.Scientists,
				left: 0,
				lux1: lux1,
				lux2: lux2,
				efficiency: 1,
			},
		};

		return calculateWorkforceConsumption(buildingWorkforce);
	}

	return {
		getBuilding,
		getAllBuildingRecipes,
		getProductionBuildingOptions,
		getBuildingRecipes,
		getTotalWorkforce,
		getBuildingConstructionMaterials,
		getBuildingWorkforceMaterials,
	};
}
