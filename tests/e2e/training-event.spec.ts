import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can create a training event and see it listed", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const title = `E2E Training ${suffix}`;

  await loginAsDemoAdmin(page);
  await page.goto("/capacity-building/new");
  await expect(
    page.getByRole("heading", { name: "New training event", level: 2 }),
  ).toBeVisible();

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Kind").selectOption({ label: "Training" });
  await page.getByLabel("Venue").fill("OCCDO Hall");
  await page.getByLabel("Start date").fill("2026-09-22");
  await page.getByRole("button", { name: "Create event" }).click();

  await expect(page).toHaveURL(/\/capacity-building$/);
  await expect(page.getByRole("heading", { name: "Training events", level: 2 })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row.getByRole("cell", { name: title })).toBeVisible();
  await expect(row.getByRole("cell", { name: "Training", exact: true })).toBeVisible();
  await expect(row.getByRole("cell", { name: "OCCDO Hall" })).toBeVisible();
});
