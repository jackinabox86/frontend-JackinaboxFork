import { describe, it, expect } from "vitest";

import { ProductionEdge } from "@/features/production_chain/productionEdge";

describe("productionEdge", async () => {
	it("constructor", async () => {
		const edge = new ProductionEdge("foo", "moo", 10);

		expect(edge.source).toBe("foo");
		expect(edge.target).toBe("moo");
		expect(edge.quantitiy).toBe(10);
	});

	it("id", async () => {
		const edge = new ProductionEdge("foo", "moo", 10);

		expect(edge.id).toBe("foo-moo");
	});
});
