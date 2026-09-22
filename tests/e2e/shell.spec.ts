import { expect, test } from "@playwright/test";

import { demoCredentials, loginAsDemoUser } from "./helpers/demo-login";

test("dashboard shell renders wordmark and collapsible sidebar", async ({ page }) => {
  test.skip(!demoCredentials().password, "SEED_DEMO_PASSWORD is not set");
  await loginAsDemoUser(page);

  await expect(page.getByText("OCCDO", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("LGU Ormoc")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Awaiting database data").first()).toBeVisible();

  const toggle = page.getByRole("button", { name: /collapse sidebar/i });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(page.getByRole("button", { name: /expand sidebar/i })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
