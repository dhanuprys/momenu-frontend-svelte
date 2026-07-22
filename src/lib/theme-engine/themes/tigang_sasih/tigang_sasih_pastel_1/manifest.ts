import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';
import type { ThemeManifest } from '$lib/theme-engine/types.js';

export const MANIFEST = {
	id: 'tigang_sasih_pastel_1',
	eventType: 'tigang_sasih',
	name: 'Pastel Joy',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		baby_gallery: { label: 'Galeri Bayi', mediaType: 'image', maxFiles: 10 }
	},
	demo: {
		guestName: 'Keluarga Besar',
		payload: {
			nama_bayi: 'Putu Arka',
			nama_ayah: 'Made Dwi',
			nama_ibu: 'Nyoman Tri'
		},
		schedules: [
			{
				title: 'Upacara Tigang Sasih',
				start_time: '2027-01-20T10:00:00',
				timezone: 'Asia/Jakarta',
				location: 'Rumah Kediaman',
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
} as const satisfies ThemeManifest<'tigang_sasih'>;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
