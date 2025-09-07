<script setup lang="ts">
	import { defineAsyncComponent, onMounted } from "vue";

	// Components
	const HomepageHeader = defineAsyncComponent(
		() => import("@/features/homepage/components/HomepageHeader.vue")
	);
	const NavigationBar = defineAsyncComponent(
		() => import("@/layout/components/NavigationBar.vue")
	);
	const MobileToggle = defineAsyncComponent(
		() => import("@/layout/components/MobileToggle.vue")
	);

	const VersionUpdateNotification = defineAsyncComponent(
		() => import("@/layout/components/VersionUpdateNotification.vue")
	);

	// Composables
	import { useVersionCheck } from "@/lib/useVersionCheck";
	const { updateAvailable, startWatch } = useVersionCheck();

	// Stores
	import { useUserStore } from "@/stores/userStore";
	const userStore = useUserStore();
	import { userActivity } from "@/features/user_activity/userActivityStore";

	onMounted(() => {
		startWatch();

		if (userStore.isLoggedIn) {
			const _activity = userActivity;
		}
	});
</script>

<template>
	<VersionUpdateNotification v-if="updateAvailable && userStore.isLoggedIn" />

	<main class="flex h-full w-full bg-[rgb(3,7,7)] text-white/80">
		<template v-if="userStore.isLoggedIn">
			<NavigationBar />
			<div class="flex flex-col flex-1 overflow-y-auto">
				<div class="h-screen text-white/80">
					<MobileToggle />
					<Suspense>
						<RouterView />
					</Suspense>
					<footer
						class="sticky top-[100vh] pr-3 py-1 text-white/50 text-[10px] text-end">
						<router-link
							:to="'/imprint-tos'"
							class="hover:cursor-pointer">
							Imprint & Terms of Service
						</router-link>
					</footer>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="flex flex-col flex-1">
				<div>
					<HomepageHeader />
					<Suspense>
						<RouterView />
					</Suspense>
					<footer
						class="sticky top-[100vh] pr-3 py-1 text-white/50 text-[10px] text-end">
						<router-link
							:to="'/imprint-tos'"
							class="hover:cursor-pointer">
							Imprint & Terms of Service
						</router-link>
					</footer>
				</div>
			</div>
		</template>
	</main>
</template>
