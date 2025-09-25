<script setup lang="ts">
	import { computed, PropType, WritableComputedRef } from "vue";
	import { trackEvent } from "@/lib/analytics/useAnalytics";
	// Types & Interfaces
	import { PLAN_COGCPROGRAM_TYPE } from "@/stores/planningStore.types";

	// UI
	import { PForm, PFormItem, PCheckbox, PSelect, PTooltip } from "@/ui";
	import { PSelectOption } from "@/ui/ui.types";

	const props = defineProps({
		disabled: {
			type: Boolean,
			required: true,
		},
		corphq: {
			type: Boolean,
			required: true,
		},
		cogc: {
			type: String as PropType<PLAN_COGCPROGRAM_TYPE>,
			required: true,
		},
		planetNaturalId: {
			type: String,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "update:corphq", value: boolean): void;
		(e: "update:cogc", value: PLAN_COGCPROGRAM_TYPE): void;
	}>();

	// Local State
	const localCorpHQ: WritableComputedRef<boolean> = computed({
		get: () => props.corphq,
		set: (value: boolean) => {
			emit("update:corphq", value);
			trackEvent("plan_update_corphq", {
				planetNaturalId: props.planetNaturalId,
				corphq: value,
			});
		},
	});

	const localCOGC: WritableComputedRef<PLAN_COGCPROGRAM_TYPE> = computed({
		get: () => props.cogc,
		set: (value: PLAN_COGCPROGRAM_TYPE) => {
			emit("update:cogc", value);
			trackEvent("plan_update_cogc", {
				planetNaturalId: props.planetNaturalId,
				cogc: value,
			});
		},
	});

	const cogcOptions: PSelectOption[] = [
		{ value: "---", label: "None" },
		{ value: "AGRICULTURE", label: "Agriculture" },
		{ value: "CHEMISTRY", label: "Chemistry" },
		{ value: "CONSTRUCTION", label: "Construction" },
		{ value: "ELECTRONICS", label: "Electronics" },
		{ value: "FOOD_INDUSTRIES", label: "Food Industries" },
		{ value: "FUEL_REFINING", label: "Fuel Refining" },
		{ value: "MANUFACTURING", label: "Manufacturing" },
		{ value: "METALLURGY", label: "Metallurgy" },
		{ value: "RESOURCE_EXTRACTION", label: "Resource Extraction" },
		{ value: "PIONEERS", label: "Pioneers" },
		{ value: "SETTLERS", label: "Settlers" },
		{ value: "TECHNICIANS", label: "Technicians" },
		{ value: "ENGINEERS", label: "Engineers" },
		{ value: "SCIENTISTS", label: "Scientists" },
	];
</script>

<template>
	<PForm>
		<PFormItem label="Corp. HQ">
			<PTooltip>
				<template #trigger>
					<PCheckbox
						v-model:checked="localCorpHQ"
						:disabled="disabled" />
				</template>
				The corporation you belong to has its headquarters on <br />
				this planet (not your individual company).
			</PTooltip>
		</PFormItem>

		<PFormItem label="COGC">
			<PSelect
				v-model:value="localCOGC"
				class="w-full"
				:disabled="disabled"
				:options="cogcOptions" />
		</PFormItem>
	</PForm>
</template>
