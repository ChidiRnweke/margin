<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	interface Props {
		open: boolean;
		onclose?: () => void;
		side?: 'left' | 'right';
		title?: string;
		children: Snippet;
	}

	let { open = $bindable(), onclose, side = 'right', title, children }: Props = $props();

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) onclose?.();
	}
</script>

<Sheet.Root bind:open onOpenChange={handleOpenChange}>
	<Sheet.Portal>
		<Sheet.Overlay
			class="motion-safe:animate-in motion-safe:fade-in fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
		/>
		<Sheet.Content
			{side}
			class="shadow-glass motion-safe:animate-in motion-safe:slide-in-from-right fixed top-0 bottom-0 z-50 flex w-full max-w-sm flex-col border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] backdrop-blur-lg"
		>
			<Sheet.Header
				class="flex items-center justify-between border-b border-[var(--color-glass-border)] px-6 py-4"
			>
				{#if title}
					<Sheet.Title class="text-xl font-semibold text-[var(--color-text)]">{title}</Sheet.Title>
				{/if}
			</Sheet.Header>
			<div class="flex-1 overflow-y-auto p-6">
				{@render children()}
			</div>
		</Sheet.Content>
	</Sheet.Portal>
</Sheet.Root>
