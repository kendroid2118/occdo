import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can file, filter, view, and decide an accreditation case", async ({
  page,
}) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-A-${suffix}`;
  const coopName = `E2E Accreditation ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Case Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await page.getByRole("link", { name: coopName }).click();
  await expect(page).toHaveURL(/\/cooperatives\/[^/]+$/);
  const cooperativeId = page.url().split("/").pop();
  expect(cooperativeId).toBeTruthy();

  await page.goto(`/cooperatives/cases/new?cooperativeId=${cooperativeId}`);
  await expect(page.getByRole("heading", { name: "File accreditation case", level: 2 })).toBeVisible();
  await expect(page.getByLabel("Cooperative", { exact: true })).toHaveValue(cooperativeId ?? "");

  await page.getByLabel("Case type").selectOption({ index: 1 });
  const caseStatus = page.getByLabel("Case status");
  await caseStatus.selectOption({ index: 1 });
  const filedStatusName = await caseStatus.locator("option:checked").textContent();
  expect(filedStatusName?.trim()).toBeTruthy();

  await page.getByRole("button", { name: "File case" }).click();
  await expect(page).toHaveURL(/\/cooperatives\/cases$/);
  await expect(
    page.getByRole("heading", { name: "Registration / Accreditation", level: 2 }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: coopName })).toBeVisible();

  await page.getByLabel("Case status").selectOption({ label: filedStatusName?.trim() ?? "" });
  await page.getByRole("button", { name: "Apply filters" }).click();
  const caseRow = page.getByRole("row").filter({ hasText: coopName });
  await expect(caseRow.getByRole("cell", { name: coopName })).toBeVisible();
  await expect(caseRow.getByRole("cell", { name: filedStatusName?.trim() ?? "" })).toBeVisible();

  await caseRow.getByRole("link", { name: "View case" }).click();
  await expect(page).toHaveURL(/\/cooperatives\/cases\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "Accreditation case", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: coopName })).toBeVisible();
  await expect(page.getByText(coopName).first()).toBeVisible();

  const decideStatus = page.getByLabel("Case status");
  const statusOptionCount = await decideStatus.locator("option").count();
  await decideStatus.selectOption({ index: Math.max(0, statusOptionCount - 1) });
  const decidedStatusName = await decideStatus.locator("option:checked").textContent();
  await page.getByLabel("Accreditation status").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Decide case" }).click();
  await expect(page).toHaveURL(/\/cooperatives\/cases\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "Accreditation case", level: 2 })).toBeVisible();
  await expect(page.getByText(coopName).first()).toBeVisible();
  await expect(page.getByText(decidedStatusName?.trim() ?? "").first()).toBeVisible();
});
