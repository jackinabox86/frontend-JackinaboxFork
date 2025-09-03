import { describe, it, expect, vi } from "vitest";

import { apiService } from "@/lib/apiService";
import {
	callAPIKeyList,
	callChangePassword,
	callCreateAPIKey,
	callDeleteAPIKey,
	callGetProfile,
	callPatchProfile,
	callRefreshToken,
	callResendEmailVerification,
	callUserLogin,
	callVerifyEmail,
} from "@/features/api/userData.api";
import {
	LoginPayloadSchema,
	RefreshPayloadSchema,
	TokenResponseSchema,
	UserAPIKeyPayloadSchema,
	UserChangePasswordPayloadSchema,
	UserChangePasswordResponseSchema,
	UserProfilePatchSchema,
	UserProfilePayloadSchema,
	UserVerifyEmailPayloadSchema,
	UserVerifyEmailResponseSchema,
} from "@/features/api/schemas/user.schemas";

vi.mock("@/lib/apiService", () => ({
	apiService: {
		post: vi.fn(),
		get: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("Feature: Account", () => {
	it("callUserLogin: Calls API Service and gets correct response", async () => {
		const mockUsername = "testuser";
		const mockPassword = "testpassword";
		const mockResponse = {
			access_token: "mockAccessToken",
			refresh_token: "mockRefreshToken",
		};

		// @ts-expect-error - mock post typing
		apiService.post.mockResolvedValue(mockResponse);

		const result = await callUserLogin(mockUsername, mockPassword);

		expect(apiService.post).toHaveBeenCalledWith(
			"/user/login",
			{ username: mockUsername, password: mockPassword },
			LoginPayloadSchema,
			TokenResponseSchema,
			true
		);

		expect(result).toEqual(mockResponse);
	});

	it("callRefreshToken: Calls API Service and gets correct response", async () => {
		const mockRefreshToken = "123";
		const mockResponse = {
			access_token: "mockAccessToken",
			refresh_token: "mockRefreshToken",
		};

		// @ts-expect-error - mock post typing
		apiService.post.mockResolvedValue(mockResponse);

		const result = await callRefreshToken(mockRefreshToken);

		expect(apiService.post).toHaveBeenCalledWith(
			"/user/refresh",
			{ refresh_token: mockRefreshToken },
			RefreshPayloadSchema,
			TokenResponseSchema,
			true
		);

		expect(result).toEqual(mockResponse);
	});

	it("callGetProfile: Calls API Service and gets correct response", async () => {
		const mockResponse = {
			user_id: 1,
			username: "foo",
			email: "",
			email_verified: true,
			fio_apikey: "foo@moo.de",
			prun_username: "foo",
			last_login: new Date(),
			last_action: new Date(),
		};

		// @ts-expect-error - mock post typing
		apiService.get.mockResolvedValue(mockResponse);

		const result = await callGetProfile();

		expect(apiService.get).toHaveBeenCalledWith(
			"/user/profile",
			UserProfilePayloadSchema
		);

		expect(result).toEqual(mockResponse);
	});

	it("callPatchProfile: Calls API Service and gets correct response", async () => {
		const mockResponse = {
			email: "",
			fio_apikey: "foo@moo.de",
			prun_username: "foo",
		};

		// @ts-expect-error - mock post typing
		apiService.patch.mockResolvedValue(mockResponse);

		const result = await callPatchProfile(mockResponse);

		expect(apiService.patch).toHaveBeenCalledWith(
			"/user/profile",
			mockResponse,
			UserProfilePatchSchema,
			UserProfilePayloadSchema
		);

		expect(result).toEqual(mockResponse);
	});

	it("callResendEmailVerification: Calls API Service and gets correct response", async () => {
		// @ts-expect-error - mock post typing
		apiService.post.mockResolvedValue(true);

		const result = await callResendEmailVerification();
		expect(result).toEqual(true);
	});

	it("callChangePassword: Calls API Service and gets correct response", async () => {
		const mockResponse = {
			message: "foo",
		};

		// @ts-expect-error - mock post typing
		apiService.patch.mockResolvedValue(mockResponse);

		const result = await callChangePassword({ old: "moo", new: "foo" });

		expect(apiService.patch).toHaveBeenCalledWith(
			"/user/changepassword",
			{ old: "moo", new: "foo" },
			UserChangePasswordPayloadSchema,
			UserChangePasswordResponseSchema
		);

		expect(result).toEqual(mockResponse);
	});
	it("callVerifyEmail: Calls API Service and gets correct response", async () => {
		const mockResponse = {
			status_code: 200,
			message: "foo",
		};

		// @ts-expect-error - mock post typing
		apiService.post.mockResolvedValue(mockResponse);

		const result = await callVerifyEmail({ code: "moo" });

		expect(apiService.post).toHaveBeenCalledWith(
			"/user/verify_email",
			{ code: "moo" },
			UserVerifyEmailPayloadSchema,
			UserVerifyEmailResponseSchema
		);

		expect(result).toEqual(mockResponse);
	});

	it("callAPIKeyList: Calls API Service and gets correct response", async () => {
		const mockResponse = [
			{
				name: "foo",
				key: "moo",
				created_date: new Date(),
				last_activity: null,
			},
		];

		// @ts-expect-error - mock post typing
		apiService.get.mockResolvedValue(mockResponse);

		const result = await callAPIKeyList();

		expect(apiService.get).toHaveBeenCalledWith(
			"/user/api-key",
			UserAPIKeyPayloadSchema
		);

		expect(result).toEqual(mockResponse);
	});

	it("callCreateAPIKey: Calls API Service and gets correct response", async () => {
		const mockResponse = true;

		// @ts-expect-error - mock post typing
		apiService.post.mockResolvedValue(mockResponse);

		const result = await callCreateAPIKey("foo");

		expect(result).toEqual(mockResponse);
	});

	it("callDeleteAPIKey: Calls API Service and gets correct response", async () => {
		const mockResponse = true;

		// @ts-expect-error - mock post typing
		apiService.delete.mockResolvedValue(mockResponse);

		const result = await callDeleteAPIKey("foo");

		expect(result).toEqual(mockResponse);
	});
});
