<script lang="ts">
  import type { Snippet } from 'svelte';
  import CommandPalette from '$lib/components/overlays/CommandPalette.svelte';

  interface Props {
    children: Snippet;
    sidebar?: Snippet;
  }

  let { children, sidebar }: Props = $props();
  let commandPaletteOpen = $state(false);
  let sidebarCollapsed = $state(false);
</script>

<div class="app-shell" class:sidebar-collapsed={sidebarCollapsed}>
  {#if sidebar}
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-logo">Margin</span>
        <button
          class="sidebar-toggle"
          onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            {#if sidebarCollapsed}
              <path d="M6 3l5 5-5 5" />
            {:else}
              <path d="M10 3L5 8l5 5" />
            {/if}
          </svg>
        </button>
      </div>
      <nav class="sidebar-nav">
        {@render sidebar()}
      </nav>
      <div class="sidebar-footer">
        <button class="cmd-trigger" onclick={() => (commandPaletteOpen = true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          {#if !sidebarCollapsed}
            <span>Search</span>
            <kbd>⌘K</kbd>
          {/if}
        </button>
      </div>
    </aside>
  {/if}
  <main class="app-main">
    {@render children()}
  </main>
</div>

<CommandPalette bind:open={commandPaletteOpen} />

<style>
  .app-shell {
    display: grid;
    grid-template-columns: 16rem 1fr;
    min-height: 100dvh;
  }
  .sidebar-collapsed {
    grid-template-columns: 3.5rem 1fr;
  }
  .app-sidebar {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border-muted);
    padding: var(--space-4);
    overflow: hidden;
    transition: width var(--duration-normal) var(--ease-default);
  }
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-6);
  }
  .sidebar-logo {
    font-size: var(--text-lg);
    font-weight: var(--weight-bold);
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
  }
  .sidebar-collapsed .sidebar-logo { display: none; }
  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .sidebar-toggle:hover { background: var(--color-surface-muted); }
  .sidebar-nav { flex: 1; overflow-y: auto; }
  .sidebar-footer {
    border-top: 1px solid var(--color-border-muted);
    padding-top: var(--space-3);
  }
  .cmd-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-2);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-muted);
    color: var(--color-text-muted);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    transition: background var(--duration-fast) var(--ease-default);
  }
  .cmd-trigger:hover { background: var(--color-surface-raised); }
  .cmd-trigger kbd {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 1px var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-sm);
  }
  .app-main {
    overflow-y: auto;
    padding: var(--space-8);
    background: var(--color-bg);
  }

  @media (max-width: 768px) {
    .app-shell {
      grid-template-columns: 1fr;
    }
    .app-sidebar {
      display: none;
    }
  }
</style>
