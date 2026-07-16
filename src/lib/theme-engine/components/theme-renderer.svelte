<script lang="ts">
	import type { Component } from 'svelte';
	import type { InvitationData } from '$lib/types/index.js';
	import { setInvitationContext } from '$lib/theme-engine/context.js';

	let { invitationData, ThemeComponent } = $props<{
		invitationData: InvitationData;
		ThemeComponent: Component;
	}>();

	// Set context synchronously during component initialization
	setInvitationContext(() => invitationData);
</script>

<ThemeComponent />
