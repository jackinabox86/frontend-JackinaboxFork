declare const __INDEXEDDB_VERSION__: readonly number;
declare const __APP_VERSION__: string;

declare global {
	interface Window {
		__APP_CONFIG__?: {
			POSTHOG_KEY?: string;
		};
	}
}

export {};
