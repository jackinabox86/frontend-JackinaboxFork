import { describe, it, expect, beforeAll, vi } from "vitest";
import AxiosMockAdapter from "axios-mock-adapter";
import { createPinia, setActivePinia } from "pinia";
import axiosSetup from "@/util/axiosSetup";

// Services
import { apiService } from "@/lib/apiService";
import {
	callCloneSharedPlan,
	callCreateSharing,
	callDeleteSharing,
	callGetSharedList,
} from "@/features/api/sharingData.api";

// test data
import shared_list from "@/tests/test_data/api_data_shared_list.json";

// mock apiService client
const mock = new AxiosMockAdapter(apiService.client);

describe("Empire Data API Calls", async () => {
	beforeAll(() => {
		setActivePinia(createPinia());
		axiosSetup();
	});

	it("callGetSharedList", async () => {
		const spyApiServiceGet = vi.spyOn(apiService, "get");

		mock.onGet("/shared/list").reply(200, shared_list);

		expect(await callGetSharedList()).toStrictEqual(shared_list);
		expect(spyApiServiceGet).toHaveBeenCalled();
	});

	it("callDeleteSharing", async () => {
		const spyApiServiceDelete = vi.spyOn(apiService, "delete");

		mock.onDelete("/shared/foo").reply(200, true);

		expect(await callDeleteSharing("foo")).toBeTruthy();
		expect(spyApiServiceDelete).toHaveBeenCalled();
	});

	it("callCreateSharing", async () => {
		const spyApiServicePut = vi.spyOn(apiService, "put");

		const fakeSharing = {
			uuid: "da105ce1-25f2-479d-b1eb-944353f4784f",
			created_date: "2025-06-06",
			view_count: 0,
		};

		mock.onPut(
			"/shared/baseplanner/da105ce1-25f2-479d-b1eb-944353f4784f"
		).reply(200, fakeSharing);

		expect(
			await callCreateSharing("da105ce1-25f2-479d-b1eb-944353f4784f")
		).toStrictEqual(fakeSharing);
		expect(spyApiServicePut).toHaveBeenCalled();
	});

	it("callCloneSharedPlan", async () => {
		const spyApiServicePut = vi.spyOn(apiService, "put");

		const fakeSharing = {
			message: "foo",
		};

		mock.onPut(
			"/shared/baseplanner/da105ce1-25f2-479d-b1eb-944353f4784f/clone"
		).reply(200, fakeSharing);

		expect(
			await callCloneSharedPlan("da105ce1-25f2-479d-b1eb-944353f4784f")
		).toStrictEqual(fakeSharing);
		expect(spyApiServicePut).toHaveBeenCalled();
	});
});
