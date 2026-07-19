import type { TextOverride } from '$lib/types/models.js';
import type { TextSlotDefinitions } from '../types.js';

/**
 * Safely escapes HTML entities to prevent XSS attacks.
 */
function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Resolved formatting flags for a text slot.
 * Merges override values with theme defaults.
 */
export interface TextSlotFlags {
	bold: boolean;
	italic: boolean;
	underline: boolean;
	text_align: string;
	font_family: string;
}

const DEFAULT_FLAGS: TextSlotFlags = {
	bold: false,
	italic: false,
	underline: false,
	text_align: '',
	font_family: ''
};

export function createTextHelper<TSlots extends TextSlotDefinitions>(
	slots: TSlots | undefined,
	overrides: Record<string, TextOverride> | undefined
) {
	type SlotKey = keyof TSlots & string;

	return {
		/** Returns the raw text value (override or default) */
		get(key: SlotKey): string {
			if (overrides && overrides[key]) {
				return overrides[key].value;
			}
			return slots?.[key]?.defaultValue ?? '';
		},

		/** Returns HTML-wrapped text with inline formatting (bold/italic/underline) applied, safely escaped to prevent XSS */
		render(key: SlotKey): string {
			const rawValue = this.get(key);
			if (!rawValue) return '';

			// Prevent XSS by escaping the user input before wrapping in HTML
			const safeValue = escapeHtml(rawValue);

			if (overrides && overrides[key]) {
				const override = overrides[key];
				let html = safeValue;
				if (override.bold) {
					html = `<strong>${html}</strong>`;
				}
				if (override.italic) {
					html = `<em>${html}</em>`;
				}
				if (override.underline) {
					html = `<u>${html}</u>`;
				}
				return html;
			}
			return safeValue;
		},

		/**
		 * Returns an inline CSS string for font-level overrides on this slot.
		 * Merges: override values > theme slot defaults > empty.
		 *
		 * Usage in theme components:
		 * ```svelte
		 * <p style={text.fontStyle(TEXT.quote_text)}>{@html text.render(TEXT.quote_text)}</p>
		 * ```
		 */
		fontStyle(key: SlotKey): string {
			const parts: string[] = [];
			const slot = slots?.[key];
			const o = overrides?.[key];

			const family = (o?.font_family || slot?.defaultFontFamily || '').replace(/[;"'{}]/g, '');
			const align = (o?.text_align || slot?.defaultTextAlign || '').replace(/[;"'{}]/g, '');

			if (family) parts.push(`font-family: '${family}', sans-serif`);
			if (align) parts.push(`text-align: ${align}`);

			return parts.join('; ');
		},

		/** Returns true if this slot has a saved override */
		isOverridden(key: SlotKey): boolean {
			return !!(overrides && overrides[key]);
		},

		/**
		 * Returns the full resolved formatting flags for a slot.
		 * Falls back to theme defaults, then to empty defaults.
		 */
		getFlags(key: SlotKey): TextSlotFlags {
			if (overrides && overrides[key]) {
				const o = overrides[key];
				return {
					bold: o.bold,
					italic: o.italic,
					underline: o.underline,
					text_align: o.text_align,
					font_family: o.font_family
				};
			}
			return { ...DEFAULT_FLAGS };
		}
	};
}
