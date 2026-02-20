import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { WhyUs } from "@/components/landing/why-us";
import { Pricing } from "@/components/landing/pricing";
import { Comparison } from "@/components/landing/comparison";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <WhyUs />
      <Pricing />
      <Comparison />
      <Testimonials />
      <FAQ />
    </>
  );
}
