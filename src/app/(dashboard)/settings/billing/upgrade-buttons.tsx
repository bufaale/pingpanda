"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/stripe/plans";

export function UpgradeButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  const paidPlans = pricingPlans.filter((p) => p.price.monthly > 0);

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant={billing === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={billing === "yearly" ? "default" : "outline"}
          size="sm"
          onClick={() => setBilling("yearly")}
        >
          Yearly (save 17%)
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {paidPlans.map((plan) => {
          const priceId = plan.stripePriceId[billing];
          const price = plan.price[billing];
          return (
            <Button
              key={plan.id}
              onClick={() => handleCheckout(priceId)}
              disabled={loading !== null}
              variant={plan.highlighted ? "default" : "outline"}
            >
              {loading === priceId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading === priceId
                ? "Loading..."
                : `${plan.name} — $${price}/${billing === "monthly" ? "mo" : "yr"}`}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
