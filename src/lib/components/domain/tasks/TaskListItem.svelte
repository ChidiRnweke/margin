<script lang="ts">
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { cn } from '$lib/utils.js';
	import Button from '$lib/components/primitives/Button.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';

	interface Props {
		title: string;
		status: 'Backlog' | 'InProgress' | 'Done' | 'Archived';
		effortMinutes: number;
		remainingMinutes: number;
		aspectName?: string;
		milestoneTitle?: string | null;
		dueDate?: string | null;
		overdue?: boolean;
		hasActiveLock?: boolean;
		selected?: boolean;
		href: string;
		mobileHref?: string;
	}

	let {
		title,
		status,
		effortMinutes,
		remainingMinutes,
		aspectName,
		milestoneTitle,
		dueDate,
		overdue = false,
		hasActiveLock = false,
		selected = false,
		href,
		mobileHref = href
	}: Props = $props();

	let statusVariant = $derived(
		(status === 'Done'
			? 'success'
			: status === 'InProgress'
				? 'accent'
				: status === 'Archived'
					? 'destructive'
					: 'default') as 'success' | 'accent' | 'default' | 'destructive'
	);

	const completionValue = $derived(
		effortMinutes <= 0
			? 0
			: Math.max(0, Math.min(100, ((effortMinutes - remainingMinutes) / effortMinutes) * 100))
	);

	async function handleNavigate() {
		const prefersMobile = window.matchMedia('(max-width: 767px)').matches;
		window.location.assign(prefersMobile ? mobileHref : href);
	}
</script>

<Button
	type="button"
	variant="ghost"
	size="md"
	class={cn(
		'group h-auto w-full rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] p-4 text-left shadow-glass-sm backdrop-blur-sm transition-all duration-200 hover:bg-[var(--color-glass-strong)] hover:shadow-glass [&>span]:w-full [&>span]:justify-start',
		selected &&
			'border-[color:var(--color-accent-border)] bg-[color:var(--color-accent-soft)] shadow-[0_20px_60px_-34px_var(--color-accent-shadow)]'
	)}
	onclick={handleNavigate}
>
	<div class="flex items-start justify-between gap-3">
		<Text as="span" size="sm" weight="semibold">{title}</Text>
		<Badge variant={statusVariant} size="sm">{status.replace('_', ' ')}</Badge>
	</div>

	<div class="mt-3 flex flex-wrap items-center gap-2">
		{#if aspectName}
			<Badge variant="default" class="text-[var(--color-text)]">{aspectName}</Badge>
		{/if}
		{#if milestoneTitle}
			<Badge variant="default">{milestoneTitle}</Badge>
		{/if}
		{#if overdue}
			<Badge variant="warning">Overdue</Badge>
		{/if}
		{#if hasActiveLock}
			<Badge variant="accent">Locked</Badge>
		{/if}
		{#if dueDate}
			<Text as="span" size="xs" color={overdue ? 'destructive' : 'faint'}>
				Due {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
			</Text>
		{/if}
	</div>

	<div class="mt-4 space-y-2">
		<div class="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
			<span>{remainingMinutes}m left</span>
			<span>{effortMinutes}m total</span>
		</div>
		<Progress
			value={completionValue}
			class="h-1.5 bg-[var(--color-glass-border)] [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-strong))]"
		/>
	</div>
</Button>
