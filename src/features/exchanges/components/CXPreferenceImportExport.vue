<script setup lang="ts">
	import { ArrowDownwardFilled, ArrowUpwardFilled } from "@vicons/material";

	// UI
	import { PButton } from "@/ui";

	import {
		ICXDataExchangeOption,
		ICXDataTickerOption,
	} from "@/stores/planningStore.types";
	import { PropType, ref } from "vue";
	import {
		ExchangeType,
		ICXPlanetMap,
		PreferenceType,
	} from "../manageCX.types";

	import Papa from "papaparse";
	import { useCXImportExport } from "../useCXImportExport";

	const { parseSettingsCSV, generateSettingsCSV } = useCXImportExport();

	interface IExchangeCSVRow {
		Location: string;
		Type: string;
		CX: string;
		Ticker: string;
		Price: string;
	}

	const props = defineProps({
		cxEmpire: {
			type: Array as PropType<ICXDataExchangeOption[]>,
			required: true,
		},
		cxPlanets: {
			type: Array as PropType<ICXPlanetMap[]>,
			required: true,
		},
		empireTickerOptions: {
			type: Array as PropType<ICXDataTickerOption[]>,
			required: true,
		},
		planetTickerOptions: {
			type: Array as PropType<ICXPlanetMap[]>,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "update:cxEmpire", value: ICXDataExchangeOption[]): void;
		(e: "update:cxPlanets", value: ICXPlanetMap[]): void;
		(e: "update:empireTickerOptions", value: ICXDataTickerOption[]): void;
		(e: "update:planetTickerOptions", value: ICXPlanetMap[]): void;
	}>();

	const fileInput = ref(null);

	const triggerFileSelect = () => {
		fileInput.value.click();
	};

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			const data = await parseSettingsCSV(file);

			emit("update:cxEmpire", data.empireCX);
			emit("update:empireTickerOptions", data.empireTickerOptions);
			emit("update:cxPlanets", data.planetsCX);
			emit("update:planetTickerOptions", data.plantesTickerOptions);
		} catch (e) {
			console.error(e);
		}
		event.target.value = "";
	};

	function exportSettings() {
		let csvContent = generateSettingsCSV(
			props.cxEmpire,
			props.empireTickerOptions,
			props.cxPlanets,
			props.planetTickerOptions
		);

		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "PrunPlannerExchangePreferences.csv");

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}
</script>

<template>
	<div class="flex flex-row justify-between items-center">
		<h2 class="text-xl font-bold py-3 pt-6 my-auto">Import / Export CSV</h2>
		<div class="flex flex-row gap-x-1">
			<input
				ref="fileInput"
				type="file"
				accept=".csv"
				style="display: none"
				@change="handleFileChange" />
			<PButton @click="triggerFileSelect">
				<template #icon>
					<ArrowDownwardFilled />
				</template>
				Import Settings
			</PButton>
			<PButton @click="exportSettings">
				<template #icon>
					<ArrowUpwardFilled />
				</template>
				Export Settings
			</PButton>
		</div>
	</div>
	Warning: Importing deletes all existing properties and imports the new ones.
</template>
