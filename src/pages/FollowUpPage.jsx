import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, Check, Download, UserCheck, UserX } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TYPE_LABELS } from '../constants';
import { currentMonthValue, formatHour, formatReadableDate, getDayName, toISODate } from '../utils/date';
import { exportMonthlyAttendance } from '../utils/export';
import EmptyState from '../components/EmptyState';

export default function FollowUpPage() {
  const { students, sessions, attendance, saveAttendance, getMonthAttendance, notify } = useData();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const [month, setMonth] = useState(currentMonthValue());
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const dayName = getDayName(selectedDate);
  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  const dailySessions = useMemo(() => sessions
    .filter((session) => {
      if (session.type === 'paid') return session.day === dayName;
      if (session.session_date) return session.session_date === selectedDate;
      return session.day === dayName;
    })
    .sort((a, b) => Number(a.hour) - Number(b.hour)), [sessions, dayName, selectedDate]);

  useEffect(() => {
    const existing = {};
    attendance
      .filter((item) => item.attendance_date === selectedDate)
      .forEach((item) => { existing[item.session_id] = item.status; });
    setStatuses(existing);
  }, [selectedDate, attendance]);

  const monthRows = useMemo(() => attendance.filter((item) => item.attendance_date?.startsWith(month)), [attendance, month]);
  const typeSummary = useMemo(() => ['paid', 'cover', 'free'].map((type) => {
    const rows = monthRows.filter((row) => row.type === type);
    return {
      type,
      total: rows.length,
      attended: rows.filter((row) => row.status === 'attended').length,
      absent: rows.filter((row) => row.status === 'absent').length,
    };
  }), [monthRows]);

  function markAll(status) {
    setStatuses(Object.fromEntries(dailySessions.map((session) => [session.id, status])));
  }

  async function saveDay() {
    const selectedRows = dailySessions.filter((session) => statuses[session.id]);
    if (!selectedRows.length) {
      notify('Select attended or absent for at least one student.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveAttendance(selectedRows.map((session) => ({
        instructor_id: session.instructor_id,
        student_id: session.student_id,
        session_id: session.id,
        attendance_date: selectedDate,
        status: statuses[session.id],
        student_name: studentMap.get(session.student_id)?.name || 'Student',
        course: session.course,
        session_number: session.current_session,
        day: dayName,
        hour: session.hour,
        type: session.type,
      })));
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function downloadReport() {
    setExporting(true);
    try {
      const rows = await getMonthAttendance(month);
      exportMonthlyAttendance({ month, instructorName: profile?.full_name, attendanceRows: rows });
      notify('Monthly Excel report downloaded.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="page-content">
      <section className="page-heading-row follow-heading">
        <div><span className="eyebrow">Daily attendance</span><h1>FOLLOW UP</h1><p>Choose a date, mark each scheduled student, then download the complete monthly file.</p></div>
        <div className="date-control"><CalendarCheck2 size={19} /><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
      </section>

      <section className="panel attendance-panel">
        <header className="panel-heading">
          <div><span className="eyebrow">{dayName}</span><h2>{formatReadableDate(selectedDate)}</h2><p>{dailySessions.length} scheduled session{dailySessions.length === 1 ? '' : 's'}</p></div>
          {!!dailySessions.length && <div className="mark-all"><button onClick={() => markAll('attended')}><UserCheck size={16} /> All attended</button><button onClick={() => markAll('absent')}><UserX size={16} /> All absent</button></div>}
        </header>

        {!dailySessions.length ? (
          <EmptyState title="No students scheduled for this date" message="Paid sessions appear on their weekly day. Cover and free sessions appear on their specific date." />
        ) : (
          <div className="attendance-list">
            {dailySessions.map((session, index) => {
              const student = studentMap.get(session.student_id);
              return (
                <motion.article className="attendance-row" key={session.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                  <div className="attendance-time"><strong>{formatHour(session.hour)}</strong><span className={`type-pill ${session.type}`}>{TYPE_LABELS[session.type]}</span></div>
                  <div className="attendance-student"><h3>{student?.name || 'Student'}</h3><p>{session.course} · Session {session.current_session}</p></div>
                  <div className="attendance-choice" role="radiogroup" aria-label={`Attendance for ${student?.name}`}>
                    <label className={statuses[session.id] === 'attended' ? 'selected attended' : ''}>
                      <input type="radio" name={`attendance-${session.id}`} value="attended" checked={statuses[session.id] === 'attended'} onChange={() => setStatuses({ ...statuses, [session.id]: 'attended' })} />
                      <UserCheck size={18} /> Attended
                    </label>
                    <label className={statuses[session.id] === 'absent' ? 'selected absent' : ''}>
                      <input type="radio" name={`attendance-${session.id}`} value="absent" checked={statuses[session.id] === 'absent'} onChange={() => setStatuses({ ...statuses, [session.id]: 'absent' })} />
                      <UserX size={18} /> Absent
                    </label>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
        {!!dailySessions.length && (
          <footer className="attendance-save-bar">
            <span>{Object.keys(statuses).filter((id) => dailySessions.some((session) => session.id === id)).length} of {dailySessions.length} marked</span>
            <button className="button primary" onClick={saveDay} disabled={saving}><Check size={18} /> {saving ? 'Saving…' : 'Save daily attendance'}</button>
          </footer>
        )}
      </section>

      <section className="panel monthly-panel">
        <header className="panel-heading">
          <div><span className="eyebrow">Monthly report</span><h2>Attendance & session summary</h2><p>The Excel file contains dates, days, students, status, and type summaries.</p></div>
          <div className="month-actions"><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /><button className="button primary" onClick={downloadReport} disabled={exporting}><Download size={18} /> {exporting ? 'Preparing…' : 'Download Excel'}</button></div>
        </header>

        <div className="type-summary-grid">
          {typeSummary.map((summary, index) => (
            <motion.article className={`type-summary-card ${summary.type}`} key={summary.type} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <div><span>{TYPE_LABELS[summary.type]} sessions</span><strong>{summary.total}</strong></div>
              <p><b>{summary.attended}</b> attended <i /> <b>{summary.absent}</b> absent</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
