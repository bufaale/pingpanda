import { test, expect, type Page } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, auditPageLinks } from "../helpers/test-utils";

let user: { id: string; email: string };

test.beforeAll(async () => {
  user = await createTestUser("linkaudit");
});
test.afterAll(async () => {
  if (user?.id) await deleteTestUser(user.id);
});

async function auditAndAssert(page: Page, path: string) {
  const results = await auditPageLinks(page, {
    ignore: [/^\/logout/, /^\/api\//, /^\/auth\/confirm/],
  });
  const broken = results.filter((r) => r.status === 404);
  if (broken.length) console.log(`Broken links on ${path}:`, broken);
  expect(broken, `Broken links on ${path}: ${JSON.stringify(broken)}`).toEqual([]);
}

test.describe("Link audit — authenticated dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, user.email);
  });

  // Add app-specific dashboard paths here as the app grows.
  for (const path of ["/dashboard", "/settings", "/settings/billing"]) {
    test(`${path} has no broken internal links`, async ({ page }) => {
      await page.goto(path);
      await auditAndAssert(page, path);
    });
  }
});

test.describe("Link audit — public marketing", () => {
  for (const path of ["/", "/terms", "/privacy", "/refund"]) {
    test(`${path} has no broken internal links`, async ({ page }) => {
      await page.goto(path);
      await auditAndAssert(page, path);
    });
  }
});
