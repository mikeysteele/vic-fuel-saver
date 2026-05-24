import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

When('I select the {string} fuel type', async ({ page }, fuelType: string) => {
  // Ensure the API has finished loading so options are populated
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 60000 });
  
  // Opening the Fuel types MultiSelect explicitly by its container ID or robust label text
  const multiSelect = page.locator('button', { hasText: 'All Fuel Types' }).first(); 
  await multiSelect.click();
  const option = page.locator('label').filter({ hasText: fuelType });
  await option.click({ timeout: 60000 });
  
  // Click off to dismiss it cleanly
  await page.mouse.click(0, 0);
});

Then('the metrics board should display {string} average and cheapest prices', async ({ page }, fuelType: string) => {
  const badge = page.locator(`span:has-text("${fuelType}")`).first();
  await expect(badge).toBeVisible();
  
  const cheapLabel = page.locator('p:has-text("Cheapest")');
  await expect(cheapLabel).toBeVisible();
});
