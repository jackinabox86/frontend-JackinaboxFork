import { PiniaPluginContext } from "pinia";
import { isReactive, reactive, toRaw } from "vue";

declare module "pinia" {
	export interface DefineStoreOptionsBase<S extends StateTree, Store> {
		broadcastWatch?: {
			pick?: string[];
			debounce?: number;
			channel?: string;
		};
	}
}

function safeStructuredClone<T>(value: T) {
	const raw = toRaw(value);
	try {
		if (typeof (globalThis as any).structuredClone === "function")
			return (globalThis as any).structuredClone(raw);
	} catch {
		// ignore
	}
	// JSON fallback
	return JSON.parse(JSON.stringify(raw));
}

/** Return true for plain `{}` objects (not arrays, not class instances) */
function isPlainObject(v: unknown): v is Record<string, any> {
	return Object.prototype.toString.call(v) === "[object Object]";
}

/** Shallow equality for arrays (fast path) */
function arraysEqual(a: unknown[], b: any[]) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

/**
 * Update reactive `current` with `incoming` while preserving reactivity when possible.
 *
 * - Arrays: if both arrays and identical items -> no-op; else splice to update in-place.
 * - Plain objects: merge recursively (preserve existing reactive objects).
 * - Non-plain objects (Date, Map, class instances): replace (caller is responsible for serializability).
 * - Primitives: replace (but return current if === to avoid triggering watchers).
 *
 * Returns the value that should be assigned to the store field (often the same `current` reference).
 */
function updateReactiveState(current: unknown, incoming: any): any {
	// fast reference equality -> nothing to do
	if (current === incoming) return current;

	// handle arrays
	if (Array.isArray(incoming)) {
		if (Array.isArray(current)) {
			// fast path: exact same primitive elements -> no-op
			if (arraysEqual(current, incoming)) return current;

			// update in-place to preserve reactivity
			current.splice(0, current.length, ...incoming);
			return current;
		} else {
			// replace with a reactive array if current wasn't an array
			return reactive(Array.from(incoming));
		}
	}

	// handle plain objects (recursive merge)
	if (incoming && isPlainObject(incoming)) {
		// If current is not a plain object, replace with reactive copy
		if (!current || !isPlainObject(current) || Array.isArray(current)) {
			// preserve reactivity by wrapping a new object
			return reactive({ ...incoming });
		}

		// If either is reactive proxy, work on raw to avoid double proxies
		const curRaw = isReactive(current) ? toRaw(current) : current;

		// Merge keys from incoming into current (recursive)
		for (const key of Object.keys(incoming)) {
			const incVal = incoming[key];
			const curVal = curRaw[key];

			// If both plain objects -> recurse
			if (isPlainObject(incVal) && isPlainObject(curVal)) {
				// recursive merge keeps nested reactive objects intact
				updateReactiveState(curVal, incVal);
			} else if (Array.isArray(incVal) && Array.isArray(curVal)) {
				// arrays: reuse logic above (avoid extra allocate)
				if (!arraysEqual(curVal, incVal)) {
					curVal.splice(0, curVal.length, ...incVal);
				}
			} else {
				// primitives or mismatched types -> assign directly (this mutates reactive proxy)
				curRaw[key] = incVal;
			}
		}

		// Remove keys that no longer exist in incoming
		for (const key of Object.keys(curRaw)) {
			if (!(key in incoming)) {
				delete curRaw[key];
			}
		}

		return current;
	}

	// Non-plain objects (Date, Map, Set, class instances) or primitives: direct replacement
	return incoming;
}

function debouncePerPath(
	fn: (key: string, value: unknown) => void,
	delay: number
) {
	const timers = new Map<string, number>();
	return (key: string, value: unknown) => {
		const t = timers.get(key);
		if (t !== undefined) window.clearTimeout(t);
		const id = window.setTimeout(() => {
			timers.delete(key);
			fn(key, value);
		}, delay) as unknown as number;
		timers.set(key, id);
	};
}

/** Client id to ignore own messages */
function makeClientId() {
	return (
		globalThis.crypto?.randomUUID?.() ??
		`${Date.now()}-${Math.random().toString(36).slice(2)}`
	);
}

function serializeForComparison<T>(v: T) {
	try {
		if (typeof (globalThis as any).structuredClone === "function")
			return (globalThis as any).structuredClone(v);
	} catch {
		// ignore
	}
	return JSON.stringify(v);
}

export function createBroadcastChannelPlugin(globalOptions?: {
	channel?: string;
	debounce?: number;
}) {
	const clientId = makeClientId();
	const defaultChannel = globalOptions?.channel ?? "pinia_sync";
	const defaultDebounce = globalOptions?.debounce;

	return (context: PiniaPluginContext) => {
		const store = context.store;
		const options: any = context.options ?? {};

		const cfg = options.broadcastWatch ?? {};
		const paths: string[] = Array.isArray(cfg.pick) ? cfg.pick : [];
		if (!paths.length) return;

		const channelName = cfg.channel ?? defaultChannel;
		const resolvedDebounceRaw =
			typeof cfg.debounce === "number" ? cfg.debounce : defaultDebounce;
		const useDebounce =
			typeof resolvedDebounceRaw === "number" && resolvedDebounceRaw > 0;
		const debounceMs = useDebounce ? (resolvedDebounceRaw as number) : 0;

		const bc = new BroadcastChannel(channelName);
		let isApplyingRemote = false;

		// store serialized last values for simple change detection
		const lastValues = new Map<string, string>();

		const broadcaster = (path: string, value: unknown) => {
			const clonedValue = safeStructuredClone(value);
			const msg = {
				storeId: store.$id,
				clientId,
				ts: Date.now(),
				updates: {
					[path]: clonedValue,
				},
			};
			try {
				bc.postMessage(msg);
			} catch {
				try {
					const jsonSafe = JSON.parse(JSON.stringify(msg));
					bc.postMessage(jsonSafe);
				} catch (err) {
					console.warn(
						"BroadcastChannel postMessage failed (json fallback)",
						err
					);
				}
			}
		};

		const applyer = (path: string, payloadValue: unknown) => {
			try {
				isApplyingRemote = true;
				store.$state[path] = updateReactiveState(
					store.$state[path],
					payloadValue
				);
				// update lastValues, not going to rebroadcast it
				try {
					lastValues.set(path, serializeForComparison(payloadValue));
				} catch {
					// ignore
				}
			} finally {
				setTimeout(() => {
					isApplyingRemote = false;
				}, 0);
			}
		};

		const broadcastPerPath = useDebounce
			? debouncePerPath(
					(path, value) => broadcaster(path, value),
					debounceMs
			  )
			: broadcaster;

		const unsubscribe = store.$subscribe((_mutation, state) => {
			if (isApplyingRemote) return;
			try {
				for (const path of paths) {
					const val = state[path];
					const cloned = safeStructuredClone(val);
					const serialized = serializeForComparison(cloned);
					const prevSerialized = lastValues.get(path);

					// only broadcast if not the same as last send
					if (prevSerialized !== serialized) {
						broadcastPerPath(path, cloned);
						lastValues.set(path, serialized);
					}
				}
			} catch (err) {
				console.warn("Error broadcasting Pinia updates", err);
			}
		});

		// Handle incoming
		const onMessage = (ev: MessageEvent) => {
			const data = ev.data;
			if (!data || data.storeId !== store.$id) return;
			if (data.clientId === clientId) return;

			for (const path of Object.keys(data.updates)) {
				if (!paths.includes(path)) continue;
				applyer(path, data.updates[path]);
			}
		};
		bc.addEventListener("message", onMessage);

		// Cleanup
		const onBeforeUnload = () => {
			try {
				// send out all thats still pending
				unsubscribe();
			} catch (err) {
				console.warn(err);
			}
			try {
				bc.removeEventListener("message", onMessage);
			} catch (err) {
				console.warn(err);
			}
			try {
				bc.close();
			} catch (err) {
				console.warn(err);
			}
		};
		window.addEventListener("beforeunload", onBeforeUnload);
	};
}
