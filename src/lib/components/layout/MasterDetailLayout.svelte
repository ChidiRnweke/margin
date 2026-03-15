<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    master: Snippet;
    detail?: Snippet;
    masterWidth?: string;
  }

  let { master, detail, masterWidth = '24rem' }: Props = $props();
  let showDetail = $derived(!!detail);
</script>

<div class="master-detail" style="--master-width: {masterWidth}">
  <div class="master-pane" class:master-hidden={showDetail}>
    {@render master()}
  </div>
  {#if detail}
    <div class="detail-pane">
      {@render detail()}
    </div>
  {:else}
    <div class="detail-empty">
      <p class="detail-empty-text">Select an item to view details</p>
    </div>
  {/if}
</div>

<style>
  .master-detail {
    display: grid;
    grid-template-columns: var(--master-width) 1fr;
    height: 100%;
    min-height: 0;
  }
  .master-pane {
    border-right: 1px solid var(--color-border-muted);
    overflow-y: auto;
    background: var(--color-surface);
  }
  .detail-pane {
    overflow-y: auto;
    padding: var(--space-6);
    background: var(--color-bg);
  }
  .detail-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
  }
  .detail-empty-text {
    color: var(--color-text-faint);
    font-size: var(--text-sm);
  }

  @media (max-width: 768px) {
    .master-detail {
      grid-template-columns: 1fr;
    }
    .master-hidden {
      display: none;
    }
    .detail-pane {
      padding: var(--space-4);
    }
  }
</style>
