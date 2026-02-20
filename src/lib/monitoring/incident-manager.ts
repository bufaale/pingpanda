import type { SupabaseClient } from "@supabase/supabase-js";
import type { HealthStatus, Incident, IncidentUpdate } from "@/types/status-page";
import { HEALTH_THRESHOLDS } from "./constants";

/**
 * Detect status changes and auto-manage incidents.
 * Uses consecutive failure threshold to avoid flapping.
 */
export async function detectStatusChange(
  supabase: SupabaseClient,
  monitorId: string,
  newStatus: HealthStatus,
): Promise<{
  type: "opened" | "resolved" | "unchanged";
  incident: Incident | null;
}> {
  // Get recent checks to determine consecutive failures
  const { data: recentChecks } = await supabase
    .from("health_checks")
    .select("status")
    .eq("monitor_id", monitorId)
    .order("checked_at", { ascending: false })
    .limit(HEALTH_THRESHOLDS.incident_threshold + 1);

  if (!recentChecks || recentChecks.length < 2) {
    return { type: "unchanged", incident: null };
  }

  // Check if we have consecutive failures (threshold = 2)
  const consecutiveFailures = recentChecks
    .slice(0, HEALTH_THRESHOLDS.incident_threshold)
    .every((c) => c.status === "down" || c.status === "degraded");

  const wasHealthyBefore = recentChecks.length > HEALTH_THRESHOLDS.incident_threshold
    ? recentChecks[HEALTH_THRESHOLDS.incident_threshold].status === "healthy"
    : true;

  // Get the monitor to find linked component and status page
  const { data: monitor } = await supabase
    .from("monitors")
    .select("id, name, user_id, component_id")
    .eq("id", monitorId)
    .single();

  if (!monitor) return { type: "unchanged", incident: null };

  // Find the component linked to this monitor (monitor has component_id)
  const { data: component } = monitor.component_id
    ? await supabase
        .from("components")
        .select("id, status_page_id")
        .eq("id", monitor.component_id)
        .maybeSingle()
    : { data: null };

  // Check for existing open incident linked to this monitor
  const { data: openIncident } = await supabase
    .from("incidents")
    .select("*")
    .contains("affected_components", component ? [component.id] : [])
    .neq("status", "resolved")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Consecutive failures detected → open incident
  if (consecutiveFailures && wasHealthyBefore && !openIncident && component) {
    const severity = newStatus === "down" ? "major" : "minor";

    const { data: incident } = await supabase
      .from("incidents")
      .insert({
        status_page_id: component.status_page_id,
        user_id: monitor.user_id,
        title: `${monitor.name} is ${newStatus}`,
        status: "investigating",
        severity,
        message: `Automated: ${monitor.name} detected as ${newStatus}`,
        affected_components: [component.id],
        created_by: "auto",
      })
      .select()
      .single();

    // Update component status
    const componentStatus = newStatus === "down" ? "major_outage" : "degraded";
    await supabase
      .from("components")
      .update({ status: componentStatus })
      .eq("id", component.id);

    return { type: "opened", incident: incident as Incident | null };
  }

  // Was failing, now healthy → resolve open incident
  if (newStatus === "healthy" && openIncident) {
    const now = new Date().toISOString();

    // Add resolution update
    await supabase.from("incident_updates").insert({
      incident_id: openIncident.id,
      status: "resolved",
      message: "Automated: Service has recovered and is operating normally.",
      created_by: monitor.user_id,
    });

    // Resolve the incident
    const { data: resolved } = await supabase
      .from("incidents")
      .update({ status: "resolved", resolved_at: now })
      .eq("id", openIncident.id)
      .select()
      .single();

    // Reset component status
    if (component) {
      await supabase
        .from("components")
        .update({ status: "operational" })
        .eq("id", component.id);
    }

    return { type: "resolved", incident: resolved as Incident | null };
  }

  return { type: "unchanged", incident: null };
}

/**
 * Create an incident update (timeline entry).
 */
export async function createIncidentUpdate(
  supabase: SupabaseClient,
  incidentId: string,
  status: string,
  message: string,
  userId: string,
): Promise<IncidentUpdate | null> {
  // Update the incident status
  const updateData: Record<string, unknown> = { status };
  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  }

  await supabase.from("incidents").update(updateData).eq("id", incidentId);

  // Insert timeline entry
  const { data } = await supabase
    .from("incident_updates")
    .insert({
      incident_id: incidentId,
      status,
      message,
      created_by: userId,
    })
    .select()
    .single();

  return data as IncidentUpdate | null;
}
