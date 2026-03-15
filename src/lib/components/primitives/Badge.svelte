<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
    size?: 'sm' | 'md';
    children: Snippet;
  }

  let { variant = 'default', size = 'sm', children }: Props = $props();
</script>

<span class="badge badge-{variant} badge-{size}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-body);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    border-radius: var(--radius-full);
    white-space: nowrap;
  }
  .badge-sm {
    padding: 2px var(--space-2);
    font-size: var(--text-xs);
  }
  .badge-md {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
  }
  .badge-default {
    background: var(--color-surface-muted);
    color: var(--color-text-muted);
  }
  .badge-accent {
    background: var(--color-accent-muted);
    color: var(--color-accent);
  }
  .badge-success {
    background: var(--color-success-muted);
    color: var(--color-success);
  }
  .badge-warning {
    background: var(--color-warning-muted);
    color: var(--color-warning);
  }
  .badge-destructive {
    background: var(--color-destructive-muted);
    color: var(--color-destructive);
  }
</style>
