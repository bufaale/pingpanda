import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const RETENTION_DAYS = 90;

// ─── GET /api/cron/cleanup ───────────────────────────────────────────

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[PingPanda Cleanup] Starting cleanup of old health checks...");

  const supabase = createAdminClient();

  // 2. Calculate cutoff date (90 days ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  const cutoffISO = cutoffDate.toISOString();

  console.log(`[PingPanda Cleanup] Deleting health checks older than ${cutoffISO}`);

  // 3. Delete old health checks
  // Supabase delete returns the deleted rows when using .select()
  const { data: deleted, error } = await supabase
    .from("health_checks")
    .delete()
    .lt("checked_at", cutoffISO)
    .select("id");

  if (error) {
    console.error("[PingPanda Cleanup] Failed to delete old health checks:", error.message);
    return NextResponse.json(
      { error: "Cleanup failed", details: error.message },
      { status: 500 },
    );
  }

  const deletedCount = deleted?.length ?? 0;

  console.log(`[PingPanda Cleanup] Deleted ${deletedCount} health checks older than ${RETENTION_DAYS} days.`);

  return NextResponse.json({
    deleted: deletedCount,
    retention_days: RETENTION_DAYS,
    cutoff_date: cutoffISO,
  });
}
