<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onclose?: () => void;
    side?: 'left' | 'right';
    title?: string;
    children: Snippet;
  }

  let { open = $bindable(), onclose, side = 'right', title, children }: Props = $props();

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
  <div class="drawer-backdrop" role="dialog" aria-modal="true" aria-label={title ?? 'Drawer'} onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="drawer-panel drawer-{side}">
      <div class="drawer-header">
        {#if title}
          <h2 class="drawer-title">{title}</h2>
        {/if}
        <button class="drawer-close" onclick={close} aria-label="Close drawer">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 5L5 15M5 5l10 10" />
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    background: oklch(0 0 0 / 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fade-in var(--duration-fast) var(--ease-default);
  }
  .drawer-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 24rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
  }
  .drawer-right {
    right: 0;
    animation: slide-in-right var(--duration-normal) var(--ease-default);
  }
  .drawer-left {
    left: 0;
    animation: slide-in-left var(--duration-normal) var(--ease-default);
  }
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-muted);
  }
  .drawer-title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
  }
  .drawer-close {
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
    margin-left: auto;
    transition: background var(--duration-fast) var(--ease-default);
  }
  .drawer-close:hover { background: var(--color-surface-muted); }
  .drawer-close:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .drawer-body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }

  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
</style>
