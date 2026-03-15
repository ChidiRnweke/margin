<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';

	interface SettingsCard {
		title: string;
		description: string;
		href: string;
		icon?: string;
	}

	interface Props {
		cards: SettingsCard[];
	}

	let { cards }: Props = $props();
</script>

<div class="settings-grid">
	{#each cards as card}
		<a class="settings-card-link" href={card.href}>
			<Card padding="lg">
				<Stack direction="vertical" gap="2">
					{#if card.icon}
						<span class="settings-icon">{card.icon}</span>
					{/if}
					<Text as="h3" size="base" weight="semibold">{card.title}</Text>
					<Text size="sm" color="muted">{card.description}</Text>
				</Stack>
			</Card>
		</a>
	{/each}
</div>

<style>
	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.settings-card-link {
		text-decoration: none;
		color: inherit;
		border-radius: var(--radius-lg);
		transition: transform var(--duration-fast) var(--ease-default),
			box-shadow var(--duration-fast) var(--ease-default);
	}
	.settings-card-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	.settings-card-link:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	.settings-icon {
		font-size: var(--text-2xl);
	}
</style>
