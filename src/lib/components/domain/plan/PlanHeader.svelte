<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		weekLabel: string;
		status: 'draft' | 'confirmed' | 'archived';
		onprev?: () => void;
		onnext?: () => void;
		ongenerate?: () => void;
		onconfirm?: () => void;
	}

	let { weekLabel, status, onprev, onnext, ongenerate, onconfirm }: Props = $props();
</script>

<div class="plan-header">
	<Stack direction="horizontal" gap="4" align="center" justify="between">
		<Stack direction="horizontal" gap="3" align="center">
			<Button variant="ghost" size="sm" onclick={onprev}>←</Button>
			<Text as="h2" size="xl" weight="semibold">{weekLabel}</Text>
			<Button variant="ghost" size="sm" onclick={onnext}>→</Button>
		</Stack>

		<Stack direction="horizontal" gap="2" align="center">
			{#if status === 'draft'}
				<Button variant="secondary" size="sm" onclick={ongenerate}>Generate plan</Button>
				<Button variant="primary" size="sm" onclick={onconfirm}>Confirm plan</Button>
			{:else if status === 'confirmed'}
				<span class="status-tag confirmed">Confirmed</span>
			{:else}
				<span class="status-tag archived">Archived</span>
			{/if}
		</Stack>
	</Stack>
</div>

<style>
	.plan-header {
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--color-border-muted);
	}
	.status-tag {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
	}
	.status-tag.confirmed {
		background: var(--color-success-muted);
		color: var(--color-success);
	}
	.status-tag.archived {
		background: var(--color-surface-muted);
		color: var(--color-text-muted);
	}
</style>
