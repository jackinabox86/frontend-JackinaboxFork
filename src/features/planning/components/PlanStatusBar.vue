<script setup lang="ts">
	import { computed, PropType } from "vue";
	import { trackEvent } from "@/lib/analytics/useAnalytics";

	// Types & Interfaces
	import {
		IAreaResult,
		IExpertRecord,
		IOverviewData,
	} from "@/features/planning/usePlanCalculation.types";
	import { PLAN_COGCPROGRAM_TYPE } from "@/stores/planningStore.types";

	// Util
	import { formatNumber } from "@/util/numbers";

	// UI
	import {} from "@/ui";

	const props = defineProps({
		areaData: {
			type: Object as PropType<IAreaResult>,
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
		expertData: {
			type: Object as PropType<IExpertRecord>,
			required: true,
		},
		overviewData: {
			type: Object as PropType<IOverviewData>,
			required: true,
		},
	});

	const cogcTextMapping: Record<PLAN_COGCPROGRAM_TYPE, string> = {
		"---": "None",
		AGRICULTURE: "Agriculture",
		CHEMISTRY: "Chemistry",
		CONSTRUCTION: "Construction",
		ELECTRONICS: "Electronics",
		FOOD_INDUSTRIES: "Food Industries",
		FUEL_REFINING: "Fuel Refining",
		MANUFACTURING: "Manufacturing",
		METALLURGY: "Metallurgy",
		RESOURCE_EXTRACTION: "Resource Extraction",
		PIONEERS: "Pioneers",
		SETTLERS: "Settlers",
		TECHNICIANS: "Technicians",
		ENGINEERS: "Engineers",
		SCIENTISTS: "Scientists",
	};

	const expertsString = computed(() => {
		let experts = "";

		for (const expertKey in props.expertData) {
			const expert = props.expertData[expertKey as keyof IExpertRecord];
			if (expert.amount > 0) {
				if (experts.length > 0) experts += ", ";
				experts += `${expert.amount}x${expert.name.substring(0, 4)}`;
			}
		}
		if (experts.length === 0) experts = "None";
		return experts;
	});
</script>

<template>
	<div class="flex flex-row font-bold child:mr-3">
		<div :class="corphq ? 'visible' : 'collapse md:invisible'">
			<span class="text-positive">HQ</span>
		</div>
		<div>
			<span>COGC: </span>
			<span :class="props.cogc === '---' ? 'text-negative' : ''">{{
				cogcTextMapping[props.cogc]
			}}</span>
		</div>
		<div>
			<span>Area: </span>
			<span
				:class="
					areaData.areaUsed > areaData.areaTotal
						? 'text-negative'
						: ''
				"
				>{{ areaData.areaUsed }}
			</span>
			<span>/{{ areaData.areaTotal }}</span>
		</div>
		<div>
			<span>Profit: </span>
			<span
				:class="
					overviewData.profit > 0 ? 'text-positive' : 'text-negative'
				"
				>{{ formatNumber(overviewData.profit) }}</span
			>
		</div>
		<div>
			<span>Experts: </span>
			<span :class="expertsString === 'None' ? 'text-negative' : ''">{{
				expertsString
			}}</span>
		</div>
	</div>
</template>
