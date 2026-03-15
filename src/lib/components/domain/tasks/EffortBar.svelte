<script lang="ts">
	import { Progress } from '$lib/components/ui/progress/index.js';

	interface Props {
		value: number;
		max?: number;
	}

	let { value, max = 8 }: Props = $props();

	let percentage = $derived(Math.min(100, Math.round((value / max) * 100)));
</script>

<div class="w-16" title="{value}/{max}h effort">
	<Progress
		value={percentage}
		class="h-1.5 bg-[var(--color-glass-border)] [&_[data-slot=progress-indicator]]:bg-[var(--color-accent)]"
	/>
</div>
