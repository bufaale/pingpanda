// ─── Row Types ─────────────────────────────────────────────────────

export interface Profile {
  [key: string]: unknown;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "free";
  subscription_plan: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  [key: string]: unknown;
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusPageRow {
  [key: string]: unknown;
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

export interface ComponentRow {
  [key: string]: unknown;
  id: string;
  status_page_id: string;
  user_id: string;
  name: string;
  description: string | null;
  group_name: string | null;
  position: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorRow {
  [key: string]: unknown;
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

export interface HealthCheckRow {
  [key: string]: unknown;
  id: string;
  monitor_id: string;
  status: string;
  response_time_ms: number | null;
  http_status: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface IncidentRow {
  [key: string]: unknown;
  id: string;
  status_page_id: string;
  user_id: string;
  title: string;
  status: string;
  severity: string;
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

export interface IncidentUpdateRow {
  [key: string]: unknown;
  id: string;
  incident_id: string;
  status: string;
  message: string;
  created_by: string | null;
  created_at: string;
}

export interface SubscriberRow {
  [key: string]: unknown;
  id: string;
  status_page_id: string;
  email: string;
  is_verified: boolean;
  verification_token: string | null;
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface NotificationChannelRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  status_page_id: string | null;
  name: string;
  type: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface NotificationLogRow {
  [key: string]: unknown;
  id: string;
  incident_id: string | null;
  channel_id: string | null;
  monitor_id: string | null;
  channel_type: string;
  recipient: string | null;
  type: string | null;
  payload: Record<string, unknown>;
  status: string;
  error_message: string | null;
  sent_at: string;
}

// ─── Database Schema ───────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & {
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
        };
        Update: Partial<Subscription>;
        Relationships: [];
      };
      status_pages: {
        Row: StatusPageRow;
        Insert: Partial<StatusPageRow> & {
          user_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<StatusPageRow>;
        Relationships: [];
      };
      components: {
        Row: ComponentRow;
        Insert: Partial<ComponentRow> & {
          status_page_id: string;
          user_id: string;
          name: string;
        };
        Update: Partial<ComponentRow>;
        Relationships: [];
      };
      monitors: {
        Row: MonitorRow;
        Insert: Partial<MonitorRow> & {
          user_id: string;
          name: string;
          url: string;
        };
        Update: Partial<MonitorRow>;
        Relationships: [];
      };
      health_checks: {
        Row: HealthCheckRow;
        Insert: Partial<HealthCheckRow> & {
          monitor_id: string;
          status: string;
        };
        Update: Partial<HealthCheckRow>;
        Relationships: [];
      };
      incidents: {
        Row: IncidentRow;
        Insert: Partial<IncidentRow> & {
          status_page_id: string;
          user_id: string;
          title: string;
        };
        Update: Partial<IncidentRow>;
        Relationships: [];
      };
      incident_updates: {
        Row: IncidentUpdateRow;
        Insert: Partial<IncidentUpdateRow> & {
          incident_id: string;
          status: string;
          message: string;
        };
        Update: Partial<IncidentUpdateRow>;
        Relationships: [];
      };
      subscribers: {
        Row: SubscriberRow;
        Insert: Partial<SubscriberRow> & {
          status_page_id: string;
          email: string;
        };
        Update: Partial<SubscriberRow>;
        Relationships: [];
      };
      notification_channels: {
        Row: NotificationChannelRow;
        Insert: Partial<NotificationChannelRow> & {
          user_id: string;
          type: string;
        };
        Update: Partial<NotificationChannelRow>;
        Relationships: [];
      };
      notification_log: {
        Row: NotificationLogRow;
        Insert: Partial<NotificationLogRow> & {
          channel_type: string;
        };
        Update: Partial<NotificationLogRow>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
