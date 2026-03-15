<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		shadow?: 'none' | 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
	}

	let { padding = 'md', shadow = 'sm', class: className = '', children }: Props = $props();
</script>

<div
	class={cn(
		'glass-surface rounded-lg border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] backdrop-blur-md',
		'supports-[not_(backdrop-filter:blur(1px))]:bg-[var(--color-surface)]',
		padding === 'none' && 'py-0',
		padding === 'sm' && 'gap-4 px-4 py-4',
		padding === 'md' && 'gap-5 px-6 py-6',
		padding === 'lg' && 'gap-6 px-8 py-8',
		shadow === 'none' && 'shadow-none',
		shadow === 'sm' && 'shadow-glass-sm',
		shadow === 'md' && 'shadow-glass',
		shadow === 'lg' && 'shadow-glass-lg',
		className
	)}
>
	{@render children()}
</div>
