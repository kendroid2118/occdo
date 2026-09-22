import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

test("ADMIN can record a service delivery and see it listed", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-D-${suffix}`;
  const coopName = `E2E Delivery ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Delivery Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const profileLink = page.getByRole("link", { name: coopName });
  await expect(profileLink).toBeVisible();
  const cooperativeId = (await profileLink.getAttribute("href"))?.split("/").pop();
  expect(cooperativeId).toBeTruthy();

  await page.goto(`/programs/new?cooperativeId=${cooperativeId}`);
  await expect(
    page.getByRole("heading", { name: "Record service delivery", level: 2 }),
  ).toBeVisible();
  await expect(page.getByLabel("Cooperative", { exact: true })).toHaveValue(
    cooperativeId ?? "",
  );

  await page.getByLabel("Service type").selectOption({ index: 1 });
  const serviceType = page.getByLabel("Service type");
  const serviceName = await serviceType.locator("option:checked").textContent();
  await page.getByLabel("Program", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Date delivered").fill("2026-09-22");
  await page.getByLabel("Remarks").fill("E2E recorded delivery");

  await page.getByRole("button", { name: "Record delivery" }).click();
  await expect(page).toHaveURL(/\/programs$/);
  await expect(page.getByRole("heading", { name: "Services availed", level: 2 })).toBeVisible();
  await expect(page.getByRole("cell", { name: coopName })).toBeVisible();

  await page.getByLabel("Service type").selectOption({ label: serviceName?.trim() ?? "" });
  await page.getByLabel("From date").fill("2026-09-22");
  await page.getByLabel("To date").fill("2026-09-22");
  await page.getByRole("button", { name: "Apply filters" }).click();

  const row = page.getByRole("row").filter({ hasText: coopName });
  await expect(row.getByRole("cell", { name: coopName })).toBeVisible();
  await expect(row.getByRole("cell", { name: serviceName?.trim() ?? "" })).toBeVisible();
  await expect(row.getByRole("cell", { name: "E2E recorded delivery" })).toBeVisible();
});
