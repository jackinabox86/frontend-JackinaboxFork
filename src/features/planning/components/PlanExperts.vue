<script setup lang="ts">
	import { computed, ComputedRef, PropType } from "vue";

	// Types & Interfaces
	import {
		EXPERT_TYPE,
		IExpertRecord,
	} from "@/features/planning/usePlanCalculation.types";

	// Util
	import { formatNumber } from "@/util/numbers";
	import { capitalizeString } from "@/util/text";

	// UI
	import { PInputNumber } from "@/ui";

	const props = defineProps({
		disabled: {
			type: Boolean,
			required: true,
		},
		expertData: {
			type: Object as PropType<IExpertRecord>,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "update:expert", expert: EXPERT_TYPE, value: number): void;
	}>();

	// Local State
	const localExpertData: ComputedRef<IExpertRecord> = computed(
		() => props.expertData
	);

	const totalExperts = computed(() => {
		let total: number = 0;

		Object.keys(localExpertData.value).forEach((expertKey) => {
			total += localExpertData.value[expertKey as EXPERT_TYPE].amount;
		});

		return total;
	});
</script>

<template>
	<div v-if="totalExperts > 6" class="bg-red-500/50 p-2 mb-3">
		Maximum number of experts on a base is 6. You currently have
		{{ totalExperts }} experts assigned.
	</div>
	<div
		class="grid grid-cols-1 xl:grid-cols-[auto_auto_auto] gap-x-1 gap-y-3 child:my-auto">
		<template v-for="expert in expertData" :key="expert.name">
			<div>{{ capitalizeString(expert.name) }}</div>
			<PInputNumber
				v-model:value="localExpertData[expert.name].amount"
				:disabled="disabled"
				show-buttons
				:min="0"
				:max="5"
				class="w-full min-w-[70px]"
				@update:value="
					(value) => {
						if (value !== null && value !== undefined) {
							emit('update:expert', expert.name, value);
						}
					}
				" />
			<div
				class="pl-1 text-end text-xs text-nowrap"
				:class="expert.bonus === 0 ? 'text-white/50' : ''">
				{{ formatNumber(expert.bonus * 100, 2) }} %
			</div>
		</template>
	</div>
</template>
