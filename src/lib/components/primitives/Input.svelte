<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Input as UiInput } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel' | 'date';
		value?: string;
		placeholder?: string;
		label?: string;
		hint?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		id?: string;
		name?: string;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		class?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
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
		min,
		max,
		step,
		class: className = '',
		oninput,
		onchange,
		children
	}: Props = $props();

	const inputId = $derived(id ?? name ?? `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<label class="text-sm font-semibold tracking-[0.02em] text-[var(--color-text)]" for={inputId}>
			{label}
			{#if required}
				<span class="ml-1 text-[var(--color-destructive)]" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<UiInput
		{type}
		id={inputId}
		{name}
		bind:value
		{placeholder}
		{disabled}
		{required}
		{min}
		{max}
		{step}
		{oninput}
		{onchange}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		class={cn(
			'border-[var(--color-glass-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[inset_0_1px_0_var(--color-glass-highlight)] placeholder:text-[var(--color-text-muted)]',
			error &&
				'border-[color:var(--color-destructive)] focus-visible:ring-[color:var(--color-destructive-shadow)]',
			className
		)}
	/>

	{#if children}
		{@render children()}
	{/if}

	{#if error}
		<p class="text-sm text-[var(--color-destructive)]" id={`${inputId}-error`} role="alert">
			{error}
		</p>
	{:else if hint}
		<p class="text-sm text-[var(--color-text-muted)]" id={`${inputId}-hint`}>{hint}</p>
	{/if}
</div>
