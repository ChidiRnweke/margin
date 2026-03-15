<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Text from '$lib/components/primitives/Text.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import Panel from '$lib/components/primitives/Panel.svelte';

	interface Props {
		email: string;
		createdAt: string;
		onlogout?: () => void;
		ondelete?: () => void;
	}

	let { email, createdAt, onlogout, ondelete }: Props = $props();

	let confirmDelete = $state(false);
</script>

<Stack direction="vertical" gap="6">
	<Panel title="Account Information">
		<Stack direction="vertical" gap="3">
			<Input label="Email" type="email" value={email} disabled={true} />
			{#if createdAt}
				<Text size="sm" color="muted">Member since {createdAt}</Text>
			{/if}
		</Stack>
	</Panel>

	<Panel title="Session">
		<Stack direction="vertical" gap="3">
			<Text size="sm" color="muted">Sign out of your current session.</Text>
			<div>
				<Button variant="secondary" onclick={onlogout}>Log out</Button>
			</div>
		</Stack>
	</Panel>

	<div class="overflow-hidden rounded-lg border border-[var(--color-destructive-border)]">
		<Panel title="Danger Zone">
			<Stack direction="vertical" gap="3">
				<Text size="sm" color="destructive">
					Permanently delete your account and all associated data. This action cannot be undone.
				</Text>

				{#if !confirmDelete}
					<div>
						<Button variant="destructive" onclick={() => (confirmDelete = true)}>
							Delete account
						</Button>
					</div>
				{:else}
					<Stack direction="horizontal" gap="2" align="center">
						<Text size="sm" weight="medium">Are you sure?</Text>
						<Button variant="destructive" onclick={ondelete}>Yes, delete my account</Button>
						<Button variant="ghost" onclick={() => (confirmDelete = false)}>Cancel</Button>
					</Stack>
				{/if}
			</Stack>
		</Panel>
	</div>
</Stack>
