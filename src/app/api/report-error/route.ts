import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.PILOTDECK_ERROR_WEBHOOK_URL;
  const secret = process.env.PILOTDECK_ERROR_SECRET;
  if (!url || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        app_slug: process.env.APP_SLUG || "unknown",
        type: body.type || "client",
        message: body.message || "Unknown error",
        stack: body.stack?.slice(0, 4000),
        routePath: body.url,
        routeType: "page",
        method: "GET",
        url: body.url,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
