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
		name: nameProp = '',
		purpose: purposeProp = '',
		targetPercentage: targetProp = 0,
		onsubmit,
		oncancel
	}: Props = $props();

	/* svelte-ignore state_referenced_locally */
	let name = $state(nameProp);
	/* svelte-ignore state_referenced_locally */
	let purpose = $state(purposeProp);
	/* svelte-ignore state_referenced_locally */
	let targetPercentage = $state(targetProp);

	function handleSubmit() {
		onsubmit?.({ name, purpose, targetPercentage });
	}
</script>

<form
	class="w-full"
	onsubmit={(e) => {
		e.preventDefault();
		handleSubmit();
	}}
>
	<Stack gap="4">
		<Input label="Name" bind:value={name} placeholder="e.g. Health" required />
		<Input label="Purpose" bind:value={purpose} placeholder="Why this aspect matters" />
		<Input
			label="Target %"
			type="number"
			value={String(targetPercentage)}
			oninput={(e) => {
				targetPercentage = Number((e.target as HTMLInputElement).value);
			}}
		/>
		<div class="flex justify-end gap-3 pt-2">
			{#if oncancel}
				<Button variant="ghost" onclick={oncancel}>Cancel</Button>
			{/if}
			<Button type="submit" variant="primary">Save</Button>
		</div>
	</Stack>
</form>
