import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can create a cooperative and see it in the masterlist", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-${suffix}`;
  const name = `E2E Masterlist ${suffix}`;

  await loginAsDemoAdmin(page);
  await page.goto("/cooperatives");
  await expect(page.getByRole("heading", { name: "Cooperative masterlist" })).toBeVisible();

  await page.getByRole("link", { name: "New cooperative" }).click();
  await expect(page.getByRole("heading", { name: "New cooperative", level: 2 })).toBeVisible();

  await page.getByLabel("Cooperative code").fill(code);
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Type").selectOption({ index: 1 });
  await page.getByLabel("Sector").selectOption({ index: 1 });
  await page.getByLabel("Status", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Accreditation status").selectOption({ index: 1 });
  await page.getByLabel("Address").fill("Ormoc City");
  await page.getByLabel("Barangay").selectOption({ index: 1 });
  await page.getByLabel("Contact person").fill("E2E Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByLabel("Total members", { exact: true }).fill("3");
  await page.getByLabel("Male members", { exact: true }).fill("1");
  await page.getByLabel("Female members", { exact: true }).fill("2");

  await page.getByRole("button", { name: "Create cooperative" }).click();

  await expect(page).toHaveURL(/\/cooperatives$/);
  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByRole("cell", { name: code })).toBeVisible();
  await expect(page.getByRole("cell", { name })).toBeVisible();
});
