import { useIndexedDBStore } from "@/database/composables/useIndexedDBStore";

// Types & Interfaces
import {
	IBuilding,
	IExchange,
	IMaterial,
	IPlanet,
	IRecipe,
} from "@/features/api/gameData.types";

export const materialsStore = useIndexedDBStore<IMaterial, "Ticker">(
	"gamedata_materials",
	"Ticker" as const
);

export const planetsStore = useIndexedDBStore<IPlanet, "PlanetNaturalId">(
	"gamedata_planets",
	"PlanetNaturalId" as const
);

export const exchangesStore = useIndexedDBStore<IExchange, "TickerId">(
	"gamedata_exchanges",
	"TickerId" as const
);

export const recipesStore = useIndexedDBStore<IRecipe, "RecipeId">(
	"gamedata_recipes",
	"RecipeId" as const
);

export const buildingsStore = useIndexedDBStore<IBuilding, "Ticker">(
	"gamedata_buildings",
	"Ticker" as const
);
