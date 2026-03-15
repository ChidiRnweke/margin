<script lang="ts">
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';

	interface Props {
		label: string;
		value: number;
		total?: number;
		variant?: 'default' | 'accent' | 'success' | 'destructive';
	}

	let { label, value, total, variant = 'default' }: Props = $props();

	const variantColor = $derived(
		variant === 'accent'
			? 'var(--color-accent)'
			: variant === 'success'
				? 'var(--color-success)'
				: variant === 'destructive'
					? 'var(--color-destructive)'
					: 'var(--color-text)'
	);
</script>

<GlassCard padding="md">
	<div class="flex flex-col gap-1">
		<span
			class="font-body text-xs font-medium tracking-[0.12em] text-[var(--color-text-muted)] uppercase"
		>
			{label}
		</span>
		<div class="flex items-baseline gap-2">
			<span
				class="font-display text-3xl leading-tight font-bold tracking-tight"
				style="color: {variantColor}"
			>
				{value}
			</span>
			{#if total !== undefined}
				<span class="text-sm text-[var(--color-text-faint)]">/ {total}</span>
			{/if}
		</div>
	</div>
</GlassCard>
