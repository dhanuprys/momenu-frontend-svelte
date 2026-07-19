import type { BucketDefinitions } from '$lib/theme-engine/types.js';
import type { MediaMapping } from '$lib/types/models';

/**
 * Creates a typed media helper scoped to a theme's bucket definitions.
 * Provides type-safe access to media items by bucket key with autocomplete.
 *
 * @example
 * ```typescript
 * import { MANIFEST } from './manifest.js';
 * import { createMediaHelper } from '$lib/theme-engine/helpers/media.js';
 *
 * const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
 * const heroImages = media.getAll('hero_slider');      // ✅ autocomplete
 * const coverUrl   = media.getFirstUrl('hero_slider');  // ✅ autocomplete
 * media.getAll('typo_bucket');                          // ❌ compile error
 * ```
 */
export function createMediaHelper<TBuckets extends BucketDefinitions>(
	_buckets: TBuckets,
	mediaMappings: MediaMapping[],
	isPreview: boolean = false
) {
	type BucketKey = keyof TBuckets & string;

	return {
		/** Get all media items for a bucket, sorted by order ascending. */
		getAll(bucket: BucketKey): MediaMapping[] {
			return mediaMappings.filter((m) => m.bucket === bucket).sort((a, b) => a.order - b.order);
		},

		/** Get the first (lowest-order) media item for a bucket, or undefined. */
		getFirst(bucket: BucketKey): MediaMapping | undefined {
			return this.getAll(bucket)[0];
		},

		/**
		 * Get the URL of the first media item in a bucket.
		 * If no user media exists, returns the fallbackUrl ONLY if in preview mode.
		 */
		getFirstUrl(bucket: BucketKey, fallbackUrl?: string): string | undefined {
			const item = this.getFirst(bucket);
			if (item?.url) return item.url;
			return isPreview ? fallbackUrl : undefined;
		},

		/**
		 * Get all URLs for a bucket (useful for galleries).
		 * If no user media exists, returns the fallbackUrls ONLY if in preview mode.
		 */
		getUrls(bucket: BucketKey, fallbackUrls?: string[]): string[] {
			const items = this.getAll(bucket);
			if (items.length > 0) {
				return items.map((m) => m.url).filter(Boolean) as string[];
			}
			return isPreview && fallbackUrls ? fallbackUrls : [];
		},

		/** Check if a bucket has any media items. */
		has(bucket: BucketKey): boolean {
			return mediaMappings.some((m) => m.bucket === bucket);
		},

		/** Get the count of media items in a bucket. */
		count(bucket: BucketKey): number {
			return mediaMappings.filter((m) => m.bucket === bucket).length;
		}
	};
}
