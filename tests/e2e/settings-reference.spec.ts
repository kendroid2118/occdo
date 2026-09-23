import { expect, test } from "@playwright/test";

import {
  demoAdminCredentials,
  demoCredentials,
  demoSuperAdminCredentials,
  loginAsDemoAdmin,
  loginAsDemoSuperAdmin,
  loginAsDemoUser,
} from "./helpers/demo-login";

test("anonymous reference settings request redirects to login", async ({ page }) => {
  await page.goto("/settings/reference");
  await expect(page).toHaveURL(/\/login/);
});

test("USER cannot open reference data settings", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/settings/reference");
  await expect(page.getByRole("heading", { name: "Reference data", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Add sector" })).toHaveCount(0);
});

test("ADMIN cannot open reference data settings", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoAdmin(page);
  await page.goto("/settings/reference");
  await expect(page.getByRole("heading", { name: "Reference data", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Add sector" })).toHaveCount(0);
});

test("SUPER_ADMIN can add a sector, deactivate a type, and keep the historical name", async ({
  page,
}) => {
  test.skip(!demoSuperAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const stamp = Date.now();
  const sectorCode = `E2ES${stamp}`;
  const sectorName = `E2E Sector ${stamp}`;
  const typeCode = `E2ET${stamp}`;
  const typeName = `E2E Type ${stamp}`;
  const coopCode = `E2E-R-${stamp}`;
  const coopName = `E2E Ref Coop ${stamp}`;

  await loginAsDemoSuperAdmin(page);
  await page.goto("/settings/reference/sector/new");
  await expect(page.getByRole("heading", { name: "Add sector", level: 2 })).toBeVisible();
  await page.getByLabel("Code").fill(sectorCode);
  await page.getByLabel("Name").fill(sectorName);
  await page.getByRole("button", { name: "Add sector" }).click();
  await expect(page).toHaveURL(/catalog=sector/);
  await expect(page.getByRole("cell", { name: sectorName })).toBeVisible();

  await page.goto("/settings/reference/type/new");
  await page.getByLabel("Code").fill(typeCode);
  await page.getByLabel("Name").fill(typeName);
  await page.getByRole("button", { name: "Add type" }).click();
  await expect(page.getByRole("cell", { name: typeName })).toBeVisible();

  await page.goto("/cooperatives/new");
  await page.getByLabel("Cooperative code").fill(coopCode);
  await page.getByLabel("Name", { exact: true }).fill(coopName);
  await page.getByLabel("Type").selectOption({ label: typeName });
  await page.getByLabel("Sector").selectOption({ label: sectorName });
  await page.getByLabel("Status", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Accreditation status").selectOption({ index: 1 });
  await page.getByLabel("Address").fill("Ormoc City");
  await page.getByLabel("Barangay").selectOption({ index: 1 });
  await page.getByLabel("Contact person").fill("Ref Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.goto("/settings/reference?catalog=type");
  const editLink = page.getByRole("row", { name: new RegExp(typeName) }).getByRole("link", { name: "Edit" });
  await expect(editLink).toBeVisible();
  const editHref = await editLink.getAttribute("href");
  expect(editHref).toBeTruthy();
  await page.goto(editHref ?? "/settings/reference");
  await expect(page.getByRole("heading", { name: "Edit type", level: 2 })).toBeVisible();
  await page.getByLabel("Active").uncheck();
  await page.getByRole("button", { name: "Save type" }).click();
  await expect(page.getByRole("cell", { name: "Inactive" }).first()).toBeVisible();

  await page.goto("/cooperatives");
  await page.getByLabel("Search").fill(coopCode);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const profileLink = page.getByRole("link", { name: coopName });
  await expect(profileLink).toBeVisible();
  const profileHref = await profileLink.getAttribute("href");
  expect(profileHref).toBeTruthy();
  await page.goto(profileHref ?? "/cooperatives");
  await expect(page.getByText(typeName)).toBeVisible();
});
