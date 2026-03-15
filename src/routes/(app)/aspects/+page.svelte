<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import DashboardGrid from '$lib/components/layout/DashboardGrid.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import AspectCard from '$lib/components/domain/aspects/AspectCard.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	let { data } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Aspects" description="Life areas you want to balance and nurture.">
		{#snippet actions()}
			<Button variant="primary" size="sm">+ New Aspect</Button>
		{/snippet}
	</PageHeader>

	{#if data.aspects.length === 0}
		<EmptyState
			title="No aspects yet"
			description="Aspects represent the key areas of your life — like Health, Career, or Relationships. Create your first one to get started."
		>
			{#snippet action()}
				<Button variant="primary">Create your first aspect</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<DashboardGrid columns={3} minWidth="280px" gap="6">
			{#each data.aspects as aspect}
				<AspectCard
					id={aspect.id}
					name={aspect.name}
					purpose={aspect.purpose}
					targetPercentage={aspect.targetPercentage}
					color={aspect.color}
					status={aspect.status}
					taskCount={aspect.taskCount}
				/>
			{/each}
		</DashboardGrid>
	{/if}
</Stack>
