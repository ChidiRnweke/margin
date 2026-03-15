<script lang="ts">
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

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
		outcome === 'done'
			? ('success' as const)
			: outcome === 'skipped'
				? ('destructive' as const)
				: outcome === 'partial'
					? ('warning' as const)
					: ('default' as const)
	);
</script>

<Button
	variant="ghost"
	class="absolute h-auto rounded-lg p-1 text-left transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 [&>span]:w-full [&>span]:justify-start"
	{onclick}
>
	<GlassCard padding="sm">
		<Stack direction="vertical" gap="1">
			<div
				class="h-[3px] w-6 rounded-full"
				style:background={aspectColor ?? 'var(--color-accent)'}
			></div>
			<Text size="xs" weight="medium">{title}</Text>
			<Text size="xs" color="muted">{duration}h</Text>
			{#if outcome}
				<Badge variant={outcomeVariant} size="sm">{outcome}</Badge>
			{/if}
		</Stack>
	</GlassCard>
</Button>
