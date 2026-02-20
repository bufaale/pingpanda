-- Add missing columns needed by the application

ALTER TABLE public.status_pages ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.monitors ADD COLUMN IF NOT EXISTS is_paused boolean NOT NULL DEFAULT false;
ALTER TABLE public.monitors ADD COLUMN IF NOT EXISTS uptime_percentage numeric(5,2) NOT NULL DEFAULT 100;

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '';
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS affected_components uuid[] DEFAULT '{}';

ALTER TABLE public.incident_updates ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.subscribers RENAME COLUMN verified TO is_verified;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

ALTER TABLE public.notification_channels ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS channel_id uuid REFERENCES public.notification_channels(id);
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS monitor_id uuid REFERENCES public.monitors(id);
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}';
