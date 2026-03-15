<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	interface Block {
		id: string;
		dayIndex: number;
		startHour: number;
		endHour: number;
		label?: string;
	}

	interface Props {
		blocks: Block[];
		onedit?: (id: string) => void;
		ondelete?: (id: string) => void;
	}

	let { blocks, onedit, ondelete }: Props = $props();
</script>

<Stack direction="vertical" gap="3">
	{#if blocks.length === 0}
		<Text size="sm" color="muted">No availability blocks defined.</Text>
	{:else}
		{#each blocks as block (block.id)}
			<Card padding="sm">
				<Stack direction="horizontal" gap="3" align="center" justify="between">
					<Stack direction="horizontal" gap="3" align="center">
						<Text size="sm" weight="medium">{DAYS[block.dayIndex]}</Text>
						<Text size="sm" color="muted">
							{block.startHour.toString().padStart(2, '0')}:00 –
							{block.endHour.toString().padStart(2, '0')}:00
						</Text>
						{#if block.label}
							<Text size="xs" color="faint">{block.label}</Text>
						{/if}
					</Stack>
					<Stack direction="horizontal" gap="1">
						<Button variant="ghost" size="sm" onclick={() => onedit?.(block.id)}>Edit</Button>
						<Button variant="ghost" size="sm" onclick={() => ondelete?.(block.id)}>Delete</Button>
					</Stack>
				</Stack>
			</Card>
		{/each}
	{/if}
</Stack>
