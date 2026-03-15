<script lang="ts">
	import TaskListItem from './TaskListItem.svelte';

	interface Task {
		id: string;
		title: string;
		status: 'todo' | 'in_progress' | 'done' | 'archived';
		effort: number;
		aspectName?: string;
		aspectColor?: string;
		dueDate?: string | null;
	}

	interface Props {
		tasks: Task[];
		selectedTaskId: string | null;
		onselect: (id: string) => void;
	}

	let { tasks, selectedTaskId, onselect }: Props = $props();
</script>

<div class="task-list" role="listbox">
	{#each tasks as task}
		<TaskListItem
			id={task.id}
			title={task.title}
			status={task.status}
			effort={task.effort}
			aspectName={task.aspectName}
			aspectColor={task.aspectColor}
			dueDate={task.dueDate}
			selected={task.id === selectedTaskId}
			onclick={() => onselect(task.id)}
		/>
	{/each}
</div>

<style>
	.task-list {
		display: flex;
		flex-direction: column;
	}
</style>
