import { useIndexedDBStore } from "@/database/composables/useIndexedDBStore";

// Types & Interfaces
import {
	IExchange,
	IMaterial,
	IPlanet,
	IRecipe,
} from "@/features/api/gameData.types";

export const materialsStore =
	useIndexedDBStore<IMaterial>("gamedata_materials");

export const planetsStore = useIndexedDBStore<IPlanet>("gamedata_planets");

export const exchangesStore =
	useIndexedDBStore<IExchange>("gamedata_exchanges");

export const recipesStore = useIndexedDBStore<IRecipe>("gamedata_recipes");
