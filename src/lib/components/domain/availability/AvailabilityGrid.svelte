<script lang="ts">
	import Text from '$lib/components/primitives/Text.svelte';

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

	interface Block {
		dayIndex: number;
		startHour: number;
		endHour: number;
		label?: string;
	}

	interface Props {
		blocks: Block[];
		onslotclick?: (dayIndex: number, hour: number) => void;
	}

	let { blocks, onslotclick }: Props = $props();

	function isBlockedSlot(dayIndex: number, hour: number): boolean {
		return blocks.some(
			(b) => b.dayIndex === dayIndex && hour >= b.startHour && hour < b.endHour
		);
	}
</script>

<div class="availability-grid">
	<div class="grid-corner"></div>
	{#each DAYS as day}
		<div class="grid-day-header">{day}</div>
	{/each}

	{#each HOURS as hour}
		<div class="grid-hour-label">
			<Text size="xs" color="faint">{hour.toString().padStart(2, '0')}:00</Text>
		</div>
		{#each DAYS as _, di}
			<button
				class="grid-cell"
				class:grid-cell--filled={isBlockedSlot(di, hour)}
				onclick={() => onslotclick?.(di, hour)}
				type="button"
				aria-label="{DAYS[di]} {hour}:00"
			></button>
		{/each}
	{/each}
</div>

<style>
	.availability-grid {
		display: grid;
		grid-template-columns: 4rem repeat(7, 1fr);
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
	}
	.grid-corner {
		background: var(--color-surface-muted);
		border-bottom: 1px solid var(--color-border-muted);
		border-right: 1px solid var(--color-border-muted);
	}
	.grid-day-header {
		padding: var(--space-2) var(--space-3);
		text-align: center;
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-muted);
		background: var(--color-surface-muted);
		border-bottom: 1px solid var(--color-border-muted);
		border-right: 1px solid var(--color-border-muted);
	}
	.grid-hour-label {
		padding: var(--space-1) var(--space-2);
		border-right: 1px solid var(--color-border-muted);
		border-bottom: 1px solid var(--color-border-muted);
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
	}
	.grid-cell {
		min-height: 2rem;
		border: none;
		border-right: 1px solid var(--color-border-muted);
		border-bottom: 1px solid var(--color-border-muted);
		background: transparent;
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-default);
	}
	.grid-cell:hover {
		background: var(--color-surface-muted);
	}
	.grid-cell--filled {
		background: var(--color-accent-muted);
	}
	.grid-cell--filled:hover {
		background: var(--color-accent);
		opacity: 0.6;
	}
</style>
