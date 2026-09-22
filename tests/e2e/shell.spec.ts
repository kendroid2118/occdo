import { expect, test } from "@playwright/test";

test("dashboard shell renders wordmark and collapsible sidebar", async ({ page }) => {
  await page.goto("/dashboard");

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
