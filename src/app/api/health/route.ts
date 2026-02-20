import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, boolean> = { app: true, database: false };

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } },
    );
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.database = !error;
  } catch {
    checks.database = false;
  }

  const latency = Date.now() - start;
  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      latency,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 },
  );
}
