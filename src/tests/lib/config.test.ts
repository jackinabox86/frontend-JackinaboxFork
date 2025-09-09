import { describe, it, expect } from "vitest";
import config from "@/lib/config";

describe("Config", () => {
	it("config defined", () => {
		expect(config.API_BASE_URL).toBe("https://api.prunplanner.org");
	});
});
