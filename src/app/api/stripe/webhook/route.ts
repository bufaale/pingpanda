import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createServerClient } from "@supabase/ssr";
import { getPlanByPriceId } from "@/lib/stripe/plans";
import type Stripe from "stripe";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

function getPlanIdFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return "free";
  const plan = getPlanByPriceId(priceId);
  return plan?.id || "free";
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      (process.env.STRIPE_WEBHOOK_SECRET || "").trim(),
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        );
        const userId =
          subscription.metadata.supabase_user_id ||
          session.metadata?.supabase_user_id;
        const planId = getPlanIdFromSubscription(subscription);

        if (userId) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_plan: planId,
              stripe_customer_id: customerId,
            })
            .eq("id", userId);

          if (profileError) console.error("Profile update error:", profileError);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        const planId = getPlanIdFromSubscription(subscription);

        await supabase
          .from("profiles")
          .update({
            subscription_status: subscription.status,
            subscription_plan:
              subscription.status === "active" ? planId : "free",
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            subscription_plan: "free",
          })
          .eq("id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        invoice.parent?.subscription_details?.subscription;

      if (subscriptionId && typeof subscriptionId === "string") {
        const subscription =
          await getStripe().subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.supabase_user_id;

        if (userId) {
          console.error(
            "Payment failed for user:",
            userId,
            "invoice:",
            invoice.id,
          );
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
