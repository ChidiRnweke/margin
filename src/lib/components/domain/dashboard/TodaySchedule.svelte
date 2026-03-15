<script lang="ts">
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
</script>

<Panel title="Today's Schedule">
	<EmptyState
		title="Nothing scheduled"
		description="Your schedule for today will appear here once you create a weekly plan."
	/>
</Panel>
