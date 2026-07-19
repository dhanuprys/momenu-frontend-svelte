/**
 * Curated list of available Google Fonts for text customization.
 * This is a client-side constant — the backend stores the raw font family string.
 *
 * Each entry has:
 * - `value`: the CSS font-family name (matches the Google Fonts import)
 * - `label`: human-readable display name shown in the UI
 * - `category`: classification for grouping in the picker
 */

export const FontCategory = {
	SANS: 'sans-serif',
	SERIF: 'serif',
	DISPLAY: 'display',
	HANDWRITING: 'handwriting',
	MONOSPACE: 'monospace'
} as const;

export type FontCategory = (typeof FontCategory)[keyof typeof FontCategory];

export interface FontFamilyOption {
	readonly value: string;
	readonly label: string;
	readonly category: FontCategory;
}

/**
 * Curated font list. Add/remove entries here to control what's available
 * in the text customization UI across all themes.
 */
export const AVAILABLE_FONTS = [
	// Sans-Serif
	{ value: 'Inter', label: 'Inter', category: FontCategory.SANS },
	{ value: 'Poppins', label: 'Poppins', category: FontCategory.SANS },
	{ value: 'Roboto', label: 'Roboto', category: FontCategory.SANS },
	{ value: 'Outfit', label: 'Outfit', category: FontCategory.SANS },
	{ value: 'Montserrat', label: 'Montserrat', category: FontCategory.SANS },
	{ value: 'Open Sans', label: 'Open Sans', category: FontCategory.SANS },
	{ value: 'Nunito', label: 'Nunito', category: FontCategory.SANS },

	// Serif
	{ value: 'Lora', label: 'Lora', category: FontCategory.SERIF },
	{ value: 'Playfair Display', label: 'Playfair Display', category: FontCategory.SERIF },
	{ value: 'Merriweather', label: 'Merriweather', category: FontCategory.SERIF },
	{ value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: FontCategory.SERIF },
	{ value: 'EB Garamond', label: 'EB Garamond', category: FontCategory.SERIF },

	// Display
	{ value: 'Abril Fatface', label: 'Abril Fatface', category: FontCategory.DISPLAY },

	// Handwriting / Script
	{ value: 'Great Vibes', label: 'Great Vibes', category: FontCategory.HANDWRITING },
	{ value: 'Dancing Script', label: 'Dancing Script', category: FontCategory.HANDWRITING },
	{ value: 'Parisienne', label: 'Parisienne', category: FontCategory.HANDWRITING },
	{ value: 'Sacramento', label: 'Sacramento', category: FontCategory.HANDWRITING },
	{ value: 'Alex Brush', label: 'Alex Brush', category: FontCategory.HANDWRITING },

	// Monospace
	{ value: 'JetBrains Mono', label: 'JetBrains Mono', category: FontCategory.MONOSPACE }
] as const satisfies readonly FontFamilyOption[];

/** All valid font-family values as a union type */
export type AvailableFontFamily = (typeof AVAILABLE_FONTS)[number]['value'];

/**
 * Valid text alignment values.
 */
export const TextAlign = {
	LEFT: 'left',
	CENTER: 'center',
	RIGHT: 'right'
} as const;

export type TextAlign = (typeof TextAlign)[keyof typeof TextAlign];

/**
 * Builds a Google Fonts CSS import URL for a given set of font families.
 * Useful when dynamically loading fonts that a user has selected.
 */
export function buildGoogleFontsUrl(families: string[]): string {
	if (families.length === 0) return '';
	const params = families
		.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
		.join('&');
	return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
