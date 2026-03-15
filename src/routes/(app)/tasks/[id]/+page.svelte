<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import TaskDetail from '$lib/components/domain/tasks/TaskDetail.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	let { data } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title={data.task.title || 'Task Detail'}>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => history.back()}>← Back</Button>
		{/snippet}
	</PageHeader>

	<TaskDetail
		title={data.task.title}
		description={data.task.description}
		status={data.task.status}
		effort={data.task.effort}
		aspectName={data.task.aspectName}
		dueDate={data.task.dueDate}
		tags={data.task.tags}
	/>
</Stack>
