<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';

	interface Props {
		open: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
	}

	let {
		open = $bindable(),
		onconfirm,
		oncancel,
		title = 'Are you sure?',
		message = 'This action cannot be undone.',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel'
	}: Props = $props();

	function confirm() {
		open = false;
		onconfirm?.();
	}

	function cancel() {
		open = false;
		oncancel?.();
	}

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) cancel();
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="motion-safe:animate-in motion-safe:fade-in fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-6 shadow-glass backdrop-blur-lg"
		>
			<Dialog.Title class="mb-2 text-xl font-semibold text-[var(--color-text)]"
				>{title}</Dialog.Title
			>
			<Text as="p" size="base" color="muted" class="mb-6">{message}</Text>
			<div class="flex justify-end gap-3">
				<Button variant="secondary" onclick={cancel}>{cancelLabel}</Button>
				<Button variant="destructive" onclick={confirm}>{confirmLabel}</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
