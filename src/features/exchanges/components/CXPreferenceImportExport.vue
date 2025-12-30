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

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		console.log(`Selected file: ${file.name}`);

		Papa.parse<IExchangeCSVRow>(file, {
			header: true,
			complete: (results) => {
				const newEmpireCX: ICXDataExchangeOption[] = [];
				const newEmpireTickers: ICXDataTickerOption[] = [];

				const planetCXMap = new Map<string, ICXPlanetMap>();
				const planetTickerMap = new Map<string, ICXPlanetMap>();

				results.data.forEach((row) => {
					if (!row.Location) return;

					const isEmpire = row.Location === "EMPIRE";
					const isTicker = row.Ticker && row.Ticker.trim() !== "";
					console.log(row, isTicker);
					if (isEmpire) {
						if (!isTicker) {
							newEmpireCX.push({
								type: row.Type as PreferenceType,
								exchange: row.CX as ExchangeType,
							});
						} else {
							newEmpireTickers.push({
								type: row.Type as PreferenceType,
								ticker: row.Ticker,
								value: Number(row.Price),
							});
						}
					} else if (!isEmpire) {
						const targetMap = isTicker
							? planetTickerMap
							: planetCXMap;

						let planetData = targetMap.get(row.Location);

						if (!planetData) {
							planetData = {
								planet: row.Location,
								preferences: [],
							};
							targetMap.set(row.Location, planetData);
						}

						if (!isTicker) {
							planetData.preferences.push({
								type: row.Type as PreferenceType,
								exchange: row.CX as ExchangeType,
							});
						} else {
							planetData.preferences.push({
								type: row.Type as PreferenceType,
								ticker: row.Ticker,
								value: Number(row.Price),
							});
						}
					}
				});

				console.log("newEmpireCX", newEmpireCX);
				console.log("newEmpireTickers", newEmpireTickers);
				console.log("planetCXMap", planetCXMap);
				console.log("planetTickerMap", planetTickerMap);

				emit("update:cxEmpire", newEmpireCX);
				emit("update:empireTickerOptions", newEmpireTickers);
				emit("update:cxPlanets", Array.from(planetCXMap.values()));
				emit(
					"update:planetTickerOptions",
					Array.from(planetTickerMap.values())
				);
			},
			error: (error) => {
				console.error(error);
			},
		});

		event.target.value = "";
	};

	function exportSettings() {
		let csvContent = "Location;Type;CX;Ticker;Price";

		if (props.cxEmpire) {
			for (let option of props.cxEmpire) {
				csvContent = `${csvContent}\nEMPIRE;${option.type};${option.exchange};;`;
			}
		}

		if (props.cxPlanets) {
			for (let planet of props.cxPlanets) {
				for (let option of planet.preferences) {
					csvContent = `${csvContent}\n${planet.planet};${option.type};${option.exchange};;`;
				}
			}
		}

		if (props.empireTickerOptions) {
			for (let option of props.empireTickerOptions) {
				csvContent = `${csvContent}\nEMPIRE;${option.type};;${option.ticker};${option.value}`;
			}
		}

		if (props.planetTickerOptions) {
			for (let planet of props.planetTickerOptions) {
				for (let option of planet.preferences) {
					csvContent = `${csvContent}\n${planet.planet};${option.type};;${option.ticker};${option.value}`;
				}
			}
		}

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
