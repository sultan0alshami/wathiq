-- =====================================================
-- Trips management schema (trip reports + photos + RLS)
-- =====================================================

-- Trip reports table
create table if not exists public.trip_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null,
  day_date date not null default current_date,
  source_ref text,
  booking_source text,
  supplier text,
  client_name text not null,
  driver_name text not null,
  car_type text,
  parking_location text,
  pickup_point text,
  dropoff_point text,
  supervisor_name text,
  supervisor_rating integer check (supervisor_rating between 1 and 5),
  supervisor_notes text,
  passenger_feedback text,
  checklist jsonb not null default '{}'::jsonb,
  status text not null default 'approved' check (status in ('approved','warning')),
  photo_count integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  sync_source text default 'web'
);

-- Trip photos table
create table if not exists public.trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip_reports(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.trip_reports enable row level security;
alter table public.trip_photos enable row level security;

-- Helper condition: does current user have supervisory trips role?
create or replace function public.has_trip_supervision()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin','manager','operations','trips')
  );
$$;

-- Trip reports policies
drop policy if exists "Trips owners can insert reports" on public.trip_reports;
drop policy if exists "Trips owners can read their reports" on public.trip_reports;
drop policy if exists "Trips supervisors can read all reports" on public.trip_reports;

create policy "Trips owners can insert reports" on public.trip_reports
  for insert
  with check (auth.uid() = created_by);

create policy "Trips owners can read their reports" on public.trip_reports
  for select
  using (auth.uid() = created_by);

create policy "Trips supervisors can read all reports" on public.trip_reports
  for select
  using (public.has_trip_supervision());

-- Trip photos policies
drop policy if exists "Trips owners can manage photos" on public.trip_photos;
drop policy if exists "Trips supervisors can read photos" on public.trip_photos;

create policy "Trips owners can manage photos" on public.trip_photos
  for all
  using (
    exists (
      select 1 from public.trip_reports tr
      where tr.id = trip_photos.trip_id
        and tr.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trip_reports tr
      where tr.id = trip_photos.trip_id
        and tr.created_by = auth.uid()
    )
  );

create policy "Trips supervisors can read photos" on public.trip_photos
  for select
  using (public.has_trip_supervision());

-- Grant select to authenticated by default (policies still apply)
grant select, insert on public.trip_reports to authenticated;
grant select on public.trip_photos to authenticated;

-- NOTE: Create a Supabase Storage bucket (e.g., 'trip-evidence') and
-- add storage policies allowing authenticated users to upload objects
-- with paths prefixed by their user ID. This is documented in the
-- Trips section of the deployment guide.

