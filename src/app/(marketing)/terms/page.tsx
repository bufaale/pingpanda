import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description: `Terms of Service for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Effective: February 17, 2026
      </p>
      <div className="max-w-none space-y-6">
        <h2 className="text-xl font-semibold mt-8 mb-3">
          1. Acceptance of Terms
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          By accessing or using {siteConfig.name} (&quot;the Service&quot;),
          operated by {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;), you agree to be bound by these Terms of Service. If
          you do not agree to these terms, you may not use the Service. We
          reserve the right to update these terms at any time, and we will
          notify you of material changes via email or through the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. Description of Service
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {siteConfig.name} is a web-based software service that provides
          AI-powered tools and features accessible through a subscription plan.
          Features may vary based on your subscription plan.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. User Accounts</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To use the Service, you must create an account and provide accurate,
          complete information. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities that
          occur under your account. You must notify us immediately of any
          unauthorized use of your account.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. Acceptable Use Policy
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Violate any applicable law or regulation</li>
          <li>Infringe upon the intellectual property rights of others</li>
          <li>Transmit any malicious code, viruses, or harmful content</li>
          <li>
            Attempt to gain unauthorized access to the Service or its
            infrastructure
          </li>
          <li>
            Use the Service for any fraudulent, abusive, or illegal purpose
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Service
          </li>
          <li>
            Reverse engineer, decompile, or disassemble any part of the Service
          </li>
          <li>
            Resell, sublicense, or redistribute the Service without prior
            written consent
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          5. Intellectual Property
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          All intellectual property rights in the Service, including but not
          limited to software, design, text, graphics, logos, and trademarks,
          are owned by {siteConfig.name} or its licensors. You retain ownership
          of any data you submit to the Service. By using the Service, you grant
          us a limited license to process your data solely for the purpose of
          providing the Service to you.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Payment and Billing
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Certain features of the Service require a paid subscription. By
          subscribing to a paid plan, you agree to pay the applicable fees as
          described at the time of purchase. All fees are charged in advance on a
          recurring basis (monthly or annually) and are non-refundable except as
          described in our Refund Policy. We reserve the right to change pricing
          with 30 days&apos; advance notice.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          7. Service Availability
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Service is provided &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; without warranties of any kind, whether express or
          implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement. We do not guarantee that the Service will be
          uninterrupted, error-free, or secure. We may perform scheduled
          maintenance that temporarily limits availability.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          8. Limitation of Liability
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To the maximum extent permitted by applicable law, {siteConfig.name}{" "}
          and its officers, directors, employees, and agents shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, including but not limited to loss of profits, data, business
          opportunities, or goodwill, arising out of or in connection with your
          use of the Service. Our total liability for any claim arising from
          these Terms or the Service shall not exceed the amount you paid us in
          the twelve (12) months preceding the claim.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          9. Indemnification
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You agree to indemnify and hold harmless {siteConfig.name} and its
          officers, directors, employees, and agents from any claims, damages,
          losses, or expenses (including reasonable legal fees) arising from your
          use of the Service, your violation of these Terms, or your
          infringement of any third-party rights.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">10. Termination</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We reserve the right to suspend or terminate your account at any time,
          with or without cause, and with or without notice. Upon termination,
          your right to use the Service will immediately cease. You may also
          terminate your account at any time by canceling your subscription and
          contacting us at{" "}
          <a
            href="mailto:alejandroebufarini@gmail.com"
            className="text-primary hover:underline"
          >
            alejandroebufarini@gmail.com
          </a>
          . Provisions that by their nature should survive termination will
          remain in effect, including sections on intellectual property,
          limitation of liability, and dispute resolution.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          11. Dispute Resolution
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Any disputes arising out of or relating to these Terms or the Service
          shall be resolved through binding arbitration in the State of Wyoming,
          United States, in accordance with the rules of the American
          Arbitration Association. You agree to waive any right to a jury trial
          or to participate in a class action. Each party shall bear its own
          costs of arbitration unless the arbitrator determines otherwise. This
          arbitration agreement shall survive termination of these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          12. Modifications to Terms
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We reserve the right to modify these Terms at any time. When we make
          material changes, we will notify you by email or through a prominent
          notice within the Service at least 30 days before the changes take
          effect. Your continued use of the Service after the effective date of
          the revised Terms constitutes your acceptance of the changes.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          13. Governing Law
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          These Terms shall be governed by and construed in accordance with the
          laws of the State of Wyoming, United States, without regard to its
          conflict of law provisions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          14. Contact Information
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href="mailto:alejandroebufarini@gmail.com"
            className="text-primary hover:underline"
          >
            alejandroebufarini@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
