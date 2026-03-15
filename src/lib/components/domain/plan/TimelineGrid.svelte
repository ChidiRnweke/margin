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

<div
	class="relative grid overflow-hidden rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass)]"
	style="grid-template-columns: 4rem repeat({days.length}, 1fr)"
>
	<div
		class="border-r border-b border-[var(--color-glass-border)] bg-[var(--color-glass-strong)]"
	></div>
	{#each days as day, i}
		<div
			class="border-b border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] px-3 py-2 text-center text-xs font-semibold text-[var(--color-text-muted)] {i <
			days.length - 1
				? 'border-r'
				: ''}"
		>
			{day}
		</div>
	{/each}

	{#each hours as hour}
		<div
			class="flex items-start justify-end border-r border-b border-[var(--color-glass-border)] px-2 py-1 text-xs text-[var(--color-text-faint)] tabular-nums"
		>
			{hour.toString().padStart(2, '0')}:00
		</div>
		{#each days as _, di}
			<div
				class="min-h-10 border-b border-[var(--color-glass-border)] {di < days.length - 1
					? 'border-r'
					: ''}"
				data-hour={hour}
				data-day={di}
			></div>
		{/each}
	{/each}

	<div
		class="pointer-events-none absolute top-0 right-0 bottom-0 left-16 [&>*]:pointer-events-auto"
	>
		{@render children()}
	</div>
</div>
