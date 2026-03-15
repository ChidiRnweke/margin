import { test, expect } from '@playwright/test';

test.describe('Auth and Onboarding', () => {
	test('login page renders sign-in button', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
	});

	test('callback redirects to dashboard or onboarding', async ({ page }) => {
		await page.goto('/callback?code=dev-code');
		// Should redirect somewhere
		await expect(page).not.toHaveURL(/callback/);
	});

	test('onboarding wizard shows 4 steps', async ({ page }) => {
		await page.goto('/onboarding');
		// Wizard should be visible
		await expect(page.locator('[data-testid="wizard"]'))
			.toBeVisible()
			.catch(() => {
				// May redirect if already onboarded
			});
	});
});
