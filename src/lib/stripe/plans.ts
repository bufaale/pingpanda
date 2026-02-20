export type PlanName = "free" | "pro" | "business";

export interface PlanLimits {
  status_pages: number;
  monitors: number;
  subscribers: number;
  check_interval_seconds: number;
  custom_domains: number;
  notification_channels: string[];
}

export interface PricingPlan {
  id: PlanName;
  name: string;
  slug: PlanName;
  description: string;
  price: { monthly: number; yearly: number };
  limits: PlanLimits;
  stripePriceId: { monthly: string; yearly: string };
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    slug: "free",
    description: "Get started with basic status page monitoring",
    price: { monthly: 0, yearly: 0 },
    limits: {
      status_pages: 1,
      monitors: 5,
      subscribers: 100,
      check_interval_seconds: 3600,
      custom_domains: 0,
      notification_channels: ["email"],
    },
    stripePriceId: { monthly: "", yearly: "" },
    features: [
      "1 status page",
      "5 monitors",
      "100 subscribers",
      "60-minute check interval",
      "Email notifications",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    description: "For growing SaaS products that need reliable monitoring",
    price: { monthly: 9, yearly: 90 },
    limits: {
      status_pages: 3,
      monitors: 25,
      subscribers: 5000,
      check_interval_seconds: 300,
      custom_domains: 1,
      notification_channels: ["email", "slack", "webhook"],
    },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "price_PINGPANDA_PRO_MONTHLY").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "price_PINGPANDA_PRO_YEARLY").trim(),
    },
    features: [
      "3 status pages",
      "25 monitors",
      "5,000 subscribers",
      "5-minute check interval",
      "1 custom domain",
      "Slack & webhook notifications",
      "Email support",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "For teams that demand the highest uptime visibility",
    price: { monthly: 29, yearly: 290 },
    limits: {
      status_pages: Infinity,
      monitors: 100,
      subscribers: 25000,
      check_interval_seconds: 60,
      custom_domains: 3,
      notification_channels: ["email", "slack", "webhook", "sms"],
    },
    stripePriceId: {
      monthly: (process.env.NEXT_PUBLIC_STRIPE_BIZ_MONTHLY_PRICE_ID || "price_PINGPANDA_BIZ_MONTHLY").trim(),
      yearly: (process.env.NEXT_PUBLIC_STRIPE_BIZ_YEARLY_PRICE_ID || "price_PINGPANDA_BIZ_YEARLY").trim(),
    },
    features: [
      "Unlimited status pages",
      "100 monitors",
      "25,000 subscribers",
      "1-minute check interval",
      "3 custom domains",
      "SMS notifications",
      "Slack & webhook notifications",
      "Priority support",
    ],
    cta: "Upgrade to Business",
  },
];

export function getPlanBySlug(slug: string): PricingPlan | undefined {
  return pricingPlans.find((p) => p.slug === slug) ?? pricingPlans[0];
}

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) => p.stripePriceId.monthly === priceId || p.stripePriceId.yearly === priceId,
  );
}
