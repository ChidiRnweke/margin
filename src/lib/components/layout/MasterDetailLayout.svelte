<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	interface Props {
		master: Snippet;
		detail?: Snippet;
		masterWidth?: number;
	}

	let { master, detail, masterWidth = 32 }: Props = $props();
</script>

<div
	class="hidden min-h-[42rem] overflow-hidden rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] shadow-glass backdrop-blur-md md:block"
>
	<Resizable.PaneGroup direction="horizontal" class="h-full min-h-[42rem]">
		<Resizable.Pane defaultSize={masterWidth} minSize={24} maxSize={40} class="min-h-[42rem]">
			<ScrollArea class="h-full bg-[var(--color-glass-subtle)]">
				<div class="min-h-full">{@render master()}</div>
			</ScrollArea>
		</Resizable.Pane>

		<Resizable.Handle withHandle class="bg-[var(--color-glass-border)]" />

		<Resizable.Pane defaultSize={100 - masterWidth}>
			<ScrollArea class="h-full bg-[var(--color-glass)]">
				{#if detail}
					<div class="min-h-full">{@render detail()}</div>
				{:else}
					<div
						class="flex min-h-[42rem] items-center justify-center px-8 text-sm text-[var(--color-text-muted)]"
					>
						Select an item to view details.
					</div>
				{/if}
			</ScrollArea>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>

<div class="md:hidden">
	{@render master()}
</div>
