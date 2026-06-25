-- Edubia Schedule App Database
-- Run this file inside Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer,
  nationality text,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  day text not null check (day in ('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')),
  hour integer not null check (hour between 14 and 22),
  course text not null,
  current_session text not null,
  type text not null check (type in ('paid','cover','free')),
  -- Paid sessions are recurring weekly. Cover/free sessions are one-day temporary rows.
  session_date date,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
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
  created_at timestamptz not null default now()
);

-- Safe migration for projects that already ran an older database.sql.
alter table public.sessions add column if not exists session_date date;
alter table public.sessions add column if not exists expires_at timestamptz;

-- Coordinator read-only views.
-- These views do NOT show prices, but they show paid/free/cover type so coordinators can see the color status.
create or replace view public.coordinator_schedule as
select
  s.id,
  s.student_id,
  st.name as student_name,
  s.day,
  s.hour,
  s.course,
  s.current_session,
  s.type,
  s.session_date,
  s.expires_at
from public.sessions s
join public.students st on st.id = s.student_id;

create or replace view public.coordinator_feedback as
select
  f.id,
  f.student_id,
  st.name as student_name,
  f.date,
  f.course,
  f.session_number,
  f.lesson_title,
  f.attendance,
  f.commitment_score,
  f.understanding_score,
  f.problem_solving_score,
  f.practical_score,
  f.exercise_score,
  f.participation_score,
  f.has_homework,
  f.previous_homework,
  f.explained,
  f.strengths,
  f.improvement_areas,
  f.created_at
from public.feedback f
join public.students st on st.id = f.student_id;

-- Deletes only expired one-day sessions. Paid sessions are never deleted by this function.
create or replace function public.cleanup_expired_temporary_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
  cairo_now timestamp := timezone('Africa/Cairo', now());
  today_index integer;
  current_hour numeric;
begin
  today_index := case trim(to_char(cairo_now, 'Day'))
    when 'Saturday' then 0
    when 'Sunday' then 1
    when 'Monday' then 2
    when 'Tuesday' then 3
    when 'Wednesday' then 4
    when 'Thursday' then 5
    when 'Friday' then 6
  end;

  current_hour := extract(hour from cairo_now) + (extract(minute from cairo_now) / 60.0);

  delete from public.sessions
  where type in ('cover', 'covered', 'free')
    and (
      (expires_at is not null and expires_at <= now())
      or (
        expires_at is null
        and (
          case day
            when 'Saturday' then 0
            when 'Sunday' then 1
            when 'Monday' then 2
            when 'Tuesday' then 3
            when 'Wednesday' then 4
            when 'Thursday' then 5
            when 'Friday' then 6
          end < today_index
          or (
            case day
              when 'Saturday' then 0
              when 'Sunday' then 1
              when 'Monday' then 2
              when 'Tuesday' then 3
              when 'Wednesday' then 4
              when 'Thursday' then 5
              when 'Friday' then 6
            end = today_index
            and hour + 1 <= current_hour
          )
        )
      )
    );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_expired_temporary_sessions() from public;
grant execute on function public.cleanup_expired_temporary_sessions() to authenticated;

alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "admin can manage students" on public.students;
drop policy if exists "admin can manage sessions" on public.sessions;
drop policy if exists "admin can manage feedback" on public.feedback;

create policy "admin can manage students"
on public.students
for all
to authenticated
using (true)
with check (true);

create policy "admin can manage sessions"
on public.sessions
for all
to authenticated
using (true)
with check (true);

create policy "admin can manage feedback"
on public.feedback
for all
to authenticated
using (true)
with check (true);

revoke all on table public.students from anon;
revoke all on table public.sessions from anon;
revoke all on table public.feedback from anon;

grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.feedback to authenticated;

revoke all on table public.coordinator_schedule from anon;
revoke all on table public.coordinator_feedback from anon;
grant select on public.coordinator_schedule to authenticated;
grant select on public.coordinator_feedback to authenticated;
