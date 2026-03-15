<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;
  }

  let { title, description, actions }: Props = $props();
</script>

<div class="page-header">
  <div class="page-header-text">
    <h1 class="page-title">{title}</h1>
    {#if description}
      <p class="page-description">{description}</p>
    {/if}
  </div>
  {#if actions}
    <div class="page-actions">
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }
  .page-header-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .page-title {
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    color: var(--color-text);
  }
  .page-description {
    font-size: var(--text-base);
    color: var(--color-text-muted);
  }
  .page-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
    }
  }
</style>
