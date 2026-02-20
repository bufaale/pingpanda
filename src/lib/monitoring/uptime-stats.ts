import type { SupabaseClient } from "@supabase/supabase-js";
import type { HealthStatus, UptimeDataPoint } from "@/types/status-page";

export interface UptimeStatsResult {
  uptime_percent: number;
  avg_response_time_ms: number;
  total_checks: number;
  incidents_count: number;
  daily_uptime: UptimeDataPoint[];
}

/**
 * Compute uptime statistics for a monitor over the last N days.
 */
export async function calculateUptimeStats(
  supabase: SupabaseClient,
  monitorId: string,
  days: number = 90,
): Promise<UptimeStatsResult> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const { data: checks } = await supabase
    .from("health_checks")
    .select("status, response_time_ms, checked_at")
    .eq("monitor_id", monitorId)
    .gte("checked_at", sinceIso)
    .order("checked_at", { ascending: true });

  if (!checks || checks.length === 0) {
    return {
      uptime_percent: 100,
      avg_response_time_ms: 0,
      total_checks: 0,
      incidents_count: 0,
      daily_uptime: [],
    };
  }

  // Uptime %
  const healthyCount = checks.filter((c) => c.status === "healthy").length;
  const uptimePercent =
    Math.round((healthyCount / checks.length) * 100 * 100) / 100;

  // Average response time
  const responseTimes = checks
    .map((c) => c.response_time_ms)
    .filter((t): t is number => t !== null && t > 0);
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  // Daily uptime data points
  const dailyMap = new Map<string, { total: number; healthy: number }>();

  for (const check of checks) {
    const date = check.checked_at.split("T")[0];
    const entry = dailyMap.get(date) || { total: 0, healthy: 0 };
    entry.total++;
    if (check.status === "healthy") entry.healthy++;
    dailyMap.set(date, entry);
  }

  const dailyUptime: UptimeDataPoint[] = Array.from(dailyMap.entries()).map(
    ([date, { total, healthy }]) => ({
      date,
      uptime_percentage: Math.round((healthy / total) * 100 * 100) / 100,
      total_checks: total,
      successful_checks: healthy,
    }),
  );

  return {
    uptime_percent: uptimePercent,
    avg_response_time_ms: avgResponseTime,
    total_checks: checks.length,
    incidents_count: 0, // Will be computed separately when needed
    daily_uptime: dailyUptime,
  };
}

/**
 * Calculate overall status for a status page based on its components.
 */
export function calculateOverallStatus(
  componentStatuses: string[],
): HealthStatus {
  if (componentStatuses.length === 0) return "healthy";

  if (componentStatuses.some((s) => s === "major_outage")) return "down";
  if (componentStatuses.some((s) => s === "degraded")) return "degraded";
  if (componentStatuses.some((s) => s === "maintenance")) return "degraded";
  return "healthy";
}
