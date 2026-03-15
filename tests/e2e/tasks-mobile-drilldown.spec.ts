import { test, expect } from '@playwright/test';

test.describe('Mobile Task Drilldown', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('tasks page renders on mobile', async ({ page }) => {
		await page.goto('/tasks');
		await expect(page).toHaveURL(/tasks|login/);
	});
});
