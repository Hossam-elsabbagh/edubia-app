import { useEffect, useState } from 'react';
import Modal from './Modal';
import { emptyStudent } from '../constants';
import { useData } from '../context/DataContext';

export default function StudentModal({ open, student, onClose }) {
  const { saveStudent, notify } = useData();
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(student ? {
      name: student.name || '',
      age: student.age || '',
      nationality: student.nationality || '',
    } : emptyStudent);
  }, [student, open]);

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await saveStudent(form, student?.id);
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
      title={student ? 'Edit student' : 'Add a new student'}
      subtitle="Student information is private to your instructor account."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={submit}>
        <label>
          <span>Student name *</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Example: Mohamed Emad" required />
        </label>
        <div className="form-grid two-columns">
          <label>
            <span>Age</span>
            <input type="number" min="3" max="90" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="14" />
          </label>
          <label>
            <span>Nationality</span>
            <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Egyptian" />
          </label>
        </div>
        <footer className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save student'}</button>
        </footer>
      </form>
    </Modal>
  );
}
