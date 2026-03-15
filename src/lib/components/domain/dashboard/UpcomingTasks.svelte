<script lang="ts">
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
</script>

<Panel title="Upcoming Tasks">
	<EmptyState
		title="No upcoming tasks"
		description="Tasks due this week will appear here. Create some tasks to get started."
	/>
</Panel>
