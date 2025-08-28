import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises } from "@vue/test-utils";

// Composables
import { useHQUpgradeCalculator } from "@/features/hq_upgrade_calculator/useHQUpgradeCalculator";

// stores
import { useGameDataStore } from "@/stores/gameDataStore";
import { materialsStore } from "@/database/stores";
import { useMaterialData } from "@/database/services/useMaterialData";

// test data
import materials from "@/tests/test_data/api_data_materials.json";
import exchanges from "@/tests/test_data/api_data_exchanges.json";
import { ComputedRef, nextTick, Ref, ref } from "vue";

export async function waitForRefPopulated<T extends unknown>(
	refData: Ref<T> | ComputedRef<T>
) {
	function isPopulated(value: T) {
		if (value == null) return false;

		if (Array.isArray(value) || typeof value === "string") {
			return value.length > 0;
		}

		if (typeof value === "object") {
			return Object.keys(value).length > 0;
		}

		if (typeof value === "number") {
			return !isNaN(value);
		}

		// fallback for other types
		return !!value;
	}

	while (!isPopulated(refData.value)) {
		await nextTick();
		await flushPromises();
	}
}

describe("useHQUpgradeCalculator", async () => {
	const refStart = ref(1);
	const refTo = ref(3);
	const refOverride = ref({});
	const refCXUuid = ref(undefined);

	beforeEach(async () => {
		setActivePinia(createPinia());

		await materialsStore.setMany(materials);

		const { preload } = useMaterialData();

		await preload();
		await flushPromises();

		const gameDataStore = useGameDataStore();
		gameDataStore.setExchanges(exchanges);
	});

	it("levelOptions", async () => {
		const { levelOptions, levelOptionsTo } = await useHQUpgradeCalculator(
			refStart,
			refTo,
			refOverride,
			refCXUuid
		);

		expect(levelOptions.length).toBeGreaterThan(1);
		expect(levelOptionsTo.value.length).toBe(levelOptions.length);
	});

	it("materialData", async () => {
		const { materialData } = await useHQUpgradeCalculator(
			refStart,
			refTo,
			refOverride,
			refCXUuid
		);

		await waitForRefPopulated(materialData);

		expect(materialData.value).toBeDefined();
		expect(materialData.value.length).toBeGreaterThan(1);
	});

	it("totalCost", async () => {
		const { totalCost } = await useHQUpgradeCalculator(
			refStart,
			refTo,
			refOverride,
			refCXUuid
		);

		await waitForRefPopulated(totalCost);

		expect(totalCost.value).toBeDefined();
	});

	it("totalWeightVolume", async () => {
		const { totalWeightVolume } = await useHQUpgradeCalculator(
			refStart,
			refTo,
			refOverride,
			refCXUuid
		);
		await waitForRefPopulated(totalWeightVolume);

		expect(Object.keys(totalWeightVolume.value).length).toBe(2);
		expect(totalWeightVolume.value.totalVolume).toBe(0);
		expect(totalWeightVolume.value.totalWeight).toBe(0);
	});
});
