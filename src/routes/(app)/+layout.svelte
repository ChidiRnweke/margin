<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	let commandOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/plan', label: 'Plan' },
		{ href: '/aspects', label: 'Aspects' },
		{ href: '/tasks', label: 'Tasks' },
		{ href: '/settings', label: 'Settings' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			commandOpen = !commandOpen;
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="relative z-10 flex min-h-dvh w-full flex-col">
	<!-- Glass navigation bar -->
	<header
		class="glass-surface sticky top-0 z-50 border-b border-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] shadow-glass-sm backdrop-blur-md"
	>
		<div class="mx-auto flex w-full items-center justify-between px-[5%] py-3">
			<span class="font-display text-xl font-bold tracking-tight text-[var(--color-accent)]"
				>Margin</span
			>

			<nav class="hidden items-center gap-1 md:flex">
				{#each navItems as item}
					<Button
						variant={isActive(item.href) ? 'default' : 'ghost'}
						size="sm"
						href={item.href}
						class={cn(
							'rounded-full px-4 py-1.5 text-sm font-medium',
							isActive(item.href)
								? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]'
								: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
						)}
					>
						{item.label}
					</Button>
				{/each}
			</nav>

			<Button
				variant="outline"
				size="sm"
				class="gap-2 rounded-full border-[var(--color-glass-border)] bg-[var(--color-glass)] backdrop-blur-sm"
				onclick={() => (commandOpen = true)}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="7" cy="7" r="4.5" />
					<path d="M10.5 10.5L14 14" />
				</svg>
				<span class="hidden sm:inline">Search</span>
				<kbd
					class="ml-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 py-px font-mono text-xs text-[var(--color-text-faint)]"
					>⌘K</kbd
				>
			</Button>
		</div>
	</header>

	<!-- Main content area — no glass wrapper; pages compose their own glass surfaces -->
	<main class="flex-1 px-[5%] py-8">
		<div class="mx-auto">
			{@render children()}
		</div>
	</main>
</div>

<!-- Command palette using shadcn Dialog -->
<Dialog.Root bind:open={commandOpen}>
	<Dialog.Content
		class="glass-surface top-[20%] translate-y-0 gap-0 overflow-hidden rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-0 shadow-glass-lg backdrop-blur-lg sm:max-w-lg"
	>
		<Dialog.Header class="sr-only">
			<Dialog.Title>Command Palette</Dialog.Title>
			<Dialog.Description>Search commands and navigate</Dialog.Description>
		</Dialog.Header>
		<div class="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
			<svg
				class="shrink-0 text-[var(--color-text-muted)]"
				width="18"
				height="18"
				viewBox="0 0 18 18"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="8" cy="8" r="5" />
				<path d="M12 12l4 4" />
			</svg>
			<Input
				class="flex-1 border-none bg-transparent text-[var(--color-text)] shadow-none placeholder:text-[var(--color-text-faint)] focus-visible:ring-0"
				type="text"
				placeholder="Search commands..."
			/>
		</div>
		<div class="px-2 py-3">
			<p class="px-3 py-6 text-center text-sm text-[var(--color-text-faint)]">
				Start typing to search...
			</p>
		</div>
	</Dialog.Content>
</Dialog.Root>
