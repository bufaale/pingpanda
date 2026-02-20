import type { ComponentStatus, IncidentStatus, IncidentSeverity, HealthStatus } from "@/types/status-page";

// --- Health check thresholds ---
export const HEALTH_THRESHOLDS = {
  degraded_ms: 3_000,
  timeout_ms: 10_000,
  retry_count: 2,
  retry_delay_ms: 5_000,
  /** How many consecutive failures before auto-creating incident */
  incident_threshold: 2,
} as const;

// --- Status colors (Tailwind class suffixes) ---
export const COMPONENT_STATUS_COLORS: Record<ComponentStatus, string> = {
  operational: "green-500",
  degraded: "yellow-500",
  major_outage: "red-500",
  maintenance: "blue-500",
  unknown: "gray-400",
};

export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  healthy: "green-500",
  degraded: "yellow-500",
  down: "red-500",
};

export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: "yellow-500",
  major: "orange-500",
  critical: "red-500",
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  investigating: "red-500",
  identified: "orange-500",
  monitoring: "blue-500",
  resolved: "green-500",
};

// --- Labels ---
export const COMPONENT_STATUS_LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  major_outage: "Major Outage",
  maintenance: "Under Maintenance",
  unknown: "Unknown",
};

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};
