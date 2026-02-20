import { test, expect } from "@playwright/test";

test.describe("Dashboard (auth required)", () => {
  test("visiting /dashboard without auth redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /dashboard/monitors without auth redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard/monitors");
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /settings without auth redirects to /login", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
