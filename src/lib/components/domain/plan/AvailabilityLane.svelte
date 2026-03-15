<script lang="ts">
	interface AvailabilityWindow {
		dayIndex: number;
		startHour: number;
		endHour: number;
	}

	interface Props {
		windows: AvailabilityWindow[];
		totalDays?: number;
		startHour?: number;
	}

	let { windows, totalDays = 7, startHour = 6 }: Props = $props();
</script>

<div class="availability-lane">
	{#each windows as win}
		<div
			class="availability-window"
			style:left="{(win.dayIndex / totalDays) * 100}%"
			style:width="{(1 / totalDays) * 100}%"
			style:top="{(win.startHour - startHour) * 2.5}rem"
			style:height="{(win.endHour - win.startHour) * 2.5}rem"
		></div>
	{/each}
</div>

<style>
	.availability-lane {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}
	.availability-window {
		position: absolute;
		background: var(--color-accent-muted);
		opacity: 0.25;
		border-radius: var(--radius-sm);
	}
</style>
