import { api } from '../utils/api';
import type { User, Project, Music, MusicCategory } from '../types';

export const AdminService = {
	// Users
	async listUsers() {
		const res = await api.get<User[]>('/admin/users');
		return res.data;
	},

	async createUser(data: { email: string; password?: string; is_admin: boolean }) {
		const res = await api.post<User>('/admin/users', data);
		return res.data;
	},

	async updateUserStatus(id: number, data: { verified: boolean; is_admin: boolean }) {
		const res = await api.put<null>(`/admin/users/${id}/status`, data);
		return res.data;
	},

	async loginAs(id: number) {
		const res = await api.post<{ token: string; refresh_token: string; user: User }>(`/admin/users/${id}/login-as`);
		return res.data;
	},

	async deleteUser(id: number) {
		const res = await api.delete<null>(`/admin/users/${id}`);
		return res.data;
	},

	// Projects
	async listProjects() {
		const res = await api.get<Project[]>('/admin/projects');
		return res.data;
	},

	async deleteProject(id: string) {
		const res = await api.delete<null>(`/admin/projects/${id}`);
		return res.data;
	},

	// Music
	async createMusicCategory(data: {
		name: string;
		slug: string;
		description: string;
		order: number;
	}) {
		const res = await api.post<MusicCategory>('/admin/music/categories', data);
		return res.data;
	},

	async updateMusicCategory(
		id: number,
		data: { name: string; slug: string; description: string; order: number }
	) {
		const res = await api.put<MusicCategory>(`/admin/music/categories/${id}`, data);
		return res.data;
	},

	async deleteMusicCategory(id: number) {
		const res = await api.delete<null>(`/admin/music/categories/${id}`);
		return res.data;
	},

	async createMusic(data: {
		category_id: number;
		title: string;
		artist: string;
		file_path: string;
		duration_seconds: number;
		cover_image: string;
		order: number;
	}) {
		const res = await api.post<Music>('/admin/music', data);
		return res.data;
	},

	async deleteMusic(id: number) {
		const res = await api.delete<null>(`/admin/music/${id}`);
		return res.data;
	},

	// Themes
	async listThemes() {
		const res = await api.get<any[]>('/admin/themes');
		return res.data;
	},

	async updateTheme(id: string, data: { price: number; thumbnail: string; description: string }) {
		const res = await api.put<any>(`/admin/themes/${id}`, data);
		return res.data;
	},

	// System Resources
	async getSystemResources() {
		const res = await api.get<any>('/admin/system/resources');
		return res.data;
	}
};
