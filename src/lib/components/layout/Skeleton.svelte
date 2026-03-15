<script lang="ts">
  interface Props {
    variant?: 'line' | 'rect' | 'circle';
    width?: string;
    height?: string;
  }

  let { variant = 'rect', width = '100%', height = '1rem' }: Props = $props();
</script>

<div
  class="skeleton skeleton-{variant}"
  style="width: {width}; height: {height}"
  aria-hidden="true"
></div>

<style>
  .skeleton {
    background: var(--color-surface-muted);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  .skeleton-line {
    border-radius: var(--radius-sm);
  }
  .skeleton-rect {
    border-radius: var(--radius-md);
  }
  .skeleton-circle {
    border-radius: var(--radius-full);
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
