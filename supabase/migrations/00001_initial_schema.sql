-- ============================================
-- PingPanda - Initial Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles (standard SaaS profile)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_status text not null default 'free'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'free')),
  subscription_plan text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. status_pages
create table public.status_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  custom_domain text unique,
  logo_url text,
  accent_color text default '#10b981',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. components
create table public.components (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid references public.status_pages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  group_name text,
  position integer not null default 0,
  status text not null default 'operational'
    check (status in ('operational', 'degraded', 'major_outage', 'maintenance', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. monitors
create table public.monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  component_id uuid references public.components(id) on delete set null,
  name text not null,
  url text not null,
  method text not null default 'GET' check (method in ('GET', 'HEAD')),
  expected_status integer default 200,
  check_interval_seconds integer not null default 300,
  timeout_ms integer not null default 10000,
  is_active boolean not null default true,
  last_check_at timestamptz,
  last_status text check (last_status in ('healthy', 'degraded', 'down')),
  last_response_time_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. health_checks
create table public.health_checks (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid references public.monitors(id) on delete cascade not null,
  status text not null check (status in ('healthy', 'degraded', 'down')),
  response_time_ms integer,
  http_status integer,
  error_message text,
  checked_at timestamptz not null default now()
);
create index idx_health_checks_monitor on public.health_checks (monitor_id, checked_at desc);

-- 7. incidents
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid references public.status_pages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  status text not null default 'investigating'
    check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
  severity text not null default 'minor'
    check (severity in ('minor', 'major', 'critical')),
  is_maintenance boolean not null default false,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by text not null default 'manual' check (created_by in ('manual', 'auto')),
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. incident_updates
create table public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade not null,
  status text not null check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
  message text not null,
  created_at timestamptz not null default now()
);

-- 9. subscribers
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  status_page_id uuid references public.status_pages(id) on delete cascade not null,
  email text not null,
  verified boolean not null default false,
  verification_token text unique,
  unsubscribe_token text unique not null default encode(gen_random_bytes(32), 'base64url'),
  subscribed_at timestamptz not null default now()
);
create unique index idx_subscribers_email_page on public.subscribers (status_page_id, email);

-- 10. notification_channels
create table public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status_page_id uuid references public.status_pages(id) on delete cascade,
  type text not null check (type in ('slack', 'webhook', 'sms')),
  config jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 11. notification_log
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade,
  channel_type text not null,
  recipient text,
  status text not null default 'sent' check (status in ('sent', 'failed', 'pending')),
  error_message text,
  sent_at timestamptz not null default now()
);

-- ============================================
-- RLS Policies
-- ============================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.status_pages enable row level security;
alter table public.components enable row level security;
alter table public.monitors enable row level security;
alter table public.health_checks enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_updates enable row level security;
alter table public.subscribers enable row level security;
alter table public.notification_channels enable row level security;
alter table public.notification_log enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Subscriptions
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- Status Pages
create policy "Users can CRUD own status pages" on public.status_pages for all using (auth.uid() = user_id);

-- Components
create policy "Users can CRUD own components" on public.components for all using (auth.uid() = user_id);

-- Monitors
create policy "Users can CRUD own monitors" on public.monitors for all using (auth.uid() = user_id);

-- Health Checks (via monitor join - use service role for cron writes)
create policy "Users can view own health checks" on public.health_checks
  for select using (
    exists (select 1 from public.monitors m where m.id = health_checks.monitor_id and m.user_id = auth.uid())
  );

-- Incidents
create policy "Users can CRUD own incidents" on public.incidents for all using (auth.uid() = user_id);

-- Incident Updates (via incident join)
create policy "Users can view own incident updates" on public.incident_updates
  for select using (
    exists (select 1 from public.incidents i where i.id = incident_updates.incident_id and i.user_id = auth.uid())
  );
create policy "Users can insert own incident updates" on public.incident_updates
  for insert with check (
    exists (select 1 from public.incidents i where i.id = incident_updates.incident_id and i.user_id = auth.uid())
  );

-- Subscribers (public insert for subscribe, user read via status_page)
create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Users can view subscribers of own pages" on public.subscribers
  for select using (
    exists (select 1 from public.status_pages sp where sp.id = subscribers.status_page_id and sp.user_id = auth.uid())
  );
create policy "Users can delete subscribers of own pages" on public.subscribers
  for delete using (
    exists (select 1 from public.status_pages sp where sp.id = subscribers.status_page_id and sp.user_id = auth.uid())
  );
-- Allow self-update for verification (via token)
create policy "Subscribers can verify themselves" on public.subscribers
  for update using (verification_token is not null);

-- Notification Channels
create policy "Users can CRUD own channels" on public.notification_channels for all using (auth.uid() = user_id);

-- Notification Log (read via incident -> user)
create policy "Users can view own notification logs" on public.notification_log
  for select using (
    exists (select 1 from public.incidents i where i.id = notification_log.incident_id and i.user_id = auth.uid())
  );

-- ============================================
-- Public Status Page Policies (anonymous access)
-- ============================================

-- Public can view public status pages
create policy "Public can view public status pages" on public.status_pages
  for select using (is_public = true);

-- Public can view components of public status pages
create policy "Public can view components of public pages" on public.components
  for select using (
    exists (select 1 from public.status_pages sp where sp.id = components.status_page_id and sp.is_public = true)
  );

-- Public can view incidents of public status pages
create policy "Public can view incidents of public pages" on public.incidents
  for select using (
    exists (select 1 from public.status_pages sp where sp.id = incidents.status_page_id and sp.is_public = true)
  );

-- Public can view incident updates of public status pages
create policy "Public can view incident updates of public pages" on public.incident_updates
  for select using (
    exists (
      select 1 from public.incidents i
      join public.status_pages sp on sp.id = i.status_page_id
      where i.id = incident_updates.incident_id and sp.is_public = true
    )
  );

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger update_status_pages_updated_at before update on public.status_pages for each row execute procedure public.update_updated_at();
create trigger update_components_updated_at before update on public.components for each row execute procedure public.update_updated_at();
create trigger update_monitors_updated_at before update on public.monitors for each row execute procedure public.update_updated_at();
create trigger update_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.update_updated_at();
create trigger update_incidents_updated_at before update on public.incidents for each row execute procedure public.update_updated_at();

-- Admin check function (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;
