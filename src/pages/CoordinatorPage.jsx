import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileDown,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import { DAYS, HOURS, TYPE_LABELS } from '../constants';
import { supabase } from '../lib/supabase';
import { formatHour } from '../utils/date';
import { downloadFeedbackJson } from '../utils/feedbackExport';
import { averageFeedbackScore, downloadFeedbackPdf, feedbackPdfFileName } from '../utils/pdf';
import Loader from '../components/Loader';

function currentDayName() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
}

function normalizeSession(session) {
  return {
    ...session,
    hour: Number(session.hour),
    type: session.type === 'covered' ? 'cover' : session.type,
  };
}

export default function CoordinatorPage() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activeView, setActiveView] = useState('schedule');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [creatingPdf, setCreatingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featureWarning, setFeatureWarning] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadWithLegacyFunctions() {
      const [profileResult, scheduleResult, unavailableResult, feedbackResult] = await Promise.all([
        supabase.rpc('get_public_instructor', { access_token: token }),
        supabase.rpc('get_public_schedule', { access_token: token }),
        supabase.rpc('get_public_unavailable_slots', { access_token: token }),
        supabase.rpc('get_public_feedback', { access_token: token }),
      ]);

      if (profileResult.error || scheduleResult.error) {
        throw new Error(profileResult.error?.message || scheduleResult.error?.message || 'Could not open the coordinator view.');
      }

      const optionalErrors = [unavailableResult.error, feedbackResult.error].filter(Boolean);
      return {
        profile: profileResult.data?.[0] || null,
        sessions: scheduleResult.data || [],
        unavailableSlots: unavailableResult.data || [],
        feedback: feedbackResult.data || [],
        warning: optionalErrors.length
          ? 'Run RUN_ONCE_COORDINATOR_SYNC_FIX.sql in Supabase so Busy slots and feedback can be synchronized.'
          : '',
      };
    }

    async function load() {
      if (!token || !supabase) {
        setError('This coordinator link is missing or invalid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setFeatureWarning('');

      try {
        // The combined JSON RPC keeps schedule, Busy slots, and feedback in one
        // synchronized read and avoids legacy PostgreSQL return-type conflicts.
        const workspaceResult = await supabase.rpc('get_public_coordinator_workspace', { access_token: token });
        let result;

        if (!workspaceResult.error && workspaceResult.data) {
          const workspace = workspaceResult.data;
          result = {
            profile: workspace.profile || null,
            sessions: workspace.sessions || [],
            unavailableSlots: workspace.unavailable_slots || [],
            feedback: workspace.feedback || [],
            warning: '',
          };
        } else {
          result = await loadWithLegacyFunctions();
        }

        if (cancelled) return;
        if (!result.profile) {
          setError('This coordinator link is invalid or has been replaced.');
        } else {
          setProfile(result.profile);
          setSessions((result.sessions || []).map(normalizeSession));
          setUnavailableSlots((result.unavailableSlots || []).map((slot) => ({ ...slot, hour: Number(slot.hour) })));
          setFeedback(result.feedback || []);
          setFeatureWarning(result.warning || '');
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Could not open the coordinator view.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [token]);

  const today = currentDayName();
  const sessionsBySlot = useMemo(() => {
    const map = new Map();
    sessions.forEach((session) => {
      const key = `${session.day}-${Number(session.hour)}`;
      const current = map.get(key) || [];
      current.push(session);
      map.set(key, current);
    });
    return map;
  }, [sessions]);

  const unavailableMap = useMemo(
    () => new Set(unavailableSlots.map((slot) => `${slot.day}-${Number(slot.hour)}`)),
    [unavailableSlots],
  );

  const availableByDay = useMemo(
    () => DAYS.map((day) => ({
      day,
      hours: HOURS.filter((hour) => !(sessionsBySlot.get(`${day}-${hour}`)?.length) && !unavailableMap.has(`${day}-${hour}`)),
    })),
    [sessionsBySlot, unavailableMap],
  );

  const feedbackStudents = useMemo(() => {
    const items = new Map();
    feedback.forEach((item) => {
      if (item.student_id && item.student_name) items.set(String(item.student_id), item.student_name);
    });
    sessions.forEach((item) => {
      if (item.student_id && item.student_name && !items.has(String(item.student_id))) {
        items.set(String(item.student_id), item.student_name);
      }
    });
    return [...items.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [feedback, sessions]);

  const visibleFeedback = useMemo(
    () => selectedStudent === 'all'
      ? feedback
      : feedback.filter((item) => String(item.student_id) === String(selectedStudent)),
    [feedback, selectedStudent],
  );

  const visibleSessions = useMemo(
    () => selectedStudent === 'all'
      ? sessions
      : sessions.filter((item) => String(item.student_id) === String(selectedStudent)),
    [sessions, selectedStudent],
  );

  const selectedStudentName = selectedStudent === 'all'
    ? 'All students'
    : feedbackStudents.find(([id]) => String(id) === String(selectedStudent))?.[1] || 'Student';

  async function downloadCoordinatorFeedbackPdf() {
    setCreatingPdf(true);
    setPdfError('');
    try {
      await downloadFeedbackPdf({
        title: `${profile?.full_name || 'Instructor'} — Feedback Report`,
        subtitle: `${selectedStudentName} · ${visibleFeedback.length} feedback record(s)`,
        records: visibleFeedback,
        fileName: feedbackPdfFileName(`${profile?.full_name || 'instructor'}-${selectedStudentName}`),
      });
    } catch (downloadError) {
      setPdfError(downloadError.message || 'Could not create the PDF report.');
    } finally {
      setCreatingPdf(false);
    }
  }

  function downloadCoordinatorFeedbackJson() {
    setPdfError('');
    try {
      downloadFeedbackJson({
        instructorName: profile?.full_name || 'Instructor',
        studentName: selectedStudentName,
        sessions: visibleSessions,
        feedback: visibleFeedback,
      });
    } catch (downloadError) {
      setPdfError(downloadError.message || 'Could not create the JSON report.');
    }
  }

  if (loading) return <Loader label="Opening coordinator workspace…" />;

  return (
    <main className="coordinator-page">
      <header className="coordinator-header">
        <img src="/edubia-logo.png" alt="Edubia" />
        <div>
          <span className="eyebrow"><ShieldCheck size={15} /> Read-only coordinator view</span>
          <h1>{profile?.full_name || 'Instructor'}’s workspace</h1>
          <p>The timetable matches the instructor dashboard, but every item here is view only.</p>
        </div>
      </header>

      {error ? <div className="coordinator-error">{error}</div> : (
        <>
          {featureWarning && <div className="coordinator-warning">{featureWarning}</div>}

          <nav className="coordinator-tabs" aria-label="Coordinator pages">
            <button type="button" className={activeView === 'schedule' ? 'active' : ''} onClick={() => setActiveView('schedule')}>
              <CalendarDays size={18} /> Schedule & availability
            </button>
            <button type="button" className={activeView === 'feedback' ? 'active' : ''} onClick={() => setActiveView('feedback')}>
              <MessageSquareText size={18} /> Student feedback <span>{feedback.length}</span>
            </button>
          </nav>

          {activeView === 'schedule' ? (
            <motion.div className="coordinator-content-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <section className="panel schedule-panel coordinator-schedule-panel">
                <header className="panel-heading schedule-heading">
                  <div>
                    <span className="eyebrow">Live schedule · View only</span>
                    <h2>Weekly instructor timetable</h2>
                    <p>This is the same timetable shown in the instructor dashboard. Coordinator access cannot edit sessions or availability.</p>
                  </div>
                  <div className="schedule-legends">
                    <div className="availability-legend">
                      <span className="available-status"><CheckCircle2 size={14} /> Available</span>
                      <span className="unavailable-status"><Ban size={14} /> Unavailable</span>
                    </div>
                    <div className="type-legend">
                      <span className="paid-dot">Paid</span>
                      <span className="cover-dot">Cover</span>
                      <span className="free-dot">Free</span>
                    </div>
                  </div>
                </header>

                <div className="schedule-scroll">
                  <table className="schedule-grid-table availability-table coordinator-view-only-table">
                    <thead>
                      <tr><th>Time</th>{DAYS.map((day) => <th key={day}>{day}</th>)}</tr>
                    </thead>
                    <tbody>
                      {HOURS.map((hour) => (
                        <tr key={hour}>
                          <th>{formatHour(hour)}</th>
                          {DAYS.map((day) => {
                            const key = `${day}-${hour}`;
                            const items = sessionsBySlot.get(key) || [];
                            const isUnavailable = unavailableMap.has(key);

                            return (
                              <td
                                className={items.length ? 'schedule-cell booked-cell' : isUnavailable ? 'schedule-cell unavailable-cell' : 'schedule-cell available-cell'}
                                key={key}
                              >
                                {items.length ? items.map((item) => (
                                  <div className={`session-card static ${item.type}`} key={item.id}>
                                    <strong>{item.student_name || 'Student'}</strong>
                                    <span>{item.course} · #{item.current_session}</span>
                                    <small>{TYPE_LABELS[item.type] || item.type}{item.session_date ? ` · ${item.session_date}` : ''}</small>
                                  </div>
                                )) : isUnavailable ? (
                                  <div className="slot-state unavailable-slot coordinator-readonly-slot">
                                    <span><Ban size={15} /> Unavailable</span>
                                    <small>View only</small>
                                  </div>
                                ) : (
                                  <div className="slot-state available-slot coordinator-readonly-slot">
                                    <span><CheckCircle2 size={15} /> Available</span>
                                    <small>View only</small>
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

              <section className="panel available-week-panel">
                <header className="panel-heading coordinator-panel-heading">
                  <div>
                    <span className="eyebrow">Empty-slot reminder</span>
                    <h2><Clock3 size={22} /> Available time in week</h2>
                    <p>These are the empty, open slots after combining scheduled sessions and instructor Busy times.</p>
                  </div>
                </header>
                <div className="available-week-grid">
                  {availableByDay.map(({ day, hours }) => (
                    <article className={`available-day-card ${day === today ? 'today' : ''}`} key={day}>
                      <header>
                        <h3>{day}</h3>
                        <div><span>{hours.length} slot{hours.length === 1 ? '' : 's'}</span>{day === today && <b>Today</b>}</div>
                      </header>
                      <div className="available-hour-list">
                        {hours.length ? hours.map((hour) => <span key={hour}>{formatHour(hour)}</span>) : <em>No available slots</em>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.section className="panel coordinator-feedback-panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <header className="panel-heading coordinator-panel-heading">
                <div>
                  <span className="eyebrow">Student progress · View only</span>
                  <h2><MessageSquareText size={22} /> All feedback</h2>
                  <p>Select a student, review every saved lesson report, then download the same data as PDF or JSON.</p>
                </div>
                <div className="feedback-export-actions coordinator-export-actions">
                  <button className="button ghost compact" type="button" onClick={downloadCoordinatorFeedbackPdf} disabled={creatingPdf || !visibleFeedback.length}>
                    <FileDown size={17} /> {creatingPdf ? 'Creating PDF…' : 'Print / PDF'}
                  </button>
                  <button className="button ghost compact" type="button" onClick={downloadCoordinatorFeedbackJson} disabled={!visibleFeedback.length}>
                    <Download size={17} /> JSON
                  </button>
                </div>
              </header>

              {pdfError && <div className="coordinator-inline-error">{pdfError}</div>}

              <div className="coordinator-feedback-summary">
                <article><UserRound size={19} /><div><span>Students</span><strong>{feedbackStudents.length}</strong></div></article>
                <article><MessageSquareText size={19} /><div><span>Feedback records</span><strong>{feedback.length}</strong></div></article>
                <label>
                  <span>Filter by student</span>
                  <select value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)}>
                    <option value="all">All students</option>
                    {feedbackStudents.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </label>
              </div>

              {visibleFeedback.length ? (
                <div className="coordinator-feedback-list">
                  {visibleFeedback.map((item) => (
                    <article className="coordinator-feedback-card" key={item.id}>
                      <header>
                        <div>
                          <span className="feedback-date">{item.date || 'No date'}</span>
                          <h3>{item.student_name || 'Student'}</h3>
                          <h4>{item.lesson_title || 'Lesson feedback'}</h4>
                          <p>{item.course || 'Course'} · Session {item.session_number || '—'} · {item.attendance || '—'}</p>
                        </div>
                        <span className="score-badge"><Star size={14} /> {averageFeedbackScore(item)} / 5</span>
                      </header>
                      <div className="coordinator-score-row">
                        <span>Commitment <b>{item.commitment_score || '—'}/5</b></span>
                        <span>Understanding <b>{item.understanding_score || '—'}/5</b></span>
                        <span>Problem solving <b>{item.problem_solving_score || '—'}/5</b></span>
                        <span>Practical <b>{item.practical_score || '—'}/5</b></span>
                        <span>Exercises <b>{item.exercise_score || '—'}/5</b></span>
                        <span>Participation <b>{item.participation_score || '—'}/5</b></span>
                      </div>
                      <div className="feedback-text-grid">
                        <div><span>Explained</span><p>{item.explained || '—'}</p></div>
                        <div><span>Strengths</span><p>{item.strengths || '—'}</p></div>
                        <div><span>Improve</span><p>{item.improvement_areas || '—'}</p></div>
                      </div>
                      <footer>Homework: {item.has_homework || '—'} · Previous homework: {item.previous_homework || '—'}</footer>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="feedback-empty">
                  <MessageSquareText size={30} />
                  <h4>No feedback available</h4>
                  <p>No feedback has been saved for this selection yet. If the instructor can see feedback but this page cannot, run the supplied synchronization SQL once.</p>
                </div>
              )}
            </motion.section>
          )}
        </>
      )}
    </main>
  );
}
