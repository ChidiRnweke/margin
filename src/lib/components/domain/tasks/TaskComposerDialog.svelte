<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import { cn } from '$lib/utils.js';

	interface AspectOption {
		id: string;
		name: string;
		status: string;
		targetPercentage: number | null;
	}

	interface Props {
		aspects: AspectOption[];
		returnTo: string;
		open?: boolean;
		error?: string | null;
	}

	let { aspects, returnTo, open = $bindable(false), error = null }: Props = $props();

	let advancedOpen = $state(false);
	let selectedAspectId = $state('');

	$effect(() => {
		if (!selectedAspectId && aspects[0]?.id) {
			selectedAspectId = aspects[0].id;
		}
	});

	function closeOnSuccess() {
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: () => Promise<void>;
		}) => {
			await update();
			if (result.type === 'success') {
				open = false;
				advancedOpen = false;
			}
		};
	}
</script>

<Dialog.Root bind:open>
	<Button onclick={() => (open = true)} disabled={aspects.length === 0}>New task</Button>

	<Dialog.Content
		class="glass-surface max-w-2xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-0 text-[var(--color-text)] shadow-glass-lg backdrop-blur-lg"
	>
		<div class="space-y-6 p-6 sm:p-8">
			<div class="space-y-2">
				<Text as="p" size="xs" color="faint" tracking="wide">Progressive Disclosure</Text>
				<Dialog.Title class="font-display text-3xl font-bold tracking-[-0.04em]"
					>Shape the next move</Dialog.Title
				>
				<Dialog.Description class="max-w-xl text-sm text-[var(--color-text-muted)]">
					Keep the first step light: title and aspect up front, planning details only when you want
					them.
				</Dialog.Description>
			</div>

			{#if error}
				<div
					class="rounded-[20px] border border-[color:var(--color-destructive-border)] bg-[color:var(--color-destructive-soft)] px-4 py-3 text-sm text-[var(--color-destructive)]"
				>
					{error}
				</div>
			{/if}

			<form method="POST" action="?/create" use:enhance={closeOnSuccess} class="space-y-6">
				<input type="hidden" name="returnTo" value={returnTo} />
				<input type="hidden" name="aspectId" value={selectedAspectId} />

				<div class="grid gap-5">
					<Input
						name="title"
						label="Task title"
						placeholder="Finish the milestone, send the note, book the session..."
						required
					/>

					<div class="space-y-3">
						<div class="flex items-center justify-between gap-3">
							<Text as="label" size="sm" weight="semibold">Aspect</Text>
							<Text as="span" size="xs" color="faint" tracking="wide">Required</Text>
						</div>

						<div class="grid gap-3 sm:grid-cols-2">
							{#each aspects as aspect (aspect.id)}
								<button
									type="button"
									class={cn(
									'rounded-xl border px-4 py-4 text-left transition-all duration-200',
									selectedAspectId === aspect.id
										? 'border-[color:var(--color-accent-border)] bg-[color:var(--color-accent-soft)] shadow-[0_18px_52px_-30px_var(--color-accent-shadow)]'
										: 'border-[var(--color-glass-border)] bg-[var(--color-glass)] hover:bg-[var(--color-glass-strong)]'
									)}
									onclick={() => (selectedAspectId = aspect.id)}
								>
									<div class="flex items-center justify-between gap-3">
										<Text as="span" size="base" weight="semibold">{aspect.name}</Text>
										{#if aspect.targetPercentage !== null}
											<Text as="span" size="xs" color="faint"
												>{aspect.targetPercentage}% target</Text
											>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>

					<Collapsible.Root
						bind:open={advancedOpen}
						class="glass-surface rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass)] px-4 py-4 backdrop-blur-sm"
					>
						<div class="flex items-center justify-between gap-3">
							<div>
								<Text as="p" size="sm" weight="semibold">More planning detail</Text>
								<Text as="p" size="sm" color="muted"
									>Effort, deadline, split behavior, and a little context.</Text
								>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onclick={() => (advancedOpen = !advancedOpen)}
							>
								{advancedOpen ? 'Hide' : 'Show'}
							</Button>
						</div>

						<Collapsible.Content class="pt-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="sm:col-span-2">
									<label
										class="mb-2 block text-sm font-semibold text-[var(--color-text)]"
										for="task-description">Description</label
									>
									<Textarea
										id="task-description"
										name="description"
										class="min-h-28 border-[var(--color-glass-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
										placeholder="Add the why, constraints, or notes worth keeping with the task."
									/>
								</div>

								<Input
									type="number"
									min="5"
									step="5"
									name="effortMinutes"
									label="Effort minutes"
									placeholder="30"
								/>
								<Input type="date" name="dueDate" label="Due date" />
								<Input
									type="number"
									min="0"
									max="100"
									name="importanceScore"
									label="Importance"
									placeholder="50"
								/>

								<label
								class="flex items-center gap-3 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] px-4 py-3 text-sm text-[var(--color-text)]"
								>
									<Checkbox name="splittableOverride" />
									<span>Allow the planner to split this task across multiple sessions.</span>
								</label>
							</div>
						</Collapsible.Content>
					</Collapsible.Root>
				</div>

				<div
					class="flex flex-col-reverse gap-3 border-t border-[var(--color-glass-border)] pt-5 sm:flex-row sm:items-center sm:justify-end"
				>
					<Button type="button" variant="ghost" onclick={() => (open = false)}>Cancel</Button>
					<Button type="submit" disabled={!selectedAspectId}>Create task</Button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
