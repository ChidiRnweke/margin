<script lang="ts">
	import WizardLayout from '$lib/components/layout/WizardLayout.svelte';
	import GlassCard from '$lib/components/primitives/GlassCard.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';

	const steps = ['Welcome', 'Aspects', 'Targets', 'Preferences'];
	let currentStep = $state(0);

	let aspects = $state([{ name: '', purpose: '' }]);
	let targetPercentages = $state<number[]>([100]);

	let planningDay = $state('monday');
	let reminderTime = $state('09:00');

	let targetSum = $derived(targetPercentages.reduce((sum, v) => sum + v, 0));
	let targetValid = $derived(targetSum === 100);

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
					Let's set up the life areas you want to balance. We call these Aspects —
					they represent the things that matter most to you.
				</Text>
				<Button variant="primary" size="lg" onclick={next}>Get Started</Button>
			</Stack>
		{:else if currentStep === 1}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">
					Create your Aspects
				</Text>
				<Text as="p" color="muted">
					Add life areas you want to track. Give each a name and purpose.
				</Text>
				{#each aspects as aspect, i}
					<div class="aspect-row">
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
						{#if aspects.length > 1}
							<button
								class="remove-btn"
								onclick={() => removeAspect(i)}
								aria-label="Remove aspect"
							>
								✕
							</button>
						{/if}
					</div>
				{/each}
				<Button variant="ghost" size="sm" onclick={addAspect}>+ Add another aspect</Button>
				<div class="wizard-actions">
					<Button variant="ghost" onclick={back}>Back</Button>
					<Button variant="primary" onclick={next}>Next</Button>
				</div>
			</Stack>
		{:else if currentStep === 2}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">
					Set target percentages
				</Text>
				<Text as="p" color="muted">
					How much of your time should go to each aspect? Must total 100%.
				</Text>
				{#each aspects as aspect, i}
					<div class="target-row">
						<Text as="span" size="base" weight="medium">
							{aspect.name || `Aspect ${i + 1}`}
						</Text>
						<div class="target-input-wrapper">
							<input
								class="target-number-input"
								type="number"
								min="0"
								max="100"
								value={targetPercentages[i]}
								oninput={(e) => {
									targetPercentages[i] = Number((e.target as HTMLInputElement).value);
								}}
							/>
							<Text as="span" size="sm" color="muted">%</Text>
						</div>
					</div>
				{/each}
				<Text as="p" size="sm" color={targetValid ? 'success' : 'destructive'}>
					Total: {targetSum}% {targetValid ? '✓' : '(must equal 100%)'}
				</Text>
				<div class="wizard-actions">
					<Button variant="ghost" onclick={back}>Back</Button>
					<Button variant="primary" onclick={next} disabled={!targetValid}>Next</Button>
				</div>
			</Stack>
		{:else if currentStep === 3}
			<Stack gap="6">
				<Text as="h2" size="2xl" weight="semibold" tracking="tight">
					Planning preferences
				</Text>
				<Text as="p" color="muted">
					Choose when you'd like to plan your week and receive reminders.
				</Text>
				<div class="preference-row">
					<Text as="label" size="sm" weight="medium">Planning day</Text>
					<select class="pref-select" bind:value={planningDay}>
						<option value="monday">Monday</option>
						<option value="tuesday">Tuesday</option>
						<option value="wednesday">Wednesday</option>
						<option value="thursday">Thursday</option>
						<option value="friday">Friday</option>
						<option value="saturday">Saturday</option>
						<option value="sunday">Sunday</option>
					</select>
				</div>
				<div class="preference-row">
					<Text as="label" size="sm" weight="medium">Reminder time</Text>
					<Input type="text" bind:value={reminderTime} placeholder="09:00" />
				</div>
				<div class="wizard-actions">
					<Button variant="ghost" onclick={back}>Back</Button>
					<form method="POST" class="inline-form">
						<Button type="submit" variant="primary">Finish Setup</Button>
					</form>
				</div>
			</Stack>
		{/if}
	</GlassCard>
</WizardLayout>

<style>
	.aspect-row {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}
	.aspect-row > :first-child {
		flex: 1;
	}
	.remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		margin-top: var(--space-6);
		border: none;
		background: var(--color-surface-muted);
		color: var(--color-text-muted);
		border-radius: var(--radius-full);
		cursor: pointer;
		font-size: var(--text-sm);
	}
	.remove-btn:hover {
		background: var(--color-destructive-muted);
		color: var(--color-destructive);
	}
	.target-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}
	.target-input-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.target-number-input {
		width: 5rem;
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		text-align: right;
	}
	.target-number-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}
	.wizard-actions {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding-top: var(--space-4);
	}
	.inline-form {
		display: inline;
	}
	.preference-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.pref-select {
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}
	.pref-select:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-muted);
	}
</style>
