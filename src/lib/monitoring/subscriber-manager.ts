import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Subscribe an email to a status page.
 * Creates unverified subscriber + returns verification token.
 */
export async function subscribeEmail(
  supabase: SupabaseClient,
  statusPageId: string,
  email: string,
): Promise<{ success: boolean; error?: string; token?: string }> {
  // Check if already subscribed
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, is_verified, unsubscribed_at")
    .eq("status_page_id", statusPageId)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing && existing.is_verified && !existing.unsubscribed_at) {
    return { success: false, error: "Already subscribed" };
  }

  // Re-subscribe if previously unsubscribed
  if (existing && existing.unsubscribed_at) {
    const token = crypto.randomBytes(32).toString("base64url");
    await supabase
      .from("subscribers")
      .update({
        is_verified: false,
        verification_token: token,
        unsubscribed_at: null,
      })
      .eq("id", existing.id);
    return { success: true, token };
  }

  // Re-send verification if not yet verified
  if (existing && !existing.is_verified) {
    const token = crypto.randomBytes(32).toString("base64url");
    await supabase
      .from("subscribers")
      .update({ verification_token: token })
      .eq("id", existing.id);
    return { success: true, token };
  }

  // New subscriber
  const token = crypto.randomBytes(32).toString("base64url");
  const { error } = await supabase.from("subscribers").insert({
    status_page_id: statusPageId,
    email: email.toLowerCase().trim(),
    verification_token: token,
    is_verified: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, token };
}

/**
 * Verify a subscriber by token.
 */
export async function verifySubscriber(
  supabase: SupabaseClient,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("subscribers")
    .update({ is_verified: true, verification_token: null })
    .eq("verification_token", token)
    .eq("is_verified", false)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  return { success: true };
}

/**
 * Unsubscribe by token (link in email footer).
 */
export async function unsubscribeByToken(
  supabase: SupabaseClient,
  subscriberId: string,
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriberId)
    .is("unsubscribed_at", null);

  return { success: !error };
}

/**
 * Get verified subscribers for a status page.
 */
export async function getActiveSubscribers(
  supabase: SupabaseClient,
  statusPageId: string,
): Promise<Array<{ id: string; email: string }>> {
  const { data } = await supabase
    .from("subscribers")
    .select("id, email")
    .eq("status_page_id", statusPageId)
    .eq("is_verified", true)
    .is("unsubscribed_at", null);

  return data ?? [];
}
