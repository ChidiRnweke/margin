<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: Snippet;
		action?: Snippet;
	}

	let { title, description, icon, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center px-6 py-12 text-center">
	{#if icon}
		<div class="mb-4">
			{@render icon()}
		</div>
	{:else}
		<div class="mb-4 text-[var(--color-text-faint)]">
			<svg
				width="48"
				height="48"
				viewBox="0 0 48 48"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<rect x="8" y="8" width="32" height="32" rx="4" />
				<path d="M18 24h12M24 18v12" />
			</svg>
		</div>
	{/if}
	<h3 class="mb-2 text-xl font-semibold text-[var(--color-text)]">{title}</h3>
	{#if description}
		<p class="mb-6 max-w-sm text-base text-[var(--color-text-muted)]">{description}</p>
	{/if}
	{#if action}
		<div class="mt-2">
			{@render action()}
		</div>
	{/if}
</div>
