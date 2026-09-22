import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can record, list, and approve assistance", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-A-${suffix}`;
  const coopName = `E2E Assist ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Assist Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const profileLink = page.getByRole("link", { name: coopName });
  await expect(profileLink).toBeVisible();
  const cooperativeId = (await profileLink.getAttribute("href"))?.split("/").pop();
  expect(cooperativeId).toBeTruthy();

  await page.goto(`/financial-assistance/new?cooperativeId=${cooperativeId}`);
  await expect(page.getByRole("heading", { name: "Record assistance", level: 2 })).toBeVisible();
  await expect(page.getByLabel("Cooperative", { exact: true })).toHaveValue(
    cooperativeId ?? "",
  );

  await page.getByLabel("Assistance type").selectOption({ index: 1 });
  const typeSelect = page.getByLabel("Assistance type");
  const typeName = await typeSelect.locator("option:checked").textContent();
  await page.getByLabel("Amount").fill("1500.00");
  await page.getByLabel("Date requested").fill("2026-09-22");
  await page.getByLabel("Fund source").fill("LGU");
  await page.getByRole("button", { name: "Record assistance" }).click();

  await expect(page).toHaveURL(/\/financial-assistance$/);
  await expect(page.getByRole("heading", { name: "Assistance records", level: 2 })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: coopName });
  await expect(row.getByRole("cell", { name: coopName })).toBeVisible();
  await expect(row.getByRole("cell", { name: "1500.00" })).toBeVisible();
  await expect(row.getByRole("cell", { name: typeName?.trim() ?? "" })).toBeVisible();
  await expect(row.getByRole("link", { name: "Requested" })).toBeVisible();

  await row.getByRole("link", { name: "Requested" }).click();
  await expect(page.getByRole("heading", { name: "Assistance record", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible();
});
