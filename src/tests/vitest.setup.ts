// https://github.com/dumbmatter/fakeIndexedDB
import "fake-indexeddb/auto";

import config from "@/lib/config";
import { beforeEach } from "vitest";

// Reset IndexedDB between test runs
beforeEach(async () => {
	// Close and delete DB from fake-indexeddb
	await indexedDB.deleteDatabase(config.INDEXEDDB_DBNAME);
});

if (typeof navigator === "undefined") {
	(global as any).navigator = {
		storage: {
			persist: async () => true,
		},
	};
}
