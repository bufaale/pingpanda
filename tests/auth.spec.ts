import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("login page loads with form fields", async ({ page }) => {
    await page.goto("/login");

    // Page heading (CardTitle = div, so use getByText)
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("Sign in to your account")).toBeVisible();

    // Form fields
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("login page has Forgot password link", async ({ page }) => {
    await page.goto("/login");

    const forgotLink = page.getByRole("link", { name: "Forgot password?" });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("login page has signup link and navigates to signup", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByText("Don't have an account?")).toBeVisible();

    const signupLink = page.getByRole("link", { name: "Sign up" });
    await expect(signupLink).toBeVisible();

    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("login page has Google OAuth button", async ({ page }) => {
    await page.goto("/login");

    // OAuth buttons section
    await expect(page.getByText("Or continue with")).toBeVisible();
    // Google OAuth button
    await expect(
      page.getByRole("button", { name: /google/i }),
    ).toBeVisible();
  });

  test("signup page loads with form fields and ToS checkbox", async ({
    page,
  }) => {
    await page.goto("/signup");

    // Page heading (CardTitle = div, so use getByText)
    await expect(page.getByText("Create an account")).toBeVisible();
    await expect(page.getByText("Get started for free")).toBeVisible();

    // Form fields
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // ToS checkbox
    const tosCheckbox = page.locator('input[type="checkbox"]#tos');
    await expect(tosCheckbox).toBeVisible();
    await expect(page.getByText("Terms of Service")).toBeVisible();
    await expect(page.getByText("Privacy Policy")).toBeVisible();

    // Submit button
    const signupBtn = page.getByRole("button", { name: "Sign up" });
    await expect(signupBtn).toBeVisible();
    // Button should be disabled until ToS is accepted
    await expect(signupBtn).toBeDisabled();
  });

  test("signup page has login link and navigates to login", async ({
    page,
  }) => {
    await page.goto("/signup");

    await expect(page.getByText("Already have an account?")).toBeVisible();

    const loginLink = page.getByRole("link", { name: "Sign in" });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
