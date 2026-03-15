<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		days?: string[];
		hours?: number[];
		children: Snippet;
	}

	let {
		days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
		children
	}: Props = $props();
</script>

<div class="timeline-grid" style:--col-count={days.length}>
	<div class="timeline-corner"></div>
	{#each days as day}
		<div class="timeline-day-header">{day}</div>
	{/each}

	{#each hours as hour}
		<div class="timeline-hour-label">
			{hour.toString().padStart(2, '0')}:00
		</div>
		{#each days as _, di}
			<div class="timeline-cell" data-hour={hour} data-day={di}></div>
		{/each}
	{/each}

	<div class="timeline-overlay">
		{@render children()}
	</div>
</div>

<style>
	.timeline-grid {
		display: grid;
		grid-template-columns: 4rem repeat(var(--col-count), 1fr);
		position: relative;
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
	}
	.timeline-corner {
		background: var(--color-surface-muted);
		border-bottom: 1px solid var(--color-border-muted);
		border-right: 1px solid var(--color-border-muted);
	}
	.timeline-day-header {
		padding: var(--space-2) var(--space-3);
		text-align: center;
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-muted);
		background: var(--color-surface-muted);
		border-bottom: 1px solid var(--color-border-muted);
		border-right: 1px solid var(--color-border-muted);
	}
	.timeline-day-header:last-of-type {
		border-right: none;
	}
	.timeline-hour-label {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-faint);
		border-right: 1px solid var(--color-border-muted);
		border-bottom: 1px solid var(--color-border-muted);
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		font-variant-numeric: tabular-nums;
	}
	.timeline-cell {
		min-height: 2.5rem;
		border-right: 1px solid var(--color-border-muted);
		border-bottom: 1px solid var(--color-border-muted);
	}
	.timeline-cell:nth-child(8n) {
		border-right: none;
	}
	.timeline-overlay {
		position: absolute;
		top: 0;
		left: 4rem;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}
	.timeline-overlay :global(*) {
		pointer-events: auto;
	}
</style>
