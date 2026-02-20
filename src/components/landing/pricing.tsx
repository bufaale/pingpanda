"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingPlans } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function Pricing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Start free, upgrade when you need more monitors, pages, or
            notification channels.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                billing === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                billing === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => {
            const price = plan.price[billing];
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-shadow hover:shadow-md",
                  plan.highlighted && "border-primary shadow-lg",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground ml-1 text-base">
                        /{billing === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href={isLoggedIn ? "/settings/billing" : "/signup"}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
