import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySubscriber } from "@/lib/monitoring/subscriber-manager";
import { createApiLimiter, applyRateLimit } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  // Rate limit: reuse general API limiter (60 req/min)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limiter = createApiLimiter();
  const rateLimited = await applyRateLimit(`verify:${ip}`, limiter);
  if (rateLimited) return rateLimited;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token.length > 200) {
    return NextResponse.redirect(
      new URL("/?error=invalid_token", appUrl),
      303,
    );
  }

  const supabase = createAdminClient();

  // Look up the subscriber by token BEFORE verifying so we can get the status page slug
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, status_page_id")
    .eq("verification_token", token)
    .eq("is_verified", false)
    .maybeSingle();

  if (!subscriber) {
    return NextResponse.redirect(
      new URL("/?error=invalid_token", appUrl),
      303,
    );
  }

  // Get the status page slug for redirect
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("slug")
    .eq("id", subscriber.status_page_id)
    .single();

  // Now verify the subscriber
  const result = await verifySubscriber(supabase, token);

  if (!result.success) {
    return NextResponse.redirect(
      new URL("/?error=invalid_token", appUrl),
      303,
    );
  }

  // Redirect to the public status page with verified flag
  if (statusPage?.slug) {
    return NextResponse.redirect(
      new URL(`/s/${statusPage.slug}?verified=true`, appUrl),
      303,
    );
  }

  // Fallback if no slug found
  return NextResponse.redirect(new URL("/?verified=true", appUrl), 303);
}
