import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileDown,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import { DAYS, HOURS, TYPE_LABELS } from '../constants';
import { supabase } from '../lib/supabase';
import { formatHour } from '../utils/date';
import { averageFeedbackScore, downloadFeedbackPdf, feedbackPdfFileName } from '../utils/pdf';
import Loader from '../components/Loader';

function currentDayName() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
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
    async function load() {
      if (!token || !supabase) {
        setError('This coordinator link is missing or invalid.');
        setLoading(false);
        return;
      }

      const [profileResult, scheduleResult, unavailableResult, feedbackResult] = await Promise.all([
        supabase.rpc('get_public_instructor', { access_token: token }),
        supabase.rpc('get_public_schedule', { access_token: token }),
        supabase.rpc('get_public_unavailable_slots', { access_token: token }),
        supabase.rpc('get_public_feedback', { access_token: token }),
      ]);

      if (profileResult.error || scheduleResult.error) {
        setError(profileResult.error?.message || scheduleResult.error?.message || 'Could not open the coordinator view.');
      } else {
        setProfile(profileResult.data?.[0] || null);
        setSessions(scheduleResult.data || []);
      }

      const optionalErrors = [unavailableResult.error, feedbackResult.error].filter(Boolean);
      if (optionalErrors.length) {
        setFeatureWarning('The coordinator database upgrade is still required before availability and feedback can be displayed.');
      }
      setUnavailableSlots(unavailableResult.data || []);
      setFeedback(feedbackResult.data || []);
      setLoading(false);
    }
    load();
  }, [token]);

  const today = currentDayName();
  const groupedSessions = useMemo(
    () => new Map(sessions.map((session) => [`${session.day}-${Number(session.hour)}`, session])),
    [sessions],
  );
  const unavailableMap = useMemo(
    () => new Set(unavailableSlots.map((slot) => `${slot.day}-${Number(slot.hour)}`)),
    [unavailableSlots],
  );
  const availableByDay = useMemo(
    () => DAYS.map((day) => ({
      day,
      hours: HOURS.filter((hour) => !groupedSessions.has(`${day}-${hour}`) && !unavailableMap.has(`${day}-${hour}`)),
    })),
    [groupedSessions, unavailableMap],
  );
  const feedbackStudents = useMemo(() => {
    const items = new Map();
    feedback.forEach((item) => {
      if (item.student_id && item.student_name) items.set(item.student_id, item.student_name);
    });
    return [...items.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [feedback]);
  const visibleFeedback = useMemo(
    () => selectedStudent === 'all' ? feedback : feedback.filter((item) => item.student_id === selectedStudent),
    [feedback, selectedStudent],
  );
  const selectedStudentName = selectedStudent === 'all'
    ? 'All students'
    : feedbackStudents.find(([id]) => id === selectedStudent)?.[1] || 'Student';

  async function downloadCoordinatorFeedback() {
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

  if (loading) return <Loader label="Opening coordinator workspace…" />;

  return (
    <main className="coordinator-page">
      <header className="coordinator-header">
        <img src="/edubia-logo.png" alt="Edubia" />
        <div>
          <span className="eyebrow"><ShieldCheck size={15} /> Read-only coordinator view</span>
          <h1>{profile?.full_name || 'Instructor'}’s workspace</h1>
          <p>Review the complete schedule, current availability, and student feedback. Session prices and private account data stay hidden.</p>
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
              <section className="panel coordinator-schedule-panel">
                <header className="panel-heading coordinator-panel-heading">
                  <div>
                    <span className="eyebrow">Weekly calendar</span>
                    <h2><CalendarDays size={22} /> Schedule status</h2>
                    <p>Every cell clearly shows whether the hour is Busy or Available.</p>
                  </div>
                  <div className="availability-legend">
                    <span className="available-status"><CheckCircle2 size={14} /> Available</span>
                    <span className="unavailable-status"><Ban size={14} /> Busy</span>
                  </div>
                </header>

                <div className="schedule-scroll">
                  <table className="schedule-grid-table coordinator-table coordinator-status-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        {DAYS.map((day) => <th className={day === today ? 'today-column' : ''} key={day}>{day}{day === today && <small>Today</small>}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {HOURS.map((hour) => (
                        <tr key={hour}>
                          <th>{formatHour(hour)}</th>
                          {DAYS.map((day) => {
                            const key = `${day}-${hour}`;
                            const item = groupedSessions.get(key);
                            const isUnavailable = unavailableMap.has(key);
                            return (
                              <td className={day === today ? 'today-column' : ''} key={key}>
                                {item ? (
                                  <div className={`session-card static coordinator-session ${item.type}`}>
                                    <span className="coordinator-result-badge busy"><Ban size={12} /> Busy</span>
                                    <strong>{item.student_name}</strong>
                                    <span>{item.course} · #{item.current_session}</span>
                                    <small>{TYPE_LABELS[item.type]}{item.session_date ? ` · ${item.session_date}` : ''}</small>
                                  </div>
                                ) : isUnavailable ? (
                                  <div className="coordinator-slot-result busy">
                                    <Ban size={17} />
                                    <strong>Busy</strong>
                                    <small>Instructor unavailable</small>
                                  </div>
                                ) : (
                                  <div className="coordinator-slot-result available">
                                    <CheckCircle2 size={17} />
                                    <strong>Available</strong>
                                    <small>Open time</small>
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
                    <p>These are the empty slots that are still available on each day.</p>
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
                  <span className="eyebrow">Student progress</span>
                  <h2><MessageSquareText size={22} /> All feedback</h2>
                  <p>Read every saved lesson report, organized by student and date.</p>
                </div>
                <button className="button primary" type="button" onClick={downloadCoordinatorFeedback} disabled={creatingPdf || !visibleFeedback.length}>
                  <FileDown size={17} /> {creatingPdf ? 'Creating PDF…' : 'Download PDF'}
                </button>
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
                          <span className="feedback-date">{item.date}</span>
                          <h3>{item.student_name}</h3>
                          <h4>{item.lesson_title}</h4>
                          <p>{item.course} · Session {item.session_number} · {item.attendance}</p>
                        </div>
                        <span className="score-badge"><Star size={14} /> {averageFeedbackScore(item)} / 5</span>
                      </header>
                      <div className="coordinator-score-row">
                        <span>Commitment <b>{item.commitment_score}/5</b></span>
                        <span>Understanding <b>{item.understanding_score}/5</b></span>
                        <span>Problem solving <b>{item.problem_solving_score}/5</b></span>
                        <span>Practical <b>{item.practical_score}/5</b></span>
                        <span>Exercises <b>{item.exercise_score}/5</b></span>
                        <span>Participation <b>{item.participation_score}/5</b></span>
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
                  <p>No feedback has been saved for this selection yet.</p>
                </div>
              )}
            </motion.section>
          )}
        </>
      )}
    </main>
  );
}
