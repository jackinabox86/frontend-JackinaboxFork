<script setup lang="ts">
	import { computed, ComputedRef, PropType } from "vue";
	import { trackEvent } from "@/lib/analytics/useAnalytics";

	// Types & Interfaces
	import {
		IInfrastructureRecord,
		INFRASTRUCTURE_TYPE,
	} from "@/features/planning/usePlanCalculation.types";

	// UI
	import { PInputNumber } from "@/ui";

	const props = defineProps({
		disabled: {
			type: Boolean,
			required: true,
		},
		infrastructureData: {
			type: Object as PropType<IInfrastructureRecord>,
			required: true,
		},
		planetNaturalId: {
			type: String,
			required: true,
		},
	});

	const emit = defineEmits<{
		(
			e: "update:infrastructure",
			infrastructure: INFRASTRUCTURE_TYPE,
			value: number
		): void;
	}>();

	// Local State
	const localInfrastructureData: ComputedRef<IInfrastructureRecord> =
		computed(() => props.infrastructureData);

	const infrastructureOrder: INFRASTRUCTURE_TYPE[] = [
		"HB1",
		"HBB",
		"HB2",
		"HBC",
		"HB3",
		"HBM",
		"HB4",
		"HBL",
		"HB5",
		"STO",
	];
</script>

<template>
	<div
		class="grid grid-cols-1 lg:grid-cols-[auto_auto_auto_auto] gap-3 child:my-auto">
		<template v-for="inf in infrastructureOrder" :key="inf">
			<div>{{ inf }}</div>
			<PInputNumber
				v-model:value="localInfrastructureData[inf]"
				:disabled="disabled"
				show-buttons
				:min="0"
				class="w-full min-w-[80px]"
				@update:value="
					(value) => {
						if (value !== null && value !== undefined) {
							emit('update:infrastructure', inf, value);
							trackEvent('plan_update_infrastructure', {
								planetNaturalId: props.planetNaturalId,
								infrastructureType: inf,
								amount: value,
							});
						}
					}
				" />
		</template>
	</div>
</template>
