<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		id: string;
		name: string;
		purpose: string;
		targetPercentage: number;
		color: string;
		status: 'active' | 'paused' | 'archived';
		taskCount: number;
	}

	let { id, name, purpose, targetPercentage, color, status, taskCount }: Props = $props();

	let statusVariant = $derived(
		(status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default') as
			| 'success'
			| 'warning'
			| 'default'
	);
</script>

<a
	href="/aspects/{id}"
	class="block text-inherit no-underline transition-transform duration-150 hover:-translate-y-0.5"
>
	<Card padding="md" shadow="sm">
		<Stack gap="3">
			<div class="flex items-center gap-3">
				<div class="h-3 w-3 shrink-0 rounded-full" style="background: {color}"></div>
				<Text as="h3" size="xl" weight="semibold">{name}</Text>
			</div>
			<Text as="p" size="sm" color="muted">{purpose}</Text>
			<div class="flex flex-wrap items-center gap-3">
				<Badge variant={statusVariant}>{status}</Badge>
				<Text as="span" size="xs" color="faint">{targetPercentage}% target</Text>
				<Text as="span" size="xs" color="faint">{taskCount} tasks</Text>
			</div>
		</Stack>
	</Card>
</a>
