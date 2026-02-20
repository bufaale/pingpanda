import { NextResponse, type NextRequest } from "next/server";

/**
 * Set security headers on all responses.
 * Call this in middleware.ts after updateSession().
 */
export function setSecurityHeaders(
  response: NextResponse,
  request: NextRequest,
): NextResponse {
  const headers = response.headers;

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Content-Security-Policy", buildCSP());

  return response;
}

function buildCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://js.stripe.com",
      "https://va.vercel-scripts.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://*.supabase.co",
      "https://lh3.googleusercontent.com",
    ],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.stripe.com",
      "https://va.vercel-scripts.com",
    ],
    "frame-src": ["https://js.stripe.com", "https://hooks.stripe.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  if (isDev) {
    directives["script-src"].push("'unsafe-eval'");
    directives["connect-src"].push("ws://localhost:*");
  }

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`,
    )
    .join("; ");
}
