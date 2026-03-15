<script lang="ts">
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';
	import Text from '$lib/components/primitives/Text.svelte';

	interface Props {
		label: string;
		value: number;
		total?: number;
		variant?: 'default' | 'accent' | 'success' | 'destructive';
	}

	let { label, value, total, variant = 'default' }: Props = $props();
</script>

<GlassCard padding="md">
	<div class="kpi" class:kpi-accent={variant === 'accent'} class:kpi-success={variant === 'success'} class:kpi-destructive={variant === 'destructive'}>
		<Text as="span" size="xs" weight="medium" color="muted" tracking="wide">{label}</Text>
		<div class="kpi-value-row">
			<span class="kpi-number">{value}</span>
			{#if total !== undefined}
				<Text as="span" size="sm" color="faint">/ {total}</Text>
			{/if}
		</div>
	</div>
</GlassCard>

<style>
	.kpi {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.kpi-number {
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}
	.kpi-accent .kpi-number {
		color: var(--color-accent);
	}
	.kpi-success .kpi-number {
		color: var(--color-success);
	}
	.kpi-destructive .kpi-number {
		color: var(--color-destructive);
	}
	.kpi-value-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}
</style>
