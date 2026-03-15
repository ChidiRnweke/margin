<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    steps: string[];
    currentStep: number;
    children: Snippet;
  }

  let { steps, currentStep, children }: Props = $props();
</script>

<div class="wizard">
  <nav class="wizard-steps" aria-label="Wizard progress">
    <ol class="wizard-step-list">
      {#each steps as step, i}
        <li
          class="wizard-step"
          class:wizard-step-active={i === currentStep}
          class:wizard-step-done={i < currentStep}
          aria-current={i === currentStep ? 'step' : undefined}
        >
          <span class="wizard-step-indicator">
            {#if i < currentStep}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7l3 3 5-5" />
              </svg>
            {:else}
              {i + 1}
            {/if}
          </span>
          <span class="wizard-step-label">{step}</span>
        </li>
      {/each}
    </ol>
  </nav>
  <div class="wizard-content">
    {@render children()}
  </div>
</div>

<style>
  .wizard {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100dvh;
    padding: var(--space-8) var(--space-4);
    background: var(--color-bg);
  }
  .wizard-steps {
    width: 100%;
    max-width: 36rem;
    margin-bottom: var(--space-8);
  }
  .wizard-step-list {
    display: flex;
    list-style: none;
    padding: 0;
    gap: var(--space-4);
    justify-content: center;
  }
  .wizard-step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-faint);
  }
  .wizard-step-active {
    color: var(--color-accent);
    font-weight: var(--weight-medium);
  }
  .wizard-step-done {
    color: var(--color-success);
  }
  .wizard-step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    border: 1.5px solid currentColor;
    flex-shrink: 0;
  }
  .wizard-step-active .wizard-step-indicator {
    background: var(--color-accent);
    color: var(--color-accent-foreground);
    border-color: var(--color-accent);
  }
  .wizard-step-done .wizard-step-indicator {
    background: var(--color-success);
    color: white;
    border-color: var(--color-success);
  }
  .wizard-step-label {
    display: none;
  }
  .wizard-content {
    width: 100%;
    max-width: 36rem;
  }

  @media (min-width: 640px) {
    .wizard-step-label { display: inline; }
  }
</style>
