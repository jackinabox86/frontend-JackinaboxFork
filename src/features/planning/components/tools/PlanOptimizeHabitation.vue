<script setup lang="ts">
	import {
		computed,
		ComputedRef,
		onMounted,
		PropType,
		Ref,
		ref,
		watch,
	} from "vue";

	// Composables
	import { useQuery } from "@/lib/query_cache/useQuery";

	// Types & Interfaces
	import {
		INFRASTRUCTURE_TYPE,
		IWorkforceRecord,
	} from "@/features/planning/usePlanCalculation.types";
	import { IInfrastructureCosts } from "@/features/cx/usePrice.types";
	import {
		IOptimizeHabitationPayload,
		IOptimizeHabitationResponse,
	} from "@/features/api/schemas/optimize.schemas";

	// Util
	import { formatNumber, formatAmount } from "@/util/numbers";

	// UI
	import { PButton, PTable } from "@/ui";
	import { CloseSharp } from "@vicons/material";

	const props = defineProps({
		workforceData: {
			type: Object as PropType<IWorkforceRecord>,
			required: true,
		},
		habitationCost: {
			type: Object as PropType<IInfrastructureCosts>,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "close"): void;
		(
			e: "update:habitation",
			payload: { infrastructure: INFRASTRUCTURE_TYPE; value: number }
		): void;
	}>();

	const totalWorkforce: ComputedRef<number> = computed(
		() =>
			props.workforceData.pioneer.required +
			props.workforceData.settler.required +
			props.workforceData.technician.required +
			props.workforceData.engineer.required +
			props.workforceData.scientist.required
	);

	const optimizePayload: ComputedRef<IOptimizeHabitationPayload> = computed(
		() => {
			return {
				pioneer: props.workforceData.pioneer.required,
				settler: props.workforceData.settler.required,
				technician: props.workforceData.technician.required,
				engineer: props.workforceData.engineer.required,
				scientist: props.workforceData.scientist.required,
				cost_HB1: props.habitationCost.HB1,
				cost_HB2: props.habitationCost.HB2,
				cost_HB3: props.habitationCost.HB3,
				cost_HB4: props.habitationCost.HB4,
				cost_HB5: props.habitationCost.HB5,
				cost_HBB: props.habitationCost.HBB,
				cost_HBC: props.habitationCost.HBC,
				cost_HBM: props.habitationCost.HBM,
				cost_HBL: props.habitationCost.HBL,
			};
		}
	);

	const payloadChanged: Ref<boolean> = ref(false);

	watch(
		() => optimizePayload.value,
		() => {
			payloadChanged.value = true;
		}
	);

	const habitationBuildings: string[] = [
		"HB1",
		"HB2",
		"HB3",
		"HB4",
		"HB5",
		"HBB",
		"HBC",
		"HBM",
		"HBL",
	];

	const responseData: Ref<IOptimizeHabitationResponse | null> = ref(null);
	const isLoading: Ref<boolean> = ref(true);
	const hasError: Ref<boolean> = ref(false);

	async function fetchData(
		payload: IOptimizeHabitationPayload
	): Promise<void> {
		isLoading.value = true;
		hasError.value = false;

		// check so that there is a workforce requirement
		if (totalWorkforce.value === 0) return;

		await useQuery("OptimizeHabitation", payload)
			.execute()
			.then((result: IOptimizeHabitationResponse) => {
				responseData.value = result;
			})
			.catch((error) => {
				console.error(error);
				hasError.value = true;
			})
			.finally(() => {
				payloadChanged.value = false;
				isLoading.value = false;
			});
	}

	onMounted(() => fetchData(optimizePayload.value));
</script>

<template>
	<div class="pb-3 flex flex-row justify-between child:my-auto">
		<h2 class="text-white/80 font-bold text-lg">Optimize Habitation</h2>
		<div class="flex flex-row gap-3 child:!my-auto">
			<PButton
				:disabled="!payloadChanged"
				@click="fetchData(optimizePayload)">
				Recalculate
			</PButton>
			<PButton size="sm" type="secondary" @click="emit('close')">
				<template #icon><CloseSharp /></template>
			</PButton>
		</div>
	</div>
	<div>
		<div v-if="totalWorkforce === 0" class="text-center pb-3 text-negative">
			There must be required workforce to optimize habitations.
		</div>
		<div v-else-if="isLoading" class="text-center pb-3">
			Calculating optimal habitations.
		</div>
		<div v-else-if="hasError" class="text-center pb-3 text-negative">
			Error getting optimization data.
		</div>
	</div>
	<div
		v-if="responseData && !hasError"
		class="grid grid-cols-1 xl:grid-cols-[40%_auto] gap-3">
		<div>
			<PTable>
				<thead>
					<tr>
						<th></th>
						<th>Optimal Area</th>
						<th>Optimal Cost</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Area</td>
						<td>
							{{
								formatAmount(
									responseData.optimize_area.min_area
								)
							}}
						</td>
						<td>
							{{
								formatAmount(
									responseData.optimize_cost.min_area
								)
							}}
						</td>
					</tr>
					<tr>
						<td>Cost</td>
						<td>
							{{
								formatNumber(
									responseData.optimize_area.min_cost
								)
							}}
							<span class="font-light text-white/50">$</span>
						</td>
						<td>
							{{
								formatNumber(
									responseData.optimize_cost.min_cost
								)
							}}
							<span class="font-light text-white/50">$</span>
						</td>
					</tr>
					<tr>
						<td>Cost / Area</td>
						<td>
							{{
								formatNumber(
									responseData.optimize_area.min_cost /
										responseData.optimize_area.min_area
								)
							}}
							<span class="font-light text-white/50">$</span>
						</td>
						<td>
							{{
								formatNumber(
									responseData.optimize_cost.min_cost /
										responseData.optimize_cost.min_area
								)
							}}
							<span class="font-light text-white/50">$</span>
						</td>
					</tr>
					<tr>
						<td>Δ Area</td>
						<td colspan="2">
							{{ formatAmount(responseData.difference_area) }}
						</td>
					</tr>
					<tr>
						<td>Δ Cost</td>
						<td colspan="2">
							{{ formatNumber(responseData.difference_cost) }}
							<span class="font-light text-white/50">$</span>
						</td>
					</tr>
					<tr>
						<td></td>
						<td>
							<PButton
								@click="
									() => {
										if (!responseData) return;

										habitationBuildings.map((ticker) => {
											emit('update:habitation', {
												infrastructure: ticker as INFRASTRUCTURE_TYPE,
												value: responseData!.optimize_area
													[ticker],
											});
										})
									}
								">
								Apply Area
							</PButton>
						</td>
						<td>
							<PButton
								@click="
									() => {
										if (!responseData) return;

										habitationBuildings.map((ticker) => {
											emit('update:habitation', {
												infrastructure: ticker as INFRASTRUCTURE_TYPE,
												value: responseData!.optimize_cost
													[ticker],
											});
										})
									}
								">
								Apply Cost
							</PButton>
						</td>
					</tr>
				</tbody>
			</PTable>

			<div class="text-white/50 py-3">
				Habitation optimization leverages the workforce requirements of
				your plan to determine an optimal solution that fulfills the
				specified amounts for each workforce category. This process
				involves two distinct analyses: one focuses on minimizing the
				area usage, while the other minimizes the cost associated with
				building the required habitations.
			</div>
		</div>
		<div>
			<PTable striped>
				<thead>
					<tr>
						<th>Infrastructure</th>
						<th class="!text-center">Optimal Area</th>
						<th class="!text-center">Optimal Cost</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="ticker in habitationBuildings"
						:key="`OPTIMIZE#${ticker}`">
						<td>{{ ticker }}</td>
						<td
							class="text-center"
							:class="
								responseData.optimize_area[ticker] <= 0
									? '!text-white/20'
									: ''
							">
							{{
								formatAmount(responseData.optimize_area[ticker])
							}}
						</td>
						<td
							class="text-center"
							:class="
								responseData.optimize_cost[ticker] <= 0
									? '!text-white/20'
									: ''
							">
							{{
								formatAmount(responseData.optimize_cost[ticker])
							}}
						</td>
					</tr>
				</tbody>
			</PTable>
		</div>
	</div>
</template>
