<script lang="ts">
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import EffortBar from './EffortBar.svelte';

	interface Props {
		id: string;
		title: string;
		status: 'todo' | 'in_progress' | 'done' | 'archived';
		effort: number;
		aspectName?: string;
		aspectColor?: string;
		dueDate?: string | null;
		selected?: boolean;
		onclick?: () => void;
	}

	let {
		id,
		title,
		status,
		effort,
		aspectName,
		aspectColor,
		dueDate,
		selected = false,
		onclick
	}: Props = $props();

	let statusVariant = $derived(
		(status === 'done' ? 'success' : status === 'in_progress' ? 'accent' : 'default') as 'success' | 'accent' | 'default'
	);
</script>

<button
	class="task-item"
	class:task-item-selected={selected}
	role="option"
	aria-selected={selected}
	{onclick}
>
	<div class="task-item-header">
		<Text as="span" size="sm" weight="medium">{title}</Text>
		<Badge variant={statusVariant} size="sm">{status.replace('_', ' ')}</Badge>
	</div>
	<div class="task-item-meta">
		{#if aspectName}
			<span class="task-aspect">
				{#if aspectColor}
					<span class="aspect-dot" style="background: {aspectColor}"></span>
				{/if}
				<Text as="span" size="xs" color="faint">{aspectName}</Text>
			</span>
		{/if}
		{#if effort > 0}
			<EffortBar value={effort} max={8} />
		{/if}
		{#if dueDate}
			<Text as="span" size="xs" color="faint">
				{new Date(dueDate).toLocaleDateString()}
			</Text>
		{/if}
	</div>
</button>

<style>
	.task-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border: none;
		border-bottom: 1px solid var(--color-border-muted);
		background: var(--color-surface);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		width: 100%;
		transition: background var(--duration-fast) var(--easing);
	}
	.task-item:hover {
		background: var(--color-surface-muted);
	}
	.task-item-selected {
		background: var(--color-accent-muted);
		border-left: 3px solid var(--color-accent);
	}
	.task-item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.task-item-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.task-aspect {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}
	.aspect-dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
	}
</style>
