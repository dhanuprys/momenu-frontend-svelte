import { api, apiClient } from '../utils/api';
import type { RSVP, RSVPStats, Pagination, OwnerRSVPRequest } from '../types';

export const RSVPService = {
	async list(projectId: string, page: number = 1, limit: number = 10) {
		const res = await api.get<RSVP[]>(`/projects/${projectId}/rsvps?page=${page}&limit=${limit}`);
		return { data: res.data, pagination: res.meta.pagination as Pagination };
	},

	async getStats(projectId: string) {
		const res = await api.get<RSVPStats>(`/projects/${projectId}/rsvps/stats`);
		return res.data;
	},

	async delete(projectId: string, id: number) {
		await api.delete(`/projects/${projectId}/rsvps/${id}`);
	},

	async upsertGuest(projectId: string, data: OwnerRSVPRequest) {
		const res = await api.post<RSVP>(`/projects/${projectId}/rsvps`, data);
		return res.data;
	},

	async exportToExcel(projectId: string): Promise<Blob> {
		const res = await apiClient.get(`/projects/${projectId}/rsvps/export`, {
			responseType: 'blob'
		});
		return res.data;
	},

	async importFromExcel(projectId: string, file: File) {
		const formData = new FormData();
		formData.append('file', file);

		const res = await apiClient.post(`/projects/${projectId}/rsvps/bulk`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		return res.data;
	}
};
