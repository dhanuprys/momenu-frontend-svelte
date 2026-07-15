import type { Project, RSVP } from '$lib/types/index.js';
import { api } from '../utils/api';

export interface ShareSession {
	id: string;
	project_id: string;
	name: string;
	session_id: string;
	expires_at: string | null;
	is_revoked: boolean;
	last_accessed_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface SharedDataResponse {
	project: Project;
	analytics: {
		total_rsvps: number;
		rsvps: RSVP[];
		session: ShareSession;
		rsvp_stats: {
			attending: number;
			not_attending: number;
			pending: number;
			total_pax: number;
		};
		total_visits: number;
		unique_guests: number;
		daily_visits: { date: string; count: number }[];
		source_stats: { source: string; count: number }[];
		device_stats: { device_type: string; count: number }[];
		recent_visits: {
			id: number;
			guest_name: string;
			source: string;
			device_type: string;
			created_at: string;
		}[];
	};
}

export const ShareService = {
	async createSession(projectId: string, name: string, expiresAt: string | null = null) {
		const res = await api.post<ShareSession>(`/projects/${projectId}/share`, {
			name,
			expires_at: expiresAt
		});
		return res.data;
	},

	async listSessions(projectId: string) {
		const res = await api.get<ShareSession[]>(`/projects/${projectId}/share`);
		return res.data;
	},

	async revokeSession(projectId: string, sessionId: string) {
		const res = await api.delete<null>(`/projects/${projectId}/share/${sessionId}`);
		return res.data;
	},

	async getSharedData(sessionId: string) {
		const res = await api.get<SharedDataResponse>(`/public/share/${sessionId}`);
		return res.data;
	}
};
