import { ref, Ref } from "vue";

// static systemstars .json from FIO
import systemsJson from "@/assets/static/fio_systemstars.json";

// Types & Interfaces
import { AdjecentList, ISystemsJSON } from "./usePathfinder.types";

/**
 * Singleton-style state on composable level
 * Graph + Cache are initialized only ONCE per session
 */

let initialized: boolean = false;
let adj: AdjecentList;
let idToIndex: Map<string, number>;
let indexToId: string[];
let parentCache: Map<number, Int32Array>;

export function usePathfinder() {
	const ready: Ref<boolean> = ref(false);

	// one time initialization
	if (!initialized) {
		const systems = systemsJson as ISystemsJSON[];
		const n = systems.length;

		idToIndex = new Map<string, number>();
		indexToId = new Array(n);

		// map systems to indexes, stay numeric
		for (let i = 0; i < n; i++) {
			idToIndex.set(systems[i].SystemId, i);
			indexToId[i] = systems[i].SystemId;
		}

		// create adjecent arrays and fill them
		adj = new Array(n);
		for (let i = 0; i < n; i++) adj[i] = [];

		// fyi, connections are always bidirectional
		for (let i = 0; i < n; i++) {
			const system = systems[i];
			for (const c of system.Connections ?? []) {
				const j = idToIndex.get(c.ConnectingId);

				// no mapped index, continue
				if (j === undefined) continue;

				adj[i].push(j);

				// add bidirectional one if i and j differ
				if (i !== j) adj[j].push(i);
			}
		}

		// de-duplicating all neighbors via a SET
		for (let i = 0; i < n; i++) {
			adj[i] = Array.from(new Set(adj[i]));
		}

		// clear parent cache
		parentCache = new Map<number, Int32Array>();
		initialized = true;
	}

	ready.value = true;

	/**
	 * Performs a BFS (Breadth-First Search) starting from `sourceIdx`
	 * and returns a parent array that allows reconstructing shortest paths
	 * to all reachable nodes.
	 *
	 * @param sourceIdx - index of the source node
	 * @returns Int32Array where parent[i] = index of the previous node
	 *          along the shortest path from sourceIdx to i
	 * 			-1 if unreachable
	 */
	function bfsParents(sourceIdx: number): Int32Array {
		const n = adj.length;

		// -1 = not visited or no parent yet
		const parent = new Int32Array(n).fill(-1);
		// 1 visited, 0 not visited
		const visited = new Uint8Array(n);
		const queue: number[] = new Array(n);

		let head = 0;
		let tail = 0;

		// mark source as visited, add source to queue
		visited[sourceIdx] = 1;
		queue[tail++] = sourceIdx;

		while (head < tail) {
			const cur = queue[head++];

			// iterate through all neighbors of current node
			for (const nb of adj[cur]) {
				// skip if visited
				if (visited[nb]) continue;

				visited[nb] = 1;
				parent[nb] = cur;
				queue[tail++] = nb;
			}
		}

		// each element now has the index of the previous node
		// following shortest path from sourceIdx or -1 if unreachable
		return parent;
	}

	function reconstructPath(
		parent: Int32Array,
		sourceIdx: number,
		targetIdx: number
	): string[] | null {
		// path irrelevant, as target and source are same system
		if (sourceIdx === targetIdx) {
			return [indexToId[sourceIdx]];
		}

		// target node is not reachable
		if (parent[targetIdx] === -1) return null;

		const tmp: number[] = [];
		let cur = targetIdx;

		// return from target back to source over indices,
		// move to parent node along shortest path
		while (cur !== -1) {
			tmp.push(cur);
			if (cur === sourceIdx) break;
			cur = parent[cur];
		}

		if (tmp[tmp.length - 1] !== sourceIdx) return null;

		tmp.reverse();
		return tmp.map((i) => indexToId[i]);
	}

	function getPathBetween(
		sourceId: string,
		targetId: string
	): string[] | null {
		const sourceIdx = idToIndex.get(sourceId);
		const targetIdx = idToIndex.get(targetId);

		if (sourceIdx === undefined || targetIdx === undefined) return null;

		// get or compute BFS tree from source node
		if (!parentCache.has(sourceIdx)) {
			parentCache.set(sourceIdx, bfsParents(sourceIdx));
		}

		const parent = parentCache.get(sourceIdx)!;

		return reconstructPath(parent, sourceIdx, targetIdx);
	}

	function getPathBetweenLength(
		sourceId: string,
		targetId: string
	): number | null {
		const path = getPathBetween(sourceId, targetId);

		if (!path) return null;

		/**
		 * path length minus 1, as we go for jumps and target
		 * could be in same system which is path lenght of 1
		 */

		return path.length > 0 ? path.length - 1 : 0;
	}

	return {
		ready,
		getPathBetween,
		getPathBetweenLength,
	};
}
