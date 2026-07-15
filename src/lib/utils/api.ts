import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { config } from '../config';
import type { ApiSuccessResponse } from '../types';
import { ApiError } from './api-error';

export const apiClient: AxiosInstance = axios.create({
	baseURL: config.API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
	(reqConfig) => {
		// Only attach token if running in the browser
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem(config.TOKEN_KEY);
			if (token) {
				reqConfig.headers.Authorization = `Bearer ${token}`;
			}
		}
		return reqConfig;
	},
	(error) => Promise.reject(ApiError.fromAxiosError(error))
);

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Response interceptor for global error handling and auto-token refresh
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// Auto refresh token on 401
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return apiClient(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}

				// Call refresh endpoint directly using axios to avoid infinite loops
				const rs = await axios.post(`${config.API_BASE_URL}/auth/refresh`, {
					refresh_token: refreshToken
				});

				const { token, refresh_token: newRefreshToken } = rs.data.data;
				localStorage.setItem(config.TOKEN_KEY, token);
				localStorage.setItem(config.REFRESH_TOKEN_KEY, newRefreshToken);

				apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
				originalRequest.headers.Authorization = `Bearer ${token}`;

				processQueue(null, token);

				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error, null);

				// Clear tokens and redirect to login on refresh failure
				if (typeof window !== 'undefined') {
					localStorage.removeItem(config.TOKEN_KEY);
					localStorage.removeItem(config.REFRESH_TOKEN_KEY);
					window.location.href = '/login';
				}

				return Promise.reject(ApiError.fromAxiosError(refreshError));
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(ApiError.fromAxiosError(error));
	}
);

// Wrapper helper functions for type safety
export const api = {
	async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
		const response = await apiClient.get<ApiSuccessResponse<T>>(url, config);
		return response.data;
	},
	async post<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<ApiSuccessResponse<T>> {
		const response = await apiClient.post<ApiSuccessResponse<T>>(url, data, config);
		return response.data;
	},
	async put<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<ApiSuccessResponse<T>> {
		const response = await apiClient.put<ApiSuccessResponse<T>>(url, data, config);
		return response.data;
	},
	async patch<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<ApiSuccessResponse<T>> {
		const response = await apiClient.patch<ApiSuccessResponse<T>>(url, data, config);
		return response.data;
	},
	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
		const response = await apiClient.delete<ApiSuccessResponse<T>>(url, config);
		return response.data;
	}
};
