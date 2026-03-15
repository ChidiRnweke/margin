<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onclose?: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { open = $bindable(), onclose, title, size = 'md', children }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  function close() {
    open = false;
    onclose?.();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label={title ?? 'Dialog'} onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="modal-panel modal-{size}">
      {#if title}
        <div class="modal-header">
          <h2 class="modal-title">{title}</h2>
          <button class="modal-close" onclick={close} aria-label="Close dialog">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
        </div>
      {/if}
      <div class="modal-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: oklch(0 0 0 / 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fade-in var(--duration-fast) var(--ease-default);
  }
  .modal-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    animation: scale-in var(--duration-normal) var(--ease-default);
  }
  .modal-sm { max-width: 24rem; }
  .modal-md { max-width: 32rem; }
  .modal-lg { max-width: 48rem; }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-muted);
  }
  .modal-title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
  }
  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-default);
  }
  .modal-close:hover { background: var(--color-surface-muted); }
  .modal-close:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .modal-body {
    padding: var(--space-6);
  }

  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
