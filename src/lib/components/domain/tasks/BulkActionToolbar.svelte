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

<div
	class="flex items-center justify-between rounded border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-4 py-3"
>
	<Text as="span" size="sm" weight="medium">
		{count} selected
	</Text>
	<div class="flex gap-2">
		{#if onmove}
			<Button variant="ghost" size="sm" onclick={onmove}>Move</Button>
		{/if}
		{#if onarchive}
			<Button variant="ghost" size="sm" onclick={onarchive}>Archive</Button>
		{/if}
		<Button variant="ghost" size="sm" onclick={ondeselect}>Deselect</Button>
	</div>
</div>
