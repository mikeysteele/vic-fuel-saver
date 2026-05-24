import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('I load the fuel map dashboard', async ({ page }) => {
  await page.goto('/');
});

Then('the map should be visible', async ({ page }) => {
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 30000 });
});

Then('I should see fuel station markers', async ({ page }) => {
  await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
});

When('I pan the map to a new location', async ({ page }) => {
  // Let the map tiles fully render
  await page.waitForTimeout(2000); 

  const map = page.locator('.leaflet-container');
  const box = await map.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2 - 200);
    await page.mouse.up();
  }
});

Then('I should see new fuel station markers load', async ({ page }) => {
  await page.waitForTimeout(1000); // Wait for API debounce/fetch
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 30000 });
});
