import { expect, test } from "@playwright/test";

import {
  demoAdminCredentials,
  demoCredentials,
  loginAsDemoAdmin,
  loginAsDemoUser,
} from "./helpers/demo-login";

test("anonymous announcements request redirects to login", async ({ page }) => {
  await page.goto("/calendar/announcements");
  await expect(page).toHaveURL(/\/login/);
});

test("USER can view announcements and cannot open the create page", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/calendar/announcements");
  await expect(page.getByRole("heading", { name: "Announcements", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "New announcement" })).toHaveCount(0);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Announcements" })).toBeVisible();

  await page.goto("/calendar/announcements/new");
  await expect(page.getByRole("heading", { name: "New announcement", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Publish announcement" })).toHaveCount(0);
});

test("ADMIN can publish an announcement and see it on the dashboard", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const title = `E2E Announcement ${Date.now()}`;
  const body = `Plain text notice ${Date.now()}.`;

  await loginAsDemoAdmin(page);
  await page.goto("/calendar/announcements/new");
  await expect(page.getByRole("heading", { name: "New announcement", level: 2 })).toBeVisible();

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Body").fill(body);
  await page.getByLabel("Published date (Asia/Manila)").fill("2026-09-01");
  await page.getByLabel("Published time (Asia/Manila)").fill("08:00");
  await page.getByRole("button", { name: "Publish announcement" }).click();

  await expect(page).toHaveURL(/\/calendar\/announcements$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(body)).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Announcements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(body)).toBeVisible();
});
