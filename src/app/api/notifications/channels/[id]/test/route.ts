import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership and get channel details
  const { data: channel } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (!channel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    switch (channel.type) {
      case "slack": {
        const config = channel.config as { webhook_url: string };
        const res = await fetch(config.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "*Test notification from PingPanda*\nYour notification channel is working correctly!",
          }),
        });
        if (!res.ok) {
          throw new Error(`Slack returned ${res.status}`);
        }
        break;
      }
      case "webhook": {
        const config = channel.config as {
          url: string;
          secret?: string;
          headers?: Record<string, string>;
        };
        const res = await fetch(config.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.headers || {}),
            ...(config.secret
              ? { "X-Webhook-Secret": config.secret }
              : {}),
          },
          body: JSON.stringify({
            type: "test",
            message: "Test notification from PingPanda",
            timestamp: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          throw new Error(`Webhook returned ${res.status}`);
        }
        break;
      }
      case "sms": {
        // SMS sending not implemented yet - log for future use
        console.log(
          `[Test] SMS notification would be sent to channel "${channel.name}" (${channel.id})`,
        );
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unsupported channel type: ${channel.type}` },
          { status: 400 },
        );
    }

    // Log the test notification
    await supabase.from("notification_log").insert({
      channel_id: channel.id,
      channel_type: channel.type,
      type: "test",
      payload: { message: "Test notification" },
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    // Log the failed test
    await supabase.from("notification_log").insert({
      channel_id: channel.id,
      channel_type: channel.type,
      type: "test",
      payload: { message: "Test notification" },
      status: "failed",
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: `Test failed: ${errorMessage}` },
      { status: 502 },
    );
  }
}
