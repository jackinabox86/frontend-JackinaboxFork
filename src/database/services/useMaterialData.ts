import { computed, ComputedRef } from "vue";

import { materialsStore } from "@/database/stores";
import { useDB } from "@/database/composables/useDB";

import { IMaterial } from "@/features/api/gameData.types";
import { PSelectOption } from "@/ui/ui.types";

export function useMaterialData() {
	const { allData, get, preload } = useDB(materialsStore, "Ticker");
	// trigger preload
	preload();

	async function getMaterial(ticker: string): Promise<IMaterial> {
		const material = await get(ticker);

		if (!material) {
			throw new Error(`Material ${ticker} not available.`);
		}

		return material;
	}

	const materialSelectOptions: ComputedRef<PSelectOption[]> = computed(() =>
		allData.value.map((m) => ({ label: m.Ticker, value: m.Ticker }))
	);

	return {
		materials: allData,
		materialSelectOptions,
		getMaterial,
		reload: preload,
	};
}
