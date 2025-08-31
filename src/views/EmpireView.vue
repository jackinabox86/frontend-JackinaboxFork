<script setup lang="ts">
	import {
		computed,
		ComputedRef,
		defineAsyncComponent,
		ref,
		Ref,
		toRef,
	} from "vue";

	// Unhead
	import { useHead } from "@unhead/vue";
	useHead({
		title: "Empire | PRUNplanner",
	});

	// Composables
	import { useQuery } from "@/lib/query_cache/useQuery";
	import { usePlanCalculation } from "@/features/planning/usePlanCalculation";
	import { useMaterialIOUtil } from "@/features/planning/util/materialIO.util";
	import { usePreferences } from "@/features/preferences/usePreferences";
	const { combineEmpireMaterialIO } = await useMaterialIOUtil();
	const { defaultEmpireUuid } = usePreferences();

	// Components
	import RenderingProgress from "@/layout/components/RenderingProgress.vue";
	import ComputingProgress from "@/layout/components/ComputingProgress.vue";
	import WrapperPlanningDataLoader from "@/features/wrapper/components/WrapperPlanningDataLoader.vue";
	import WrapperGameDataLoader from "@/features/wrapper/components/WrapperGameDataLoader.vue";
	import HelpDrawer from "@/features/help/components/HelpDrawer.vue";
	import EmpireMaterialIOFiltered from "@/features/empire/components/EmpireMaterialIOFiltered.vue";

	const AsyncEmpireCostOverview = defineAsyncComponent(
		() => import("@/features/empire/components/EmpireCostOverview.vue")
	);
	const AsyncEmpirePlanList = defineAsyncComponent(
		() => import("@/features/empire/components/EmpirePlanList.vue")
	);

	const AsyncEmpireConfiguration = defineAsyncComponent(
		() => import("@/features/empire/components/EmpireConfiguration.vue")
	);

	const AsyncWrapperGenericError = defineAsyncComponent(
		() => import("@/features/wrapper/components/WrapperGenericError.vue")
	);

	// Types & Interfaces
	import { IPlan, IPlanEmpireElement } from "@/stores/planningStore.types";
	import { IPlanResult } from "@/features/planning/usePlanCalculation.types";
	import {
		IEmpireCostOverview,
		IEmpirePlanListData,
		IEmpirePlanMaterialIO,
	} from "@/features/empire/empire.types";

	// UI
	import { PForm, PFormItem, PSelect, PButton } from "@/ui";
	import { NSpin } from "naive-ui";

	const props = defineProps({
		empireUuid: {
			type: String,
			required: false,
			default: undefined,
		},
	});

	const selectedEmpireUuid: Ref<string | undefined> = ref(
		props.empireUuid ? props.empireUuid : defaultEmpireUuid
	);
	const selectedCXUuid: Ref<string | undefined> = ref(undefined);
	const refEmpireList: Ref<IPlanEmpireElement[]> = ref([]);

	const calculatedPlans: Ref<Record<string, IPlanResult>> = ref({});
	const planData: Ref<IPlan[]> = ref([]);

	const isCalculating: Ref<boolean> = ref(true);
	const progressCurrent = ref(0);
	const progressTotal = ref(0);

	/**
	 * Calculates all given plans
	 * @author jplacht
	 *
	 * @async
	 * @returns {Promise<void>}
	 */

	async function calculateEmpire(): Promise<void> {
		isCalculating.value = true;

		calculatedPlans.value = {};
		progressTotal.value = planData.value.length;
		progressCurrent.value = 0;

		for (const plan of planData.value) {
			await Promise.resolve();

			const { calculate } = await usePlanCalculation(
				toRef(plan),
				selectedEmpireUuid,
				refEmpireList,
				selectedCXUuid
			);

			const result = await calculate();
			calculatedPlans.value[plan.uuid!] = result;

			progressCurrent.value++;

			// yield back to vue and update DOM
			await new Promise((r) => setTimeout(r, 0));
		}

		isCalculating.value = false;
	}

	/**
	 * Reloads empires forcefully by triggering store reload
	 * @author jplacht
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async function reloadEmpires(): Promise<void> {
		try {
			// make a forced call to also update store
			refEmpireList.value = await useQuery("GetAllEmpires").execute();
		} catch (err) {
			console.error("Error reloading empires", err);
		}
	}

	/**
	 * Holds computed empire data for the currently selected empire.
	 * @author jplacht
	 *
	 * @type {ComputedRef<IPlanEmpireElement | undefined>} Empire Data
	 */
	const selectedEmpire: ComputedRef<IPlanEmpireElement | undefined> =
		computed(() => {
			return refEmpireList.value.find(
				(e) => e.uuid == selectedEmpireUuid.value
			);
		});

	/**
	 * Holds computed cost overview based on plan results.
	 * @author jplacht
	 *
	 * @type {ComputedRef<IEmpireCostOverview>} Empire Cost overview
	 */
	const costOverview: ComputedRef<IEmpireCostOverview> = computed(() => {
		const totalProfit: number = Object.values(calculatedPlans.value).reduce(
			(sum, element) => sum + element.profit,
			0
		);
		const totalRevenue: number = Object.values(
			calculatedPlans.value
		).reduce((sum, element) => sum + element.revenue, 0);
		const totalCost: number = Object.values(calculatedPlans.value).reduce(
			(sum, element) => sum + element.cost,
			0
		);

		return {
			totalProfit,
			totalRevenue,
			totalCost,
		};
	});

	/**
	 * Holds computed empire name.
	 * @author jplacht
	 *
	 * @type {ComputedRef<string>} Empire Cost overview
	 */
	const empireName: ComputedRef<string> = computed(() => {
		if (selectedEmpire.value) {
			return selectedEmpire.value.name;
		}
		return "Unknown";
	});

	/**
	 * Holds computed empire plan data basic data.
	 * @author jplacht
	 *
	 * @type {ComputedRef<IEmpirePlanListData[]>} Plan List Data
	 */
	const planListData: ComputedRef<IEmpirePlanListData[]> = computed(() => {
		return Object.entries(calculatedPlans.value).map(
			([planUuid, planResult]) => {
				const plan: IPlan = planData.value.find(
					(p) => p.uuid == planUuid
				)!;

				return {
					uuid: planUuid,
					name: plan.name,
					planet: plan.baseplanner_data.planet.planetid,
					permits: plan.baseplanner_data.planet.permits,
					cogc: plan!.baseplanner_data.planet.cogc,
					profit: planResult.profit,
				};
			}
		);
	});

	/**
	 * Holds computed material i/o per plan with additional information.
	 * @author jplacht
	 *
	 * @type {ComputedRef<IEmpirePlanMaterialIO[]>} Empire Material IO Data
	 */
	const empireMaterialIO: ComputedRef<IEmpirePlanMaterialIO[]> = computed(
		() => {
			return Object.entries(calculatedPlans.value).map(
				([planUuid, planResult]) => {
					const plan: IPlan = planData.value.find(
						(p) => p.uuid == planUuid
					)!;
					return {
						planetId: plan.baseplanner_data.planet.planetid,
						planUuid: planUuid,
						planName: plan.name ?? "Unknown Plan Name",
						materialIO: planResult.materialio,
					};
				}
			);
		}
	);

	/**
	 * Holds computed empire options
	 *
	 * @author jplacht
	 */
	const empireOptions = computed(() =>
		refEmpireList.value.map((e) => {
			return {
				label: e.name,
				value: e.uuid,
			};
		})
	);

	const mainContent = ref<"materialio" | "analysis">("materialio");

	const switchText = computed(() =>
		mainContent.value === "materialio"
			? "Empire Analysis"
			: "Empire Material I/O"
	);

	// dafuq does Vite complain it would change a computed here?
	function switchMainContent(): void {
		mainContent.value =
			mainContent.value === "materialio" ? "analysis" : "materialio";
	}
</script>

<template>
	<WrapperPlanningDataLoader
		:key="`WrapperPlanningDataLoader#${selectedEmpireUuid}`"
		empire-list
		:empire-uuid="selectedEmpireUuid"
		@data:empire:plans="(value: IPlan[]) => (planData = value)"
		@update:empire-uuid="(value: string) => (selectedEmpireUuid = value)"
		@update:cx-uuid="
			(value: string | undefined) => (selectedCXUuid = value)
		"
		@data:empire:list="
			(value: IPlanEmpireElement[]) => (refEmpireList = value)
		">
		<template #default="{ empirePlanetList }">
			<WrapperGameDataLoader
				load-materials
				load-buildings
				load-recipes
				load-exchanges
				:load-planet-multiple="empirePlanetList"
				@complete="calculateEmpire">
				<AsyncWrapperGenericError
					v-if="refEmpireList.length === 0"
					message-title="No Empires"
					message-text="You don't have any empires. Head to Management to create your first." />

				<ComputingProgress
					v-else-if="isCalculating"
					:step="progressCurrent"
					:total="progressTotal"
					message="One does not simply calculate empire plans." />

				<div v-else>
					<div class="min-h-screen flex flex-col">
						<div
							class="px-6 py-3 border-b border-white/10 flex flex-row justify-between gap-x-3">
							<div class="flex flex-row gap-3">
								<h1 class="text-2xl font-bold my-auto">
									{{ empireName }}
								</h1>
								<n-spin v-if="isCalculating" :size="16" />
							</div>
							<div class="gap-3 flex flex-row flex-wrap">
								<PButton @click="switchMainContent">
									{{ switchText }}
								</PButton>
								<HelpDrawer file-name="empire" />
							</div>
						</div>

						<div
							class="flex-grow grid grid-cols-1 lg:grid-cols-[40%_auto] divide-x divide-white/10">
							<div>
								<div
									class="px-6 pb-3 pt-4 border-b border-white/10 my-auto">
									<PForm>
										<PFormItem label="Switch Empire">
											<PSelect
												v-model:value="
													selectedEmpireUuid
												"
												class="w-full"
												:options="empireOptions"
												@update-value="
													(value: string) => {
														selectedEmpireUuid =
															value;
														defaultEmpireUuid =
															value;
													}
												" />
										</PFormItem>
									</PForm>
								</div>
								<div class="p-6 border-b border-white/10">
									<AsyncEmpireCostOverview
										:cost-overview="costOverview" />
								</div>
								<div class="p-6 border-b border-white/10">
									<Suspense>
										<AsyncEmpirePlanList
											:plan-list-data="planListData" />
										<template #fallback>
											<RenderingProgress :height="200" />
										</template>
									</Suspense>
								</div>
								<div class="p-6 border-b border-white/10">
									<Suspense v-if="selectedEmpire">
										<AsyncEmpireConfiguration
											:data="selectedEmpire"
											@reload:empires="reloadEmpires" />
										<template #fallback>
											<RenderingProgress :height="200" />
										</template>
									</Suspense>
								</div>
							</div>
							<div class="p-6">
								<EmpireMaterialIOFiltered
									:content="mainContent"
									:empire-material-i-o="
										combineEmpireMaterialIO(
											empireMaterialIO
										)
									"
									:plan-list-data="planListData" />
							</div>
						</div>
					</div>
				</div>
			</WrapperGameDataLoader>
		</template>
	</WrapperPlanningDataLoader>
</template>
