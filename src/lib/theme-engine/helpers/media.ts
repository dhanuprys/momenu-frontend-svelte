import type { MediaMapping } from '$lib/types/models';
import type { BucketDefinitions } from '$lib/theme-engine/types.js';

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
	mediaMappings: MediaMapping[]
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

		/** Get the URL of the first media item in a bucket, or undefined. */
		getFirstUrl(bucket: BucketKey): string | undefined {
			return this.getFirst(bucket)?.url;
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
