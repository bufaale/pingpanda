import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { setSecurityHeaders } from "@/lib/security/headers";
import { applyMiddlewareRateLimit } from "@/lib/security/middleware-rate-limit";
import { applyWaf } from "@/lib/security/waf";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  "/s/", // Public status pages
  "/api/subscribe/", // Public subscriber endpoints
  "/api/cron/", // Cron endpoints (secured by secret)
  "/api/stripe/webhook", // Stripe webhook (verified by signature)
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block empty user-agents on API routes (scripts/bots)
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Block extremely long URLs
  if (request.url.length > 8192) {
    return NextResponse.json({ error: "URI too long" }, { status: 414 });
  }


  // WAF-lite: reject scanner UAs, vuln-endpoint probes, path traversal,
  // SQLi query patterns. Cheapest first — runs before Supabase / Upstash.
  const wafBlock = applyWaf(request);
  if (wafBlock) return setSecurityHeaders(wafBlock, request);

  // Middleware-level rate limit on every /api/* request. Webhooks and
  // cron are exempt — they're authenticated by signature / secret.
  const rl = await applyMiddlewareRateLimit(request);
  if (rl) return setSecurityHeaders(rl, request);
  // Public routes: apply security headers but skip auth
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return setSecurityHeaders(response, request);
  }

  const response = await updateSession(request);
  return setSecurityHeaders(response, request);
}

export const config = {
  matcher: [
    // Marketing / auth pages
    "/",
    "/pricing",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
    "/refund",
    "/auth/:path*",
    // Dashboard / settings
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    // Public status pages
    "/s/:path*",
    // API routes
    "/api/stripe/:path*",
    "/api/subscribe/:path*",
    "/api/cron/:path*",
    "/api/monitors/:path*",
    "/api/status-pages/:path*",
    "/api/components/:path*",
    "/api/incidents/:path*",
    "/api/notifications/:path*",
    "/api/subscribers/:path*",
  ],
};
