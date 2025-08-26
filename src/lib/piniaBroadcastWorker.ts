import { deepEqual } from "fast-equals";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

// setup a map to have store changes
const lastValues = new Map<string, unknown>();

self.onmessage = (e) => {
	const { path, newState, debounce, persisted } = e.data;

	if (timers.has(path)) clearTimeout(timers.get(path));

	timers.set(
		path,
		setTimeout(() => {
			// compare to the last version
			const last = lastValues.get(path);

			// if there is no last value, we're coming from
			// hydration, set and skip out
			if (!last && persisted) {
				lastValues.set(path, newState);
				timers.delete(path);
				return;
			}

			// check deep equal, post if we need to do sth.
			if (!deepEqual(newState, last)) {
				// set as new last state
				lastValues.set(path, newState);

				// post message back
				self.postMessage({ path: path, state: newState });
			}

			// reset timer
			timers.delete(path);
		}, debounce)
	);
};
