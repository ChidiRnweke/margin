<script lang="ts">
	import '$lib/styles/base.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AmbientBackground from '$lib/components/layout/AmbientBackground.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<AmbientBackground />
{@render children()}
