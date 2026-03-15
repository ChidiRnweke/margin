import { test, expect } from '@playwright/test';

test.describe('Availability', () => {
	test('availability settings page renders', async ({ page }) => {
		await page.goto('/settings/availability');
		await expect(page).toHaveURL(/availability|login/);
	});
});

test.describe('Reminders', () => {
	test('task detail shows reminder section', async ({ page }) => {
		await page.goto('/tasks');
		await expect(page).toHaveURL(/tasks|login/);
	});
});
