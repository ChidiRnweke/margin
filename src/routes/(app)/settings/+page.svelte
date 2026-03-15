<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
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

<PageHeader title="Settings" description="Manage your account, preferences, and data." />
<div class="settings-hub">
	<SettingsCardGrid cards={settingsCards} />
</div>

<style>
	.settings-hub {
		margin-top: var(--space-6);
	}
</style>
