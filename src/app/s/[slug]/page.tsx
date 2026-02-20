import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateOverallStatus } from "@/lib/monitoring/uptime-stats";
import { calculateUptimeStats } from "@/lib/monitoring/uptime-stats";
import type {
  Incident,
  IncidentUpdate,
  HealthStatus,
  UptimeDataPoint,
} from "@/types/status-page";
import { ComponentList } from "@/components/status-page/component-list";
import { IncidentTimeline } from "@/components/status-page/incident-timeline";
import { SubscribeForm } from "./subscribe-form";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// --- Overall status banner configuration ---

const OVERALL_STATUS_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    iconBgClass: string;
  }
> = {
  healthy: {
    label: "All Systems Operational",
    bgClass: "bg-green-50 dark:bg-green-950/30",
    textClass: "text-green-800 dark:text-green-200",
    borderClass: "border-green-200 dark:border-green-800",
    iconBgClass: "bg-green-100 dark:bg-green-900/50",
  },
  degraded: {
    label: "Degraded Performance",
    bgClass: "bg-yellow-50 dark:bg-yellow-950/30",
    textClass: "text-yellow-800 dark:text-yellow-200",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    iconBgClass: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  down: {
    label: "Major Outage",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-800 dark:text-red-200",
    borderClass: "border-red-200 dark:border-red-800",
    iconBgClass: "bg-red-100 dark:bg-red-900/50",
  },
};

function OverallStatusIcon({
  status,
}: {
  status: HealthStatus;
}) {
  const className = "h-6 w-6";
  switch (status) {
    case "healthy":
      return <CheckCircle2 className={`${className} text-green-600 dark:text-green-400`} />;
    case "degraded":
      return <AlertTriangle className={`${className} text-yellow-600 dark:text-yellow-400`} />;
    case "down":
      return <XCircle className={`${className} text-red-600 dark:text-red-400`} />;
  }
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!statusPage) {
    return { title: "Status Page Not Found" };
  }

  return {
    title: `${statusPage.name} Status`,
    description:
      statusPage.description ||
      `Current system status for ${statusPage.name}`,
  };
}

// --- Page component ---

export default async function PublicStatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // 1. Fetch status page by slug
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!statusPage) {
    notFound();
  }

  // 2. Fetch components
  const { data: components } = await supabase
    .from("components")
    .select("*")
    .eq("status_page_id", statusPage.id)
    .order("position", { ascending: true });

  const allComponents = components ?? [];

  // 3. Fetch monitors linked to components (for uptime bars)
  const componentIds = allComponents.map((c) => c.id);
  let monitors: Array<{ id: string; component_id: string | null }> = [];

  if (componentIds.length > 0) {
    const { data: monitorData } = await supabase
      .from("monitors")
      .select("id, component_id")
      .in("component_id", componentIds);
    monitors = monitorData ?? [];
  }

  // 4. Calculate uptime stats for each monitor
  const uptimeByComponentId = new Map<
    string,
    { uptime_percent: number; daily_uptime: UptimeDataPoint[] }
  >();

  for (const monitor of monitors) {
    if (!monitor.component_id) continue;
    const stats = await calculateUptimeStats(supabase, monitor.id, 90);
    uptimeByComponentId.set(monitor.component_id, {
      uptime_percent: stats.uptime_percent,
      daily_uptime: stats.daily_uptime,
    });
  }

  // 5. Merge uptime data into components
  const componentsWithUptime = allComponents.map((c) => ({
    ...c,
    status: c.status as "operational" | "degraded" | "major_outage" | "maintenance" | "unknown",
    uptime_data: uptimeByComponentId.get(c.id),
  }));

  // 6. Calculate overall status
  const componentStatuses = allComponents.map((c) => c.status);
  const overallStatus = calculateOverallStatus(componentStatuses);
  const statusConfig = OVERALL_STATUS_CONFIG[overallStatus];

  // 7. Fetch active incidents with updates
  const { data: activeIncidentsRaw } = await supabase
    .from("incidents")
    .select("*")
    .eq("status_page_id", statusPage.id)
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  const activeIncidents = activeIncidentsRaw ?? [];

  // 8. Fetch resolved incidents (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: resolvedIncidentsRaw } = await supabase
    .from("incidents")
    .select("*")
    .eq("status_page_id", statusPage.id)
    .eq("status", "resolved")
    .gte("resolved_at", sevenDaysAgo.toISOString())
    .order("resolved_at", { ascending: false });

  const resolvedIncidents = resolvedIncidentsRaw ?? [];

  // 9. Fetch updates for all incidents
  const allIncidentIds = [
    ...activeIncidents.map((i) => i.id),
    ...resolvedIncidents.map((i) => i.id),
  ];

  let allUpdates: Array<{
    id: string;
    incident_id: string;
    status: string;
    message: string;
    created_by: string | null;
    created_at: string;
  }> = [];

  if (allIncidentIds.length > 0) {
    const { data: updatesData } = await supabase
      .from("incident_updates")
      .select("*")
      .in("incident_id", allIncidentIds)
      .order("created_at", { ascending: true });
    allUpdates = updatesData ?? [];
  }

  // Group updates by incident_id
  const updatesByIncident = new Map<string, IncidentUpdate[]>();
  for (const update of allUpdates) {
    const list = updatesByIncident.get(update.incident_id) ?? [];
    list.push(update as IncidentUpdate);
    updatesByIncident.set(update.incident_id, list);
  }

  // Attach updates to incidents
  const activeWithUpdates = activeIncidents.map((incident) => ({
    ...(incident as unknown as Incident),
    updates: updatesByIncident.get(incident.id) ?? [],
  }));

  const resolvedWithUpdates = resolvedIncidents.map((incident) => ({
    ...(incident as unknown as Incident),
    updates: updatesByIncident.get(incident.id) ?? [],
  }));

  const accentColor = statusPage.accent_color || "#22c55e";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        {statusPage.logo_url && (
          <div className="mb-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={statusPage.logo_url}
              alt={`${statusPage.name} logo`}
              className="h-12 w-auto"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {statusPage.name}
        </h1>
        {statusPage.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {statusPage.description}
          </p>
        )}
      </header>

      {/* Overall Status Banner */}
      <div
        className={`mb-8 rounded-xl border p-6 ${statusConfig.bgClass} ${statusConfig.borderClass}`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`rounded-full p-2 ${statusConfig.iconBgClass}`}>
            <OverallStatusIcon status={overallStatus} />
          </div>
          <span
            className={`text-xl font-semibold ${statusConfig.textClass}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Components List */}
      <section className="mb-8">
        <ComponentList components={componentsWithUptime} />
      </section>

      {/* Incidents */}
      <section className="mb-8">
        <IncidentTimeline
          active_incidents={activeWithUpdates}
          resolved_incidents={resolvedWithUpdates}
        />
      </section>

      {/* Subscribe */}
      <section>
        <SubscribeForm
          status_page_id={statusPage.id}
          accent_color={accentColor}
        />
      </section>

      {/* Last Updated */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          })}
        </p>
      </div>
    </div>
  );
}
