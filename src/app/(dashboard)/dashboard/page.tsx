import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Globe, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch counts in parallel
  const [monitorsRes, statusPagesRes, incidentsRes, subscribersRes] =
    await Promise.all([
      supabase
        .from("monitors")
        .select("id, last_status", { count: "exact" })
        .eq("user_id", user.id),
      supabase
        .from("status_pages")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),
      supabase
        .from("incidents")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .neq("status", "resolved"),
      supabase
        .from("subscribers")
        .select("id, status_page_id", { count: "exact" })
        .eq("is_verified", true)
        .is("unsubscribed_at", null),
    ]);

  const monitorsCount = monitorsRes.count ?? 0;
  const monitorsUp =
    monitorsRes.data?.filter((m) => m.last_status === "healthy").length ?? 0;
  const statusPagesCount = statusPagesRes.count ?? 0;
  const activeIncidents = incidentsRes.count ?? 0;
  const totalSubscribers = subscribersRes.count ?? 0;

  // Fetch recent incidents
  const { data: recentIncidents } = await supabase
    .from("incidents")
    .select("id, title, status, severity, started_at, status_page_id")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5);

  // Fetch monitors with their status
  const { data: monitors } = await supabase
    .from("monitors")
    .select("id, name, url, last_status, last_check_at, uptime_percentage")
    .eq("user_id", user.id)
    .order("name")
    .limit(10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your monitoring and status pages.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monitors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitorsUp}/{monitorsCount}</div>
            <p className="text-xs text-muted-foreground">monitors healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusPagesCount}</div>
            <p className="text-xs text-muted-foreground">active pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground">unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">across all pages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Incidents</CardTitle>
              <Link
                href="/dashboard/incidents"
                className="text-sm text-muted-foreground hover:underline"
              >
                View all
              </Link>
            </div>
            <CardDescription>Latest incidents across your status pages</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentIncidents || recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No incidents yet. That&apos;s a good thing!
              </p>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        incident.status === "resolved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : incident.severity === "critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monitor Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monitor Status</CardTitle>
              <Link
                href="/dashboard/monitors"
                className="text-sm text-muted-foreground hover:underline"
              >
                View all
              </Link>
            </div>
            <CardDescription>Current status of your monitors</CardDescription>
          </CardHeader>
          <CardContent>
            {!monitors || monitors.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No monitors yet.</p>
                <Link
                  href="/dashboard/monitors"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  Add your first monitor
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {monitors.map((monitor) => (
                  <div
                    key={monitor.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          monitor.last_status === "healthy"
                            ? "bg-green-500"
                            : monitor.last_status === "degraded"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{monitor.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-50">
                          {monitor.url}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {monitor.uptime_percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
