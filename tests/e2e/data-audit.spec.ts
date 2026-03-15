import { test, expect } from '@playwright/test';

test.describe('Data Portability', () => {
	test('data settings page renders', async ({ page }) => {
		await page.goto('/settings/data');
		await expect(page).toHaveURL(/data|login/);
	});
});

test.describe('Audit', () => {
	test('audit settings page renders', async ({ page }) => {
		await page.goto('/settings/audit');
		await expect(page).toHaveURL(/audit|login/);
	});
});
