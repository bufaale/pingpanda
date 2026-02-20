import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || "noreply@yourdomain.com";

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to PingPanda!",
    html: `
      <h1>Welcome, ${escapeHtml(name || "there")}!</h1>
      <p>Thanks for signing up. You're all set to start building amazing things.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>
    `,
  });
}

export async function sendSubscriptionEmail(email: string, plan: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `You're now on the ${escapeHtml(plan)} plan!`,
    html: `
      <h1>Subscription Confirmed</h1>
      <p>You've been upgraded to the <strong>${escapeHtml(plan)}</strong> plan.</p>
      <p>Enjoy all the premium features!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
