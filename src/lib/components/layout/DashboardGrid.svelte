<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    columns?: number;
    minWidth?: string;
    gap?: '4' | '6' | '8';
    children: Snippet;
  }

  let { columns = 4, minWidth = '280px', gap = '6', children }: Props = $props();
</script>

<div
  class="dashboard-grid grid-gap-{gap}"
  style="--grid-columns: {columns}; --grid-min-width: {minWidth}"
>
  {@render children()}
</div>

<style>
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-width), 1fr));
  }
  .grid-gap-4 { gap: var(--space-4); }
  .grid-gap-6 { gap: var(--space-6); }
  .grid-gap-8 { gap: var(--space-8); }
</style>
