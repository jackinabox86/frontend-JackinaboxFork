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
import { ref } from "vue";

describe("useHQUpgradeCalculator", async () => {
	const refStart = ref(1);
	const refTo = ref(3);
	const refOverride = ref({});
	const refCXUuid = ref(undefined);

	beforeEach(async () => {
		setActivePinia(createPinia());
		const gameDataStore = useGameDataStore();
		gameDataStore.setExchanges(exchanges);

		await materialsStore.setMany(materials);

		const { preload } = useMaterialData();

		await preload();
		await flushPromises();
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

		expect(totalCost.value).toBeDefined();
	});

	it("totalWeightVolume", async () => {
		const { totalWeightVolume } = await useHQUpgradeCalculator(
			refStart,
			refTo,
			refOverride,
			refCXUuid
		);

		expect(Object.keys(totalWeightVolume.value).length).toBe(2);
		expect(totalWeightVolume.value.totalVolume).toBe(85.60000044107437);
		expect(totalWeightVolume.value.totalWeight).toBe(33.32000006735325);
	});
});
