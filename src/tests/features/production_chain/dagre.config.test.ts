import { describe, expect, it } from "vitest";

import {
	dagreSetGraphConfig,
	nodeDimensions,
	dagreSetNodeConfig,
} from "@/features/production_chain/dagre.config";

describe("dagre.config", async () => {
	it("expect all to be defined", () => {
		expect(dagreSetGraphConfig).toBeDefined();
		expect(nodeDimensions).toBeDefined();
		expect(dagreSetNodeConfig).toBeDefined();
	});
});
