<script setup lang="ts">
	import { reactive, watch, Ref, ref, onMounted } from "vue";

	// API
	import { useQuery } from "@/lib/query_cache/useQuery";

	// Composables
	import { usePostHog } from "@/lib/usePostHog";
	const { capture } = usePostHog();

	// Stores
	import { useUserStore } from "@/stores/userStore";

	// UI
	import { PForm, PFormItem, PInput, PButton, PCheckbox } from "@/ui";

	const userStore = useUserStore();

	// local profile copy
	const localProfile = reactive({ ...userStore.profile });
	const isUpdating: Ref<boolean> = ref(false);
	const wasSaved: Ref<boolean> = ref(true);
	const codeResendRequested: Ref<boolean> = ref(false);

	watch(
		() => userStore.profile,
		(newProfile) => Object.assign(localProfile, newProfile)
	);

	watch(
		() => localProfile,
		() => (wasSaved.value = false),
		{ deep: true }
	);

	onMounted(() =>
		userStore.performGetProfile().then(() => (wasSaved.value = true))
	);

	async function patchProfile(): Promise<void> {
		capture("user_profile_change");

		isUpdating.value = true;

		try {
			await useQuery("PatchUserProfile", {
				fio_apikey: localProfile.fio_apikey?.replace(/ /g, "") ?? null,
				prun_username: localProfile.prun_username ?? null,
				email: localProfile.email ?? null,
			}).execute();

			wasSaved.value = true;
		} catch (err) {
			console.error("Error patching user profile", err);
		} finally {
			isUpdating.value = false;
		}
	}

	async function requestVerification(): Promise<void> {
		capture("user_request_email_verification");

		try {
			await useQuery("PostUserResendEmailVerification", null).execute();
		} catch (err) {
			console.error("Error resending verification code", err);
		} finally {
			codeResendRequested.value = true;
		}
	}
</script>

<template>
	<div>
		<div class="flex flex-row flex-wrap gap-3">
			<h2 class="flex-grow my-auto text-white/80 font-bold text-lg">
				Profile
			</h2>
			<PButton
				:loading="isUpdating"
				:type="wasSaved ? 'primary' : 'error'"
				@click="patchProfile">
				Update Profile
			</PButton>
		</div>
		<div class="py-3 text-white/60">
			FIO Data Updates are handled by PRUNplanners backend automatically.
			It is not required to provide an email but highly recommended for
			increased account safety and password recovery.
		</div>
		<PForm v-if="localProfile">
			<PFormItem label="FIO API Key">
				<PInput
					v-model:value="localProfile.fio_apikey"
					class="w-full min-w-[200px] max-w-[50%]" />
			</PFormItem>
			<PFormItem label="PrUn Username">
				<PInput
					v-model:value="localProfile.prun_username"
					class="w-full min-w-[200px] max-w-[50%]" />
			</PFormItem>
			<PFormItem label="Email Address">
				<PInput
					v-model:value="localProfile.email"
					class="w-full min-w-[200px] max-w-[50%]" />
			</PFormItem>
			<PFormItem label="Email Verified">
				<div class="w-full flex flex-row flex-wrap gap-3">
					<PCheckbox
						v-model:checked="localProfile.email_verified"
						disabled
						class="w-full min-w-[200px] max-w-[50%] child:my-auto" />

					<div
						v-if="!localProfile.email_verified"
						class="flex flex-row flex-wrap gap-3">
						<div>
							<router-link
								to="/verify-email"
								class="text-link-primary hover:cursor-pointer hover:underline">
								Verify Email
							</router-link>
						</div>
						<div>
							<span
								v-if="!codeResendRequested"
								class="text-link-primary hover:cursor-pointer hover:underline"
								@click="requestVerification">
								Resend Code
							</span>
							<span v-else class="text-lime-600">
								Code requested.
							</span>
						</div>
					</div>
				</div>
			</PFormItem>
		</PForm>
	</div>
</template>
