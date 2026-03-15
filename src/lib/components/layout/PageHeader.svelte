<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<div class="mb-4 flex items-start justify-between gap-4 max-sm:flex-col">
	<div class="flex flex-col gap-1">
		<h1
			class="font-display text-3xl leading-tight font-bold tracking-tight text-[var(--color-text)]"
		>
			{title}
		</h1>
		{#if description}
			<p class="text-base text-[var(--color-text-muted)]">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 items-center gap-3">
			{@render actions()}
		</div>
	{/if}
</div>
<Separator class="mb-6 bg-[var(--color-glass-border)]" />
