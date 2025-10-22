<script setup lang="ts">
	import { PropType, computed } from "vue";

	// Util
	import { formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import { IEmpireCostOverview } from "@/features/empire/empire.types";

	const props = defineProps({
		costOverview: {
			type: Object as PropType<IEmpireCostOverview>,
			required: true,
		},
	});

	const profitPerArea = computed(() => {
		return props.costOverview.totalAreaUsed > 0
			? props.costOverview.totalProfit / props.costOverview.totalAreaUsed
			: 0;
	});
</script>

<template>
	<div class="grid grid-cols-[1fr_auto_auto_auto_auto_1fr] gap-6 child:child:text-center">
		<div class="col-2">
			<div class="text-white/40 text-xs">Profit</div>
			<div class="text-white text-xl">
				{{ formatNumber(costOverview.totalProfit) }}
			</div>
			<div class="text-white/40 text-xs">
				{{
					formatNumber(
						(costOverview.totalProfit / costOverview.totalRevenue) *
							100
					)
				}}
				%
			</div>
		</div>
		<div>
			<div class="text-white/40 text-xs">Revenue</div>
			<div class="text-white text-xl">
				{{ formatNumber(costOverview.totalRevenue) }}
			</div>
		</div>
		<div>
			<div class="text-white/40 text-xs">Cost</div>
			<div class="text-white text-xl">
				{{ formatNumber(costOverview.totalCost) }}
			</div>
			<div class="text-white/40 text-xs">
				{{
					formatNumber(
						(costOverview.totalCost / costOverview.totalRevenue) *
							100
					)
				}}
				%
			</div>
		</div>
		<div>
			<div class="text-white/40 text-xs">Profit / Area</div>
			<div class="text-white text-xl">
				{{ formatNumber(profitPerArea) }}
			</div>
		</div>
	</div>
</template>
