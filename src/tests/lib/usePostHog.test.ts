import { describe, it, expect, vi, beforeEach } from "vitest";

// mock posthog-js
vi.mock("posthog-js", () => {
	const posthogMock = {
		init: vi.fn(),
		capture: vi.fn(),
		register: vi.fn(),
		people: {
			set: vi.fn(),
		},
		onFeatureFlags: vi.fn(),
		__loaded: false,
	};
	return {
		default: posthogMock,
		Properties: {} as any,
	};
});

import posthog from "posthog-js";
import { usePostHog } from "@/lib/usePostHog";

describe("usePostHog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// reset loaded state
		(posthog as any).__loaded = false;
	});

	it("initializes posthog when token exists", () => {
		// @ts-expect-error mock
		import.meta.env.VITE_POSTHOG_TOKEN = "test-token";
		// @ts-expect-error mock
		import.meta.env.VITE_POSTHOG_NAME = "test-name";

		usePostHog();

		expect(posthog.init).toHaveBeenCalledWith(
			"test-token",
			expect.any(Object)
		);
	});

	it("queues events when posthog is not loaded", () => {
		const { capture } = usePostHog();

		capture("test-event", { foo: "bar", password: "secret" });

		// should not call capture immediately
		expect(posthog.capture).not.toHaveBeenCalled();
	});

	it("calls capture immediately when loaded", () => {
		(posthog as any).__loaded = true;
		const { capture } = usePostHog();

		capture("test-event", { foo: "bar" });

		expect(posthog.capture).toHaveBeenCalledWith("test-event", {
			foo: "bar",
		});
	});

	it("sets user properties", () => {
		const { setUserProp } = usePostHog();

		setUserProp({ theme: "dark" });

		expect(posthog.people.set).toHaveBeenCalledWith({ theme: "dark" });
	});

	it("flushes queued events on onFeatureFlags", () => {
		const queuedEvents: Array<[string, any]> = [];
		const { capture } = usePostHog();

		capture("queued-event", { foo: "bar" });
		expect(posthog.capture).not.toHaveBeenCalled();

		// simulate posthog ready
		(posthog.onFeatureFlags as any).mock.calls[0][0]();

		expect(posthog.capture).toHaveBeenCalledWith("queued-event", {
			foo: "bar",
		});
	});
});
