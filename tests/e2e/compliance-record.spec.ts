import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can create a compliance record and see it listed", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-C-${suffix}`;
  const coopName = `E2E Compliance ${suffix}`;
  const period = `2026-${suffix.slice(-4)}`;

  await loginAsDemoAdmin(page);
  await page.goto("/cooperatives/new");

  await page.getByLabel("Cooperative code").fill(code);
  await page.getByLabel("Name", { exact: true }).fill(coopName);
  await page.getByLabel("Type").selectOption({ index: 1 });
  await page.getByLabel("Sector").selectOption({ index: 1 });
  await page.getByLabel("Status", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Accreditation status").selectOption({ index: 1 });
  await page.getByLabel("Address").fill("Ormoc City");
  await page.getByLabel("Barangay").selectOption({ index: 1 });
  await page.getByLabel("Contact person").fill("Compliance Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const profileLink = page.getByRole("link", { name: coopName });
  await expect(profileLink).toBeVisible();
  const cooperativeId = (await profileLink.getAttribute("href"))?.split("/").pop();
  expect(cooperativeId).toBeTruthy();

  await page.goto(`/monitoring/new?cooperativeId=${cooperativeId}`);
  await expect(
    page.getByRole("heading", { name: "Create compliance record", level: 2 }),
  ).toBeVisible();
  await expect(page.getByLabel("Cooperative", { exact: true })).toHaveValue(
    cooperativeId ?? "",
  );

  await page.getByLabel("Requirement").selectOption({ index: 1 });
  const requirementSelect = page.getByLabel("Requirement");
  const requirementName = await requirementSelect.locator("option:checked").textContent();
  await page.getByLabel("Reporting period").fill(period);
  await page.getByLabel("Due date").fill("2026-12-31");
  await page.getByRole("button", { name: "Create record" }).click();

  await expect(page).toHaveURL(/\/monitoring$/);
  await expect(page.getByRole("heading", { name: "Compliance records", level: 2 })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: coopName });
  await expect(row.getByRole("cell", { name: coopName })).toBeVisible();
  await expect(row.getByRole("cell", { name: period })).toBeVisible();
  await expect(row.getByRole("cell", { name: requirementName?.trim() ?? "" })).toBeVisible();
  await expect(row.getByRole("link", { name: "Pending" })).toBeVisible();
});
