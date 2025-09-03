import { useQuery } from "@/lib/query_cache/useQuery";
import { ref } from "vue";
import { IUserAPIKey } from "../api/userData.types";

export function useEndpoints() {
	const isLoading = ref(false);

	async function loadAPIKeys(): Promise<IUserAPIKey[]> {
		isLoading.value = true;

		const apiKeys = await useQuery(
			"GetUserAPIKeyList",
			undefined
		).execute();
		isLoading.value = false;

		return apiKeys;
	}

	async function createAPIKey(keyName: string): Promise<boolean> {
		// not empty, must be 100 char max
		if (!keyName || keyName === "" || keyName.length > 100) return false;

		isLoading.value = true;

		const result = await useQuery("PostUserCreateAPIKey", {
			keyname: keyName,
		}).execute();

		isLoading.value = false;
		return result;
	}

	async function deleteAPIKey(key: string): Promise<boolean> {
		isLoading.value = true;
		const result = await useQuery("DeleteUserAPIKey", { key }).execute();
		isLoading.value = false;
		return result;
	}

	return {
		isLoading,
		loadAPIKeys,
		createAPIKey,
		deleteAPIKey,
	};
}
