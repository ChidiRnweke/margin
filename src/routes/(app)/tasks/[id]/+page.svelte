<script lang="ts">
	import TaskDetail from '$lib/components/domain/tasks/TaskDetail.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Props {
		data: {
			task: {
				id: string;
				title: string;
				description: string | null;
				status: 'Backlog' | 'InProgress' | 'Done' | 'Archived';
				aspectName: string;
				milestoneTitle: string | null;
				effortMinutes: number;
				remainingMinutes: number;
				dueDate: string | null;
				importanceScore: number;
				overdue: boolean;
				hasActiveLock: boolean;
				activeLockReason: string | null;
				recurringTaskSeriesId: string | null;
				pendingReminders: Array<{ id: string; remindAtUtc: string; channel: string }>;
				recentAllocations: Array<{
					id: string;
					scheduledStartUtc: string;
					scheduledEndUtc: string;
					allocatedMinutes: number;
					status: string;
				}>;
				version: number;
				createdAt: string;
				updatedAt: string;
			};
			returnTo: string;
		};
	}

	let { data }: Props = $props();
</script>

<div class="space-y-5">
	<section
		class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] px-5 py-6 shadow-glass backdrop-blur-md sm:px-7"
	>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<p class="text-xs tracking-[0.22em] text-[var(--color-text-faint)] uppercase">
					Mobile Drill Down
				</p>
				<h1
					class="mt-2 font-display text-3xl font-bold tracking-[-0.05em] text-[var(--color-text)]"
				>
					{data.task.title}
				</h1>
			</div>
			<Button href={data.returnTo} variant="secondary">Back to tasks</Button>
		</div>
	</section>

	<TaskDetail task={data.task} actionRoot="/tasks" returnTo={data.returnTo} />
</div>
