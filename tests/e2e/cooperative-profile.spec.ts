import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("anonymous profile request redirects to login", async ({ page }) => {
  await page.goto("/cooperatives/does-not-exist");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated ADMIN sees a cooperative profile and unknown ids 404", async ({
  page,
}) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-P-${suffix}`;
  const name = `E2E Profile ${suffix}`;

  await loginAsDemoAdmin(page);
  await page.goto("/cooperatives/new");

  await page.getByLabel("Cooperative code").fill(code);
  await page.getByLabel("Name", { exact: true }).fill(name);
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
  await page.getByRole("link", { name }).click();

  await expect(page).toHaveURL(/\/cooperatives\/[^/]+$/);
  await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
  await expect(page.getByText(code).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Membership" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Remarks" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit cooperative" })).toBeVisible();

  await page.goto("/cooperatives/does-not-exist");
  await expect(page.getByRole("heading", { name: "Cooperative not found" })).toBeVisible();
});
