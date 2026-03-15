<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
</script>

<div class="login-page">
	<div class="login-card">
		<Stack gap="6" align="center">
			<Text as="h1" size="3xl" weight="bold" tracking="tight" align="center">Margin</Text>
			<Text as="p" color="muted" align="center">
				Balance your life with intentional time allocation.
			</Text>
			<form method="POST" class="login-form">
				<Button type="submit" variant="primary" size="lg">Sign In</Button>
			</form>
		</Stack>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		background: var(--color-bg);
		padding: var(--space-4);
	}
	.login-card {
		width: 100%;
		max-width: 24rem;
		padding: var(--space-8);
		background: var(--color-surface);
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}
	.login-form {
		width: 100%;
		display: flex;
		justify-content: center;
	}
</style>
