import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  status_page_id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  group_name: z.string().trim().max(100).nullable().optional(),
  status: z
    .enum([
      "operational",
      "degraded",
      "major_outage",
      "maintenance",
      "unknown",
    ])
    .optional()
    .default("operational"),
});

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

  // Get next position
  const { count } = await supabase
    .from("components")
    .select("id", { count: "exact", head: true })
    .eq("status_page_id", parsed.data.status_page_id);

  const { data, error } = await supabase
    .from("components")
    .insert({
      status_page_id: parsed.data.status_page_id,
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      group_name: parsed.data.group_name ?? null,
      status: parsed.data.status,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
