<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		open: boolean;
		onclose?: () => void;
		title?: string;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { open = $bindable(), onclose, title, size = 'md', children }: Props = $props();

	const sizeMap = {
		sm: 'max-w-sm',
		md: 'max-w-lg',
		lg: 'max-w-3xl'
	} as const;

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) onclose?.();
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="motion-safe:animate-in motion-safe:fade-in fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
		/>
		<Dialog.Content
			class={cn(
				'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
				'rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] shadow-glass backdrop-blur-lg',
				'max-h-[85vh] overflow-y-auto',
				'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95',
				sizeMap[size]
			)}
		>
			{#if title}
				<Dialog.Header
					class="flex items-center justify-between border-b border-[var(--color-glass-border)] px-6 py-4"
				>
					<Dialog.Title class="text-xl font-semibold text-[var(--color-text)]">{title}</Dialog.Title
					>
				</Dialog.Header>
			{/if}
			<div class="p-6">
				{@render children()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
