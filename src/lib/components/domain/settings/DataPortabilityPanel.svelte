<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
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
			<Text size="sm" color="muted">
				Download a complete copy of your data as a JSON file.
			</Text>
			{#if lastExport}
				<Text size="xs" color="faint">Last export: {lastExport}</Text>
			{/if}
			<div>
				<Button variant="primary" onclick={onexport}>Export data</Button>
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

			<div class="file-picker">
				<label class="file-label">
					<input
						type="file"
						accept=".json"
						class="file-input"
						onchange={handleFileChange}
					/>
					<span class="file-button">Choose file</span>
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

<style>
	.file-picker {
		display: inline-flex;
	}
	.file-label {
		cursor: pointer;
	}
	.file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.file-button {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		transition: background var(--duration-fast) var(--ease-default);
	}
	.file-button:hover {
		background: var(--color-surface-muted);
	}
</style>
