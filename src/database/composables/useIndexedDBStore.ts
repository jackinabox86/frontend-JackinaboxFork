import { IDBPDatabase, openDB } from "idb";

import config from "@/lib/config";

import { KeyOfStore } from "@/database/composables/useIndexedDBStore.types";
import { DB_SCHEMA } from "@/database/schema";

export async function requestPersistence() {
	if (navigator && navigator.storage && navigator.storage.persist) {
		await navigator.storage.persist();
	}
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
	if (!dbPromise) {
		dbPromise = openDB(
			config.INDEXEDDB_DBNAME,
			Number(__INDEXEDDB_VERSION__),
			{
				upgrade(upgradeDb) {
					for (const storeName in DB_SCHEMA) {
						const { keyPath, indexes } = DB_SCHEMA[storeName];
						if (upgradeDb.objectStoreNames.contains(storeName)) {
							upgradeDb.deleteObjectStore(storeName);
						}
						const store = upgradeDb.createObjectStore(storeName, {
							keyPath,
						});
						if (indexes) {
							for (const { name, keyPath, options } of indexes) {
								store.createIndex(name, keyPath, options);
							}
						}
					}
				},
			}
		);
	}
	// Request persistence after DB is ready
	try {
		await requestPersistence();
	} catch {
		// ignore
	}

	return dbPromise;
}

/**
 * Testing / dev utility: completely resets the DB and clears cached dbPromise.
 */
export async function resetDB(): Promise<void> {
	if (dbPromise) {
		(await dbPromise).close();
		dbPromise = null;
	}
	await indexedDB.deleteDatabase(config.INDEXEDDB_DBNAME);
}

export function useIndexedDBStore<T extends object, K extends keyof T & string>(
	storeName: string,
	keyPath: K
) {
	// Basic CRUD methods for all IndexedDBStores

	async function get<K extends keyof T>(
		key: KeyOfStore<T, K>
	): Promise<T | undefined> {
		const db = await getDB();
		return db.get(storeName, key);
	}

	async function getAll(): Promise<T[]> {
		const db = await getDB();
		return db.getAll(storeName);
	}

	async function set(item: T): Promise<void> {
		const db = await getDB();
		await db.put(storeName, item);
	}

	async function setMany(items: T[], wipe: boolean = false): Promise<void> {
		const db = await getDB();
		const tx = db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);

		// if set, clears existing store data
		if (wipe) await store.clear();

		items.forEach((i) => store.put(i));

		await tx.done;
	}

	async function remove<K extends keyof T>(
		key: KeyOfStore<T, K>
	): Promise<void> {
		const db = await getDB();
		await db.delete(storeName, key);
	}

	return {
		keyPath,
		get,
		getAll,
		set,
		setMany,
		remove,
	} as const;
}
