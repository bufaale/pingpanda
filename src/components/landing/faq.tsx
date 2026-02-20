import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does uptime monitoring work?",
    answer:
      "We send HTTP requests to your endpoints at configured intervals (1-60 minutes). If 2 consecutive checks fail, we auto-create an incident and notify you immediately via Slack, webhook, or email.",
  },
  {
    question: "What's included in the free tier?",
    answer:
      "1 status page, 5 monitors, 100 subscribers, and 60-minute check intervals. No credit card required, free forever. Upgrade when you need more monitors, pages, or faster check intervals.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes! Pro and Business plans include custom domain support. Point your CNAME (e.g., status.yourapp.com) to PingPanda and your status page will be available on your own domain.",
  },
  {
    question: "How fast are incident notifications?",
    answer:
      "Typically under 30 seconds. We send notifications via Slack webhooks, custom webhooks, and email simultaneously so your team is alerted through every channel at once.",
  },
  {
    question: "What happens when a service recovers?",
    answer:
      "We auto-resolve the incident, reset the component status to operational, and notify all subscribers that the issue is resolved. No manual intervention needed.",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Absolutely! The free tier is fully functional with no time limit. Use it for as long as you want. Upgrade only when you need more monitors, pages, or faster check intervals.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            Everything you need to know about PingPanda.
          </p>
        </div>
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
