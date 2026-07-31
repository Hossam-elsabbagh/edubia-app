import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, CalendarDays, CheckCircle2, ClipboardCheck, Copy, Plus, Users, WalletCards } from 'lucide-react';
import { DAYS, HOURS, TYPE_LABELS } from '../constants';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatHour, toISODate } from '../utils/date';
import StudentModal from '../components/StudentModal';
import SessionModal from '../components/SessionModal';

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  show: (index) => ({ opacity: 1, y: 0, transition: { delay: index * 0.07 } }),
};

export default function DashboardPage() {
  const {
    students,
    sessions,
    attendance,
    unavailableSlots,
    markSlotUnavailable,
    markSlotAvailable,
    notify,
  } = useData();
  const { profile } = useAuth();
  const [studentOpen, setStudentOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [changingSlot, setChangingSlot] = useState('');

  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const unavailableMap = useMemo(
    () => new Set(unavailableSlots.map((slot) => `${slot.day}-${Number(slot.hour)}`)),
    [unavailableSlots],
  );
  const counts = useMemo(() => ({
    paid: sessions.filter((session) => session.type === 'paid').length,
    cover: sessions.filter((session) => session.type === 'cover').length,
    free: sessions.filter((session) => session.type === 'free').length,
  }), [sessions]);
  const weeklyTotal = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
  const attendedThisMonth = attendance.filter((item) => item.status === 'attended' && item.attendance_date?.slice(0, 7) === toISODate().slice(0, 7)).length;

  const stats = [
    { label: 'Students', value: students.length, icon: Users, detail: 'In your private workspace' },
    { label: 'Weekly value', value: `${weeklyTotal.toLocaleString()} LE`, icon: WalletCards, detail: `Monthly estimate ${(weeklyTotal * 4).toLocaleString()} LE` },
    { label: 'Sessions', value: sessions.length, icon: CalendarDays, detail: `${counts.paid} Paid · ${counts.cover} Cover · ${counts.free} Free` },
    { label: 'Attended this month', value: attendedThisMonth, icon: ClipboardCheck, detail: 'Saved in Follow Up' },
  ];

  function openNewSession() {
    if (!students.length) {
      notify('Add a student before creating a session.', 'error');
      setStudentOpen(true);
      return;
    }
    setEditingSession(null);
    setSessionOpen(true);
  }

  async function changeAvailability(day, hour, makeBusy) {
    const key = `${day}-${hour}`;
    setChangingSlot(key);
    try {
      if (makeBusy) await markSlotUnavailable(day, hour);
      else await markSlotAvailable(day, hour);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setChangingSlot('');
    }
  }

  async function copyCoordinatorLink() {
    if (!profile?.share_token) return;
    const link = `${window.location.origin}/coordinator?token=${profile.share_token}`;
    await navigator.clipboard.writeText(link);
    notify('Coordinator link copied.');
  }

  return (
    <div className="page-content">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Good to see you</span>
          <h1>{profile?.full_name || 'Instructor'}’s teaching hub</h1>
          <p>Manage the weekly plan, block busy hours, update students, and keep attendance ready for monthly reports.</p>
        </div>
        <div className="hero-actions">
          <button className="button ghost" onClick={copyCoordinatorLink}><Copy size={17} /> Copy coordinator link</button>
          <button className="button secondary" onClick={() => setStudentOpen(true)}><Users size={17} /> Add student</button>
          <button className="button primary" onClick={openNewSession}><Plus size={18} /> Add session</button>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.article className="stat-card" key={stat.label} custom={index} variants={cardMotion} initial="hidden" animate="show">
              <span className="stat-icon"><Icon size={21} /></span>
              <div><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.detail}</small></div>
            </motion.article>
          );
        })}
      </section>

      <section className="panel schedule-panel">
        <header className="panel-heading schedule-heading">
          <div><span className="eyebrow">Live schedule</span><h2>Weekly instructor timetable</h2><p>Green means available. Use Busy to block an empty hour; use Available to reopen it.</p></div>
          <div className="schedule-legends">
            <div className="availability-legend"><span className="available-status"><CheckCircle2 size={14} /> Available</span><span className="unavailable-status"><Ban size={14} /> Unavailable</span></div>
            <div className="type-legend"><span className="paid-dot">Paid</span><span className="cover-dot">Cover</span><span className="free-dot">Free</span></div>
          </div>
        </header>

        <div className="schedule-scroll">
          <table className="schedule-grid-table availability-table">
            <thead><tr><th>Time</th>{DAYS.map((day) => <th key={day}>{day}</th>)}</tr></thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <th>{formatHour(hour)}</th>
                  {DAYS.map((day) => {
                    const key = `${day}-${hour}`;
                    const items = sessions.filter((session) => session.day === day && Number(session.hour) === hour);
                    const isUnavailable = unavailableMap.has(key);
                    const isChanging = changingSlot === key;

                    return (
                      <td className={items.length ? 'schedule-cell booked-cell' : isUnavailable ? 'schedule-cell unavailable-cell' : 'schedule-cell available-cell'} key={key}>
                        {items.length ? items.map((item) => (
                          <motion.button
                            whileHover={{ y: -3, scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            className={`session-card ${item.type}`}
                            key={item.id}
                            onClick={() => { setEditingSession(item); setSessionOpen(true); }}
                          >
                            <strong>{studentMap.get(item.student_id)?.name || 'Student'}</strong>
                            <span>{item.course} · #{item.current_session}</span>
                            <small>{TYPE_LABELS[item.type]}{item.session_date ? ` · ${item.session_date}` : ''}</small>
                          </motion.button>
                        )) : isUnavailable ? (
                          <div className="slot-state unavailable-slot">
                            <span><Ban size={15} /> Unavailable</span>
                            <button type="button" disabled={isChanging} onClick={() => changeAvailability(day, hour, false)}>{isChanging ? 'Updating…' : 'Available'}</button>
                          </div>
                        ) : (
                          <div className="slot-state available-slot">
                            <span><CheckCircle2 size={15} /> Available</span>
                            <button type="button" disabled={isChanging} onClick={() => changeAvailability(day, hour, true)}>{isChanging ? 'Updating…' : 'Busy'}</button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <StudentModal open={studentOpen} onClose={() => setStudentOpen(false)} />
      <SessionModal open={sessionOpen} session={editingSession} onClose={() => { setSessionOpen(false); setEditingSession(null); }} />
    </div>
  );
}
