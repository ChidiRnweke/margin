<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import DashboardGrid from '$lib/components/layout/DashboardGrid.svelte';
	import KpiCard from '$lib/components/domain/dashboard/KpiCard.svelte';
	import TodaySchedule from '$lib/components/domain/dashboard/TodaySchedule.svelte';
	import UpcomingTasks from '$lib/components/domain/dashboard/UpcomingTasks.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	let { data } = $props();
</script>

<Stack direction="vertical" gap="8">
	<PageHeader
		title="Dashboard"
		description="Your weekly overview at a glance."
	/>

	<DashboardGrid columns={4} minWidth="200px" gap="6">
		<KpiCard label="Active Aspects" value={data.stats.activeAspects} total={data.stats.totalAspects} />
		<KpiCard label="Tasks in Progress" value={data.stats.tasksInProgress} variant="accent" />
		<KpiCard label="Tasks Done" value={data.stats.tasksDone} variant="success" />
		<KpiCard label="Overdue" value={data.stats.overdueTasks} variant="destructive" />
	</DashboardGrid>

	<div class="dashboard-panels">
		<TodaySchedule />
		<UpcomingTasks />
	</div>
</Stack>

<style>
	.dashboard-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}
	@media (max-width: 768px) {
		.dashboard-panels {
			grid-template-columns: 1fr;
		}
	}
</style>
