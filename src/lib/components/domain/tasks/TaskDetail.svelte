<script lang="ts">
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Card from '$lib/components/primitives/Card.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';

	interface Props {
		task: {
			id: string;
			title: string;
			description: string | null;
			status: 'Backlog' | 'InProgress' | 'Done' | 'Archived';
			aspectName: string;
			milestoneTitle: string | null;
			effortMinutes: number;
			remainingMinutes: number;
			dueDate?: string | null;
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
			updatedAt: string;
		};
		actionRoot?: string;
		returnTo?: string;
	}

	let { task, actionRoot = '/tasks', returnTo = `/tasks?task=${task.id}` }: Props = $props();

	let statusVariant = $derived(
		(task.status === 'Done'
			? 'success'
			: task.status === 'InProgress'
				? 'accent'
				: task.status === 'Archived'
					? 'destructive'
					: 'default') as 'success' | 'accent' | 'default' | 'destructive'
	);
	let progressValue = $derived(
		task.effortMinutes <= 0
			? 0
			: Math.max(
					0,
					Math.min(100, ((task.effortMinutes - task.remainingMinutes) / task.effortMinutes) * 100)
				)
	);
	let reminderOpen = $state(false);
	let allocationOpen = $state(false);

	$effect(() => {
		if (task.pendingReminders.length > 0 && !reminderOpen) {
			reminderOpen = true;
		}
	});

	$effect(() => {
		if (task.recentAllocations.length > 0 && !allocationOpen) {
			allocationOpen = true;
		}
	});
</script>

<div class="space-y-6 p-5 md:p-8">
	<Card padding="lg" class="overflow-hidden">
		<div class="space-y-6">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div class="space-y-3">
					<div class="flex flex-wrap items-center gap-2">
						<Badge variant={statusVariant}>{task.status}</Badge>
						<Badge variant="default">{task.aspectName}</Badge>
						{#if task.milestoneTitle}
							<Badge variant="default">{task.milestoneTitle}</Badge>
						{/if}
						{#if task.overdue}
							<Badge variant="warning">Overdue</Badge>
						{/if}
						{#if task.hasActiveLock}
							<Badge variant="accent">Locked</Badge>
						{/if}
					</div>

					<div class="space-y-2">
						<Text as="h2" size="3xl" weight="bold" tracking="tight">{task.title}</Text>
						<Text as="p" color="muted">
							{task.description ??
								'No description yet. Add context so this task stays clear when the week gets crowded.'}
						</Text>
					</div>
				</div>

				<div class="flex flex-wrap gap-2">
					{#if task.status === 'Backlog'}
						<form method="POST" action={`${actionRoot}?/start`}>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="version" value={task.version} />
							<input type="hidden" name="returnTo" value={returnTo} />
							<Button type="submit">Start task</Button>
						</form>
					{:else if task.status === 'InProgress'}
						<form method="POST" action={`${actionRoot}?/complete`}>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="version" value={task.version} />
							<input type="hidden" name="returnTo" value={returnTo} />
							<Button type="submit">Complete task</Button>
						</form>
					{:else if task.status === 'Done'}
						<form method="POST" action={`${actionRoot}?/reopen`}>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="version" value={task.version} />
							<input type="hidden" name="returnTo" value={returnTo} />
							<Button type="submit" variant="secondary">Reopen</Button>
						</form>
					{:else if task.status === 'Archived'}
						<form method="POST" action={`${actionRoot}?/restore`}>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="version" value={task.version} />
							<input type="hidden" name="returnTo" value={returnTo} />
							<Button type="submit" variant="secondary">Restore</Button>
						</form>
					{/if}

					{#if task.status !== 'Archived'}
						<form method="POST" action={`${actionRoot}?/archive`}>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="version" value={task.version} />
							<input type="hidden" name="returnTo" value={returnTo} />
							<Button type="submit" variant="ghost">Archive</Button>
						</form>
					{/if}
				</div>
			</div>

			<div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
				<div
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-5 backdrop-blur-sm"
				>
					<div class="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
						<span>Progress</span>
						<span>{task.remainingMinutes}m left of {task.effortMinutes}m</span>
					</div>
					<Progress
						value={progressValue}
						class="mt-3 h-2.5 bg-[var(--color-glass-border)] [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-strong))]"
					/>
					<div class="mt-5 grid gap-4 sm:grid-cols-3">
						<div>
							<Text as="span" size="xs" color="faint" tracking="wide">Importance</Text>
							<Text as="p" size="lg" weight="semibold">{task.importanceScore}/100</Text>
						</div>
						<div>
							<Text as="span" size="xs" color="faint" tracking="wide">Due date</Text>
							<Text as="p" size="lg" weight="semibold">
								{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
							</Text>
						</div>
						<div>
							<Text as="span" size="xs" color="faint" tracking="wide">Updated</Text>
							<Text as="p" size="lg" weight="semibold">
								{new Date(task.updatedAt).toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric'
								})}
							</Text>
						</div>
					</div>
				</div>

				<div
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] p-5 backdrop-blur-sm"
				>
					<Text as="span" size="xs" color="faint" tracking="wide">Workspace notes</Text>
					<div class="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
						<p>
							{task.recurringTaskSeriesId
								? 'This task belongs to a recurring series.'
								: 'This is a one-off task.'}
						</p>
						<p>
							{task.hasActiveLock
								? (task.activeLockReason ?? 'This task is locked into the plan right now.')
								: 'This task can still move around your plan.'}
						</p>
					</div>
				</div>
			</div>

			<Separator class="bg-[var(--color-glass-border)]" />

			<div class="grid gap-4 xl:grid-cols-2">
				<Collapsible.Root
					bind:open={reminderOpen}
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] p-5 backdrop-blur-sm"
				>
					<div class="flex items-center justify-between gap-3">
						<div>
							<Text as="h3" size="lg" weight="semibold">Reminders</Text>
							<Text as="p" size="sm" color="muted"
								>Pending nudges and delivery channels for this task.</Text
							>
						</div>
						<Button variant="ghost" size="sm" onclick={() => (reminderOpen = !reminderOpen)}>
							{reminderOpen ? 'Hide' : 'Show'}
						</Button>
					</div>

					<Collapsible.Content class="pt-4">
						{#if task.pendingReminders.length === 0}
							<Text as="p" size="sm" color="muted">No reminders are scheduled yet.</Text>
						{:else}
							<div class="space-y-3">
								{#each task.pendingReminders as reminder (reminder.id)}
									<div
										class="glass-surface rounded-lg border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-4 backdrop-blur-sm"
									>
										<div class="flex items-center justify-between gap-3">
											<Text as="p" size="sm" weight="semibold"
												>{new Date(reminder.remindAtUtc).toLocaleString()}</Text
											>
											<Badge variant="accent">{reminder.channel}</Badge>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Collapsible.Content>
				</Collapsible.Root>

				<Collapsible.Root
					bind:open={allocationOpen}
					class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] p-5 backdrop-blur-sm"
				>
					<div class="flex items-center justify-between gap-3">
						<div>
							<Text as="h3" size="lg" weight="semibold">Recent allocations</Text>
							<Text as="p" size="sm" color="muted"
								>Latest planning slots this task has occupied.</Text
							>
						</div>
						<Button variant="ghost" size="sm" onclick={() => (allocationOpen = !allocationOpen)}>
							{allocationOpen ? 'Hide' : 'Show'}
						</Button>
					</div>

					<Collapsible.Content class="pt-4">
						{#if task.recentAllocations.length === 0}
							<Text as="p" size="sm" color="muted"
								>This task has not been scheduled into a plan yet.</Text
							>
						{:else}
							<div class="space-y-3">
								{#each task.recentAllocations as allocation (allocation.id)}
									<div
										class="glass-surface rounded-lg border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-4 backdrop-blur-sm"
									>
										<div class="flex items-center justify-between gap-3">
											<div>
												<Text as="p" size="sm" weight="semibold"
													>{new Date(allocation.scheduledStartUtc).toLocaleString()}</Text
												>
												<Text as="p" size="sm" color="muted"
													>{allocation.allocatedMinutes} minutes allocated</Text
												>
											</div>
											<Badge variant="default">{allocation.status}</Badge>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Collapsible.Content>
				</Collapsible.Root>
			</div>
		</div>
	</Card>
</div>
