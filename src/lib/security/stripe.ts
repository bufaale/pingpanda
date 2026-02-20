import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * Verify Stripe webhook signature. Returns parsed event or error response.
 */
export async function verifyStripeWebhook(
  body: string,
  signature: string | null,
): Promise<
  | { verified: true; event: Stripe.Event }
  | { verified: false; response: NextResponse }
> {
  if (!signature) {
    return {
      verified: false,
      response: NextResponse.json(
        { error: "Missing Stripe-Signature header" },
        { status: 400 },
      ),
    };
  }

  try {
    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!.trim(),
    );
    return { verified: true, event };
  } catch {
    return {
      verified: false,
      response: NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Validate checkout request: verify price ID and check no active subscription.
 */
export async function validateCheckout(
  userId: string,
  priceId: string,
  validPriceIds: string[],
): Promise<{ valid: true } | { valid: false; error: string }> {
  if (!validPriceIds.includes(priceId)) {
    return { valid: false, error: "Invalid price" };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  if (profile?.subscription_status === "active") {
    return {
      valid: false,
      error: "Active subscription exists. Use portal to manage.",
    };
  }

  return { valid: true };
}
