import { defineStore } from "pinia";
import { ref, Ref } from "vue";

// Util
import { inertClone } from "@/util/data";

// Types & Interfaces
import {
	ICX,
	ICXData,
	ICXRecord,
	IEmpireRecord,
	IPlan,
	IPlanEmpireElement,
	IPlanRecord,
	ISharedPlan,
	ISharedRecord,
} from "@/stores/planningStore.types";
import { IShared } from "@/features/api/sharingData.types";
import {
	IFIOSitePlanet,
	IFIOSites,
	IFIOSiteShip,
	IFIOStorage,
	IFIOStoragePlanet,
	IFIOStorageShip,
	IFIOStorageWarehouse,
} from "@/features/api/gameData.types";

export const usePlanningStore = defineStore(
	"prunplanner_planning",
	() => {
		// state
		/** Key: Plan.uuid */
		const plans: Ref<IPlanRecord> = ref({});
		/** Key: Empire.uuid */
		const empires: Ref<IEmpireRecord> = ref({});
		/** Key: CX.uuid */
		const cxs: Ref<ICXRecord> = ref({});
		/** Key: Plan.uuid */
		const shared: Ref<ISharedRecord> = ref({});
		const fio_storage_planets: Ref<Record<string, IFIOStoragePlanet>> = ref(
			{}
		);
		const fio_storage_warehouses: Ref<
			Record<string, IFIOStorageWarehouse>
		> = ref({});
		const fio_storage_ships: Ref<Record<string, IFIOStorageShip>> = ref({});
		const fio_sites_planets: Ref<Record<string, IFIOSitePlanet>> = ref({});
		const fio_sites_ships: Ref<Record<string, IFIOSiteShip>> = ref({});

		/**
		 * Resets all store variables to their initial values
		 * @author jplacht
		 */
		function $reset(): void {
			plans.value = {};
			empires.value = {};
			cxs.value = {};
			shared.value = {};
			fio_storage_planets.value = {};
			fio_storage_ships.value = {};
			fio_storage_warehouses.value = {};
			fio_sites_planets.value = {};
			fio_sites_ships.value = {};
		}

		// setters

		/**
		 * Sets empires by their Uuid
		 * @author jplacht
		 *
		 * @param {IPlanEmpireElement[]} empireList Empire Data
		 */
		function setEmpires(empireList: IPlanEmpireElement[]): void {
			empires.value = {};
			// store by Empire.uuid
			empireList.forEach((e) => {
				empires.value[e.uuid] = inertClone(e);
			});
		}

		/**
		 * Sets plans by their UUID
		 * @author jplacht
		 *
		 * @param {IPlan} data Plan Data
		 */
		function setPlan(data: IPlan): void {
			if (!data.uuid)
				throw new Error("Can't set plan data for undefined uuid.");

			plans.value[data.uuid] = data;
		}

		/**
		 * Sets multiple plans by their Uuid
		 * @author jplacht
		 *
		 * @param {IPlan[]} data Plan Data List
		 */
		function setPlans(data: IPlan[]): void {
			data.forEach((p) => setPlan(p));
		}

		/**
		 * Deletes a plan by its Uuid
		 * @author jplacht
		 *
		 * @param {string} planUuid Plan Uuid
		 */
		function deletePlan(planUuid: string): void {
			delete plans.value[planUuid];
		}

		/**
		 * Sets multiple CX by their Uuid
		 * @author jplacht
		 *
		 * @param {ICX[]} data CX Data List
		 */
		function setCXs(data: ICX[]): void {
			cxs.value = {};

			// store by CX.uuid
			data.forEach((c) => {
				cxs.value[c.uuid] = inertClone(c);
			});
		}

		function setCX(cxUuid: string, data: ICXData): void {
			if (cxs.value[cxUuid]) cxs.value[cxUuid].cx_data = data;
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

		/**
		 * Sets Shared Plans information by their Plan Uuid
		 * @author jplacht
		 *
		 * @param {IShared[]} data Shared Data List
		 */
		function setSharedList(data: IShared[]): void {
			shared.value = {};
			data.forEach((s) => {
				shared.value[s.plan_uuid] = inertClone(s);
			});
		}

		/**
		 * Deletes a shared plan by its plan Uuid
		 * @author jplacht
		 *
		 * @param {string} planUuid Plan Uuid
		 */
		function deleteShared(planUuid: string): void {
			delete shared.value[planUuid];
		}

		/**
		 * Get CX Preference information by CX Uuid
		 * @author jplacht
		 *
		 * @param {string} cxUuid UUid
		 * @returns {ICX} CX Preference Data
		 */
		function getCX(cxUuid: string): ICX {
			const findCX = cxs.value[cxUuid];

			if (findCX) return inertClone(findCX);

			throw new Error(
				`No data: CX '${cxUuid}'. Ensure CX uuid is valid and planning data has been loaded.`
			);
		}

		/**
		 * Gets a plan by its Uuid
		 *
		 * @author jplacht
		 *
		 * @async
		 * @param {string} planUuid Uuid
		 * @returns {Promise<IPlan>} Plan Data
		 */
		async function getPlan(planUuid: string): Promise<IPlan> {
			// try getting from already fetched data first
			const findPlan: IPlan | undefined = plans.value[planUuid];

			if (findPlan) return inertClone(plans.value[planUuid]);

			throw new Error(
				`No data: Plan '${planUuid}'. Ensure Plan uuid is valid and planning data has been loaded.`
			);
		}

		/**
		 * Gets all exchange preferences either from store or directly from
		 * the backend API if they were not fetched already
		 *
		 * @author jplacht
		 *
		 * @returns {ICX[]} CX Preference Data Array
		 */
		function getAllCX(): ICX[] {
			return Object.values(cxs.value);
		}

		/**
		 * Gets all sharing information from backend
		 * @author jplacht
		 *
		 * @returns {ISharedPlan[]} Sharing Information List
		 */
		function getSharedList(): ISharedPlan[] {
			return Object.values(shared.value);
		}

		return {
			// state
			plans,
			empires,
			cxs,
			shared,
			fio_storage_planets,
			fio_storage_warehouses,
			fio_storage_ships,
			fio_sites_planets,
			fio_sites_ships,
			// reset
			$reset,
			// setters
			setEmpires,
			setPlan,
			setPlans,
			setCXs,
			setCX,
			setSharedList,
			deleteShared,
			deletePlan,
			setFIOSitesData,
			setFIOStorageData,
			// getters
			getCX,
			getPlan,
			getAllCX,
			getSharedList,
		};
	},
	{
		persist: {
			pick: ["plans", "empires", "cxs", "shared"],
		},
		// broadcast: {
		// 	enable: true,
		// 	persisted: true,
		// 	pick: ["plans", "empires", "cxs", "shared"],
		// 	debounce: 2_000,
		// 	channel: "prunplanner_planning_data",
		// },
	}
);
