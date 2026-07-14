# Theme Development Guide

This guide explains how to create invitation themes for Momenu, from frontend Svelte component to backend seeder integration. Follow these steps to ensure your theme works seamlessly when deployed.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Step-by-Step: Creating a New Theme](#step-by-step-creating-a-new-theme)
  - [Step 1: Define the Theme in the Backend Seeder](#step-1-define-the-theme-in-the-backend-seeder)
  - [Step 2: Create the Frontend Theme Directory](#step-2-create-the-frontend-theme-directory)
  - [Step 3: Create the Theme Manifest](#step-3-create-the-theme-manifest)
  - [Step 4: Build the Theme Component](#step-4-build-the-theme-component)
  - [Step 5: Register the Theme](#step-5-register-the-theme)
- [Available Data in a Theme](#available-data-in-a-theme)
  - [Context Getters by Event Type](#context-getters-by-event-type)
  - [InvitationData Fields](#invitationdata-fields)
  - [Payload Types by Event Type](#payload-types-by-event-type)
  - [Complex Field Types (Group & Image)](#complex-field-types-group--image)
  - [Feature Toggles](#feature-toggles)
  - [Interactive APIs (RSVP & Guestbook)](#interactive-apis-rsvp--guestbook)
- [Media Helper API](#media-helper-api)
- [Utilities](#utilities)
- [Backend–Frontend Sync Checklist](#backendfrontend-sync-checklist)
- [Complete Example: Pernikahan Theme](#complete-example-pernikahan-theme)
- [All Registered Themes](#all-registered-themes)

---

## Architecture Overview

The theme system follows a **two-repository pattern** where the backend and frontend each hold part of a theme's definition:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Backend (momenu-backend-fiber)                                      │
│                                                                     │
│   internal/seeder/theme_data.go                                     │
│   ├─ Theme ID, name, event type, price                              │
│   ├─ MediaBuckets: [ { key, label, media_type, max_files } ]        │
│   └─ The backend validates uploads against these bucket rules       │
│                                                                     │
│   internal/models/models.go                                         │
│   ├─ EventTypeFieldSchemas: payload form fields per event type      │
│   └─ MediaBucket struct definition                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ API response (Project with media_mappings)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Frontend (momenu-frontend-svelte)                                   │
│                                                                     │
│   src/lib/components/themes/{eventType}/{theme_name}/               │
│   ├─ manifest.ts   ← mirrors backend's MediaBuckets exactly         │
│   └─ Theme.svelte  ← the visual component                           │
│                                                                     │
│   src/lib/themes/theme-registry.ts                                  │
│   └─ maps theme ID → { manifest, lazy-load component }              │
│                                                                     │
│   src/lib/utils/theme-media.ts                                      │
│   └─ createMediaHelper() for type-safe media access                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Key principle:** The backend's `MediaBucket` definitions are the **single source of truth** for what media slots a theme supports. The frontend `manifest.ts` is a typed mirror of those definitions, giving developers autocomplete and compile-time safety.

---

## Directory Structure

```
src/lib/
├── components/
│   └── themes/                        # All theme components live here
│       ├── pernikahan/                # Grouped by event type
│       │   └── pernikahan_elegance_1/ # Each theme gets its own directory
│       │       ├── manifest.ts        # Media bucket definitions (mirrors backend)
│       │       └── Theme.svelte       # The visual component
│       ├── ulang_tahun/
│       ├── metatah/
│       ├── tigang_sasih/
│       └── seminar/
├── themes/
│   └── theme-registry.ts             # Central registry mapping IDs → components
├── contexts/
│   └── invitation-context.ts         # Svelte context for passing data to themes
├── types/
│   ├── invitation.ts                 # InvitationData, payload types
│   ├── theme-manifest.ts             # ThemeManifest, BucketConfig types
│   ├── models.ts                     # MediaMapping, Schedule, etc.
│   └── enums.ts                      # EventType, MediaType, etc.
└── utils/
    ├── theme-media.ts                # createMediaHelper() utility
    └── utils.ts                      # getMediaUrl() and other helpers
```

---

## Theme Naming Conventions & Best Practices

To maintain a scalable and organized ecosystem, follow these rules when creating a new theme.

### Theme ID Rules

The Theme ID is the most critical identifier. It links the backend seeder to the frontend component. It MUST follow this exact format:

**Format:** `{event_type}_{adjective}_{version}`

1. **`{event_type}`**: MUST strictly match one of the backend's `models.EventType` strings (`pernikahan`, `ulang_tahun`, `metatah`, `tigang_sasih`, `seminar`).
2. **`{adjective}`**: Describes the visual style, vibe, or primary subject (e.g., `elegance`, `festive`, `sakral`, `pastel`).
3. **`{version}`**: A numeric suffix starting at `1`. This allows future iterations (e.g., `pernikahan_elegance_2`) without breaking existing user projects that rely on the original layout.

**Examples:**

- ✅ `pernikahan_elegance_1`
- ✅ `ulang_tahun_festive_1`
- ❌ `floralWedding` (use snake_case)
- ❌ `cool_theme_1` (missing event type)

### Frontend Best Practices

1. **Mobile-First Design**: Guests almost always open invitations on their phones. Design the mobile view first, then use Tailwind's responsive prefixes (`md:`, `lg:`) to adapt the layout for larger screens.
2. **Native Animations**: Use Svelte's built-in transition directives (`in:fade`, `in:fly`, `svelte/transition`) instead of importing heavy CSS or JS animation libraries. They are highly performant and keep bundle sizes minimal.
3. **Respect Feature Toggles**: Always check `featureToggle` flags (e.g., `featureToggle.show_gallery`) before rendering optional sections. Never assume a section should be visible.
4. **Handle Empty States**: Data arrays (`schedules`, `galleryImages`, `giftRegistries`) can be empty even if the feature toggle is on. Check `.length > 0` before rendering the section container to avoid awkward empty whitespace.
5. **Dynamic List Layouts**: Users may input only ONE item for lists like `schedules`, `dressCodes`, or `giftRegistries`. Your grid layouts should dynamically adjust based on the array length so single items don't look awkwardly left-aligned in a multi-column grid (e.g., use `class="grid {schedules.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'md:grid-cols-2'}"`).
6. **Lazy Loading**: Add `loading="lazy"` to `<img>` tags that are below the fold (like inside the gallery grid) to improve initial page load speed.

---

## Step-by-Step: Creating a New Theme

### Step 1: Define the Theme in the Backend Seeder

Open `momenu-backend-fiber/internal/seeder/theme_data.go` and add a new entry to `ThemesData`:

```go
{
    ID:          "pernikahan_tropical_1",      // Unique ID — used as the key everywhere
    Name:        "Tropical Paradise",
    EventType:   models.EventTypePernikahan,   // Must match one of the defined EventTypes
    Description: "Tema tropikal dengan sentuhan warna senja.",
    Thumbnail:   "/uploads/themes/tropical-thumb.jpg",
    Price:       pricePtr(39000),              // Use nil for free themes
    MediaBuckets: mustJSON([]models.MediaBucket{
        {Key: "hero_photo",     Label: "Foto Sampul Utama",  MediaType: models.MediaTypeImage, MaxFiles: 1},
        {Key: "gallery_grid",   Label: "Galeri Foto",        MediaType: models.MediaTypeImage, MaxFiles: 15},
        {Key: "promo_video",    Label: "Video Teaser",       MediaType: models.MediaTypeVideo, MaxFiles: 1},
    }),
},
```

**Important rules for `MediaBuckets`:**

- `Key` is a snake_case identifier — this is the bucket name used in `MediaMapping.bucket`
- `MediaType` must be either `models.MediaTypeImage` or `models.MediaTypeVideo`
- `MaxFiles` defines the maximum number of files the user can upload to this bucket
- The backend **validates** uploads against these rules (see `media_service.go`)

After adding, re-run the seeder so the database gets the new theme.

---

### Step 2: Create the Frontend Theme Directory

Create the directory for your theme under the appropriate event type:

```
src/lib/components/themes/pernikahan/pernikahan_tropical_1/
```

The naming convention is:

```
src/lib/components/themes/{event_type}/{theme_id}/
```

---

### Step 3: Create the Theme Manifest

Create `manifest.ts` in your theme directory. This file **must exactly mirror** the `MediaBuckets` you defined in the backend seeder:

```typescript
// src/lib/components/themes/pernikahan/pernikahan_tropical_1/manifest.ts
import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'pernikahan_tropical_1', // Must match backend's Theme.ID
	eventType: 'pernikahan', // Must match backend's Theme.EventType
	name: 'Tropical Paradise',
	buckets: {
		// Keys and values must EXACTLY match the backend seeder's MediaBuckets
		hero_photo: { label: 'Foto Sampul Utama', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Foto', mediaType: 'image', maxFiles: 15 },
		promo_video: { label: 'Video Teaser', mediaType: 'video', maxFiles: 1 }
	}
} as const satisfies ThemeManifest;
```

> **Why `as const satisfies ThemeManifest`?**
>
> - `as const` makes TypeScript infer the exact literal types for bucket keys (`'hero_photo' | 'gallery_grid' | 'promo_video'`), enabling autocomplete and compile-time checking.
> - `satisfies ThemeManifest` ensures the object structurally matches the expected interface without widening the types.

---

### Step 4: Build the Theme Component

Create `Theme.svelte` — this is the visual heart of your theme:

```svelte
<!-- src/lib/components/themes/pernikahan/pernikahan_tropical_1/Theme.svelte -->
<script lang="ts">
	import { getPernikahanContext } from '$lib/contexts/invitation-context.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { MANIFEST } from './manifest.js';

	// 1. Get the strongly-typed invitation data
	const { payload, featureToggle, schedules, giftRegistries, mediaMappings } =
		getPernikahanContext();

	// 2. Create the typed media helper
	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);

	// 3. Extract media — bucket keys autocomplete and are type-checked!
	const heroPhoto = media.getFirstUrl('hero_photo'); // string | undefined
	const galleryImages = media.getAll('gallery_grid'); // MediaMapping[]
	const promoVideo = media.getFirstUrl('promo_video'); // string | undefined

	// ❌ This would cause a TypeScript compile error:
	// media.getAll('nonexistent_bucket');
</script>

<div>
	<!-- Use getMediaUrl() to resolve relative URLs to full URLs -->
	{#if heroPhoto}
		<img src={getMediaUrl(heroPhoto)} alt="Hero" />
	{/if}

	<h1>{payload.groom_name} & {payload.bride_name}</h1>

	<!-- Always respect feature toggles -->
	{#if featureToggle.show_gallery && galleryImages.length > 0}
		{#each galleryImages as image}
			<img src={getMediaUrl(image.url)} alt="Gallery" />
		{/each}
	{/if}

	{#each schedules as schedule}
		<p>{schedule.title} — {schedule.location}</p>
	{/each}
</div>
```

---

### Step 5: Register the Theme

Open `src/lib/themes/theme-registry.ts` and add your theme:

```typescript
import { MANIFEST as PERNIKAHAN_TROPICAL_1 } from '$lib/components/themes/pernikahan/pernikahan_tropical_1/manifest.js';

const registry: Record<string, RegistryEntry> = {
	// ... existing themes ...

	pernikahan_tropical_1: {
		manifest: PERNIKAHAN_TROPICAL_1,
		load: () => import('$lib/components/themes/pernikahan/pernikahan_tropical_1/Theme.svelte')
	}
};
```

> **Why dynamic import?** The `load` function uses a dynamic `import()` so themes are **lazy-loaded** — only the theme the user is viewing gets downloaded, keeping bundle sizes small.

**That's it!** Your theme is now fully integrated. When a user creates a project with `theme_id: 'pernikahan_tropical_1'`, the backend will validate media uploads against your bucket rules, and the frontend will render your component with type-safe media access.

---

## Available Data in a Theme

### Context Getters by Event Type

Each event type has a dedicated context getter that returns `InvitationData` with a **strongly-typed payload**:

| Event Type     | Context Getter            | Payload Type         |
| -------------- | ------------------------- | -------------------- |
| `pernikahan`   | `getPernikahanContext()`  | `PernikahanPayload`  |
| `ulang_tahun`  | `getUlangTahunContext()`  | `UlangTahunPayload`  |
| `metatah`      | `getMetatahContext()`     | `MetatahPayload`     |
| `tigang_sasih` | `getTigangSasihContext()` | `TigangSasihPayload` |
| `seminar`      | `getSeminarContext()`     | `SeminarPayload`     |

All getters are imported from `$lib/contexts/invitation-context.js`.

### InvitationData Fields

Every theme receives these fields through the context:

| Field            | Type             | Description                                     |
| ---------------- | ---------------- | ----------------------------------------------- |
| `project`        | `Project`        | Full project object (title, slug, status, etc.) |
| `slug`           | `string`         | The project's URL slug                          |
| `themeId`        | `string`         | The theme ID (e.g., `pernikahan_elegance_1`)    |
| `eventType`      | `EventType`      | `'pernikahan'`, `'ulang_tahun'`, etc.           |
| `payload`        | `PayloadMap[T]`  | Strongly-typed event data (see below)           |
| `schedules`      | `Schedule[]`     | Event schedules with title, time, location      |
| `giftRegistries` | `GiftRegistry[]` | Bank/ewallet/physical gift options              |
| `mediaMappings`  | `MediaMapping[]` | All uploaded media (use `createMediaHelper`)    |
| `dressCodes`     | `DressCode[]`    | Dress code labels with color swatches           |
| `liveStreams`    | `LiveStream[]`   | Live stream links (YouTube, Zoom, etc.)         |
| `featureToggle`  | `FeatureToggle`  | Boolean flags for toggling sections             |
| `api`            | `InvitationApi`  | Submit RSVP and Guestbook forms directly        |

### Payload Types by Event Type

```typescript
// Pernikahan
interface PernikahanPayload {
	groom_name: string | null;
	bride_name: string | null;
	groom_father: string | null;
	groom_mother: string | null;
	bride_father: string | null;
	bride_mother: string | null;
	groom_address: string | null;
	bride_address: string | null;
}

// Ulang Tahun
interface UlangTahunPayload {
	celebrant_name: string | null;
	current_age: number | null;
}

// Metatah (Uses Group Type)
interface MetatahPayload {
	peserta: Array<{
		name: string | null;
		father_name: string | null;
		mother_name: string | null;
		photo: string | null;
	}> | null;
}

// Tigang Sasih
interface TigangSasihPayload {
	baby_name: string | null;
	father_name: string | null;
	mother_name: string | null;
}

// Seminar
interface SeminarPayload {
	speaker_name: string | null;
	seminar_topic: string | null;
}
```

### Complex Field Types (Group & Image)

The backend schema supports dynamic field types, including `group` (arrays of objects) and `image` (direct URL fields in the payload, separate from media buckets).

- **Group Fields**: Payload arrays like `peserta` in Metatah are generated dynamically. The builder allows users to add/remove entries up to `max_items`.
- **Image Fields**: When a payload sub-field is type `image`, the user uploads directly inside the Details form, and the field receives the final uploaded URL path (e.g., `/uploads/image.jpg`). Use `getMediaUrl(path)` to render it in the theme.

### Feature Toggles

Always check feature toggles before rendering optional sections:

| Toggle             | Controls                   |
| ------------------ | -------------------------- |
| `show_rsvp`        | RSVP form section          |
| `show_wishes`      | Guestbook / wishes section |
| `show_gallery`     | Gallery section            |
| `show_gifts`       | Gift registry section      |
| `show_live_stream` | Live streaming section     |
| `show_music`       | Global music auto-play     |

```svelte
{#if featureToggle.show_gallery && galleryImages.length > 0}
	<!-- Gallery section -->
{/if}
```

### Interactive APIs (RSVP & Guestbook)

The `invitationData` context includes a powerful `api` object. This object provides strongly-typed methods to interact with the backend (like submitting RSVPs or Guestbook entries) without needing to manually pass the `slug` around.

Because of this, **themes do not use shared UI components for forms**. Instead, you have complete creative freedom to build your own custom forms, inputs, and loading states that match your theme perfectly, and then call the API underneath.

```typescript
const { api } = getPernikahanContext();

async function handleRSVP(e: Event) {
	e.preventDefault();

	try {
		await api.submitRSVP({
			name: 'John Doe',
			attending: true,
			guest_count: 2
		});
		// show success state
	} catch (err) {
		// show error state
	}
}
```

Available API methods:

- `api.submitRSVP(data: Omit<RSVPRequest, 'project_id'>) => Promise<RSVP>`
- `api.getGuestbook(page?: number, limit?: number) => Promise<{ data: Guestbook[], pagination: Pagination }>`
- `api.submitGuestbook(data: Omit<GuestbookRequest, 'project_id'>) => Promise<Guestbook>`

---

## Media Helper API

`createMediaHelper()` is the recommended way to access media buckets in a theme. Import it from `$lib/utils/theme-media.js`. Note: For inline payload `image` fields, you don't need this tool—just use `getMediaUrl(payload.photo)`.

```typescript
const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
```

| Method                      | Return Type                 | Description                            |
| --------------------------- | --------------------------- | -------------------------------------- |
| `media.getAll(bucket)`      | `MediaMapping[]`            | All items in bucket, sorted by order   |
| `media.getFirst(bucket)`    | `MediaMapping \| undefined` | First (lowest order) item              |
| `media.getFirstUrl(bucket)` | `string \| undefined`       | URL of the first item                  |
| `media.has(bucket)`         | `boolean`                   | Whether any media exists in the bucket |
| `media.count(bucket)`       | `number`                    | Number of items in the bucket          |

All methods enforce **compile-time bucket key validation** — passing a key that isn't in the manifest causes a TypeScript error.

---

## Utilities

### `getMediaUrl(url)`

Resolves a media URL to an absolute URL. Media stored locally on the backend is returned as a relative path (e.g., `/uploads/media/image/abc.jpg`). This function prepends the API base URL.

```typescript
import { getMediaUrl } from '$lib/utils.js';

// Always wrap URLs with getMediaUrl() for consistent resolution:
<img src={getMediaUrl(image.url)} alt="Photo" />
```

---

## Backend–Frontend Sync Checklist

When creating or modifying a theme, use this checklist to ensure both sides are in sync:

- [ ] **Theme ID** — `MANIFEST.id` matches `ThemesData[].ID` in the backend seeder
- [ ] **Event Type** — `MANIFEST.eventType` matches `ThemesData[].EventType`
- [ ] **Bucket Keys** — every bucket key in `MANIFEST.buckets` has a matching `MediaBucket.Key` in the backend
- [ ] **Bucket Media Types** — `mediaType` values (`'image'` / `'video'`) match the backend's `MediaType`
- [ ] **Bucket Max Files** — `maxFiles` values match the backend's `MaxFiles`
- [ ] **Context Getter** — theme uses the correct context getter for its event type (e.g., `getPernikahanContext()`)
- [ ] **Theme Registry** — theme is registered in `src/lib/themes/theme-registry.ts`
- [ ] **Backend Seeder Re-run** — the seeder has been re-run after adding/modifying the backend theme entry

---

## Complete Example: Pernikahan Theme

Here is a reference implementation for the `pernikahan_elegance_1` theme.

**Backend seeder** (`momenu-backend-fiber/internal/seeder/theme_data.go`):

```go
{
    ID:          "pernikahan_elegance_1",
    Name:        "Elegance Gold",
    EventType:   models.EventTypePernikahan,
    Description: "Tema pernikahan mewah bernuansa emas dan monokrom.",
    Thumbnail:   "/uploads/themes/elegance.jpg",
    Price:       pricePtr(99000),
    MediaBuckets: mustJSON([]models.MediaBucket{
        {Key: "hero_photo",     Label: "Foto Sampul Utama",  MediaType: models.MediaTypeImage, MaxFiles: 1},
        {Key: "gallery_grid",   Label: "Galeri Pre-Wedding", MediaType: models.MediaTypeImage, MaxFiles: 20},
    }),
},
```

**Frontend manifest** (`src/lib/components/themes/pernikahan/pernikahan_elegance_1/manifest.ts`):

```typescript
import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'pernikahan_elegance_1',
	eventType: 'pernikahan',
	name: 'Elegance Gold',
	buckets: {
		hero_photo: { label: 'Foto Sampul Utama', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Pre-Wedding', mediaType: 'image', maxFiles: 20 }
	}
} as const satisfies ThemeManifest;
```

**Frontend component** (`src/lib/components/themes/pernikahan/pernikahan_elegance_1/Theme.svelte`):

```svelte
<script lang="ts">
	import { getPernikahanContext } from '$lib/contexts/invitation-context.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { MANIFEST } from './manifest.js';

	const { payload, featureToggle, schedules, giftRegistries, mediaMappings } =
		getPernikahanContext();

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);

	const heroPhoto = media.getFirstUrl('hero_photo');
	const galleryImages = media.getAll('gallery_grid');
</script>

<div>
	<!-- Cover -->
	{#if heroPhoto}
		<img src={getMediaUrl(heroPhoto)} alt="Cover" />
	{/if}

	<!-- Payload Info -->
	<h1>{payload.groom_name} & {payload.bride_name}</h1>
	<p>Anak dari {payload.groom_father} dan {payload.bride_mother}</p>

	<!-- Gallery -->
	{#if featureToggle.show_gallery && galleryImages.length > 0}
		{#each galleryImages as image}
			<img src={getMediaUrl(image.url)} alt="Gallery" />
		{/each}
	{/if}
</div>
```

**Registry entry** (`src/lib/themes/theme-registry.ts`):

```typescript
import { MANIFEST as PERNIKAHAN_ELEGANCE_1 } from '$lib/components/themes/pernikahan/pernikahan_elegance_1/manifest.js';

pernikahan_elegance_1: {
  manifest: PERNIKAHAN_ELEGANCE_1,
  load: () => import('$lib/components/themes/pernikahan/pernikahan_elegance_1/Theme.svelte')
}
```
