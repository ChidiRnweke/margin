<script lang="ts">
	/**
	 * GlassPanel — Level 1 glass surface.
	 * Use for: dashboard sections, main content cards, sidebar panels.
	 *
	 * Pattern: bg-glass + backdrop-blur-md + luminous directional border + shadow-glass
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		title?: string;
		padding?: 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
	}

	let { title, padding = 'md', class: className = '', children }: Props = $props();

	const paddingMap: Record<string, string> = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div
	class={cn(
		'glass-surface rounded-lg border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] shadow-glass backdrop-blur-md',
		'supports-[not_(backdrop-filter:blur(1px))]:bg-[var(--color-surface)]',
		paddingMap[padding],
		className
	)}
>
	{#if title}
		<h3
			class="mb-4 font-display text-lg font-semibold tracking-tight text-[var(--color-text)]"
		>
			{title}
		</h3>
	{/if}
	{@render children()}
</div>
