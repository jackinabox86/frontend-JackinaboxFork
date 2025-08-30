import { IQueryDefinition } from "@/lib/query_cache/queryCache.types";

// config
import config from "@/lib/config";

// stores
import { useQueryStore } from "@/lib/query_cache/queryStore";
import { useGameDataStore } from "@/stores/gameDataStore";
import { usePlanningStore } from "@/stores/planningStore";
import { useUserStore } from "@/stores/userStore";

// indexeddb
import {
	materialsStore,
	planetsStore,
	exchangesStore,
	recipesStore,
	buildingsStore,
} from "@/database/stores";
import { useDB } from "@/database/composables/useDB";

// API Calls
import {
	callDataBuildings,
	callDataExchanges,
	callDataFIOSites,
	callDataFIOStorage,
	callDataMaterials,
	callDataMultiplePlanets,
	callDataPlanet,
	callDataPlanetSearch,
	callDataPlanetSearchSingle,
	callDataRecipes,
	callExplorationData,
	callPlanetLastPOPR,
} from "@/features/api/gameData.api";
import {
	callClonePlan,
	callCreatePlan,
	callDeletePlan,
	callGetPlan,
	callGetPlanlist,
	callGetShared,
	callPatchPlanMaterialIO,
	callSavePlan,
} from "@/features/api/planData.api";
import {
	callCreateEmpire,
	callDeleteEmpire,
	callGetEmpireList,
	callGetEmpirePlans,
	callPatchEmpire,
	callPatchEmpirePlanJunctions,
} from "@/features/api/empireData.api";
import {
	callCreateCX,
	callDeleteCX,
	callGetCXList,
	callPatchCX,
	callUpdateCXJunctions,
} from "@/features/api/cxData.api";
import {
	callCreateSharing,
	callDeleteSharing,
	callGetSharedList,
} from "@/features/api/sharingData.api";

// Types & Interfaces
import { IQueryRepository } from "@/lib/query_cache/queryRepository.types";

import {
	IBuilding,
	IExchange,
	IFIOSites,
	IFIOStorage,
	IMaterial,
	IPlanet,
	IPlanetSearchAdvanced,
	IPopulationReport,
	IRecipe,
} from "@/features/api/gameData.types";

import {
	ICXEmpireJunction,
	IPlanCloneResponse,
	IPlanEmpireJunction,
} from "@/features/manage/manage.types";
import {
	ICX,
	ICXData,
	IPlan,
	IPlanEmpire,
	IPlanEmpireElement,
	IPlanShare,
} from "@/stores/planningStore.types";

import {
	IShared,
	ISharedCreateResponse,
} from "@/features/api/sharingData.types";

import {
	IExploration,
	IExplorationRequestPayload,
} from "@/features/market_exploration/marketExploration.types";
import {
	IEmpireCreatePayload,
	IEmpirePatchPayload,
} from "@/features/empire/empire.types";
import {
	IPlanCreateData,
	IPlanPatchMaterialIOElement,
	IPlanSaveData,
} from "@/features/planning_data/usePlan.types";
import { PlanSaveCreateResponseType } from "@/features/api/schemas/planningData.schemas";
import {
	IOptimizeHabitationPayload,
	IOptimizeHabitationResponse,
} from "@/features/api/schemas/optimize.schemas";
import { callOptimizeHabitation } from "@/features/api/optimize.api";
import {
	callChangePassword,
	callPatchProfile,
	callResendEmailVerification,
	callVerifyEmail,
} from "@/features/api/userData.api";
import {
	IUserChangePasswordPayload,
	IUserProfile,
	IUserProfilePatch,
	IUserVerifyEmailPayload,
} from "@/features/api/userData.types";

export function useQueryRepository() {
	const queryStore = useQueryStore();
	const gameDataStore = useGameDataStore();
	const planningStore = usePlanningStore();
	const userStore = useUserStore();

	const repository: IQueryRepository = {
		GetMaterials: {
			key: () => ["gamedata", "materials"],
			fetchFn: async () => {
				const data: IMaterial[] = await callDataMaterials();

				// set in indexeddb
				await materialsStore.setMany(data, true);
				await useDB(materialsStore).preload(true);

				return data;
			},
			autoRefetch: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_MATERIALS,
			persist: true,
		} as IQueryDefinition<undefined, IMaterial[]>,
		GetExchanges: {
			key: () => ["gamedata", "exchanges"],
			fetchFn: async () => {
				const data: IExchange[] = await callDataExchanges();
				gameDataStore.setExchanges(data);

				// set in indexeddb
				await exchangesStore.setMany(data, true);
				await useDB(exchangesStore).preload(true);

				return data;
			},
			autoRefetch: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_EXCHANGES,
			persist: true,
		} as IQueryDefinition<undefined, IExchange[]>,
		GetRecipes: {
			key: () => ["gamedata", "recipes"],
			fetchFn: async () => {
				const data: IRecipe[] = await callDataRecipes();
				// set in indexeddb
				await recipesStore.setMany(data, true);
				await useDB(recipesStore).preload(true);
				return data;
			},
			autoRefetch: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_RECIPES,
			persist: true,
		} as IQueryDefinition<undefined, IRecipe[]>,
		GetBuildings: {
			key: () => ["gamedata", "buildings"],
			fetchFn: async () => {
				const data: IBuilding[] = await callDataBuildings();
				// set in indexeddb
				await buildingsStore.setMany(data, true);
				await useDB(buildingsStore).preload(true);
				return data;
			},
			autoRefetch: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_BUILDINGS,
			persist: true,
		} as IQueryDefinition<undefined, IBuilding[]>,
		GetPlanet: {
			key: (params: { planetNaturalId: string }) => [
				"gamedata",
				"planet",
				params.planetNaturalId,
			],
			fetchFn: async (params: { planetNaturalId: string }) => {
				const data: IPlanet = await callDataPlanet(
					params.planetNaturalId
				);

				// set in indexeddb
				await planetsStore.set(data);
				await useDB(planetsStore).preload(true);

				return data;
			},
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
			autoRefetch: true,
			persist: true,
		} as IQueryDefinition<{ planetNaturalId: string }, IPlanet>,
		GetMultiplePlanets: {
			key: (params: { planetNaturalIds: string[] }) => [
				"gamedata",
				"planet",
				"multiple",
				params.planetNaturalIds,
			],
			fetchFn: async (params: { planetNaturalIds: string[] }) => {
				try {
					const data: IPlanet[] = await callDataMultiplePlanets(
						params.planetNaturalIds
					);

					// set in indexeddb
					await planetsStore.setMany(data);
					await useDB(planetsStore).preload(true);

					// set plans individually
					data.forEach((p) => {
						queryStore.addCacheState(
							["gamedata", "planet", p.PlanetNaturalId],
							"GetPlanet",
							{ planetNaturalId: p.PlanetNaturalId },
							p
						);
					});

					return data;
				} catch {
					return [];
				}
			},
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
			autoRefetch: true,
			persist: true,
		} as IQueryDefinition<{ planetNaturalIds: string[] }, IPlanet[]>,
		GetPlanetSearchSingle: {
			key: (params: { searchId: string }) => [
				"gamedata",
				"planet",
				"search",
				params.searchId,
			],
			fetchFn: async (params: { searchId: string }) => {
				const data = await callDataPlanetSearchSingle(params.searchId);

				await planetsStore.setMany(data);
				await useDB(planetsStore).preload(true);

				return data;
			},
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
			persist: true,
			autoRefetch: false,
		} as IQueryDefinition<{ searchId: string }, IPlanet[]>,
		PostPlanetSearch: {
			key: (params: { searchData: IPlanetSearchAdvanced }) => [
				"gamedata",
				"planet",
				"search",
				params.searchData,
			],
			fetchFn: async (params: { searchData: IPlanetSearchAdvanced }) => {
				const data = await callDataPlanetSearch(params.searchData);

				await planetsStore.setMany(data);
				await useDB(planetsStore).preload(true);

				return data;
			},
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
			persist: true,
			autoRefetch: false,
		} as IQueryDefinition<{ searchData: IPlanetSearchAdvanced }, IPlanet[]>,
		GetSharedPlan: {
			key: (params: { sharedPlanUuid: string }) => [
				"planningdata",
				"shared",
				params.sharedPlanUuid,
			],
			fetchFn: async (params: { sharedPlanUuid: string }) => {
				return await callGetShared(params.sharedPlanUuid);
			},
			persist: true,
			autoRefetch: false,
			expireTime: 10_000,
		} as IQueryDefinition<{ sharedPlanUuid: string }, IPlanShare>,
		GetAllShared: {
			key: () => ["planningdata", "shared", "list"],
			fetchFn: async () => {
				const data = await callGetSharedList();
				planningStore.setSharedList(data);
				return data;
			},
			persist: true,
			autoRefetch: true,
			expireTime: 60_000 * 60,
		} as IQueryDefinition<void, IShared[]>,
		DeleteSharedPlan: {
			key: (params: { sharedUuid: string }) => [
				"planningdata",
				"shared",
				"delete",
				params.sharedUuid,
			],
			fetchFn: async (params: { sharedUuid: string }) => {
				const data = await callDeleteSharing(params.sharedUuid);
				await queryStore.invalidateKey(["planningdata", "shared"], {
					exact: false,
					skipRefetch: true,
				});
				return data;
			},
			persist: false,
			autoRefetch: false,
		} as IQueryDefinition<{ sharedUuid: string }, boolean>,
		CreateSharedPlan: {
			key: (params: { planUuid: string }) => [
				"planningdata",
				"shared",
				"create",
				params.planUuid,
			],
			fetchFn: async (params: { planUuid: string }) => {
				await queryStore.invalidateKey(["planningdata", "shared"], {
					exact: false,
					skipRefetch: true,
				});
				return await callCreateSharing(params.planUuid);
			},
			persist: false,
			autoRefetch: false,
		} as IQueryDefinition<{ planUuid: string }, ISharedCreateResponse>,
		CreateEmpire: {
			key: () => ["planningdata", "empire", "create"],
			fetchFn: async (params: { data: IEmpireCreatePayload }) => {
				const data = await callCreateEmpire(params.data);
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ data: IEmpireCreatePayload }, IPlanEmpire>,
		DeleteEmpire: {
			key: (params: { empireUuid: string }) => [
				"planningdata",
				"empire",
				"delete",
				params.empireUuid,
			],
			fetchFn: async (params: { empireUuid: string }) => {
				const data = await callDeleteEmpire(params.empireUuid);
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ empireUuid: string }, boolean>,
		PatchEmpireCXJunctions: {
			key: () => ["planningdata", "empire", "cx", "junctions"],
			fetchFn: async (params: { junctions: ICXEmpireJunction[] }) => {
				const data = await callUpdateCXJunctions(params.junctions);
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				await queryStore.invalidateKey(["planningdata", "cx"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ junctions: ICXEmpireJunction[] }, ICX[]>,
		PatchCX: {
			key: (params: { cxUuid: string }) => [
				"planningdata",
				"cx",
				"patch",
				params.cxUuid,
			],
			fetchFn: async (params: { cxUuid: string; data: ICXData }) => {
				const data = await callPatchCX(params.cxUuid, params.data);
				await queryStore.invalidateKey(["planningdata", "cx"], {
					exact: false,
				});

				planningStore.setCX(params.cxUuid, data);

				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ cxUuid: string; data: ICXData }, ICXData>,
		GetAllEmpires: {
			key: () => ["planningdata", "empire", "list"],
			fetchFn: async () => {
				const data = await callGetEmpireList();
				planningStore.setEmpires(data);
				return data;
			},
			autoRefetch: false,
			persist: true,
		} as IQueryDefinition<void, IPlanEmpireElement[]>,
		GetEmpirePlans: {
			key: (params: { empireUuid: string }) => [
				"planningdata",
				"empire",
				"plans",
				params.empireUuid,
			],
			fetchFn: async (params: { empireUuid: string }) => {
				try {
					const data = await callGetEmpirePlans(params.empireUuid);
					planningStore.setPlans(data);

					// manually set individual plans
					data.forEach((p) =>
						queryStore.addCacheState(
							["planningdata", "plan", p.uuid],
							"GetPlan",
							{ planUuid: p.uuid! },
							p
						)
					);

					return data;
				} catch {
					return [];
				}
			},
			autoRefetch: false,
			persist: true,
		} as IQueryDefinition<{ empireUuid: string }, IPlan[]>,
		PatchEmpire: {
			key: (params: { empireUuid: string }) => [
				"planningdata",
				"empire",
				"patch",
				params.empireUuid,
			],
			fetchFn: async (params: {
				empireUuid: string;
				data: IEmpirePatchPayload;
			}) => {
				const data = await callPatchEmpire(
					params.empireUuid,
					params.data
				);
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<
			{ empireUuid: string; data: IEmpirePatchPayload },
			IPlanEmpire
		>,
		PatchEmpirePlanJunctions: {
			key: () => ["planningdata", "empire", "plan", "junctions"],
			fetchFn: async (params: { junctions: IPlanEmpireJunction[] }) => {
				const data = await callPatchEmpirePlanJunctions(
					params.junctions
				);

				// invalidate empires + all plans as junctions might have changed
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				await queryStore.invalidateKey(["planningdata", "plan"], {
					exact: false,
				});

				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<
			{ junctions: IPlanEmpireJunction[] },
			IPlanEmpireElement[]
		>,
		CreateCX: {
			key: () => ["planningdata", "cx", "create"],
			fetchFn: async (params: { cxName: string }) => {
				const data = await callCreateCX(params.cxName);
				await queryStore.invalidateKey(["planningdata", "cx"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ cxName: string }, ICX>,
		DeleteCX: {
			key: (params: { cxUuid: string }) => [
				"planningdata",
				"cx",
				"delete",
				params.cxUuid,
			],
			fetchFn: async (params: { cxUuid: string }) => {
				const data = await callDeleteCX(params.cxUuid);
				await queryStore.invalidateKey(["planningdata", "cx"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ cxUuid: string }, boolean>,
		GetAllCX: {
			key: () => ["planningdata", "cx"],
			fetchFn: async () => {
				const data = await callGetCXList();
				planningStore.setCXs(data);
				return data;
			},
			autoRefetch: false,
			persist: true,
		} as IQueryDefinition<void, ICX[]>,
		GetPlan: {
			key: (params: { planUuid: string }) => [
				"planningdata",
				"plan",
				params.planUuid,
			],
			fetchFn: async (params: { planUuid: string }) => {
				const data = await callGetPlan(params.planUuid);
				planningStore.setPlan(data);
				return data;
			},
			autoRefetch: false,
			persist: true,
		} as IQueryDefinition<{ planUuid: string }, IPlan>,
		GetAllPlans: {
			key: () => ["planningdata", "plan", "list"],
			fetchFn: async () => {
				try {
					const data = await callGetPlanlist();
					planningStore.setPlans(data);

					// manually set individual plans
					data.forEach((p) =>
						queryStore.addCacheState(
							["planningdata", "plan", p.uuid],
							"GetPlan",
							{ planUuid: p.uuid! },
							p
						)
					);

					return data;
				} catch {
					return [];
				}
			},
			autoRefetch: false,
			persist: true,
		} as IQueryDefinition<void, IPlan[]>,
		ClonePlan: {
			key: (params: { planUuid: string; cloneName: string }) => [
				"planningdata",
				"plan",
				"clone",
				params.planUuid,
			],
			fetchFn: async (params: {
				planUuid: string;
				cloneName: string;
			}) => {
				return await callClonePlan(
					params.planUuid,
					params.cloneName
				).then(async () => {
					await queryStore.invalidateKey(["planningdata", "empire"], {
						exact: false,
					});
					await queryStore.invalidateKey([
						"planningdata",
						"plan",
						"list",
					]);
				});
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<
			{ planUuid: string; cloneName: string },
			IPlanCloneResponse
		>,
		DeletePlan: {
			key: (params: { planUuid: string }) => [
				"planningdata",
				"plan",
				"delete",
				params.planUuid,
			],
			fetchFn: async (params: { planUuid: string }) => {
				return await callDeletePlan(params.planUuid).then(async () => {
					await queryStore.invalidateKey(["planningdata", "empire"], {
						exact: false,
					});
					await queryStore.invalidateKey([
						"planningdata",
						"plan",
						"list",
					]);
					await queryStore.invalidateKey([
						"planningdata",
						"plan",
						params.planUuid,
					]);
					planningStore.deletePlan(params.planUuid);
				});
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ planUuid: string }, boolean>,
		CreatePlan: {
			key: () => ["planningdata", "plan", "create"],
			fetchFn: async (params: { data: IPlanCreateData }) => {
				const data = await callCreatePlan(params.data);
				await queryStore.invalidateKey(["planningdata", "plan"], {
					exact: false,
				});
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<
			{ data: IPlanCreateData },
			PlanSaveCreateResponseType
		>,
		PatchPlan: {
			key: (params: { planUuid: string }) => [
				"planningdata",
				"plan",
				"patch",
				params.planUuid,
			],
			fetchFn: async (params: {
				planUuid: string;
				data: IPlanSaveData;
			}) => {
				const data = await callSavePlan(params.planUuid, params.data);
				await queryStore.invalidateKey(["planningdata", "plan"], {
					exact: false,
				});
				await queryStore.invalidateKey(["planningdata", "empire"], {
					exact: false,
				});
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<
			{ planUuid: string; data: IPlanSaveData },
			PlanSaveCreateResponseType
		>,
		PatchMaterialIO: {
			key: () => ["planningdata", "materialio", "patch"],
			fetchFn: async (params: {
				data: IPlanPatchMaterialIOElement[];
			}) => {
				return await callPatchPlanMaterialIO(params.data);
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<{ data: IPlanPatchMaterialIOElement[] }, boolean>,
		GetExplorationData: {
			key: (params: {
				exchangeTicker: string;
				materialTicker: string;
				payload: IExplorationRequestPayload;
			}) => [
				"gamedata",
				"marketexploration",
				params.exchangeTicker,
				params.materialTicker,
				params.payload.start,
				params.payload.end,
			],
			fetchFn: async (params: {
				exchangeTicker: string;
				materialTicker: string;
				payload: IExplorationRequestPayload;
			}) => {
				return await callExplorationData(
					params.exchangeTicker,
					params.materialTicker,
					params.payload
				);
			},
			autoRefetch: false,
			persist: true,
			expireTime: 60_000 * 15, // 15 minutes,
		} as IQueryDefinition<
			{
				exchangeTicker: string;
				materialTicker: string;
				payload: IExplorationRequestPayload;
			},
			IExploration[]
		>,
		GetFIOStorage: {
			key: () => ["gamedata", "fio", "storage"],
			fetchFn: async () => {
				return await callDataFIOStorage().then((data: IFIOStorage) => {
					gameDataStore.setFIOStorageData(data);
					return data;
				});
			},
			autoRefetch: true,
			persist: true,
			expireTime: 60_000 * 15, // 15 minutes
		} as IQueryDefinition<void, IFIOStorage>,
		GetFIOSites: {
			key: () => ["gamedata", "fio", "sites"],
			fetchFn: async () => {
				return await callDataFIOSites().then((data: IFIOSites) => {
					gameDataStore.setFIOSitesData(data);
					return data;
				});
			},
			autoRefetch: true,
			persist: true,
			expireTime: 60_000 * 15, // 15 minutes
		} as IQueryDefinition<void, IFIOSites>,
		GetPlanetLastPOPR: {
			key: (params: { planetNaturalId: string }) => [
				"gamedata",
				"planet",
				"popr",
				"last",
				params.planetNaturalId,
			],
			fetchFn: async (params: { planetNaturalId: string }) => {
				return await callPlanetLastPOPR(params.planetNaturalId);
			},
			autoRefetch: false,
			persist: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
		} as IQueryDefinition<{ planetNaturalId: string }, IPopulationReport>,
		OptimizeHabitation: {
			key: (params: IOptimizeHabitationPayload) => [
				"planningdata",
				"optimize",
				"habitation",
				params,
			],
			fetchFn: async (params: IOptimizeHabitationPayload) => {
				return await callOptimizeHabitation(params);
			},
			autoRefetch: false,
			persist: true,
			expireTime: 60_000 * config.GAME_DATA_STALE_MINUTES_PLANETS,
		} as IQueryDefinition<
			IOptimizeHabitationPayload,
			IOptimizeHabitationResponse
		>,
		PatchUserProfile: {
			key: () => ["user", "profile", "patch"],
			fetchFn: async (params: IUserProfilePatch) => {
				const data = await callPatchProfile(params);
				await userStore.performGetProfile();
				return data;
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<IUserProfilePatch, IUserProfile>,
		PostUserResendEmailVerification: {
			key: () => ["user", "verification", "resend"],
			fetchFn: async () => {
				return await callResendEmailVerification();
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<null, boolean>,
		PatchUserChangePassword: {
			key: () => ["user", "password", "patch"],
			fetchFn: async (params: IUserChangePasswordPayload) => {
				// we skip the actual message just to have a boolean
				try {
					await callChangePassword(params);
					return true;
				} catch {
					return false;
				}
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<IUserChangePasswordPayload, boolean>,
		PostUserVerifyEmail: {
			key: () => ["user", "verification", "check"],
			fetchFn: async (params: IUserVerifyEmailPayload) => {
				try {
					const response = await callVerifyEmail(params);
					if (response.status_code === 200) return true;
					return false;
				} catch {
					return false;
				}
			},
			autoRefetch: false,
			persist: false,
		} as IQueryDefinition<IUserVerifyEmailPayload, boolean>,
	};

	return {
		repository,
	};
}
