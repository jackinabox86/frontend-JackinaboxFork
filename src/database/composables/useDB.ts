import { Ref, ref } from "vue";

import { useIndexedDBStore } from "@/database/composables/useIndexedDBStore";
import { KeyOfStore } from "@/database/composables/useIndexedDBStore.types";

type SharedState<T extends object> = {
	allData: ReturnType<typeof ref<T[]>>;
	cache: Map<string, T>;
	loaded: boolean;
};

const storeStateMap = new WeakMap<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ReturnType<typeof useIndexedDBStore<any>>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	SharedState<any>
>();

function ensureState<T extends object>(
	store: ReturnType<typeof useIndexedDBStore<T>>
): SharedState<T> {
	let state = storeStateMap.get(store) as SharedState<T> | undefined;
	if (!state) {
		state = {
			allData: ref<T[]>([]) as Ref<T[]>,
			cache: new Map<string, T>(),
			loaded: false,
		};
		storeStateMap.set(store, state);
	}
	return state;
}

export function useDB<T extends object, K extends keyof T & string>(
	store: ReturnType<typeof useIndexedDBStore<T>>,
	_keyProp: K
) {
	const state = ensureState(store);

	async function preload(force: boolean = false) {
		// skip if already loaded
		if (!force && state.loaded) return;

		const all = await store.getAll();

		state.allData.value = all;
		state.cache.clear();

		for (const item of all) {
			// @ts-expect-error keyPath dynamically
			state.cache.set(item[store.keyPath], item);
		}

		state.loaded = true;
	}

	async function get(key: KeyOfStore<T, K>): Promise<T | undefined> {
		// return from cache
		if (state.cache.has(key as string))
			return state.cache.get(key as string)!;

		// check in database
		const item = await store.get(key);
		if (item) state.cache.set(key as string, item);
		return item;
	}

	return {
		allData: state.allData,
		preload,
		get,
	};
}
