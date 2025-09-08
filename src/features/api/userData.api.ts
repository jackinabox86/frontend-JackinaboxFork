import { apiService } from "@/lib/apiService";

// Schemas
import { z } from "zod";
import {
	LoginPayloadSchema,
	LoginPayloadType,
	TokenResponseSchema,
	TokenResponseType,
	RefreshPayloadType,
	RefreshPayloadSchema,
	UserProfilePayloadType,
	UserProfilePayloadSchema,
	UserProfilePatchPayloadType,
	UserProfilePatchSchema,
	UserChangePasswordPayloadType,
	UserChangePasswordPayloadSchema,
	UserChangePasswordResponseSchema,
	UserChangePasswordResponseType,
	UserVerifyEmailPayloadType,
	UserVerifyEmailResponseType,
	UserVerifyEmailPayloadSchema,
	UserVerifyEmailResponseSchema,
	UserAPIKeyPayloadType,
	UserAPIKeyPayloadSchema,
	UserAPIKeyCreatePayloadType,
	UserAPIKeyCreatePayloadSchema,
	UserRegistrationPayloadType,
	UserRegistrationPayloadSchema,
	UserRequestPasswordResetResponseType,
	UserRequestPasswordResetResponseSchema,
	UserRequestPasswordResetPayloadType,
	UserRequestPasswordResetPayloadSchema,
	UserPasswordResetPayloadType,
	UserPasswordResetResponseType,
	UserPasswordResetPayloadSchema,
	UserPasswordResetResponseSchema,
} from "@/features/api/schemas/user.schemas";

// Types & Interfaces
import {
	IUserAPIKey,
	IUserChangePasswordPayload,
	IUserChangePasswordResponse,
	IUserRequestPasswordResetResponse,
	IUserProfile,
	IUserProfilePatch,
	IUserRegistrationPayload,
	IUserTokenResponse,
	IUserVerifyEmailPayload,
	IUserVerifyEmailResponse,
	IUserPasswordResetResponse,
} from "@/features/api/userData.types";

/**
 * Calls the backends Login endpoint to return Token
 * @author jplacht
 *
 * @export
 * @async
 * @param {string} username Username Plain
 * @param {string} password Password Plain
 * @returns {Promise<Account.ILoginResponse>} Token Response
 */
export async function callUserLogin(
	username: string,
	password: string
): Promise<IUserTokenResponse> {
	return apiService.post<LoginPayloadType, TokenResponseType>(
		"/user/login",
		{
			username,
			password,
		},
		LoginPayloadSchema,
		TokenResponseSchema,
		true
	);
}

/**
 * Calls the backends Token refresh endpoint to fetch new
 * access and refresh tokens
 * @author jplacht
 *
 * @export
 * @async
 * @param {string} refresh_token Current Refresh Token
 * @returns {Promise<IUserTokenResponse>} Token Response
 */
export async function callRefreshToken(
	refresh_token: string
): Promise<IUserTokenResponse> {
	return apiService.post<RefreshPayloadType, TokenResponseType>(
		"/user/refresh",
		{
			refresh_token,
		},
		RefreshPayloadSchema,
		TokenResponseSchema,
		true
	);
}

/**
 * Calls the backends Profile endpoint to fetch users profile
 * @author jplacht
 *
 * @export
 * @async
 * @returns {Promise<IUserProfile>} User Profile
 */
export async function callGetProfile(): Promise<IUserProfile> {
	return apiService.get<UserProfilePayloadType>(
		"/user/profile",
		UserProfilePayloadSchema
	);
}

/**
 * Calls the backend Profile endpoint to patch user profile data
 *
 * @author jplacht
 *
 * @export
 * @async
 * @param {IUserProfilePatch} patchProfile Patched profile
 * @returns {Promise<IUserProfile>} Updated user profile
 */
export async function callPatchProfile(
	patchProfile: IUserProfilePatch
): Promise<IUserProfile> {
	return apiService.patch<
		UserProfilePatchPayloadType,
		UserProfilePayloadType
	>(
		"/user/profile",
		patchProfile,
		UserProfilePatchSchema,
		UserProfilePayloadSchema
	);
}

/**
 * Calls the backend to trigger another send of the email
 * verification email containing the verification code
 *
 * @author jplacht
 *
 * @export
 * @async
 * @returns {Promise<boolean>} Request Status
 */
export async function callResendEmailVerification(): Promise<boolean> {
	return apiService.post<null, boolean>(
		"/user/resend_email_verification",
		null,
		z.null(),
		z.boolean()
	);
}

/**
 * Calls the backend with the current (old) and to be updated
 * password (new) to change the users password.
 *
 * @author jplacht
 *
 * @export
 * @async
 * @param {IUserChangePasswordPayload} patchPassword Old and New password
 * @returns {Promise<IUserChangePasswordResponse>} Update status message
 */
export async function callChangePassword(
	patchPassword: IUserChangePasswordPayload
): Promise<IUserChangePasswordResponse> {
	return apiService.patch<
		UserChangePasswordPayloadType,
		UserChangePasswordResponseType
	>(
		"/user/changepassword",
		patchPassword,
		UserChangePasswordPayloadSchema,
		UserChangePasswordResponseSchema
	);
}

/**
 * Calls the backend and transmits an email verification code which is
 * then checked and the check status returned.
 *
 * @author jplacht
 *
 * @export
 * @async
 * @param {IUserVerifyEmailPayload} postCode Verification code
 * @returns {Promise<IUserVerifyEmailResponse>} Verification status
 */
export async function callVerifyEmail(
	postCode: IUserVerifyEmailPayload
): Promise<IUserVerifyEmailResponse> {
	return apiService.post<
		UserVerifyEmailPayloadType,
		UserVerifyEmailResponseType
	>(
		"/user/verify_email",
		postCode,
		UserVerifyEmailPayloadSchema,
		UserVerifyEmailResponseSchema
	);
}

export async function callAPIKeyList(): Promise<IUserAPIKey[]> {
	return apiService.get<UserAPIKeyPayloadType>(
		"/user/api-key",
		UserAPIKeyPayloadSchema
	);
}

export async function callCreateAPIKey(keyname: string): Promise<boolean> {
	return apiService.post<UserAPIKeyCreatePayloadType, boolean>(
		"/user/api-key",
		{ keyname },
		UserAPIKeyCreatePayloadSchema,
		z.boolean()
	);
}

export async function callDeleteAPIKey(key: string): Promise<boolean> {
	return apiService.delete(`/user/api-key/${key}`);
}

export async function callRegisterUser(
	data: IUserRegistrationPayload
): Promise<IUserProfile> {
	return apiService.post<UserRegistrationPayloadType, UserProfilePayloadType>(
		"/user/signup",
		data,
		UserRegistrationPayloadSchema,
		UserProfilePayloadSchema,
		true
	);
}

export async function callRequestPasswordReset(
	email: string
): Promise<IUserRequestPasswordResetResponse> {
	return apiService.post<
		UserRequestPasswordResetPayloadType,
		UserRequestPasswordResetResponseType
	>(
		"/user/request_password_reset",
		{ email },
		UserRequestPasswordResetPayloadSchema,
		UserRequestPasswordResetResponseSchema
	);
}

export async function callPasswordReset(
	code: string,
	password: string
): Promise<IUserPasswordResetResponse> {
	return apiService.post<
		UserPasswordResetPayloadType,
		UserPasswordResetResponseType
	>(
		"/user/password_rest",
		{ code, password },
		UserPasswordResetPayloadSchema,
		UserPasswordResetResponseSchema
	);
}
