import { env } from '$env/dynamic/public';

/**
 * Application centralized configuration.
 *
 * All environment-specific variables and magic strings should be defined here.
 */
export const config = Object.freeze({
	/** Base URL for the API backend */
	API_BASE_URL: env.PUBLIC_API_BASE_URL || 'http://localhost:20261/api/v1',

	/** Root URL for the API backend (used for media/audio paths) */
	API_ROOT_URL: (env.PUBLIC_API_BASE_URL || 'http://localhost:20261/api/v1').replace('/api/v1', ''),

	/** Turnstile clietn site key */
	TURNSTILE_SITE_KEY: env.PUBLIC_TURNSTILE_SITE_KEY || '',

	/** Application name */
	APP_NAME: 'Momenu',

	/** Default pagination size */
	DEFAULT_PAGE_SIZE: 10,

	/** Local storage key for the JWT access token */
	TOKEN_KEY: 'momenu_access_token',

	/** Local storage key for the JWT refresh token */
	REFRESH_TOKEN_KEY: 'momenu_refresh_token',

	/** Local storage key for the user object */
	USER_KEY: 'momenu_user'
});
