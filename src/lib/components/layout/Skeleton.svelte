<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Skeleton as UiSkeleton } from '$lib/components/ui/skeleton/index.js';

	interface Props {
		variant?: 'line' | 'rect' | 'circle';
		width?: string;
		height?: string;
		class?: string;
	}

	const variantMap: Record<string, string> = {
		line: 'rounded-sm',
		rect: 'rounded-[10px]',
		circle: 'rounded-full'
	};

	let { variant = 'rect', width = '100%', height = '1rem', class: className }: Props = $props();
</script>

<UiSkeleton
	class={cn('bg-[var(--color-glass)] backdrop-blur-sm', variantMap[variant], className)}
	style="width: {width}; height: {height}"
/>
