interface StoreSchema {
	keyPath: string;
	indexes?: IndexDef[];
}

interface IndexDef {
	name: string;
	keyPath: string;
	options?: IDBIndexParameters;
}

// define all stores in a schema object
export const DB_SCHEMA: Record<string, StoreSchema> = {
	gamedata_materials: {
		keyPath: "Ticker",
		indexes: [
			{
				name: "byMaterialId",
				keyPath: "MaterialId",
				options: { unique: true },
			},
			{ name: "byCategoryId", keyPath: "CategoryId" },
		],
	},
	gamedata_planets: {
		keyPath: "PlanetNaturalId",
	},
	gamedata_exchanges: {
		keyPath: "TickerId",
		indexes: [
			{
				name: "byMaterialTicker",
				keyPath: "MaterialTicker",
			},
			{
				name: "byExchangeCode",
				keyPath: "ExchangeCode",
			},
		],
	},
	gamedata_recipes: {
		keyPath: "RecipeId",
		indexes: [
			{
				name: "byBuildingTicker",
				keyPath: "BuildingTicker",
			},
		],
	},
	gamedata_buildings: {
		keyPath: "Ticker",
	},
};
