function safeFileName(value) {
  return String(value || 'feedback')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'feedback';
}

function downloadBlob(fileName, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 300);
}

export function buildFeedbackReportPayload({
  instructorName = 'Instructor',
  studentName = 'All students',
  sessions = [],
  feedback = [],
}) {
  return {
    app: 'edubia-feedback-report',
    version: 1,
    generated_at: new Date().toISOString(),
    instructor: instructorName,
    student: studentName,
    sessions: sessions.map((session) => ({
      id: session.id,
      student_id: session.student_id,
      student_name: session.student_name,
      day: session.day,
      hour: Number(session.hour),
      course: session.course,
      session_number: session.current_session,
      type: session.type,
      session_date: session.session_date || null,
    })),
    feedback: feedback.map((item) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: item.student_name,
      date: item.date,
      course: item.course,
      session_number: item.session_number,
      lesson_title: item.lesson_title,
      attendance: item.attendance,
      commitment_score: item.commitment_score,
      understanding_score: item.understanding_score,
      problem_solving_score: item.problem_solving_score,
      practical_score: item.practical_score,
      exercise_score: item.exercise_score,
      participation_score: item.participation_score,
      has_homework: item.has_homework,
      previous_homework: item.previous_homework,
      explained: item.explained,
      strengths: item.strengths,
      improvement_areas: item.improvement_areas,
    })),
  };
}

export function downloadFeedbackJson({
  instructorName,
  studentName,
  sessions,
  feedback,
}) {
  const payload = buildFeedbackReportPayload({ instructorName, studentName, sessions, feedback });
  const fileName = `${safeFileName(`edubia-${studentName || 'feedback'}`)}.json`;
  downloadBlob(fileName, 'application/json;charset=utf-8', JSON.stringify(payload, null, 2));
}
