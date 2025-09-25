<script setup lang="ts">
	import { computed, ComputedRef, PropType } from "vue";
	import { trackEvent } from "@/lib/analytics/useAnalytics";

	// Utils
	import { capitalizeString } from "@/util/text";
	import { formatAmount, formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import {
		IWorkforceRecord,
		WORKFORCE_TYPE,
	} from "@/features/planning/usePlanCalculation.types";

	// UI
	import { PButton, PTable } from "@/ui";
	import { CheckSharp, RadioButtonUncheckedSharp } from "@vicons/material";

	const props = defineProps({
		disabled: {
			type: Boolean,
			required: true,
		},
		workforceData: {
			type: Object as PropType<IWorkforceRecord>,
			required: true,
		},
		planetNaturalId: {
			type: String,
			required: true,
		},
	});

	const emit = defineEmits<{
		(
			e: "update:lux",
			workforce: WORKFORCE_TYPE,
			luxType: "lux1" | "lux2",
			value: boolean
		): void;
	}>();

	// Local State
	const localWorkforceData: ComputedRef<IWorkforceRecord> = computed(
		() => props.workforceData
	);
</script>

<template>
	<PTable striped>
		<thead>
			<tr>
				<th>Type</th>
				<th>Req.</th>
				<th>Capa</th>
				<th>Open</th>
				<th class="!text-center">L1</th>
				<th class="!text-center">L2</th>
				<th class="!text-end">%Eff</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="workforce in localWorkforceData" :key="workforce.name">
				<td class="font-bold">
					{{ capitalizeString(workforce.name) }}
				</td>
				<td :class="workforce.required === 0 ? '!text-white/50' : ''">
					{{ formatAmount(workforce.required) }}
				</td>
				<td :class="workforce.capacity === 0 ? '!text-white/50' : ''">
					{{ formatAmount(workforce.capacity) }}
				</td>
				<td :class="workforce.left === 0 ? '!text-white/50' : ''">
					{{ formatAmount(workforce.left) }}
				</td>
				<td class="text-center">
					<PButton
						v-if="workforce.lux1"
						:disabled="disabled"
						size="sm"
						type="success"
						@click="
							() => {
								emit(
									'update:lux',
									workforce.name,
									'lux1',
									!workforce.lux1
								);
								trackEvent('plan_update_workforce', {
									planetNaturalId: props.planetNaturalId,
									workforceType: workforce.name,
									luxType: 'Lux1',
									value: !workforce.lux1,
								});
							}
						">
						<template #icon>
							<CheckSharp />
						</template>
					</PButton>
					<PButton
						v-else
						:disabled="disabled"
						size="sm"
						type="error"
						@click="
							() => {
								emit(
									'update:lux',
									workforce.name,
									'lux1',
									!workforce.lux1
								);
								trackEvent('plan_update_workforce', {
									planetNaturalId: props.planetNaturalId,
									workforceType: workforce.name,
									luxType: 'Lux1',
									value: !workforce.lux1,
								});
							}
						">
						<template #icon>
							<RadioButtonUncheckedSharp />
						</template>
					</PButton>
				</td>
				<td class="text-center">
					<PButton
						v-if="workforce.lux2"
						:disabled="disabled"
						size="sm"
						type="success"
						@click="
							() => {
								emit(
									'update:lux',
									workforce.name,
									'lux2',
									!workforce.lux2
								);
								trackEvent('plan_update_workforce', {
									planetNaturalId: props.planetNaturalId,
									workforceType: workforce.name,
									luxType: 'Lux2',
									value: !workforce.lux1,
								});
							}
						">
						<template #icon>
							<CheckSharp />
						</template>
					</PButton>
					<PButton
						v-else
						:disabled="disabled"
						size="sm"
						type="error"
						@click="
							() => {
								emit(
									'update:lux',
									workforce.name,
									'lux2',
									!workforce.lux2
								);
								trackEvent('plan_update_workforce', {
									planetNaturalId: props.planetNaturalId,
									workforceType: workforce.name,
									luxType: 'Lux2',
									value: !workforce.lux1,
								});
							}
						">
						<template #icon>
							<RadioButtonUncheckedSharp />
						</template>
					</PButton>
				</td>
				<td
					class="text-end"
					:class="workforce.efficiency === 0 ? '!text-white/50' : ''">
					{{ formatNumber(workforce.efficiency * 100) }} %
				</td>
			</tr>
		</tbody>
	</PTable>
</template>
