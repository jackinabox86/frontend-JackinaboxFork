import { computed, reactive, ref, Ref, watch, watchEffect } from "vue";

// Stores & Repository
import { useQueryStore } from "@/lib/query_cache/queryStore";

// Util
import { inertClone } from "@/util/data";

// Types & Interfaces
import {
	GameDataLoaderEmits,
	GameDataLoaderProps,
	GameDataStepConfigsType,
} from "@/features/wrapper/gameDataLoader.types";
import { StepState } from "@/features/wrapper/dataLoader.types";
import {
	IBuilding,
	IExchange,
	IMaterial,
	IPlanet,
	IRecipe,
} from "@/features/api/gameData.types";

export function useGameDataLoader(
	props: GameDataLoaderProps,
	emits: GameDataLoaderEmits
) {
	const queryStore = useQueryStore();
	const done: Ref<boolean> = ref(false);

	const stepConfigs: GameDataStepConfigsType = [
		{
			key: "material",
			name: `Material Data`,
			enabled: () => !!props.loadMaterials,
			load: () => {
				return queryStore.execute("GetMaterials", undefined);
			},
			onSuccess: (d: IMaterial[]) => emits("data:materials", d),
		},
		{
			key: "exchange",
			name: `Exchange Data`,
			enabled: () => !!props.loadExchanges,
			load: () => {
				return queryStore.execute("GetExchanges", undefined);
			},
			onSuccess: (d: IExchange[]) => emits("data:exchanges", d),
		},
		{
			key: "building",
			name: `Building Data`,
			enabled: () => !!props.loadBuildings,
			load: () => {
				return queryStore.execute("GetBuildings", undefined);
			},
			onSuccess: (d: IBuilding[]) => emits("data:buildings", d),
		},
		{
			key: "recipe",
			name: `Recipe Data`,
			enabled: () => !!props.loadRecipes,
			load: () => {
				return queryStore.execute("GetRecipes", undefined);
			},
			onSuccess: (d: IRecipe[]) => emits("data:recipes", d),
		},
		{
			key: "planet",
			name: `Planet '${props.loadPlanet}' Data`,
			enabled: () => !!props.loadPlanet,
			load: () => {
				return queryStore.execute("GetPlanet", {
					planetNaturalId: props.loadPlanet!,
				});
			},
			onSuccess: (d: IPlanet) => emits("data:planet", d),
		},
		{
			key: "planetMultiple",
			name: `Planet '${props.loadPlanetMultiple?.join(", ")}' Data`,
			enabled: () => !!props.loadPlanetMultiple,
			load: () => {
				return queryStore.execute("GetMultiplePlanets", {
					planetNaturalIds: props.loadPlanetMultiple!,
				});
			},
			onSuccess: (d: IPlanet[]) => emits("data:planet:multiple", d),
		},
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const steps = reactive<StepState<any>[]>(
		stepConfigs.map((cfg) => ({
			cfg,
			data: null,
			loading: false,
			error: null,
			triggered: false,
		}))
	);

	// Orchestrator
	watchEffect(() => {
		steps.forEach((s) => {
			if (!s.triggered && s.cfg.enabled()) {
				const dep = s.cfg.dependsOn
					? steps.find((p) => p.cfg.key === s.cfg.dependsOn)
					: null;
				if (!dep || dep.data != null) {
					s.triggered = true;
					s.loading = true;
					s.error = null;
					s.cfg
						.load()
						.then((d) => {
							const shallowData = inertClone(d);
							s.data = shallowData;
							s.cfg.onSuccess(shallowData);
						})
						.catch((e) => {
							console.error(e);
							s.error =
								e instanceof Error ? e : new Error(String(e));
						})
						.finally(() => {
							s.loading = false;
						});
				}
			}
		});
	});

	const loadingSteps = computed(() =>
		steps
			.filter((s) => s.cfg.enabled())
			.map((s) => ({
				name: s.cfg.name,
				loading: s.loading,
				error: s.error,
			}))
	);

	const hasError = computed(() =>
		loadingSteps.value.some((l) => l.error != null)
	);

	const allLoaded = computed(() =>
		steps
			.filter((s) => s.cfg.enabled())
			.every((s) => !s.loading && s.error == null && s.data != null)
	);

	watch(
		allLoaded,
		(ok) => {
			if (ok) {
				emits("complete");
				done.value = true;
			}
		},
		{ immediate: true }
	);

	const results = computed(() => {
		const data = {
			materialData: steps.find((s) => s.cfg.key === "material")
				?.data as IMaterial[],
			exchangeData: steps.find((s) => s.cfg.key === "exchange")
				?.data as IExchange[],
			buildingData: steps.find((s) => s.cfg.key === "building")
				?.data as IBuilding[],
			recipeData: steps.find((s) => s.cfg.key === "recipe")
				?.data as IRecipe[],
			planetData: steps.find((s) => s.cfg.key === "planet")
				?.data as IPlanet,
			planetMultipleData: steps.find(
				(s) => s.cfg.key === "planetMultiple"
			)?.data as IPlanet[],
		};

		return data;
	});

	return {
		done,
		allLoaded,
		hasError,
		loadingSteps,
		results,
	};
}
