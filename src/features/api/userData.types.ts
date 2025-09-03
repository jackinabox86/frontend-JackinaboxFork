export interface IUserLoginPayload {
	username: string;
	password: string;
}

export interface IUserRefreshPayload {
	refresh_token: string;
}

export interface IUserTokenResponse {
	access_token: string;
	refresh_token: string;
}

export interface IUserProfile {
	user_id: number;
	username: string;
	email: string | null;
	email_verified: boolean;
	fio_apikey: string | null;
	prun_username: string | null;
	last_login?: Date;
	last_action?: Date;
}

export interface IUserProfilePatch {
	fio_apikey: string | null;
	prun_username: string | null;
	email: string | null;
}

export interface IUserChangePasswordPayload {
	old: string;
	new: string;
}

export interface IUserChangePasswordResponse {
	message: string;
}

export interface IUserVerifyEmailPayload {
	code: string;
}

export interface IUserVerifyEmailResponse {
	status_code: number;
	message: string;
}

export interface IUserAPIKey {
	name: string;
	key: string;
	created_date: Date;
	last_activity: Date | null;
}

export interface IUserAPIKeyCreatePayload {
	keyname: string;
}
