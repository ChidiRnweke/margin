<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import PlanHeader from '$lib/components/domain/plan/PlanHeader.svelte';
	import TimelineGrid from '$lib/components/domain/plan/TimelineGrid.svelte';
	import AvailabilityLane from '$lib/components/domain/plan/AvailabilityLane.svelte';
	import AllocationBlock from '$lib/components/domain/plan/AllocationBlock.svelte';
	import AllocationPopover from '$lib/components/domain/plan/AllocationPopover.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Allocation {
		title: string;
		aspect: string;
		aspectColor: string;
		startHour: number;
		duration: number;
		dayIndex: number;
		day: string;
		time: string;
		outcome: 'done' | 'skipped' | 'partial' | null;
	}

	interface AvailabilityWindow {
		dayIndex: number;
		startHour: number;
		endHour: number;
	}

	interface PageData {
		weekStart: string;
		allocations: Allocation[];
		availability: AvailabilityWindow[];
		status: 'draft' | 'confirmed' | 'archived';
	}

	let { data }: { data: PageData } = $props();

	let selectedAllocation = $state<number | null>(null);

	let weekLabel = $derived(() => {
		const d = new Date(data.weekStart);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	});
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Weekly Plan" description="Plan and track your time allocations across the week.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => window.location.href = '/plan/history'}>
				History
			</Button>
		{/snippet}
	</PageHeader>

	<PlanHeader
		weekLabel={weekLabel()}
		status={data.status}
	/>

	{#if data.allocations.length === 0}
		<EmptyState
			title="No allocations yet"
			description="Generate a plan or manually add time blocks to get started."
		>
			{#snippet action()}
				<Button variant="primary">Generate plan</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="plan-timeline-wrapper">
			<TimelineGrid>
				<AvailabilityLane windows={data.availability} />
				{#each data.allocations as alloc, i}
					<AllocationBlock
						title={alloc.title}
						aspectColor={alloc.aspectColor}
						startHour={alloc.startHour}
						duration={alloc.duration}
						dayIndex={alloc.dayIndex}
						outcome={alloc.outcome}
						onclick={() => selectedAllocation = i}
					/>
				{/each}
			</TimelineGrid>

			{#if selectedAllocation !== null}
				{@const alloc = data.allocations[selectedAllocation]}
				<AllocationPopover
					title={alloc.title}
					aspect={alloc.aspect}
					duration={alloc.duration}
					day={alloc.day}
					time={alloc.time}
					outcome={alloc.outcome}
					open={true}
					onmarkdone={() => selectedAllocation = null}
					onmarkskipped={() => selectedAllocation = null}
					onclose={() => selectedAllocation = null}
				/>
			{/if}
		</div>
	{/if}
</Stack>

<style>
	.plan-timeline-wrapper {
		position: relative;
		overflow-x: auto;
	}
</style>
