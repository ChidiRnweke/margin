<script lang="ts">
	/**
	 * Ambient page background — uses SVG grid and animated blobs to provide
	 * tonal variation and depth for the glassmorphic UI.
	 */
</script>

<div class="fixed inset-0 z-0 overflow-hidden bg-background" aria-hidden="true">
	<!-- SVG Grid Pattern -->
	<svg
		class="absolute inset-0 h-full w-full text-foreground opacity-[0.08]"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
				<path d="M0 32V.5H32" fill="none" stroke="currentColor" stroke-width="1"></path>
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
	</svg>
</div>
