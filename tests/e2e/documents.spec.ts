import { expect, test } from "@playwright/test";

import { demoAdminCredentials, demoCredentials, loginAsDemoAdmin, loginAsDemoUser } from "./helpers/demo-login";

const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n%%EOF\n");

test("ADMIN can upload a PDF and download it; anonymous retrieval is denied", async ({
  page,
  request,
}) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const suffix = Date.now().toString();
  const code = `E2E-D-${suffix}`;
  const coopName = `E2E Document ${suffix}`;

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
  await page.getByLabel("Contact person").fill("Document Contact");
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
  await expect(page.getByRole("heading", { name: "Upload document", level: 2 })).toBeVisible();
  await expect(page.getByLabel("Cooperative", { exact: true })).toHaveValue(cooperativeId ?? "");

  await page.getByLabel("Document type").selectOption({ index: 1 });
  await page.getByLabel("File").setInputFiles({
    name: "..\\..\\report.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
  });
  await page.getByRole("button", { name: "Upload document" }).click();

  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByRole("heading", { name: "Cooperative documents", level: 2 })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: coopName });
  await expect(row.getByRole("cell", { name: coopName })).toBeVisible();
  await expect(row.getByRole("cell", { name: "report.pdf" })).toBeVisible();

  const downloadLink = row.getByRole("link", { name: "Download" });
  const href = await downloadLink.getAttribute("href");
  expect(href).toMatch(/^\/api\/documents\/[^/]+$/);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadLink.click(),
  ]);
  expect(download.suggestedFilename()).toBe("report.pdf");

  const anonymous = await request.get(href ?? "");
  expect(anonymous.status()).toBe(401);
});

test("USER cannot open the upload page", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/documents/new");
  await expect(page.getByRole("heading", { name: "Upload document", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Upload document" })).toHaveCount(0);
});
