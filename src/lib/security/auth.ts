import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type AuthResult =
  | { authenticated: true; user: { id: string; email: string } }
  | { authenticated: false; response: NextResponse };

/**
 * Require authentication in API route handlers.
 * Uses getUser() (server-validated) not getSession() (cookie-based).
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    authenticated: true,
    user: { id: user.id, email: user.email! },
  };
}

/** Get user's subscription plan */
export async function getUserPlan(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", userId)
    .single();
  return profile?.subscription_plan ?? "free";
}
