<script lang="ts">
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		title: string;
		aspectColor?: string;
		startHour: number;
		duration: number;
		dayIndex: number;
		totalDays?: number;
		baseHour?: number;
		outcome?: 'done' | 'skipped' | 'partial' | null;
		onclick?: () => void;
	}

	let {
		title,
		aspectColor,
		startHour,
		duration,
		dayIndex,
		totalDays = 7,
		baseHour = 6,
		outcome = null,
		onclick
	}: Props = $props();

	let outcomeVariant = $derived(
		outcome === 'done' ? 'success' as const
		: outcome === 'skipped' ? 'destructive' as const
		: outcome === 'partial' ? 'warning' as const
		: 'default' as const
	);
</script>

<button
	class="allocation-block"
	style:left="{(dayIndex / totalDays) * 100}%"
	style:width="{(1 / totalDays) * 100}%"
	style:top="{(startHour - baseHour) * 2.5}rem"
	style:height="{duration * 2.5}rem"
	style:--aspect-indicator={aspectColor ?? 'var(--color-accent)'}
	onclick={onclick}
	type="button"
>
	<GlassCard padding="sm">
		<Stack direction="vertical" gap="1">
			<div class="allocation-indicator"></div>
			<Text size="xs" weight="medium">{title}</Text>
			<Text size="xs" color="muted">{duration}h</Text>
			{#if outcome}
				<Badge variant={outcomeVariant} size="sm">{outcome}</Badge>
			{/if}
		</Stack>
	</GlassCard>
</button>

<style>
	.allocation-block {
		position: absolute;
		padding: var(--space-1);
		cursor: pointer;
		border: none;
		background: none;
		text-align: left;
		transition: transform var(--duration-fast) var(--ease-default);
	}
	.allocation-block:hover {
		transform: scale(1.02);
	}
	.allocation-block:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
		border-radius: var(--radius-lg);
	}
	.allocation-indicator {
		width: 1.5rem;
		height: 3px;
		border-radius: var(--radius-full);
		background: var(--aspect-indicator);
	}
</style>
