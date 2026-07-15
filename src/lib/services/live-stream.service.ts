import type { LiveStream, LiveStreamRequest } from '../types';
import { api } from '../utils/api';

export const LiveStreamService = {
	async list(projectId: string) {
		const res = await api.get<LiveStream[]>(`/projects/${projectId}/live-streams`);
		return res.data;
	},

	async create(projectId: string, data: LiveStreamRequest) {
		const res = await api.post<LiveStream>(`/projects/${projectId}/live-streams`, data);
		return res.data;
	},

	async update(projectId: string, streamId: number, data: LiveStreamRequest) {
		const res = await api.put<LiveStream>(`/projects/${projectId}/live-streams/${streamId}`, data);
		return res.data;
	},

	async delete(projectId: string, streamId: number) {
		await api.delete(`/projects/${projectId}/live-streams/${streamId}`);
	}
};
