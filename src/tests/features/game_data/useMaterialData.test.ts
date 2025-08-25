import { setActivePinia, createPinia } from "pinia";
import { beforeAll, describe, expect, it } from "vitest";

import { useGameDataStore } from "@/stores/gameDataStore";
import { IMaterial } from "@/features/api/gameData.types";
import { useMaterialData } from "@/features/game_data/useMaterialData";

// test data
import materials from "@/tests/test_data/api_data_materials.json";

describe("useMaterialData", () => {
	let gameDataStore: any;

	beforeAll(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();
	});

	it("getMaterial: existing", () => {
		const testMaterial = materials[0];

		gameDataStore.materials["foo"] = testMaterial;

		const { getMaterial } = useMaterialData();

		const result: IMaterial = getMaterial("foo");

		expect(result.Ticker).toBe(testMaterial.Ticker);
	});

	it("materialSelectOptions", () => {
		const testMaterial = materials[0];

		gameDataStore.materials["foo"] = testMaterial;

		const { materialSelectOptions } = useMaterialData();

		expect(materialSelectOptions.value.length).toBe(1);
	});

	it("getMaterial: undefined", () => {
		const { getMaterial } = useMaterialData();

		expect(() => getMaterial("na")).toThrowError();
	});
});
