import type { InvitationData, PayloadMap } from '$lib/types/invitation.js';
import type { Project, Schedule, RSVP, Guestbook } from '$lib/types/models.js';
import type { ThemeManifest } from '../types.js';
import type { EventType } from '$lib/types/enums.js';

const defaultMockPayloads: { [K in EventType]: PayloadMap[K] } = {
	pernikahan: {
		nama_mempelai_pria: 'Romeo',
		nama_panggilan_pria: 'Romeo',
		nama_mempelai_wanita: 'Juliet',
		nama_panggilan_wanita: 'Juliet'
	},
	ulang_tahun: {
		nama_dirayakan: 'Guest of Honor',
		umur: 1
	},
	metatah: {
		peserta: [{ nama: 'Wayan' }, { nama: 'Made' }]
	},
	tigang_sasih: {
		nama_bayi: 'Baby',
		nama_ayah: 'Ayah',
		nama_ibu: 'Ibu'
	},
	seminar: {
		nama_pembicara: 'Speaker',
		nama_seminar: 'Tech Event'
	}
};

/**
 * Creates a fully typed, mocked InvitationData object for a given theme manifest.
 * Used exclusively for the Demo Viewer page.
 */
export function createMockInvitationData<TEventType extends EventType>(
	themeId: string,
	manifest: ThemeManifest<TEventType, any, any, any>,
	coverState: { isOpened: () => boolean; open: () => void }
): InvitationData {
	const demoData = manifest.demo || { payload: defaultMockPayloads[manifest.eventType] };
	const eventType = manifest.eventType;
	const payload = demoData.payload || defaultMockPayloads[eventType] || {};
	const guestName = demoData.guestName || 'Tamu Undangan';
	const schedules = (demoData.schedules as Schedule[]) || [];

	// Derive firstScheduleDate identically to the main application
	let firstScheduleDate: Date | null = null;
	if (schedules.length > 0) {
		const validSchedules = schedules.filter((s) => s.start_time);
		if (validSchedules.length > 0) {
			const sorted = validSchedules.sort(
				(a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
			);
			firstScheduleDate = new Date(sorted[0].start_time);
		}
	}

	const mockProject: Project = {
		id: 'demo-project',
		user_id: 1,
		title: 'Demo Project',
		theme_id: themeId,
		event_type: eventType,
		status: 'draft',
		slug: 'demo',
		sharing_thumbnail: '',
		feature_toggle: {
			id: 1,
			project_id: 'demo',
			show_rsvp: true,
			show_wishes: true,
			show_gallery: true,
			show_gifts: true,
			show_live_stream: false,
			show_music: false,
			require_registered_guest: false,
			whatsapp_template: '',
			...(demoData.featureToggle || {})
		},
		payload: payload,
		update_count: 0,
		disk_quota_bytes: 0,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};

	return {
		project: mockProject,
		slug: 'demo',
		guestName: guestName,
		themeId: themeId,
		eventType: eventType,
		payload: payload,
		isPreview: true, // Crucial: Enables placeholder images in media.ts
		schedules: schedules,
		firstScheduleDate: firstScheduleDate,
		giftRegistries: [],
		mediaMappings: [],
		dressCodes: [],
		liveStreams: [],
		featureToggle: mockProject.feature_toggle,
		textOverrides: {},
		styleOverrides: {},
		coverState: coverState,
		invitationApi: {
			getGuest: async () => {
				throw new Error('Mock API: getGuest not supported in demo');
			},
			submitRSVP: async (data) => {
				alert('Demo: RSVP Berhasil Disimpan!');
				return {
					id: 1,
					project_id: 'demo',
					...data,
					has_opened: true,
					created_at: new Date().toISOString()
				} as RSVP;
			},
			getGuestbook: async () => ({ data: [] }),
			submitGuestbook: async (data) => {
				alert('Demo: Ucapan Berhasil Dikirim!');
				return {
					id: 1,
					project_id: 'demo',
					...data,
					created_at: new Date().toISOString()
				} as Guestbook;
			}
		}
	};
}
