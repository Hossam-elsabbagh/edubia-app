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
  const [feedback, setFeedback] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const notify = useCallback((message, tone = 'success') => {
    setNotice({ message, tone, id: Date.now() });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 3600);
  }, []);

  const refresh = useCallback(async () => {
    if (!instructorId || !supabase) return;
    setLoading(true);
    const [studentsResult, sessionsResult, attendanceResult, feedbackResult, unavailableResult] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('sessions').select('*').order('day').order('hour'),
      supabase.from('attendance').select('*').order('attendance_date', { ascending: false }),
      supabase.from('feedback').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('unavailable_slots').select('*').order('day').order('hour'),
    ]);

    const error = studentsResult.error || sessionsResult.error || attendanceResult.error || feedbackResult.error || unavailableResult.error;
    if (error) {
      notify(error.message, 'error');
      setLoading(false);
      return;
    }

    setStudents(studentsResult.data || []);
    setSessions(sessionsResult.data || []);
    setAttendance(attendanceResult.data || []);
    setFeedback(feedbackResult.data || []);
    setUnavailableSlots(unavailableResult.data || []);
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

    const blocked = unavailableSlots.some(
      (slot) => slot.day === payload.day && Number(slot.hour) === payload.hour,
    );
    const isCurrentSlot = id && sessions.some(
      (item) => item.id === id && item.day === payload.day && Number(item.hour) === payload.hour,
    );
    if (blocked && !isCurrentSlot) throw new Error('This time slot is marked unavailable. Make it available first.');

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

  async function markSlotUnavailable(day, hour) {
    const hasSession = sessions.some((item) => item.day === day && Number(item.hour) === Number(hour));
    if (hasSession) throw new Error('This slot already contains a session and is already busy.');

    const { error } = await supabase
      .from('unavailable_slots')
      .upsert(
        { instructor_id: instructorId, day, hour: Number(hour) },
        { onConflict: 'instructor_id,day,hour' },
      );
    if (error) throw error;
    await refresh();
    notify(`${day} at ${Number(hour) > 12 ? Number(hour) - 12 : Number(hour)}:00 marked busy.`);
  }

  async function markSlotAvailable(day, hour) {
    const { error } = await supabase
      .from('unavailable_slots')
      .delete()
      .eq('day', day)
      .eq('hour', Number(hour));
    if (error) throw error;
    await refresh();
    notify(`${day} at ${Number(hour) > 12 ? Number(hour) - 12 : Number(hour)}:00 is available again.`);
  }

  async function saveFeedback(values, id = null) {
    const payload = {
      instructor_id: instructorId,
      student_id: values.student_id,
      date: values.date,
      course: values.course.trim(),
      session_number: String(values.session_number).trim(),
      lesson_title: values.lesson_title.trim(),
      attendance: values.attendance,
      commitment_score: Number(values.commitment_score),
      understanding_score: Number(values.understanding_score),
      problem_solving_score: Number(values.problem_solving_score),
      practical_score: Number(values.practical_score),
      exercise_score: Number(values.exercise_score),
      participation_score: Number(values.participation_score),
      has_homework: values.has_homework,
      previous_homework: values.previous_homework,
      explained: values.explained?.trim() || null,
      strengths: values.strengths?.trim() || null,
      improvement_areas: values.improvement_areas?.trim() || null,
    };

    const query = id
      ? supabase.from('feedback').update(payload).eq('id', id)
      : supabase.from('feedback').insert(payload);
    const { error } = await query;
    if (error) throw error;
    await refresh();
    notify(id ? 'Feedback updated successfully.' : 'Feedback saved successfully.');
  }

  async function deleteFeedback(id) {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
    await refresh();
    notify('Feedback deleted.');
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
      feedback,
      unavailableSlots,
      loading,
      notice,
      notify,
      refresh,
      saveStudent,
      deleteStudent,
      saveSession,
      deleteSession,
      markSlotUnavailable,
      markSlotAvailable,
      saveFeedback,
      deleteFeedback,
      saveAttendance,
      getMonthAttendance,
    }),
    [students, sessions, attendance, feedback, unavailableSlots, loading, notice, notify, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
