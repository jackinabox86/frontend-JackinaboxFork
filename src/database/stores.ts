import { useIndexedDBStore } from "@/database/composables/useIndexedDBStore";

// Types & Interfaces
import { IMaterial, IPlanet } from "@/features/api/gameData.types";

export const materialsStore = useIndexedDBStore<IMaterial>(
	"gamedata_materials"
	// keyPath: "Ticker",
	// indexes: [
	// 	{
	// 		name: "byMaterialId",
	// 		keyPath: "MaterialId",
	// 		options: { unique: true },
	// 	},
	// 	{ name: "byCategoryId", keyPath: "CategoryId" },
	// ],});
);

export const planetsStore = useIndexedDBStore<IPlanet>(
	"gamedata_planets"
	// 	{
	// 	storeName: "gamedata_planets",
	// 	keyPath: "PlanetNaturalId",
	// }
);
