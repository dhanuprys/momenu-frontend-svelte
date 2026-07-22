<script lang="ts">
	import type { Component } from 'svelte';
	import type { InvitationData } from '$lib/types/index';
	import { setInvitationContext } from '$lib/theme-engine/context';

	let { invitationData, ThemeComponent } = $props<{
		invitationData: InvitationData;
		ThemeComponent: Component;
	}>();

	// Set context synchronously during component initialization
	setInvitationContext(() => invitationData);
</script>

<ThemeComponent />
