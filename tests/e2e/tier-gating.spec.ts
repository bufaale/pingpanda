import { test } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, expectBillingTier, ALL_TIERS, type Tier } from "../helpers/test-utils";

type TierUser = { id: string; email: string; tier: Tier };
const usersByTier: Partial<Record<Tier, TierUser>> = {};

test.beforeAll(async () => {
  for (const tier of ALL_TIERS) {
    const u = await createTestUser(`tier-${tier}`, tier);
    usersByTier[tier] = { ...u, tier };
  }
});

test.afterAll(async () => {
  await Promise.all(
    Object.values(usersByTier).map((u) => (u?.id ? deleteTestUser(u.id) : Promise.resolve())),
  );
});

test.describe("Tier gating — billing page shows correct plan", () => {
  for (const tier of ALL_TIERS) {
    test(`${tier} user's billing page shows "${tier}"`, async ({ page }) => {
      const u = usersByTier[tier]!;
      await loginViaUI(page, u.email);
      await page.goto("/settings/billing");
      await expectBillingTier(page, tier);
    });
  }
});
