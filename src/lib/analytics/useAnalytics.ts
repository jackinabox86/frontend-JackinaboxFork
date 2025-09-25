import { IPlanetSearchAdvanced } from "@/features/api/gameData.types";
import { Properties } from "posthog-js";
import { usePostHog } from "@/lib/usePostHog";
const { posthog, capture, setUserProp } = usePostHog();

export type AnalyticsEvent =
	| "empire_patch"
	| "empire_reload"
	| "manage_cx_create"
	| "manage_cx_delete"
	| "manage_empire_create"
	| "manage_empire_delete"
	| "manage_empire_junctions_update"
	| "manage_plans_reload"
	| "manage_plans_assign_all"
	| "manage_plans_junctions_update"
	| "manage_plans_clone"
	| "manage_plans_delete"
	| "page_view"
	| "plan_create"
	| "plan_leave_changed"
	| "plan_reload"
	| "plan_save"
	| "plan_shared_cloned"
	| "plan_tool_view"
	| "popr_load"
	| "planet_search_basic"
	| "planet_search_advanced"
	| "user_password_reset"
	| "user_request_password_reset"
	| "materialtile_market_drawer"
	| "user_verify_email"
	| "user_password_change"
	| "user_logout"
	| "user_login"
	| "user_registration"
	| "user_profile_change"
	| "user_request_email_verification"
	| "navigation_toggle"
	| "version_reload"
	| "xit_burn_show"
	| "xit_burn_copy"
	| "xit_transfer_show"
	| "xit_transfer_copy"
	| "version_reload"
	| "exchange_reload"
	| "exchange_patch"
	| "marketexploration_explore"
	| "production_chain"
	| "resource_roi_overview"
	| "plan_share_delete"
	| "plan_share_create";

export interface EventProperties {
	page_view: {
		page_name: string;
		referrer?: string;
	};
	plan_tool_view: {
		name: string | null;
	};
	plan_save: {
		planetNaturalId: string;
	};
	plan_create: {
		planetNaturalId: string;
	};
	plan_reload: {
		planetNaturalId: string;
	};
	plan_shared_cloned: {
		sharedUuid: string;
		planetNaturalId: string;
	};
	plan_leave_changed: {
		planetNaturalId: string;
	};
	user_password_reset: undefined;
	user_request_password_reset: undefined;
	user_verify_email: { status: boolean };
	empire_reload: { status: boolean };
	empire_patch: { status: boolean };
	popr_load: { planetNaturalId: string };
	manage_cx_create: undefined;
	manage_cx_delete: { cxUuid: string };
	manage_empire_delete: { empireUuid: string };
	manage_empire_junctions_update: undefined;
	manage_empire_create: undefined;
	manage_plans_reload: undefined;
	manage_plans_assign_all: { value: boolean };
	manage_plans_junctions_update: undefined;
	manage_plans_clone: { planUuid: string };
	manage_plans_delete: { planUuid: string };
	materialtile_market_drawer: { materialTicker: string };
	resource_roi_overview: { materialTicker: string };
	planet_search_basic: { searchId: string };
	planet_search_advanced: IPlanetSearchAdvanced;
	user_password_change: undefined;
	user_logout: undefined;
	user_login: { username: string };
	user_registration: { username: string };
	user_profile_change: undefined;
	user_request_email_verification: undefined;
	version_reload: undefined;
	navigation_toggle: { size: "full" | "collapsed" };
	xit_burn_show: undefined;
	xit_burn_copy: undefined;
	xit_transfer_show: undefined;
	xit_transfer_copy: undefined;
	plan_share_delete: undefined;
	plan_share_create: undefined;
	exchange_reload: { location: string };
	exchange_patch: { cxUuid: string; location: string };
	marketexploration_explore: { exchange: string; materialTicker: string };
	production_chain: {
		materialTicker: string;
		amount: number;
		recipes: string[];
		terminals: string;
	};
}

export function trackEvent<E extends AnalyticsEvent>(
	event: E,
	props?: EventProperties[E]
): void {
	capture(event, props);
}

export function trackUser(props: Properties): void {
	setUserProp(props);
}

export function resetUser(): void {
	posthog.reset();
}

export function identifyUser(distinct_id: string, props?: Properties): void {
	posthog.identify(distinct_id, props);
}
