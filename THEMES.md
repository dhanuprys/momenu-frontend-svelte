# Theme Development Guide

This guide explains how to create invitation themes for Momenu using the new **Theme Engine** architecture. Follow these steps to ensure your theme works seamlessly with the backend, frontend registry, and the Customizer UI.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure & Naming Conventions](#directory-structure--naming-conventions)
- [Step-by-Step: Creating a New Theme](#step-by-step-creating-a-new-theme)
  - [Step 1: Backend Seeder](#step-1-backend-seeder)
  - [Step 2: Frontend Directory](#step-2-frontend-directory)
  - [Step 3: Theme Manifest](#step-3-theme-manifest)
  - [Step 4: Build the Theme Component](#step-4-build-the-theme-component)
  - [Step 5: Register the Theme](#step-5-register-the-theme)
- [Available Data (`InvitationData`)](#available-data-invitationdata)
- [Helper APIs](#helper-apis)
  - [Media Helper](#media-helper)
  - [Text Helper](#text-helper)
  - [Style Helper](#style-helper)
  - [Countdown Helper](#countdown-helper)
- [Shared UI Components](#shared-ui-components)

---

## Architecture Overview

The theme system follows a **Two-Repository Pattern**:

1. **Backend (Source of Truth for Schema)**: The `ThemeData` seeder defines the basic theme profile (ID, event type, pricing) and its **MediaBuckets** (rules for what images/videos can be uploaded).
2. **Frontend (The Visual Engine & Customizer Rules)**: The Svelte frontend defines a `ThemeManifest` that mirrors the backend media buckets but also introduces **Text Slots** and **Style Slots** for the Customizer UI.

When a user edits a theme, the `customizerController` writes overrides for these slots into the backend, which are then provided back to the theme via `textOverrides` and `styleOverrides`.

---

## Directory Structure & Naming Conventions

### Theme ID Rules

The Theme ID MUST follow this format: `{event_type}_{adjective}_{version}`

- **Examples**: `pernikahan_bali_simple_1`, `ulang_tahun_festive_1`

### File Structure

```text
src/lib/theme-engine/
├── components/          # Global theme-engine UI (Renderer, Provider, SectionEditButton)
├── helpers/             # Helpers for Text, Style, Media, and Countdown
├── themes/              # All your custom themes live here
│   └── {eventType}/
│       └── {themeId}/
│           ├── manifest.ts     # The Theme Manifest
│           └── Theme.svelte    # The visual component
└── registry.ts          # Central lazy-loading registry
```

---

## Step-by-Step: Creating a New Theme

### Step 1: Backend Seeder

Open `momenu-backend-fiber/internal/seeder/theme_data.go` and add your theme. The backend is only concerned with basic metadata and file upload validation (Media Buckets).

```go
{
    ID:          "pernikahan_contoh_1",
    Name:        "Contoh Tema",
    EventType:   models.EventTypePernikahan,
    Description: "Contoh tema dokumentasi",
    Price:       nil,
    MediaBuckets: mustJSON([]models.MediaBucket{
        {Key: "hero_photo", Label: "Foto Sampul Utama", MediaType: models.MediaTypeImage, MaxFiles: 1},
    }),
}
```

### Step 2: Frontend Directory

Create `src/lib/theme-engine/themes/pernikahan/pernikahan_contoh_1/`.

### Step 3: Theme Manifest

Create `manifest.ts`. This file defines your Media Buckets, Text Slots, Style Slots, and Demo Data using strictly-typed generics. Use `as const satisfies ThemeManifest` to enable powerful intellisense.

```typescript
import type { ThemeManifest } from '$lib/theme-engine/types';

export const BUCKET = { hero_photo: 'hero_photo' } as const;
export const TEXT = { hero_title: 'hero_title' } as const;
export const STYLE = { hero_bg: 'hero_bg' } as const;

export const MANIFEST = {
	id: 'pernikahan_contoh_1',
	eventType: 'pernikahan',
	name: 'Contoh Tema',
	buckets: {
		[BUCKET.hero_photo]: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 }
	},
	textSlots: {
		[TEXT.hero_title]: {
			label: 'Judul Hero',
			defaultValue: 'Romeo & Juliet',
			section: 'hero',
			defaultFontFamily: 'Great Vibes',
			defaultTextAlign: 'center'
		}
	},
	styleSlots: {
		[STYLE.hero_bg]: {
			label: 'Background Hero',
			properties: { backgroundColor: '#1c1917', opacity: '0.8' }
		}
	},
	demo: {
		payload: { nama_mempelai_pria: 'Romeo', nama_mempelai_wanita: 'Juliet' },
		featureToggle: { show_gallery: true, show_rsvp: true, show_music: true },
		schedules: [
			{
				title: 'Pawiwahan',
				start_time: '2026-10-10T08:00:00Z',
				end_time: '2026-10-10T12:00:00Z',
				location: 'Griya Agung',
				map_url: 'https://maps.google.com',
				timezone: 'Asia/Makassar'
			}
		],
		journeys: [
			{
				title: 'Pertama Bertemu',
				date: '14 Februari 2020',
				content: 'Awal kisah kami dimulai pada hari kasih sayang.',
				order: 1
			}
		]
	}
} as const satisfies ThemeManifest;
```

> [!IMPORTANT]
> When defining `demo` payload, pay close attention to strict typing for arrays like `schedules` and `journeys`. For instance, a Schedule requires `map_url` (not `address`), and a Journey strictly requires an `order` field.

### Step 4: Build the Theme Component

Create `Theme.svelte`. Import your manifest and use the context getters and helpers to build the UI safely.

```svelte
<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media';
	import { createTextHelper } from '$lib/theme-engine/helpers/text';
	import { createStyleHelper } from '$lib/theme-engine/helpers/style';
	import SectionEditButton from '$lib/theme-engine/components/section-edit-button.svelte';
	import { MANIFEST, BUCKET, TEXT, STYLE } from './manifest';
	import { getMediaUrl } from '$lib/utils';

	const data = getPernikahanContext();
	const media = createMediaHelper(MANIFEST.buckets, data.mediaMappings, data.isPreview);
	const text = createTextHelper(MANIFEST.textSlots, data.textOverrides);
	const style = createStyleHelper(MANIFEST.styleSlots, data.styleOverrides);
</script>

<div style={style.css(STYLE.hero_bg)}>
	<SectionEditButton slotKey={TEXT.hero_title} tab="text" label="Edit Judul" />
	<SectionEditButton slotKey={STYLE.hero_bg} tab="style" label="Edit Warna" />

	{#if media.has(BUCKET.hero_photo)}
		<img src={getMediaUrl(media.getFirstUrl(BUCKET.hero_photo))} alt="Hero" />
	{/if}

	<h1 style={text.fontStyle(TEXT.hero_title)}>
		{@html text.render(TEXT.hero_title)}
	</h1>
</div>
```

### Step 5: Register the Theme

Add your theme to `src/lib/theme-engine/registry.ts`:

```typescript
import { MANIFEST as PERNIKAHAN_CONTOH_1 } from '$lib/theme-engine/themes/pernikahan/pernikahan_contoh_1/manifest';

const registry: Record<string, RegistryEntry> = {
	// ...
	pernikahan_contoh_1: {
		manifest: PERNIKAHAN_CONTOH_1,
		load: () => import('$lib/theme-engine/themes/pernikahan/pernikahan_contoh_1/Theme.svelte')
	}
};
```

---

## Available Data (`InvitationData`)

Each theme accesses its data via a strictly-typed context getter (e.g., `getPernikahanContext()`, `getUlangTahunContext()`).

| Field                              | Description                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `payload`                          | Strongly typed payload (e.g., `nama_mempelai_pria` for pernikahan)          |
| `featureToggle`                    | Boolean flags (`show_music`, `show_gallery`, `show_rsvp`, etc.)             |
| `schedules`                        | Event schedules. Access `firstScheduleDate` for countdowns.                 |
| `journeys`                         | "Kisah Perjalanan" / milestones list                                        |
| `mediaMappings`                    | Raw uploaded media (pass this to `createMediaHelper`)                       |
| `textOverrides` / `styleOverrides` | Raw customizer overrides (pass to text/style helpers)                       |
| `musicController`                  | Unified music playback API (`isPlaying()`, `play()`, `pause()`, `toggle()`) |
| `coverState`                       | Cover gate API (`isOpened()`, `open()`)                                     |
| `initialGuestbook`                 | Pre-fetched guestbook entries for instant rendering                         |
| `invitationApi`                    | Typed HTTP methods (`submitRSVP`, `submitGuestbook`, `getGuestbook`)        |

---

## Helper APIs

The theme engine provides powerful, strongly-typed helpers to merge your Manifest defaults with User Overrides seamlessly.

### Media Helper (`createMediaHelper`)

- `media.getAll(BUCKET.key)`: Returns array of `MediaMapping`.
- `media.getFirstUrl(BUCKET.key)`: Returns string or undefined.
- `media.has(BUCKET.key)`: Returns boolean.

### Text Helper (`createTextHelper`)

- `text.render(TEXT.key)`: Returns safe, HTML-escaped text wrapped in `<strong>`, `<em>`, or `<u>` tags if the user enabled them. Use `{@html ...}` in Svelte to render it.
- `text.fontStyle(TEXT.key)`: Returns an inline CSS string containing `font-family` and `text-align` overrides.
- `text.getFlags(TEXT.key)`: Get raw formatting flags if you need custom handling.

### Style Helper (`createStyleHelper`)

- `style.css(STYLE.key)`: Generates inline CSS for properties like `background-color`, `color`, `border-radius`, and `opacity`. Automatically converts camelCase properties to CSS kebab-case.

### Countdown Helper (`createCountdown`)

Creates a reactive countdown timer to a target date.

```svelte
import {createCountdown} from '$lib/theme-engine/helpers/countdown.svelte'; const countdown = createCountdown(data.firstScheduleDate);
// Usage: // countdown.value.days, countdown.value.hours, etc. // countdown.value.isExpired
```

### Customizer Button (`SectionEditButton`)

To allow users to interact with the customizer during preview mode:

```svelte
<SectionEditButton slotKey={TEXT.hero_title} tab="text" label="Ubah Teks" class="top-4 right-4" />
```

It automatically hides itself in live (production) view.

### Placeholder Media & Fonts

If your theme requires default media (like fallback photos when a user hasn't uploaded any) or needs to reference available font categories, you should import the constants from `$lib/theme-engine/constants/placeholder` and `$lib/theme-engine/constants/fonts`.

- **`PLACEHOLDERS`**: Contains predefined static image paths organized by aesthetic tones (e.g., `WEDDING_TONE_WARM`, `WEDDING_TONE_COOL`). Useful for showing a complete UI even when users haven't uploaded their assets.
- **`AVAILABLE_FONTS` / `FontCategory`**: Use these if you need to reference default fonts or filter fonts by category in your theme logic.

**Example Usage**:
```svelte
import { PLACEHOLDERS } from '$lib/theme-engine/constants/placeholder';

// Fallback to a warm-toned cover image if the user hasn't uploaded one
const heroPhotoUrl = media.getFirstUrl(BUCKET.hero_photo) || PLACEHOLDERS.WEDDING_TONE_WARM.cover;
```
For a real-world example, refer to the source code of `pernikahan_bali_simple_1`.

---

## Shared UI Components

While themes are encouraged to build their own unique layouts and forms, the engine provides some generic shared components for standard use cases:

- **`GenericCover`**: A standard full-screen cover gate that handles the "Buka Undangan" action and auto-plays music.
  ```svelte
  import GenericCover from '$lib/theme-engine/components/generic-cover.svelte';

  <GenericCover invitationData={data} />
  ```

- **`ImagePreview`**: A reusable fullscreen image preview component with a backdrop blur and smooth entrance animation. Commonly used for gallery modals.
  ```svelte
  import ImagePreview from '$lib/theme-engine/components/image-preview.svelte';
  
  let previewImage = $state<string | null>(null);

  // In your markup, trigger it via:
  <img onclick={() => previewImage = getMediaUrl(img)} />

  // Render the component at the root level of your theme
  <ImagePreview bind:src={previewImage} />
  ```
- **Form Components**: Though custom forms are recommended, you can reference or use `$lib/theme-engine/components/rsvp-form.svelte` and `guestbook-section.svelte` if you want standard, unstyled logic.

### Custom Cover

If `GenericCover` doesn't fit your theme's style, you can create a `Cover.svelte` in your theme directory. A custom cover must read from `coverState.isOpened()` to conditionally render, and call `coverState.open()` when the guest clicks "Buka Undangan". Opening the cover will automatically trigger the music to play.

```svelte
<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context';
	import { fly } from 'svelte/transition';

	const { payload, guestName, coverState } = getPernikahanContext();
	let isOpened = $derived(coverState.isOpened());
</script>

{#if !isOpened}
	<div out:fly={{ y: '-100%', duration: 1000 }} class="fixed inset-0 z-50 ...">
		<h1>{payload.nama_panggilan_pria} & {payload.nama_panggilan_wanita}</h1>
		<p>Kepada: {guestName}</p>
		<button onclick={() => coverState.open()}>Buka Undangan</button>
	</div>
{/if}
```

## Advanced Patterns

### Mapping CSS Variables from Style Slots

If you are adapting a theme that uses CSS variables for theming (e.g., `--color-1`), you can easily map your strictly-typed `styleSlots` to CSS variables at the root of your component:

```svelte
<main
	style="--color-1: {style.get(STYLE.primary).color}; --color-2: {style.get(STYLE.secondary)
		.backgroundColor};"
>
	<div style="background-color: var(--color-2); color: var(--color-1);">
		<SectionEditButton slotKey={STYLE.primary} tab="style" label="Edit Warna" />
	</div>
</main>
```

This is an incredibly powerful pattern when migrating static Tailwind/HTML templates into the Momenu engine.

---

## Best Practices

1. **Robust Data Protection (Rock-Solid Implementation)**: Never assume arrays or feature toggles are populated. Every dynamic section must be wrapped in a condition checking BOTH the feature toggle (if applicable) and array length. This prevents the UI from breaking or showing empty sections.
   ```svelte
   {#if featureToggle.show_journeys && journeys.length > 0}
   	<section>...</section>
   {/if}
   ```
2. **Strict Svelte Each Keys**: Always provide a unique key in `{#each}` loops. This is crucial for Svelte's reactivity engine, especially when elements are reordered, added, or deleted (like in Journeys or Schedules).
   ```svelte
   {#each giftRegistries as gift (gift.id)}
   	<GiftCard {gift} />
   {/each}
   ```
   If no unique `id` exists, use the index as a fallback: `{#each colors as color, i (i)}`.
3. **Mandatory Footer**: Every theme **MUST** include a closing footer section at the bottom of the page. This footer should provide a clear visual conclusion to the invitation, gracefully housing any closing text (`TEXT.closing_text`) and the "Made with Momenu" watermarks or copyright notices.
4. **Respect Cover State**: Most themes render an interactive `<Cover />` first. Use `coverState.isOpened()` to block scrolling or pause internal theme logic until opened.
5. **Music Handling**: Never implement manual `<audio>` elements. Always bind a floating button to `musicController.toggle()` and let the Provider manage the global audio lifecycle.
6. **Lazy-Load Components**: Keep animations and large libraries lightweight so the `load: () => import(...)` in `registry.ts` resolves quickly.
7. **Svelte 5 Snippets (`children`)**: When passing default content to a component (like `<MapRenderer>`, buttons, or wrappers), you do not need to explicitly wrap the content in `{#snippet children()}` and `{/snippet}`. In Svelte 5, any default elements placed inside a component's tags are automatically treated as the `children` snippet.
