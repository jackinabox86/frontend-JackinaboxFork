<script setup lang="ts">
	import { computed, ComputedRef, watch } from "vue";

	// Stores
	import { useUserStore } from "@/stores/userStore";
	import { useQueryStore } from "@/lib/query_cache/queryStore";

	// API
	import { useQuery } from "@/lib/query_cache/useQuery";

	// Router
	import router from "@/router";

	// Util
	import { relativeFromDate } from "@/util/date";

	// Types & Interfaces
	import { IMenuSection } from "@/features/navigation/navigation.types";

	// UI
	import { PTag, PTooltip } from "@/ui";
	import { NIcon } from "naive-ui";
	import {
		HomeSharp,
		SearchRound,
		SettingsRound,
		ApiSharp,
		LogOutRound,
		ShoppingBasketSharp,
		CandlestickChartSharp,
		UpgradeSharp,
		CompareSharp,
		ProductionQuantityLimitsSharp,
		StarsSharp,
		PersonSharp,
		HelpOutlineSharp,
		ExtensionSharp,
	} from "@vicons/material";

	const userStore = useUserStore();
	const queryStore = useQueryStore();
	/*
	 * FIO Data Refresh, if the user either already has FIO or if this is changed,
	 * a background refresh of FIO data is triggered in the gamedata store
	 */

	watch(
		() => userStore.hasFIO,
		(newValue: boolean) => {
			if (newValue) {
				useQuery("GetFIOStorage").execute();
				useQuery("GetFIOSites").execute();
			} else {
				queryStore.invalidateKey(["gamedata", "fio"], {
					exact: false,
					skipRefetch: true,
				});
			}
		},
		{ immediate: true }
	);

	const storageTimestamp = computed(
		() =>
			queryStore.peekQueryState(["gamedata", "fio", "storage"])
				?.timestamp ?? 0
	);
	const sitesTimestamp = computed(
		() =>
			queryStore.peekQueryState(["gamedata", "fio", "sites"])
				?.timestamp ?? 0
	);

	const menuItems: ComputedRef<IMenuSection[]> = computed(() => [
		{
			label: "Planning",
			display: true,
			children: [
				{
					label: "Empire",
					display: true,
					routerLink: "/",
					icon: HomeSharp,
				},
				{
					label: "Planet Search",
					display: true,
					routerLink: "/search",
					icon: SearchRound,
				},
				{
					label: "Management",
					display: true,
					routerLink: "/manage",
					icon: SettingsRound,
				},
				{
					label: "Exchanges",
					display: true,
					routerLink: "/exchanges",
					icon: ShoppingBasketSharp,
				},
				// {
				// 	label: "Projects",
				// 	routerLink: "/not-implemented",
				// 	icon: GroupWorkRound,
				// },
			],
		},
		// {
		// 	label: "Configuration",
		// 	children: [
		// 		{
		// 			label: "Project Settings",
		// 			routerLink: "/not-implemented",
		// 			icon: PermDataSettingSharp,
		// 		},
		// 	],
		// },
		{
			label: "Tools",
			display: true,
			children: [
				{
					label: "Market Data",
					display: true,
					routerLink: "/not-implemented",
					icon: CandlestickChartSharp,
					children: [
						{
							label: "Market Exploration",
							display: true,
							routerLink: "/market-exploration",
						},
						{
							label: "ROI Overview",
							display: true,
							routerLink: "/roi-overview",
						},
						{
							label: "Resource ROI Overview",
							display: true,
							routerLink: "/resource-roi-overview",
						},
					],
				},
				{
					label: "HQ Upgrade Calculator",
					display: true,
					routerLink: "/hq-upgrade-calculator",
					icon: ProductionQuantityLimitsSharp,
				},
				{
					label: "Production Chains",
					display: true,
					routerLink: "/production-chain",
					icon: CompareSharp,
				},
				{
					label: "Base Compare",
					display: true,
					routerLink: "/not-implemented",
					icon: UpgradeSharp,
				},
				{
					label: "Government",
					display: true,
					routerLink: "/not-implemented",
					icon: StarsSharp,
				},
				{
					label: "FIO",
					display: userStore.hasFIO,
					routerLink: "/not-implemented",
					icon: ApiSharp,
					children: [
						{
							label: "Burn",
							display: userStore.hasFIO,
							routerLink: "/fio/burn",
						},
						{
							label: "Storage",
							display: userStore.hasFIO,
							routerLink: "/not-implemented",
						},
						{
							label: "Repair",
							display: userStore.hasFIO,
							routerLink: "/fio/repair",
						},
						// {
						// 	label: "Plan Import",
						// 	display: userStore.hasFIO,
						// 	routerLink: "/not-implemented",
						// },
					],
				},
			],
		},
		{
			label: "Account",
			display: true,
			children: [
				{
					label: "API",
					display: true,
					routerLink: "/api",
					icon: ExtensionSharp,
				},
				{
					label: "Profile",
					display: true,
					routerLink: "/profile",
					icon: PersonSharp,
				},
				{
					label: "Help & Changelog",
					display: true,
					routerLink: "/help",
					icon: HelpOutlineSharp,
				},
				{
					label: "Logout",
					display: true,
					icon: LogOutRound,
					functionCall: () => {
						userStore.logout();
						router.push("/");
					},
				},
			],
		},
	]);
</script>

<template>
	<!-- Mobile menu toggle button -->
	<input id="menu-toggle" type="checkbox" class="hidden peer" />
	<!-- Sidebar -->
	<div
		class="hidden peer-checked:flex md:flex border-r border-white/5 flex-col w-60 bg-gray-dark transition-all duration-300 ease-in-out">
		<div class="items-center justify-between h-16 px-4 sm:hidden md:flex">
			<div class="flex w-full">
				<div class="flex-grow text-prunplanner text-xl font-light">
					<span class="font-bold">PRUN</span>planner
				</div>
				<div class="my-auto text-white/50 text-xs">v0.21</div>
			</div>
		</div>
		<div class="flex flex-col flex-1 overflow-y-auto">
			<nav class="flex-1 px-2 pt-0 pb-4 text-white/80">
				<template
					v-for="section in menuItems"
					:key="'SECTION#' + section.label">
					<div v-if="section.display" class="pb-4">
						<div class="px-4 py-2 text-sm text-gray-400">
							{{ section.label }}
						</div>
						<template
							v-for="item in section.children"
							:key="
								'SECTION#' + section.label + '#' + item.label
							">
							<!-- without children-->
							<RouterLink
								v-if="!item.children && item.routerLink"
								:key="
									'ROUTER#' + section.label + '#' + item.label
								"
								:to="item.routerLink"
								class="flex items-center px-4 py-2 hover:bg-white/20 hover:rounded-sm group"
								active-class="bg-white/10 rounded-sm">
								<n-icon v-if="item.icon" class="mr-2" size="20">
									<component :is="item.icon" />
								</n-icon>
								{{ item.label }}
							</RouterLink>
							<template
								v-else-if="!item.children && item.functionCall">
								<div
									class="flex items-center px-4 py-2 hover:bg-white/20 hover:rounded-sm group hover:cursor-pointer"
									@click="item.functionCall()">
									<n-icon
										v-if="item.icon"
										class="mr-2"
										size="20">
										<component :is="item.icon" />
									</n-icon>
									<span>{{ item.label }}</span>
								</div>
							</template>
							<template v-else>
								<div v-if="item.display" class="relative group">
									<input
										:id="item.label + '-toggle'"
										type="checkbox"
										class="hidden peer" />
									<label
										:for="item.label + '-toggle'"
										class="flex items-center px-4 py-2 hover:bg-white/20 hover:rounded-sm cursor-pointer w-full">
										<n-icon
											v-if="item.icon"
											class="mr-2"
											size="20">
											<component :is="item.icon" />
										</n-icon>
										{{ item.label }}
										<!-- Arrow Icon -->
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 ml-auto transition-transform peer-checked:rotate-180 absolute right-4 top-3 transform #dis--translate-y-1/2 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7" />
										</svg>
									</label>
									<div
										class="hidden peer-checked:flex transition-all flex-col duration-300">
										<template
											v-for="children in item.children">
											<RouterLink
												v-if="children.display"
												:key="
													'ROUTER#' +
													children.label +
													'#' +
													children.label
												"
												:to="
													children.routerLink
														? children.routerLink
														: ''
												"
												class="flex items-center px-4 py-2 hover:bg-white/20 hover:rounded-sm group"
												:class="
													children.icon
														? 'pl-6'
														: 'pl-12'
												"
												active-class="bg-white/10 rounded-sm">
												<n-icon
													v-if="children.icon"
													class="mr-2"
													size="20">
													<component
														:is="children.icon" />
												</n-icon>
												{{ children.label }}
											</RouterLink>
										</template>
									</div>
								</div>
							</template>
						</template>
					</div>
				</template>
			</nav>
		</div>
		<div class="p-4 text-center child:my-auto">
			<PTooltip
				v-if="
					userStore.hasFIO &&
					storageTimestamp !== 0 &&
					sitesTimestamp !== 0
				">
				<template #trigger>
					<PTag size="sm" type="success" :bordered="false">
						FIO Active
					</PTag>
				</template>
				<div class="grid grid-cols-2">
					<div>Storage</div>
					<div>
						{{ relativeFromDate(storageTimestamp) }}
					</div>
					<div>Sites</div>
					<div>
						{{ relativeFromDate(sitesTimestamp) }}
					</div>
				</div>
			</PTooltip>
			<PTag v-else size="sm" type="warning" :bordered="false">
				FIO Inactive
			</PTag>
		</div>
	</div>
</template>
