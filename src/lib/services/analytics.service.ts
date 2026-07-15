import type { ProjectAnalytics } from '../types';
import { api } from '../utils/api';

export const AnalyticsService = {
	async recordVisit(projectId: string, guestName?: string, source?: string) {
		// This endpoint returns generic success
		await api.post('/analytics/visit', {
			project_id: projectId,
			guest_name: guestName || '',
			source: source || ''
		});
	},

	async getProjectAnalytics(projectId: string) {
		const res = await api.get<ProjectAnalytics>(`/projects/${projectId}/analytics`);
		return res.data;
	}
};
