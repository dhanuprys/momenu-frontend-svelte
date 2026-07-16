import type { ThemeManifest } from '$lib/theme-engine/types.js';
import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';

export const MANIFEST = {
	id: 'tigang_sasih_pastel_1',
	eventType: 'tigang_sasih',
	name: 'Pastel Joy',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		baby_gallery: { label: 'Galeri Bayi', mediaType: 'image', maxFiles: 10 }
	}
} as const satisfies ThemeManifest;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);

