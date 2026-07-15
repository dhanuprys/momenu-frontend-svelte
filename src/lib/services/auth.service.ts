import { api } from '../utils/api';
import { config } from '../config';
import type { LoginRequest, RegisterRequest, User } from '../types';

export const AuthService = {
	async login(data: LoginRequest) {
		const res = await api.post<{ token: string; refresh_token: string; user: User }>(
			'/auth/login',
			data
		);
		return res.data;
	},

	async register(data: RegisterRequest) {
		const res = await api.post<{ token: string; refresh_token: string; user: User }>(
			'/auth/register',
			data
		);
		return res.data;
	},

	async getMe() {
		const res = await api.get<User>('/auth/me');
		return res.data;
	},

	async updateProfile(data: { name: string }) {
		const res = await api.put<User>('/auth/me', data);
		return res.data;
	},

	getGoogleLoginURL() {
		window.location.href = `${config.API_BASE_URL}/auth/google/login`;
	}
};
