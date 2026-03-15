<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';
    value?: string;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    id?: string;
    name?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    children?: Snippet;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label,
    hint,
    error,
    disabled = false,
    required = false,
    id,
    name,
    oninput,
    onchange,
    children
  }: Props = $props();

  let inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="input-wrapper">
  {#if label}
    <label class="input-label" for={inputId}>
      {label}
      {#if required}<span class="input-required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}
  <input
    class="input-field"
    class:input-error={!!error}
    {type}
    id={inputId}
    {name}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {oninput}
    {onchange}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
  />
  {#if children}
    {@render children()}
  {/if}
  {#if error}
    <p class="input-message input-message-error" id="{inputId}-error" role="alert">{error}</p>
  {:else if hint}
    <p class="input-message" id="{inputId}-hint">{hint}</p>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .input-label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }
  .input-required {
    color: var(--color-destructive);
    margin-left: 2px;
  }
  .input-field {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: border-color var(--duration-fast) var(--ease-default),
                box-shadow var(--duration-fast) var(--ease-default);
  }
  .input-field::placeholder {
    color: var(--color-text-faint);
  }
  .input-field:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-muted);
  }
  .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .input-error {
    border-color: var(--color-destructive);
  }
  .input-error:focus {
    box-shadow: 0 0 0 3px var(--color-destructive-muted);
  }
  .input-message {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .input-message-error {
    color: var(--color-destructive);
  }
</style>
