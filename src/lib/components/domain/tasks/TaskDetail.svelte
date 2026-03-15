<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import EffortBar from './EffortBar.svelte';

	interface Props {
		title: string;
		description: string;
		status: 'todo' | 'in_progress' | 'done' | 'archived';
		effort: number;
		aspectName: string;
		dueDate?: string | null;
		tags: string[];
	}

	let { title, description, status, effort, aspectName, dueDate, tags }: Props = $props();

	let statusVariant = $derived(
		(status === 'done' ? 'success' : status === 'in_progress' ? 'accent' : 'default') as 'success' | 'accent' | 'default'
	);
</script>

<Stack gap="6">
	<Card padding="md">
		<Stack gap="4">
			<div class="detail-header">
				<Text as="h2" size="xl" weight="semibold">{title}</Text>
				<Badge variant={statusVariant}>{status.replace('_', ' ')}</Badge>
			</div>

			{#if description}
				<Text as="p" color="muted">{description}</Text>
			{:else}
				<Text as="p" color="faint">No description provided.</Text>
			{/if}

			<div class="detail-meta">
				{#if aspectName}
					<div class="meta-item">
						<Text as="span" size="xs" color="faint" tracking="wide">ASPECT</Text>
						<Text as="span" size="sm" weight="medium">{aspectName}</Text>
					</div>
				{/if}
				<div class="meta-item">
					<Text as="span" size="xs" color="faint" tracking="wide">EFFORT</Text>
					<EffortBar value={effort} max={8} />
					<Text as="span" size="sm">{effort}h</Text>
				</div>
				{#if dueDate}
					<div class="meta-item">
						<Text as="span" size="xs" color="faint" tracking="wide">DUE</Text>
						<Text as="span" size="sm" weight="medium">
							{new Date(dueDate).toLocaleDateString()}
						</Text>
					</div>
				{/if}
			</div>

			{#if tags.length > 0}
				<div class="detail-tags">
					{#each tags as tag}
						<Badge variant="default">{tag}</Badge>
					{/each}
				</div>
			{/if}
		</Stack>
	</Card>
</Stack>

<style>
	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}
	.detail-meta {
		display: flex;
		gap: var(--space-6);
		flex-wrap: wrap;
		padding: var(--space-4) 0;
		border-top: 1px solid var(--color-border-muted);
	}
	.meta-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.detail-tags {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
</style>
