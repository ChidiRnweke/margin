<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';

	interface Props {
		count: number;
		ondeselect?: () => void;
		onarchive?: () => void;
		onmove?: () => void;
	}

	let { count, ondeselect, onarchive, onmove }: Props = $props();
</script>

<div class="bulk-toolbar">
	<Text as="span" size="sm" weight="medium">
		{count} selected
	</Text>
	<div class="bulk-actions">
		{#if onmove}
			<Button variant="ghost" size="sm" onclick={onmove}>Move</Button>
		{/if}
		{#if onarchive}
			<Button variant="ghost" size="sm" onclick={onarchive}>Archive</Button>
		{/if}
		<Button variant="ghost" size="sm" onclick={ondeselect}>Deselect</Button>
	</div>
</div>

<style>
	.bulk-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--color-accent-muted);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius);
	}
	.bulk-actions {
		display: flex;
		gap: var(--space-2);
	}
</style>
