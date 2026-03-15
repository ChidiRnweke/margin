<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface Props {
		title?: string;
		description?: string;
		effort?: number;
		aspectId?: string;
		dueDate?: string;
		onsubmit?: (data: {
			title: string;
			description: string;
			effort: number;
			aspectId: string;
			dueDate: string;
		}) => void;
		oncancel?: () => void;
	}

	let {
		title: titleProp = '',
		description: descProp = '',
		effort: effortProp = 1,
		aspectId: aspectProp = '',
		dueDate: dateProp = '',
		onsubmit,
		oncancel
	}: Props = $props();

	/* svelte-ignore state_referenced_locally */
	let title = $state(titleProp);
	/* svelte-ignore state_referenced_locally */
	let description = $state(descProp);
	/* svelte-ignore state_referenced_locally */
	let effort = $state(effortProp);
	/* svelte-ignore state_referenced_locally */
	let aspectId = $state(aspectProp);
	/* svelte-ignore state_referenced_locally */
	let dueDate = $state(dateProp);

	function handleSubmit() {
		onsubmit?.({ title, description, effort, aspectId, dueDate });
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
		<Input label="Title" bind:value={title} placeholder="What needs to be done?" required />
		<Input label="Description" bind:value={description} placeholder="Optional details" />
		<Input
			label="Effort (hours)"
			type="number"
			value={String(effort)}
			oninput={(e) => {
				effort = Number((e.target as HTMLInputElement).value);
			}}
		/>
		<Input label="Due date" type="text" bind:value={dueDate} placeholder="YYYY-MM-DD" />
		<div class="flex justify-end gap-3 pt-2">
			{#if oncancel}
				<Button variant="ghost" onclick={oncancel}>Cancel</Button>
			{/if}
			<Button type="submit" variant="primary">Save Task</Button>
		</div>
	</Stack>
</form>
