import { CalendarPlus, Edit3, MessageSquareText, Pencil, Trash2, UserRound } from 'lucide-react';
import Modal from './Modal';
import { TYPE_LABELS } from '../constants';
import { formatHour } from '../utils/date';

export default function StudentDetailsModal({
  open,
  student,
  sessions,
  feedbackCount,
  onClose,
  onAddSession,
  onEditStudent,
  onFeedback,
  onEditSession,
  onDeleteSession,
  onDeleteStudent,
}) {
  if (!student) return null;
  const weeklyTotal = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);

  return (
    <Modal
      open={open}
      title={`${student.name} — Details`}
      subtitle="A clear overview of the student profile, schedule, value, and feedback."
      onClose={onClose}
      size="wide"
    >
      <div className="student-detail-hero">
        <span className="student-detail-avatar"><UserRound size={30} /></span>
        <div><h3>{student.name}</h3><p>{student.age ? `${student.age} years old` : 'Age not added'} · {student.nationality || 'Nationality not added'}</p></div>
        <button className="button ghost compact" type="button" onClick={onEditStudent}><Edit3 size={16} /> Edit profile</button>
      </div>

      <div className="details-metric-grid">
        <article><span>Weekly value</span><strong>{weeklyTotal.toLocaleString()} LE</strong></article>
        <article><span>Monthly estimate</span><strong>{(weeklyTotal * 4).toLocaleString()} LE</strong></article>
        <article><span>Scheduled sessions</span><strong>{sessions.length}</strong></article>
        <article><span>Feedback records</span><strong>{feedbackCount}</strong></article>
      </div>

      <div className="details-action-row">
        <button className="button primary" type="button" onClick={onAddSession}><CalendarPlus size={17} /> Add session</button>
        <button className="button secondary" type="button" onClick={onFeedback}><MessageSquareText size={17} /> Open feedback</button>
        <button className="button danger-button" type="button" onClick={onDeleteStudent}><Trash2 size={17} /> Delete student</button>
      </div>

      <section className="detail-sessions-section">
        <div className="section-title-row"><div><div><h3>Student sessions</h3><p>Edit or remove individual sessions from one organized table.</p></div></div></div>
        {sessions.length ? (
          <div className="detail-table-scroll">
            <table className="detail-table">
              <thead><tr><th>Course</th><th>Session</th><th>Schedule</th><th>Type</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td><strong>{session.course}</strong></td>
                    <td>#{session.current_session}</td>
                    <td>{session.day} · {formatHour(session.hour)}{session.session_date ? <small>{session.session_date}</small> : null}</td>
                    <td><span className={`type-pill ${session.type}`}>{TYPE_LABELS[session.type]}</span></td>
                    <td>{Number(session.price || 0).toLocaleString()} LE</td>
                    <td><div className="table-actions"><button className="icon-button soft" type="button" title="Edit session" onClick={() => onEditSession(session)}><Pencil size={16} /></button><button className="icon-button danger-soft" type="button" title="Delete session" onClick={() => onDeleteSession(session)}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="feedback-empty"><CalendarPlus size={28} /><h4>No sessions yet</h4><p>Add the first scheduled session for this student.</p></div>}
      </section>
    </Modal>
  );
}
