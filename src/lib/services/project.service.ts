import type {
	CreateProjectRequest,
	FeatureToggle,
	Pagination,
	Project,
	UpdateFeatureToggleRequest,
	UpdateProjectRequest,
	UpdateProjectStatusRequest
} from '../types';
import { api } from '../utils/api';

export const ProjectService = {
	async list(page: number = 1, limit: number = 10, status?: string) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString()
		});
		if (status && status !== 'all') {
			queryParams.append('status', status);
		}
		const res = await api.get<Project[]>(`/projects?${queryParams.toString()}`);
		return { data: res.data, pagination: res.meta.pagination as Pagination };
	},

	async get(projectId: string) {
		const res = await api.get<Project>(`/projects/${projectId}`);
		return res.data;
	},

	async getVersion(projectId: string) {
		const res = await api.get<{ update_count: number }>(`/projects/${projectId}/version`);
		return res.data;
	},

	async create(data: CreateProjectRequest) {
		const res = await api.post<Project>('/projects', data);
		return res.data;
	},

	async update(projectId: string, data: UpdateProjectRequest) {
		const res = await api.put<Project>(`/projects/${projectId}`, data);
		return res.data;
	},

	async delete(projectId: string) {
		await api.delete(`/projects/${projectId}`);
	},

	async updateStatus(projectId: string, data: UpdateProjectStatusRequest) {
		const res = await api.patch<Project>(`/projects/${projectId}/status`, data);
		return res.data;
	},

	async getFeatureToggle(projectId: string) {
		const res = await api.get<FeatureToggle>(`/projects/${projectId}/feature-toggle`);
		return res.data;
	},

	async updateFeatureToggle(projectId: string, data: UpdateFeatureToggleRequest) {
		const res = await api.put<FeatureToggle>(`/projects/${projectId}/feature-toggle`, data);
		return res.data;
	}
};
