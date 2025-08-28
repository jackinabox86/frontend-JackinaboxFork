import { computed, ComputedRef, Ref } from "vue";

// Composables
import { useBuildingData } from "@/features/game_data/useBuildingData";
import { usePrice } from "@/features/cx/usePrice";

// Types & Interfaces
import {
	IPlanDataBuilding,
	IPlanEmpire,
	IPlanEmpireElement,
} from "@/stores/planningStore.types";
import {
	IBuildingConstruction,
	IMaterialIOMinimal,
	IPreBuildingRecord,
} from "@/features/planning/usePlanCalculation.types";
import { IBuilding, IPlanet } from "@/features/api/gameData.types";
import { infrastructureBuildingNames } from "@/features/planning/calculations/workforceCalculations";

/**
 * # Precomputed References
 *
 * This composable leverages Vue 3's reactivity system to pre-compute certain data
 * that remains static during various user planning actions.
 * For an in-depth understanding of Vue's reactivity, refer to the official
 * documentation: https://vuejs.org/guide/extras/reactivity-in-depth.
 *
 * The primary goal is to optimize performance by avoiding unnecessary
 * recalculations of data that do not change frequently. For example, building
 * data and their associated recipe options are pre-computed because they only
 * change when a building is removed or replaced. These options remain
 * unaffected by changes to active recipes or their quantities made by the user.
 *
 * By pre-computing and caching this data, we ensure that the application
 * remains responsive and efficient, even as users make frequent adjustments
 * to their plans.
 */
export async function usePlanCalculationPreComputes(
	buildings: Ref<IPlanDataBuilding[]>,
	cxUuid: Ref<string | undefined>,
	empireUuid: Ref<string | undefined>,
	empireOptions: Ref<IPlanEmpireElement[] | undefined>,
	planetNaturalId: Ref<string>,
	planetData: IPlanet
) {
	// Composable function
	const {
		getBuilding,
		getBuildingConstructionMaterials,
		getBuildingRecipes,
		getBuildingWorkforceMaterials,
	} = await useBuildingData();

	const { getMaterialIOTotalPrice } = await usePrice(cxUuid, planetNaturalId);
	/**
	 * Holds data of the currently active empire based on all available
	 * empires and the empireUuid passed to this composable
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPlanEmpire | undefined>}	Empire Information
	 */
	const computedActiveEmpire: ComputedRef<IPlanEmpire | undefined> = computed(
		() => {
			if (empireUuid.value === undefined) return undefined;

			if (empireUuid.value && empireOptions.value) {
				const e: IPlanEmpire | undefined = empireOptions.value.find(
					(f) => f.uuid === empireUuid.value
				);

				if (e) return e;
			}

			return undefined;
		}
	);

	/**
	 * Holds a computed array of the plans active building tickers.
	 *
	 * @remark Recalculates if the plan buildings are modified
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<string[]>} Array of Building Ticker
	 */
	const computedBuildingTicker: ComputedRef<string[]> = computed<string[]>(
		() => buildings.value.map((b) => b.name)
	);

	/**
	 * Holds a computed record of additional information on the plans
	 * active buildings containing building data, construction materials,
	 * the buildings recipe options and construction cost
	 *
	 * @remark Recalculates if the plan buildings are modified or cx
	 * information changes
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPreBuildingRecord>} Record of building informatio
	 * per building ticker for all plans active in the building
	 */
	const computedBuildingInformation: ComputedRef<IPreBuildingRecord> =
		computed<IPreBuildingRecord>(() => {
			const map: IPreBuildingRecord = {};

			computedBuildingTicker.value.forEach((ticker) => {
				const buildingData: IBuilding = getBuilding(ticker);
				const constructionMaterials: IMaterialIOMinimal[] =
					getBuildingConstructionMaterials(buildingData, planetData);

				const workforceMaterials: IMaterialIOMinimal[] =
					getBuildingWorkforceMaterials(buildingData, true, true);

				map[ticker] = {
					ticker: ticker,
					buildingData: buildingData,
					buildingRecipes: getBuildingRecipes(
						ticker,
						planetData.Resources
					),
					constructionMaterials: constructionMaterials,
					constructionCost: getMaterialIOTotalPrice(
						constructionMaterials,
						"BUY"
					),
					workforceMaterials: workforceMaterials,
				};
			});

			return map;
		});

	/**
	 * Holds a record of all infrastructures construction materials
	 * taking the planetary building requirements into account
	 *
	 * @author jplacht
	 *
	 * @type {IBuildingConstruction[]} Array of infrastructure
	 * construction materials
	 */
	const infrastructureBuildingInformation: IBuildingConstruction[] = [
		"CM",
		...infrastructureBuildingNames,
	].map((inf) => ({
		ticker: inf,
		materials: getBuildingConstructionMaterials(
			getBuilding(inf),
			planetData
		),
		amount: 1,
	}));

	return {
		computedActiveEmpire,
		computedBuildingTicker,
		computedBuildingInformation,
		infrastructureBuildingInformation,
	};
}
