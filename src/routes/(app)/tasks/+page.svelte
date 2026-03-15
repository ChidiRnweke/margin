<script lang="ts">
	import MasterDetailLayout from '$lib/components/layout/MasterDetailLayout.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import TaskComposerDialog from '$lib/components/domain/tasks/TaskComposerDialog.svelte';
	import TaskDetail from '$lib/components/domain/tasks/TaskDetail.svelte';
	import TaskList from '$lib/components/domain/tasks/TaskList.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';

	interface TaskListItem {
		id: string;
		title: string;
		status: 'Backlog' | 'InProgress' | 'Done' | 'Archived';
		effortMinutes: number;
		remainingMinutes: number;
		aspectName: string;
		milestoneTitle: string | null;
		dueDate: string | null;
		overdue: boolean;
		hasActiveLock: boolean;
	}

	interface TaskDetailData {
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
	}

	interface AspectOption {
		id: string;
		name: string;
		status: string;
		targetPercentage: number | null;
	}

	interface Props {
		data: {
			tasks: TaskListItem[];
			aspects: AspectOption[];
			selectedTask: TaskDetailData | null;
			selectedTaskId: string | null;
			filters: { query: string; show: 'active' | 'all' };
		};
		form?: { action?: string; error?: string } | null;
	}

	let { data, form }: Props = $props();

	function buildSearchParams(next: Record<string, string | null>) {
		const query = next.q ?? data.filters.query;
		const show = next.show ?? data.filters.show;
		const task = next.task ?? data.selectedTaskId;

		return [
			query ? `q=${encodeURIComponent(query)}` : null,
			show && show !== 'active' ? `show=${encodeURIComponent(show)}` : null,
			task ? `task=${encodeURIComponent(task)}` : null
		]
			.filter(Boolean)
			.join('&');
	}

	function getTaskHref(taskId: string) {
		const params = buildSearchParams({ task: taskId });
		return params ? `/tasks?${params}` : '/tasks';
	}

	function getMobileTaskHref(taskId: string) {
		return `/tasks/${taskId}`;
	}

	const currentReturnTo = (() => {
		const params = buildSearchParams({ task: data.selectedTaskId });
		return params ? `/tasks?${params}` : '/tasks';
	})();
</script>

<div class="relative isolate space-y-6 overflow-hidden">
	<section
		class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] px-5 py-6 shadow-glass backdrop-blur-md sm:px-7 lg:px-8 lg:py-8"
	>
		<div class="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
			<div class="max-w-3xl space-y-4">
				<p
					class="font-body text-xs font-semibold tracking-[0.24em] text-[var(--color-text-faint)] uppercase"
				>
					Flagship Workspace
				</p>
				<div class="space-y-3">
					<h1
						class="font-display text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
					>
						Tasks that actually feel alive.
					</h1>
					<p class="max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
						Master-detail on desktop, drill-down on mobile, real SvelteKit actions for mutations,
						and enough glass to feel like the command center instead of a placeholder.
					</p>
				</div>
			</div>

			<div class="grid gap-3 sm:grid-cols-3 xl:min-w-[24rem]">
				<div
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] px-4 py-4 shadow-glass-sm backdrop-blur-sm"
				>
					<p class="text-xs tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
						Visible tasks
					</p>
					<p
						class="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--color-text)]"
					>
						{data.tasks.length}
					</p>
				</div>
				<div
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] px-4 py-4 shadow-glass-sm backdrop-blur-sm"
				>
					<p class="text-xs tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
						Active aspects
					</p>
					<p
						class="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--color-text)]"
					>
						{data.aspects.length}
					</p>
				</div>
				<div
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] px-4 py-4 shadow-glass-sm backdrop-blur-sm"
				>
					<p class="text-xs tracking-[0.18em] text-[var(--color-text-faint)] uppercase">Mode</p>
					<p
						class="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--color-text)]"
					>
						{data.filters.show === 'all' ? 'All' : 'Focused'}
					</p>
				</div>
			</div>
		</div>
	</section>

	<section
		class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] p-4 shadow-glass backdrop-blur-md sm:p-5"
	>
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<form
				method="GET"
				class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:min-w-[28rem]"
			>
				<input type="hidden" name="show" value={data.filters.show} />
				<Input
					type="search"
					name="q"
					label="Search tasks"
					placeholder="Search by title..."
					value={data.filters.query}
				/>
				<Button type="submit" variant="secondary">Filter</Button>
			</form>

			<div class="flex flex-wrap items-center gap-3">
				<Button
					href={`/tasks?${buildSearchParams({ show: 'active', task: null })}`}
					variant={data.filters.show === 'active' ? 'primary' : 'secondary'}
					size="sm">Active</Button
				>
				<Button
					href={`/tasks?${buildSearchParams({ show: 'all', task: null })}`}
					variant={data.filters.show === 'all' ? 'primary' : 'secondary'}
					size="sm">All</Button
				>
				<TaskComposerDialog
					aspects={data.aspects}
					returnTo={currentReturnTo}
					error={form?.action === 'create' ? form?.error : null}
				/>
			</div>
		</div>
	</section>

	{#if data.tasks.length === 0}
		<section
			class="glass-surface rounded-xl border border-dashed border-[var(--color-glass-border)] bg-[var(--color-glass-subtle)] p-4 backdrop-blur-sm sm:p-6"
		>
			<EmptyState
				title="No tasks in this slice"
				description="Create the first task or broaden the filters. The workspace is wired up now - it just needs something meaningful to work on."
			/>
		</section>
	{:else}
		<MasterDetailLayout masterWidth={34}>
			{#snippet master()}
				<TaskList
					tasks={data.tasks}
					selectedTaskId={data.selectedTaskId}
					{getTaskHref}
					{getMobileTaskHref}
				/>
			{/snippet}

			{#snippet detail()}
				{#if data.selectedTask}
					<TaskDetail task={data.selectedTask} returnTo={currentReturnTo} />
				{:else}
					<div class="flex min-h-[42rem] items-center justify-center p-8">
						<EmptyState
							title="Choose a task"
							description="Pick something from the left and the detail pane stays hot while the rest of the workspace keeps its place."
						/>
					</div>
				{/if}
			{/snippet}
		</MasterDetailLayout>
	{/if}
</div>
