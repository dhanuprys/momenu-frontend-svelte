import type { TextSlotDefinitions } from '../types/theme-manifest';
import type { TextOverride } from '../types/models';

export function createTextHelper<TSlots extends TextSlotDefinitions>(
	slots: TSlots | undefined,
	overrides: Record<string, TextOverride> | undefined
) {
	type SlotKey = keyof TSlots & string;

	return {
		get(key: SlotKey): string {
			if (overrides && overrides[key]) {
				return overrides[key].value;
			}
			return slots?.[key]?.defaultValue ?? '';
		},
		render(key: SlotKey): string {
			const value = this.get(key);
			if (!value) return '';

			if (overrides && overrides[key]) {
				const override = overrides[key];
				let html = value;
				// Basic HTML escaping to prevent XSS (if needed, but usually we just allow safe tags)
				// For now, assuming trusted input or handled elsewhere
				if (override.bold) {
					html = `<strong>${html}</strong>`;
				}
				if (override.italic) {
					html = `<em>${html}</em>`;
				}
				return html;
			}
			return value;
		},
		isOverridden(key: SlotKey): boolean {
			return !!(overrides && overrides[key]);
		},
		getFlags(key: SlotKey): { bold: boolean; italic: boolean } {
			if (overrides && overrides[key]) {
				return { bold: overrides[key].bold, italic: overrides[key].italic };
			}
			return { bold: false, italic: false };
		}
	};
}
