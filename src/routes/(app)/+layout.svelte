<script lang="ts">
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<AppShell>
	{#snippet sidebar()}
		<nav class="app-nav">
			<a class="nav-item" href="/">Dashboard</a>
			<a class="nav-item" href="/aspects">Aspects</a>
			<a class="nav-item" href="/tasks">Tasks</a>
			<a class="nav-item" href="/plan">Plan</a>
			<a class="nav-item" href="/availability">Availability</a>
			<a class="nav-item" href="/settings">Settings</a>
		</nav>
	{/snippet}
	{@render children()}
</AppShell>

<style>
	.app-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		text-decoration: none;
		transition: all var(--duration-fast) var(--ease-default);
	}
	.nav-item:hover {
		background: var(--color-surface-muted);
		color: var(--color-text);
	}
</style>
