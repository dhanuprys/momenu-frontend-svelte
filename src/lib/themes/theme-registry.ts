import { MANIFEST as METATAH_SAKRAL_1 } from '$lib/components/themes/metatah/metatah_sakral_1/manifest.js';
import { MANIFEST as PERNIKAHAN_BALI_SIMPLE_1 } from '$lib/components/themes/pernikahan/pernikahan_bali_simple_1/manifest.js';
import { MANIFEST as SEMINAR_PROFESSIONAL_1 } from '$lib/components/themes/seminar/seminar_professional_1/manifest.js';
import { MANIFEST as TIGANG_SASIH_PASTEL_1 } from '$lib/components/themes/tigang_sasih/tigang_sasih_pastel_1/manifest.js';
import { MANIFEST as ULANG_TAHUN_FESTIVE_1 } from '$lib/components/themes/ulang_tahun/ulang_tahun_festive_1/manifest.js';
import type { ThemeManifest } from '$lib/types/theme-manifest';
import type { Component } from 'svelte';

interface RegistryEntry {
	manifest: ThemeManifest;
	load: () => Promise<{ default: Component }>;
}

const registry: Record<string, RegistryEntry> = {
	pernikahan_bali_simple_1: {
		manifest: PERNIKAHAN_BALI_SIMPLE_1,
		load: () => import('$lib/components/themes/pernikahan/pernikahan_bali_simple_1/Theme.svelte')
	},
	ulang_tahun_festive_1: {
		manifest: ULANG_TAHUN_FESTIVE_1,
		load: () => import('$lib/components/themes/ulang_tahun/ulang_tahun_festive_1/Theme.svelte')
	},
	metatah_sakral_1: {
		manifest: METATAH_SAKRAL_1,
		load: () => import('$lib/components/themes/metatah/metatah_sakral_1/Theme.svelte')
	},
	tigang_sasih_pastel_1: {
		manifest: TIGANG_SASIH_PASTEL_1,
		load: () => import('$lib/components/themes/tigang_sasih/tigang_sasih_pastel_1/Theme.svelte')
	},
	seminar_professional_1: {
		manifest: SEMINAR_PROFESSIONAL_1,
		load: () => import('$lib/components/themes/seminar/seminar_professional_1/Theme.svelte')
	}
};

export function resolveTheme(themeId: string): Promise<{ default: Component }> | undefined {
	const entry = registry[themeId];
	if (!entry) return undefined;
	return entry.load();
}

export function getThemeManifest(themeId: string): ThemeManifest | undefined {
	return registry[themeId]?.manifest;
}

export function listThemes(): ThemeManifest[] {
	return Object.values(registry).map((entry) => entry.manifest);
}
