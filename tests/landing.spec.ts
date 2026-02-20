import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/PingPanda/i);
  });

  test("hero section is visible with CTA button", async ({ page }) => {
    // Hero heading
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("Beautiful Status Pages");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("Uptime Monitoring");

    // CTA buttons
    const startBtn = page.getByRole("link", { name: "Start Monitoring Free" });
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveAttribute("href", "/signup");

    const demoBtn = page.getByRole("link", { name: "See Demo Status Page" });
    await expect(demoBtn).toBeVisible();
    await expect(demoBtn).toHaveAttribute("href", "/s/demo");

    // Subtext
    await expect(page.getByText("No credit card required")).toBeVisible();
  });

  test("stats section shows key metrics", async ({ page }) => {
    await expect(page.getByText("99.9%")).toBeVisible();
    await expect(page.getByText("< 30s")).toBeVisible();
    await expect(page.getByText("5,000+")).toBeVisible();
    await expect(page.getByText("50%")).toBeVisible();
  });

  test("features section shows 6 feature cards", async ({ page }) => {
    await expect(
      page.getByText("Everything you need to keep users informed"),
    ).toBeVisible();

    // shadcn CardTitle renders as <div>, so use getByText instead of getByRole("heading")
    const featureTitles = [
      "Uptime Monitoring",
      "Beautiful Status Pages",
      "Instant Notifications",
      "Auto-Incident Detection",
      "Subscriber Notifications",
      "AI Post-Mortems",
    ];

    for (const title of featureTitles) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }
  });

  test("pricing section shows 3 plans with correct prices", async ({
    page,
  }) => {
    await expect(
      page.getByText("Simple, transparent pricing"),
    ).toBeVisible();

    // Plan names (CardTitle = div, so use getByText)
    await expect(page.getByText("Free", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Business", { exact: true }).first()).toBeVisible();

    // Prices (monthly by default) — use exact to avoid substring matches in paragraphs
    await expect(page.getByText("$9", { exact: true })).toBeVisible();
    await expect(page.getByText("$29", { exact: true })).toBeVisible();

    // Most Popular badge on Pro
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("comparison table shows PingPanda vs competitors", async ({
    page,
  }) => {
    await expect(page.getByText("How we compare")).toBeVisible();

    // Competitor names in table header — use columnheader role to avoid substring matches in paragraphs
    const comparisonSection = page.locator("#comparison");
    await expect(comparisonSection.getByRole("columnheader", { name: "PingPanda" })).toBeVisible();
    await expect(comparisonSection.getByRole("columnheader", { name: "Statuspage" })).toBeVisible();
    await expect(comparisonSection.getByRole("columnheader", { name: "Instatus" })).toBeVisible();
    await expect(comparisonSection.getByRole("columnheader", { name: "Better Stack" })).toBeVisible();

    // Feature rows
    await expect(comparisonSection.getByText("Starting Price")).toBeVisible();
    await expect(comparisonSection.getByText("$9/mo")).toBeVisible();
    await expect(comparisonSection.getByText("AI Summaries")).toBeVisible();
  });

  test("FAQ section is present with accordion items", async ({ page }) => {
    await expect(
      page.getByText("Frequently asked questions"),
    ).toBeVisible();

    // FAQ questions are accordion triggers
    await expect(
      page.getByText("How does uptime monitoring work?"),
    ).toBeVisible();
    await expect(
      page.getByText("What's included in the free tier?"),
    ).toBeVisible();
    await expect(
      page.getByText("Can I use my own domain?"),
    ).toBeVisible();
    await expect(
      page.getByText("How fast are incident notifications?"),
    ).toBeVisible();
    await expect(
      page.getByText("What happens when a service recovers?"),
    ).toBeVisible();
    await expect(page.getByText("Can I try before I buy?")).toBeVisible();
  });

  test("navbar has correct links", async ({ page }) => {
    // Navigation links (desktop)
    await expect(page.getByRole("link", { name: "Features" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Compare" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "FAQ" }).first()).toBeVisible();

    // Auth buttons (desktop)
    await expect(page.getByRole("link", { name: "Login" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Started" }).first()).toBeVisible();
  });

  test("footer has correct link sections", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Section headings
    await expect(footer.getByText("Product")).toBeVisible();
    await expect(footer.getByText("Resources")).toBeVisible();
    await expect(footer.getByText("Legal")).toBeVisible();
    await expect(footer.getByText("Social")).toBeVisible();

    // Legal links
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Refund Policy" })).toBeVisible();

    // Copyright
    await expect(footer.getByText(/PingPanda.*All rights reserved/)).toBeVisible();
  });
});
