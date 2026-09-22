import { expect, test } from "@playwright/test";

import { demoAdminCredentials, loginAsDemoAdmin } from "./helpers/demo-login";

const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n%%EOF\n");

test("ADMIN can verify an uploaded document; download stays authorized", async ({
  page,
  request,
}) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-V-${suffix}`;
  const coopName = `E2E Verify ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Verify Contact");
  await page.getByLabel("Contact number").fill("09170000000");
  await page.getByRole("button", { name: "Create cooperative" }).click();
  await expect(page).toHaveURL(/\/cooperatives$/);

  await page.getByLabel("Search").fill(code);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const profileLink = page.getByRole("link", { name: coopName });
  await expect(profileLink).toBeVisible();
  const cooperativeId = (await profileLink.getAttribute("href"))?.split("/").pop();
  expect(cooperativeId).toBeTruthy();

  await page.goto(`/documents/new?cooperativeId=${cooperativeId}`);
  await page.getByLabel("Document type").selectOption({ index: 1 });
  await page.getByLabel("File").setInputFiles({
    name: "report.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
  });
  await page.getByRole("button", { name: "Upload document" }).click();
  await expect(page).toHaveURL(/\/documents$/);

  const row = page.getByRole("row").filter({ hasText: coopName });
  await expect(row.getByRole("link", { name: "Unverified" })).toBeVisible();
  const downloadHref = await row.getByRole("link", { name: "Download" }).getAttribute("href");
  expect(downloadHref).toMatch(/^\/api\/documents\/[^/]+$/);

  await row.getByRole("link", { name: "Unverified" }).click();
  await expect(page.getByRole("heading", { name: "report.pdf", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Verify document" }).click();
  await expect(page.getByText("Verified by OCCDO Demo Admin (seed).")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify document" })).toHaveCount(0);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("report.pdf");

  const anonymous = await request.get(downloadHref ?? "");
  expect(anonymous.status()).toBe(401);

  await page.goto("/documents/templates");
  await expect(page.getByRole("heading", { name: "Templates / Forms", level: 2 })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Demo CDA Reporting Form" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download" })).toHaveCount(0);
});
