<script setup lang="ts">
	import {
		computed,
		PropType,
		Ref,
		ref,
		watchEffect,
		ComputedRef,
	} from "vue";

	// Composables
	import { useMaterialData } from "@/database/services/useMaterialData";
	import { usePrice } from "@/features/cx/usePrice";

	// Components
	import MaterialTile from "@/features/material_tile/components/MaterialTile.vue";
	import XITTransferActionButton from "@/features/xit/components/XITTransferActionButton.vue";

	// Util
	import { formatAmount, formatNumber } from "@/util/numbers";

	// Types & Interfaces
	import {
		IBuildingConstruction,
		INFRASTRUCTURE_TYPE,
		IProductionBuilding,
	} from "@/features/planning/usePlanCalculation.types";
	import { IXITTransferMaterial } from "@/features/xit/xitAction.types";
	import { IMaterial } from "@/features/api/gameData.types";

	// UI
	import { PButton, PInputNumber } from "@/ui";
	import { NTable } from "naive-ui";
	import { CloseSharp } from "@vicons/material";

	const props = defineProps({
		planetNaturalId: {
			type: String,
			required: true,
		},
		cxUuid: {
			type: String,
			required: false,
			default: undefined,
		},
		constructionData: {
			type: Array as PropType<IBuildingConstruction[]>,
			required: true,
		},
		productionBuildingData: {
			type: Array as PropType<IProductionBuilding[]>,
			required: true,
		},
		infrastructureData: {
			type: Object as PropType<Record<INFRASTRUCTURE_TYPE, number>>,
			required: true,
		},
	});

	const emit = defineEmits<{
		(e: "close"): void;
	}>();

	const { materialsMap } = useMaterialData();
	const { getPrice } = await usePrice(
		ref(props.cxUuid),
		ref(props.planetNaturalId)
	);

	const localBuildingAmount: Ref<Record<string, number>> = ref({});
	const localBuildingMaterials: Ref<Record<string, Record<string, number>>> =
		ref({});

	const uniqueMaterials = computed(() => {
		return Array.from(
			new Set(
				props.constructionData
					.map((e) => e.materials.map((x) => x.ticker))
					.flat()
			)
		).sort();
	});

	const buildingTicker = computed(() =>
		props.constructionData.map((b) => b.ticker).sort()
	);

	const totalMaterials = computed(() => {
		const r: Record<string, number> = {};
		uniqueMaterials.value.map((mat) => {
			r[mat] = 0;
			buildingTicker.value.forEach((bticker) => {
				if (localBuildingMaterials.value[bticker][mat]) {
					r[mat] += localBuildingMaterials.value[bticker][mat];
				}
			});
		});

		return r;
	});

	function generateMatrix(): void {
		buildingTicker.value.forEach((bticker) => {
			localBuildingAmount.value[bticker] =
				localBuildingAmount.value[bticker] ??
				props.productionBuildingData.find((pf) => pf.name === bticker)
					?.amount ??
				props.infrastructureData[bticker as INFRASTRUCTURE_TYPE] ??
				undefined;

			// handle core module separately
			if (
				bticker === "CM" &&
				localBuildingAmount.value["CM"] === undefined
			) {
				localBuildingAmount.value["CM"] = 1;
			}

			const thisMats = props.constructionData.find(
				(e) => e.ticker === bticker
			);

			if (thisMats) {
				localBuildingMaterials.value[bticker] =
					thisMats.materials.reduce((sum, current) => {
						sum[current.ticker] =
							current.input * localBuildingAmount.value[bticker];
						return sum;
					}, {} as Record<string, number>);
			}
		});
	}

	const xitTransferElements: ComputedRef<IXITTransferMaterial[]> = computed(
		() =>
			Object.entries(totalMaterials.value).map(([ticker, value]) => ({
				ticker,
				value,
			}))
	);

	const totalInformation = computed(() => {
		let weight: number = 0;
		let volume: number = 0;
		let price: number = 0;

		xitTransferElements.value.forEach((m) => {
			const materialInfo: IMaterial = materialsMap.value[m.ticker];
			weight += materialInfo.Weight * m.value;
			volume += materialInfo.Volume * m.value;

			price += getPrice(m.ticker, "BUY") * m.value;
		});

		return { weight, volume, price };
	});

	watchEffect(() => generateMatrix());
</script>

<template>
	<div class="pb-3 flex flex-row justify-between child:my-auto">
		<h2 class="text-white/80 font-bold text-lg">Construction Cart</h2>
		<div class="flex flex-row gap-x-3 child:!my-auto">
			<XITTransferActionButton
				:elements="xitTransferElements"
				transfer-name="Construct"
				:drawer-width="400" />
			<PButton size="sm" type="secondary" @click="emit('close')">
				<template #icon><CloseSharp /></template>
			</PButton>
		</div>
	</div>
	<div class="overflow-auto">
		<n-table class="table-auto overflow-scroll w-full">
			<thead>
				<tr>
					<th>Building</th>
					<th>Amount</th>
					<th
						v-for="mat in uniqueMaterials"
						:key="`CONSTRUCTIONCART#COLUMN#${mat}`"
						class="!text-center">
						<MaterialTile :key="mat" :ticker="mat" />
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="building in buildingTicker"
					:key="`CONSTRUCTIONCART#ROW#${building}`">
					<th>{{ building }}</th>
					<th class="!border-r">
						<PInputNumber
							v-model:value="localBuildingAmount[building]"
							show-buttons
							:min="0" />
					</th>
					<td
						v-for="mat in uniqueMaterials"
						:key="`CONSTRUCTIONCART#COLUMN#${building}#${mat}`"
						class="text-center">
						<span
							:class="
								!localBuildingMaterials[building][mat]
									? 'text-white/20'
									: ''
							">
							{{
								formatAmount(
									localBuildingMaterials[building][mat] ?? 0
								)
							}}
						</span>
					</td>
				</tr>
				<tr class="child:!border-t-2 child:!border-b-2">
					<td colspan="2">Materials Sum</td>
					<td
						v-for="mat in uniqueMaterials"
						:key="`CONSTRUCTIONCART#COLUMN#TOTALS#${mat}`"
						class="text-center font-bold">
						{{ formatAmount(totalMaterials[mat] ?? 0) }}
					</td>
				</tr>
				<tr>
					<td :colspan="uniqueMaterials.length + 2">
						<div
							class="flex flex-row justify-between child:my-auto">
							<div
								class="grid grid-cols-2 gap-x-3 gap-y-1 child:not-even:font-bold">
								<div>Total Cost</div>
								<div>
									{{ formatNumber(totalInformation.price) }}
									<span class="pl-1 font-light text-white/50">
										$
									</span>
								</div>
							</div>
							<div
								class="grid grid-cols-2 gap-x-3 gap-y-1 child:text-end child:not-even:font-bold">
								<div>Total Volume</div>
								<div>
									{{ formatNumber(totalInformation.volume) }}
									<span class="pl-1 font-light text-white/50">
										m³
									</span>
								</div>
								<div>Total Weight</div>
								<div>
									{{ formatNumber(totalInformation.weight) }}
									<span class="pl-1 font-light text-white/50">
										t
									</span>
								</div>
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</n-table>
	</div>
</template>
