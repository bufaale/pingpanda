import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Subscriber ID is required" },
      { status: 400 },
    );
  }

  // Verify the subscriber belongs to one of the user's status pages
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, status_page_id")
    .eq("id", id)
    .maybeSingle();

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404 },
    );
  }

  // Verify the status page belongs to this user
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("id")
    .eq("id", subscriber.status_page_id)
    .eq("user_id", user.id)
    .single();

  if (!statusPage) {
    return NextResponse.json(
      { error: "Not authorized to manage this subscriber" },
      { status: 403 },
    );
  }

  // Soft-delete: set unsubscribed_at
  const { error } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
