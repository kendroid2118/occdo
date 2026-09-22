import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can release assistance and add a recovery ledger entry", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-L-${suffix}`;
  const coopName = `E2E Ledger ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Ledger Contact");
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
  await page.getByLabel("Assistance type").selectOption({ index: 1 });
  await page.getByLabel("Amount").fill("1500.00");
  await page.getByLabel("Date requested").fill("2026-09-22");
  await page.getByRole("button", { name: "Record assistance" }).click();
  await expect(page).toHaveURL(/\/financial-assistance$/);

  const row = page.getByRole("row").filter({ hasText: coopName });
  await row.getByRole("link", { name: "Requested" }).click();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("button", { name: "Release" })).toBeVisible();
  await page.getByRole("button", { name: "Release" }).click();

  await expect(page.getByRole("heading", { name: "Fund monitoring", level: 3 })).toBeVisible();
  const disbursementRow = page.getByRole("row").filter({ hasText: "Disbursement" });
  await expect(disbursementRow.getByRole("cell", { name: "1500.00" })).toBeVisible();
  await expect(page.getByText("1500.00").first()).toBeVisible();

  await page.getByLabel("Entry kind").selectOption({ label: "Recovery" });
  await page.getByLabel("Amount").fill("100.00");
  await page.getByLabel("Entry date").fill("2026-09-23");
  await page.getByRole("button", { name: "Add ledger entry" }).click();

  const recoveryRow = page.getByRole("row").filter({ hasText: "Recovery" });
  await expect(recoveryRow.getByRole("cell", { name: "100.00" })).toBeVisible();
  await expect(page.getByText("1400.00")).toBeVisible();
});
