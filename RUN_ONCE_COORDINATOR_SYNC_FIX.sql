-- EDUBIA COORDINATOR SYNC FIX
-- Run ONCE in the same Supabase project's SQL Editor.
-- Safe for the existing database: no tables or user data are deleted.
--
-- Fixes:
--   1) Coordinator schedule and Dashboard use the same sessions/Busy slots.
--   2) Coordinator feedback is returned with the correct student names.
--   3) One JSON RPC avoids legacy PostgreSQL return-type conflicts.

begin;

-- Keep ownership consistent with the student record for legacy feedback/session
-- rows. This only repairs ownership metadata; it does not alter lesson content.
update public.sessions s
set instructor_id = st.instructor_id
from public.students st
where s.student_id = st.id
  and st.instructor_id is not null
  and s.instructor_id is distinct from st.instructor_id;

update public.feedback f
set instructor_id = st.instructor_id
from public.students st
where f.student_id = st.id
  and st.instructor_id is not null
  and f.instructor_id is distinct from st.instructor_id;

create or replace function public.get_public_coordinator_workspace(access_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_instructor_id uuid;
  v_profile jsonb;
  v_sessions jsonb;
  v_unavailable_slots jsonb;
  v_feedback jsonb;
begin
  select p.id,
         jsonb_build_object(
           'id', p.id,
           'full_name', p.full_name
         )
  into v_instructor_id, v_profile
  from public.profiles p
  where p.share_token = access_token
  limit 1;

  if v_instructor_id is null then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'student_id', s.student_id,
        'student_name', coalesce(st.name, 'Student'),
        'day', s.day,
        'hour', s.hour,
        'course', s.course,
        'current_session', s.current_session,
        'type', case when s.type = 'covered' then 'cover' else s.type end,
        'session_date', s.session_date,
        'expires_at', s.expires_at
      )
      order by
        case s.day
          when 'Saturday' then 0
          when 'Sunday' then 1
          when 'Monday' then 2
          when 'Tuesday' then 3
          when 'Wednesday' then 4
          when 'Thursday' then 5
          when 'Friday' then 6
          else 7
        end,
        s.hour,
        s.created_at
    ),
    '[]'::jsonb
  )
  into v_sessions
  from public.sessions s
  left join public.students st on st.id = s.student_id
  where s.instructor_id = v_instructor_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'day', u.day,
        'hour', u.hour
      )
      order by
        case u.day
          when 'Saturday' then 0
          when 'Sunday' then 1
          when 'Monday' then 2
          when 'Tuesday' then 3
          when 'Wednesday' then 4
          when 'Thursday' then 5
          when 'Friday' then 6
          else 7
        end,
        u.hour
    ),
    '[]'::jsonb
  )
  into v_unavailable_slots
  from public.unavailable_slots u
  where u.instructor_id = v_instructor_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', f.id,
        'student_id', f.student_id,
        'student_name', coalesce(st.name, 'Student'),
        'date', f.date,
        'course', f.course,
        'session_number', f.session_number,
        'lesson_title', f.lesson_title,
        'attendance', f.attendance,
        'commitment_score', f.commitment_score,
        'understanding_score', f.understanding_score,
        'problem_solving_score', f.problem_solving_score,
        'practical_score', f.practical_score,
        'exercise_score', f.exercise_score,
        'participation_score', f.participation_score,
        'has_homework', f.has_homework,
        'previous_homework', f.previous_homework,
        'explained', f.explained,
        'strengths', f.strengths,
        'improvement_areas', f.improvement_areas,
        'created_at', f.created_at
      )
      order by st.name, f.date desc, f.created_at desc
    ),
    '[]'::jsonb
  )
  into v_feedback
  from public.feedback f
  left join public.students st on st.id = f.student_id
  where f.instructor_id = v_instructor_id;

  return jsonb_build_object(
    'profile', v_profile,
    'sessions', v_sessions,
    'unavailable_slots', v_unavailable_slots,
    'feedback', v_feedback
  );
end;
$$;

revoke all on function public.get_public_coordinator_workspace(uuid) from public;
grant execute on function public.get_public_coordinator_workspace(uuid) to anon, authenticated;

commit;

-- Optional verification: replace the UUID below with the token from your
-- coordinator URL and run the SELECT separately after this script finishes.
-- select public.get_public_coordinator_workspace('YOUR-COORDINATOR-TOKEN'::uuid);
