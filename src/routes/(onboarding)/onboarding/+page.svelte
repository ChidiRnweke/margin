<script lang="ts">
	import WizardLayout from '$lib/components/layout/WizardLayout.svelte';
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input as UiInput } from '$lib/components/ui/input/index.js';

	const steps = ['Welcome', 'Aspects', 'Targets', 'Preferences'];
	let currentStep = $state(0);

	let aspects = $state([{ name: '', purpose: '' }]);
	let targetPercentages = $state<number[]>([100]);

	let planningDay = $state('monday');
	let reminderTime = $state('09:00');

	let targetSum = $derived(targetPercentages.reduce((sum, v) => sum + v, 0));
	let targetValid = $derived(targetSum === 100);

	const DAYS = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'tuesday', label: 'Tuesday' },
		{ value: 'wednesday', label: 'Wednesday' },
		{ value: 'thursday', label: 'Thursday' },
		{ value: 'friday', label: 'Friday' },
		{ value: 'saturday', label: 'Saturday' },
		{ value: 'sunday', label: 'Sunday' }
	];

	function addAspect() {
		aspects.push({ name: '', purpose: '' });
		targetPercentages.push(0);
	}

	function removeAspect(index: number) {
		if (aspects.length <= 1) return;
		aspects.splice(index, 1);
		targetPercentages.splice(index, 1);
	}

	function next() {
		if (currentStep < steps.length - 1) currentStep++;
	}

	function back() {
		if (currentStep > 0) currentStep--;
	}
</script>

<WizardLayout {steps} {currentStep}>
	<GlassCard padding="lg">
		{#if currentStep === 0}
			<Stack gap="6" align="center">
				<Text as="h2" size="4xl" weight="bold" tracking="tight" align="center">
					Welcome to Margin
				</Text>
				<Text as="p" color="muted" align="center">
					Let's set up the life areas you want to balance. We call these Aspects — they represent
					the things that matter most to you.
				</Text>
				<Button variant="primary" size="lg" onclick={next}>Get Started</Button>
			</Stack>
		{:else if currentStep === 1}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">Create your Aspects</Text>
				<Text as="p" color="muted">
					Add life areas you want to track. Give each a name and purpose.
				</Text>
				{#each aspects as aspect, i}
					<Stack direction="horizontal" gap="3" align="start">
						<div class="flex-1">
							<Stack gap="3">
								<Input
									label="Aspect name"
									placeholder="e.g. Health, Career, Family"
									bind:value={aspect.name}
									required
								/>
								<Input
									label="Purpose"
									placeholder="Why is this important to you?"
									bind:value={aspect.purpose}
								/>
							</Stack>
						</div>
						{#if aspects.length > 1}
							<Button
								variant="ghost"
								size="sm"
								onclick={() => removeAspect(i)}
								ariaLabel="Remove aspect"
								class="mt-6 h-8 w-8 rounded-full p-0 text-[var(--color-text-muted)] hover:bg-[var(--color-destructive-muted)] hover:text-[var(--color-destructive)]"
							>
								✕
							</Button>
						{/if}
					</Stack>
				{/each}
				<Button variant="ghost" size="sm" onclick={addAspect}>+ Add another aspect</Button>
				<Stack direction="horizontal" justify="between" gap="3">
					<Button variant="ghost" onclick={back}>Back</Button>
					<Button variant="primary" onclick={next}>Next</Button>
				</Stack>
			</Stack>
		{:else if currentStep === 2}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">Set target percentages</Text>
				<Text as="p" color="muted">
					How much of your time should go to each aspect? Must total 100%.
				</Text>
				{#each aspects as aspect, i}
					<Stack direction="horizontal" align="center" justify="between" gap="4">
						<Text as="span" size="base" weight="medium">
							{aspect.name || `Aspect ${i + 1}`}
						</Text>
						<Stack direction="horizontal" align="center" gap="2">
							<UiInput
								type="number"
								min={0}
								max={100}
								value={targetPercentages[i]}
								oninput={(e) => {
									targetPercentages[i] = Number((e.target as HTMLInputElement).value);
								}}
								class="w-20 border-[var(--color-border)] bg-[var(--color-surface)] text-right"
							/>
							<Text as="span" size="sm" color="muted">%</Text>
						</Stack>
					</Stack>
				{/each}
				<Text as="p" size="sm" color={targetValid ? 'success' : 'destructive'}>
					Total: {targetSum}% {targetValid ? '✓' : '(must equal 100%)'}
				</Text>
				<Stack direction="horizontal" justify="between" gap="3">
					<Button variant="ghost" onclick={back}>Back</Button>
					<Button variant="primary" onclick={next} disabled={!targetValid}>Next</Button>
				</Stack>
			</Stack>
		{:else if currentStep === 3}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">Planning preferences</Text>
				<Text as="p" color="muted">
					Choose when you'd like to plan your week and receive reminders.
				</Text>
				<Stack gap="2">
					<Text as="label" size="sm" weight="medium">Planning day</Text>
					<Select.Root
						type="single"
						value={planningDay}
						onValueChange={(v) => (planningDay = v ?? 'monday')}
					>
						<Select.Trigger class="border-[var(--color-border)] bg-[var(--color-surface)]">
							{DAYS.find((d) => d.value === planningDay)?.label ?? 'Monday'}
						</Select.Trigger>
						<Select.Content
							class="border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] backdrop-blur-lg"
						>
							{#each DAYS as day}
								<Select.Item value={day.value}>{day.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Stack>
				<Stack gap="2">
					<Text as="label" size="sm" weight="medium">Reminder time</Text>
					<Input type="text" bind:value={reminderTime} placeholder="09:00" />
				</Stack>
				<Stack direction="horizontal" justify="between" gap="3">
					<Button variant="ghost" onclick={back}>Back</Button>
					<form method="POST" class="inline">
						<Button type="submit" variant="primary">Finish Setup</Button>
					</form>
				</Stack>
			</Stack>
		{/if}
	</GlassCard>
</WizardLayout>
