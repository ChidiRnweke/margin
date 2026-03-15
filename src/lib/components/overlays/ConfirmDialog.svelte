<script lang="ts">
  interface Props {
    open: boolean;
    onconfirm?: () => void;
    oncancel?: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }

  let {
    open = $bindable(),
    onconfirm,
    oncancel,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
  }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      cancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      cancel();
    }
  }

  function confirm() {
    open = false;
    onconfirm?.();
  }

  function cancel() {
    open = false;
    oncancel?.();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="confirm-backdrop" role="alertdialog" aria-modal="true" aria-label={title} onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="confirm-panel">
      <h2 class="confirm-title">{title}</h2>
      <p class="confirm-message">{message}</p>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" onclick={cancel}>{cancelLabel}</button>
        <button class="confirm-btn confirm-btn-confirm" onclick={confirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: oklch(0 0 0 / 0.4);
    animation: fade-in var(--duration-fast) var(--ease-default);
  }
  .confirm-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-6);
    width: 100%;
    max-width: 24rem;
    animation: scale-in var(--duration-normal) var(--ease-default);
  }
  .confirm-title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-2);
  }
  .confirm-message {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
  }
  .confirm-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }
  .confirm-btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--duration-fast) var(--ease-default);
  }
  .confirm-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .confirm-btn-cancel {
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .confirm-btn-cancel:hover { background: var(--color-surface-muted); }
  .confirm-btn-confirm {
    background: var(--color-destructive);
    color: var(--color-accent-foreground);
  }
  .confirm-btn-confirm:hover { opacity: 0.9; }

  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
