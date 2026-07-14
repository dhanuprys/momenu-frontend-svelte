import { config } from '../config';
import type { User } from '../types';

class AuthStore {
	user = $state<User | null>(null);
	token = $state<string | null>(null);
	refreshToken = $state<string | null>(null);

	isInitialized = $state(false);

	get isAuthenticated() {
		return !!this.token && !!this.user;
	}

	loadFromStorage() {
		if (typeof window !== 'undefined') {
			this.token = localStorage.getItem(config.TOKEN_KEY);
			this.refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);

			const storedUser = localStorage.getItem('momenu_user');
			if (storedUser) {
				try {
					this.user = JSON.parse(storedUser);
				} catch {
					this.user = null;
				}
			}
		}
		this.isInitialized = true;
	}

	setSession(user: User, token: string, refreshToken: string) {
		this.user = user;
		this.token = token;
		this.refreshToken = refreshToken;

		if (typeof window !== 'undefined') {
			localStorage.setItem(config.TOKEN_KEY, token);
			localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
			localStorage.setItem('momenu_user', JSON.stringify(user));
		}
	}

	clearSession() {
		this.user = null;
		this.token = null;
		this.refreshToken = null;

		if (typeof window !== 'undefined') {
			localStorage.removeItem(config.TOKEN_KEY);
			localStorage.removeItem(config.REFRESH_TOKEN_KEY);
			localStorage.removeItem('momenu_user');
		}
	}
}

export const authState = new AuthStore();
