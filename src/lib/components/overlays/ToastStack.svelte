<script lang="ts">
  import { onMount } from 'svelte';

  interface Toast {
    id: string;
    message: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
    duration?: number;
  }

  let toasts: Toast[] = $state([]);
  let timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  export function addToast(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = { ...toast, id };
    toasts = [...toasts, newToast];

    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    timers.set(id, timer);

    return id;
  }

  export function removeToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  onMount(() => {
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  });
</script>

{#if toasts.length > 0}
  <div class="toast-stack" aria-live="polite">
    {#each toasts as toast (toast.id)}
      <div class="toast toast-{toast.variant ?? 'default'}" role="status">
        <p class="toast-message">{toast.message}</p>
        <button class="toast-dismiss" onclick={() => removeToast(toast.id)} aria-label="Dismiss notification">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4L4 12M4 4l8 8" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-stack {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: 24rem;
    width: 100%;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    animation: slide-up var(--duration-normal) var(--ease-default);
    pointer-events: auto;
  }
  .toast-success { border-left: 3px solid var(--color-success); }
  .toast-warning { border-left: 3px solid var(--color-warning); }
  .toast-error { border-left: 3px solid var(--color-destructive); }
  .toast-default { border-left: 3px solid var(--color-accent); }
  .toast-message {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-text);
  }
  .toast-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
    cursor: pointer;
    flex-shrink: 0;
  }
  .toast-dismiss:hover { background: var(--color-surface-muted); }

  @keyframes slide-up { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
