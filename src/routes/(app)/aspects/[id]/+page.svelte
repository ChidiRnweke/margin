<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import AspectOverviewTab from '$lib/components/domain/aspects/AspectOverviewTab.svelte';
	import MilestoneList from '$lib/components/domain/aspects/MilestoneList.svelte';
	import AspectTasksTab from '$lib/components/domain/aspects/AspectTasksTab.svelte';

	let { data } = $props();

	let activeTab = $state<'overview' | 'milestones' | 'tasks'>('overview');
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title={data.aspect.name || 'Aspect Detail'} description={data.aspect.purpose}>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => history.back()}>← Back</Button>
		{/snippet}
	</PageHeader>

	<nav class="tab-bar" role="tablist">
		<button
			class="tab" class:tab-active={activeTab === 'overview'}
			role="tab" aria-selected={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>
			Overview
		</button>
		<button
			class="tab" class:tab-active={activeTab === 'milestones'}
			role="tab" aria-selected={activeTab === 'milestones'}
			onclick={() => (activeTab = 'milestones')}
		>
			Milestones
		</button>
		<button
			class="tab" class:tab-active={activeTab === 'tasks'}
			role="tab" aria-selected={activeTab === 'tasks'}
			onclick={() => (activeTab = 'tasks')}
		>
			Tasks
		</button>
	</nav>

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

<style>
	.tab-bar {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border-muted);
	}
	.tab {
		padding: var(--space-2) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: all var(--duration-fast) var(--easing);
	}
	.tab:hover {
		color: var(--color-text);
	}
	.tab-active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}
</style>
