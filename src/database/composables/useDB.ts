import { ref } from "vue";

import { useIndexedDBStore } from "@/database/composables/useIndexedDBStore";
import { KeyOfStore } from "@/database/composables/useIndexedDBStore.types";

export function useDB<T extends object, K extends keyof T & string>(
	store: ReturnType<typeof useIndexedDBStore<T>>,
	_keyProp: K
) {
	const cache = new Map<string, T>();
	const allData = ref<T[]>([]);

	async function preload(force: boolean = false) {
		// skip if already loaded
		if (!force && allData.value.length) return;

		allData.value = await store.getAll();

		// clear and set cache
		cache.clear();
		for (const item of allData.value) {
			// @ts-expect-error keyPath dynamically
			cache.set(item[store.keyPath], item);
		}
	}

	async function get(key: KeyOfStore<T, K>): Promise<T | undefined> {
		// return from cache
		if (cache.has(key as string)) return cache.get(key as string)!;

		// check in database
		const item = await store.get(key);
		if (item) cache.set(key as string, item);
		return item;
	}

	return {
		allData,
		preload,
		get,
	};
}
