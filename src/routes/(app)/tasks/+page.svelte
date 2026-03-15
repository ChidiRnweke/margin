<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import MasterDetailLayout from '$lib/components/layout/MasterDetailLayout.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import TaskList from '$lib/components/domain/tasks/TaskList.svelte';
	import BulkActionToolbar from '$lib/components/domain/tasks/BulkActionToolbar.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	let { data } = $props();

	let selectedTaskId = $state<string | null>(null);
	let selectedIds = $state<string[]>([]);

	let selectedTask = $derived(
		data.tasks.find((t: { id: string; title: string; description: string }) => t.id === selectedTaskId) ?? null
	);
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Tasks" description="All your tasks across every aspect.">
		{#snippet actions()}
			<Button variant="primary" size="sm">+ New Task</Button>
		{/snippet}
	</PageHeader>

	{#if selectedIds.length > 0}
		<BulkActionToolbar count={selectedIds.length} ondeselect={() => (selectedIds = [])} />
	{/if}

	{#if data.tasks.length === 0}
		<EmptyState
			title="No tasks yet"
			description="Create tasks to start tracking the work that moves your aspects forward."
		>
			{#snippet action()}
				<Button variant="primary">Create your first task</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<MasterDetailLayout masterWidth="22rem">
			{#snippet master()}
				<TaskList
					tasks={data.tasks}
					{selectedTaskId}
					onselect={(id) => (selectedTaskId = id)}
				/>
			{/snippet}
			{#snippet detail()}
				{#if selectedTask}
					<div class="detail-content">
						<h2>{selectedTask.title}</h2>
						<p>{selectedTask.description ?? 'No description'}</p>
					</div>
				{:else}
					<EmptyState
						title="Select a task"
						description="Choose a task from the list to view its details."
					/>
				{/if}
			{/snippet}
		</MasterDetailLayout>
	{/if}
</Stack>

<style>
	.detail-content {
		padding: var(--space-4);
	}
</style>
