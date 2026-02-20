import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { checkMonitor } from "@/lib/monitoring/health-checker";
import type { MonitorCheckConfig } from "@/lib/monitoring/health-checker";
import { detectStatusChange } from "@/lib/monitoring/incident-manager";
import { dispatchNotifications } from "@/lib/monitoring/notification-dispatcher";
import type { Monitor, HealthStatus } from "@/types/status-page";

// ─── Helpers ─────────────────────────────────────────────────────────

const BATCH_SIZE = 10;

/**
 * Process items in batches with a concurrency limit.
 * Uses Promise.allSettled so one failure doesn't block others.
 */
async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(fn));
  }
}

// ─── GET /api/cron/check ─────────────────────────────────────────────

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("[PingPanda Cron] Health check cycle starting...");

  const supabase = createAdminClient();

  // 2. Fetch all active, non-paused monitors
  const { data: monitors, error: fetchError } = await supabase
    .from("monitors")
    .select("*")
    .eq("is_active", true)
    .eq("is_paused", false);

  if (fetchError) {
    console.error("[PingPanda Cron] Failed to fetch monitors:", fetchError.message);
    return NextResponse.json(
      { error: "Failed to fetch monitors", details: fetchError.message },
      { status: 500 },
    );
  }

  if (!monitors || monitors.length === 0) {
    console.log("[PingPanda Cron] No active monitors found. Done.");
    return NextResponse.json({
      checked: 0,
      healthy: 0,
      degraded: 0,
      down: 0,
      incidents_opened: 0,
      incidents_resolved: 0,
    });
  }

  // 3. Filter to monitors that are due for a check
  const now = Date.now();
  const dueMonitors = (monitors as Monitor[]).filter((m) => {
    if (!m.last_check_at) return true;
    const lastCheck = new Date(m.last_check_at).getTime();
    return now - lastCheck >= m.check_interval_seconds * 1000;
  });

  console.log(
    `[PingPanda Cron] ${monitors.length} active monitors, ${dueMonitors.length} due for check`,
  );

  if (dueMonitors.length === 0) {
    return NextResponse.json({
      checked: 0,
      healthy: 0,
      degraded: 0,
      down: 0,
      incidents_opened: 0,
      incidents_resolved: 0,
    });
  }

  // 4. Process due monitors in batches
  const summary = {
    checked: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    incidents_opened: 0,
    incidents_resolved: 0,
  };

  await processInBatches(dueMonitors, BATCH_SIZE, async (monitor) => {
    try {
      await processMonitor(supabase, monitor, summary);
    } catch (error) {
      console.error(
        `[PingPanda Cron] Unhandled error processing monitor ${monitor.id} (${monitor.name}):`,
        error instanceof Error ? error.message : error,
      );
    }
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `[PingPanda Cron] Cycle complete in ${elapsed}ms. ` +
      `Checked: ${summary.checked}, Healthy: ${summary.healthy}, ` +
      `Degraded: ${summary.degraded}, Down: ${summary.down}, ` +
      `Incidents opened: ${summary.incidents_opened}, Resolved: ${summary.incidents_resolved}`,
  );

  return NextResponse.json(summary);
}

// ─── Process a single monitor ────────────────────────────────────────

async function processMonitor(
  supabase: ReturnType<typeof createAdminClient>,
  monitor: Monitor,
  summary: {
    checked: number;
    healthy: number;
    degraded: number;
    down: number;
    incidents_opened: number;
    incidents_resolved: number;
  },
): Promise<void> {
  const checkConfig: MonitorCheckConfig = {
    url: monitor.url,
    method: monitor.method,
    expected_status: monitor.expected_status,
    timeout_ms: monitor.timeout_ms,
  };

  // a. Run the health check
  const result = await checkMonitor(checkConfig);

  console.log(
    `[PingPanda Cron] ${monitor.name}: ${result.status} (${result.response_time_ms}ms)` +
      (result.error_message ? ` - ${result.error_message}` : ""),
  );

  summary.checked++;
  if (result.status === "healthy") summary.healthy++;
  else if (result.status === "degraded") summary.degraded++;
  else summary.down++;

  const checkedAt = new Date().toISOString();

  // b. Insert health_checks row
  const { error: insertError } = await supabase.from("health_checks").insert({
    monitor_id: monitor.id,
    status: result.status,
    response_time_ms: result.response_time_ms,
    http_status: result.http_status,
    error_message: result.error_message,
    checked_at: checkedAt,
  });

  if (insertError) {
    console.error(
      `[PingPanda Cron] Failed to insert health check for ${monitor.name}:`,
      insertError.message,
    );
  }

  // c. Update the monitor's last_check_at, last_status, last_response_time_ms
  const { error: updateError } = await supabase
    .from("monitors")
    .update({
      last_check_at: checkedAt,
      last_status: result.status,
      last_response_time_ms: result.response_time_ms,
    })
    .eq("id", monitor.id);

  if (updateError) {
    console.error(
      `[PingPanda Cron] Failed to update monitor ${monitor.name}:`,
      updateError.message,
    );
  }

  // d. Detect status changes (incident auto-management)
  const change = await detectStatusChange(supabase, monitor.id, result.status as HealthStatus);

  if (change.type === "opened") {
    summary.incidents_opened++;
    console.log(`[PingPanda Cron] Incident OPENED for ${monitor.name}: ${change.incident?.title}`);
  } else if (change.type === "resolved") {
    summary.incidents_resolved++;
    console.log(`[PingPanda Cron] Incident RESOLVED for ${monitor.name}: ${change.incident?.title}`);
  }

  // e. Dispatch notifications if status changed
  if ((change.type === "opened" || change.type === "resolved") && change.incident) {
    await dispatchNotificationsForChange(supabase, monitor, {
      type: change.type,
      incident: change.incident,
    });
  }
}

// ─── Dispatch notifications for a status change ──────────────────────

async function dispatchNotificationsForChange(
  supabase: ReturnType<typeof createAdminClient>,
  monitor: Monitor,
  change: {
    type: "opened" | "resolved";
    incident: NonNullable<Awaited<ReturnType<typeof detectStatusChange>>["incident"]>;
  },
): Promise<void> {
  // Find the status page this incident belongs to
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("id, name, slug")
    .eq("id", change.incident.status_page_id)
    .single();

  if (!statusPage) {
    console.error(
      `[PingPanda Cron] Status page not found for incident ${change.incident.id}`,
    );
    return;
  }

  const notificationType =
    change.type === "opened" ? "incident_created" : "incident_resolved";
  const monitorAction =
    change.type === "opened" ? "monitor_down" : "monitor_recovered";

  try {
    // Send incident-level notification
    await dispatchNotifications(supabase, monitor.user_id, statusPage.id, {
      type: notificationType,
      incident: change.incident,
      monitor_name: monitor.name,
      status_page_name: statusPage.name,
      status_page_slug: statusPage.slug,
      message:
        change.type === "opened"
          ? `${monitor.name} is experiencing issues. An incident has been automatically created.`
          : `${monitor.name} has recovered. The incident has been automatically resolved.`,
    });

    // Also send monitor-level notification
    await dispatchNotifications(supabase, monitor.user_id, statusPage.id, {
      type: monitorAction,
      incident: change.incident,
      monitor_name: monitor.name,
      status_page_name: statusPage.name,
      status_page_slug: statusPage.slug,
      message:
        change.type === "opened"
          ? `Monitor "${monitor.name}" is DOWN. URL: ${monitor.url}`
          : `Monitor "${monitor.name}" has RECOVERED. URL: ${monitor.url}`,
    });
  } catch (error) {
    console.error(
      `[PingPanda Cron] Failed to dispatch notifications for ${monitor.name}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
