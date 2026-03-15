<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	interface Props {
		open?: boolean;
		dayIndex?: number;
		startHour?: string;
		endHour?: string;
		label?: string;
		onsave?: (data: { dayIndex: number; startHour: string; endHour: string; label: string }) => void;
		oncancel?: () => void;
	}

	let {
		open = false,
		dayIndex = 0,
		startHour = '09:00',
		endHour = '17:00',
		label = '',
		onsave,
		oncancel
	}: Props = $props();

	let editDay = $state(0);
	let editStart = $state('09:00');
	let editEnd = $state('17:00');
	let editLabel = $state('');

	$effect(() => {
		editDay = dayIndex;
		editStart = startHour;
		editEnd = endHour;
		editLabel = label;
	});

	function handleSave() {
		onsave?.({
			dayIndex: editDay,
			startHour: editStart,
			endHour: editEnd,
			label: editLabel
		});
	}
</script>

{#if open}
	<div class="editor-backdrop" role="presentation" onclick={oncancel}></div>
	<div class="editor-drawer" role="dialog" aria-label="Edit availability block">
		<Panel title="Edit Availability Block">
			<Stack direction="vertical" gap="4">
				<div class="field">
					<Text as="label" size="sm" weight="medium">Day</Text>
					<select class="day-select" bind:value={editDay}>
						{#each DAYS as day, i}
							<option value={i}>{day}</option>
						{/each}
					</select>
				</div>

				<Input label="Start time" type="text" bind:value={editStart} placeholder="09:00" />
				<Input label="End time" type="text" bind:value={editEnd} placeholder="17:00" />
				<Input label="Label (optional)" type="text" bind:value={editLabel} placeholder="Work hours" />

				<Stack direction="horizontal" gap="2">
					<Button variant="primary" size="sm" onclick={handleSave}>Save</Button>
					<Button variant="ghost" size="sm" onclick={oncancel}>Cancel</Button>
				</Stack>
			</Stack>
		</Panel>
	</div>
{/if}

<style>
	.editor-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 40;
	}
	.editor-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(24rem, 90vw);
		background: var(--color-surface);
		border-left: 1px solid var(--color-border-muted);
		box-shadow: var(--shadow-lg);
		z-index: 50;
		overflow-y: auto;
		padding: var(--space-6);
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.day-select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: var(--text-sm);
	}
</style>
