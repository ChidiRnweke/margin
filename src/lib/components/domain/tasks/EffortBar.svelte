<script lang="ts">
	interface Props {
		value: number;
		max?: number;
	}

	let { value, max = 8 }: Props = $props();

	let percentage = $derived(Math.min(100, Math.round((value / max) * 100)));
</script>

<div class="effort-bar" title="{value}/{max}h effort">
	<div class="effort-fill" style="width: {percentage}%"></div>
</div>

<style>
	.effort-bar {
		width: 4rem;
		height: 6px;
		background: var(--color-surface-muted);
		border-radius: var(--radius-full);
		overflow: hidden;
	}
	.effort-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-full);
		transition: width var(--duration-normal) var(--easing);
	}
</style>
