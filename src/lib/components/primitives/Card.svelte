<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { padding = 'md', shadow = 'sm', children }: Props = $props();
</script>

<div class="card card-padding-{padding} card-shadow-{shadow}">
  {@render children()}
</div>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-lg);
  }
  .card-padding-none { padding: 0; }
  .card-padding-sm { padding: var(--space-3); }
  .card-padding-md { padding: var(--space-6); }
  .card-padding-lg { padding: var(--space-8); }
  .card-shadow-none { box-shadow: none; }
  .card-shadow-sm { box-shadow: var(--shadow-sm); }
  .card-shadow-md { box-shadow: var(--shadow-md); }
  .card-shadow-lg { box-shadow: var(--shadow-lg); }
</style>
