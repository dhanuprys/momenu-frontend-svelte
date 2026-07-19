import type { StyleOverride } from '$lib/types/models.js';
import type { StyleProperties, StyleSlotDefinitions } from '../types.js';

export function createStyleHelper<TSlots extends StyleSlotDefinitions>(
	slots: TSlots | undefined,
	overrides: Record<string, StyleOverride> | undefined
) {
	type SlotKey = keyof TSlots & string;

	// Helper to convert camelCase to kebab-case (e.g., backgroundColor -> background-color)
	const camelToKebab = (str: string) => {
		return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	};

	return {
		get(key: SlotKey): StyleProperties {
			const defaultProps = slots?.[key]?.properties ?? {};
			if (overrides && overrides[key]) {
				return { ...defaultProps, ...overrides[key].properties };
			}
			return defaultProps;
		},
		css(key: SlotKey): string {
			const props = this.get(key);
			return Object.entries(props)
				.filter(([_, value]) => value !== undefined && value !== null && value !== '')
				.map(([k, value]) => {
					// special case for textColor to just 'color' in CSS
					const cssProp = k === 'textColor' ? 'color' : camelToKebab(k);
					// sanitize to prevent CSS injection (no semicolons or braces)
					const safeValue = String(value).replace(/[;{}]/g, '').trim();
					return `${cssProp}: ${safeValue};`;
				})
				.join(' ');
		},
		isOverridden(key: SlotKey): boolean {
			return !!(overrides && overrides[key]);
		}
	};
}
