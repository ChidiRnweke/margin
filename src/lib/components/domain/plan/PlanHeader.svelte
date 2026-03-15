<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		weekLabel: string;
		status: 'draft' | 'confirmed' | 'archived';
		onprev?: () => void;
		onnext?: () => void;
		ongenerate?: () => void;
		onconfirm?: () => void;
	}

	let { weekLabel, status, onprev, onnext, ongenerate, onconfirm }: Props = $props();
</script>

<div class="border-b border-[var(--color-glass-border)] py-4">
	<Stack direction="horizontal" gap="4" align="center" justify="between">
		<Stack direction="horizontal" gap="3" align="center">
			<Button variant="ghost" size="sm" onclick={onprev}>←</Button>
			<Text as="h2" size="xl" weight="semibold">{weekLabel}</Text>
			<Button variant="ghost" size="sm" onclick={onnext}>→</Button>
		</Stack>

		<Stack direction="horizontal" gap="2" align="center">
			{#if status === 'draft'}
				<Button variant="secondary" size="sm" onclick={ongenerate}>Generate plan</Button>
				<Button variant="primary" size="sm" onclick={onconfirm}>Confirm plan</Button>
			{:else if status === 'confirmed'}
				<Badge variant="success">Confirmed</Badge>
			{:else}
				<Badge variant="default">Archived</Badge>
			{/if}
		</Stack>
	</Stack>
</div>
