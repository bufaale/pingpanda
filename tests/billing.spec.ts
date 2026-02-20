import { test, expect } from "@playwright/test";

test.describe("Billing", () => {
  test("visiting /settings/billing without auth redirects to /login", async ({
    page,
  }) => {
    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/\/login/);
  });
});
