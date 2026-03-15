<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface Props {
		timestamp: string;
		action: string;
		entity: string;
		entityId: string;
		diff?: { field: string; before: string; after: string }[];
		actor?: string;
	}

	let { timestamp, action, entity, entityId, diff, actor }: Props = $props();

	let actionVariant = $derived(
		action === 'create'
			? ('success' as const)
			: action === 'delete'
				? ('destructive' as const)
				: ('default' as const)
	);
</script>

<Card padding="md">
	<Stack direction="vertical" gap="3">
		<Stack direction="horizontal" gap="2" align="center" justify="between">
			<Stack direction="horizontal" gap="2" align="center">
				<Badge variant={actionVariant} size="sm">{action}</Badge>
				<Text size="sm" weight="medium">{entity}</Text>
				<Text size="xs" color="faint">#{entityId}</Text>
			</Stack>
			<Text size="xs" color="faint">{timestamp}</Text>
		</Stack>

		{#if actor}
			<Text size="xs" color="muted">by {actor}</Text>
		{/if}

		{#if diff && diff.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-xs">
					<thead>
						<tr>
							<th
								class="border-b border-[var(--color-border-muted)] px-2 py-1 text-left font-medium text-[var(--color-text-muted)]"
								>Field</th
							>
							<th
								class="border-b border-[var(--color-border-muted)] px-2 py-1 text-left font-medium text-[var(--color-text-muted)]"
								>Before</th
							>
							<th
								class="border-b border-[var(--color-border-muted)] px-2 py-1 text-left font-medium text-[var(--color-text-muted)]"
								>After</th
							>
						</tr>
					</thead>
					<tbody>
						{#each diff as d}
							<tr>
								<td
									class="border-b border-[var(--color-border-muted)] px-2 py-1 font-medium text-[var(--color-text)]"
									>{d.field}</td
								>
								<td
									class="border-b border-[var(--color-border-muted)] px-2 py-1 font-mono text-[var(--color-destructive)]"
									>{d.before}</td
								>
								<td
									class="border-b border-[var(--color-border-muted)] px-2 py-1 font-mono text-[var(--color-success)]"
									>{d.after}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</Stack>
</Card>
