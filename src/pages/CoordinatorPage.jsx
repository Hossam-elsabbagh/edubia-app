import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { DAYS, HOURS, TYPE_LABELS } from '../constants';
import { supabase } from '../lib/supabase';
import { formatHour } from '../utils/date';
import Loader from '../components/Loader';

export default function CoordinatorPage() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token || !supabase) {
        setError('This coordinator link is missing or invalid.');
        setLoading(false);
        return;
      }
      const [profileResult, scheduleResult] = await Promise.all([
        supabase.rpc('get_public_instructor', { access_token: token }),
        supabase.rpc('get_public_schedule', { access_token: token }),
      ]);
      if (profileResult.error || scheduleResult.error) {
        setError(profileResult.error?.message || scheduleResult.error?.message || 'Could not open the coordinator view.');
      } else {
        setProfile(profileResult.data?.[0] || null);
        setSessions(scheduleResult.data || []);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const grouped = useMemo(() => new Map(sessions.map((session) => [`${session.day}-${session.hour}`, session])), [sessions]);

  if (loading) return <Loader label="Opening coordinator schedule…" />;

  return (
    <main className="coordinator-page">
      <header className="coordinator-header">
        <img src="/edubia-logo.png" alt="Edubia" />
        <div><span className="eyebrow"><ShieldCheck size={15} /> Read-only coordinator view</span><h1>{profile?.full_name || 'Instructor'}’s schedule</h1><p>Session prices and private instructor data are hidden.</p></div>
      </header>
      {error ? <div className="coordinator-error">{error}</div> : (
        <motion.section className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="panel-heading"><div><span className="eyebrow">Weekly calendar</span><h2><CalendarDays size={22} /> Current sessions</h2></div></header>
          <div className="schedule-scroll">
            <table className="schedule-grid-table coordinator-table">
              <thead><tr><th>Time</th>{DAYS.map((day) => <th key={day}>{day}</th>)}</tr></thead>
              <tbody>{HOURS.map((hour) => <tr key={hour}><th>{formatHour(hour)}</th>{DAYS.map((day) => {
                const item = grouped.get(`${day}-${hour}`);
                return <td key={`${day}-${hour}`}>{item && <div className={`session-card static ${item.type}`}><strong>{item.student_name}</strong><span>{item.course} · #{item.current_session}</span><small>{TYPE_LABELS[item.type]}{item.session_date ? ` · ${item.session_date}` : ''}</small></div>}</td>;
              })}</tr>)}</tbody>
            </table>
          </div>
        </motion.section>
      )}
    </main>
  );
}
