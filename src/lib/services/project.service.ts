import { api } from '../utils/api';
import type {
	CreateProjectRequest,
	UpdateProjectRequest,
	Project,
	UpdateProjectStatusRequest,
	FeatureToggle,
	UpdateFeatureToggleRequest,
	Pagination
} from '../types';

export const ProjectService = {
	async list(page: number = 1, limit: number = 10) {
		const res = await api.get<Project[]>(`/projects?page=${page}&limit=${limit}`);
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
