<script lang="ts">
	import TaskListItem from './TaskListItem.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';

	interface Task {
		id: string;
		title: string;
		status: 'Backlog' | 'InProgress' | 'Done' | 'Archived';
		effortMinutes: number;
		remainingMinutes: number;
		aspectName?: string;
		milestoneTitle?: string | null;
		dueDate?: string | null;
		overdue?: boolean;
		hasActiveLock?: boolean;
	}

	interface Props {
		tasks: Task[];
		selectedTaskId: string | null;
		getTaskHref: (id: string) => string;
		getMobileTaskHref: (id: string) => string;
	}

	let { tasks, selectedTaskId, getTaskHref, getMobileTaskHref }: Props = $props();
</script>

<ScrollArea class="h-full">
	<div class="space-y-3 p-4 md:p-5">
		{#if tasks.length === 0}
			<div
				class="rounded-xl border border-dashed border-[var(--color-glass-border)] bg-[var(--color-glass-subtle)] p-2"
			>
				<EmptyState
					title="No tasks match this view"
					description="Try a different filter or create a fresh task to get momentum back."
				/>
			</div>
		{:else}
			{#each tasks as task (task.id)}
				<TaskListItem
					title={task.title}
					status={task.status}
					effortMinutes={task.effortMinutes}
					remainingMinutes={task.remainingMinutes}
					aspectName={task.aspectName}
					milestoneTitle={task.milestoneTitle}
					dueDate={task.dueDate}
					overdue={task.overdue}
					hasActiveLock={task.hasActiveLock}
					selected={task.id === selectedTaskId}
					href={getTaskHref(task.id)}
					mobileHref={getMobileTaskHref(task.id)}
				/>
			{/each}
		{/if}
	</div>
</ScrollArea>
