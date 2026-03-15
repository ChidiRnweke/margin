<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	interface Props {
		open?: boolean;
		dayIndex?: number;
		startHour?: string;
		endHour?: string;
		label?: string;
		onsave?: (data: {
			dayIndex: number;
			startHour: string;
			endHour: string;
			label: string;
		}) => void;
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

<Sheet.Root bind:open onOpenChange={(v) => !v && oncancel?.()}>
	<Sheet.Content
		side="right"
		class="w-[min(24rem,90vw)] border-l border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] backdrop-blur-lg"
	>
		<Sheet.Header>
			<Sheet.Title>Edit Availability Block</Sheet.Title>
			<Sheet.Description
				>Configure the day and time window for this availability block.</Sheet.Description
			>
		</Sheet.Header>
		<Stack direction="vertical" gap="4" class="mt-6">
			<div class="flex flex-col gap-1">
				<Text as="label" size="sm" weight="medium">Day</Text>
				<Select.Root
					type="single"
					value={String(editDay)}
					onValueChange={(v) => (editDay = Number(v))}
				>
					<Select.Trigger class="border-[var(--color-border)] bg-[var(--color-surface)]">
						{DAYS[editDay]}
					</Select.Trigger>
					<Select.Content
						class="border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] backdrop-blur-lg"
					>
						{#each DAYS as day, i}
							<Select.Item value={String(i)}>{day}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<Input label="Start time" type="text" bind:value={editStart} placeholder="09:00" />
			<Input label="End time" type="text" bind:value={editEnd} placeholder="17:00" />
			<Input label="Label (optional)" type="text" bind:value={editLabel} placeholder="Work hours" />

			<Stack direction="horizontal" gap="2">
				<Button variant="primary" size="sm" onclick={handleSave}>Save</Button>
				<Button variant="ghost" size="sm" onclick={oncancel}>Cancel</Button>
			</Stack>
		</Stack>
	</Sheet.Content>
</Sheet.Root>
