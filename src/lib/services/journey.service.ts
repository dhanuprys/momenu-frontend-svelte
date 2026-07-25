import type { Journey, JourneyRequest } from '../types';
import { api } from '../utils/api';

export const JourneyService = {
	async list(projectId: string) {
		const res = await api.get<Journey[]>(`/projects/${projectId}/journeys`);
		return res.data;
	},

	async create(projectId: string, data: JourneyRequest) {
		const res = await api.post<Journey>(`/projects/${projectId}/journeys`, data);
		return res.data;
	},

	async update(projectId: string, journeyId: number, data: JourneyRequest) {
		const res = await api.put<Journey>(`/projects/${projectId}/journeys/${journeyId}`, data);
		return res.data;
	},

	async delete(projectId: string, journeyId: number) {
		await api.delete(`/projects/${projectId}/journeys/${journeyId}`);
	}
};
