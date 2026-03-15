<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import RevisionFeedItem from '$lib/components/domain/plan/RevisionFeedItem.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Revision {
		id: string;
		timestamp: string;
		action: string;
		summary: string;
		author?: string;
	}

	interface PageData {
		revisions: Revision[];
	}

	let { data }: { data: PageData } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Plan History" description="Track how your weekly plans have changed over time.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => window.location.href = '/plan'}>
				Back to plan
			</Button>
		{/snippet}
	</PageHeader>

	{#if data.revisions.length === 0}
		<EmptyState
			title="No plan revisions yet"
			description="Revisions will appear here as you create and modify your weekly plans."
		/>
	{:else}
		<div class="revision-feed">
			<Stack direction="vertical" gap="3">
				{#each data.revisions as revision (revision.id)}
					<RevisionFeedItem
						timestamp={revision.timestamp}
						action={revision.action}
						summary={revision.summary}
						author={revision.author}
					/>
				{/each}
			</Stack>
		</div>
	{/if}
</Stack>

<style>
	.revision-feed {
		border-left: 2px solid var(--color-border-muted);
		padding-left: var(--space-4);
	}
</style>
