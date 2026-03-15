<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';

	interface Reminder {
		id: string;
		label: string;
		time: string;
		snoozed: boolean;
	}

	interface Props {
		reminders: Reminder[];
		onadd?: () => void;
		onsnooze?: (id: string) => void;
		ondismiss?: (id: string) => void;
	}

	let { reminders, onadd, onsnooze, ondismiss }: Props = $props();
</script>

<Panel title="Reminders">
	<Stack direction="vertical" gap="3">
		{#if reminders.length === 0}
			<Text size="sm" color="muted">No reminders set.</Text>
		{:else}
			{#each reminders as reminder (reminder.id)}
				<div class="rounded-lg bg-[var(--color-glass-strong)] px-3 py-2">
					<Stack direction="horizontal" gap="3" align="center" justify="between">
						<Stack direction="horizontal" gap="2" align="center">
							<Text size="sm">{reminder.label}</Text>
							<Text size="xs" color="muted">{reminder.time}</Text>
							{#if reminder.snoozed}
								<Badge variant="warning" size="sm">Snoozed</Badge>
							{/if}
						</Stack>
						<Stack direction="horizontal" gap="1">
							<Button variant="ghost" size="sm" onclick={() => onsnooze?.(reminder.id)}>
								Snooze
							</Button>
							<Button variant="ghost" size="sm" onclick={() => ondismiss?.(reminder.id)}>
								Dismiss
							</Button>
						</Stack>
					</Stack>
				</div>
			{/each}
		{/if}

		<Button variant="secondary" size="sm" onclick={onadd}>Add reminder</Button>
	</Stack>
</Panel>
