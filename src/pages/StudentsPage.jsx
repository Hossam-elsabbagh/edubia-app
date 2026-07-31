import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Plus, Search, Trash2, UserRound, CalendarPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TYPE_LABELS } from '../constants';
import { formatHour } from '../utils/date';
import StudentModal from '../components/StudentModal';
import SessionModal from '../components/SessionModal';
import EmptyState from '../components/EmptyState';

export default function StudentsPage() {
  const { students, sessions, deleteStudent, deleteSession, notify } = useData();
  const [search, setSearch] = useState('');
  const [studentOpen, setStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [initialStudentId, setInitialStudentId] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const studentSessions = sessions.filter((session) => session.student_id === student.id);
      return student.name.toLowerCase().includes(query) || studentSessions.some((session) => session.course.toLowerCase().includes(query));
    });
  }, [students, sessions, search]);

  async function removeStudent(student) {
    if (!window.confirm(`Delete ${student.name} and all related sessions and attendance records?`)) return;
    try { await deleteStudent(student.id); } catch (error) { notify(error.message, 'error'); }
  }

  async function removeSession(session) {
    if (!window.confirm('Delete this session?')) return;
    try { await deleteSession(session.id); } catch (error) { notify(error.message, 'error'); }
  }

  function addSession(studentId) {
    setInitialStudentId(studentId);
    setEditingSession(null);
    setSessionOpen(true);
  }

  return (
    <div className="page-content">
      <section className="page-heading-row">
        <div><span className="eyebrow">Student management</span><h1>Students & sessions</h1><p>Every student and appointment is visible only inside your account.</p></div>
        <button className="button primary" onClick={() => { setEditingStudent(null); setStudentOpen(true); }}><Plus size={18} /> Add student</button>
      </section>

      <section className="panel">
        <header className="panel-heading compact-heading">
          <div className="search-field"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or course…" /></div>
          <span className="result-count">{filtered.length} students</span>
        </header>

        {!students.length ? (
          <EmptyState title="No students yet" message="Create the first student profile to start scheduling." action={<button className="button primary" onClick={() => setStudentOpen(true)}><Plus size={17} /> Add student</button>} />
        ) : (
          <div className="student-card-list">
            {filtered.map((student, index) => {
              const studentSessions = sessions.filter((session) => session.student_id === student.id);
              const total = studentSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
              return (
                <motion.article className="student-card" key={student.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <div className="student-main">
                    <span className="avatar"><UserRound size={22} /></span>
                    <div><h3>{student.name}</h3><p>{student.age ? `${student.age} years` : 'Age not added'} · {student.nationality || 'Nationality not added'}</p></div>
                  </div>
                  <div className="student-value"><span>Weekly value</span><strong>{total.toLocaleString()} LE</strong></div>
                  <div className="student-actions">
                    <button className="icon-button soft" title="Add session" onClick={() => addSession(student.id)}><CalendarPlus size={18} /></button>
                    <button className="icon-button soft" title="Edit student" onClick={() => { setEditingStudent(student); setStudentOpen(true); }}><Edit3 size={18} /></button>
                    <button className="icon-button danger-soft" title="Delete student" onClick={() => removeStudent(student)}><Trash2 size={18} /></button>
                  </div>
                  <div className="student-sessions">
                    {studentSessions.length ? studentSessions.map((session) => (
                      <div className={`session-row ${session.type}`} key={session.id}>
                        <button className="session-row-main" onClick={() => { setEditingSession(session); setInitialStudentId(student.id); setSessionOpen(true); }}>
                          <strong>{session.course}</strong>
                          <span>{session.day} · {formatHour(session.hour)} · Session {session.current_session}</span>
                          <small>{TYPE_LABELS[session.type]}{session.session_date ? ` · ${session.session_date}` : ''}</small>
                        </button>
                        <button className="mini-delete" title="Delete session" onClick={() => removeSession(session)}><Trash2 size={15} /></button>
                      </div>
                    )) : <p className="no-sessions">No sessions added. <button onClick={() => addSession(student.id)}>Add one now</button></p>}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <StudentModal open={studentOpen} student={editingStudent} onClose={() => { setStudentOpen(false); setEditingStudent(null); }} />
      <SessionModal open={sessionOpen} session={editingSession} initialStudentId={initialStudentId} onClose={() => { setSessionOpen(false); setEditingSession(null); setInitialStudentId(''); }} />
    </div>
  );
}
