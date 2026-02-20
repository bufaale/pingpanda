import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const severityColors: Record<string, string> = {
  minor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  major: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  investigating: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  identified: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  monitoring: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default async function IncidentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user's status pages first
  const { data: statusPages } = await supabase
    .from("status_pages")
    .select("id, name")
    .eq("user_id", user.id);

  const pageIds = statusPages?.map((p) => p.id) ?? [];
  const pageNames = new Map(statusPages?.map((p) => [p.id, p.name]) ?? []);

  const { data: incidents } = pageIds.length > 0
    ? await supabase
        .from("incidents")
        .select("*")
        .in("status_page_id", pageIds)
        .order("started_at", { ascending: false })
    : { data: [] };

  const activeIncidents = incidents?.filter((i) => i.status !== "resolved") ?? [];
  const resolvedIncidents = incidents?.filter((i) => i.status === "resolved") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track incidents across your status pages.
          </p>
        </div>
        <Link href="/dashboard/incidents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Incidents</h2>
          {activeIncidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/incidents/${incident.id}`}
                      className="hover:underline"
                    >
                      {incident.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={severityColors[incident.severity]}>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline" className={statusColors[incident.status]}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {pageNames.get(incident.status_page_id) || "Unknown page"} &middot;{" "}
                  Started {new Date(incident.started_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Resolved Incidents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {activeIncidents.length > 0 ? "Resolved Incidents" : "All Incidents"}
        </h2>
        {(!incidents || incidents.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No incidents recorded yet.
              </p>
              <Link href="/dashboard/incidents/new">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Incident
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : resolvedIncidents.length === 0 && activeIncidents.length > 0 ? (
          <p className="text-sm text-muted-foreground">No resolved incidents yet.</p>
        ) : (
          resolvedIncidents.map((incident) => (
            <Card key={incident.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/incidents/${incident.id}`}
                      className="hover:underline"
                    >
                      {incident.title}
                    </Link>
                  </CardTitle>
                  <Badge variant="outline" className={statusColors[incident.status]}>
                    {incident.status}
                  </Badge>
                </div>
                <CardDescription>
                  {pageNames.get(incident.status_page_id) || "Unknown page"} &middot;{" "}
                  {new Date(incident.started_at).toLocaleDateString()} &mdash;{" "}
                  {incident.resolved_at
                    ? new Date(incident.resolved_at).toLocaleDateString()
                    : "Ongoing"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
