-- EDUBIA COORDINATOR FEATURES UPGRADE
-- Run this file ONCE in Supabase SQL Editor after deploying version 1.2.0.
-- It does not delete or modify student, session, feedback, or attendance rows.

begin;

-- Public coordinator availability. The random instructor share token is required.
create or replace function public.get_public_unavailable_slots(access_token uuid)
returns table (
  day text,
  hour integer
)
language sql
stable
security definer
set search_path = public
as $$
  select u.day, u.hour
  from public.unavailable_slots u
  join public.profiles p on p.id = u.instructor_id
  where p.share_token = access_token
  order by u.day, u.hour;
$$;

-- Public coordinator feedback. Prices, email addresses, and private profile data
-- are intentionally excluded from the returned columns.
create or replace function public.get_public_feedback(access_token uuid)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  date date,
  course text,
  session_number text,
  lesson_title text,
  attendance text,
  commitment_score integer,
  understanding_score integer,
  problem_solving_score integer,
  practical_score integer,
  exercise_score integer,
  participation_score integer,
  has_homework text,
  previous_homework text,
  explained text,
  strengths text,
  improvement_areas text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.student_id,
    st.name,
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
    f.improvement_areas
  from public.feedback f
  join public.students st on st.id = f.student_id
  join public.profiles p on p.id = f.instructor_id
  where p.share_token = access_token
  order by st.name, f.date desc, f.created_at desc;
$$;

revoke all on function public.get_public_unavailable_slots(uuid) from public;
revoke all on function public.get_public_feedback(uuid) from public;
grant execute on function public.get_public_unavailable_slots(uuid) to anon, authenticated;
grant execute on function public.get_public_feedback(uuid) to anon, authenticated;

commit;
