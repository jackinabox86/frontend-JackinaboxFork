import { defineStore } from "pinia";
import { ref, Ref } from "vue";

// Types & Interfaces
import {
	IFIOStorage,
	IFIOStorageShip,
	IFIOStorageWarehouse,
	IFIOStoragePlanet,
	IFIOSites,
	IFIOSitePlanet,
	IFIOSiteShip,
} from "@/features/api/gameData.types";

export const useGameDataStore = defineStore(
	"prunplanner_game_data",
	() => {
		// other stores

		// state
		const fio_storage_planets: Ref<Record<string, IFIOStoragePlanet>> = ref(
			{}
		);
		const fio_storage_warehouses: Ref<
			Record<string, IFIOStorageWarehouse>
		> = ref({});
		const fio_storage_ships: Ref<Record<string, IFIOStorageShip>> = ref({});
		const fio_sites_planets: Ref<Record<string, IFIOSitePlanet>> = ref({});
		const fio_sites_ships: Ref<Record<string, IFIOSiteShip>> = ref({});

		// state reset

		/**
		 * Resets all store variables to their default
		 * @author jplacht
		 */
		function $reset(): void {
			fio_storage_planets.value = {};
			fio_storage_ships.value = {};
			fio_storage_warehouses.value = {};
			fio_sites_planets.value = {};
			fio_sites_ships.value = {};
		}

		/**
		 * Sets FIO Sites data separated by Planet and Ship sites
		 * @author jplacht
		 *
		 * @param {IFIOSites} data FIO Sites Data
		 */
		function setFIOSitesData(data: IFIOSites): void {
			fio_sites_planets.value = {};

			Object.values(data.planets).forEach((sp) => {
				fio_sites_planets.value[sp.PlanetIdentifier] = sp;
			});

			fio_sites_ships.value = {};

			Object.values(data.ships).forEach((ss) => {
				fio_sites_ships.value[ss.Registration] = ss;
			});
		}

		/**
		 * Sets FIO Storage data separated by Planets, Warehouses and Ships
		 * @author jplacht
		 *
		 * @param {IFIOStorage} data FIO Storage Data
		 */
		function setFIOStorageData(data: IFIOStorage): void {
			fio_storage_planets.value = data.planets;
			fio_storage_warehouses.value = data.warehouses;
			fio_storage_ships.value = data.ships;
		}

		return {
			// state
			fio_storage_planets,
			fio_storage_warehouses,
			fio_storage_ships,
			fio_sites_planets,
			fio_sites_ships,
			// reset
			$reset,
			// setters
			setFIOSitesData,
			setFIOStorageData,
			// functions
		};
	},
	{
		persist: {
			pick: [
				"fio_storage_planets",
				"fio_storage_warehouses",
				"fio_storage_ships",
				"fio_sites_planets",
				"fio_sites_ships",
			],
		},
		// broadcast: {
		// 	enable: true,
		// 	persisted: true,
		// 	pick: [
		// 		"materials",
		// 		"exchanges",
		// 		"recipes",
		// 		"buildings",
		// 		"planets",
		// 		"fio_storage_planets",
		// 		"fio_storage_warehouses",
		// 		"fio_storage_ships",
		// 		"fio_sites_planets",
		// 		"fio_sites_ships",
		// 	],
		// 	channel: "prunplanner_game_data",
		// 	debounce: 5_000,
		// },
	}
);
