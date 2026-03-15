<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import SettingsCardGrid from '$lib/components/domain/settings/SettingsCardGrid.svelte';

	const settingsCards = [
		{
			title: 'Profile',
			description: 'Adjust aspect weights and scoring thresholds.',
			href: '/settings/profile',
			icon: '👤'
		},
		{
			title: 'Availability',
			description: 'Define your weekly availability windows.',
			href: '/settings/availability',
			icon: '📅'
		},
		{
			title: 'Account',
			description: 'Manage your account and security settings.',
			href: '/settings/account',
			icon: '🔒'
		},
		{
			title: 'Data',
			description: 'Export your data or import from a backup.',
			href: '/settings/data',
			icon: '💾'
		},
		{
			title: 'Audit Log',
			description: 'Review a log of all changes to your account.',
			href: '/settings/audit',
			icon: '📋'
		}
	];
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Settings" description="Manage your account, preferences, and data." />
	<SettingsCardGrid cards={settingsCards} />
</Stack>
