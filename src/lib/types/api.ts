export interface Pagination {
	total: number;
	per_page: number;
	current_page: number;
	total_pages: number;
}

export interface ApiMeta {
	request_id: string;
	timestamp: string;
	pagination?: Pagination;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface ApiSuccessResponse<T> {
	success: true;
	message: string;
	data: T;
	meta: ApiMeta;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	code?: string;
	errors?: ValidationError[];
	meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
