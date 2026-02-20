import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { unsubscribeByToken } from "@/lib/monitoring/subscriber-manager";
import { createApiLimiter, applyRateLimit } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limiter = createApiLimiter();
  const rateLimited = await applyRateLimit(`unsubscribe:${ip}`, limiter);
  if (rateLimited) return rateLimited;

  const subscriberId = req.nextUrl.searchParams.get("id");

  if (!subscriberId) {
    return new NextResponse(buildHtmlPage("Invalid unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createAdminClient();

  const result = await unsubscribeByToken(supabase, subscriberId);

  const message = result.success
    ? "You have been unsubscribed. You will no longer receive status updates."
    : "Unable to unsubscribe. You may have already been unsubscribed.";

  return new NextResponse(buildHtmlPage(message), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function buildHtmlPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - PingPanda</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #fafafa;
      color: #333;
    }
    .container {
      text-align: center;
      padding: 32px;
      max-width: 400px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 12px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .subtle {
      font-size: 13px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Unsubscribed</h1>
    <p>${message}</p>
    <p class="subtle">You can close this tab.</p>
  </div>
</body>
</html>`;
}
