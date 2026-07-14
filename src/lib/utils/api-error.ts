import type { ValidationError, ApiErrorResponse } from '../types';
import axios from 'axios';

const ErrorTranslations: Record<string, string> = {
	INVALID_PAYLOAD: 'Data yang dikirimkan tidak valid',
	REGISTRATION_FAILED: 'Pendaftaran gagal',
	UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan masuk kembali',
	INVALID_STATE: 'Sesi login tidak valid',
	MISSING_CODE: 'Kode otentikasi tidak ditemukan',
	GOOGLE_LOGIN_FAILED: 'Gagal masuk menggunakan Google',
	BAD_REQUEST: 'Permintaan tidak valid',
	INTERNAL_SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti',
	NOT_FOUND: 'Data tidak ditemukan',
	PROJECT_NOT_FOUND: 'Acara tidak ditemukan',
	FORBIDDEN: 'Anda tidak memiliki akses ke halaman ini',
	VERIFICATION_REQUIRED: 'Harap verifikasi akun Anda terlebih dahulu',
	INVALID_STATUS: 'Status tidak valid',
	INVALID_ID: 'ID tidak valid',
	FEATURE_DISABLED: 'Fitur ini dinonaktifkan',
	VALIDATION_ERROR: 'Harap periksa kembali isian formulir Anda'
};

export class ApiError extends Error {
	public statusCode: number;
	public code?: string;
	public validationErrors: ValidationError[];
	public isNetworkError: boolean;

	constructor(
		message: string,
		statusCode: number,
		code?: string,
		validationErrors: ValidationError[] = [],
		isNetworkError: boolean = false
	) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.code = code;
		this.validationErrors = validationErrors;
		this.isNetworkError = isNetworkError;

		// Try to translate the code to Bahasa Indonesia if available
		if (code && ErrorTranslations[code]) {
			this.message = ErrorTranslations[code];
		}
	}

	hasFieldErrors(): boolean {
		return this.validationErrors.length > 0;
	}

	getFieldError(field: string): string | undefined {
		const err = this.validationErrors.find((e) => e.field === field);
		return err?.message;
	}

	static fromAxiosError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			// Network or connection error (no response)
			if (!error.response) {
				return new ApiError(
					'Gagal terhubung ke server. Periksa koneksi internet Anda.',
					0,
					'NETWORK_ERROR',
					[],
					true
				);
			}

			const data = error.response.data as ApiErrorResponse;

			// Backend returned a proper JSON error envelope
			if (data && data.success === false) {
				return new ApiError(
					data.message || 'Terjadi kesalahan',
					error.response.status,
					data.code,
					data.errors || [],
					false
				);
			}

			// Unknown status error (e.g. 500 HTML)
			return new ApiError(
				'Terjadi kesalahan tak terduga',
				error.response.status,
				'UNKNOWN_ERROR',
				[],
				false
			);
		}

		// Generic JS Error
		return new ApiError(
			error instanceof Error ? error.message : 'Terjadi kesalahan pada aplikasi',
			500,
			'UNKNOWN_ERROR',
			[],
			false
		);
	}
}
