import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy Policy for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Effective: February 17, 2026
      </p>
      <div className="max-w-none space-y-6">
        <p className="text-muted-foreground leading-relaxed mb-4">
          {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
          is committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you
          use our Service. This policy complies with the General Data Protection
          Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We collect the following types of information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account Information:</strong>{" "}
            Name, email address, and password when you create an account.
          </li>
          <li>
            <strong className="text-foreground">Billing Information:</strong>{" "}
            Payment method details and billing address, processed securely
            through Stripe. We do not store your full credit card number.
          </li>
          <li>
            <strong className="text-foreground">Usage Data:</strong> Information
            about how you interact with the Service, including pages visited,
            features used, timestamps, device information, browser type, and IP
            address.
          </li>
          <li>
            <strong className="text-foreground">Content Data:</strong> Data you
            input into the Service for processing.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We use the collected information for the following purposes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Provide the Service:</strong>{" "}
            To operate, maintain, and deliver the features and functionality of
            the Service.
          </li>
          <li>
            <strong className="text-foreground">Billing and Payments:</strong>{" "}
            To process transactions and manage your subscription.
          </li>
          <li>
            <strong className="text-foreground">Analytics:</strong> To
            understand how users interact with the Service and to improve our
            product.
          </li>
          <li>
            <strong className="text-foreground">Communication:</strong> To send
            you transactional emails (account confirmations, billing receipts,
            security alerts) and, with your consent, product updates and
            announcements.
          </li>
          <li>
            <strong className="text-foreground">Security:</strong> To detect,
            prevent, and address fraud, abuse, and technical issues.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          3. Legal Basis for Processing (GDPR)
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Under the GDPR, we process your personal data based on the following
          legal grounds:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">
              Performance of a Contract:
            </strong>{" "}
            Processing necessary to provide the Service you have subscribed to.
          </li>
          <li>
            <strong className="text-foreground">Legitimate Interest:</strong>{" "}
            Analytics, security, and product improvement, where our interests do
            not override your fundamental rights.
          </li>
          <li>
            <strong className="text-foreground">Consent:</strong> Marketing
            communications and non-essential cookies, which you can withdraw at
            any time.
          </li>
          <li>
            <strong className="text-foreground">Legal Obligation:</strong>{" "}
            Where required by applicable law, such as tax and accounting
            requirements.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. Third-Party Service Providers
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We share your information with the following trusted third-party
          service providers who assist us in operating the Service:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Stripe</strong> &mdash; Payment
            processing. Stripe processes your billing information in accordance
            with their{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Supabase</strong> &mdash;
            Database hosting and authentication. Your account data and
            application data are stored on Supabase infrastructure.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> &mdash;
            Application hosting and content delivery. Usage data and IP
            addresses may be processed by Vercel for hosting purposes.
          </li>
          <li>
            <strong className="text-foreground">Anthropic</strong> &mdash; AI
            processing. Content you submit for AI-powered features may be
            processed by Anthropic&apos;s Claude API to generate results.
            Anthropic does not use your data to train their models.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We do not sell your personal information to third parties.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We use cookies and similar tracking technologies to operate the
          Service:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Essential Cookies:</strong>{" "}
            Required for authentication, session management, and security. These
            cannot be disabled.
          </li>
          <li>
            <strong className="text-foreground">Analytics Cookies:</strong> Used
            to understand how users interact with the Service and to improve our
            product. You may opt out of analytics cookies through your browser
            settings.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Data Retention
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We retain your personal data for as long as your account is active or
          as needed to provide the Service. If you delete your account, we will
          delete or anonymize your personal data within 30 days, except where
          retention is required by law (e.g., billing records for tax purposes,
          which may be retained for up to 7 years).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          7. Your Rights (GDPR)
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you are located in the European Economic Area, you have the
          following rights under the GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Right of Access:</strong>{" "}
            Request a copy of the personal data we hold about you.
          </li>
          <li>
            <strong className="text-foreground">Right to Rectification:</strong>{" "}
            Request correction of inaccurate or incomplete personal data.
          </li>
          <li>
            <strong className="text-foreground">Right to Erasure:</strong>{" "}
            Request deletion of your personal data.
          </li>
          <li>
            <strong className="text-foreground">Right to Restriction:</strong>{" "}
            Request that we restrict processing of your personal data.
          </li>
          <li>
            <strong className="text-foreground">Right to Portability:</strong>{" "}
            Request your personal data in a structured, machine-readable format.
          </li>
          <li>
            <strong className="text-foreground">Right to Object:</strong> Object
            to processing based on legitimate interest or for direct marketing.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          8. Your Rights (CCPA)
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you are a California resident, the CCPA provides you with the
          following rights:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Right to Know:</strong> Request
            disclosure of the categories and specific pieces of personal
            information we have collected about you.
          </li>
          <li>
            <strong className="text-foreground">Right to Delete:</strong>{" "}
            Request deletion of your personal information.
          </li>
          <li>
            <strong className="text-foreground">Right to Opt-Out:</strong> We do
            not sell personal information, so this right does not apply.
          </li>
          <li>
            <strong className="text-foreground">
              Right to Non-Discrimination:
            </strong>{" "}
            We will not discriminate against you for exercising any of your CCPA
            rights.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          9. Data Deletion
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To request deletion of your personal data, please email us at{" "}
          <a
            href="mailto:alejandroebufarini@gmail.com"
            className="text-primary hover:underline"
          >
            alejandroebufarini@gmail.com
          </a>
          . We will process your request within 30 days and confirm deletion via
          email. Note that some data may be retained as required by law.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          10. Data Security
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We implement appropriate technical and organizational measures to
          protect your personal data, including encryption in transit (TLS) and
          at rest, access controls, and regular security reviews. However, no
          method of transmission over the Internet is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          11. International Data Transfers
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Your data may be transferred to and processed in the United States and
          other countries where our service providers operate. When transferring
          data outside the EEA, we ensure appropriate safeguards are in place,
          such as Standard Contractual Clauses approved by the European
          Commission.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          12. Children&apos;s Privacy
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Service is not intended for children under the age of 16. We do
          not knowingly collect personal data from children. If we become aware
          that we have collected data from a child under 16, we will take steps
          to delete it promptly.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          13. Changes to This Policy
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We may update this Privacy Policy from time to time. When we make
          material changes, we will notify you by email or through a prominent
          notice within the Service. Your continued use of the Service after the
          effective date of the revised policy constitutes your acceptance of the
          changes.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          14. Contact Information
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you have questions about this Privacy Policy or wish to exercise
          your data protection rights, please contact us at{" "}
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
