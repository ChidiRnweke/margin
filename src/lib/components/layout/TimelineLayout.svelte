<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    days?: string[];
    children: Snippet;
    header?: Snippet;
  }

  let {
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    children,
    header
  }: Props = $props();
</script>

<div class="timeline">
  {#if header}
    <div class="timeline-header">
      {@render header()}
    </div>
  {/if}
  <div class="timeline-grid" style="--day-count: {days.length}">
    <div class="timeline-day-headers">
      {#each days as day}
        <div class="timeline-day-header">{day}</div>
      {/each}
    </div>
    <div class="timeline-body">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .timeline-header {
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-border-muted);
  }
  .timeline-grid {
    overflow-x: auto;
  }
  .timeline-day-headers {
    display: grid;
    grid-template-columns: repeat(var(--day-count), minmax(120px, 1fr));
    gap: 1px;
    background: var(--color-border-muted);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    overflow: hidden;
  }
  .timeline-day-header {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--color-text-muted);
    background: var(--color-surface-muted);
    text-align: center;
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
  }
  .timeline-body {
    display: grid;
    grid-template-columns: repeat(var(--day-count), minmax(120px, 1fr));
    gap: 1px;
    background: var(--color-border-muted);
    min-height: 200px;
  }
</style>
