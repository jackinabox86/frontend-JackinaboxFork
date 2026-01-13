<script setup lang="ts">
	import { useHead } from "@unhead/vue";

	useHead({
		title: "Profile | PRUNplanner",
	});

	// Components
	import WrapperPlanningDataLoader from "@/features/wrapper/components/WrapperPlanningDataLoader.vue";
	import UserPreferences from "@/features/profile/components/UserPreferences.vue";
	import StorageData from "@/features/profile/components/StorageData.vue";
	import HelpDrawer from "@/features/help/components/HelpDrawer.vue";
	import ChangePassword from "@/features/profile/components/ChangePassword.vue";
	import ChangeProfile from "@/features/profile/components/ChangeProfile.vue";
	import FIOInformation from "@/features/profile/components/FIOInformation.vue";
</script>

<template>
	<WrapperPlanningDataLoader empire-list plan-list load-c-x>
		<template #default>
			<div class="min-h-screen flex flex-col">
				<div
					class="px-6 py-3 border-b border-white/10 flex flex-row justify-between">
					<h1 class="text-2xl font-bold">Profile</h1>
					<HelpDrawer file-name="profile" />
				</div>

				<div
					class="grow grid grid-cols-1 lg:grid-cols-[30%_25%_auto] divide-x divide-white/10">
					<div
						class="flex flex-col divide-y divide-white/10 child:px-6 child:py-3 child:last:border-b child:last:border-white/10">
						<ChangeProfile />
						<ChangePassword />
						<FIOInformation />
					</div>
					<div class="px-6 py-3"><UserPreferences /></div>
					<div class="px-6 py-3"><StorageData /></div>
				</div>
			</div>
		</template>
	</WrapperPlanningDataLoader>
</template>
