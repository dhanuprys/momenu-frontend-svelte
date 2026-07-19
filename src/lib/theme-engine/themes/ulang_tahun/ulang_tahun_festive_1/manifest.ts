import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';
import type { ThemeManifest } from '$lib/theme-engine/types.js';

export const MANIFEST = {
	id: 'ulang_tahun_festive_1',
	eventType: 'ulang_tahun',
	name: 'Festive Party',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Foto', mediaType: 'image', maxFiles: 10 }
	}
} as const satisfies ThemeManifest;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
