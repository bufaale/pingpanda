import { BadgePercent, Sparkles, Unlock, Heart } from "lucide-react";

const reasons = [
  {
    icon: BadgePercent,
    title: "50-70% Cheaper",
    description:
      "Statuspage charges $29/mo for basic. Instatus starts at $29/mo. Better Stack at $34/mo. PingPanda gives you the same features starting at just $9/mo.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description:
      "No other status page tool includes AI incident summaries. Generate clear, user-friendly post-mortems in seconds instead of spending 30+ minutes writing them manually.",
  },
  {
    icon: Unlock,
    title: "No Vendor Lock-In",
    description:
      "Simple setup, easy data export. No long-term contracts, no penalties for switching. Your status page data is always yours.",
  },
  {
    icon: Heart,
    title: "Built for Indie SaaS",
    description:
      "Designed for small teams and solo founders. No enterprise bloat, no unnecessary complexity. Just the features you actually need to keep users informed.",
  },
];

export function WhyUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Why PingPanda over alternatives?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The most affordable status page platform with AI-powered incident
            management.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
