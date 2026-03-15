<script lang="ts">
  interface CommandItem {
    id: string;
    label: string;
    description?: string;
    action: () => void;
    shortcut?: string;
  }

  interface Props {
    open: boolean;
    items?: CommandItem[];
    onclose?: () => void;
  }

  let { open = $bindable(), items = [], onclose }: Props = $props();
  let query = $state('');
  let selectedIndex = $state(0);

  let filtered = $derived(
    query.length === 0
      ? items
      : items.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase())
        )
  );

  $effect(() => {
    if (open) {
      query = '';
      selectedIndex = 0;
    }
  });

  function close() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      close();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open = !open;
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="palette-backdrop" role="dialog" aria-modal="true" aria-label="Command palette" onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="palette-panel">
      <div class="palette-input-wrapper">
        <svg class="palette-search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="8" cy="8" r="5" />
          <path d="M12 12l4 4" />
        </svg>
        <!-- svelte-ignore a11y_autofocus -->
        <input
          class="palette-input"
          type="text"
          placeholder="Search commands..."
          bind:value={query}
          autofocus
        />
      </div>
      {#if filtered.length > 0}
        <ul class="palette-list" role="listbox">
          {#each filtered as item, i (item.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li
              class="palette-item"
              class:palette-item-active={i === selectedIndex}
              role="option"
              aria-selected={i === selectedIndex}
              onmouseenter={() => (selectedIndex = i)}
              onclick={() => { item.action(); close(); }}
            >
              <div class="palette-item-content">
                <span class="palette-item-label">{item.label}</span>
                {#if item.description}
                  <span class="palette-item-desc">{item.description}</span>
                {/if}
              </div>
              {#if item.shortcut}
                <kbd class="palette-shortcut">{item.shortcut}</kbd>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <div class="palette-empty">
          <p>No results found</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .palette-backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 20vh;
    background: oklch(0 0 0 / 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fade-in var(--duration-fast) var(--ease-default);
  }
  .palette-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 32rem;
    overflow: hidden;
    animation: scale-in var(--duration-fast) var(--ease-default);
  }
  .palette-input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-muted);
  }
  .palette-search-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  .palette-input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    outline: none;
  }
  .palette-input::placeholder {
    color: var(--color-text-faint);
  }
  .palette-list {
    list-style: none;
    padding: var(--space-2);
    margin: 0;
    max-height: 20rem;
    overflow-y: auto;
  }
  .palette-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-default);
  }
  .palette-item-active {
    background: var(--color-surface-muted);
  }
  .palette-item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .palette-item-label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }
  .palette-item-desc {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
  .palette-shortcut {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px var(--space-2);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
  }
  .palette-empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-faint);
    font-size: var(--text-sm);
  }

  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scale-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
