<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import AmbientBackground from '$lib/components/layout/AmbientBackground.svelte';

	interface Props {
		steps: string[];
		currentStep: number;
		children: Snippet;
	}

	let { steps, currentStep, children }: Props = $props();
</script>

<div class="relative flex min-h-dvh flex-col items-center p-8">
	<AmbientBackground />
	<nav class="mb-8 w-full max-w-lg" aria-label="Wizard progress">
		<ol class="flex list-none justify-center gap-4 p-0">
			{#each steps as step, i}
				<li
					class={cn(
						'flex items-center gap-2 text-sm',
						i === currentStep && 'font-medium text-[var(--color-accent)]',
						i < currentStep && 'text-[var(--color-success)]',
						i > currentStep && 'text-[var(--color-text-faint)]'
					)}
					aria-current={i === currentStep ? 'step' : undefined}
				>
					<span
						class={cn(
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current text-xs font-semibold',
							i === currentStep &&
								'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-fg)]',
							i < currentStep &&
								'border-[var(--color-success)] bg-[var(--color-success)] text-white'
						)}
					>
						{#if i < currentStep}
							<svg
								width="14"
								height="14"
								viewBox="0 0 14 14"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M3 7l3 3 5-5" />
							</svg>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="hidden sm:inline">{step}</span>
				</li>
			{/each}
		</ol>
	</nav>
	<div class="w-full max-w-lg">
		{@render children()}
	</div>
</div>
