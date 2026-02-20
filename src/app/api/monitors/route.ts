import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  canCreateMonitor,
  getMinCheckInterval,
} from "@/lib/monitoring/plan-limits";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  url: z.string().trim().url().max(2000),
  method: z.enum(["GET", "HEAD"]).optional().default("GET"),
  expected_status_code: z
    .number()
    .int()
    .min(100)
    .max(599)
    .optional()
    .default(200),
  check_interval_seconds: z
    .number()
    .int()
    .min(60)
    .max(3600)
    .optional()
    .default(300),
  timeout_seconds: z.number().int().min(1).max(30).optional().default(10),
  component_id: z.string().uuid().nullable().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // Check plan limits
  const { allowed, current, limit } = await canCreateMonitor(
    supabase,
    user.id,
  );
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Plan limit reached (${current}/${limit} monitors). Upgrade to create more.`,
      },
      { status: 403 },
    );
  }

  // Enforce minimum check interval
  const minInterval = await getMinCheckInterval(supabase, user.id);
  const checkInterval = Math.max(
    parsed.data.check_interval_seconds,
    minInterval,
  );

  const { data, error } = await supabase
    .from("monitors")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      url: parsed.data.url,
      method: parsed.data.method,
      expected_status: parsed.data.expected_status_code,
      check_interval_seconds: checkInterval,
      timeout_ms: parsed.data.timeout_seconds * 1000,
      component_id: parsed.data.component_id ?? null,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
