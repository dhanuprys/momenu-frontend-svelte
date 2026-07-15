import type { Guestbook, GuestbookRequest, Pagination, Project, RSVP, RSVPRequest } from '../types';
import { api } from '../utils/api';

export const InvitationService = {
	// --- Old Authenticated Methods ---
	async getInvitation(slug: string, name?: string): Promise<Project> {
		const url = name ? `/invite/${slug}?name=${encodeURIComponent(name)}` : `/invite/${slug}`;
		const response = await api.get<Project>(url);
		return response.data;
	},

	async getOGMetadata(slug: string): Promise<Project> {
		const response = await api.get<Project>(`/invite/${slug}/og`);
		return response.data;
	},

	async getGuest(slug: string, name: string) {
		const res = await api.get<RSVP>(`/invite/${slug}/guest?name=${encodeURIComponent(name)}`);
		return res.data;
	},

	async submitRSVP(slug: string, data: RSVPRequest) {
		const res = await api.post<RSVP>(`/invite/${slug}/rsvp`, data);
		return res.data;
	},

	async getGuestbook(slug: string, page: number = 1, limit: number = 10) {
		const res = await api.get<Guestbook[]>(`/invite/${slug}/guestbook?page=${page}&limit=${limit}`);
		return { data: res.data, pagination: res.meta.pagination as Pagination };
	},

	async submitGuestbook(slug: string, data: GuestbookRequest) {
		const res = await api.post<Guestbook>(`/invite/${slug}/guestbook`, data);
		return res.data;
	},

	// --- New Public Methods ---
	async getPublicInvitation(slug: string, name?: string): Promise<Project> {
		const url = name
			? `/public/invite/${slug}?name=${encodeURIComponent(name)}`
			: `/public/invite/${slug}`;
		const response = await api.get<Project>(url);
		return response.data;
	},

	async getPublicOGMetadata(slug: string): Promise<Project> {
		const response = await api.get<Project>(`/public/invite/${slug}/og`);
		return response.data;
	},

	async getPublicGuest(slug: string, name: string) {
		const res = await api.get<RSVP>(
			`/public/invite/${slug}/guest?name=${encodeURIComponent(name)}`
		);
		return res.data;
	},

	async submitPublicRSVP(slug: string, data: RSVPRequest) {
		const res = await api.post<RSVP>(`/public/invite/${slug}/rsvp`, data);
		return res.data;
	},

	async getPublicGuestbook(slug: string) {
		const res = await api.get<Guestbook[]>(`/public/invite/${slug}/guestbook`);
		return { data: res.data };
	},

	async submitPublicGuestbook(slug: string, data: GuestbookRequest) {
		const res = await api.post<Guestbook>(`/public/invite/${slug}/guestbook`, data);
		return res.data;
	}
};
