<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    icon?: Snippet;
    action?: Snippet;
  }

  let { title, description, icon, action }: Props = $props();
</script>

<div class="empty-state">
  {#if icon}
    <div class="empty-icon">
      {@render icon()}
    </div>
  {:else}
    <div class="empty-icon empty-icon-default">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="8" y="8" width="32" height="32" rx="4" />
        <path d="M18 24h12M24 18v12" />
      </svg>
    </div>
  {/if}
  <h3 class="empty-title">{title}</h3>
  {#if description}
    <p class="empty-description">{description}</p>
  {/if}
  {#if action}
    <div class="empty-action">
      {@render action()}
    </div>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-12) var(--space-6);
  }
  .empty-icon {
    margin-bottom: var(--space-4);
  }
  .empty-icon-default {
    color: var(--color-text-faint);
  }
  .empty-title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-2);
  }
  .empty-description {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    max-width: 24rem;
    margin-bottom: var(--space-6);
  }
  .empty-action {
    margin-top: var(--space-2);
  }
</style>
