import posthog, { Properties } from "posthog-js";

// Util
import { redact } from "@/util/data";

// Key can be public, as its web sdk + has configured authorized urls
const POSTHOG_PUBLIC_KEY = "phc_JVfz4wWZFbbQF37d4NQ70w3I3uZ3Jrkpfu01myYDWJJ";
const POSTHOG_NAME = "prunplanner_frontend";

export function usePostHog() {
	const posthogToken: string = POSTHOG_PUBLIC_KEY;
	const posthogName: string = POSTHOG_NAME;

	const SENSITIVE_KEYS: string[] = [
		"password",
		"access_token",
		"refresh_token",
		"fio_apikey",
		"email",
		"old",
		"new",
		"code",
	];

	function isClient() {
		return typeof window !== "undefined";
	}

	// Queue, in case PostHog is not yet ready
	const eventQueue: Array<[string, Properties | null | undefined]> = [];

	if (posthogToken && isClient()) {
		posthog.init(posthogToken, {
			api_host: "https://squirrel.prunplanner.org/relay-DWJJ",
			ui_host: "https://eu.posthog.com",
			defaults: "2025-05-24",
			person_profiles: "identified_only",
			name: posthogName ?? "localhost",
		});

		// register global versions
		posthog.register({
			app_version: __APP_VERSION__,
		});

		// flush event queue on load
		posthog.onFeatureFlags(() => {
			eventQueue.forEach(([event, props]) =>
				posthog.capture(event, props)
			);
			eventQueue.length = 0;
		});
	}

	function capture<T extends Properties | null | undefined>(
		eventName: string,
		props?: T
	) {
		// redact props
		const safeProps = props ? redact(props, SENSITIVE_KEYS) : props;

		if (posthog.__loaded) {
			posthog.capture(eventName, safeProps);
		} else {
			// queue up
			eventQueue.push([eventName, safeProps]);
		}
	}

	function setUserProp(props: string | Properties) {
		posthog.people.set(props);
	}

	return { posthog, capture, setUserProp };
}
