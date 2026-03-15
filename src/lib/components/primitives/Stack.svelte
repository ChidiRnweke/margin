<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    direction?: 'vertical' | 'horizontal';
    gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    wrap?: boolean;
    children: Snippet;
  }

  let {
    direction = 'vertical',
    gap = '4',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    children
  }: Props = $props();
</script>

<div
  class="stack stack-{direction} stack-gap-{gap} stack-align-{align} stack-justify-{justify}"
  class:stack-wrap={wrap}
>
  {@render children()}
</div>

<style>
  .stack { display: flex; }
  .stack-vertical { flex-direction: column; }
  .stack-horizontal { flex-direction: row; }
  .stack-wrap { flex-wrap: wrap; }
  /* Gap */
  .stack-gap-0 { gap: var(--space-0); }
  .stack-gap-1 { gap: var(--space-1); }
  .stack-gap-2 { gap: var(--space-2); }
  .stack-gap-3 { gap: var(--space-3); }
  .stack-gap-4 { gap: var(--space-4); }
  .stack-gap-5 { gap: var(--space-5); }
  .stack-gap-6 { gap: var(--space-6); }
  .stack-gap-8 { gap: var(--space-8); }
  .stack-gap-10 { gap: var(--space-10); }
  .stack-gap-12 { gap: var(--space-12); }
  .stack-gap-16 { gap: var(--space-16); }
  /* Align */
  .stack-align-start { align-items: flex-start; }
  .stack-align-center { align-items: center; }
  .stack-align-end { align-items: flex-end; }
  .stack-align-stretch { align-items: stretch; }
  .stack-align-baseline { align-items: baseline; }
  /* Justify */
  .stack-justify-start { justify-content: flex-start; }
  .stack-justify-center { justify-content: center; }
  .stack-justify-end { justify-content: flex-end; }
  .stack-justify-between { justify-content: space-between; }
  .stack-justify-around { justify-content: space-around; }
</style>
