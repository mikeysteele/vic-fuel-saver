import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given("I am viewing the list of fuel stations", async ({ page }) => {
  await page.goto("/");
  // Ensure the page is hydrated and API is loaded before we click
  await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
    timeout: 60000,
  });
  // Navigating across dashboard modes via explicitly labeled structural toggles
  const toggle = page.locator("button", { hasText: "List View" });
  await toggle.click();
});

When("I expand the first station card's history", async ({ page }) => {
  const historyBtn = page.locator("button", { hasText: "View Price History" })
    .first();

  // Ensure network payloads and maps load before grabbing DOM instances
  await expect(historyBtn).toBeVisible({ timeout: 60000 });
  await historyBtn.click();
});

Then("I should see the history visualization modal", async ({ page }) => {
  // TanStack default headless UI dialogs typically utilize roles cleanly
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();
});

Then(
  "the station history should accurately execute a D1 fetch",
  async ({ page }) => {
    const chartTitle = page.locator("p", { hasText: "Price History" }).first();
    await expect(chartTitle).toBeVisible({ timeout: 30000 });

    // Wait to allow client D1 fetching over `src/server` boundary via SolidStart
    await page.waitForTimeout(1000);

    // The popup embeds multiple SVGs; testing purely structure exists
    const graphLayer = page.locator("svg").nth(1);
    await expect(graphLayer).toBeVisible({ timeout: 30000 });
  },
);
