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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IncidentUpdateForm } from "./update-form";
import { AiSummary } from "./ai-summary";

const severityColors: Record<string, string> = {
  minor:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  major:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  investigating:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  identified:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  monitoring:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default async function IncidentDetailPage({
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

  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!incident) notFound();

  const { data: updates } = await supabase
    .from("incident_updates")
    .select("*")
    .eq("incident_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/incidents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{incident.title}</h1>
            <Badge
              variant="outline"
              className={severityColors[incident.severity] || ""}
            >
              {incident.severity}
            </Badge>
            <Badge
              variant="outline"
              className={statusColors[incident.status] || ""}
            >
              {incident.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Started {new Date(incident.started_at).toLocaleString()}
            {incident.resolved_at && (
              <>
                {" "}
                &mdash; Resolved{" "}
                {new Date(
                  incident.resolved_at as string,
                ).toLocaleString()}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Initial Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {incident.message || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <AiSummary
        incidentId={id}
        existingSummary={incident.ai_summary ?? null}
      />

      {/* Add Update Form (if not resolved) */}
      {incident.status !== "resolved" && (
        <IncidentUpdateForm
          incidentId={id}
          currentStatus={incident.status as string}
        />
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>
            History of updates for this incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!updates || updates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No updates yet.
            </p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="flex gap-4 border-l-2 pl-4 pb-4 border-muted"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={statusColors[update.status] || ""}
                      >
                        {update.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {update.message}
                    </p>
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
