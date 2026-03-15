<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';

	interface Props {
		title: string;
		aspect?: string;
		duration: number;
		day: string;
		time: string;
		outcome?: 'done' | 'skipped' | 'partial' | null;
		open?: boolean;
		onmarkdone?: () => void;
		onmarkskipped?: () => void;
		onclose?: () => void;
	}

	let {
		title,
		aspect,
		duration,
		day,
		time,
		outcome = null,
		open = false,
		onmarkdone,
		onmarkskipped,
		onclose
	}: Props = $props();
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && onclose?.()}>
	<Dialog.Content
		class="shadow-glass-lg max-w-sm rounded-xl border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] backdrop-blur-lg"
	>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			{#if aspect}
				<Dialog.Description>{aspect}</Dialog.Description>
			{/if}
		</Dialog.Header>

		<Stack direction="horizontal" gap="4">
			<Text size="sm" color="muted">{day}</Text>
			<Text size="sm" color="muted">{time}</Text>
			<Text size="sm" color="muted">{duration}h</Text>
		</Stack>

		{#if outcome}
			<Badge
				variant={outcome === 'done' ? 'success' : outcome === 'skipped' ? 'destructive' : 'warning'}
			>
				{outcome}
			</Badge>
		{/if}

		<Stack direction="horizontal" gap="2">
			<Button variant="primary" size="sm" onclick={onmarkdone}>Mark done</Button>
			<Button variant="ghost" size="sm" onclick={onmarkskipped}>Skip</Button>
		</Stack>
	</Dialog.Content>
</Dialog.Root>
