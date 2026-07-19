import type { TextOverride } from '$lib/types/models.js';
import type { TextSlotConfig, TextSlotDefinitions } from '../types.js';

// ─── Shared Edit State ────────────────────────────────────────────

/**
 * The canonical shape of a single text slot's edit state.
 * Used by ALL customizer UIs (drawer form, standalone page, etc.)
 *
 * **Adding a new formatting property?**
 * 1. Add it here
 * 2. Add it to `TextOverride` in `models.ts`
 * 3. Add it to the backend `TextOverrideItem` struct
 * 4. Add it to `TextSlotFlags` in `text.ts`
 * 5. Add it to `DEFAULT_EDIT_STATE` below
 * 6. Update `createEditStateFromSlot()` and `createEditStateFromOverride()` below
 * That's it — all consumers import this type.
 */
export interface TextEditState {
	value: string;
	bold: boolean;
	italic: boolean;
	underline: boolean;
	text_align: string;
	font_family: string;
}

/** The zero-value edit state — no formatting, empty value */
const DEFAULT_EDIT_STATE: TextEditState = {
	value: '',
	bold: false,
	italic: false,
	underline: false,
	text_align: '',
	font_family: ''
};

// ─── Payload Type ─────────────────────────────────────────────────

/**
 * The shape of a single override in the upsert API request.
 * This is exactly what `TextOverrideService.upsert()` sends per slot.
 */
export type TextOverridePayload = TextEditState & { slot_key: string };

// ─── Factory Functions ────────────────────────────────────────────

/**
 * Creates an edit state from a text slot's defaults (no saved override).
 */
export function createEditStateFromSlot(config: TextSlotConfig): TextEditState {
	return {
		...DEFAULT_EDIT_STATE,
		value: config.defaultValue,
		text_align: config.defaultTextAlign ?? '',
		font_family: config.defaultFontFamily ?? ''
	};
}

/**
 * Creates an edit state from a saved `TextOverride`.
 */
export function createEditStateFromOverride(override: TextOverride): TextEditState {
	return {
		value: override.value,
		bold: override.bold,
		italic: override.italic,
		underline: override.underline ?? false,
		text_align: override.text_align ?? '',
		font_family: override.font_family ?? ''
	};
}

/**
 * Initializes the full edit state map for all text slots in a manifest.
 * Merges saved overrides onto slot defaults.
 *
 * This is THE single place that handles "how do we init edit state?".
 * Both the customizer drawer and the standalone customize page use this.
 */
export function initTextEdits(
	textSlots: TextSlotDefinitions,
	savedOverrides: TextOverride[] | undefined
): Record<string, TextEditState> {
	const edits: Record<string, TextEditState> = {};

	for (const key of Object.keys(textSlots)) {
		const existing = savedOverrides?.find((o) => o.slot_key === key);
		edits[key] = existing
			? createEditStateFromOverride(existing)
			: createEditStateFromSlot(textSlots[key]);
	}

	return edits;
}

/**
 * Determines if a text edit has been changed from the slot defaults
 * (i.e., should it be included in the upsert payload?).
 */
export function isEditDirty(edit: TextEditState, slotConfig: TextSlotConfig): boolean {
	return (
		edit.value !== slotConfig.defaultValue ||
		edit.bold ||
		edit.italic ||
		edit.underline ||
		edit.text_align !== (slotConfig.defaultTextAlign ?? '') ||
		edit.font_family !== (slotConfig.defaultFontFamily ?? '')
	);
}

/**
 * Builds the upsert payload from edit state, filtering out unchanged slots.
 */
export function buildTextPayload(
	textEdits: Record<string, TextEditState>,
	textSlots: TextSlotDefinitions
): TextOverridePayload[] {
	return Object.entries(textEdits)
		.filter(([key, edit]) => isEditDirty(edit, textSlots[key]))
		.map(([key, edit]) => ({
			slot_key: key,
			...edit
		}));
}

/**
 * Resets a single slot's edit state back to the theme default.
 */
export function resetToDefault(slotConfig: TextSlotConfig): TextEditState {
	return createEditStateFromSlot(slotConfig);
}
