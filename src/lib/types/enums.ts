export const EVENT_TYPES = [
	'pernikahan',
	'ulang_tahun',
	'metatah',
	'tigang_sasih',
	'seminar'
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type GiftRegistryType = 'bank' | 'ewallet' | 'physical';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export type MediaType = 'image' | 'video';

export type LiveStreamPlatform = 'youtube' | 'zoom' | 'instagram' | 'tiktok' | 'gmeet' | 'other';

export type FieldType = 'string' | 'text' | 'number' | 'url' | 'group' | 'image';
