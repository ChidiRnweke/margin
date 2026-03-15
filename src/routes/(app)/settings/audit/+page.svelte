<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
	import AuditFeedItem from '$lib/components/domain/settings/AuditFeedItem.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface AuditEvent {
		id: string;
		timestamp: string;
		action: string;
		entity: string;
		entityId: string;
		diff?: { field: string; before: string; after: string }[];
		actor?: string;
	}

	interface PageData {
		events: AuditEvent[];
	}

	let { data }: { data: PageData } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Audit Log" description="A chronological record of all changes to your account.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => window.location.href = '/settings'}>
				Back to settings
			</Button>
		{/snippet}
	</PageHeader>

	{#if data.events.length === 0}
		<EmptyState
			title="No audit events yet"
			description="Actions you take will be logged here for transparency and accountability."
		/>
	{:else}
		<Stack direction="vertical" gap="3">
			{#each data.events as event (event.id)}
				<AuditFeedItem
					timestamp={event.timestamp}
					action={event.action}
					entity={event.entity}
					entityId={event.entityId}
					diff={event.diff}
					actor={event.actor}
				/>
			{/each}
		</Stack>
	{/if}
</Stack>
