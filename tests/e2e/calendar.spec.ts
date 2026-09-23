import { expect, test } from "@playwright/test";

import {
  demoAdminCredentials,
  demoCredentials,
  loginAsDemoAdmin,
  loginAsDemoUser,
} from "./helpers/demo-login";

test("anonymous calendar request redirects to login", async ({ page }) => {
  await page.goto("/calendar");
  await expect(page).toHaveURL(/\/login/);
});

test("USER can view the calendar and cannot open the create page", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: "Calendar", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "New activity" })).toHaveCount(0);

  await page.goto("/calendar/new");
  await expect(page.getByRole("heading", { name: "New activity" })).toHaveCount(0);
});

test("ADMIN can create a calendar activity and see it listed", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const title = `E2E Calendar ${Date.now()}`;

  await loginAsDemoAdmin(page);
  await page.goto("/calendar/new");
  await expect(page.getByRole("heading", { name: "New activity", level: 2 })).toBeVisible();

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Type").selectOption({ label: "Activity" });
  await page.getByLabel("Start date (Asia/Manila)").fill("2026-09-23");
  await page.getByLabel("Start time (Asia/Manila)").fill("09:00");
  await page.getByLabel("Location").fill("OCCDO Hall");
  await page.getByRole("button", { name: "Create activity" }).click();

  await expect(page).toHaveURL(/\/calendar$/);
  await expect(page.getByRole("heading", { name: "Calendar", level: 2 })).toBeVisible();
  await page.goto("/calendar?year=2026&month=9");
  await expect(page.getByRole("cell", { name: title })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Activity", exact: true }).first()).toBeVisible();
});
