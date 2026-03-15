<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		direction?: 'vertical' | 'horizontal';
		gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
		align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around';
		wrap?: boolean;
		class?: string;
		children: Snippet;
	}

	const gapMap: Record<string, string> = {
		'0': 'gap-0',
		'1': 'gap-1',
		'2': 'gap-2',
		'3': 'gap-3',
		'4': 'gap-4',
		'5': 'gap-5',
		'6': 'gap-6',
		'8': 'gap-8',
		'10': 'gap-10',
		'12': 'gap-12',
		'16': 'gap-16'
	};

	const alignMap: Record<string, string> = {
		start: 'items-start',
		center: 'items-center',
		end: 'items-end',
		stretch: 'items-stretch',
		baseline: 'items-baseline'
	};

	const justifyMap: Record<string, string> = {
		start: 'justify-start',
		center: 'justify-center',
		end: 'justify-end',
		between: 'justify-between',
		around: 'justify-around'
	};

	let {
		direction = 'vertical',
		gap = '4',
		align = 'stretch',
		justify = 'start',
		wrap = false,
		class: className,
		children
	}: Props = $props();
</script>

<div
	class={cn(
		'flex',
		direction === 'vertical' ? 'flex-col' : 'flex-row',
		gapMap[gap],
		alignMap[align],
		justifyMap[justify],
		wrap && 'flex-wrap',
		className
	)}
>
	{@render children()}
</div>
