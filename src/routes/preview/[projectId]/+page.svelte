<script lang="ts">
	import { page } from '$app/stores';
	import InvitationProvider from '$lib/theme-engine/components/invitation-provider.svelte';

	let projectId = $derived($page.params.projectId!);
</script>

<svelte:head>
	<title>Pratinjau Undangan</title>
</svelte:head>

<InvitationProvider slug="preview" isPreview={true} {projectId} />
