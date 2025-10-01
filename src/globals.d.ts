/// <reference types="vite/client" />

declare const __INDEXEDDB_VERSION__: number;
declare const __APP_VERSION__: string;

interface Window {
	__APP_CONFIG__?: {
		POSTHOG_KEY?: string;
	};
}
