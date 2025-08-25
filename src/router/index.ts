import {
	createWebHistory,
	createRouter,
	NavigationGuardNext,
	RouteLocationRaw,
} from "vue-router";

// Stores
import { useUserStore } from "@/stores/userStore";

// Composables
import { usePostHog } from "@/lib/usePostHog";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			name: "homepage",
			path: "/",
			component: () => import("@/views/HomepageView.vue"),
			props: true,
		},
		{
			name: "profile",
			path: "/profile",
			meta: { requiresAuth: true },
			component: () => import("@/views/ProfileView.vue"),
			props: true,
		},
		{
			name: "empire",
			path: "/empire/:empireUuid?",
			meta: { requiresAuth: true },
			component: () => import("@/views/EmpireView.vue"),
			props: true,
		},
		{
			name: "manage",
			path: "/manage",
			meta: { requiresAuth: true },
			component: () => import("@/views/ManageView.vue"),
		},
		{
			name: "exchanges",
			path: "/exchanges/:cxUuid?",
			meta: { requiresAuth: true },
			component: () => import("@/views/ExchangesView.vue"),
			props: true,
		},
		{
			name: "search",
			path: "/search",
			meta: { requiresAuth: true },
			component: () => import("@/views/PlanetSearchView.vue"),
		},
		{
			name: "not-implemented",
			path: "/not-implemented",
			component: () => import("@/views/NotImplementedView.vue"),
		},
		{
			name: "plan",
			path: "/plan/:planetNaturalId/:planUuid?",
			meta: { requiresAuth: true },
			component: () => import("@/views/PlanLoadView.vue"),
			props: true,
		},
		{
			name: "shared-plan",
			path: "/shared/:sharedPlanUuid",
			meta: { showHeaderName: true },
			component: () => import("@/views/PlanLoadView.vue"),
			props: true,
		},
		{
			name: "fio-repair",
			path: "/fio/repair",
			meta: { requiresAuth: true },
			component: () => import("@/views/fio/FIORepairView.vue"),
		},
		{
			name: "fio-burn",
			path: "/fio/burn",
			meta: { requiresAuth: true },
			component: () => import("@/views/fio/FIOBurnView.vue"),
		},
		{
			name: "api",
			path: "/api",
			meta: { requiresAuth: true },
			component: () => import("@/lib/query_cache/QueryCacheView.vue"),
		},
		{
			name: "market-exploration",
			path: "/market-exploration",
			meta: { requiresAuth: true },
			component: () =>
				import("@/views/tools/market-data/MarketExplorationView.vue"),
		},
		{
			name: "hq-upgrade-calculator",
			path: "/hq-upgrade-calculator",
			meta: { requiresAuth: true },
			component: () =>
				import("@/views/tools/HQUpgradeCalculatorView.vue"),
		},
		{
			name: "imprint-tos",
			path: "/imprint-tos",
			component: () => import("@/views/ImprintToSView.vue"),
		},
		{
			name: "help",
			path: "/help",
			meta: { requiresAuth: true },
			component: () => import("@/views/HelpView.vue"),
		},
		{
			name: "roi-overview",
			path: "/roi-overview",
			meta: { requiresAuth: true },
			component: () => import("@/views/tools/ROIOverviewView.vue"),
		},
		{
			name: "resource-roi-overview",
			path: "/resource-roi-overview",
			meta: { requiresAuth: true },
			component: () =>
				import("@/views/tools/ResourceROIOverviewView.vue"),
		},
		{
			name: "production-chain",
			path: "/production-chain",
			meta: { requiresAuth: true },
			component: () => import("@/views/tools/ProductionChainView.vue"),
		},
		{
			name: "verify-email",
			path: "/verify-email",
			component: () => import("@/views/VerifyEmailView.vue"),
		},
	],
});

router.beforeEach((to, _, next: NavigationGuardNext) => {
	const userStore = useUserStore();

	if (to.meta.requiresAuth && !userStore.isLoggedIn) {
		const redirectTo: RouteLocationRaw = {
			name: "homepage",
			state: { showLogin: "true" },
		};
		next(redirectTo);
	} else if (to.name === "homepage" && userStore.isLoggedIn) {
		const redirectTo: RouteLocationRaw = {
			name: "empire",
		};
		next(redirectTo);
	} else {
		next();
	}
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { posthog } = usePostHog();

export default router;
