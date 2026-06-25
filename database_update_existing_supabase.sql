-- Edubia Schedule App V3.2 patch
-- Run this once in Supabase SQL Editor after uploading the new GitHub files.
-- It fixes coordinator login permissions, paid/free/cover colors, available-time view, and temporary session cleanup.

create extension if not exists "pgcrypto";

alter table public.sessions add column if not exists session_date date;
alter table public.sessions add column if not exists expires_at timestamptz;

-- Make sure authenticated users can manage the real tables.
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

grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.feedback to authenticated;

-- Coordinator read-only schedule view. Type is included only for colors/status.
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

-- Coordinator read-only feedback view.
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

-- Deletes only expired one-day sessions. Paid sessions are never deleted.
-- Cover/free sessions expire one hour after their selected slot starts.
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

-- Coordinator page now requires login, so views/RPC are authenticated only.
revoke all on table public.coordinator_schedule from anon;
revoke all on table public.coordinator_feedback from anon;
revoke all on function public.cleanup_expired_temporary_sessions() from anon;

grant select on table public.coordinator_schedule to authenticated;
grant select on table public.coordinator_feedback to authenticated;
grant execute on function public.cleanup_expired_temporary_sessions() to authenticated;
