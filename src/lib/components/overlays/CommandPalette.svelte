<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils.js';

	interface CommandItem {
		id: string;
		label: string;
		description?: string;
		action: () => void;
		shortcut?: string;
	}

	interface Props {
		open: boolean;
		items?: CommandItem[];
		onclose?: () => void;
	}

	let { open = $bindable(), items = [], onclose }: Props = $props();
	let query = $state('');
	let selectedIndex = $state(0);

	let filtered = $derived(
		query.length === 0
			? items
			: items.filter(
					(item) =>
						item.label.toLowerCase().includes(query.toLowerCase()) ||
						item.description?.toLowerCase().includes(query.toLowerCase())
				)
	);

	$effect(() => {
		if (open) {
			query = '';
			selectedIndex = 0;
		}
	});

	function close() {
		open = false;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		}
		if (e.key === 'Enter' && filtered[selectedIndex]) {
			e.preventDefault();
			filtered[selectedIndex].action();
			close();
		}
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<Dialog.Root bind:open>
	<Dialog.Content
		class="top-[20%] translate-y-0 gap-0 overflow-hidden rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-0 shadow-glass-lg backdrop-blur-lg sm:max-w-lg"
		onkeydown={handleKeydown}
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
			<!-- svelte-ignore a11y_autofocus -->
			<Input
				type="text"
				placeholder="Search commands..."
				bind:value={query}
				autofocus
				class="flex-1 border-none bg-transparent text-[var(--color-text)] shadow-none placeholder:text-[var(--color-text-faint)] focus-visible:ring-0"
			/>
		</div>
		{#if filtered.length > 0}
			<ScrollArea class="max-h-80">
				<ul class="m-0 list-none p-2" role="listbox">
					{#each filtered as item, i (item.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<li
							class={cn(
								'flex cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 transition-colors',
								i === selectedIndex
									? 'bg-[var(--color-glass-strong)]'
									: 'hover:bg-[var(--color-glass)]'
							)}
							role="option"
							aria-selected={i === selectedIndex}
							onmouseenter={() => (selectedIndex = i)}
							onclick={() => {
								item.action();
								close();
							}}
						>
							<div class="flex flex-col gap-0.5">
								<span class="text-sm font-medium text-[var(--color-text)]">{item.label}</span>
								{#if item.description}
									<span class="text-xs text-[var(--color-text-muted)]">{item.description}</span>
								{/if}
							</div>
							{#if item.shortcut}
								<kbd
									class="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)]"
									>{item.shortcut}</kbd
								>
							{/if}
						</li>
					{/each}
				</ul>
			</ScrollArea>
		{:else}
			<div class="px-3 py-8 text-center text-sm text-[var(--color-text-faint)]">
				<p>No results found</p>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
