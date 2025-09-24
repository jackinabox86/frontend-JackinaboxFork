import { usePostHog } from "@/lib/usePostHog";
const { capture } = usePostHog();

export type AnalyticsEvent =
	| "page_view"
	| "plan_tool_view"
	| "plan_save"
	| "plan_create"
	| "plan_reload"
	| "plan_leave_changed"
	| "plan_shared_cloned";

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
}

export function trackEvent<E extends AnalyticsEvent>(
	event: E,
	props: EventProperties[E]
): void {
	capture(event, props);
}
