import type {
	EventType,
	GiftRegistryType,
	ProjectStatus,
	MediaType,
	LiveStreamPlatform,
	FieldType
} from './enums';

export interface FieldDefinition {
	key: string;
	label: string;
	type: FieldType;
	required: boolean;
	placeholder?: string;
	validations?: string[];
	fields?: FieldDefinition[]; // sub-fields for group type
	min_items?: number; // minimum entries for group type
	max_items?: number; // maximum entries for group type
}

export interface FieldGroup {
	group_name: string;
	fields: FieldDefinition[];
}

export interface MediaBucket {
	key: string;
	label: string;
	media_type: MediaType;
	max_files: number;
}

export interface User {
	id: number;
	email: string;
	google_id?: string;
	is_admin: boolean;
	verified: boolean;
	projects?: Project[];
	created_at: string;
	updated_at: string;
}

export interface Theme {
	id: string;
	name: string;
	event_type: EventType;
	description: string;
	thumbnail: string;
	price: number | null;
	media_buckets: MediaBucket[];
	created_at: string;
	updated_at: string;
}

export interface FeatureToggle {
	id: number;
	project_id: string;
	show_rsvp: boolean;
	show_wishes: boolean;
	show_gallery: boolean;
	show_gifts: boolean;
	show_live_stream: boolean;
	show_music: boolean;
	require_registered_guest: boolean;
	whatsapp_template: string;
}

export interface Schedule {
	id: number;
	project_id: string;
	title: string;
	start_time: string;
	end_time?: string;
	timezone: string;
	location: string;
	map_url: string;
}

export interface GiftRegistry {
	id: number;
	project_id: string;
	type: GiftRegistryType;
	provider_name: string;
	account_number: string;
	account_name: string;
	qr_code_image: string;
	mailing_address: string;
}

export interface MediaMapping {
	id: number;
	project_id: string;
	bucket: string;
	media_type: MediaType;
	url: string;
	order: number;
}

export interface RSVP {
	id: number;
	project_id: string;
	name: string;
	attending: boolean;
	guest_count: number;
	special_message?: string;
	whatsapp?: string;
	is_responded: boolean;
	has_opened: boolean;
	created_at: string;
}

export interface Guestbook {
	id: number;
	project_id: string;
	name: string;
	message: string;
	created_at: string;
}

export interface TextOverride {
	id: number;
	project_id: string;
	slot_key: string;
	value: string;
	bold: boolean;
	italic: boolean;
}

export interface StyleOverride {
	id: number;
	project_id: string;
	slot_key: string;
	properties: Record<string, string>;
}

export interface DressCode {
	id: number;
	project_id: string;
	label: string;
	colors: string[];
}

export interface LiveStream {
	id: number;
	project_id: string;
	platform: LiveStreamPlatform;
	url: string;
	created_at: string;
}

export interface RSVPStats {
	attending: number;
	not_attending: number;
	pending: number;
	total_pax: number;
}

export interface Project {
	id: string;
	user_id: number;
	title: string;
	theme_id: string;
	theme?: Theme;
	music_id?: number | null;
	music?: Music;
	event_type: EventType;
	status: ProjectStatus;
	slug: string;
	sharing_thumbnail: string;
	feature_toggle: FeatureToggle;
	payload: any;
	schedules?: Schedule[];
	gift_registries?: GiftRegistry[];
	media_mappings?: MediaMapping[];
	dress_codes?: DressCode[];
	live_streams?: LiveStream[];
	rsvps?: RSVP[];
	guestbooks?: Guestbook[];
	text_overrides?: TextOverride[];
	style_overrides?: StyleOverride[];
	project_visits?: ProjectVisit[];
	total_viewers?: number;
	update_count: number;
	disk_quota_bytes: number;
	created_at: string;
	updated_at: string;
}

export interface MusicCategory {
	id: number;
	name: string;
	slug: string;
	description: string;
	order: number;
}

export interface Music {
	id: number;
	category_id: number;
	category?: MusicCategory;
	title: string;
	artist: string;
	file_path: string;
	duration_seconds: number;
	cover_image: string;
	order: number;
	created_at: string;
	updated_at: string;
}

export interface ProjectVisit {
	id: number;
	project_id: string;
	guest_name: string;
	source: string;
	user_agent: string;
	device_type?: string;
	ip_address: string;
	created_at: string;
}

export interface DailyVisit {
	date: string;
	count: number;
}

export interface SourceStats {
	source: string;
	count: number;
}

export interface DeviceStats {
	device_type: string;
	count: number;
}

export interface ProjectAnalytics {
	total_visits: number;
	unique_guests: number;
	recent_visits: ProjectVisit[];
	daily_visits: DailyVisit[];
	source_stats: SourceStats[];
	device_stats: DeviceStats[];
}

export interface QuotaInfo {
	used_bytes: number;
	used_human: string;
	limit_bytes: number;
	limit_human: string;
	remaining_bytes: number;
	remaining_human: string;
	usage_percent: number;
}

export interface FileRecord {
	id: number;
	url: string;
	original_name: string;
	content_type: string;
	size: number;
	optimized_size?: number;
	is_optimized: boolean;
	media_type: string;
	created_at: string;
}
