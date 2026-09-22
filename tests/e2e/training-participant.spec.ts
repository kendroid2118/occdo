import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can add a participant to a training event", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const title = `E2E Participants ${suffix}`;
  const participantName = `E2E Attendee ${suffix}`;

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
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();

  await page.getByLabel("Full name").fill(participantName);
  await page.getByLabel("Contact number").fill("09171234567");
  await page.getByRole("button", { name: "Add participant" }).click();

  await expect(page).toHaveURL(/\/capacity-building\/[^/]+$/);
  const row = page.getByRole("row").filter({ hasText: participantName });
  await expect(row.getByRole("cell", { name: participantName })).toBeVisible();
  await expect(row.getByRole("cell", { name: "Walk-in" })).toBeVisible();
  await expect(page.getByText("09171234567")).toHaveCount(0);
});
