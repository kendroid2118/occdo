import { expect, test } from "@playwright/test";

import { demoCredentials, loginAsDemoUser } from "./helpers/demo-login";

test("authenticated USER sees live dashboard widgets from PostgreSQL", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Total Cooperatives" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Total Membership" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cooperatives by Sector" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cooperatives by Type" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cooperatives by Status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compliance status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programs & services YTD" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming activities" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Announcements" })).toBeVisible();

  await expect(page.getByRole("columnheader", { name: "Name" }).first()).toBeVisible();
  await expect(page.getByText("Awaiting database data")).toHaveCount(0);
  await expect(page.getByText("Chart will use maintainable sector records")).toHaveCount(0);

  const cdaUrl = process.env.CDA_PORTAL_URL;
  if (cdaUrl) {
    const link = page.getByRole("link", { name: "Open CDA Portal" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", cdaUrl);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  } else {
    await expect(page.getByRole("heading", { name: "CDA Portal" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open CDA Portal" })).toHaveCount(0);
  }
});
