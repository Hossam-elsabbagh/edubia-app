-- Edubia Schedule App V3 patch
-- Run this once in Supabase SQL Editor if your database already exists.

alter table public.sessions add column if not exists session_date date;
alter table public.sessions add column if not exists expires_at timestamptz;

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
  where type in ('cover', 'free')
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
grant execute on function public.cleanup_expired_temporary_sessions() to anon, authenticated;
grant select on public.coordinator_schedule to anon, authenticated;
