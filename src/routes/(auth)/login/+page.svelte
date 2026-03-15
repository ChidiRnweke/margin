<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import AmbientBackground from '$lib/components/layout/AmbientBackground.svelte';
</script>

<div class="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
	<AmbientBackground />

	<div
		class="glass-surface relative z-10 w-full max-w-md rounded-xl border border-[var(--color-glass-border)] border-r-[var(--color-glass-border-subtle)] border-b-[var(--color-glass-border-subtle)] bg-[var(--color-glass-strong)] p-10 shadow-glass-lg backdrop-blur-lg"
	>
		<Stack gap="8" align="center">
			<Stack gap="3" align="center">
				<Text as="h1" size="4xl" weight="bold" tracking="tight" align="center">Margin</Text>
				<Text as="p" size="lg" color="muted" align="center">
					Balance your life with intentional planning
				</Text>
			</Stack>

			<form method="POST" class="w-full">
				<Button type="submit" variant="primary" size="lg" class="w-full">Sign In</Button>
			</form>

			<Text as="p" size="sm" color="faint" align="center">Your time deserves a plan</Text>
		</Stack>
	</div>
</div>
