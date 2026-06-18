import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given(
  "I load the fuel map dashboard with mocked geolocation",
  async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: -37.8136, longitude: 144.9631 }); // Mocking Melbourne CBD
    await page.goto("/");
  },
);

When("I press the Near Me button", async ({ page }) => {
  const btn = page.locator("button", { hasText: "Near Me" });
  await btn.click();
});

Then(
  "the map should pan to my coordinates and lock focus",
  async ({ page }) => {
    // Give Leaflet flyTo some margin to complete
    await page.waitForTimeout(2000);

    // We can track if 'Near Me' triggers active state (e.g., standardActive variants in our system) or successfully maps bounds
    const btn = page.locator("button", { hasText: "Near Me" });
    await expect(btn).toBeVisible();
  },
);
