<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import PrimButton from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';

	interface Props {
		lastExport: string | null;
		lastImport: string | null;
		onexport?: () => void;
		onimport?: (file: File) => void;
	}

	let { lastExport, lastImport, onexport, onimport }: Props = $props();

	let importStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

	function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			importStatus = 'loading';
			onimport?.(file);
		}
	}
</script>

<Stack direction="vertical" gap="6">
	<Panel title="Export Data">
		<Stack direction="vertical" gap="3">
			<Text size="sm" color="muted">Download a complete copy of your data as a JSON file.</Text>
			{#if lastExport}
				<Text size="xs" color="faint">Last export: {lastExport}</Text>
			{/if}
			<div>
				<PrimButton variant="primary" onclick={onexport}>Export data</PrimButton>
			</div>
		</Stack>
	</Panel>

	<Panel title="Import Data">
		<Stack direction="vertical" gap="3">
			<Text size="sm" color="muted">
				Restore from a previously exported JSON file. This will merge with your existing data.
			</Text>
			{#if lastImport}
				<Text size="xs" color="faint">Last import: {lastImport}</Text>
			{/if}

			<div class="inline-flex">
				<label class="cursor-pointer">
					<input type="file" accept=".json" class="sr-only" onchange={handleFileChange} />
					<span
						class="inline-flex cursor-pointer items-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
						>Choose file</span
					>
				</label>
			</div>

			{#if importStatus === 'loading'}
				<Badge variant="warning">Importing…</Badge>
			{:else if importStatus === 'success'}
				<Badge variant="success">Import complete</Badge>
			{:else if importStatus === 'error'}
				<Badge variant="destructive">Import failed</Badge>
			{/if}
		</Stack>
	</Panel>
</Stack>
