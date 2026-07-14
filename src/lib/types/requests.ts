import type { GiftRegistryType, LiveStreamPlatform } from './enums';

export interface LoginRequest {
	email: string;
	password?: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password?: string;
	turnstile_token?: string;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

export interface CreateProjectRequest {
	title: string;
	theme_id: string;
	music_id?: number;
	payload: any;
}

export interface UpdateProjectRequest {
	title: string;
	slug: string;
	payload: any;
	sharing_thumbnail: string;
	music_id?: number | null;
}

export interface UpdateProjectStatusRequest {
	status: string;
}

export interface UpdateFeatureToggleRequest {
	show_rsvp?: boolean;
	show_wishes?: boolean;
	show_gallery?: boolean;
	show_gifts?: boolean;
	show_live_stream?: boolean;
	require_registered_guest?: boolean;
	whatsapp_template?: string;
}

export interface ScheduleRequest {
	title: string;
	start_time: string;
	end_time?: string;
	timezone: string;
	location?: string;
	map_url?: string;
}

export interface GiftRegistryRequest {
	type: GiftRegistryType;
	provider_name?: string;
	account_number?: string;
	account_name?: string;
	qr_code_image?: string;
	mailing_address?: string;
}

export interface MediaMappingRequest {
	bucket: string;
	media_type: string;
	url: string;
	order: number;
}

export interface UploadResult {
	url: string;
	filename: string;
	original_name: string;
	size: number;
	content_type: string;
}

export interface DressCodeRequest {
	label: string;
	colors: string[];
}

export interface LiveStreamRequest {
	platform: LiveStreamPlatform;
	url: string;
}

export interface RSVPRequest {
	name: string;
	attending: boolean;
	guest_count: number;
}

export interface OwnerRSVPRequest {
	name: string;
	special_message?: string;
	whatsapp?: string;
}

export interface GuestbookRequest {
	name: string;
	message: string;
}
