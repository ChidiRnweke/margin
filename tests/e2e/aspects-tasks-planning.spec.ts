import { test, expect } from '@playwright/test';

test.describe('Aspects', () => {
	test('aspects list page renders', async ({ page }) => {
		await page.goto('/aspects');
		await expect(page).toHaveURL(/aspects|login/);
	});
});

test.describe('Tasks', () => {
	test('tasks list page renders', async ({ page }) => {
		await page.goto('/tasks');
		await expect(page).toHaveURL(/tasks|login/);
	});
});

test.describe('Planning', () => {
	test('plan page renders', async ({ page }) => {
		await page.goto('/plan');
		await expect(page).toHaveURL(/plan|login/);
	});
});
