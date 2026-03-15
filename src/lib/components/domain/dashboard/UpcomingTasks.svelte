<script lang="ts">
	import GlassPanel from '$lib/components/primitives/GlassPanel.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
</script>

<GlassPanel title="Upcoming Tasks">
	<EmptyState
		title="No upcoming tasks"
		description="Tasks due this week will appear here. Create some tasks to get started."
	/>
</GlassPanel>
