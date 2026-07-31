-- ============================================================================
-- EDUBIA: SAFE UPGRADE OF THE EXISTING SUPABASE DATABASE
-- Run this file ONCE in Supabase Dashboard -> SQL Editor.
--
-- This script DOES NOT drop students, sessions, feedback, or attendance data.
-- It first copies the existing business tables into the private
-- `edubia_backup` schema, then adds multi-instructor ownership and attendance.
-- ============================================================================

begin;

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- 1. In-database safety copy of the old business data
-- --------------------------------------------------------------------------
create schema if not exists edubia_backup;
revoke all on schema edubia_backup from anon, authenticated;

do $$
begin
  if to_regclass('edubia_backup.students_before_react') is null then
    execute 'create table edubia_backup.students_before_react as table public.students';
  end if;
  if to_regclass('edubia_backup.sessions_before_react') is null then
    execute 'create table edubia_backup.sessions_before_react as table public.sessions';
  end if;
  if to_regclass('edubia_backup.feedback_before_react') is null then
    execute 'create table edubia_backup.feedback_before_react as table public.feedback';
  end if;
  if to_regclass('edubia_backup.unavailable_slots_before_react') is null then
    execute 'create table edubia_backup.unavailable_slots_before_react as table public.unavailable_slots';
  end if;
end $$;

revoke all on all tables in schema edubia_backup from anon, authenticated;

-- --------------------------------------------------------------------------
-- 2. Instructor profiles connected to Supabase Auth
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Instructor',
  email text,
  share_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'Instructor'),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, email)
select
  id,
  coalesce(nullif(raw_user_meta_data->>'full_name', ''), split_part(email, '@', 1), 'Instructor'),
  email
from auth.users
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

-- --------------------------------------------------------------------------
-- 3. Add instructor ownership without removing old rows
-- --------------------------------------------------------------------------
alter table public.students
  add column if not exists instructor_id uuid references public.profiles(id) on delete cascade;

alter table public.sessions
  add column if not exists instructor_id uuid references public.profiles(id) on delete cascade;

alter table public.sessions
  add column if not exists price numeric(10,2) not null default 0;

alter table public.feedback
  add column if not exists instructor_id uuid references public.profiles(id) on delete cascade;

alter table public.unavailable_slots
  add column if not exists instructor_id uuid references public.profiles(id) on delete cascade;

-- The original app had one shared instructor workspace. Its existing rows are
-- assigned to the oldest Auth account, which is normally the original account.
do $$
declare
  owner_id uuid;
begin
  select id into owner_id
  from auth.users
  order by created_at asc
  limit 1;

  if owner_id is not null then
    update public.students
      set instructor_id = owner_id
      where instructor_id is null;

    update public.sessions s
      set instructor_id = coalesce(
        (select st.instructor_id from public.students st where st.id = s.student_id),
        owner_id
      )
      where instructor_id is null;

    update public.feedback f
      set instructor_id = coalesce(
        (select st.instructor_id from public.students st where st.id = f.student_id),
        owner_id
      )
      where instructor_id is null;

    update public.unavailable_slots
      set instructor_id = owner_id
      where instructor_id is null;
  end if;
end $$;

-- Fallback for the case where the database had no Auth user when this migration
-- ran. On sign-in, only the oldest Auth account can claim still-unassigned rows.
create or replace function public.claim_legacy_edubia_data()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimant uuid := auth.uid();
  oldest_user uuid;
  changed integer := 0;
  row_count_value integer := 0;
begin
  if claimant is null then
    return 0;
  end if;

  select id into oldest_user
  from auth.users
  order by created_at asc
  limit 1;

  if oldest_user is null or claimant <> oldest_user then
    return 0;
  end if;

  update public.students
    set instructor_id = claimant
    where instructor_id is null;
  get diagnostics row_count_value = row_count;
  changed := changed + row_count_value;

  update public.sessions s
    set instructor_id = coalesce(
      (select st.instructor_id from public.students st where st.id = s.student_id),
      claimant
    )
    where instructor_id is null;
  get diagnostics row_count_value = row_count;
  changed := changed + row_count_value;

  update public.feedback f
    set instructor_id = coalesce(
      (select st.instructor_id from public.students st where st.id = f.student_id),
      claimant
    )
    where instructor_id is null;
  get diagnostics row_count_value = row_count;
  changed := changed + row_count_value;

  update public.unavailable_slots
    set instructor_id = claimant
    where instructor_id is null;
  get diagnostics row_count_value = row_count;
  changed := changed + row_count_value;

  return changed;
end;
$$;

revoke all on function public.claim_legacy_edubia_data() from public;
grant execute on function public.claim_legacy_edubia_data() to authenticated;

-- Preserve old session prices where present. Give default values only to rows
-- whose price is still zero after the new column is added.
update public.sessions
set price = case type
  when 'paid' then 150
  when 'cover' then 150
  when 'free' then 100
  else 0
end
where price = 0;

alter table public.unavailable_slots
  drop constraint if exists unavailable_slots_day_hour_key;

create unique index if not exists unavailable_slots_instructor_day_hour_key
  on public.unavailable_slots(instructor_id, day, hour);

-- --------------------------------------------------------------------------
-- 4. Daily attendance with historical snapshots
-- --------------------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  session_id uuid not null,
  attendance_date date not null,
  status text not null check (status in ('attended', 'absent')),
  student_name text not null,
  course text not null,
  session_number text not null,
  day text not null,
  hour integer not null,
  type text not null check (type in ('paid', 'cover', 'free')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instructor_id, session_id, attendance_date)
);

-- If an earlier draft of the migration was already used, change the attendance
-- FK so deleting a student keeps the historical monthly attendance rows.
alter table public.attendance alter column student_id drop not null;
alter table public.attendance drop constraint if exists attendance_student_id_fkey;
alter table public.attendance
  add constraint attendance_student_id_fkey
  foreign key (student_id) references public.students(id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists attendance_set_updated_at on public.attendance;
create trigger attendance_set_updated_at
before update on public.attendance
for each row execute procedure public.set_updated_at();

create index if not exists students_instructor_idx
  on public.students(instructor_id);
create index if not exists sessions_instructor_idx
  on public.sessions(instructor_id);
create index if not exists attendance_instructor_date_idx
  on public.attendance(instructor_id, attendance_date);
create index if not exists feedback_instructor_idx
  on public.feedback(instructor_id);

-- --------------------------------------------------------------------------
-- 5. Secure every instructor's private workspace with Row Level Security
-- --------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.feedback enable row level security;
alter table public.unavailable_slots enable row level security;

-- Remove the old broad policies that allowed any authenticated account to see
-- the original shared workspace.
drop policy if exists "admin can manage students" on public.students;
drop policy if exists "admin can manage sessions" on public.sessions;
drop policy if exists "admin can manage feedback" on public.feedback;
drop policy if exists "admin can manage unavailable slots" on public.unavailable_slots;

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "students own rows" on public.students;
drop policy if exists "sessions own rows" on public.sessions;
drop policy if exists "attendance own rows" on public.attendance;
drop policy if exists "feedback own rows" on public.feedback;
drop policy if exists "unavailable own rows" on public.unavailable_slots;

create policy "profiles own select"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "profiles own insert"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "profiles own update"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "students own rows"
on public.students for all to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

create policy "sessions own rows"
on public.sessions for all to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

create policy "attendance own rows"
on public.attendance for all to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

create policy "feedback own rows"
on public.feedback for all to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

create policy "unavailable own rows"
on public.unavailable_slots for all to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

revoke all on public.profiles,
  public.students,
  public.sessions,
  public.attendance,
  public.feedback,
  public.unavailable_slots
from anon;

grant select, insert, update, delete on public.profiles,
  public.students,
  public.sessions,
  public.attendance,
  public.feedback,
  public.unavailable_slots
to authenticated;

-- --------------------------------------------------------------------------
-- 6. Read-only coordinator link, separated by instructor token
-- --------------------------------------------------------------------------
-- Keep old views in the database for rollback, but remove public access because
-- they combine every instructor's data and are not safe for the new app.
do $$
begin
  if to_regclass('public.coordinator_schedule') is not null then
    execute 'revoke all on public.coordinator_schedule from anon, authenticated';
  end if;
  if to_regclass('public.coordinator_feedback') is not null then
    execute 'revoke all on public.coordinator_feedback from anon, authenticated';
  end if;
  if to_regclass('public.coordinator_unavailable_slots') is not null then
    execute 'revoke all on public.coordinator_unavailable_slots from anon, authenticated';
  end if;
end $$;

create or replace function public.get_public_instructor(access_token uuid)
returns table (full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name
  from public.profiles p
  where p.share_token = access_token;
$$;

create or replace function public.get_public_schedule(access_token uuid)
returns table (
  id uuid,
  student_name text,
  day text,
  hour integer,
  course text,
  current_session text,
  type text,
  session_date date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    st.name,
    s.day,
    s.hour,
    s.course,
    s.current_session,
    s.type,
    s.session_date
  from public.sessions s
  join public.students st on st.id = s.student_id
  join public.profiles p on p.id = s.instructor_id
  where p.share_token = access_token
  order by s.day, s.hour;
$$;

revoke all on function public.get_public_instructor(uuid) from public;
revoke all on function public.get_public_schedule(uuid) from public;
grant execute on function public.get_public_instructor(uuid) to anon, authenticated;
grant execute on function public.get_public_schedule(uuid) to anon, authenticated;

commit;

-- Verification: these queries only show counts and do not modify data.
select 'students' as table_name, count(*) as row_count from public.students
union all
select 'sessions', count(*) from public.sessions
union all
select 'feedback', count(*) from public.feedback
union all
select 'attendance', count(*) from public.attendance;
