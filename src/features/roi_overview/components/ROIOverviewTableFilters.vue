<script setup lang="ts">
	import { computed, PropType } from "vue";

	// Types & Interfaces
	import { PSelectOption } from "@/ui/ui.types";

	// UI
	import { PSelect, PCheckbox } from "@/ui";

	const props = defineProps({
		filterBuilding: {
			type: null as unknown as PropType<string | null>,
			required: false,
			default: null,
		},
		filterCogc: {
			type: null as unknown as PropType<string | null>,
			required: false,
			default: null,
		},
		filterOutputMaterial: {
			type: null as unknown as PropType<string | null>,
			required: false,
			default: null,
		},
		filterInputMaterial: {
			type: null as unknown as PropType<string | null>,
			required: false,
			default: null,
		},
		filterPositiveROI: {
			type: Boolean,
			required: true,
		},
		buildingOptions: {
			type: Array as PropType<PSelectOption[]>,
			required: true,
		},
		cogcOptions: {
			type: Array as PropType<PSelectOption[]>,
			required: true,
		},
		outputMaterialOptions: {
			type: Array as PropType<PSelectOption[]>,
			required: true,
		},
		inputMaterialOptions: {
			type: Array as PropType<PSelectOption[]>,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "update:filterBuilding", value: string | null): void;
		(e: "update:filterCogc", value: string | null): void;
		(e: "update:filterOutputMaterial", value: string | null): void;
		(e: "update:filterInputMaterial", value: string | null): void;
		(e: "update:filterPositiveROI", value: boolean): void;
	}>();

	const localFilterBuilding = computed({
		get: () => props.filterBuilding,
		set: (v: string | null) => emit("update:filterBuilding", v),
	});
	const localFilterCogc = computed({
		get: () => props.filterCogc,
		set: (v: string | null) => emit("update:filterCogc", v),
	});
	const localFilterOutputMaterial = computed({
		get: () => props.filterOutputMaterial,
		set: (v: string | null) => emit("update:filterOutputMaterial", v),
	});
	const localFilterInputMaterial = computed({
		get: () => props.filterInputMaterial,
		set: (v: string | null) => emit("update:filterInputMaterial", v),
	});
	const localFilterPositiveROI = computed({
		get: () => props.filterPositiveROI,
		set: (v: boolean) => emit("update:filterPositiveROI", v),
	});
</script>

<template>
	<div
		class="border border-b-0 rounded-[3px] border-white/15 p-3 flex flex-row gap-3 flex-wrap">
		<div class="my-auto font-bold pr-3">Filter</div>
		<div class="flex flex-row gap-3 child:my-auto">
			<div>Building</div>
			<PSelect
				v-model:value="localFilterBuilding"
				:options="buildingOptions"
				searchable
				clearable
				class="w-50" />
		</div>
		<div class="flex flex-row gap-3 child:my-auto">
			<div>COGC</div>
			<PSelect
				v-model:value="localFilterCogc"
				:options="cogcOptions"
				searchable
				clearable
				class="w-50" />
		</div>
		<div class="flex flex-row gap-3 child:my-auto">
			<div>Output</div>
			<PSelect
				v-model:value="localFilterOutputMaterial"
				:options="outputMaterialOptions"
				searchable
				clearable
				class="w-50" />
		</div>
		<div class="flex flex-row gap-3 child:my-auto">
			<div>Input</div>
			<PSelect
				v-model:value="localFilterInputMaterial"
				:options="inputMaterialOptions"
				searchable
				clearable
				class="w-50" />
		</div>
		<div class="flex flex-row gap-3 child:my-auto">
			<div>Positive ROI</div>
			<PCheckbox v-model:checked="localFilterPositiveROI" />
		</div>
	</div>
</template>
