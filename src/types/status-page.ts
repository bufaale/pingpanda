// ─── Enums / Union Types ────────────────────────────────────────────

export type ComponentStatus =
  | "operational"
  | "degraded"
  | "major_outage"
  | "maintenance"
  | "unknown";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentSeverity = "minor" | "major" | "critical";

export type HealthStatus = "healthy" | "degraded" | "down";

export type NotificationChannelType = "slack" | "webhook" | "sms";

// ─── Core Entities (match DB column names) ──────────────────────────

export interface StatusPage {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  logo_url: string | null;
  accent_color: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: string;
  status_page_id: string;
  user_id: string;
  name: string;
  description: string | null;
  group_name: string | null;
  position: number;
  status: ComponentStatus;
  created_at: string;
  updated_at: string;
}

export interface Monitor {
  id: string;
  user_id: string;
  component_id: string | null;
  name: string;
  url: string;
  method: string;
  expected_status: number;
  check_interval_seconds: number;
  timeout_ms: number;
  is_active: boolean;
  is_paused: boolean;
  last_check_at: string | null;
  last_status: string | null;
  last_response_time_ms: number | null;
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: string;
  monitor_id: string;
  status: HealthStatus;
  response_time_ms: number | null;
  http_status: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  status_page_id: string;
  user_id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  message: string;
  affected_components: string[];
  is_maintenance: boolean;
  started_at: string;
  resolved_at: string | null;
  created_by: string;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  status: IncidentStatus;
  message: string;
  created_by: string | null;
  created_at: string;
}

export interface Subscriber {
  id: string;
  status_page_id: string;
  email: string;
  is_verified: boolean;
  verification_token: string | null;
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface NotificationChannel {
  id: string;
  user_id: string;
  status_page_id: string | null;
  name: string;
  type: NotificationChannelType;
  config: SlackChannelConfig | WebhookChannelConfig | SmsChannelConfig;
  is_active: boolean;
  created_at: string;
}

export interface SlackChannelConfig {
  webhook_url: string;
}

export interface WebhookChannelConfig {
  url: string;
  secret: string | null;
  headers: Record<string, string> | null;
}

export interface SmsChannelConfig {
  phone_number: string;
  country_code: string;
}

export interface NotificationLog {
  id: string;
  incident_id: string | null;
  channel_id: string | null;
  monitor_id: string | null;
  channel_type: string;
  recipient: string | null;
  type: string | null;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  sent_at: string;
}

// ─── API / UI Types ─────────────────────────────────────────────────

export interface StatusPageWithComponents extends StatusPage {
  components: Component[];
}

export interface StatusPagePublicView extends StatusPageWithComponents {
  active_incidents: (Incident & { updates: IncidentUpdate[] })[];
  overall_status: HealthStatus;
}

export interface MonitorWithChecks extends Monitor {
  recent_checks: HealthCheck[];
}

export interface UptimeDataPoint {
  date: string;
  uptime_percentage: number;
  total_checks: number;
  successful_checks: number;
}
