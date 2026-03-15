<script lang="ts">
	/**
	 * Panel — delegates to GlassPanel (Level 1 glass surface).
	 * Kept for backward compatibility; prefer using GlassPanel directly.
	 */
	import type { Snippet } from 'svelte';
	import GlassPanel from './GlassPanel.svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		title?: string;
		padding?: 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
	}

	let { title, padding = 'md', class: className = '', children }: Props = $props();
</script>

<GlassPanel {title} {padding} class={className}>
	{@render children()}
</GlassPanel>
