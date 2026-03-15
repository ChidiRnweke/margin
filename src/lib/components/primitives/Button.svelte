<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button as UiButton } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link';
	type Size = 'sm' | 'md' | 'lg' | 'icon';

	interface Props {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		class?: string;
		name?: string;
		value?: string;
		form?: string;
		formaction?: string;
		ariaLabel?: string;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		href,
		class: className = '',
		name,
		value,
		form,
		formaction,
		ariaLabel,
		onclick,
		children
	}: Props = $props();

	const mappedVariant = $derived(
		variant === 'primary'
			? 'default'
			: variant === 'secondary'
				? 'secondary'
				: variant === 'outline'
					? 'outline'
					: variant
	);
	const mappedSize = $derived(size === 'md' ? 'default' : size);
	const classes = $derived(
		cn(
			'font-body rounded-[var(--radius-lg)] border-[var(--color-glass-border)] transition-all duration-200',
			variant === 'primary' &&
				'bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-strong))] text-[var(--color-accent-foreground)] shadow-[0_18px_48px_-24px_var(--color-accent-shadow)] hover:brightness-[1.03]',
			variant === 'secondary' &&
				'border-[var(--color-glass-border)] bg-[var(--color-glass)] text-[var(--color-text)] backdrop-blur-md hover:bg-[var(--color-glass-strong)]',
			variant === 'outline' &&
				'border-[color:var(--color-border-strong)] bg-[color:var(--color-panel)] text-[var(--color-text)] hover:bg-[color:var(--color-panel-strong)]',
			variant === 'ghost' && 'text-[var(--color-text)] hover:bg-[var(--color-glass)]',
			variant === 'link' && 'px-0 text-[var(--color-accent)] underline-offset-4 hover:underline',
			variant === 'destructive' &&
				'bg-[color:var(--color-destructive)] text-[var(--color-text)] shadow-[0_18px_48px_-28px_var(--color-destructive-shadow)] hover:brightness-[1.03]',
			className
		)
	);
</script>

<UiButton
	variant={mappedVariant}
	size={mappedSize}
	{disabled}
	{type}
	{href}
	class={classes}
	{name}
	{value}
	{form}
	{formaction}
	aria-label={ariaLabel}
	{onclick}
>
	{@render children()}
</UiButton>
