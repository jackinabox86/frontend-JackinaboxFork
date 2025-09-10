export interface IShared {
	shared_uuid: string;
	plan_uuid: string;
	view_count: number;
}

export interface ISharedCreateResponse {
	uuid: string;
	created_date: string;
	view_count: number;
}

export interface ISharedCloneResponse {
	message: string;
}
