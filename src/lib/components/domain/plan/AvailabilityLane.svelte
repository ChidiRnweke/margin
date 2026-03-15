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

<div class="pointer-events-none absolute inset-0">
	{#each windows as win}
		<div
			class="absolute rounded-sm bg-[var(--color-accent-muted)] opacity-25"
			style:left="{(win.dayIndex / totalDays) * 100}%"
			style:width="{(1 / totalDays) * 100}%"
			style:top="{(win.startHour - startHour) * 2.5}rem"
			style:height="{(win.endHour - win.startHour) * 2.5}rem"
		></div>
	{/each}
</div>
