<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Toast {
		id: string;
		message: string;
		variant?: 'default' | 'success' | 'warning' | 'error';
		duration?: number;
	}

	let toasts: Toast[] = $state([]);
	let timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

	const variantBorderMap: Record<string, string> = {
		default: 'border-l-[3px] border-l-[var(--color-accent)]',
		success: 'border-l-[3px] border-l-[var(--color-success)]',
		warning: 'border-l-[3px] border-l-[var(--color-warning)]',
		error: 'border-l-[3px] border-l-[var(--color-destructive)]'
	};

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
	<div
		class="pointer-events-none fixed right-6 bottom-6 z-[60] flex w-full max-w-sm flex-col gap-2"
		aria-live="polite"
	>
		{#each toasts as toast (toast.id)}
			<div
				class={cn(
					'animate-in slide-in-from-bottom-2 pointer-events-auto flex items-center gap-3 rounded-[10px] border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] px-4 py-3 shadow-glass-sm backdrop-blur-md',
					variantBorderMap[toast.variant ?? 'default']
				)}
				role="status"
			>
				<p class="flex-1 text-sm text-[var(--color-text)]">{toast.message}</p>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6 shrink-0"
					onclick={() => removeToast(toast.id)}
					aria-label="Dismiss notification"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M12 4L4 12M4 4l8 8" />
					</svg>
				</Button>
			</div>
		{/each}
	</div>
{/if}
