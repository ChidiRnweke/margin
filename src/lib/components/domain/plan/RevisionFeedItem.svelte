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

<div class="revision-item">
	<Card padding="md">
		<Stack direction="horizontal" gap="3" align="center">
			<div class="revision-dot"></div>
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

<style>
	.revision-item {
		position: relative;
		padding-left: var(--space-4);
	}
	.revision-dot {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		background: var(--color-accent);
	}
</style>
