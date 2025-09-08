import { z } from "zod";

// Types & Interfaces
import {
	IUserLoginPayload,
	IUserRefreshPayload,
	IUserTokenResponse,
	IUserAPIKey,
	IUserAPIKeyCreatePayload,
	IUserRegistrationPayload,
	IUserRequestPasswordResetResponse,
	IUserRequestPasswordResetPayload,
	IUserPasswordResetPayload,
} from "@/features/api/userData.types";

export const LoginPayloadSchema: z.ZodType<IUserLoginPayload> = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

export const TokenResponseSchema: z.ZodType<IUserTokenResponse> = z.object({
	access_token: z.string().min(120),
	refresh_token: z.string().min(120),
});

export const RefreshPayloadSchema: z.ZodType<IUserRefreshPayload> = z.object({
	refresh_token: z.string().min(120),
});

export const UserProfilePayloadSchema = z.object({
	user_id: z.number(),
	username: z.string(),
	email: z
		.string()
		.transform((val) => (val === "" ? null : val))
		.nullable(),
	email_verified: z.boolean(),
	fio_apikey: z
		.string()
		.transform((val) => (val === "" ? null : val))
		.nullable(),
	prun_username: z
		.string()
		.transform((val) => (val === "" ? null : val))
		.nullable(),
	last_login: z.coerce.date().optional(),
	last_action: z.coerce.date().optional(),
});

export const UserProfilePatchSchema = z.object({
	fio_apikey: z
		.string()
		.transform((val) => (val === "" || !val ? null : val))
		.nullable(),
	prun_username: z
		.string()
		.transform((val) => (val === "" || !val ? null : val))
		.nullable(),
	email: z
		.string()
		.transform((val) => (val === "" || !val ? null : val))
		.nullable(),
});

export const UserChangePasswordPayloadSchema = z.object({
	old: z.string(),
	new: z.string(),
});

export const UserChangePasswordResponseSchema = z.object({
	message: z.string(),
});

export const UserVerifyEmailPayloadSchema = z.object({
	code: z.string(),
});

export const UserVerifyEmailResponseSchema = z.object({
	status_code: z.int(),
	message: z.string(),
});

const UserAPIKeySchema: z.ZodType<IUserAPIKey> = z.object({
	name: z.string(),
	key: z.string(),
	created_date: z.coerce.date(),
	last_activity: z.coerce.date().nullable(),
});

export const UserAPIKeyPayloadSchema: z.ZodType<IUserAPIKey[]> =
	z.array(UserAPIKeySchema);

export const UserAPIKeyCreatePayloadSchema: z.ZodType<IUserAPIKeyCreatePayload> =
	z.object({
		keyname: z.string().min(1).max(100),
	});

export const UserRegistrationPayloadSchema: z.ZodType<IUserRegistrationPayload> =
	z.object({
		username: z.string().min(3),
		password: z.string().min(8),
		planet: z.string(),
		randomplanet: z.string(),
		email: z.string().optional(),
	});

export const UserRequestPasswordResetPayloadSchema: z.ZodType<IUserRequestPasswordResetPayload> =
	z.object({
		email: z.email(),
	});

export const UserRequestPasswordResetResponseSchema: z.ZodType<IUserRequestPasswordResetResponse> =
	z.object({
		status_code: z.number().int(),
		message: z.string(),
	});

export const UserPasswordResetPayloadSchema: z.ZodType<IUserPasswordResetPayload> =
	z.object({
		code: z.string(),
		password: z.string(),
	});

export const UserPasswordResetResponseSchema: z.ZodType<IUserRequestPasswordResetResponse> =
	z.object({
		status_code: z.number().int(),
		message: z.string(),
	});
export type LoginPayloadType = z.infer<typeof LoginPayloadSchema>;
export type TokenResponseType = z.infer<typeof TokenResponseSchema>;
export type RefreshPayloadType = z.infer<typeof RefreshPayloadSchema>;
export type UserProfilePayloadType = z.infer<typeof UserProfilePayloadSchema>;
export type UserProfilePatchPayloadType = z.infer<
	typeof UserProfilePatchSchema
>;
export type UserChangePasswordPayloadType = z.infer<
	typeof UserChangePasswordPayloadSchema
>;
export type UserChangePasswordResponseType = z.infer<
	typeof UserChangePasswordResponseSchema
>;
export type UserVerifyEmailPayloadType = z.infer<
	typeof UserVerifyEmailPayloadSchema
>;
export type UserVerifyEmailResponseType = z.infer<
	typeof UserVerifyEmailResponseSchema
>;
export type UserAPIKeyPayloadType = z.infer<typeof UserAPIKeyPayloadSchema>;
export type UserAPIKeyCreatePayloadType = z.infer<
	typeof UserAPIKeyCreatePayloadSchema
>;
export type UserRegistrationPayloadType = z.infer<
	typeof UserRegistrationPayloadSchema
>;
export type UserRequestPasswordResetPayloadType = z.infer<
	typeof UserRequestPasswordResetPayloadSchema
>;
export type UserRequestPasswordResetResponseType = z.infer<
	typeof UserRequestPasswordResetResponseSchema
>;

export type UserPasswordResetPayloadType = z.infer<
	typeof UserPasswordResetPayloadSchema
>;
export type UserPasswordResetResponseType = z.infer<
	typeof UserPasswordResetResponseSchema
>;
