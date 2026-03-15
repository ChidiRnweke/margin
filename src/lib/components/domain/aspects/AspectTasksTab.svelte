<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Task {
		id: string;
		title: string;
		status: 'todo' | 'in_progress' | 'done' | 'archived';
		effort: number;
		dueDate?: string;
	}

	interface Props {
		tasks: Task[];
	}

	let { tasks }: Props = $props();
</script>

<Stack gap="4">
	{#if tasks.length === 0}
		<EmptyState
			title="No tasks"
			description="Add tasks to this aspect to start tracking your progress."
		>
			{#snippet action()}
				<Button variant="primary" size="sm">Add task</Button>
			{/snippet}
		</EmptyState>
	{:else}
		{#each tasks as task}
			<a href="/tasks/{task.id}" class="task-link">
				<Card padding="sm">
					<div class="task-row">
						<div class="task-info">
							<Text as="span" size="base" weight="medium">{task.title}</Text>
							{#if task.dueDate}
								<Text as="span" size="xs" color="faint">
									Due {new Date(task.dueDate).toLocaleDateString()}
								</Text>
							{/if}
						</div>
						<div class="task-meta">
							<Text as="span" size="xs" color="faint">{task.effort}h effort</Text>
							<Badge
								variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'accent' : 'default'}
							>
								{task.status.replace('_', ' ')}
							</Badge>
						</div>
					</div>
				</Card>
			</a>
		{/each}
	{/if}
</Stack>

<style>
	.task-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}
	.task-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}
	.task-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.task-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
	}
</style>
