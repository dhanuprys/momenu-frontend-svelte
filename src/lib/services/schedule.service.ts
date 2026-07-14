import { api } from '../utils/api';
import type { ScheduleRequest, Schedule } from '../types';

export const ScheduleService = {
	async list(projectId: string) {
		const res = await api.get<Schedule[]>(`/projects/${projectId}/schedules`);
		return res.data;
	},

	async create(projectId: string, data: ScheduleRequest) {
		const res = await api.post<Schedule>(`/projects/${projectId}/schedules`, data);
		return res.data;
	},

	async update(projectId: string, scheduleId: number, data: ScheduleRequest) {
		const res = await api.put<Schedule>(`/projects/${projectId}/schedules/${scheduleId}`, data);
		return res.data;
	},

	async delete(projectId: string, scheduleId: number) {
		await api.delete(`/projects/${projectId}/schedules/${scheduleId}`);
	}
};
