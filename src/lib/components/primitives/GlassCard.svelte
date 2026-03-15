<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    padding?: 'sm' | 'md' | 'lg';
    intensity?: 'default' | 'strong';
    children: Snippet;
  }

  let { padding = 'md', intensity = 'default', children }: Props = $props();
</script>

<div class="glass glass-{intensity} glass-padding-{padding}">
  {@render children()}
</div>

<style>
  .glass {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-glass-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .glass-default {
    background: var(--color-glass);
    box-shadow: var(--shadow-md);
  }
  .glass-strong {
    background: var(--color-glass-strong);
    box-shadow: var(--shadow-lg);
  }
  .glass-padding-sm { padding: var(--space-3); }
  .glass-padding-md { padding: var(--space-6); }
  .glass-padding-lg { padding: var(--space-8); }

  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur(1px)) {
    .glass-default {
      background: var(--color-surface-raised);
    }
    .glass-strong {
      background: var(--color-surface);
    }
  }
</style>
