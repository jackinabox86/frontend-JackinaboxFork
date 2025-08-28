/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_APP_VERSION: string;
	readonly VITE_GAME_DATA_STALE_MINUTES_BUILDINGS: number;
	readonly VITE_GAME_DATA_STALE_MINUTES_RECIPES: number;
	readonly VITE_GAME_DATA_STALE_MINUTES_MATERIALS: number;
	readonly VITE_GAME_DATA_STALE_MINUTES_EXCHANGES: number;
	readonly VITE_GAME_DATA_STALE_MINUTES_PLANETS: number;

	readonly VITE_POSTHOG_TOKEN: string | undefined;
	readonly VITE_POSTHOG_NAME: string | undefined;

	readonly VITE_INDEXEDDB_DBNAME: string | undefined;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
