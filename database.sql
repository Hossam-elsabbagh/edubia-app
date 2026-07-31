-- WARNING: THIS FILE IS ONLY FOR A BRAND-NEW, EMPTY SUPABASE PROJECT.
-- FOR THE EXISTING EDUBIA DATABASE, RUN RUN_ONCE_SAFE_DATABASE_UPGRADE.sql INSTEAD.

-- Edubia React — Fresh Supabase database
-- Run this entire file in Supabase SQL Editor for a NEW project.

create extension if not exists "pgcrypto";

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
  on conflict (id) do update set
    full_name = excluded.full_name,
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
on conflict (id) do nothing;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  age integer check (age is null or age between 3 and 100),
  nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  day text not null check (day in ('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')),
  hour integer not null check (hour between 0 and 23),
  course text not null,
  current_session text not null,
  type text not null check (type in ('paid','cover','free')),
  price numeric(10,2) not null default 0 check (price >= 0),
  session_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((type = 'paid' and session_date is null) or (type in ('cover','free') and session_date is not null))
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null,
  attendance_date date not null,
  status text not null check (status in ('attended','absent')),
  student_name text not null,
  course text not null,
  session_number text not null,
  day text not null,
  hour integer not null,
  type text not null check (type in ('paid','cover','free')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instructor_id, session_id, attendance_date)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  course text not null,
  session_number text not null,
  lesson_title text not null,
  attendance text not null,
  commitment_score integer check (commitment_score between 1 and 5),
  understanding_score integer check (understanding_score between 1 and 5),
  problem_solving_score integer check (problem_solving_score between 1 and 5),
  practical_score integer check (practical_score between 1 and 5),
  exercise_score integer check (exercise_score between 1 and 5),
  participation_score integer check (participation_score between 1 and 5),
  has_homework text,
  previous_homework text,
  explained text,
  strengths text,
  improvement_areas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.unavailable_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  day text not null check (day in ('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')),
  hour integer not null check (hour between 0 and 23),
  created_at timestamptz not null default now(),
  unique (instructor_id, day, hour)
);

create index if not exists students_instructor_idx on public.students(instructor_id);
create index if not exists sessions_instructor_idx on public.sessions(instructor_id);
create index if not exists attendance_instructor_date_idx on public.attendance(instructor_id, attendance_date);
create index if not exists feedback_instructor_idx on public.feedback(instructor_id);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.feedback enable row level security;
alter table public.unavailable_slots enable row level security;

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "students own rows" on public.students;
create policy "students own rows" on public.students for all to authenticated using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

drop policy if exists "sessions own rows" on public.sessions;
create policy "sessions own rows" on public.sessions for all to authenticated using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

drop policy if exists "attendance own rows" on public.attendance;
create policy "attendance own rows" on public.attendance for all to authenticated using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

drop policy if exists "feedback own rows" on public.feedback;
create policy "feedback own rows" on public.feedback for all to authenticated using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

drop policy if exists "unavailable own rows" on public.unavailable_slots;
create policy "unavailable own rows" on public.unavailable_slots for all to authenticated using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

revoke all on public.profiles, public.students, public.sessions, public.attendance, public.feedback, public.unavailable_slots from anon;
grant select, insert, update, delete on public.profiles, public.students, public.sessions, public.attendance, public.feedback, public.unavailable_slots to authenticated;

-- Safe public coordinator functions. The random share token is required and prices are never returned.
create or replace function public.get_public_instructor(access_token uuid)
returns table (full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name from public.profiles p where p.share_token = access_token;
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
  select s.id, st.name, s.day, s.hour, s.course, s.current_session, s.type, s.session_date
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
