<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Card from '$lib/components/primitives/Card.svelte';

	interface Props {
		name: string;
		purpose: string;
		targetPercentage: number;
		color: string;
		status: string;
		taskCount: number;
		milestoneCount: number;
	}

	let { name, purpose, targetPercentage, color, status, taskCount, milestoneCount }: Props = $props();
</script>

<Stack gap="6">
	<Card padding="md">
		<Stack gap="4">
			<div class="overview-header">
				<div class="color-swatch" style="background: {color}"></div>
				<div>
					<Text as="h3" size="xl" weight="semibold">{name}</Text>
					<Text as="p" size="sm" color="muted">{purpose}</Text>
				</div>
			</div>

			<div class="overview-stats">
				<div class="stat">
					<Text as="span" size="2xl" weight="bold">{targetPercentage}%</Text>
					<Text as="span" size="xs" color="muted">Target</Text>
				</div>
				<div class="stat">
					<Text as="span" size="2xl" weight="bold">{taskCount}</Text>
					<Text as="span" size="xs" color="muted">Tasks</Text>
				</div>
				<div class="stat">
					<Text as="span" size="2xl" weight="bold">{milestoneCount}</Text>
					<Text as="span" size="xs" color="muted">Milestones</Text>
				</div>
			</div>

			<div>
				<Badge variant={status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default'}>
					{status}
				</Badge>
			</div>
		</Stack>
	</Card>
</Stack>

<style>
	.overview-header {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}
	.color-swatch {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius);
		flex-shrink: 0;
	}
	.overview-stats {
		display: flex;
		gap: var(--space-8);
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
</style>
