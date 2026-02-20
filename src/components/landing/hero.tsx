import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-4">
          Status pages your users will actually check
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Beautiful Status Pages &{" "}
          <span className="text-primary">Uptime Monitoring</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Keep your users informed when things go wrong. PingPanda monitors your
          services, detects downtime automatically, and notifies everyone who
          needs to know — starting at just $9/mo, 50-70% cheaper than
          alternatives.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start Monitoring Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/s/demo">See Demo Status Page</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Free forever tier.
        </p>

        {/* Status page mockup placeholder */}
        <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted shadow-lg">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-semibold">
                All Systems Operational
              </span>
            </div>
          </div>
          <div className="space-y-3 p-6">
            {["API Server", "Web App", "Database", "CDN"].map((service) => (
              <div
                key={service}
                className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3"
              >
                <span className="text-sm font-medium">{service}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-1 rounded-full bg-green-500/80"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
