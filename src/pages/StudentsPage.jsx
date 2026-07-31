import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Eye, MessageSquareText, Plus, Search, Trash2, UserRound } from 'lucide-react';
import { useData } from '../context/DataContext';
import StudentModal from '../components/StudentModal';
import SessionModal from '../components/SessionModal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import FeedbackModal from '../components/FeedbackModal';
import EmptyState from '../components/EmptyState';

export default function StudentsPage() {
  const { students, sessions, feedback, deleteStudent, deleteSession, notify } = useData();
  const [search, setSearch] = useState('');
  const [studentOpen, setStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [initialStudentId, setInitialStudentId] = useState('');
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [feedbackStudent, setFeedbackStudent] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const studentSessions = sessions.filter((session) => session.student_id === student.id);
      return student.name.toLowerCase().includes(query)
        || (student.nationality || '').toLowerCase().includes(query)
        || studentSessions.some((session) => session.course.toLowerCase().includes(query));
    });
  }, [students, sessions, search]);

  async function removeStudent(student) {
    if (!window.confirm(`Delete ${student.name}? Sessions and feedback will be removed. Saved attendance history will remain.`)) return;
    try {
      await deleteStudent(student.id);
      setDetailsStudent(null);
      setFeedbackStudent(null);
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function removeSession(session) {
    if (!window.confirm(`Delete ${session.course} session #${session.current_session}?`)) return;
    try { await deleteSession(session.id); } catch (error) { notify(error.message, 'error'); }
  }

  function addSession(studentId) {
    setInitialStudentId(studentId);
    setEditingSession(null);
    setSessionOpen(true);
  }

  function editSession(session) {
    setInitialStudentId(session.student_id);
    setEditingSession(session);
    setSessionOpen(true);
  }

  function editStudent(student) {
    setEditingStudent(student);
    setStudentOpen(true);
  }

  return (
    <div className="page-content">
      <section className="page-heading-row">
        <div><span className="eyebrow">Student management</span><h1>Students, details & feedback</h1><p>Search students, open a clear profile, manage sessions, and save lesson feedback from one place.</p></div>
        <button className="button primary" onClick={() => { setEditingStudent(null); setStudentOpen(true); }}><Plus size={18} /> Add student</button>
      </section>

      <section className="panel">
        <header className="panel-heading compact-heading">
          <div className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, nationality, or course…" /></div>
          <span className="result-count">{filtered.length} of {students.length} students</span>
        </header>

        {!students.length ? (
          <EmptyState title="No students yet" message="Create the first student profile to start scheduling and feedback." action={<button className="button primary" onClick={() => setStudentOpen(true)}><Plus size={17} /> Add student</button>} />
        ) : !filtered.length ? (
          <EmptyState title="No matching students" message="Try another name, nationality, or course." />
        ) : (
          <div className="student-card-list organized-list">
            {filtered.map((student, index) => {
              const studentSessions = sessions.filter((session) => session.student_id === student.id);
              const studentFeedback = feedback.filter((item) => item.student_id === student.id);
              const total = studentSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
              const courses = [...new Set(studentSessions.map((session) => session.course))];

              return (
                <motion.article className="student-card organized-card" key={student.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
                  <div className="student-main">
                    <span className="avatar"><UserRound size={22} /></span>
                    <div><h3>{student.name}</h3><p>{student.age ? `${student.age} years` : 'Age not added'} · {student.nationality || 'Nationality not added'}</p></div>
                  </div>

                  <div className="student-overview-grid">
                    <div><span>Sessions</span><strong>{studentSessions.length}</strong></div>
                    <div><span>Feedback</span><strong>{studentFeedback.length}</strong></div>
                    <div><span>Weekly value</span><strong>{total.toLocaleString()} LE</strong></div>
                  </div>

                  <div className="student-course-line">
                    <span>Courses</span>
                    <div>{courses.length ? courses.map((course) => <b key={course}>{course}</b>) : <em>No courses added</em>}</div>
                  </div>

                  <div className="student-action-buttons">
                    <button className="button ghost compact" type="button" onClick={() => setDetailsStudent(student)}><Eye size={16} /> Details</button>
                    <button className="button secondary compact" type="button" onClick={() => setFeedbackStudent(student)}><MessageSquareText size={16} /> Feedback</button>
                    <button className="button primary compact" type="button" onClick={() => addSession(student.id)}><CalendarPlus size={16} /> Add session</button>
                    <button className="icon-button danger-soft" type="button" title="Delete student" onClick={() => removeStudent(student)}><Trash2 size={17} /></button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <StudentModal open={studentOpen} student={editingStudent} onClose={() => { setStudentOpen(false); setEditingStudent(null); }} />
      <SessionModal open={sessionOpen} session={editingSession} initialStudentId={initialStudentId} onClose={() => { setSessionOpen(false); setEditingSession(null); setInitialStudentId(''); }} />
      <StudentDetailsModal
        open={Boolean(detailsStudent)}
        student={detailsStudent}
        sessions={sessions.filter((session) => session.student_id === detailsStudent?.id)}
        feedbackCount={feedback.filter((item) => item.student_id === detailsStudent?.id).length}
        onClose={() => setDetailsStudent(null)}
        onAddSession={() => { addSession(detailsStudent.id); setDetailsStudent(null); }}
        onEditStudent={() => { editStudent(detailsStudent); setDetailsStudent(null); }}
        onFeedback={() => { setFeedbackStudent(detailsStudent); setDetailsStudent(null); }}
        onEditSession={(session) => { editSession(session); setDetailsStudent(null); }}
        onDeleteSession={removeSession}
        onDeleteStudent={() => removeStudent(detailsStudent)}
      />
      <FeedbackModal open={Boolean(feedbackStudent)} student={feedbackStudent} onClose={() => setFeedbackStudent(null)} />
    </div>
  );
}
