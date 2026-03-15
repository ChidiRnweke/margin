<script lang="ts">
	import { page } from '$app/state';
	import Text from '$lib/components/primitives/Text.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import AmbientBackground from '$lib/components/layout/AmbientBackground.svelte';
</script>

<div class="relative flex min-h-dvh items-center justify-center p-8">
	<AmbientBackground />
	<div class="relative z-10">
		<Stack gap="6" align="center">
			<Text size="4xl" weight="bold">
				{page.status}
			</Text>
			<Text size="lg" color="muted">
				{page.error?.message ?? 'Something went wrong'}
			</Text>
			<Button variant="primary" onclick={() => (window.location.href = '/')}>Go Home</Button>
		</Stack>
	</div>
</div>
