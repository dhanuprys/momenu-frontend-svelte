import type { EventType, MediaType } from '$lib/types/enums.js';
import type { PayloadMap } from '$lib/types/invitation.js';
import type { FeatureToggle, Schedule } from '$lib/types/models.js';

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
 * Text slot: overrideable text content with optional section grouping and formatting defaults.
 *
 * - `section`: groups this slot with other slots of the same section in the customizer UI.
 *   Slots without a section appear as standalone items.
 * - `inputType`: controls whether the customizer renders an Input ('short') or Textarea ('long').
 *   Auto-detected from defaultValue length if omitted.
 * - `defaultFontFamily`, `defaultFontSize`, `defaultTextAlign`: theme-level formatting defaults
 *   that the user can override per-slot.
 */
export interface TextSlotConfig {
	label: string;
	defaultValue: string;
	/** Group key — slots with the same section string are grouped in the customizer */
	section?: string;
	/** UI hint: 'short' renders an Input, 'long' renders a Textarea */
	inputType?: 'short' | 'long';
	/** Default font family (CSS value, must match an entry in AVAILABLE_FONTS) */
	defaultFontFamily?: string;
	/** Default text alignment */
	defaultTextAlign?: 'left' | 'center' | 'right';
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
 * Demo payload defining mock data to render the theme nicely without a real project.
 */
export interface ThemeDemoPayload<TEventType extends EventType> {
	guestName?: string;
	payload: PayloadMap[TEventType];
	schedules?: Omit<Schedule, 'id' | 'project_id'>[];
	featureToggle?: Partial<FeatureToggle>;
}

/**
 * A theme manifest that strongly types the media buckets, text slots, and style slots for a specific theme.
 * This is the frontend's mirror of the backend's theme seeder data.
 *
 * Use `as const satisfies ThemeManifest<...>` when defining a manifest to get
 * literal type inference for bucket keys.
 */
export interface ThemeManifest<
	TEventType extends EventType = EventType,
	TBuckets extends BucketDefinitions = BucketDefinitions,
	TTextSlots extends TextSlotDefinitions = TextSlotDefinitions,
	TStyleSlots extends StyleSlotDefinitions = StyleSlotDefinitions
> {
	id: string;
	eventType: TEventType;
	name: string;
	buckets: TBuckets;
	textSlots?: TTextSlots;
	styleSlots?: TStyleSlots;
	demo?: ThemeDemoPayload<TEventType>;
}
