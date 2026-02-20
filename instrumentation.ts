export async function onRequestError(
  err: { message: string; stack?: string },
  request: { path: string; method: string },
  context: { routeType?: string; routePath?: string },
) {
  const url = process.env.PILOTDECK_ERROR_WEBHOOK_URL;
  const secret = process.env.PILOTDECK_ERROR_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        app_slug: process.env.APP_SLUG || "unknown",
        type: "server",
        message: err.message,
        stack: err.stack?.slice(0, 4000),
        routePath: context.routePath || request.path,
        routeType: context.routeType,
        method: request.method,
        url: request.path,
      }),
    });
  } catch {
    // Silent fail - don't crash the app for monitoring
  }
}
