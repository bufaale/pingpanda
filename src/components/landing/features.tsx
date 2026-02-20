import {
  Activity,
  Globe,
  Bell,
  AlertTriangle,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Activity,
    title: "Uptime Monitoring",
    description:
      "Monitor any URL with 1-60 minute check intervals. Automatic retries reduce false positives so you only get alerted when it matters.",
  },
  {
    icon: Globe,
    title: "Beautiful Status Pages",
    description:
      "Branded public pages with your logo, accent color, and custom slug. Give your users a professional view of your service health.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description:
      "Get alerted via Slack, webhook, or email the moment something goes down. Alerts delivered in under 30 seconds.",
  },
  {
    icon: AlertTriangle,
    title: "Auto-Incident Detection",
    description:
      "Two consecutive failures auto-create an incident. When the service recovers, the incident is auto-resolved. Zero manual work.",
  },
  {
    icon: Users,
    title: "Subscriber Notifications",
    description:
      "Let your users subscribe for email updates on your status page. Double opt-in built in for compliance and deliverability.",
  },
  {
    icon: Sparkles,
    title: "AI Post-Mortems",
    description:
      "Generate clear, user-friendly incident summaries with one click using AI. Write post-mortems in seconds, not hours.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need to keep users informed
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Monitor uptime, detect incidents automatically, and communicate
            status to your users — all in one platform.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
