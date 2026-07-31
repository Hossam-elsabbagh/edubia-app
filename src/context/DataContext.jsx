import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { monthBounds } from '../utils/date';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session } = useAuth();
  const instructorId = session?.user?.id;
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const notify = useCallback((message, tone = 'success') => {
    setNotice({ message, tone, id: Date.now() });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 3600);
  }, []);

  const refresh = useCallback(async () => {
    if (!instructorId || !supabase) return;
    setLoading(true);
    const [studentsResult, sessionsResult, attendanceResult] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('sessions').select('*').order('day').order('hour'),
      supabase.from('attendance').select('*').order('attendance_date', { ascending: false }),
    ]);

    const error = studentsResult.error || sessionsResult.error || attendanceResult.error;
    if (error) {
      notify(error.message, 'error');
      setLoading(false);
      return;
    }

    setStudents(studentsResult.data || []);
    setSessions(sessionsResult.data || []);
    setAttendance(attendanceResult.data || []);
    setLoading(false);
  }, [instructorId, notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveStudent(values, id = null) {
    const payload = {
      instructor_id: instructorId,
      name: values.name.trim(),
      age: values.age ? Number(values.age) : null,
      nationality: values.nationality?.trim() || null,
    };
    const query = id
      ? supabase.from('students').update(payload).eq('id', id)
      : supabase.from('students').insert(payload);
    const { error } = await query;
    if (error) throw error;
    await refresh();
    notify(id ? 'Student updated successfully.' : 'Student added successfully.');
  }

  async function deleteStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    await refresh();
    notify('Student and future sessions deleted. Attendance history was kept.');
  }

  async function saveSession(values, id = null) {
    const payload = {
      instructor_id: instructorId,
      student_id: values.student_id,
      course: values.course.trim(),
      day: values.day,
      hour: Number(values.hour),
      current_session: String(values.current_session).trim(),
      type: values.type,
      price: Number(values.price || 0),
      session_date: values.type === 'paid' ? null : values.session_date || null,
    };

    const collision = sessions.find(
      (item) => item.id !== id && item.day === payload.day && Number(item.hour) === payload.hour &&
        (item.type === 'paid' || payload.type === 'paid' || item.session_date === payload.session_date),
    );
    if (collision) throw new Error('This time slot is already booked.');

    const query = id
      ? supabase.from('sessions').update(payload).eq('id', id)
      : supabase.from('sessions').insert(payload);
    const { error } = await query;
    if (error) throw error;
    await refresh();
    notify(id ? 'Session updated successfully.' : 'Session added to the schedule.');
  }

  async function deleteSession(id) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) throw error;
    await refresh();
    notify('Session deleted.');
  }

  async function saveAttendance(rows) {
    if (!rows.length) return;
    const payload = rows.map((row) => ({
      instructor_id: instructorId,
      student_id: row.student_id,
      session_id: row.session_id,
      attendance_date: row.attendance_date,
      status: row.status,
      student_name: row.student_name,
      course: row.course,
      session_number: row.session_number,
      day: row.day,
      hour: Number(row.hour),
      type: row.type,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(payload, { onConflict: 'instructor_id,session_id,attendance_date' });
    if (error) throw error;
    await refresh();
    notify('Daily attendance saved.');
  }

  async function getMonthAttendance(month) {
    const { from, to } = monthBounds(month);
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('attendance_date', from)
      .lte('attendance_date', to)
      .order('attendance_date')
      .order('hour');
    if (error) throw error;
    return data || [];
  }

  const value = useMemo(
    () => ({
      students,
      sessions,
      attendance,
      loading,
      notice,
      notify,
      refresh,
      saveStudent,
      deleteStudent,
      saveSession,
      deleteSession,
      saveAttendance,
      getMonthAttendance,
    }),
    [students, sessions, attendance, loading, notice, notify, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
