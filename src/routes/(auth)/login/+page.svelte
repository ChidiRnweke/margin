<script lang="ts">
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
</script>

<div class="login-scene">
	<div class="login-orb login-orb-1"></div>
	<div class="login-orb login-orb-2"></div>
	<div class="login-orb login-orb-3"></div>

	<div class="login-card">
		<Stack gap="8" align="center">
			<Stack gap="3" align="center">
				<Text as="h1" size="4xl" weight="bold" tracking="tight" align="center">
					Margin
				</Text>
				<Text as="p" size="lg" color="muted" align="center">
					Balance your life with intentional planning
				</Text>
			</Stack>

			<form method="POST" class="login-form">
				<Button type="submit" variant="primary" size="lg">Sign In</Button>
			</form>

			<Text as="p" size="sm" color="faint" align="center">
				Your time deserves a plan
			</Text>
		</Stack>
	</div>
</div>

<style>
	.login-scene {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--space-4);
		background: linear-gradient(
			135deg,
			oklch(0.97 0.01 280),
			oklch(0.96 0.015 300)
		);
		position: relative;
		overflow: hidden;
	}

	.login-orb {
		position: absolute;
		border-radius: var(--radius-full);
		filter: blur(80px);
		opacity: 0.5;
		pointer-events: none;
	}

	.login-orb-1 {
		width: 400px;
		height: 400px;
		background: oklch(0.85 0.08 330);
		top: -80px;
		right: -60px;
	}

	.login-orb-2 {
		width: 300px;
		height: 300px;
		background: oklch(0.85 0.08 250);
		bottom: -60px;
		left: -40px;
	}

	.login-orb-3 {
		width: 200px;
		height: 200px;
		background: oklch(0.85 0.08 170);
		bottom: 20%;
		right: 15%;
	}

	.login-card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 26rem;
		padding: var(--space-10);
		background: var(--color-surface);
		border: 1px solid var(--color-border-muted);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		animation: card-enter 0.6s ease-out both;
	}

	.login-form {
		width: 100%;
	}

	.login-form :global(.btn) {
		width: 100%;
	}

	@keyframes card-enter {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
