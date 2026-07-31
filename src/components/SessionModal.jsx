import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { COURSE_OPTIONS, DAYS, DEFAULT_PRICES, HOURS, emptySession } from '../constants';
import { useData } from '../context/DataContext';
import { toISODate } from '../utils/date';

export default function SessionModal({ open, session, initialStudentId = '', onClose }) {
  const { students, saveSession, notify } = useData();
  const [form, setForm] = useState(emptySession);
  const [customCourse, setCustomCourse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) {
      const isPreset = COURSE_OPTIONS.includes(session.course);
      setForm({
        student_id: session.student_id,
        course: isPreset ? session.course : 'Other',
        day: session.day,
        hour: Number(session.hour),
        current_session: session.current_session,
        type: session.type,
        session_date: session.session_date || '',
        price: session.price ?? DEFAULT_PRICES[session.type],
      });
      setCustomCourse(isPreset ? '' : session.course);
    } else {
      setForm({ ...emptySession, student_id: initialStudentId || students[0]?.id || '', session_date: toISODate() });
      setCustomCourse('');
    }
  }, [session, initialStudentId, open, students]);

  const courseValue = useMemo(() => (form.course === 'Other' ? customCourse : form.course), [form.course, customCourse]);

  function updateType(type) {
    setForm({ ...form, type, price: DEFAULT_PRICES[type], session_date: type === 'paid' ? '' : form.session_date || toISODate() });
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.student_id || !courseValue.trim()) return;
    setSaving(true);
    try {
      await saveSession({ ...form, course: courseValue }, session?.id);
      onClose();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={session ? 'Edit session' : 'Add session'}
      subtitle="Paid sessions repeat weekly. Cover and free sessions use a specific date."
      onClose={onClose}
      size="large"
    >
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid two-columns">
          <label>
            <span>Student *</span>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
              <option value="">Choose a student</option>
              {students.map((studentItem) => <option key={studentItem.id} value={studentItem.id}>{studentItem.name}</option>)}
            </select>
          </label>
          <label>
            <span>Course *</span>
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {COURSE_OPTIONS.map((course) => <option key={course}>{course}</option>)}
            </select>
          </label>
        </div>
        {form.course === 'Other' && (
          <label>
            <span>Custom course name *</span>
            <input value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} placeholder="Write the course name" required />
          </label>
        )}
        <div className="form-grid three-columns">
          <label>
            <span>Session type</span>
            <select value={form.type} onChange={(e) => updateType(e.target.value)}>
              <option value="paid">Paid</option>
              <option value="cover">Cover</option>
              <option value="free">Free</option>
            </select>
          </label>
          <label>
            <span>Session number</span>
            <input value={form.current_session} onChange={(e) => setForm({ ...form, current_session: e.target.value })} placeholder="3 or Cover 8" required />
          </label>
          <label>
            <span>Price (LE)</span>
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
        </div>
        <div className="form-grid three-columns">
          <label>
            <span>Day</span>
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>
          <label>
            <span>Time</span>
            <select value={form.hour} onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}>
              {HOURS.map((hour) => <option key={hour} value={hour}>{hour > 12 ? hour - 12 : hour}:00 PM</option>)}
            </select>
          </label>
          <label>
            <span>Specific date</span>
            <input type="date" value={form.session_date} disabled={form.type === 'paid'} onChange={(e) => setForm({ ...form, session_date: e.target.value })} required={form.type !== 'paid'} />
          </label>
        </div>
        <footer className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="button primary" type="submit" disabled={saving || !students.length}>{saving ? 'Saving…' : 'Save session'}</button>
        </footer>
      </form>
    </Modal>
  );
}
