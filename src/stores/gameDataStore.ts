import { defineStore } from "pinia";
import { ref, Ref } from "vue";

// Util
import { inertClone } from "@/util/data";

// Types & Interfaces
import {
	IBuildingsRecord,
	IExchangesRecord,
	IMaterialsRecord,
	IPlanetsRecord,
	IRecipesRecord,
} from "@/stores/gameDataStore.types";
import {
	IMaterial,
	IExchange,
	IRecipe,
	IBuilding,
	IPlanet,
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

		/** Key: Material.Ticker */
		const materials: Ref<IMaterialsRecord> = ref({});
		/** Key: Exchange.TickerId */
		const exchanges: Ref<IExchangesRecord> = ref({});
		/** Key: Recipe.BuildingTicker */
		const recipes: Ref<IRecipesRecord> = ref({});
		/** Key: Building.Ticker */
		const buildings: Ref<IBuildingsRecord> = ref({});
		/** Key: Planet.PlanetNaturalId */
		const planets: Ref<IPlanetsRecord> = ref({});

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
			materials.value = {};
			exchanges.value = {};
			buildings.value = {};
			planets.value = {};
			fio_storage_planets.value = {};
			fio_storage_ships.value = {};
			fio_storage_warehouses.value = {};
			fio_sites_planets.value = {};
			fio_sites_ships.value = {};
		}

		/**
		 * Gets a planet by its Natural Id
		 * @author jplacht
		 *
		 * @async
		 * @param {string} planetNaturalId Planet Natural ID (e.g. 'OT-580b')
		 * @returns {Promise<IPlanet>} Planet
		 */
		async function getPlanet(planetNaturalId: string): Promise<IPlanet> {
			const findPlanet: IPlanet | undefined =
				planets.value[planetNaturalId];

			if (findPlanet) return inertClone(findPlanet);

			throw new Error(
				`Planet ${planetNaturalId} not available. Make sure to load its game data.`
			);
		}

		/**
		 * Gets all stored material information
		 * @author jplacht
		 *
		 * @returns {IMaterial[]} Material Data
		 */
		function getMaterials(): IMaterial[] {
			return Object.values(materials.value).map((e) => inertClone(e));
		}

		/**
		 * Sets material values by their Ticker
		 * @author jplacht
		 *
		 * @param {IMaterial[]} data Material Data
		 */
		function setMaterials(data: IMaterial[]): void {
			materials.value = {};
			data.forEach((e) => {
				materials.value[e.Ticker] = e;
			});
		}

		/**
		 * Sets exchange data by their Ticker
		 * @author jplacht
		 *
		 * @param {IExchange[]} data Exchange Data
		 */
		function setExchanges(data: IExchange[]): void {
			exchanges.value = {};
			data.forEach((e) => {
				exchanges.value[e.TickerId] = e;
			});
		}

		/**
		 * Sets recipes by their BuildingTicker as list per Building
		 * @author jplacht
		 *
		 * @param {IRecipe[]} data Recipe Data
		 */
		function setRecipes(data: IRecipe[]): void {
			recipes.value = {};
			data.forEach((e) => {
				if (recipes.value[e.BuildingTicker]) {
					recipes.value[e.BuildingTicker].push(e);
				} else {
					recipes.value[e.BuildingTicker] = [e];
				}
			});
		}

		/**
		 * Sets buildings by their Ticker
		 * @author jplacht
		 *
		 * @param {IBuilding[]} data Building Data
		 */
		function setBuildings(data: IBuilding[]): void {
			buildings.value = {};
			data.forEach((e) => {
				buildings.value[e.Ticker] = e;
			});
		}

		/**
		 * Sets Planets by their Natural Id
		 * @author jplacht
		 *
		 * @param {IPlanet} data Planet Data
		 */
		function setPlanet(data: IPlanet): void {
			planets.value[data.PlanetNaturalId] = data;
		}

		/**
		 * Sets multiple planets each by their Natural Id
		 * @author jplacht
		 *
		 * @param {IPlanet[]} data Planet Data
		 */
		function setMultiplePlanets(data: IPlanet[]): void {
			data.forEach((e) => setPlanet(e));
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
			materials,
			exchanges,
			recipes,
			buildings,
			planets,
			fio_storage_planets,
			fio_storage_warehouses,
			fio_storage_ships,
			fio_sites_planets,
			fio_sites_ships,
			// reset
			$reset,
			// setters
			setMaterials,
			setExchanges,
			setRecipes,
			setBuildings,
			setPlanet,
			setMultiplePlanets,
			setFIOSitesData,
			setFIOStorageData,
			// functions
			getPlanet,
			getMaterials,
		};
	},
	{
		persist: {
			pick: [
				"materials",
				"exchanges",
				"recipes",
				"buildings",
				"planets",
				"fio_storage_planets",
				"fio_storage_warehouses",
				"fio_storage_ships",
				"fio_sites_planets",
				"fio_sites_ships",
			],
		},
		broadcast: {
			enable: true,
			pick: [
				"materials",
				"exchanges",
				"recipes",
				"buildings",
				"planets",
				"fio_storage_planets",
				"fio_storage_warehouses",
				"fio_storage_ships",
				"fio_sites_planets",
				"fio_sites_ships",
			],
			channel: "prunplanner_game_data",
			debounce: 5_000,
		},
	}
);
