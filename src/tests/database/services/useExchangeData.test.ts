import { beforeAll, describe, expect, it } from "vitest";

import { exchangesStore } from "@/database/stores";
import { useExchangeData } from "@/database/services/useExchangeData";

// test data
import exchanges from "@/tests/test_data/api_data_exchanges.json";

describe("useExchangeData", () => {
	beforeAll(async () => {
		await exchangesStore.setMany(exchanges);
	});

	describe("getExchangeTicker", () => {
		it("getExchangeTicker: fail", async () => {
			const { getExchangeTicker } = await useExchangeData();

			await expect(() => getExchangeTicker("foo")).rejects.toThrowError();
		});

		it("getExchangeTicker: valid", async () => {
			const { getExchangeTicker } = await useExchangeData();

			const result = await getExchangeTicker("RAT.AI1");
			expect(result).toBeDefined();
			expect(result.TickerId).toBe("RAT.AI1");
		});
	});

	describe("getMaterialExchangeOverview", () => {
		it("valid overview result", async () => {
			const { getMaterialExchangeOverview } = await useExchangeData();

			const result = await getMaterialExchangeOverview("CL");

			expect(result.Ask).toBeDefined();
			expect(result.Average).toBeDefined();
			expect(result.Bid).toBeDefined();
			expect(result.Demand).toBeDefined();
			expect(result.PP30D).toBeDefined();
			expect(result.PP7D).toBeDefined();
			expect(result.Supply).toBeDefined();
			expect(result.Ask).toStrictEqual({
				AI1: 3500,
				CI1: 3850,
				IC1: 4490,
				NC1: 3980,
			});
			expect(result.Universe30D).toEqual(3910.124333455047);
			expect(result.Universe7D).toEqual(3600.871248110732);
		});
	});
});
