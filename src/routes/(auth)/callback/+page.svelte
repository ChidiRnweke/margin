<script lang="ts">
	import Text from '$lib/components/primitives/Text.svelte';
</script>

<div class="callback-page">
	<Text as="p" color="muted" align="center">Signing you in…</Text>
</div>

<style>
	.callback-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		background: var(--color-bg);
	}
</style>
