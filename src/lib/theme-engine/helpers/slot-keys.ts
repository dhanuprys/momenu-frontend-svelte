/**
 * Extracts typed slot key constants from a theme manifest's slot definitions.
 *
 * Returns a frozen object where each key maps to itself as a string value,
 * providing compile-time safety and IDE autocomplete for slot key references.
 *
 * @example
 * ```typescript
 * const MANIFEST = {
 *   buckets: {
 *     hero_photo: { label: 'Hero', mediaType: 'image', maxFiles: 1 },
 *     gallery:    { label: 'Gallery', mediaType: 'image', maxFiles: 10 },
 *   }
 * } as const satisfies ThemeManifest;
 *
 * export const BUCKET = extractSlotKeys(MANIFEST.buckets);
 * // BUCKET.hero_photo === 'hero_photo'  ✅ autocomplete
 * // BUCKET.typo                         ❌ compile error
 * ```
 */
export function extractSlotKeys<T extends Record<string, unknown>>(
	slots: T
): { readonly [K in keyof T]: K } {
	const keys = {} as { [K in keyof T]: K };
	for (const key of Object.keys(slots) as (keyof T & string)[]) {
		(keys as Record<string, string>)[key] = key;
	}
	return Object.freeze(keys);
}
