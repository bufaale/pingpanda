import type { SupabaseClient } from "@supabase/supabase-js";
import type { Incident, NotificationChannel } from "@/types/status-page";
import { getActiveSubscribers } from "./subscriber-manager";

interface NotificationPayload {
  type: "incident_created" | "incident_updated" | "incident_resolved" | "monitor_down" | "monitor_recovered";
  incident?: Incident;
  monitor_name?: string;
  status_page_name?: string;
  status_page_slug?: string;
  message: string;
}

/**
 * Dispatch notifications for an event to all relevant channels + subscribers.
 */
export async function dispatchNotifications(
  supabase: SupabaseClient,
  userId: string,
  statusPageId: string,
  payload: NotificationPayload,
): Promise<void> {
  // Get user's active notification channels
  const { data: channels } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  // Send to each channel
  for (const channel of channels ?? []) {
    try {
      await sendToChannel(channel as NotificationChannel, payload);

      // Log success
      await supabase.from("notification_log").insert({
        channel_id: channel.id,
        channel_type: channel.type,
        incident_id: payload.incident?.id ?? null,
        type: payload.type,
        payload: payload as unknown as Record<string, unknown>,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    } catch (error) {
      // Log failure
      await supabase.from("notification_log").insert({
        channel_id: channel.id,
        channel_type: channel.type,
        incident_id: payload.incident?.id ?? null,
        type: payload.type,
        payload: payload as unknown as Record<string, unknown>,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Send email to subscribers (for incident events only)
  if (payload.type.startsWith("incident_")) {
    await notifySubscribers(supabase, statusPageId, payload);
  }
}

async function sendToChannel(
  channel: NotificationChannel,
  payload: NotificationPayload,
): Promise<void> {
  switch (channel.type) {
    case "slack": {
      const config = channel.config as { webhook_url: string };
      await fetch(config.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*${payload.type.replace(/_/g, " ").toUpperCase()}*\n${payload.message}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${payload.status_page_name || "Status Page"}*\n${payload.message}`,
              },
            },
          ],
        }),
      });
      break;
    }
    case "webhook": {
      const config = channel.config as { url: string; secret: string | null; headers: Record<string, string> | null };
      await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
          ...(config.secret ? { "X-Webhook-Secret": config.secret } : {}),
        },
        body: JSON.stringify(payload),
      });
      break;
    }
    case "sms":
      // SMS via Twilio — future implementation
      break;
  }
}

async function notifySubscribers(
  supabase: SupabaseClient,
  statusPageId: string,
  payload: NotificationPayload,
): Promise<void> {
  const subscribers = await getActiveSubscribers(supabase, statusPageId);

  if (subscribers.length === 0) return;

  // Batch email via Resend (imported dynamically to avoid circular deps)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const statusPageUrl = `${appUrl}/s/${payload.status_page_slug || ""}`;

  // We'll import Resend here to send batch emails
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send in batches of 50
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      await resend.batch.send(
        batch.map((sub) => ({
          from: `${payload.status_page_name || "PingPanda"} <notifications@${process.env.RESEND_DOMAIN || "updates.pingpanda.dev"}>`,
          to: sub.email,
          subject: `[${payload.type === "incident_resolved" ? "Resolved" : "Incident"}] ${payload.incident?.title || payload.message}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${payload.incident?.title || "Status Update"}</h2>
              <p>${payload.message}</p>
              <p><a href="${statusPageUrl}">View Status Page</a></p>
              <hr />
              <p style="color: #666; font-size: 12px;">
                <a href="${appUrl}/api/subscribe/unsubscribe?id=${sub.id}">Unsubscribe</a>
              </p>
            </div>
          `,
        })),
      );
    }
  } catch (error) {
    console.error("[PingPanda] Failed to send subscriber emails:", error);
  }
}
