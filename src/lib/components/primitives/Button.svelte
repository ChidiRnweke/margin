<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }

  let { variant = 'primary', size = 'md', disabled = false, type = 'button', onclick, children }: Props = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {disabled} {type} {onclick}>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-weight: var(--weight-medium);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--duration-fast) var(--ease-default);
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .btn-sm { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); }
  .btn-md { padding: var(--space-2) var(--space-4); font-size: var(--text-base); }
  .btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--text-lg); }
  .btn-primary { background: var(--color-accent); color: var(--color-accent-foreground); }
  .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
  .btn-secondary { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border); }
  .btn-secondary:hover:not(:disabled) { background: var(--color-surface-muted); }
  .btn-ghost { background: transparent; color: var(--color-text); }
  .btn-ghost:hover:not(:disabled) { background: var(--color-surface-muted); }
  .btn-destructive { background: var(--color-destructive); color: var(--color-accent-foreground); }
  .btn-destructive:hover:not(:disabled) { background: var(--color-destructive); opacity: 0.9; }
</style>
