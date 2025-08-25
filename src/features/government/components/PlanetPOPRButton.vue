<script setup lang="ts">
	import { PropType, ref, Ref } from "vue";

	// Composables
	import { useQuery } from "@/lib/query_cache/useQuery";
	import { usePostHog } from "@/lib/usePostHog";
	const { capture } = usePostHog();

	// Components
	import PlanetPOPRTable from "./PlanetPOPRTable.vue";

	// Typoes & Interfaces
	import { IPopulationReport } from "@/features/api/gameData.types";

	// UI
	import { NButton, NModal } from "naive-ui";

	defineProps({
		planetNaturalId: {
			type: String,
			required: true,
		},
		buttonSize: {
			type: String as PropType<"tiny" | "small" | "medium" | "large">,
			required: false,
			default: "small",
		},
		buttonText: {
			type: String,
			required: false,
			default: "POPR",
		},
	});

	const showPOPRModal: Ref<boolean> = ref(false);
	const buttonLoading: Ref<boolean> = ref(false);
	const buttonDisabled: Ref<boolean> = ref(false);
	const poprData: Ref<IPopulationReport | null> = ref(null);

	async function loadData(planetNaturalId: string): Promise<void> {
		buttonLoading.value = true;

		capture("popr_load", { planetId: planetNaturalId });

		try {
			await useQuery("GetPlanetLastPOPR", {
				planetNaturalId: planetNaturalId,
			})
				.execute()
				.then((data: IPopulationReport) => {
					poprData.value = data;
					showPOPRModal.value = true;
				})
				.finally(() => {
					buttonLoading.value = false;
				});
		} catch {
			buttonDisabled.value = true;
		}
	}
</script>

<template>
	<n-modal
		v-model:show="showPOPRModal"
		preset="card"
		:title="`Latest Population Report: ${planetNaturalId}`"
		class="max-w-[600px]">
		<PlanetPOPRTable
			v-if="poprData"
			:planet-natural-id="planetNaturalId"
			:popr-data="poprData" />
	</n-modal>
	<n-button
		:size="buttonSize"
		:loading="buttonLoading"
		:disabled="buttonDisabled"
		@click="loadData(planetNaturalId)">
		{{ buttonText }}
	</n-button>
</template>
