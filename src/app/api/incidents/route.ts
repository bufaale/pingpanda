import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  status_page_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  severity: z.enum(["minor", "major", "critical"]).optional().default("minor"),
  affected_components: z.array(z.string().uuid()).optional().default([]),
  is_maintenance: z.boolean().optional().default(false),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's status pages
  const { data: pages } = await supabase
    .from("status_pages")
    .select("id")
    .eq("user_id", user.id);

  const pageIds = pages?.map((p) => p.id) ?? [];
  if (pageIds.length === 0) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("incidents")
    .select("*, incident_updates:incident_updates(*)")
    .in("status_page_id", pageIds)
    .order("started_at", { ascending: false });

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

  // Verify user owns the status page
  const { data: page } = await supabase
    .from("status_pages")
    .select("id")
    .eq("id", parsed.data.status_page_id)
    .eq("user_id", user.id)
    .single();

  if (!page)
    return NextResponse.json(
      { error: "Status page not found" },
      { status: 404 },
    );

  // Create incident
  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      status_page_id: parsed.data.status_page_id,
      user_id: user.id,
      title: parsed.data.title,
      message: parsed.data.message,
      severity: parsed.data.severity,
      affected_components: parsed.data.affected_components,
      is_maintenance: parsed.data.is_maintenance,
      status: "investigating",
      created_by: "manual",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Create initial incident update
  if (incident) {
    await supabase.from("incident_updates").insert({
      incident_id: incident.id,
      status: "investigating",
      message: parsed.data.message,
      created_by: user.id,
    });

    // Update affected component statuses
    if (parsed.data.affected_components.length > 0) {
      const newStatus = parsed.data.is_maintenance
        ? "maintenance"
        : parsed.data.severity === "critical" || parsed.data.severity === "major"
          ? "major_outage"
          : "degraded";

      await supabase
        .from("components")
        .update({ status: newStatus })
        .in("id", parsed.data.affected_components)
        .eq("user_id", user.id);
    }
  }

  return NextResponse.json(incident, { status: 201 });
}
