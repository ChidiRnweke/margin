<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	/**
	 * GlassCard — Level 2 glass surface.
	 * Use for: KPI stat cards, aspect cards inside a grid, task cards inside a list panel.
	 *
	 * Pattern: bg-glass-strong + backdrop-blur-sm + luminous directional border + shadow-glass-sm
	 */
	interface Props {
		padding?: 'sm' | 'md' | 'lg';
		intensity?: 'default' | 'strong';
		class?: string;
		children: Snippet;
	}

	let { padding = 'md', intensity = 'default', class: className = '', children }: Props = $props();

	const paddingMap: Record<string, string> = {
		sm: 'p-3',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div
	class={cn(
		'glass-surface rounded-[var(--radius-md)] border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] shadow-glass-sm backdrop-blur-sm',
		intensity === 'default' ? 'bg-[var(--color-glass-strong)]' : 'bg-[var(--color-glass)]',
		paddingMap[padding],
		'supports-[not_(backdrop-filter:blur(1px))]:bg-[var(--color-surface-raised)]',
		className
	)}
>
	{@render children()}
</div>
