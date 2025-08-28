import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeAll } from "vitest";
import { flushPromises } from "@vue/test-utils";

// Stores
import { useGameDataStore } from "@/stores/gameDataStore";
import { materialsStore } from "@/database/stores";
import { useMaterialData } from "@/database/services/useMaterialData";

// Composables
import { useBurnXITAction } from "@/features/xit/useBurnXITAction";

// Types & Interfaces
import { IXITActionElement } from "@/features/xit/xitAction.types";

// test data
import materials from "@/tests/test_data/api_data_materials.json";

describe("useBurnXITAction", async () => {
	let gameDataStore: any;

	beforeAll(async () => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();

		await materialsStore.setMany(materials);

		const { preload } = useMaterialData();

		await preload();
		await flushPromises();
	});

	const elements: IXITActionElement[] = [
		{
			ticker: "ALO",
			stock: 10,
			delta: -2,
		},
		{
			ticker: "FEO",
			stock: 10,
			delta: 1,
		},
		{
			ticker: "LST",
			stock: 25,
			delta: -5.1,
		},
		{
			ticker: "EPO",
			stock: 100,
			delta: -1,
		},
		{
			ticker: "H",
			stock: 30,
			delta: 5,
		},
	];
	const resupplyDays: number = 5;
	const hideInfinite: boolean = true;
	const materialOverrides: Record<string, number> = {
		ALO: 10,
	};
	const materialInactives: Set<string> = new Set(["FEO"]);

	it("materialTable", async () => {
		const { materialTable } = await useBurnXITAction(
			ref(elements),
			ref(resupplyDays),
			ref(hideInfinite),
			ref(materialOverrides),
			ref(materialInactives)
		);

		expect(materialTable.value.length).toBe(3);
		expect(materialTable.value[0].total).toBe(10);
		expect(materialTable.value[1].total).toBe(1);
		expect(materialTable.value[2].total).toBe(0);
	});

	it("totalWeightVolume", async () => {
		const { totalWeightVolume } = await useBurnXITAction(
			ref(elements),
			ref(resupplyDays),
			ref(hideInfinite),
			ref(materialOverrides),
			ref(materialInactives)
		);

		expect(totalWeightVolume.value.totalWeight).toBe(16.230000257492065);
		expect(totalWeightVolume.value.totalVolume).toBe(11);
	});
});
