<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import AvailabilityGrid from '$lib/components/domain/availability/AvailabilityGrid.svelte';
	import AvailabilityBlockList from '$lib/components/domain/availability/AvailabilityBlockList.svelte';
	import AvailabilityEditor from '$lib/components/domain/availability/AvailabilityEditor.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface AvailabilityBlock {
		id: string;
		dayIndex: number;
		startHour: number;
		endHour: number;
		label?: string;
	}

	interface PageData {
		blocks: AvailabilityBlock[];
	}

	let { data }: { data: PageData } = $props();

	let editorOpen = $state(false);
	let editingBlockId = $state<string | null>(null);

	function handleSlotClick(dayIndex: number, hour: number) {
		editingBlockId = null;
		editorOpen = true;
	}

	function handleEditBlock(id: string) {
		editingBlockId = id;
		editorOpen = true;
	}

	function handleSave() {
		editorOpen = false;
		editingBlockId = null;
	}
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Availability" description="Define when you're available for scheduled tasks.">
		{#snippet actions()}
			<Button variant="primary" size="sm" onclick={() => { editingBlockId = null; editorOpen = true; }}>
				Add block
			</Button>
		{/snippet}
	</PageHeader>

	<AvailabilityGrid blocks={data.blocks} onslotclick={handleSlotClick} />
	<AvailabilityBlockList blocks={data.blocks} onedit={handleEditBlock} />
	<AvailabilityEditor open={editorOpen} onsave={handleSave} oncancel={() => editorOpen = false} />
</Stack>
