<script setup lang="ts">
	import { onMounted, PropType, ref, Ref } from "vue";

	// Composables
	import { useQuery } from "@/lib/query_cache/useQuery";

	// Components
	import PlanetPOPRTable from "@/features/government/components/PlanetPOPRTable.vue";

	// Types & Interfaces
	import { IWorkforceRecord } from "@/features/planning/usePlanCalculation.types";
	import { IPopulationReport } from "@/features/api/gameData.types";

	// UI
	import { PButton } from "@/ui";
	import { NSpin } from "naive-ui";
	import { CloseSharp } from "@vicons/material";

	const props = defineProps({
		planetNaturalId: {
			type: String,
			required: true,
		},
		workforceData: {
			type: Object as PropType<IWorkforceRecord>,
			required: true,
		},
	});

	const isLoading: Ref<boolean> = ref(false);
	const hasError: Ref<boolean> = ref(false);
	const poprData: Ref<IPopulationReport | null> = ref(null);

	async function fetchPOPR(planetNaturalId: string) {
		isLoading.value = true;
		try {
			await useQuery("GetPlanetLastPOPR", {
				planetNaturalId: planetNaturalId,
			})
				.execute()
				.then((data: IPopulationReport) => (poprData.value = data))
				.finally(() => (isLoading.value = false));
		} catch {
			hasError.value = true;
		}
	}

	const emit = defineEmits<{
		(e: "close"): void;
	}>();

	onMounted(() => fetchPOPR(props.planetNaturalId));
</script>

<template>
	<div class="pb-3 flex flex-row justify-between child:my-auto">
		<h2 class="text-white/80 font-bold text-lg">
			Latest Population Report
		</h2>
		<PButton size="sm" type="secondary" @click="emit('close')">
			<template #icon><CloseSharp /></template>
		</PButton>
	</div>
	<div v-if="hasError">
		Error loading latest population report. The planet might not have
		population.
	</div>
	<div v-else-if="isLoading" class="text-center">
		<n-spin />
		<br />
		Loading Population Report
	</div>
	<div v-else-if="poprData">
		<PlanetPOPRTable
			:planet-natural-id="planetNaturalId"
			:popr-data="poprData"
			:workforce-data="workforceData" />
	</div>
</template>
