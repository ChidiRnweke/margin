<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		days?: string[];
		children: Snippet;
		header?: Snippet;
	}

	let {
		days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		children,
		header
	}: Props = $props();
</script>

<div class="flex flex-col gap-4">
	{#if header}
		<div class="border-b border-[var(--color-glass-border)] pb-4">
			{@render header()}
		</div>
	{/if}
	<div class="overflow-x-auto" style="--day-count: {days.length}">
		<div
			class="grid gap-px overflow-hidden rounded-t-[10px] bg-[var(--color-glass-border)]"
			style="grid-template-columns: repeat({days.length}, minmax(120px, 1fr))"
		>
			{#each days as day}
				<div
					class="border-r border-b border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] px-3 py-2 text-center text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase"
				>
					{day}
				</div>
			{/each}
		</div>
		<div
			class="grid min-h-[200px] gap-px bg-[var(--color-glass-border)]"
			style="grid-template-columns: repeat({days.length}, minmax(120px, 1fr))"
		>
			{@render children()}
		</div>
	</div>
</div>
