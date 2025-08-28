export type KeyOfStore<T, K extends keyof T> = T[K] extends IDBValidKey
	? T[K]
	: never;
