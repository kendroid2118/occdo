import { expect, test } from "@playwright/test";

import { demoCredentials, loginAsDemoUser } from "./helpers/demo-login";

test("anonymous reports request redirects to login", async ({ page }) => {
  await page.goto("/reports");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "OCCDO sign in" })).toBeVisible();
});

test("authenticated USER can filter cooperative and membership reports", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Reports", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cooperative report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Membership report" })).toBeVisible();
  await expect(page.getByTestId("report-active-filters")).toContainText("Asia/Manila");

  await page.getByLabel("Date from (Asia/Manila)").fill("1900-01-01");
  await page.getByLabel("Date to (Asia/Manila)").fill("1900-01-02");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page.getByText("No cooperatives match these filters.")).toBeVisible();
  await expect(
    page.getByText("No membership snapshots fall in this Asia/Manila date range."),
  ).toBeVisible();
  await expect(page.getByTestId("report-active-filters")).toContainText(
    "1900-01-01 to 1900-01-02",
  );

  await page.goto("/reports?dateFrom=2026-09-30&dateTo=2026-09-01");
  await expect(page.getByRole("alert")).toContainText("Check the report filters");
});
