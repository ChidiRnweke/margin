<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Milestone {
		id: string;
		title: string;
		status: 'open' | 'completed' | 'archived';
		targetDate?: string;
	}

	interface Props {
		milestones: Milestone[];
	}

	let { milestones }: Props = $props();
</script>

<Stack gap="4">
	{#if milestones.length === 0}
		<EmptyState
			title="No milestones"
			description="Break this aspect into milestones to track meaningful progress."
		>
			{#snippet action()}
				<Button variant="primary" size="sm">Add milestone</Button>
			{/snippet}
		</EmptyState>
	{:else}
		{#each milestones as milestone}
			<Card padding="sm">
				<div class="milestone-row">
					<div class="milestone-info">
						<Text as="span" size="base" weight="medium">{milestone.title}</Text>
						{#if milestone.targetDate}
							<Text as="span" size="xs" color="faint">
								Due {new Date(milestone.targetDate).toLocaleDateString()}
							</Text>
						{/if}
					</div>
					<Badge
						variant={milestone.status === 'completed' ? 'success' : milestone.status === 'open' ? 'accent' : 'default'}
					>
						{milestone.status}
					</Badge>
				</div>
			</Card>
		{/each}
	{/if}
</Stack>

<style>
	.milestone-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}
	.milestone-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
</style>
