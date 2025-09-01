import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// test data
import fio_sites from "@/tests/test_data/api_data_fio_sites.json";
import fio_storage from "@/tests/test_data/api_data_fio_storage.json";

// stores

import { useGameDataStore } from "@/stores/gameDataStore";

describe("GameData Store", async () => {
	let gameDataStore: any;

	beforeEach(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();

		vi.resetAllMocks();
	});

	describe("Functions", () => {
		it("$reset", async () => {
			gameDataStore.fio_storage_planets = true;
			gameDataStore.fio_storage_ships = true;
			gameDataStore.fio_storage_warehouses = true;
			gameDataStore.fio_sites_planets = true;
			gameDataStore.fio_sites_ships = true;

			gameDataStore.$reset();

			expect(Object.keys(gameDataStore.fio_storage_planets).length).toBe(
				0
			);
			expect(Object.keys(gameDataStore.fio_storage_ships).length).toBe(0);
			expect(
				Object.keys(gameDataStore.fio_storage_warehouses).length
			).toBe(0);
			expect(Object.keys(gameDataStore.fio_sites_planets).length).toBe(0);
			expect(Object.keys(gameDataStore.fio_sites_ships).length).toBe(0);
		});

		describe("setters", async () => {
			it("setFIOSitesData", async () => {
				gameDataStore.setFIOSitesData(fio_sites);
				expect(
					Object.keys(gameDataStore.fio_sites_planets).length
				).toBe(18);
				expect(Object.keys(gameDataStore.fio_sites_ships).length).toBe(
					24
				);
			});
			it("setFIOStorageData", async () => {
				gameDataStore.setFIOStorageData(fio_storage);
				expect(
					Object.keys(gameDataStore.fio_storage_planets).length
				).toBe(18);
				expect(
					Object.keys(gameDataStore.fio_storage_ships).length
				).toBe(24);
				expect(
					Object.keys(gameDataStore.fio_storage_warehouses).length
				).toBe(5);
			});
		});
	});
});
