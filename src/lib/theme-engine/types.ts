import type { MediaType } from '$lib/types/enums.js';

/**
 * Defines a single media bucket slot for a theme.
 * Mirrors the backend's models.MediaBucket struct.
 */
export interface BucketConfig {
	label: string;
	mediaType: MediaType;
	maxFiles: number;
}

/**
 * A record mapping bucket keys to their configurations.
 * Each theme defines its own set of bucket keys.
 */
export type BucketDefinitions = Record<string, BucketConfig>;

/**
 * Text slot: overrideable text content
 */
export interface TextSlotConfig {
	label: string;
	defaultValue: string;
}
export type TextSlotDefinitions = Record<string, TextSlotConfig>;

/**
 * Style slot: overrideable container visual properties
 */
export interface StyleProperties {
	backgroundColor?: string;
	textColor?: string;
	borderRadius?: string;
	opacity?: string;
}
export interface StyleSlotConfig {
	label: string;
	properties: StyleProperties;
}
export type StyleSlotDefinitions = Record<string, StyleSlotConfig>;

/**
 * A theme manifest that strongly types the media buckets, text slots, and style slots for a specific theme.
 * This is the frontend's mirror of the backend's theme seeder data.
 *
 * Use `as const satisfies ThemeManifest` when defining a manifest to get
 * literal type inference for bucket keys.
 */
export interface ThemeManifest<
	TBuckets extends BucketDefinitions = BucketDefinitions,
	TTextSlots extends TextSlotDefinitions = TextSlotDefinitions,
	TStyleSlots extends StyleSlotDefinitions = StyleSlotDefinitions
> {
	id: string;
	eventType: string;
	name: string;
	buckets: TBuckets;
	textSlots?: TTextSlots;
	styleSlots?: TStyleSlots;
}
