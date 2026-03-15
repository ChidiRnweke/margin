<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';

	interface Props {
		title: string;
		aspect?: string;
		duration: number;
		day: string;
		time: string;
		outcome?: 'done' | 'skipped' | 'partial' | null;
		open?: boolean;
		onmarkdone?: () => void;
		onmarkskipped?: () => void;
		onclose?: () => void;
	}

	let {
		title,
		aspect,
		duration,
		day,
		time,
		outcome = null,
		open = false,
		onmarkdone,
		onmarkskipped,
		onclose
	}: Props = $props();
</script>

{#if open}
	<div class="popover-backdrop" role="presentation" onclick={onclose}></div>
	<div class="allocation-popover" role="dialog" aria-label="Allocation details">
		<Card padding="md">
			<Stack direction="vertical" gap="4">
				<Stack direction="horizontal" gap="2" align="center" justify="between">
					<Text as="h3" size="base" weight="semibold">{title}</Text>
					<button class="close-btn" onclick={onclose} aria-label="Close" type="button">✕</button>
				</Stack>

				{#if aspect}
					<Text size="sm" color="muted">{aspect}</Text>
				{/if}

				<Stack direction="horizontal" gap="4">
					<Text size="sm" color="muted">{day}</Text>
					<Text size="sm" color="muted">{time}</Text>
					<Text size="sm" color="muted">{duration}h</Text>
				</Stack>

				{#if outcome}
					<Badge variant={outcome === 'done' ? 'success' : outcome === 'skipped' ? 'destructive' : 'warning'}>
						{outcome}
					</Badge>
				{/if}

				<Stack direction="horizontal" gap="2">
					<Button variant="primary" size="sm" onclick={onmarkdone}>Mark done</Button>
					<Button variant="ghost" size="sm" onclick={onmarkskipped}>Skip</Button>
				</Stack>
			</Stack>
		</Card>
	</div>
{/if}

<style>
	.popover-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
	}
	.allocation-popover {
		position: absolute;
		z-index: 50;
		min-width: 16rem;
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-lg);
	}
	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		border-radius: var(--radius-sm);
		transition: background var(--duration-fast) var(--ease-default);
	}
	.close-btn:hover {
		background: var(--color-surface-muted);
	}
</style>
