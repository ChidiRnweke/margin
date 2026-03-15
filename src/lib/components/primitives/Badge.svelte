<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Badge as UiBadge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
		size?: 'sm' | 'md';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', size = 'sm', class: className = '', children }: Props = $props();
</script>

<UiBadge
	variant="outline"
	class={cn(
		'border-[var(--color-glass-border)] bg-[var(--color-glass)] font-body tracking-[0.16em] uppercase',
		size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
		variant === 'default' && 'text-[var(--color-text-muted)]',
		variant === 'accent' &&
			'border-[color:var(--color-accent-border)] bg-[color:var(--color-accent-soft)] text-[var(--color-accent)]',
		variant === 'success' &&
			'border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] text-[var(--color-success)]',
		variant === 'warning' &&
			'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] text-[var(--color-warning)]',
		variant === 'destructive' &&
			'border-[color:var(--color-destructive-border)] bg-[color:var(--color-destructive-soft)] text-[var(--color-destructive)]',
		className
	)}
>
	{@render children()}
</UiBadge>
