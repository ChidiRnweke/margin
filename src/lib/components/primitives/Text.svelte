<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'div';
		size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
		weight?: 'normal' | 'medium' | 'semibold' | 'bold';
		color?: 'default' | 'muted' | 'faint' | 'accent' | 'success' | 'warning' | 'destructive';
		tracking?: 'tight' | 'normal' | 'wide';
		leading?: 'tight' | 'normal' | 'relaxed';
		align?: 'left' | 'center' | 'right';
		class?: string;
		children: Snippet;
	}

	const sizeMap: Record<string, string> = {
		xs: 'text-xs',
		sm: 'text-sm',
		base: 'text-base',
		lg: 'text-lg',
		xl: 'text-xl',
		'2xl': 'text-2xl',
		'3xl': 'text-3xl',
		'4xl': 'text-4xl'
	};

	const weightMap: Record<string, string> = {
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold'
	};

	const colorMap: Record<string, string> = {
		default: 'text-[var(--color-text)]',
		muted: 'text-[var(--color-text-muted)]',
		faint: 'text-[var(--color-text-faint)]',
		accent: 'text-[var(--color-accent)]',
		success: 'text-[var(--color-success)]',
		warning: 'text-[var(--color-warning)]',
		destructive: 'text-[var(--color-destructive)]'
	};

	const trackingMap: Record<string, string> = {
		tight: 'tracking-tight',
		normal: 'tracking-normal',
		wide: 'tracking-wide'
	};

	const leadingMap: Record<string, string> = {
		tight: 'leading-tight',
		normal: 'leading-normal',
		relaxed: 'leading-relaxed'
	};

	const alignMap: Record<string, string> = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};

	let {
		as = 'p',
		size = 'base',
		weight = 'normal',
		color = 'default',
		tracking = 'normal',
		leading = 'normal',
		align = 'left',
		class: className,
		children
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={cn(
		'm-0',
		sizeMap[size],
		weightMap[weight],
		colorMap[color],
		trackingMap[tracking],
		leadingMap[leading],
		alignMap[align],
		className
	)}
>
	{@render children()}
</svelte:element>
