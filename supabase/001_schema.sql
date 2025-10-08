-- Supabase schema and RLS policies

-- Table: public.user_roles
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','manager','finance','sales','operations','marketing')),
  name text
);

-- Example business tables (minimal placeholders for RLS demonstration)
create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('income','expense','deposit')),
  created_at timestamptz not null default now()
);

create table if not exists public.sales_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outcome text not null check (outcome in ('positive','negative','pending')),
  created_at timestamptz not null default now()
);

-- RPC for fetching user profile
create or replace function public.get_user_profile(uid uuid)
returns table(role text, name text)
language sql
security definer
set search_path = public
as $$
  select role, name from public.user_roles where user_id = uid limit 1;
$$;

grant execute on function public.get_user_profile(uuid) to authenticated;

-- Enable RLS
alter table public.finance_entries enable row level security;
alter table public.sales_entries enable row level security;

-- Helper: role lookup for current user
create or replace view public.v_user_role as
select ur.user_id, ur.role from public.user_roles ur;

-- Policies: allow read/write for permitted roles; tighten as needed per domain
-- Finance: admin, manager, finance can select/insert/update/delete own rows
create policy finance_select on public.finance_entries for select using (
  auth.uid() = user_id and exists (
    select 1 from public.v_user_role r where r.user_id = auth.uid() and r.role in ('admin','manager','finance')
  )
);
create policy finance_modify on public.finance_entries for all using (
  auth.uid() = user_id and exists (
    select 1 from public.v_user_role r where r.user_id = auth.uid() and r.role in ('admin','manager','finance')
  )
) with check (
  auth.uid() = user_id
);

-- Sales: admin, manager, sales can select/modify own rows
create policy sales_select on public.sales_entries for select using (
  auth.uid() = user_id and exists (
    select 1 from public.v_user_role r where r.user_id = auth.uid() and r.role in ('admin','manager','sales')
  )
);
create policy sales_modify on public.sales_entries for all using (
  auth.uid() = user_id and exists (
    select 1 from public.v_user_role r where r.user_id = auth.uid() and r.role in ('admin','manager','sales')
  )
 ) with check (
  auth.uid() = user_id
);


