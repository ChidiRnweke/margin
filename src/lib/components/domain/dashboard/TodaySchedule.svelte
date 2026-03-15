<script lang="ts">
	import GlassPanel from '$lib/components/primitives/GlassPanel.svelte';
	import EmptyState from '$lib/components/layout/EmptyState.svelte';
</script>

<GlassPanel title="Today's Schedule">
	<EmptyState
		title="Nothing scheduled"
		description="Your schedule for today will appear here once you create a weekly plan."
	/>
</GlassPanel>
