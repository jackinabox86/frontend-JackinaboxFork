import { computed, ComputedRef, toRaw } from "vue";

// Stores
import { useGameDataStore } from "@/stores/gameDataStore";

// Util
import { inertClone } from "@/util/data";

// Interfaces & Types
import { IMaterial } from "@/features/api/gameData.types";
import { PSelectOption } from "@/ui/ui.types";

const cache = new Map<string, IMaterial>();

export function useMaterialData() {
	const gameDataStore = useGameDataStore();

	/**
	 * Gets material data by given ticker
	 * @author jplacht
	 *
	 * @param {string} ticker Material Ticker e.g. "DW"
	 * @returns {IMaterial} Material Data
	 */
	function getMaterial(ticker: string): IMaterial {
		// check internal cache
		if (cache.has(ticker)) return cache.get(ticker)!;

		const findMaterial: IMaterial | undefined = toRaw(
			gameDataStore.materials[ticker]
		);

		if (findMaterial) {
			const data = inertClone(findMaterial);
			cache.set(ticker, data);
			return data;
		}

		throw new Error(
			`No data: Material '${ticker}'. Ensure ticker is valid and game data has been loaded.`
		);
	}

	const materialSelectOptions: ComputedRef<PSelectOption[]> = computed(() => {
		return Object.values(gameDataStore.materials).map((m) => ({
			label: m.Ticker,
			value: m.Ticker,
		}));
	});

	return {
		getMaterial,
		materialSelectOptions,
	};
}
