<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Text from '$lib/components/primitives/Text.svelte';
	import { cn } from '$lib/utils.js';

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
		return blocks.some((b) => b.dayIndex === dayIndex && hour >= b.startHour && hour < b.endHour);
	}
</script>

<div
	class="grid overflow-hidden rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass)]"
	style="grid-template-columns: 4rem repeat(7, 1fr)"
>
	<div
		class="border-r border-b border-[var(--color-glass-border)] bg-[var(--color-glass-strong)]"
	></div>
	{#each DAYS as day}
		<div
			class="border-r border-b border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] px-3 py-2 text-center text-xs font-semibold text-[var(--color-text-muted)]"
		>
			{day}
		</div>
	{/each}

	{#each HOURS as hour}
		<div
			class="flex items-start justify-end border-r border-b border-[var(--color-glass-border)] px-2 py-1"
		>
			<Text size="xs" color="faint">{hour.toString().padStart(2, '0')}:00</Text>
		</div>
		{#each DAYS as _, di}
			<Button
				variant="ghost"
				class={cn(
					'min-h-8 rounded-none border-r border-b border-[var(--color-glass-border)] p-0',
					isBlockedSlot(di, hour)
						? 'bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)] hover:opacity-60'
						: 'bg-transparent hover:bg-[var(--color-glass)]'
				)}
				onclick={() => onslotclick?.(di, hour)}
				aria-label="{DAYS[di]} {hour}:00"
			/>
		{/each}
	{/each}
</div>
