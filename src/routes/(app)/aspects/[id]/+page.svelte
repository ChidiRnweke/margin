<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import AspectOverviewTab from '$lib/components/domain/aspects/AspectOverviewTab.svelte';
	import MilestoneList from '$lib/components/domain/aspects/MilestoneList.svelte';
	import AspectTasksTab from '$lib/components/domain/aspects/AspectTasksTab.svelte';
	import { cn } from '$lib/utils.js';

	let { data } = $props();

	let activeTab = $state<'overview' | 'milestones' | 'tasks'>('overview');

	const tabs = [
		{ key: 'overview' as const, label: 'Overview' },
		{ key: 'milestones' as const, label: 'Milestones' },
		{ key: 'tasks' as const, label: 'Tasks' }
	];
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title={data.aspect.name || 'Aspect Detail'} description={data.aspect.purpose}>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => history.back()}>← Back</Button>
		{/snippet}
	</PageHeader>

	<div class="flex gap-1 border-b border-[var(--color-glass-border)]" role="tablist">
		{#each tabs as tab}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === tab.key}
				onclick={() => (activeTab = tab.key)}
				class={cn(
					'cursor-pointer border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]',
					activeTab === tab.key && 'border-b-[var(--color-accent)] text-[var(--color-accent)]'
				)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div role="tabpanel">
		{#if activeTab === 'overview'}
			<AspectOverviewTab
				name={data.aspect.name}
				purpose={data.aspect.purpose}
				targetPercentage={data.aspect.targetPercentage}
				color={data.aspect.color}
				status={data.aspect.status}
				taskCount={data.aspect.taskCount}
				milestoneCount={data.aspect.milestoneCount}
			/>
		{:else if activeTab === 'milestones'}
			<MilestoneList milestones={data.milestones} />
		{:else if activeTab === 'tasks'}
			<AspectTasksTab tasks={data.tasks} />
		{/if}
	</div>
</Stack>
