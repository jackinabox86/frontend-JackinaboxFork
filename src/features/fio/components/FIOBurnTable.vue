<script setup lang="ts">
	import { PropType } from "vue";

	// Composables
	import { usePlanetData } from "@/database/services/usePlanetData";
	import { usePreferences } from "@/features/preferences/usePreferences";
	const { getBurnDisplayClass } = usePreferences();
	const { planetNames, loadPlanetName } = usePlanetData();

	// Components
	import MaterialTile from "@/features/material_tile/components/MaterialTile.vue";
	import XITBurnActionButton from "@/features/xit/components/XITBurnActionButton.vue";

	// Util
	import { formatNumber, formatAmount } from "@/util/numbers";

	// Type & Interfaces
	import {
		IFIOBurnTableElement,
		IFIOBurnTableElementMaterial,
	} from "@/features/fio/useFIOBurn.types";

	// UI
	import { XNDataTable, XNDataTableColumn } from "@skit/x.naive-ui";

	defineProps({
		burnTable: {
			type: Array as PropType<IFIOBurnTableElement[]>,
			required: true,
		},
	});
</script>

<template>
	<XNDataTable :data="burnTable" striped>
		<XNDataTableColumn title="" type="expand">
			<template #render-cell="{ rowData }">
				{{ rowData.planName }}
			</template>
			<template #render-expand="{ rowData }">
				<XNDataTable :data="rowData.burnMaterials" striped>
					<XNDataTableColumn
						key="ticker"
						title="Ticker"
						sorter="default">
						<template #render-cell="data">
							<MaterialTile
								:key="data.rowData.ticker"
								:ticker="data.rowData.ticker" />
						</template>
					</XNDataTableColumn>
					<XNDataTableColumn
						key="input"
						title="Consumption"
						sorter="default">
						<template #render-cell="data">
							<span
								:class="
									data.rowData.input <= 0
										? 'text-white/50'
										: ''
								">
								{{ formatNumber(data.rowData.input) }}
							</span>
						</template>
					</XNDataTableColumn>
					<XNDataTableColumn
						key="output"
						title="Production"
						sorter="default">
						<template #render-cell="data">
							<span
								:class="
									data.rowData.output <= 0
										? 'text-white/50'
										: ''
								">
								{{ formatNumber(data.rowData.output) }}
							</span>
						</template>
					</XNDataTableColumn>
					<XNDataTableColumn
						key="delta"
						title="Delta"
						sorter="default">
						<template #render-cell="data">
							<span
								:class="
									data.rowData.delta >= 0
										? 'text-positive'
										: 'text-negative'
								">
								{{ formatNumber(data.rowData.delta) }}
							</span>
						</template>
					</XNDataTableColumn>
					<XNDataTableColumn
						key="stock"
						title="Stock"
						sorter="default">
						<template #render-cell="data">
							{{ formatAmount(data.rowData.stock) }}
						</template>
					</XNDataTableColumn>
					<XNDataTableColumn
						key="exhaustion"
						title="Burn"
						sorter="default">
						<template #render-cell="data">
							<span
								:class="
									getBurnDisplayClass(data.rowData.exhaustion)
										.value
								"
								class="py-1 px-2">
								{{ formatNumber(data.rowData.exhaustion) }}
							</span>
						</template>
					</XNDataTableColumn>
				</XNDataTable>
			</template>
		</XNDataTableColumn>
		<XNDataTableColumn key="planName" title="Plan">
			<template #title>
				<div class="flex flex-row justify-between">
					<div>Plan</div>
					<div>Exhaustion</div>
				</div>
			</template>
			<template #render-cell="{ rowData }">
				<div class="flex flex-row justify-between">
					<div class="my-auto">
						<span class="font-bold">
							{{ rowData.planName }}
						</span>
						<span class="!text-white/50">
							&mdash;
							{{
								planetNames[rowData.planetId] ||
								loadPlanetName(rowData.planetId) ||
								"Loading..."
							}}
						</span>
					</div>
					<div class="flex flex-row items-center gap-x-3">
						<div>
							<span
								class="py-1 px-2"
								:class="
									getBurnDisplayClass(rowData.minDays).value
								">
								{{ formatNumber(rowData.minDays) }}
							</span>
						</div>
						<div>
							<XITBurnActionButton
								:drawer-title="`XIT Resupply: ${rowData.planName}`"
								:elements="
									rowData.burnMaterials.map(
										(e: IFIOBurnTableElementMaterial) => {
											return {
												ticker: e.ticker,
												stock: e.stock,
												delta: e.delta,
											};
										}
									)
								" />
						</div>
					</div>
				</div>
			</template>
		</XNDataTableColumn>
	</XNDataTable>
</template>
