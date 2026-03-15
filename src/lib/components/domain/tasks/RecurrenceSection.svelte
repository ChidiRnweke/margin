<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';

	interface RecurrenceRule {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: string[];
		paused: boolean;
		nextOccurrence?: string;
	}

	interface Props {
		rule: RecurrenceRule;
		onpause?: () => void;
		onresume?: () => void;
		onskip?: () => void;
		onmove?: () => void;
	}

	let { rule, onpause, onresume, onskip, onmove }: Props = $props();

	let frequencyLabel = $derived(
		rule.interval === 1
			? rule.frequency.replace('ly', '')
			: `every ${rule.interval} ${rule.frequency.replace('ly', '')}s`
	);
</script>

<Panel title="Recurrence">
	<Stack direction="vertical" gap="4">
		<Stack direction="horizontal" gap="3" align="center">
			<Badge variant={rule.paused ? 'warning' : 'accent'}>
				{rule.paused ? 'Paused' : 'Active'}
			</Badge>
			<Text size="sm" color="muted">{frequencyLabel}</Text>
		</Stack>

		{#if rule.daysOfWeek && rule.daysOfWeek.length > 0}
			<Stack direction="horizontal" gap="2" wrap={true}>
				{#each rule.daysOfWeek as day}
					<span class="day-chip">{day}</span>
				{/each}
			</Stack>
		{/if}

		{#if rule.nextOccurrence}
			<Text size="sm" color="muted">Next: {rule.nextOccurrence}</Text>
		{/if}

		<Stack direction="horizontal" gap="2" wrap={true}>
			{#if rule.paused}
				<Button variant="secondary" size="sm" onclick={onresume}>Resume</Button>
			{:else}
				<Button variant="secondary" size="sm" onclick={onpause}>Pause</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={onskip}>Skip next</Button>
			<Button variant="ghost" size="sm" onclick={onmove}>Move next</Button>
		</Stack>
	</Stack>
</Panel>

<style>
	.day-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-surface-muted);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}
</style>
