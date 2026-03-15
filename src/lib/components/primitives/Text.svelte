<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'div';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: 'default' | 'muted' | 'faint' | 'accent' | 'success' | 'warning' | 'destructive';
    tracking?: 'tight' | 'normal' | 'wide';
    leading?: 'tight' | 'normal' | 'relaxed';
    align?: 'left' | 'center' | 'right';
    children: Snippet;
  }

  let {
    as = 'p',
    size = 'base',
    weight = 'normal',
    color = 'default',
    tracking = 'normal',
    leading = 'normal',
    align = 'left',
    children
  }: Props = $props();
</script>

<svelte:element
  this={as}
  class="text text-size-{size} text-weight-{weight} text-color-{color} text-tracking-{tracking} text-leading-{leading} text-align-{align}"
>
  {@render children()}
</svelte:element>

<style>
  .text { margin: 0; }
  /* Size */
  .text-size-xs { font-size: var(--text-xs); }
  .text-size-sm { font-size: var(--text-sm); }
  .text-size-base { font-size: var(--text-base); }
  .text-size-lg { font-size: var(--text-lg); }
  .text-size-xl { font-size: var(--text-xl); }
  .text-size-2xl { font-size: var(--text-2xl); }
  .text-size-3xl { font-size: var(--text-3xl); }
  .text-size-4xl { font-size: var(--text-4xl); }
  /* Weight */
  .text-weight-normal { font-weight: var(--weight-normal); }
  .text-weight-medium { font-weight: var(--weight-medium); }
  .text-weight-semibold { font-weight: var(--weight-semibold); }
  .text-weight-bold { font-weight: var(--weight-bold); }
  /* Color */
  .text-color-default { color: var(--color-text); }
  .text-color-muted { color: var(--color-text-muted); }
  .text-color-faint { color: var(--color-text-faint); }
  .text-color-accent { color: var(--color-accent); }
  .text-color-success { color: var(--color-success); }
  .text-color-warning { color: var(--color-warning); }
  .text-color-destructive { color: var(--color-destructive); }
  /* Tracking */
  .text-tracking-tight { letter-spacing: var(--tracking-tight); }
  .text-tracking-normal { letter-spacing: var(--tracking-normal); }
  .text-tracking-wide { letter-spacing: var(--tracking-wide); }
  /* Leading */
  .text-leading-tight { line-height: var(--leading-tight); }
  .text-leading-normal { line-height: var(--leading-normal); }
  .text-leading-relaxed { line-height: var(--leading-relaxed); }
  /* Align */
  .text-align-left { text-align: left; }
  .text-align-center { text-align: center; }
  .text-align-right { text-align: right; }
</style>
