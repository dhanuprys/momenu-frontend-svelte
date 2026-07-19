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
	{ value: 'Lato', label: 'Lato', category: FontCategory.SANS },
	{ value: 'Oswald', label: 'Oswald', category: FontCategory.SANS },
	{ value: 'Raleway', label: 'Raleway', category: FontCategory.SANS },
	{ value: 'Ubuntu', label: 'Ubuntu', category: FontCategory.SANS },
	{ value: 'Quicksand', label: 'Quicksand', category: FontCategory.SANS },

	// Serif
	{ value: 'Lora', label: 'Lora', category: FontCategory.SERIF },
	{ value: 'Playfair Display', label: 'Playfair Display', category: FontCategory.SERIF },
	{ value: 'Merriweather', label: 'Merriweather', category: FontCategory.SERIF },
	{ value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: FontCategory.SERIF },
	{ value: 'EB Garamond', label: 'EB Garamond', category: FontCategory.SERIF },
	{ value: 'PT Serif', label: 'PT Serif', category: FontCategory.SERIF },
	{ value: 'Libre Baskerville', label: 'Libre Baskerville', category: FontCategory.SERIF },
	{ value: 'Crimson Text', label: 'Crimson Text', category: FontCategory.SERIF },
	{ value: 'Cardo', label: 'Cardo', category: FontCategory.SERIF },

	// Display
	{ value: 'Abril Fatface', label: 'Abril Fatface', category: FontCategory.DISPLAY },
	{ value: 'Bebas Neue', label: 'Bebas Neue', category: FontCategory.DISPLAY },
	{ value: 'Righteous', label: 'Righteous', category: FontCategory.DISPLAY },
	{ value: 'Comfortaa', label: 'Comfortaa', category: FontCategory.DISPLAY },
	{ value: 'Anton', label: 'Anton', category: FontCategory.DISPLAY },
	{ value: 'Pacifico', label: 'Pacifico', category: FontCategory.DISPLAY },
	{ value: 'Lobster', label: 'Lobster', category: FontCategory.DISPLAY },

	// Handwriting / Script
	{ value: 'Great Vibes', label: 'Great Vibes', category: FontCategory.HANDWRITING },
	{ value: 'Dancing Script', label: 'Dancing Script', category: FontCategory.HANDWRITING },
	{ value: 'Parisienne', label: 'Parisienne', category: FontCategory.HANDWRITING },
	{ value: 'Sacramento', label: 'Sacramento', category: FontCategory.HANDWRITING },
	{ value: 'Alex Brush', label: 'Alex Brush', category: FontCategory.HANDWRITING },
	{ value: 'Caveat', label: 'Caveat', category: FontCategory.HANDWRITING },
	{ value: 'Satisfy', label: 'Satisfy', category: FontCategory.HANDWRITING },
	{ value: 'Yellowtail', label: 'Yellowtail', category: FontCategory.HANDWRITING },
	{ value: 'Cookie', label: 'Cookie', category: FontCategory.HANDWRITING },
	{ value: 'Allura', label: 'Allura', category: FontCategory.HANDWRITING },
	{ value: 'Pinyon Script', label: 'Pinyon Script', category: FontCategory.HANDWRITING },

	// Monospace
	{ value: 'JetBrains Mono', label: 'JetBrains Mono', category: FontCategory.MONOSPACE },
	{ value: 'Roboto Mono', label: 'Roboto Mono', category: FontCategory.MONOSPACE },
	{ value: 'Fira Code', label: 'Fira Code', category: FontCategory.MONOSPACE },
	{ value: 'Source Code Pro', label: 'Source Code Pro', category: FontCategory.MONOSPACE }
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
