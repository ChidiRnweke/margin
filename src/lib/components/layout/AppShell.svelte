<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import CommandPalette from '$lib/components/overlays/CommandPalette.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	let commandPaletteOpen = $state(false);
</script>

<div class="relative z-10 flex min-h-dvh flex-col">
	<!-- Glass navigation bar -->
	<header
		class="glass-surface sticky top-0 z-50 border-b border-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] shadow-glass-sm backdrop-blur-md"
	>
		<div class="mx-auto flex max-w-[72rem] items-center justify-between px-8 py-3">
			<span class="font-display text-xl font-bold tracking-tight text-[var(--color-accent)]"
				>Margin</span
			>

			<nav class="hidden items-center gap-1 md:flex">
				<a
					class="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
					href="/">Dashboard</a
				>
				<a
					class="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
					href="/plan">Plan</a
				>
				<a
					class="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
					href="/tasks">Tasks</a
				>
			</nav>

			<Button
				variant="outline"
				size="sm"
				class="gap-2 rounded-full border-[var(--color-glass-border)] bg-[var(--color-glass)] backdrop-blur-sm"
				onclick={() => (commandPaletteOpen = true)}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
				</svg>
				<span class="hidden sm:inline">Search</span>
				<kbd
					class="ml-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 font-mono text-xs text-[var(--color-text-faint)]"
					>⌘K</kbd
				>
			</Button>
		</div>
	</header>

	<!-- Main content area — pages compose their own glass surfaces -->
	<main class="flex-1 px-8 py-8">
		<div class="mx-auto w-full max-w-[72rem]">
			{@render children()}
		</div>
	</main>
</div>

{#if commandPaletteOpen}
	<CommandPalette bind:open={commandPaletteOpen} />
{/if}
