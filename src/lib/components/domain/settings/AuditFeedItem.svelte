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
		action === 'create' ? 'success' as const
		: action === 'delete' ? 'destructive' as const
		: 'default' as const
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
			<div class="diff-table">
				<table>
					<thead>
						<tr>
							<th>Field</th>
							<th>Before</th>
							<th>After</th>
						</tr>
					</thead>
					<tbody>
						{#each diff as d}
							<tr>
								<td class="diff-field">{d.field}</td>
								<td class="diff-before">{d.before}</td>
								<td class="diff-after">{d.after}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</Stack>
</Card>

<style>
	.diff-table {
		overflow-x: auto;
	}
	.diff-table table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-xs);
	}
	.diff-table th {
		text-align: left;
		padding: var(--space-1) var(--space-2);
		border-bottom: 1px solid var(--color-border-muted);
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
	}
	.diff-table td {
		padding: var(--space-1) var(--space-2);
		border-bottom: 1px solid var(--color-border-muted);
	}
	.diff-field {
		font-weight: var(--weight-medium);
		color: var(--color-text);
	}
	.diff-before {
		color: var(--color-destructive);
		font-family: var(--font-mono);
	}
	.diff-after {
		color: var(--color-success);
		font-family: var(--font-mono);
	}
</style>
