import { expect, type Page } from "@playwright/test";

export function demoCredentials(): { email: string; password: string | undefined } {
  return {
    email: process.env.SEED_DEMO_EMAIL ?? "demo.user@occdo.local",
    password: process.env.SEED_DEMO_PASSWORD,
  };
}

export async function loginAsDemoUser(page: Page): Promise<{ email: string }> {
  const { email, password } = demoCredentials();
  if (!password) {
    throw new Error("SEED_DEMO_PASSWORD is not set");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

  return { email };
}

export function demoAdminCredentials(): {
  email: string;
  password: string | undefined;
} {
  return {
    email: process.env.SEED_DEMO_ADMIN_EMAIL ?? "demo.admin@occdo.local",
    password: process.env.SEED_DEMO_PASSWORD,
  };
}

export function demoSuperAdminCredentials(): {
  email: string;
  password: string | undefined;
} {
  return {
    email: process.env.SEED_DEMO_SUPER_ADMIN_EMAIL ?? "demo.super@occdo.local",
    password: process.env.SEED_DEMO_PASSWORD,
  };
}

export async function loginAsDemoSuperAdmin(page: Page): Promise<{ email: string }> {
  const { email, password } = demoSuperAdminCredentials();
  if (!password) {
    throw new Error("SEED_DEMO_PASSWORD is not set");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

  return { email };
}

export async function loginAsDemoAdmin(page: Page): Promise<{ email: string }> {
  const { email, password } = demoAdminCredentials();
  if (!password) {
    throw new Error("SEED_DEMO_PASSWORD is not set");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

  return { email };
}
