import { test, expect } from "@playwright/test";

test.describe("Public Status Page", () => {
  test("visiting /s/nonexistent-slug shows not found", async ({ page }) => {
    const response = await page.goto("/s/nonexistent-slug-12345");

    // Next.js notFound() returns 404
    expect(response?.status()).toBe(404);
  });

  test("/s/ route prefix does not 500", async ({ page }) => {
    const response = await page.goto("/s/test-does-not-exist");

    // Should be a 404, not a 500
    expect(response?.status()).not.toBe(500);
  });
});
