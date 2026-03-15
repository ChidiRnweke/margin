<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Stack from '$lib/components/primitives/Stack.svelte';
	import ProfileSliders from '$lib/components/domain/settings/ProfileSliders.svelte';
	import Button from '$lib/components/primitives/Button.svelte';

	interface PageData {
		aspectWeights: { id: string; name: string; weight: number }[];
		thresholds: { overcommit: number; undercommit: number };
	}

	let { data }: { data: PageData } = $props();
</script>

<Stack direction="vertical" gap="6">
	<PageHeader title="Profile" description="Configure your aspect weights and scoring thresholds.">
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => (window.location.href = '/settings')}>
				Back to settings
			</Button>
		{/snippet}
	</PageHeader>

	<div class="max-w-2xl">
		<ProfileSliders
			aspectWeights={data.aspectWeights}
			overcommitThreshold={data.thresholds.overcommit}
			undercommitThreshold={data.thresholds.undercommit}
		/>
	</div>
</Stack>
