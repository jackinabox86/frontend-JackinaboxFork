import { describe, it, expect, beforeAll } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlanningStore } from "@/stores/planningStore";
import { useCXData } from "@/features/cx/useCXData";

describe("useCXData", async () => {
	let planningStore: any;

	beforeAll(() => {
		setActivePinia(createPinia());
		planningStore = usePlanningStore();
	});

	describe("findEmpireCXUuid", async () => {
		it("undefined empire uuid", async () => {
			const { findEmpireCXUuid } = useCXData();

			expect(findEmpireCXUuid(undefined)).toBeUndefined();
		});

		it("unknown empire uuid", async () => {
			const { findEmpireCXUuid } = useCXData();

			expect(findEmpireCXUuid("foo")).toBeUndefined();
		});

		it("valid cx uuid", async () => {
			planningStore.cxs["foo"] = {
				uuid: "foo",
				empires: [{ uuid: "moo" }],
			};
			const { findEmpireCXUuid } = useCXData();

			expect(findEmpireCXUuid("moo")).toBe("foo");
		});
	});

	describe("getPreferenceOptions", async () => {
		it("without none", async () => {
			planningStore.cxs["foo"] = {
				uuid: "foo",
				empires: [],
			};
			planningStore.cxs["moo"] = {
				uuid: "moo",
				empires: [],
			};
			const { getPreferenceOptions } = useCXData();

			expect(getPreferenceOptions().length).toBe(2);
		});

		it("with none", async () => {
			planningStore.cxs["foo"] = {
				uuid: "foo",
				empires: [],
			};
			planningStore.cxs["moo"] = {
				uuid: "moo",
				empires: [],
			};
			const { getPreferenceOptions } = useCXData();

			expect(getPreferenceOptions(true).length).toBe(3);
		});
	});
});
