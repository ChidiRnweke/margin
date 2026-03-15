<script lang="ts">
	import Input from '$lib/components/primitives/Input.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface AspectWeight {
		id: string;
		name: string;
		weight: number;
	}

	interface Props {
		aspectWeights: AspectWeight[];
		overcommitThreshold: number;
		undercommitThreshold: number;
		onweightchange?: (id: string, value: number) => void;
		onthresholdchange?: (key: 'overcommit' | 'undercommit', value: number) => void;
		onsave?: () => void;
	}

	let {
		aspectWeights,
		overcommitThreshold,
		undercommitThreshold,
		onweightchange,
		onthresholdchange,
		onsave
	}: Props = $props();

	let totalWeight = $derived(aspectWeights.reduce((sum, a) => sum + a.weight, 0));
	let isBalanced = $derived(Math.abs(totalWeight - 100) < 1);
</script>

<Stack direction="vertical" gap="6">
	<Panel title="Aspect Weights">
		<Stack direction="vertical" gap="4">
			{#each aspectWeights as aspect (aspect.id)}
				<div class="border-b border-[var(--color-glass-border)] py-2 last:border-b-0">
					<Stack direction="horizontal" gap="3" align="center" justify="between">
						<Text size="sm" weight="medium">{aspect.name}</Text>
						<Stack direction="horizontal" gap="2" align="center">
							<input
								type="range"
								class="w-32 accent-[var(--color-accent)]"
								min="0"
								max="100"
								value={aspect.weight}
								oninput={(e) => onweightchange?.(aspect.id, Number(e.currentTarget.value))}
								aria-label="{aspect.name} weight"
							/>
							<Text size="sm" color="muted">{aspect.weight}%</Text>
						</Stack>
					</Stack>
				</div>
			{/each}

			<Stack direction="horizontal" gap="2" align="center">
				<Text size="sm" weight="medium">Total:</Text>
				<Text size="sm" color={isBalanced ? 'success' : 'warning'}>{totalWeight}%</Text>
				{#if !isBalanced}
					<Text size="xs" color="warning">Weights should sum to 100%</Text>
				{/if}
			</Stack>
		</Stack>
	</Panel>

	<Panel title="Thresholds">
		<Stack direction="vertical" gap="4">
			<Input
				label="Overcommit threshold (%)"
				type="number"
				value={overcommitThreshold.toString()}
				oninput={(e) =>
					onthresholdchange?.('overcommit', Number((e.currentTarget as HTMLInputElement).value))}
			/>
			<Input
				label="Undercommit threshold (%)"
				type="number"
				value={undercommitThreshold.toString()}
				oninput={(e) =>
					onthresholdchange?.('undercommit', Number((e.currentTarget as HTMLInputElement).value))}
			/>
		</Stack>
	</Panel>

	<Button variant="primary" onclick={onsave}>Save changes</Button>
</Stack>
