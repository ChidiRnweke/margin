<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		id: string;
		name: string;
		purpose: string;
		targetPercentage: number;
		color: string;
		status: 'active' | 'paused' | 'archived';
		taskCount: number;
	}

	let { id, name, purpose, targetPercentage, color, status, taskCount }: Props = $props();

	let statusVariant = $derived(
		(status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default') as 'success' | 'warning' | 'default'
	);
</script>

<a href="/aspects/{id}" class="aspect-card-link">
	<Card padding="md" shadow="sm">
		<Stack gap="3">
			<div class="aspect-header">
				<div class="aspect-color-dot" style="background: {color}"></div>
				<Text as="h3" size="xl" weight="semibold">{name}</Text>
			</div>
			<Text as="p" size="sm" color="muted">{purpose}</Text>
			<div class="aspect-meta">
				<Badge variant={statusVariant}>{status}</Badge>
				<Text as="span" size="xs" color="faint">{targetPercentage}% target</Text>
				<Text as="span" size="xs" color="faint">{taskCount} tasks</Text>
			</div>
		</Stack>
	</Card>
</a>

<style>
	.aspect-card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		transition: transform var(--duration-fast) var(--easing);
	}
	.aspect-card-link:hover {
		transform: translateY(-2px);
	}
	.aspect-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.aspect-color-dot {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}
	.aspect-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
</style>
