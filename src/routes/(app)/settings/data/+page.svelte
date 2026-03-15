<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import DataPortabilityPanel from '$lib/components/domain/settings/DataPortabilityPanel.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface PageData {
		lastExport: string | null;
		lastImport: string | null;
	}

	let { data }: { data: PageData } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Data" description="Export or import your data for portability and backups.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => (window.location.href = '/settings')}>
				Back to settings
			</Button>
		{/snippet}
	</PageHeader>

	<div class="max-w-2xl">
		<DataPortabilityPanel lastExport={data.lastExport} lastImport={data.lastImport} />
	</div>
</Stack>
