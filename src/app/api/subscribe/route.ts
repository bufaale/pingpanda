import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { subscribeEmail } from "@/lib/monitoring/subscriber-manager";
import { canAddSubscriber } from "@/lib/monitoring/plan-limits";
import { createAuthLimiter, applyRateLimit } from "@/lib/security/rate-limit";
import { validateInput } from "@/lib/security/validate";

const subscribeSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  status_page_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 req/min per IP (reuse auth limiter = 5/min)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limiter = createAuthLimiter();
  const rateLimited = await applyRateLimit(`subscribe:${ip}`, limiter);
  if (rateLimited) return rateLimited;

  // Parse & validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateInput(subscribeSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, status_page_id } = validation.data;

  // Use admin client (public endpoint, no user auth)
  const supabase = createAdminClient();

  // Check status page exists and is public
  const { data: statusPage, error: pageError } = await supabase
    .from("status_pages")
    .select("id, user_id, slug, is_public")
    .eq("id", status_page_id)
    .single();

  if (pageError || !statusPage) {
    return NextResponse.json(
      { error: "Status page not found" },
      { status: 404 },
    );
  }

  if (!statusPage.is_public) {
    return NextResponse.json(
      { error: "This status page does not accept subscribers" },
      { status: 403 },
    );
  }

  // Check subscriber limit for the status page owner
  const { allowed, current, limit } = await canAddSubscriber(
    supabase,
    status_page_id,
    statusPage.user_id,
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: `This status page has reached its subscriber limit (${current}/${limit}).`,
      },
      { status: 403 },
    );
  }

  // Create subscriber + get verification token
  const result = await subscribeEmail(supabase, status_page_id, email);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Send verification email via Resend
  if (result.token) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verifyUrl = `${appUrl}/api/subscribe/verify?token=${result.token}`;
      const fromAddress = `PingPanda <notifications@${process.env.RESEND_DOMAIN || "updates.pingpanda.dev"}>`;

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "Confirm your subscription",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #111; margin-bottom: 16px;">Confirm your subscription</h2>
            <p style="color: #555; line-height: 1.6;">
              You requested to receive status updates. Click the button below to confirm your subscription.
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${verifyUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                Confirm Subscription
              </a>
            </div>
            <p style="color: #999; font-size: 13px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the request -- subscriber is created, they can re-request
    }
  }

  return NextResponse.json({
    success: true,
    message: "Check your email to confirm your subscription.",
  });
}
