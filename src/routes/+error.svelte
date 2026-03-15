<script lang="ts">
  import { page } from '$app/stores';
  import Text from '$lib/components/primitives/Text.svelte';
  import Button from '$lib/components/primitives/Button.svelte';
  import Stack from '$lib/components/primitives/Stack.svelte';
</script>

<div class="error-page">
  <Stack gap="6" align="center">
    <Text size="4xl" weight="bold">
      {#snippet children()}{$page.status}{/snippet}
    </Text>
    <Text size="lg" color="muted">
      {#snippet children()}{$page.error?.message ?? 'Something went wrong'}{/snippet}
    </Text>
    <Button variant="primary" onclick={() => window.location.href = '/'}>
      {#snippet children()}Go Home{/snippet}
    </Button>
  </Stack>
</div>

<style>
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    padding: var(--space-8);
  }
</style>
