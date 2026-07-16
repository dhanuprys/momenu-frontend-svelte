import type { EventType } from './enums';
import type {
	DressCode,
	FeatureToggle,
	GiftRegistry,
	Guestbook,
	LiveStream,
	MediaMapping,
	Music,
	Project,
	RSVP,
	Schedule,
	StyleOverride,
	TextOverride
} from './models';
import type { GuestbookRequest, RSVPRequest } from './requests';

export interface PernikahanPayload {
	nama_mempelai_pria?: string;
	nama_ayah_pria?: string;
	nama_ibu_pria?: string;
	alamat_pria?: string;
	nama_mempelai_wanita?: string;
	nama_ayah_wanita?: string;
	nama_ibu_wanita?: string;
	alamat_wanita?: string;
}

export interface UlangTahunPayload {
	nama_dirayakan?: string;
	umur?: number;
}

export interface MetatahPeserta {
	nama?: string;
	foto?: string;
}

export interface MetatahPayload {
	peserta?: MetatahPeserta[];
	nama_ayah?: string;
	nama_ibu?: string;
}

export interface TigangSasihPayload {
	nama_bayi?: string;
	nama_ayah?: string;
	nama_ibu?: string;
}

export interface SeminarPayload {
	nama_pembicara?: string;
	nama_seminar?: string;
}

export type PayloadMap = {
	pernikahan: PernikahanPayload;
	ulang_tahun: UlangTahunPayload;
	metatah: MetatahPayload;
	tigang_sasih: TigangSasihPayload;
	seminar: SeminarPayload;
};

export interface InvitationData<T extends EventType = EventType> {
	project: Project;
	slug: string;
	guestName?: string;
	guestRecord?: RSVP;
	themeId: string;
	isPreview?: boolean;
	eventType: T;
	payload: PayloadMap[T];
	music?: Music;
	schedules: Schedule[];
	giftRegistries: GiftRegistry[];
	mediaMappings: MediaMapping[];
	dressCodes: DressCode[];
	liveStreams: LiveStream[];
	featureToggle: FeatureToggle;
	textOverrides: Record<string, TextOverride>;
	styleOverrides: Record<string, StyleOverride>;
	firstScheduleDate?: Date | null;
	initialGuestbook?: {
		data: Guestbook[];
	};
	musicController?: {
		isPlaying: () => boolean;
		play: () => void;
		pause: () => void;
		toggle: () => void;
	};
	coverState: {
		isOpened: () => boolean;
		open: () => void;
	};
	customizerController?: {
		open: (slotKey: string, tab: 'text' | 'style') => void;
	};
	invitationApi: {
		getGuest: (name: string) => Promise<RSVP>;
		submitRSVP: (data: Omit<RSVPRequest, 'project_id'>) => Promise<RSVP>;
		getGuestbook: () => Promise<{ data: Guestbook[] }>;
		submitGuestbook: (data: Omit<GuestbookRequest, 'project_id'>) => Promise<Guestbook>;
	};
}
