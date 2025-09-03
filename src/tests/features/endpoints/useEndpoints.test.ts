import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

// mock useQuery
vi.mock("@/lib/query_cache/useQuery", () => {
	return {
		useQuery: vi.fn(),
	};
});

import { useQuery } from "@/lib/query_cache/useQuery";
import { IUserAPIKey } from "@/features/api/userData.types";
import { useEndpoints } from "@/features/endpoints/useEndpoints";

describe("useEndpoints", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loadAPIKeys calls GetUserAPIKeyList and returns keys", async () => {
		const fakeKeys: IUserAPIKey[] = [
			{
				name: "key1",
				key: "foo",
				created_date: new Date(),
				last_activity: null,
			} as IUserAPIKey,
			{
				name: "key2",
				key: "moo",
				created_date: new Date(),
				last_activity: null,
			} as IUserAPIKey,
		];

		// mock implementation for useQuery
		(useQuery as unknown as Mock).mockReturnValue({
			execute: vi.fn().mockResolvedValue(fakeKeys),
		});

		const { loadAPIKeys, isLoading } = useEndpoints();

		const p = loadAPIKeys();
		expect(isLoading.value).toBe(true); // loading should be true immediately

		const result = await p;
		expect(result).toEqual(fakeKeys);
		expect(isLoading.value).toBe(false);

		expect(useQuery).toHaveBeenCalledWith("GetUserAPIKeyList", undefined);
	});

	it("createAPIKey rejects invalid inputs", async () => {
		const { createAPIKey, isLoading } = useEndpoints();

		expect(await createAPIKey("")).toBe(false);
		expect(await createAPIKey("a".repeat(101))).toBe(false);

		expect(useQuery).not.toHaveBeenCalled();
		expect(isLoading.value).toBe(false);
	});

	it("createAPIKey calls PostUserCreateAPIKey and returns true", async () => {
		(useQuery as unknown as Mock).mockReturnValue({
			execute: vi.fn().mockResolvedValue(true),
		});

		const { createAPIKey, isLoading } = useEndpoints();

		const p = createAPIKey("valid-key");
		expect(isLoading.value).toBe(true);

		const result = await p;
		expect(result).toBe(true);
		expect(isLoading.value).toBe(false);

		expect(useQuery).toHaveBeenCalledWith("PostUserCreateAPIKey", {
			keyname: "valid-key",
		});
	});

	it("deleteAPIKey calls DeleteUserAPIKey and returns true", async () => {
		(useQuery as unknown as Mock).mockReturnValue({
			execute: vi.fn().mockResolvedValue(true),
		});

		const { deleteAPIKey, isLoading } = useEndpoints();

		const p = deleteAPIKey("abc");
		expect(isLoading.value).toBe(true);

		const result = await p;
		expect(result).toBe(true);
		expect(isLoading.value).toBe(false);

		expect(useQuery).toHaveBeenCalledWith("DeleteUserAPIKey", {
			key: "abc",
		});
	});
});
