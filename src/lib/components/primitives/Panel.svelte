<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    padding?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { title, padding = 'md', children }: Props = $props();
</script>

<section class="panel panel-padding-{padding}">
  {#if title}
    <h3 class="panel-title">{title}</h3>
  {/if}
  <div class="panel-content">
    {@render children()}
  </div>
</section>

<style>
  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-lg);
  }
  .panel-padding-sm { padding: var(--space-3); }
  .panel-padding-md { padding: var(--space-6); }
  .panel-padding-lg { padding: var(--space-8); }
  .panel-title {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  .panel-content {
    color: var(--color-text);
  }
</style>
