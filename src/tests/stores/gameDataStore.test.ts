import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// test data
import recipes from "@/tests/test_data/api_data_recipes.json";
import buildings from "@/tests/test_data/api_data_buildings.json";
import materials from "@/tests/test_data/api_data_materials.json";
import exchanges from "@/tests/test_data/api_data_exchanges.json";
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
			gameDataStore.materials = true;
			gameDataStore.exchanges = true;
			gameDataStore.buildings = true;
			gameDataStore.planets = true;
			gameDataStore.fio_storage_planets = true;
			gameDataStore.fio_storage_ships = true;
			gameDataStore.fio_storage_warehouses = true;
			gameDataStore.fio_sites_planets = true;
			gameDataStore.fio_sites_ships = true;

			gameDataStore.$reset();

			expect(Object.keys(gameDataStore.materials).length).toBe(0);
			expect(Object.keys(gameDataStore.exchanges).length).toBe(0);
			expect(Object.keys(gameDataStore.buildings).length).toBe(0);
			expect(Object.keys(gameDataStore.planets).length).toBe(0);
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
			it("setMaterials", async () => {
				gameDataStore.setMaterials(materials);
				expect(Object.keys(gameDataStore.materials).length).toBe(345);
			});
			it("setExchanges", async () => {
				gameDataStore.setExchanges(exchanges);
				expect(Object.keys(gameDataStore.exchanges).length).toBe(6980);
			});
			it("setRecipes", async () => {
				gameDataStore.setRecipes(recipes);
				expect(Object.keys(gameDataStore.recipes).length).toBe(48);
			});
			it("setBuildings", async () => {
				gameDataStore.setBuildings(buildings);
				expect(Object.keys(gameDataStore.buildings).length).toBe(84);
			});

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
