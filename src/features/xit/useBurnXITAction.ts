import { computed, ComputedRef, Ref } from "vue";

// Composables
import { useMaterialData } from "@/database/services/useMaterialData";

// Types & Interfaces
import {
	IXITActionElement,
	IXITActionMaterialElement,
} from "@/features/xit/xitAction.types";
import { IMaterial } from "@/features/api/gameData.types";

export async function useBurnXITAction(
	elements: Ref<IXITActionElement[]>,
	resupplyDays: Ref<number>,
	hideInfinite: Ref<boolean>,
	materialOverrides: Ref<Record<string, number | null>>,
	materialInactives: Ref<Set<string>>
) {
	// get materials
	const { materialsMap } = useMaterialData();

	// buildupo material overrides
	materialOverrides.value = elements.value.reduce((sum, current) => {
		sum[current.ticker] = materialOverrides.value[current.ticker] ?? null;
		return sum;
	}, {} as Record<string, number | null>);

	/**
	 * Computes a material table to be used in a XIT Resupply Action
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<IXITActionMaterialElement[]>}
	 */
	const materialTable: ComputedRef<IXITActionMaterialElement[]> = computed(
		() => {
			const tableElements: IXITActionMaterialElement[] = [];

			elements.value.forEach((e) => {
				let totalNeed: number = Infinity;

				if (e.delta < 0) {
					totalNeed = e.delta * -1 * resupplyDays.value - e.stock;
				}

				if (
					!hideInfinite.value ||
					(hideInfinite.value && e.delta < 0)
				) {
					const value = materialOverrides.value[e.ticker];
					const override: number | undefined =
						value != null && value > 0 ? value : undefined;

					tableElements.push({
						active: !materialInactives.value.has(e.ticker),
						ticker: e.ticker,
						stock: e.stock,
						delta: e.delta,
						burn: e.delta > 0 ? Infinity : e.stock / (e.delta * -1),
						total: override
							? override
							: Math.ceil(totalNeed) > 0
							? Math.ceil(totalNeed)
							: 0,
					});
				}
			});

			return tableElements;
		}
	);

	/**
	 * Computes weight and volume totals for materialTable elements
	 * total amount to be used in the resupply action
	 *
	 * @author jplacht
	 *
	 * @type {ComputedRef<{
	 * 		totalWeight: number;
	 * 		totalVolume: number;
	 * 	}>}
	 */
	const totalWeightVolume: ComputedRef<{
		totalWeight: number;
		totalVolume: number;
	}> = computed(() => {
		let totalWeight: number = 0;
		let totalVolume: number = 0;

		materialTable.value
			.filter((f) => f.total !== Infinity && f.active)
			.forEach((material) => {
				const mat: IMaterial = materialsMap.value[material.ticker];

				totalWeight += mat.Weight * material.total;
				totalVolume += mat.Volume * material.total;
			});

		return {
			totalWeight,
			totalVolume,
		};
	});

	return {
		materialTable,
		totalWeightVolume,
	};
}
