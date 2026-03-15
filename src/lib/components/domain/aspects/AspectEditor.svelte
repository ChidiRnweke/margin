<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Props {
		name?: string;
		purpose?: string;
		targetPercentage?: number;
		onsubmit?: (data: { name: string; purpose: string; targetPercentage: number }) => void;
		oncancel?: () => void;
	}

	let {
		name: initialName = '',
		purpose: initialPurpose = '',
		targetPercentage: initialTarget = 0,
		onsubmit,
		oncancel
	}: Props = $props();

	let name = $state(initialName);
	let purpose = $state(initialPurpose);
	let targetPercentage = $state(initialTarget);

	function handleSubmit() {
		onsubmit?.({ name, purpose, targetPercentage });
	}
</script>

<form class="aspect-editor" onsubmit|preventDefault={handleSubmit}>
	<Stack gap="4">
		<Input label="Name" bind:value={name} placeholder="e.g. Health" required />
		<Input label="Purpose" bind:value={purpose} placeholder="Why this aspect matters" />
		<Input
			label="Target %"
			type="number"
			value={String(targetPercentage)}
			oninput={(e) => { targetPercentage = Number((e.target as HTMLInputElement).value); }}
		/>
		<div class="editor-actions">
			{#if oncancel}
				<Button variant="ghost" onclick={oncancel}>Cancel</Button>
			{/if}
			<Button type="submit" variant="primary">Save</Button>
		</div>
	</Stack>
</form>

<style>
	.aspect-editor {
		width: 100%;
	}
	.editor-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding-top: var(--space-2);
	}
</style>
