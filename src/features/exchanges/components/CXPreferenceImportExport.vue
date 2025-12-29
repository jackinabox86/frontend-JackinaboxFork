<script setup lang="ts">
	import { ArrowDownwardFilled, ArrowUpwardFilled } from "@vicons/material";

	// UI
	import { PButton } from "@/ui";

	import {
		ICXDataExchangeOption,
		ICXDataTickerOption,
	} from "@/stores/planningStore.types";
	import { PropType } from "vue";
	import { ICXPlanetMap } from "../manageCX.types";

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
			<PButton>
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
	Warning: Importing overwrites all existing settings.
</template>
