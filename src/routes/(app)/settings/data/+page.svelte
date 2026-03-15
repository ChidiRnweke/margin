<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import DataPortabilityPanel from '$lib/components/domain/settings/DataPortabilityPanel.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface PageData {
		lastExport: string | null;
		lastImport: string | null;
	}

	let { data }: { data: PageData } = $props();
</script>

<PageHeader title="Data" description="Export or import your data for portability and backups.">
	{#snippet actions()}
		<Button variant="ghost" size="sm" onclick={() => window.location.href = '/settings'}>
			Back to settings
		</Button>
	{/snippet}
</PageHeader>

<div class="data-content">
	<DataPortabilityPanel lastExport={data.lastExport} lastImport={data.lastImport} />
</div>

<style>
	.data-content {
		margin-top: var(--space-6);
		max-width: 40rem;
	}
</style>
