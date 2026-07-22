import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';
import type { ThemeManifest } from '$lib/theme-engine/types.js';

export const MANIFEST = {
	id: 'ulang_tahun_festive_1',
	eventType: 'ulang_tahun',
	name: 'Festive Party',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Foto', mediaType: 'image', maxFiles: 10 }
	},
	demo: {
		payload: {
			nama_dirayakan: 'Budi Santoso',
			umur: 25
		},
		schedules: [
			{
				title: 'Pesta Ulang Tahun',
				start_time: '2028-05-15T19:00:00',
				timezone: 'Asia/Jakarta',
				location: 'Hotel Mulia, Jakarta',
				map_url: 'https://maps.google.com'
			}
		],
		featureToggle: {
			show_rsvp: true,
			show_wishes: true,
			show_gallery: true,
			show_gifts: true
		}
	}
} as const satisfies ThemeManifest;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
