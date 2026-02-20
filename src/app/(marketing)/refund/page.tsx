import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Refund Policy - ${siteConfig.name}`,
  description: `Refund Policy for ${siteConfig.name}.`,
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
      <p className="text-muted-foreground mb-8">
        Effective: February 17, 2026
      </p>
      <div className="max-w-none space-y-6">
        <p className="text-muted-foreground leading-relaxed mb-4">
          We want you to be satisfied with {siteConfig.name}. This Refund Policy
          outlines the terms under which you may request a refund for your
          subscription.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          1. Subscription Refunds
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you are not satisfied with the Service, you may request a full
          refund within <strong className="text-foreground">7 days</strong> of
          your initial purchase or renewal. After the 7-day period, no refunds
          will be issued. However, you may cancel your subscription at any time,
          and your access will continue until the end of your current billing
          period.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. How to Request a Refund
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To request a refund within the eligible period, please contact us at{" "}
          <a
            href="mailto:alejandroebufarini@gmail.com"
            className="text-primary hover:underline"
          >
            alejandroebufarini@gmail.com
          </a>{" "}
          with the following information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Your account email address</li>
          <li>Date of purchase</li>
          <li>Reason for the refund request</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4 mt-4">
          Refund requests will be processed within 5-10 business days. Approved
          refunds will be credited to your original payment method.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          3. Self-Service Cancellation
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You can cancel your subscription at any time directly from your
          account settings. Navigate to{" "}
          <strong className="text-foreground">
            Settings &rarr; Billing &rarr; Manage Subscription
          </strong>{" "}
          to cancel. Upon cancellation:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            Your subscription will remain active until the end of your current
            billing period.
          </li>
          <li>You will not be charged for the next billing cycle.</li>
          <li>
            After the billing period ends, your account will be downgraded to
            the free plan with limited features.
          </li>
          <li>
            Your data will be retained for 30 days after downgrade, after which
            it may be deleted.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. Plan Changes
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you upgrade your plan, the new rate will be charged immediately on a
          prorated basis. If you downgrade your plan, the change will take effect
          at the start of your next billing cycle. No partial refunds are issued
          for plan downgrades.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Exceptions</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Refunds will not be issued in the following cases:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            Accounts terminated for violation of our Terms of Service.
          </li>
          <li>Requests made after the 7-day refund window.</li>
          <li>
            Charges resulting from failure to cancel before a renewal date.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Contact Us
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you have any questions about this Refund Policy, please contact us
          at{" "}
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
