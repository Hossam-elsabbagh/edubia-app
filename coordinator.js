const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];
const TYPE_LABELS = { paid: "Paid", cover: "Cover", free: "Free" };

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

let schedule = [];
let feedback = [];

const scheduleTable = document.getElementById("publicScheduleTable");
const feedbackBody = document.getElementById("publicFeedbackBody");
const publicSearch = document.getElementById("publicSearch");
const availableWeekList = document.getElementById("availableWeekList");

function checkConfig() {
  if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_KEY.includes("PASTE_")) {
    alert("Coordinator page is not connected yet. Add Supabase URL and anon key in config.js.");
    return false;
  }
  return true;
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
}

function getSessionsForSlot(day, hour) {
  return schedule.filter(session => session.day === day && Number(session.hour) === Number(hour));
}

function getAvailableHours(day) {
  return HOURS.filter(hour => getSessionsForSlot(day, hour).length === 0);
}

async function cleanupExpiredTemporarySessions() {
  const { error } = await client.rpc("cleanup_expired_temporary_sessions");
  if (error) {
    // The page still works if you have not run the new SQL function yet.
    console.warn("Temporary session cleanup skipped:", error);
  }
}

async function loadData() {
  await cleanupExpiredTemporarySessions();
  const [scheduleResult, feedbackResult] = await Promise.all([
    client.from("coordinator_schedule").select("*").order("hour", { ascending: true }),
    client.from("coordinator_feedback").select("*").order("created_at", { ascending: false }),
  ]);

  if (scheduleResult.error || feedbackResult.error) {
    console.error(scheduleResult.error || feedbackResult.error);
    scheduleTable.innerHTML = `<tbody><tr><td>Could not load data. Make sure database.sql was run in Supabase.</td></tr></tbody>`;
    return;
  }

  schedule = scheduleResult.data || [];
  feedback = feedbackResult.data || [];

  renderSchedule();
  renderFeedback();
}

function renderSchedule() {
  const search = publicSearch.value.trim().toLowerCase();

  let html = `
    <thead>
      <tr>
        <th>Time</th>
        ${DAYS.map(day => `<th>${day}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
  `;

  for (const hour of HOURS) {
    html += `<tr><td class="time-cell">${formatHour(hour)}</td>`;

    for (const day of DAYS) {
      const sessions = getSessionsForSlot(day, hour);
      html += `<td>`;

      if (sessions.length === 0) {
        html += `<div class="empty-slot">Available</div>`;
      } else {
        for (const session of sessions) {
          const matchesSearch = !search ||
            session.student_name.toLowerCase().includes(search) ||
            session.course.toLowerCase().includes(search);

          if (!matchesSearch) continue;

          const type = session.type || "public";
          const typeLabel = TYPE_LABELS[type] || "Scheduled";

          html += `
            <div class="session-card type-${type}">
              <strong>${session.student_name}</strong>
              <span>${session.course} · Session ${session.current_session}</span>
              <span>${typeLabel} · ${day} · ${formatHour(Number(session.hour))}</span>
            </div>
          `;
        }
      }

      html += `</td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody>`;
  scheduleTable.innerHTML = html;
  renderAvailableWeek();
}

function renderAvailableWeek() {
  if (!availableWeekList) return;

  availableWeekList.innerHTML = DAYS.map(day => {
    const available = getAvailableHours(day);
    const availableText = available.length
      ? available.map(hour => formatHour(hour)).join(", ")
      : "No available time";

    return `
      <div class="available-day-row">
        <strong>${day}</strong>
        <span>${availableText}</span>
      </div>
    `;
  }).join("");
}

function renderFeedback() {
  if (feedback.length === 0) {
    feedbackBody.innerHTML = `<tr><td colspan="17">No feedback saved yet.</td></tr>`;
    return;
  }

  feedbackBody.innerHTML = feedback.map(item => `
    <tr>
      <td>
        <div class="feedback-name-cell">
          <strong>${item.student_name}</strong>
          <button class="download-report-btn" data-download-feedback-id="${item.id}">Download</button>
        </div>
      </td>
      <td>${item.date || "-"}</td>
      <td>${item.session_number || "-"}</td>
      <td>${item.course || "-"}</td>
      <td>${item.lesson_title || "-"}</td>
      <td>${item.attendance || "-"}</td>
      <td>${item.commitment_score ?? "-"}</td>
      <td>${item.understanding_score ?? "-"}</td>
      <td>${item.problem_solving_score ?? "-"}</td>
      <td>${item.practical_score ?? "-"}</td>
      <td>${item.exercise_score ?? "-"}</td>
      <td>${item.participation_score ?? "-"}</td>
      <td>${item.has_homework || "-"}</td>
      <td>${item.previous_homework || "-"}</td>
      <td>${item.explained || "-"}</td>
      <td>${item.strengths || "-"}</td>
      <td>${item.improvement_areas || "-"}</td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-download-feedback-id]").forEach(btn => {
    btn.addEventListener("click", () => downloadReportFromFeedback(btn.dataset.downloadFeedbackId));
  });
}

async function downloadReportFromFeedback(feedbackId) {
  const sourceRow = feedback.find(item => String(item.id) === String(feedbackId));
  if (!sourceRow) return;

  const studentName = sourceRow.student_name;
  const studentKey = sourceRow.student_id || sourceRow.student_name;
  const studentFeedback = feedback.filter(item => (item.student_id || item.student_name) === studentKey);
  const studentSessions = schedule.filter(item => (item.student_id || item.student_name) === studentKey);

  await window.EdubiaReport.downloadStudentReport({
    studentName,
    course: sourceRow.course || studentSessions[0]?.course || "General",
    sessions: studentSessions,
    feedbackItems: studentFeedback,
  });
}

document.getElementById("refreshBtn").addEventListener("click", loadData);
publicSearch.addEventListener("input", renderSchedule);

if (checkConfig()) {
  loadData();
  setInterval(loadData, 10000);
}
