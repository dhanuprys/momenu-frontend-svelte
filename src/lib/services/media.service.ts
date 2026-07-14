import { api } from '../utils/api';
import type { MediaMappingRequest, MediaMapping } from '../types';

export const MediaService = {
	async list(projectId: string) {
		const res = await api.get<MediaMapping[]>(`/projects/${projectId}/media`);
		return res.data;
	},

	async create(projectId: string, data: MediaMappingRequest) {
		const res = await api.post<MediaMapping>(`/projects/${projectId}/media`, { ...data });
		return res.data;
	},

	async update(projectId: string, mediaId: number, data: MediaMappingRequest) {
		const res = await api.put<MediaMapping>(`/projects/${projectId}/media/${mediaId}`, { ...data });
		return res.data;
	},

	async delete(projectId: string, mediaId: number) {
		await api.delete(`/projects/${projectId}/media/${mediaId}`);
	}
};
