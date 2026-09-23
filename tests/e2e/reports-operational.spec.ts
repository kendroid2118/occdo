import { expect, test } from "@playwright/test";

import { demoCredentials, loginAsDemoUser } from "./helpers/demo-login";

test("authenticated USER can read operational reports and empty filters", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Summary report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Assistance report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Training report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compliance report" })).toBeVisible();
  await expect(page.getByLabel("Assistance type")).toBeVisible();
  await expect(page.getByLabel("Training kind")).toBeVisible();
  await expect(page.getByLabel("Compliance status")).toBeVisible();

  await page.getByLabel("Date from (Asia/Manila)").fill("1900-01-01");
  await page.getByLabel("Date to (Asia/Manila)").fill("1900-01-02");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page.getByText("No assistance records match these filters.")).toBeVisible();
  await expect(page.getByText("No training events match these filters.")).toBeVisible();
  await expect(page.getByText("No compliance records match these filters.")).toBeVisible();
  await expect(page.getByText("Ledger disbursed")).toBeVisible();
});
