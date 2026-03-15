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

<div class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
	{#each cards as card}
		<a
			class="block rounded-lg text-inherit no-underline transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
			href={card.href}
		>
			<Card padding="lg">
				<Stack direction="vertical" gap="2">
					{#if card.icon}
						<span class="text-2xl">{card.icon}</span>
					{/if}
					<Text as="h3" size="base" weight="semibold">{card.title}</Text>
					<Text size="sm" color="muted">{card.description}</Text>
				</Stack>
			</Card>
		</a>
	{/each}
</div>
