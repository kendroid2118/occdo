import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can add an officer on the cooperative profile", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-O-${suffix}`;
  const coopName = `E2E Officers ${suffix}`;
  const officerName = `E2E Officer ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Profile Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.getByRole("link", { name: coopName }).click();

  await expect(page.getByRole("heading", { name: "Officers / Contacts" })).toBeVisible();
  await page.getByLabel("Full name").fill(officerName);
  await page.getByLabel("Position").selectOption({ index: 1 });
  await page.getByLabel("Primary contact").check();
  await page.getByRole("button", { name: "Add officer" }).click();

  await expect(page.getByRole("cell", { name: officerName })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Yes" })).toBeVisible();
});
