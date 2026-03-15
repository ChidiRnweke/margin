<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import AccountForm from '$lib/components/domain/settings/AccountForm.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface PageData {
		email: string;
		createdAt: string;
	}

	let { data }: { data: PageData } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Account" description="Manage your account and security settings.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => window.location.href = '/settings'}>
				Back to settings
			</Button>
		{/snippet}
	</PageHeader>

	<div class="settings-form-container">
		<AccountForm email={data.email} createdAt={data.createdAt} />
	</div>
</Stack>

<style>
	.settings-form-container {
		max-width: 40rem;
	}
</style>
