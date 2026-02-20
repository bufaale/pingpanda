import type {
  Incident,
  IncidentUpdate,
  IncidentStatus,
  IncidentSeverity,
} from "@/types/status-page";
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from "@/lib/monitoring/constants";

// Full Tailwind class maps to avoid dynamic class purging
const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  minor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  major: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  investigating: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  identified: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  monitoring: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const TIMELINE_DOT_CLASSES: Record<string, string> = {
  investigating: "bg-red-500",
  identified: "bg-orange-500",
  monitoring: "bg-blue-500",
  resolved: "bg-green-500",
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(dateStr);
}

interface IncidentWithUpdates extends Incident {
  updates: IncidentUpdate[];
}

interface IncidentTimelineProps {
  active_incidents: IncidentWithUpdates[];
  resolved_incidents?: IncidentWithUpdates[];
}

function IncidentCard({ incident }: { incident: IncidentWithUpdates }) {
  const severityClass =
    SEVERITY_BADGE_CLASSES[incident.severity] ?? SEVERITY_BADGE_CLASSES.minor;
  const statusClass =
    STATUS_BADGE_CLASSES[incident.status] ?? STATUS_BADGE_CLASSES.investigating;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-2">
        <h3 className="flex-1 text-base font-semibold text-foreground">
          {incident.title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityClass}`}
          >
            {INCIDENT_SEVERITY_LABELS[incident.severity as IncidentSeverity] ??
              incident.severity}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
          >
            {INCIDENT_STATUS_LABELS[incident.status as IncidentStatus] ??
              incident.status}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {incident.message}
      </p>

      {/* Started */}
      <p className="mt-2 text-xs text-muted-foreground">
        Started {formatRelativeTime(incident.started_at)} &middot;{" "}
        {formatDateTime(incident.started_at)}
      </p>

      {/* Updates Timeline */}
      {incident.updates.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="relative space-y-4 pl-6">
            {/* Vertical line */}
            <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border" />

            {incident.updates.map((update) => {
              const dotClass =
                TIMELINE_DOT_CLASSES[update.status] ??
                TIMELINE_DOT_CLASSES.investigating;

              return (
                <div key={update.id} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-card ${dotClass}`}
                  />

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_BADGE_CLASSES[update.status] ?? STATUS_BADGE_CLASSES.investigating}`}
                      >
                        {INCIDENT_STATUS_LABELS[
                          update.status as IncidentStatus
                        ] ?? update.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(update.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {update.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function IncidentTimeline({
  active_incidents,
  resolved_incidents,
}: IncidentTimelineProps) {
  const hasActive = active_incidents.length > 0;
  const hasResolved = resolved_incidents && resolved_incidents.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Incidents */}
      {hasActive ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Active Incidents
          </h2>
          {active_incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              No active incidents
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            All systems are operating normally
          </p>
        </div>
      )}

      {/* Resolved Incidents (Past 7 Days) */}
      {hasResolved && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Past Incidents
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Last 7 days
            </span>
          </h2>
          {resolved_incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
