import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: monitor } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) notFound();

  // Get recent health checks
  const { data: checks } = await supabase
    .from("health_checks")
    .select("*")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(50);

  const statusColor =
    monitor.last_status === "healthy"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : monitor.last_status === "degraded"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/monitors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{monitor.name}</h1>
            <Badge variant="outline" className={statusColor}>
              {monitor.last_status ?? "Unknown"}
            </Badge>
            {monitor.is_paused && <Badge variant="secondary">Paused</Badge>}
          </div>
          <a
            href={monitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            {monitor.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(monitor.uptime_percentage).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.last_response_time_ms
                ? `${monitor.last_response_time_ms}ms`
                : "\u2014"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Check Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.check_interval_seconds >= 60
                ? `${Math.round(monitor.check_interval_seconds / 60)}min`
                : `${monitor.check_interval_seconds}s`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {monitor.last_check_at
                ? new Date(monitor.last_check_at as string).toLocaleString()
                : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
          <CardDescription>
            Latest health check results for this monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!checks || checks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No health checks recorded yet. Checks run on the configured
              interval.
            </p>
          ) : (
            <div className="space-y-2">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        check.status === "healthy"
                          ? "bg-green-500"
                          : check.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium capitalize">
                        {check.status}
                      </span>
                      {check.error_message && (
                        <p className="text-xs text-destructive">
                          {check.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {check.response_time_ms && (
                      <span>{check.response_time_ms}ms</span>
                    )}
                    <span>HTTP {check.http_status ?? "\u2014"}</span>
                    <span>
                      {new Date(check.checked_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
