-- Notifications schema
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  type text not null check (type in ('info','success','warning','error')),
  title text not null,
  message text null,
  is_broadcast boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

-- RLS
alter table public.notifications enable row level security;

-- Policy: users can read their own notifications or broadcast ones
create policy if not exists notifications_select_policy
  on public.notifications for select
  using (
    (auth.role() = 'authenticated' and (is_broadcast = true or user_id = auth.uid()))
    or auth.role() = 'service_role'
  );

-- Policy: users can update read_at for their own rows
create policy if not exists notifications_update_policy
  on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Inserts will be done by serverless functions or privileged backend (optional policy for self-insert)
create policy if not exists notifications_insert_self
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- Helpful index
create index if not exists idx_notifications_user_created_at
  on public.notifications(user_id, created_at desc);


