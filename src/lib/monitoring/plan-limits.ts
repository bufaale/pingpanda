import type { SupabaseClient } from "@supabase/supabase-js";
import { pricingPlans, type PlanName, type PlanLimits } from "@/lib/stripe/plans";

/**
 * Get the plan limits for a user based on their subscription.
 */
export async function getUserPlanLimits(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ plan: PlanName; limits: PlanLimits }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, subscription_status")
    .eq("id", userId)
    .single();

  const planName = (
    profile?.subscription_status === "active"
      ? profile?.subscription_plan
      : "free"
  ) as PlanName;

  const plan = pricingPlans.find((p) => p.id === planName) ?? pricingPlans[0];

  return { plan: plan.id, limits: plan.limits };
}

/**
 * Check if user can create more status pages.
 */
export async function canCreateStatusPage(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const { limits } = await getUserPlanLimits(supabase, userId);

  const { count } = await supabase
    .from("status_pages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const current = count ?? 0;
  return {
    allowed: current < limits.status_pages,
    current,
    limit: limits.status_pages,
  };
}

/**
 * Check if user can create more monitors.
 */
export async function canCreateMonitor(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const { limits } = await getUserPlanLimits(supabase, userId);

  const { count } = await supabase
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const current = count ?? 0;
  return {
    allowed: current < limits.monitors,
    current,
    limit: limits.monitors,
  };
}

/**
 * Check if a status page can accept more subscribers.
 */
export async function canAddSubscriber(
  supabase: SupabaseClient,
  statusPageId: string,
  userId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const { limits } = await getUserPlanLimits(supabase, userId);

  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status_page_id", statusPageId)
    .eq("is_verified", true)
    .is("unsubscribed_at", null);

  const current = count ?? 0;
  return {
    allowed: current < limits.subscribers,
    current,
    limit: limits.subscribers,
  };
}

/**
 * Get the minimum check interval allowed for a user.
 */
export async function getMinCheckInterval(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { limits } = await getUserPlanLimits(supabase, userId);
  return limits.check_interval_seconds;
}
