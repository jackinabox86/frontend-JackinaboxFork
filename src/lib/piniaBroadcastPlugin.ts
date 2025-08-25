import type { PiniaPluginContext } from "pinia";
import { toRaw, isRef } from "vue";

function deepUnwrap(value: unknown): unknown {
	if (isRef(value)) return deepUnwrap(value.value);

	if (Array.isArray(value)) {
		return value.map((v) => deepUnwrap(toRaw(v)));
	}

	if (value && typeof value === "object") {
		const raw = toRaw(value);
		return Object.fromEntries(
			Object.entries(raw).map(([k, v]) => [k, deepUnwrap(v)])
		);
	}

	return value;
}

function hasRandomUUID(): boolean {
	return (
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
	);
}

declare module "pinia" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export interface DefineStoreOptionsBase<S extends StateTree, Store> {
		broadcast?: {
			enable?: boolean;
			pick?: string[];
			debounce?: number;
			channel?: string;
		};
	}
}

type PluginOptions = {
	enable?: boolean;
	pick?: string[];
	debounce?: number;
	channel?: string;
};

export interface BroadcastMessage {
	storeId: string;
	clientId: string;
	timestamp: number;
	path: string;
	data: unknown;
}

export interface WorkerMessage {
	path: string;
	newState: unknown;
}

export function usePiniaBroadcast(globalOptions?: Partial<PluginOptions>) {
	// generate random client uuid
	const CLIENT_ID: string = hasRandomUUID()
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

	// options:
	const defaultEnable: boolean = globalOptions?.enable ?? false;
	const defaultDebounce: number | undefined = globalOptions?.debounce ?? 250;
	const defaultChannel: string = globalOptions?.channel ?? "pinia_broadcast";

	return (context: PiniaPluginContext) => {
		const store = context.store;
		const options = context.options;

		// setup options
		const storeConfig = options.broadcast ?? {};
		const enable = storeConfig.enable ?? defaultEnable;

		// return if not enabled, dont run anything
		if (!enable) return;

		// current config
		const channel = storeConfig.channel ?? defaultChannel;
		const picks: string[] = Array.isArray(storeConfig.pick)
			? storeConfig.pick
			: [];
		const debounceRaw =
			typeof storeConfig.debounce === "number"
				? storeConfig.debounce
				: defaultDebounce;
		const useDebounce = typeof debounceRaw === "number" && debounceRaw > 0;
		const debounceMs = useDebounce ? debounceRaw : 0;

		// setup broadcast channel
		const broadcastChannel = new BroadcastChannel(channel);

		// register worker
		const worker = new Worker(
			new URL("piniaBroadcastWorker.ts", import.meta.url),
			{ type: "module" }
		);

		// Subscribe to incoming
		const onMessage = (message: MessageEvent) => {
			if (
				message.data.storeId != store.$id ||
				CLIENT_ID === message.data.clientId
			)
				return;

			// update stores state
			const { path, data } = message.data;
			store[path] = data;
		};

		worker.onmessage = (e) => {
			const { path, state } = e.data;

			const msg: BroadcastMessage = {
				storeId: store.$id,
				clientId: CLIENT_ID,
				timestamp: Date.now(),
				path: path,
				data: state,
			};

			broadcastChannel.postMessage(msg);
		};

		// Subscribe to the store mutations
		store.$subscribe((_mutation, state) => {
			// get the updated state for the defined pick values
			for (const pick of picks) {
				const mutatedState = deepUnwrap(state[pick]);

				worker.postMessage({
					path: pick,
					newState: mutatedState,
					debounce: debounceMs,
				});
			}
		});

		broadcastChannel.addEventListener("message", onMessage);
	};
}
