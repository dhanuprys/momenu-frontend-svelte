import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys';
import type { ThemeManifest } from '$lib/theme-engine/types';

export const MANIFEST = {
	id: 'seminar_professional_1',
	eventType: 'seminar',
	name: 'Professional',
	buckets: {
		hero_banner: { label: 'Banner Utama', mediaType: 'image', maxFiles: 1 },
		speaker_photos: { label: 'Foto Pembicara', mediaType: 'image', maxFiles: 5 }
	},
	demo: {
		guestName: 'Peserta VIP',
		payload: {
			nama_pembicara: 'Dr. Jane Doe & John Smith',
			nama_seminar: 'Tech Innovation Summit 2026'
		},
		schedules: [
			{
				title: 'Sesi Utama',
				start_time: '2026-11-10T08:00:00',
				end_time: '2026-11-10T16:00:00',
				timezone: 'Asia/Jakarta',
				location: 'Jakarta Convention Center',
				map_url: 'https://maps.google.com'
			}
		],
		featureToggle: {
			show_rsvp: true,
			show_wishes: false,
			show_gallery: false,
			show_gifts: false
		}
	}
} as const satisfies ThemeManifest<'seminar'>;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
