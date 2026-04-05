import { test, expect } from '@playwright/test';

test('has basic title and header', async ({ page }) => {
  await page.goto('/');
  
  // Example assertion
  await expect(page).toHaveTitle(/FuelSaverVic/);
});
