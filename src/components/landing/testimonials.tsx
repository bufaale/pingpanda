import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Switched from Statuspage and saving $240/year. PingPanda has everything we need at a fraction of the price.",
    name: "Jamie Park",
    role: "CTO at CloudSync",
    initials: "JP",
  },
  {
    quote:
      "The AI incident summaries save me 30 minutes per incident. My team used to dread writing post-mortems.",
    name: "David Chen",
    role: "SRE Lead at DataFlow",
    initials: "DC",
  },
  {
    quote:
      "Setup took 5 minutes. Our status page looks more professional than our $50/mo enterprise tool.",
    name: "Lisa Nguyen",
    role: "Founder at ShipFast Labs",
    initials: "LN",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Loved by SaaS teams</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            See what founders and engineering teams are saying about PingPanda.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
