import { useEffect, useMemo, useState } from 'react';
import { Download, Edit3, FileText, MessageSquareText, Plus, Printer, Star, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { toISODate } from '../utils/date';

const emptyFeedback = {
  student_id: '',
  date: '',
  course: '',
  session_number: '',
  lesson_title: '',
  attendance: 'Present',
  commitment_score: 5,
  understanding_score: 5,
  problem_solving_score: 5,
  practical_score: 5,
  exercise_score: 5,
  participation_score: 5,
  has_homework: 'Yes',
  previous_homework: 'Submitted',
  explained: '',
  strengths: '',
  improvement_areas: '',
};

const scoreFields = [
  ['commitment_score', 'Commitment to time'],
  ['understanding_score', 'Concept understanding'],
  ['problem_solving_score', 'Problem solving'],
  ['practical_score', 'Practical application'],
  ['exercise_score', 'Exercise completion'],
  ['participation_score', 'Interaction & participation'],
];

function sessionKey(value, course = '') {
  return `${String(value || '').trim().toLowerCase()}::${String(course || '').trim().toLowerCase()}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function averageScore(item) {
  const values = scoreFields.map(([key]) => Number(item[key] || 0));
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

export default function FeedbackModal({ open, student, onClose }) {
  const { sessions, feedback, saveFeedback, deleteFeedback, notify } = useData();
  const [form, setForm] = useState(emptyFeedback);
  const [editingId, setEditingId] = useState(null);
  const [selectedSession, setSelectedSession] = useState('all');
  const [saving, setSaving] = useState(false);

  const studentSessions = useMemo(
    () => sessions.filter((session) => session.student_id === student?.id),
    [sessions, student?.id],
  );
  const studentFeedback = useMemo(
    () => feedback.filter((item) => item.student_id === student?.id),
    [feedback, student?.id],
  );

  const sessionOptions = useMemo(() => {
    const options = new Map();
    studentSessions.forEach((session) => {
      const key = sessionKey(session.current_session, session.course);
      options.set(key, { key, value: session.current_session, course: session.course });
    });
    studentFeedback.forEach((item) => {
      const key = sessionKey(item.session_number, item.course);
      if (!options.has(key)) options.set(key, { key, value: item.session_number, course: item.course });
    });
    return [...options.values()];
  }, [studentSessions, studentFeedback]);

  const visibleFeedback = useMemo(
    () => selectedSession === 'all'
      ? studentFeedback
      : studentFeedback.filter((item) => sessionKey(item.session_number, item.course) === selectedSession),
    [studentFeedback, selectedSession],
  );

  useEffect(() => {
    if (!open || !student) return;
    const firstSession = studentSessions[0];
    setForm({
      ...emptyFeedback,
      student_id: student.id,
      date: toISODate(),
      course: firstSession?.course || '',
      session_number: firstSession?.current_session || '',
    });
    setEditingId(null);
    setSelectedSession('all');
  }, [open, student, studentSessions]);

  function resetForm() {
    const firstSession = studentSessions[0];
    setForm({
      ...emptyFeedback,
      student_id: student.id,
      date: toISODate(),
      course: firstSession?.course || '',
      session_number: firstSession?.current_session || '',
    });
    setEditingId(null);
  }

  function chooseSession(option) {
    setSelectedSession(option.key);
    setForm((current) => ({ ...current, session_number: option.value, course: option.course }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      student_id: item.student_id,
      date: item.date || toISODate(),
      course: item.course || '',
      session_number: item.session_number || '',
      lesson_title: item.lesson_title || '',
      attendance: item.attendance || 'Present',
      commitment_score: item.commitment_score || 5,
      understanding_score: item.understanding_score || 5,
      problem_solving_score: item.problem_solving_score || 5,
      practical_score: item.practical_score || 5,
      exercise_score: item.exercise_score || 5,
      participation_score: item.participation_score || 5,
      has_homework: item.has_homework || 'Yes',
      previous_homework: item.previous_homework || 'Submitted',
      explained: item.explained || '',
      strengths: item.strengths || '',
      improvement_areas: item.improvement_areas || '',
    });
    document.querySelector('.feedback-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.course.trim() || !String(form.session_number).trim() || !form.lesson_title.trim()) return;
    setSaving(true);
    try {
      await saveFeedback(form, editingId);
      resetForm();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete feedback for session ${item.session_number}?`)) return;
    try {
      await deleteFeedback(item.id);
      if (editingId === item.id) resetForm();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function downloadJson() {
    const payload = {
      student: { name: student.name, age: student.age, nationality: student.nationality },
      generated_at: new Date().toISOString(),
      feedback: visibleFeedback,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-feedback.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      notify('Allow pop-ups to print the feedback report.', 'error');
      return;
    }
    reportWindow.opener = null;
    const cards = visibleFeedback.map((item) => `
      <article>
        <header><h2>${escapeHtml(item.lesson_title)}</h2><strong>${escapeHtml(item.date)}</strong></header>
        <p><b>${escapeHtml(item.course)}</b> · Session ${escapeHtml(item.session_number)} · ${escapeHtml(item.attendance)}</p>
        <p>Average score: <b>${averageScore(item)} / 5</b></p>
        <div class="grid">
          <p><b>Explained</b><br>${escapeHtml(item.explained || '-')}</p>
          <p><b>Strengths</b><br>${escapeHtml(item.strengths || '-')}</p>
          <p><b>Improvement areas</b><br>${escapeHtml(item.improvement_areas || '-')}</p>
        </div>
      </article>`).join('');
    reportWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(student.name)} Feedback</title><style>
      body{font-family:Arial,sans-serif;color:#182035;padding:36px;line-height:1.55}h1{margin:0}.sub{color:#667085;margin:5px 0 25px}article{border:1px solid #dfe3ec;border-radius:14px;padding:18px;margin:0 0 16px;break-inside:avoid}header{display:flex;justify-content:space-between;gap:20px}h2{font-size:18px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.grid p{background:#f6f7fb;padding:12px;border-radius:10px}@media print{body{padding:0}}@media(max-width:700px){.grid{grid-template-columns:1fr}}
    </style></head><body><h1>${escapeHtml(student.name)} — Feedback Report</h1><p class="sub">${visibleFeedback.length} feedback record(s)</p>${cards || '<p>No feedback records.</p>'}<script>window.onload=()=>window.print()<\/script></body></html>`);
    reportWindow.document.close();
  }

  if (!student) return null;

  return (
    <Modal
      open={open}
      title={`${student.name} — Feedback`}
      subtitle="Add, review, edit, print, and download feedback for every lesson."
      onClose={onClose}
      size="wide"
    >
      <div className="feedback-toolbar">
        <div className="feedback-session-filter">
          <button type="button" className={selectedSession === 'all' ? 'active' : ''} onClick={() => setSelectedSession('all')}>All feedback</button>
          {sessionOptions.map((option) => (
            <button type="button" className={selectedSession === option.key ? 'active' : ''} key={option.key} onClick={() => chooseSession(option)}>
              {option.course} · #{option.value}
            </button>
          ))}
        </div>
        <div className="feedback-export-actions">
          <button className="button ghost compact" type="button" onClick={printReport}><Printer size={16} /> Print / PDF</button>
          <button className="button ghost compact" type="button" onClick={downloadJson}><Download size={16} /> JSON</button>
        </div>
      </div>

      <section className="feedback-form-section">
        <div className="section-title-row">
          <div><span className="section-icon"><MessageSquareText size={19} /></span><div><h3>{editingId ? 'Edit feedback' : 'Add feedback'}</h3><p>Required fields are marked with an asterisk.</p></div></div>
          {editingId && <button className="button ghost compact" type="button" onClick={resetForm}>Cancel edit</button>}
        </div>

        <form className="form-stack" onSubmit={submit}>
          <div className="form-grid three-columns">
            <label><span>Date *</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
            <label><span>Course *</span><input value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} placeholder="Python" required /></label>
            <label><span>Session number *</span><input value={form.session_number} onChange={(event) => setForm({ ...form, session_number: event.target.value })} placeholder="3 or Cover 8" required /></label>
          </div>
          <div className="form-grid three-columns">
            <label><span>Lesson title *</span><input value={form.lesson_title} onChange={(event) => setForm({ ...form, lesson_title: event.target.value })} placeholder="Variables" required /></label>
            <label><span>Attendance</span><select value={form.attendance} onChange={(event) => setForm({ ...form, attendance: event.target.value })}><option>Present</option><option>Absent</option><option>Late</option></select></label>
            <label><span>Previous homework</span><select value={form.previous_homework} onChange={(event) => setForm({ ...form, previous_homework: event.target.value })}><option>Submitted</option><option>Not Submitted</option><option>Not Required</option></select></label>
          </div>

          <div className="feedback-score-section">
            <div className="mini-heading"><Star size={17} /><span>Performance scores</span></div>
            <div className="form-grid three-columns">
              {scoreFields.map(([key, label]) => (
                <label key={key}><span>{label}</span><select value={form[key]} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} / 5</option>)}</select></label>
              ))}
            </div>
          </div>

          <div className="form-grid two-columns">
            <label><span>Homework?</span><select value={form.has_homework} onChange={(event) => setForm({ ...form, has_homework: event.target.value })}><option>Yes</option><option>No</option></select></label>
            <label><span>What was explained?</span><textarea value={form.explained} onChange={(event) => setForm({ ...form, explained: event.target.value })} placeholder="Topics and activities covered in this lesson…" /></label>
          </div>
          <div className="form-grid two-columns">
            <label><span>Strengths</span><textarea value={form.strengths} onChange={(event) => setForm({ ...form, strengths: event.target.value })} placeholder="What the student did well…" /></label>
            <label><span>Improvement areas</span><textarea value={form.improvement_areas} onChange={(event) => setForm({ ...form, improvement_areas: event.target.value })} placeholder="What needs more practice…" /></label>
          </div>
          <footer className="modal-actions">
            <button className="button ghost" type="button" onClick={resetForm}>Clear</button>
            <button className="button primary" type="submit" disabled={saving}><Plus size={17} /> {saving ? 'Saving…' : editingId ? 'Update feedback' : 'Save feedback'}</button>
          </footer>
        </form>
      </section>

      <section className="saved-feedback-section">
        <div className="section-title-row">
          <div><span className="section-icon"><FileText size={19} /></span><div><h3>Saved feedback</h3><p>{visibleFeedback.length} record(s) in this view.</p></div></div>
        </div>
        {visibleFeedback.length ? (
          <div className="feedback-card-list">
            {visibleFeedback.map((item) => (
              <article className="feedback-review-card" key={item.id}>
                <header>
                  <div><span className="feedback-date">{item.date}</span><h4>{item.lesson_title}</h4><p>{item.course} · Session {item.session_number} · {item.attendance}</p></div>
                  <span className="score-badge"><Star size={14} /> {averageScore(item)}</span>
                </header>
                <div className="feedback-text-grid">
                  <div><span>Explained</span><p>{item.explained || '—'}</p></div>
                  <div><span>Strengths</span><p>{item.strengths || '—'}</p></div>
                  <div><span>Improve</span><p>{item.improvement_areas || '—'}</p></div>
                </div>
                <footer>
                  <span>Homework: {item.has_homework || '—'} · Previous: {item.previous_homework || '—'}</span>
                  <div><button className="button ghost compact" type="button" onClick={() => startEdit(item)}><Edit3 size={15} /> Edit</button><button className="button danger-button compact" type="button" onClick={() => remove(item)}><Trash2 size={15} /> Delete</button></div>
                </footer>
              </article>
            ))}
          </div>
        ) : <div className="feedback-empty"><MessageSquareText size={28} /><h4>No feedback saved here</h4><p>Add the first lesson feedback using the form above.</p></div>}
      </section>
    </Modal>
  );
}
