import { computed, ComputedRef, ref, Ref, toRaw, toRef, watch } from "vue";

// Stores
import { usePlanningStore } from "@/stores/planningStore";

// Composables
import { useBuildingData } from "@/features/game_data/useBuildingData";
import {
	TOTALMSDAY,
	useBuildingCalculation,
} from "@/features/planning/calculations/buildingCalculations";
import { useMaterialIOUtil } from "@/features/planning/util/materialIO.util";
import { usePrice } from "@/features/cx/usePrice";
import { usePlanetData } from "@/database/services/usePlanetData";

// Calculation Utils
import {
	expertNames,
	useBonusCalculation,
} from "@/features/planning/calculations/bonusCalculations";
import {
	infrastructureBuildingNames,
	useWorkforceCalculation,
	workforceTypeNames,
} from "@/features/planning/calculations/workforceCalculations";

// Submodule composables
import { usePlanCalculationHandlers } from "@/features/planning/usePlanCalculationHandlers";
import { usePlanCalculationPreComputes } from "@/features/planning/usePlanCalculationPreComputes";

// Types & Interfaces
import { IBuilding, IPlanet, IRecipe } from "@/features/api/gameData.types";
import {
	IAreaResult,
	IBuildingConstruction,
	ICOGMMaterialCost,
	ICOGMMaterialReturn,
	IExpertRecord,
	IInfrastructureRecord,
	IMaterialIO,
	IMaterialIOMaterial,
	IMaterialIOMinimal,
	INFRASTRUCTURE_TYPE,
	IOverviewData,
	IPlanResult,
	IProductionBuilding,
	IProductionBuildingRecipe,
	IProductionBuildingRecipeCOGM,
	IProductionResult,
	IRecipeBuildingOption,
	IVisitationData,
	IWorkforceElement,
	IWorkforceRecord,
	WORKFORCE_TYPE,
} from "@/features/planning/usePlanCalculation.types";
import {
	IPlan,
	IPlanData,
	IPlanDataBuilding,
	IPlanDataExpert,
	IPlanDataInfrastructure,
	IPlanDataPlanet,
	IPlanDataWorkforce,
	IPlanEmpire,
	IPlanEmpireElement,
	PLAN_COGCPROGRAM_TYPE,
} from "@/stores/planningStore.types";
import { IPlanCreateData } from "@/features/planning_data/usePlan.types";

export async function usePlanCalculation(
	plan: Ref<IPlan>,
	empireUuid: Ref<string | undefined> = ref(undefined),
	empireOptions: Ref<IPlanEmpireElement[] | undefined> = ref(undefined),
	cxUuid: Ref<string | undefined> = ref(undefined)
) {
	// stores
	const planningDataStore = usePlanningStore();
	const { getPlanet } = usePlanetData();

	const refreshKey: Ref<number> = ref(0);

	// watches external data to trigger a recalculation
	watch(
		() => planningDataStore.cxs,
		() => {
			refreshKey.value++;
		},
		{ deep: true }
	);

	// data references

	const planName: Ref<string | undefined> = toRef(plan.value.name);
	const data: ComputedRef<IPlanData> = computed(
		() => plan.value.baseplanner_data
	);
	const planet: ComputedRef<IPlanDataPlanet> = computed(
		() => data.value.planet
	);
	const planetNaturalId: ComputedRef<string> = computed(
		() => data.value.planet.planetid
	);
	const empires: Ref<IPlanEmpire[]> = toRef([]);
	const planEmpires: ComputedRef<IPlanEmpire[]> = computed(
		() => plan.value.empires
	);
	const planetData: IPlanet = await getPlanet(planet.value.planetid);
	const buildings: ComputedRef<IPlanDataBuilding[]> = computed(
		() => data.value.buildings
	);

	// composables

	const { getBuilding } = useBuildingData();
	const { combineMaterialIOMinimal, enhanceMaterialIOMinimal } =
		useMaterialIOUtil();
	const { calculateExpertBonus, calculateBuildingEfficiency } =
		useBonusCalculation();
	const { calculateSatisfaction, calculateWorkforceConsumption } =
		useWorkforceCalculation();
	const { getPrice, getMaterialIOTotalPrice, enhanceMaterialIOMaterial } =
		usePrice(cxUuid, planetNaturalId);
	const { calculateMaterialIO } = useBuildingCalculation();

	// computations

	const existing: ComputedRef<boolean> = computed(() => {
		return plan.value.uuid !== undefined;
	});

	const saveable: ComputedRef<boolean> = computed(() => {
		return planName.value != undefined && planName.value != "";
	});

	// pre-computations

	const {
		computedActiveEmpire,
		computedBuildingInformation,
		infrastructureBuildingInformation,
	} = usePlanCalculationPreComputes(
		buildings,
		cxUuid,
		empireUuid,
		empireOptions,
		planetNaturalId,
		planetData
	);

	// calculations

	/**
	 * Calculates plan workforce based on infrastructure provisioning and
	 * production building needs. This also includes the efficiency calculation
	 * based on capacity and required workforce under given luxury provision.
	 *
	 * @author jplacht
	 *
	 * @returns {Required<
	 * 		Record<WORKFORCE_TYPE, IWorkforceElement>
	 * 	>} Calculated Workforce Result
	 */
	function calculateWorkforceResult(): Required<
		Record<WORKFORCE_TYPE, IWorkforceElement>
	> {
		const result: Record<WORKFORCE_TYPE, IWorkforceElement> =
			Object.fromEntries(
				workforceTypeNames.map((key) => {
					// get current workforce value from planet data
					const dataLuxuries: IPlanDataWorkforce | undefined =
						planet.value.workforce.find((e) => e.type == key);

					return [
						key,
						{
							name: key,
							required: 0,
							capacity: 0,
							left: 0,
							lux1: dataLuxuries ? dataLuxuries.lux1 : true,
							lux2: dataLuxuries ? dataLuxuries.lux2 : true,
							efficiency: 0,
						} as IWorkforceElement,
					];
				})
			) as Record<WORKFORCE_TYPE, IWorkforceElement>;

		// calculate capacity from infrastructure buildings
		data.value.infrastructure.forEach((infrastructure) => {
			if (infrastructure.amount > 0) {
				const infBuildingData: IBuilding = getBuilding(
					infrastructure.building
				);

				// must provide workforce habitation
				if (infBuildingData.Habitation !== null) {
					result.pioneer.capacity +=
						infBuildingData.Habitation.Pioneer *
						infrastructure.amount;
					result.settler.capacity +=
						infBuildingData.Habitation.Settler *
						infrastructure.amount;
					result.technician.capacity +=
						infBuildingData.Habitation.Technician *
						infrastructure.amount;
					result.engineer.capacity +=
						infBuildingData.Habitation.Engineer *
						infrastructure.amount;
					result.scientist.capacity +=
						infBuildingData.Habitation.Scientist *
						infrastructure.amount;
				}
			}
		});

		// calculate required workforce from production buildings
		data.value.buildings.forEach((prodBuilding) => {
			if (prodBuilding.amount > 0) {
				const prodBuildingData: IBuilding = getBuilding(
					prodBuilding.name
				);

				result.pioneer.required +=
					prodBuildingData.Pioneers * prodBuilding.amount;
				result.settler.required +=
					prodBuildingData.Settlers * prodBuilding.amount;
				result.technician.required +=
					prodBuildingData.Technicians * prodBuilding.amount;
				result.engineer.required +=
					prodBuildingData.Engineers * prodBuilding.amount;
				result.scientist.required +=
					prodBuildingData.Scientists * prodBuilding.amount;
			}
		});

		// calculate satifsfaction and left
		Object.values(result).forEach((workforce) => {
			workforce.efficiency = calculateSatisfaction(
				workforce.capacity,
				workforce.required,
				workforce.lux1,
				workforce.lux2
			);

			workforce.left = workforce.capacity - workforce.required;
		});

		return result;
	}

	/**
	 * Calculates the plans area result by determining the total amount of
	 * usable area based on permits and the used area by infrastructure
	 * and production buildings. C
	 *
	 * @remark Core Modul Area of 25 is always included
	 *
	 * @author jplacht
	 *
	 * @returns {IAreaResult} Plan Area Result
	 */
	function calculateAreaResult(): IAreaResult {
		// Core Module holds 25 area
		let areaUsed: number = 25;
		const areaTotal: number = 250 + planet.value.permits * 250;

		// calculate area used based on production and infrastructure buildings
		data.value.infrastructure.forEach((infrastructure) => {
			if (infrastructure.amount > 0) {
				const infBuildingData: IBuilding = getBuilding(
					infrastructure.building
				);

				areaUsed += infBuildingData.AreaCost * infrastructure.amount;
			}
		});

		data.value.buildings.forEach((building) => {
			if (building.amount > 0) {
				const prodBuildingData: IBuilding = getBuilding(building.name);

				areaUsed += prodBuildingData.AreaCost * building.amount;
			}
		});

		return {
			permits: planet.value.permits,
			areaUsed: areaUsed,
			areaTotal: areaTotal,
			areaLeft: areaTotal - areaUsed,
		};
	}

	/**
	 * Calculates a result record with all infrastructure buildings and
	 * their currently used amount in the plan
	 *
	 * @author jplacht
	 *
	 * @returns {IInfrastructureRecord} Infrastructure Record
	 */
	function calculateInfrastructureResult(): IInfrastructureRecord {
		const result: IInfrastructureRecord = Object.fromEntries(
			infrastructureBuildingNames.map((key) => {
				const currentInf: IPlanDataInfrastructure | undefined =
					data.value.infrastructure.find((e) => e.building === key);

				if (currentInf) {
					return [key, currentInf.amount];
				}
				return [key, 0];
			})
		) as IInfrastructureRecord;

		return result;
	}

	/**
	 * Calculates the result for expert setup of the plan returning a
	 * record with each expert type, its planned amount and the bonus
	 * efficiency provided by it
	 *
	 * @author jplacht
	 *
	 * @returns {IExpertRecord} Expert Result Record
	 */
	function calculateExpertResult(): IExpertRecord {
		const result: IExpertRecord = Object.fromEntries(
			expertNames.map((key) => {
				const currentExpert: IPlanDataExpert | undefined =
					planet.value.experts.find((e) => e.type === key);

				let amount: number = 0;
				let bonus: number = 0;

				if (currentExpert) {
					amount = currentExpert.amount;
					bonus = calculateExpertBonus(amount);
				}

				return [key, { name: key, amount: amount, bonus: bonus }];
			})
		) as IExpertRecord;

		return result;
	}

	/**
	 * Calculates plan production taking into account efficiency factors
	 * for certain production lines, buildings, experts and workforce
	 * based on the plans active recipes
	 *
	 * @author jplacht
	 *
	 * @param {boolean} corphq Has CORPHQ on planet
	 * @param {PLAN_COGCPROGRAM_TYPE} cogc COGC value
	 * @param {IWorkforceRecord} workforce Workforce result
	 * @param {IExpertRecord} experts Plans experts
	 * @returns {IProductionResult} Production Result
	 */
	function calculateProduction(
		corphq: boolean,
		cogc: PLAN_COGCPROGRAM_TYPE,
		workforce: IWorkforceRecord,
		experts: IExpertRecord
	): IProductionResult {
		const buildings: IProductionBuilding[] = [];

		// add buildings from data
		data.value.buildings.forEach((b) => {
			// efficiency calculations
			const buildingData: IBuilding =
				computedBuildingInformation.value[b.name].buildingData;

			const { totalEfficiency, elements } = calculateBuildingEfficiency(
				buildingData,
				planetData,
				corphq,
				cogc,
				workforce,
				experts,
				computedActiveEmpire.value
			);

			const activeRecipes: IProductionBuildingRecipe[] = [];
			const buildingRecipes: IRecipe[] =
				computedBuildingInformation.value[b.name].buildingRecipes;

			// add currently active recipes
			b.active_recipes.forEach((r) => {
				// go raw to loose Proxy
				const recipeInfo: IRecipe | undefined = toRaw(
					buildingRecipes.find((ar) => ar.RecipeId == r.recipeid)
				);

				if (!recipeInfo) {
					throw new Error(
						`Unable to find recipe info for ${b.name} with recipe id ${r.recipeid}`
					);
				}

				activeRecipes.push({
					recipeId: r.recipeid,
					amount: r.amount,
					dailyShare: 1,
					// time adjusted to efficiency and amount
					time: (recipeInfo.TimeMs * r.amount) / totalEfficiency,
					recipe: { ...recipeInfo, dailyRevenue: 0, roi: 0 },
					cogm: undefined,
				});
			});

			// calculate total batchtime and
			const totalBatchTime: number = activeRecipes.reduce(
				(sum, ar) => sum + ar.time,
				0
			);

			// update active recipes timeshare
			activeRecipes.forEach(
				(updateDailyShare) =>
					(updateDailyShare.dailyShare =
						updateDailyShare.time / totalBatchTime)
			);

			// get construction materials
			const constructionMaterials: IMaterialIOMinimal[] =
				computedBuildingInformation.value[b.name].constructionMaterials;

			// calculate construction costs
			const constructionCost: number =
				computedBuildingInformation.value[b.name].constructionCost;

			const workforceMaterials: IMaterialIOMinimal[] =
				computedBuildingInformation.value[b.name].workforceMaterials;
			const workforceDailyCost: number = getMaterialIOTotalPrice(
				workforceMaterials,
				"BUY"
			);

			// get recipe options
			const recipeOptions: IRecipeBuildingOption[] = buildingRecipes.map(
				(br) => {
					// calculate daily revenue
					// output revenue
					const dailyIncome: number = getMaterialIOTotalPrice(
						br.Outputs.map((o) => {
							return {
								ticker: o.Ticker,
								output: o.Amount,
								input: 0,
							};
						}),
						"SELL"
					);
					// input cost
					const dailyCost: number =
						-1 *
						getMaterialIOTotalPrice(
							br.Inputs.map((i) => {
								return {
									ticker: i.Ticker,
									output: 0,
									input: i.Amount,
								};
							}),
							"BUY"
						);

					/**
					 * Daily Revenue of a recipe option:
					 *
					 * 	= Daily Income (selling recipe outputs)
					 * 	- Daily Cost (buying recipe inputs)
					 * 	- Building Degradation (1/180 of construction cost)
					 * 	- Building Daily Workforce Cost (lux1 + lux2)
					 */

					const maxDailyRuns: number =
						TOTALMSDAY / (br.TimeMs / totalEfficiency);

					const dailyRevenue: number =
						dailyIncome * maxDailyRuns -
						dailyCost * maxDailyRuns -
						constructionCost * -1 * (1 / 180) -
						-1 * workforceDailyCost;

					/**
					 * Recipe option ROI
					 *
					 * Time it takes for the recipes daily revenue to offset
					 * the total construction cost of this building
					 */
					const roi: number = (constructionCost * -1) / dailyRevenue;

					return {
						RecipeId: br.RecipeId,
						BuildingTicker: br.BuildingTicker,
						RecipeName: br.RecipeName,
						// Time adjusted to Efficiency
						TimeMs: br.TimeMs / totalEfficiency,
						Inputs: br.Inputs,
						Outputs: br.Outputs,
						dailyRevenue: dailyRevenue,
						roi: roi,
					};
				}
			);

			/*
			 * COGM
			 *
			 * Calculates each active recipes cost of goods manufactured, taking into account
			 * the active recipes share of a full daily runtime cycle with the following logics:
			 *
			 * degradation: share of full daily building degradation
			 * workforce: share of buildings daily workforce cost
			 * input cost: buy prices for the required input materials
			 *
			 * total cost: degradation share + workforce share + input total
			 *
			 * cogm: per output material
			 * 	- either consuming the full cost
			 * 	- or just its material output / all output
			 */

			activeRecipes.forEach((ar) => {
				const runtimeShare: number =
					ar.recipe.TimeMs / totalEfficiency / TOTALMSDAY;
				const degradation: number = (constructionCost * -1) / 180;
				const degradationShare: number = degradation * runtimeShare;
				const workforceCostTotal: number = workforceDailyCost * -1;
				const workforceCost: number = workforceCostTotal * runtimeShare;

				const inputCost: ICOGMMaterialCost[] = ar.recipe.Inputs.map(
					(inputMat) => ({
						ticker: inputMat.Ticker,
						amount: inputMat.Amount,
						costUnit: getPrice(inputMat.Ticker, "BUY"),
						costTotal:
							getPrice(inputMat.Ticker, "BUY") * inputMat.Amount,
					})
				).sort((a, b) => (a.ticker > b.ticker ? 1 : -1));

				const inputTotal: number = inputCost.reduce(
					(sum, current) => (sum += current.costTotal),
					0
				);

				const outputRevenue: number = ar.recipe.Outputs.reduce(
					(sum, current) =>
						(sum +=
							getPrice(current.Ticker, "SELL") * current.Amount),
					0
				);

				const totalCost: number =
					degradationShare + workforceCost + inputTotal;

				const sumOutputs: number = ar.recipe.Outputs.reduce(
					(sum, current) => (sum += current.Amount),
					0
				);

				const totalProfit: number = outputRevenue - totalCost;

				const outputCOGM: ICOGMMaterialReturn[] = ar.recipe.Outputs.map(
					(outputMat) => ({
						ticker: outputMat.Ticker,
						amount: outputMat.Amount,
						costSplit: totalCost / sumOutputs,
						costTotal: totalCost / outputMat.Amount,
					})
				).sort((a, b) => (a.ticker > b.ticker ? 1 : -1));

				ar.cogm = {
					visible: cxUuid.value !== undefined,
					runtime: ar.recipe.TimeMs / totalEfficiency,
					runtimeShare,
					efficiency: totalEfficiency,
					degradation,
					degradationShare,
					workforceCost,
					workforceCostTotal,
					inputCost,
					inputTotal,
					outputCOGM,
					totalCost,
					outputRevenue,
					totalProfit,
				} as IProductionBuildingRecipeCOGM;
			});

			const building: IProductionBuilding = {
				name: b.name,
				amount: b.amount,
				activeRecipes: activeRecipes,
				recipeOptions: recipeOptions,
				totalEfficiency: totalEfficiency,
				efficiencyElements: elements,
				totalBatchTime: totalBatchTime,
				constructionMaterials: constructionMaterials,
				constructionCost: constructionCost,
				workforceMaterials: workforceMaterials,
				workforceDailyCost: workforceDailyCost,
				dailyRevenue: 0,
			};

			// Calculating individual buildings daily contribution
			const productionMaterialIOEnhanced: IMaterialIO[] =
				enhanceMaterialIOMaterial(
					enhanceMaterialIOMinimal(calculateMaterialIO([building]))
				);

			const productionRevenue: number =
				productionMaterialIOEnhanced.reduce(
					(sum, element) => sum + element.price,
					0
				);

			// WorkforceDailyCost is just per Building, so need to multiply
			building.dailyRevenue =
				productionRevenue +
				workforceDailyCost * building.amount +
				(1 / 180) * constructionCost;

			buildings.push(building);
		});

		return {
			buildings: buildings,
			materialio: calculateMaterialIO(buildings),
		};
	}

	/**
	 * Holds a computed array of all the plans buildings to be constructed
	 * containing both production and infrastructure buildings
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<IBuildingConstruction[]>} All building construction information
	 */
	const constructionMaterials: ComputedRef<IBuildingConstruction[]> =
		computed(() => {
			const inf: IBuildingConstruction[] =
				infrastructureBuildingInformation.filter(
					(i) =>
						(result.value.infrastructure[
							i.ticker as INFRASTRUCTURE_TYPE
						] &&
							result.value.infrastructure[
								i.ticker as INFRASTRUCTURE_TYPE
							] > 0) ||
						i.ticker === "CM"
				);

			// Adjust map to add infrastructure building amounts
			inf.map(
				(i) =>
					(i.amount =
						i.ticker === "CM"
							? 1
							: result.value.infrastructure[
									i.ticker as INFRASTRUCTURE_TYPE
							  ])
			);

			return [
				...result.value.production.buildings.map((b) => ({
					ticker: b.name,
					materials: b.constructionMaterials,
					amount: b.amount,
				})),
				...inf,
			];
		});

	// result composing

	/**
	 * Combines all result calculations into a single result definition
	 * while also applying enhancements to data (e.g. prices on Material IO)
	 * and structures for further use.
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPlanResult>} Plan Calculation Result
	 */
	const result: ComputedRef<IPlanResult> = computed(() => {
		// inject a refresh key on data watching
		const _ = refreshKey.value;

		// pre-calculate individual results
		const corpHQResult = planet.value.corphq;
		const cogcResult = planet.value.cogc;

		const workforceResult: IWorkforceRecord = calculateWorkforceResult();
		const areaResult: IAreaResult = calculateAreaResult();
		const infrastructureResult: IInfrastructureRecord =
			calculateInfrastructureResult();
		const expertResult: IExpertRecord = calculateExpertResult();
		const productionResult: IProductionResult = calculateProduction(
			corpHQResult,
			cogcResult,
			workforceResult,
			expertResult
		);

		// get individual material IOs
		const workforceMaterialIO: IMaterialIOMinimal[] =
			calculateWorkforceConsumption(workforceResult);
		const productionMaterialIO: IMaterialIOMinimal[] =
			productionResult.materialio;

		// combine and enhance
		const combinedMaterialIOMinimal: IMaterialIOMinimal[] =
			combineMaterialIOMinimal([
				workforceMaterialIO,
				productionMaterialIO,
			]);
		const materialIOMaterial: IMaterialIOMaterial[] =
			enhanceMaterialIOMinimal(combinedMaterialIOMinimal);
		const materialIO: IMaterialIO[] =
			enhanceMaterialIOMaterial(materialIOMaterial);

		/**
		 * Revenue, profit and cost calculation
		 *
		 * Revenue: Material IO with positive Delta
		 * Cost: Material IO with negative delta + 1/180 of all buildings daily degradation
		 * Profit: Revenue - cost
		 */

		const materialCost: number = materialIO.reduce(
			(sum, element) =>
				sum + (element.delta < 0 ? element.price * -1 : 0),
			0
		);
		const materialRevenue: number = materialIO.reduce(
			(sum, element) => sum + (element.delta > 0 ? element.price : 0),
			0
		);
		const dailyDegradationCost: number =
			productionResult.buildings.reduce(
				(sum, element) =>
					sum + element.constructionCost * -1 * element.amount,
				0
			) *
			(1 / 180);

		const profit: number =
			materialRevenue - materialCost - dailyDegradationCost;

		const cost: number = materialCost + dailyDegradationCost;

		// patch-in to full result
		const resultData: IPlanResult = {
			corphq: corpHQResult,
			cogc: cogcResult,
			workforce: workforceResult,
			area: areaResult,
			infrastructure: infrastructureResult,
			experts: expertResult,
			production: productionResult,
			materialio: materialIO,
			workforceMaterialIO: enhanceMaterialIOMaterial(
				enhanceMaterialIOMinimal(workforceMaterialIO)
			),
			productionMaterialIO: enhanceMaterialIOMaterial(
				enhanceMaterialIOMinimal(productionMaterialIO)
			),
			profit: profit,
			cost: cost,
			revenue: materialRevenue,
		};

		return resultData;
	});

	/**
	 * Calculates the plans overview cost data
	 * @author jplacht
	 *
	 * @type {ComputedRef<IOverviewData>}
	 */
	const overviewData: ComputedRef<IOverviewData> = computed(() => {
		const dailyCost: number = result.value.materialio.reduce(
			(sum, current) => (sum += current.delta < 0 ? current.price : 0),
			0
		);
		const dailyProfit: number = result.value.materialio.reduce(
			(sum, current) => (sum += current.delta > 0 ? current.price : 0),
			0
		);

		// degradation
		const totalProductionConstructionCost: number =
			result.value.production.buildings.reduce(
				(sum, current) =>
					(sum += current.constructionCost * current.amount),
				0
			);

		const dailyDegradationCost: number =
			totalProductionConstructionCost / 180;

		const totalConstructionCost: number =
			constructionMaterials.value.reduce(
				(sum, current) =>
					(sum +=
						current.amount *
						current.materials.reduce(
							(infSum, infCurrent) =>
								(infSum +=
									getPrice(infCurrent.ticker, "BUY") *
									infCurrent.input),
							0
						)),
				0
			);

		const profit: number =
			dailyProfit - -1 * dailyDegradationCost - -1 * dailyCost;

		return {
			dailyCost: dailyCost * -1,
			dailyProfit: dailyProfit * 1,
			totalConstructionCost,
			dailyDegradationCost: dailyDegradationCost * -1,
			profit,
			roi: totalConstructionCost / profit,
		};
	});

	/**
	 * Calculates a plans visitation data
	 * @author jplacht
	 *
	 * @type {ComputedRef<IVisitationData>}
	 */
	const visitationData: ComputedRef<IVisitationData> = computed(() => {
		const totalStorage: number =
			1500 + 5000 * result.value.infrastructure.STO;

		const dailyWeightImport: number = result.value.materialio.reduce(
			(sum, e) => sum + (e.delta < 0 ? e.totalWeight * -1 : 0),
			0
		);
		const dailyWeightExport: number = result.value.materialio.reduce(
			(sum, e) => sum + (e.delta > 0 ? e.totalWeight : 0),
			0
		);
		const dailyVolumeImport: number = result.value.materialio.reduce(
			(sum, e) => sum + (e.delta < 0 ? e.totalVolume * -1 : 0),
			0
		);
		const dailyVolumeExport: number = result.value.materialio.reduce(
			(sum, e) => sum + (e.delta > 0 ? e.totalVolume : 0),
			0
		);
		const dailyWeightTotal: number = dailyWeightImport + dailyWeightExport;
		const dailyVolumeTotal: number = dailyVolumeImport + dailyVolumeExport;

		return {
			storageFilled: Math.max(
				Math.min(
					totalStorage / dailyWeightTotal,
					totalStorage / dailyVolumeTotal
				),
				0
			),
			dailyWeightImport: dailyWeightImport,
			dailyWeightExport: dailyWeightExport,
			dailyVolumeImport: dailyVolumeImport,
			dailyVolumeExport: dailyVolumeExport,
			dailyWeight: dailyWeightTotal,
			dailyVolume: dailyVolumeTotal,
		};
	});

	/**
	 * Prepares plans data to conform to the Patch or Put payload
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPlanCreateData>}
	 */
	const backendData: ComputedRef<IPlanCreateData> = computed(() => {
		return {
			name: planName.value ?? "missing name",
			planet_id: planet.value.planetid,
			faction: "NONE",
			override_empire: false,
			permits_used: 1,
			permits_total: 3,
			planet: planet.value,
			infrastructure: data.value.infrastructure,
			buildings: data.value.buildings,
			empire_uuid: empireUuid.value,
		};
	});

	// submodules
	const handlers = usePlanCalculationHandlers(planet, data, planName, result);

	return {
		existing,
		saveable,
		result,
		empires,
		backendData,
		planEmpires,
		planName,
		constructionMaterials,
		visitationData,
		overviewData,
		// precomputes
		computedActiveEmpire,
		// submodules
		...handlers,
		// internal,
		refreshKey,
	};
}
