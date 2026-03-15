<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		timestamp: string;
		action: string;
		summary: string;
		author?: string;
	}

	let { timestamp, action, summary, author }: Props = $props();
</script>

<div class="relative pl-4">
	<Card padding="md">
		<Stack direction="horizontal" gap="3" align="center">
			<div
				class="absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]"
			></div>
			<Stack direction="vertical" gap="1">
				<Stack direction="horizontal" gap="2" align="center">
					<Badge variant="default" size="sm">{action}</Badge>
					<Text size="xs" color="faint">{timestamp}</Text>
				</Stack>
				<Text size="sm">{summary}</Text>
				{#if author}
					<Text size="xs" color="muted">by {author}</Text>
				{/if}
			</Stack>
		</Stack>
	</Card>
</div>
