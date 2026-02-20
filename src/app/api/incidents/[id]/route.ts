import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
  message: z.string().trim().min(1).max(5000),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: incident } = await supabase
    .from("incidents")
    .select("*, incident_updates:incident_updates(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!incident)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(incident);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("incidents")
    .select("id, affected_components, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update incident status
  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from("incidents")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Add timeline update
  await supabase.from("incident_updates").insert({
    incident_id: id,
    status: parsed.data.status,
    message: parsed.data.message,
    created_by: user.id,
  });

  // If resolved, reset affected component statuses
  if (
    parsed.data.status === "resolved" &&
    existing.affected_components?.length > 0
  ) {
    await supabase
      .from("components")
      .update({ status: "operational" })
      .in("id", existing.affected_components)
      .eq("user_id", user.id);
  }

  return NextResponse.json(updated);
}
