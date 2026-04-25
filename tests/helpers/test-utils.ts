import { type Page, expect } from "@playwright/test";

export type Tier = "free" | "pro" | "business";
export const ALL_TIERS: Tier[] = ["free", "pro", "business"];

export const TEST_PASSWORD = "TestE2E_Pass123!";
export const STRIPE_TEST_CARD = "4242424242424242";
export const STRIPE_TEST_EXPIRY = "1228";
export const STRIPE_TEST_CVC = "123";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function createTestUser(prefix: string, tier: Tier = ALL_TIERS[0]) {
  const email = `e2e-${prefix}-${Date.now()}@test.example.com`;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `E2E ${prefix}` },
    }),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${await res.text()}`);
  const user = await res.json();
  if (tier !== ALL_TIERS[0]) {
    await setUserPlan(user.id, tier);
  }
  return { id: user.id as string, email };
}

export async function deleteTestUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });
}

/**
 * Set user's tier. Uses PATCH with return=representation so we can verify
 * the row actually updated (PATCH with return=minimal returns 204 even when
 * 0 rows were affected — race against handle_new_user trigger).
 */
export async function setUserPlan(userId: string, tier: Tier) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        subscription_plan: tier,
        subscription_status: tier === ALL_TIERS[0] ? "free" : "active",
      }),
    });
    if (!res.ok) throw new Error(`Failed to set plan: ${await res.text()}`);
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].subscription_plan === tier) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`setUserPlan: profile for ${userId} never accepted plan=${tier}`);
}

export async function loginViaUI(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

export async function logoutViaUI(page: Page) {
  const avatar = page.getByRole("button").filter({ hasText: /^[A-Z]{2,3}$/ });
  await avatar.click();
  await page.getByRole("menuitem", { name: /sign out|log out/i }).click();
  await page.waitForURL("**/login**", { timeout: 10_000 });
}

export async function auditPageLinks(
  page: Page,
  opts: { ignore?: RegExp[] } = {},
): Promise<Array<{ href: string; status: number }>> {
  const anchors = await page.locator("a[href]").all();
  const raw: string[] = [];
  for (const a of anchors) {
    const h = await a.getAttribute("href");
    if (h) raw.push(h);
  }
  const hrefs = Array.from(
    new Set(
      raw.filter((h) => h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api/")),
    ),
  );
  const ignore = opts.ignore || [];
  const filtered = hrefs.filter((h) => !ignore.some((re) => re.test(h)));
  const baseURL = page.url().split("/").slice(0, 3).join("/");
  const cookieHeader = (await page.context().cookies())
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const out: Array<{ href: string; status: number }> = [];
  for (const href of filtered) {
    try {
      const r = await fetch(baseURL + href, {
        method: "GET",
        headers: { Cookie: cookieHeader },
        redirect: "manual",
      });
      out.push({ href, status: r.status });
    } catch {
      out.push({ href, status: 0 });
    }
  }
  return out;
}

export async function expectBillingTier(page: Page, tier: Tier) {
  const regex = new RegExp(`\\b${tier}\\b`, "i");
  await expect(page.getByText(regex).first()).toBeVisible({ timeout: 10_000 });
}
