import type { ThemeManifest } from '$lib/theme-engine/types.js';
import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';

export const MANIFEST = {
	id: 'metatah_sakral_1',
	eventType: 'metatah',
	name: 'Sakral Bali',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		ceremony_gallery: { label: 'Galeri Upacara', mediaType: 'image', maxFiles: 15 }
	}
} as const satisfies ThemeManifest;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);

