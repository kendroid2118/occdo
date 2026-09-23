import { expect, test } from "@playwright/test";

import {
  demoAdminCredentials,
  demoCredentials,
  loginAsDemoAdmin,
  loginAsDemoUser,
} from "./helpers/demo-login";

test("anonymous user admin request redirects to login", async ({ page }) => {
  await page.goto("/settings/users");
  await expect(page).toHaveURL(/\/login/);
});

test("USER cannot open user administration", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");

  await loginAsDemoUser(page);
  await page.goto("/settings/users");
  await expect(page.getByRole("heading", { name: "Users", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "New user" })).toHaveCount(0);

  await page.goto("/settings/users/new");
  await expect(page.getByRole("heading", { name: "New user", level: 2 })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create user" })).toHaveCount(0);
});

test("ADMIN can create a USER and see the account listed", async ({ page }) => {
  test.skip(!demoAdminCredentials().password, "SEED_DEMO_PASSWORD is not set");

  const stamp = Date.now();
  const email = `e2e.user.${stamp}@example.invalid`;

  await loginAsDemoAdmin(page);
  await page.goto("/settings/users/new");
  await expect(page.getByRole("heading", { name: "New user", level: 2 })).toBeVisible();
  await expect(page.locator("#role option[value='SUPER_ADMIN']")).toHaveCount(0);
  await expect(page.locator("#role option[value='DEVELOPER']")).toHaveCount(0);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Name").fill(`E2E User ${stamp}`);
  await page.getByLabel("Role").selectOption({ label: "User" });
  await page.getByLabel("Password").fill("password1");
  await page.getByRole("button", { name: "Create user" }).click();

  await expect(page).toHaveURL(/\/settings\/users$/);
  await expect(page.getByRole("cell", { name: email })).toBeVisible();
  await expect(page.getByRole("cell", { name: "User", exact: true }).first()).toBeVisible();
});
