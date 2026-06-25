const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];
const TYPE_LABELS = { paid: "Paid", cover: "Cover", covered: "Cover", free: "Free" };
const TEMPORARY_TYPES = ["cover", "covered", "free"];
const SESSION_DURATION_HOURS = 1;
const SCHEDULE_DAY_INDEX = Object.fromEntries(DAYS.map((day, index) => [day, index]));

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

let schedule = [];
let feedback = [];
let loadTimerId = null;
let downloadTargetFeedbackId = null;
let expandedFeedbackStudentKey = null;
let selectedPublicFeedbackId = null;

const scheduleTable = document.getElementById("publicScheduleTable");
const feedbackBody = document.getElementById("publicFeedbackBody");
const publicSearch = document.getElementById("publicSearch");
const availableWeekList = document.getElementById("availableWeekList");
const coordinatorDownloadModal = document.getElementById("coordinatorDownloadModal");
const coordinatorDownloadForm = document.getElementById("coordinatorDownloadForm");

function checkConfig() {
  if (SUPABASE_URL.includes("PASTE_") || SUPABASE_URL.includes("YOUR_") || SUPABASE_ANON_KEY.includes("PASTE_") || SUPABASE_ANON_KEY.includes("YOUR_")) {
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

function getScheduleDayIndex(date = new Date()) {
  return (date.getDay() + 1) % 7;
}

function normalizeType(type) {
  if (type === "covered") return "cover";
  return type || "paid";
}

function extractSessionNumber(value) {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function normalizeSessionRange(fromValue, toValue) {
  const from = fromValue === "" || fromValue == null ? null : Number(fromValue);
  const to = toValue === "" || toValue == null ? null : Number(toValue);

  if ((from !== null && (!Number.isFinite(from) || from < 1)) || (to !== null && (!Number.isFinite(to) || to < 1))) {
    alert("Please enter a valid session range, for example from 1 to 8.");
    return null;
  }

  if (from !== null && to !== null && from > to) {
    alert("The From Session value must be smaller than or equal to the To Session value.");
    return null;
  }

  return { from, to };
}

function isInsideSessionRange(value, range) {
  if (!range || (range.from === null && range.to === null)) return true;
  const sessionNumber = extractSessionNumber(value);
  if (sessionNumber === null) return false;
  if (range.from !== null && sessionNumber < range.from) return false;
  if (range.to !== null && sessionNumber > range.to) return false;
  return true;
}

function getStudentFeedbackRows(sourceRow, range) {
  const studentKey = sourceRow.student_id || sourceRow.student_name;
  return feedback.filter(item =>
    (item.student_id || item.student_name) === studentKey &&
    isInsideSessionRange(item.session_number, range)
  );
}

function getStudentSessionRows(sourceRow, range) {
  const studentKey = sourceRow.student_id || sourceRow.student_name;
  return schedule.filter(item =>
    (item.student_id || item.student_name) === studentKey &&
    isInsideSessionRange(item.current_session, range)
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStudentKey(row) {
  return String(row.student_id || row.student_name || "unknown-student");
}

function getStudentNameFromRows(rows) {
  const rowWithName = rows.find(row => row.student_name);
  return rowWithName?.student_name || "Student";
}

function sortFeedbackRows(rows) {
  return [...rows].sort((a, b) => {
    const aSession = extractSessionNumber(a.session_number);
    const bSession = extractSessionNumber(b.session_number);
    if (aSession !== null && bSession !== null && aSession !== bSession) return aSession - bSession;
    if (aSession !== null && bSession === null) return -1;
    if (aSession === null && bSession !== null) return 1;
    return String(a.date || a.created_at || "").localeCompare(String(b.date || b.created_at || ""));
  });
}

function buildFeedbackGroups() {
  const groups = new Map();

  [...schedule, ...feedback].forEach(row => {
    const key = getStudentKey(row);
    if (!groups.has(key)) groups.set(key, { key, studentName: "Student", feedbackRows: [], sessionRows: [] });
    const group = groups.get(key);
    if (row.student_name && group.studentName === "Student") group.studentName = row.student_name;
    if (row.lesson_title || row.explained || row.improvement_areas || row.strengths || row.session_number) {
      group.feedbackRows.push(row);
    } else {
      group.sessionRows.push(row);
    }
  });

  groups.forEach(group => {
    const allRows = [...group.feedbackRows, ...group.sessionRows];
    group.studentName = getStudentNameFromRows(allRows);
    group.feedbackRows = sortFeedbackRows(group.feedbackRows);
    group.sessionRows = [...group.sessionRows].sort((a, b) => Number(a.current_session || 0) - Number(b.current_session || 0));
  });

  return [...groups.values()].sort((a, b) => groupStudentName(a).localeCompare(groupStudentName(b)));
}

function groupStudentName(group) {
  return group.studentName || "Student";
}

function selectedFeedbackDetailsHtml(item) {
  if (!item) {
    return `
      <div class="feedback-detail-empty">
        Choose one feedback item to show the full saved notes here.
      </div>
    `;
  }

  const scoreRows = [
    ["Commitment", item.commitment_score],
    ["Understanding", item.understanding_score],
    ["Problem Solving", item.problem_solving_score],
    ["Practical", item.practical_score],
    ["Exercises", item.exercise_score],
    ["Participation", item.participation_score],
  ];

  return `
    <article class="public-feedback-detail-card">
      <div class="public-feedback-detail-head">
        <div>
          <strong>${escapeHtml(item.student_name || "Student")}</strong>
          <span>${escapeHtml(item.course || "Course")} · Session ${escapeHtml(item.session_number || "-")}</span>
        </div>
        <button class="download-report-btn" data-download-feedback-id="${escapeHtml(item.id)}">Download</button>
      </div>

      <div class="public-feedback-meta-grid">
        <span><b>Date</b>${escapeHtml(item.date || "-")}</span>
        <span><b>Lesson</b>${escapeHtml(item.lesson_title || "-")}</span>
        <span><b>Attendance</b>${escapeHtml(item.attendance || "-")}</span>
        <span><b>Homework?</b>${escapeHtml(item.has_homework || "-")}</span>
      </div>

      <div class="public-feedback-score-grid">
        ${scoreRows.map(([label, value]) => `<span><b>${label}</b>${escapeHtml(value ?? "-")}</span>`).join("")}
      </div>

      <div class="public-feedback-text-grid">
        <section><b>Previous Homework</b><p>${escapeHtml(item.previous_homework || "-")}</p></section>
        <section><b>What Was Explained</b><p>${escapeHtml(item.explained || "-")}</p></section>
        <section><b>Strengths</b><p>${escapeHtml(item.strengths || "-")}</p></section>
        <section><b>Improvement Areas</b><p>${escapeHtml(item.improvement_areas || "-")}</p></section>
      </div>
    </article>
  `;
}

function closeCoordinatorDownloadModal() {
  downloadTargetFeedbackId = null;
  coordinatorDownloadModal?.close();
}

function openCoordinatorDownloadModal(feedbackId) {
  const sourceRow = feedback.find(item => String(item.id) === String(feedbackId));
  if (!sourceRow || !coordinatorDownloadModal) return;

  downloadTargetFeedbackId = feedbackId;
  document.getElementById("coordinatorDownloadStudentName").textContent = `${sourceRow.student_name || "Student"} Feedback`;
  coordinatorDownloadForm.reset();
  coordinatorDownloadModal.showModal();
}

async function downloadReportFromFeedbackWithFormat(feedbackId, format, range) {
  const sourceRow = feedback.find(item => String(item.id) === String(feedbackId));
  if (!sourceRow) return;

  const allFeedback = getStudentFeedbackRows(sourceRow, { from: null, to: null });
  const allSessions = getStudentSessionRows(sourceRow, { from: null, to: null });
  const studentFeedback = getStudentFeedbackRows(sourceRow, range);
  const studentSessions = getStudentSessionRows(sourceRow, range);
  const hasRange = Boolean(range?.from !== null || range?.to !== null);

  if (studentFeedback.length === 0) {
    const rangeText = range?.from || range?.to ? ` in sessions ${range.from ?? "start"} to ${range.to ?? "end"}` : "";
    const ok = confirm(`No feedback rows found${rangeText}. Download using schedule data only?`);
    if (!ok) return;
  }

  const payload = {
    studentName: sourceRow.student_name,
    course: sourceRow.course || studentSessions[0]?.course || allSessions[0]?.course || allFeedback[0]?.course || "General",
    sessions: hasRange ? studentSessions : allSessions,
    feedbackItems: studentFeedback,
    selectedRange: range,
  };

  if (format === "json") {
    window.EdubiaReport.downloadStudentReportJson(payload);
  } else {
    await window.EdubiaReport.downloadStudentReport(payload);
  }
}

function isTemporarySessionExpired(session) {
  const type = normalizeType(session.type);
  if (!TEMPORARY_TYPES.includes(type)) return false;

  if (session.expires_at) {
    return new Date(session.expires_at).getTime() <= Date.now();
  }

  const todayIndex = getScheduleDayIndex();
  const sessionDayIndex = SCHEDULE_DAY_INDEX[session.day];
  const now = new Date();
  const currentHour = now.getHours() + (now.getMinutes() / 60);

  return sessionDayIndex < todayIndex || (
    sessionDayIndex === todayIndex && Number(session.hour) + SESSION_DURATION_HOURS <= currentHour
  );
}

function getSessionsForSlot(day, hour) {
  return schedule.filter(session => session.day === day && Number(session.hour) === Number(hour));
}

function getAvailableHours(day) {
  return HOURS.filter(hour => getSessionsForSlot(day, hour).length === 0);
}

function startAutoRefresh() {
  if (loadTimerId) return;
  loadTimerId = setInterval(loadData, 10000);
}

function stopAutoRefresh() {
  if (!loadTimerId) return;
  clearInterval(loadTimerId);
  loadTimerId = null;
}

async function cleanupExpiredTemporarySessions() {
  const { error } = await client.rpc("cleanup_expired_temporary_sessions");
  if (error) {
    console.warn("Temporary session cleanup skipped. Run database_update_existing_supabase.sql in Supabase.", error);
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
    scheduleTable.innerHTML = `<tbody><tr><td>Could not load data. Make sure database_update_existing_supabase.sql was run in Supabase and public coordinator view grants are enabled.</td></tr></tbody>`;
    return;
  }

  schedule = (scheduleResult.data || []).filter(session => !isTemporarySessionExpired(session));
  feedback = feedbackResult.data || [];

  renderSchedule();
  renderFeedback();
}

async function initPublicCoordinatorView() {
  await loadData();
  startAutoRefresh();
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
          const studentName = session.student_name || "Student";
          const course = session.course || "Course";
          const matchesSearch = !search ||
            studentName.toLowerCase().includes(search) ||
            course.toLowerCase().includes(search);

          if (!matchesSearch) continue;

          const type = normalizeType(session.type);
          const typeLabel = TYPE_LABELS[type] || "Scheduled";

          html += `
            <div class="session-card type-${type}">
              <strong>${studentName}</strong>
              <span>${course} · Session ${session.current_session}</span>
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
  const todayIndex = getScheduleDayIndex();

  availableWeekList.innerHTML = DAYS.map((day, index) => {
    const available = getAvailableHours(day);
    const isToday = index === todayIndex;
    const chips = available.length
      ? available.map(hour => `<span class="available-time-chip">${formatHour(hour)}</span>`).join("")
      : `<span class="no-available-chip">No available slots</span>`;

    return `
      <article class="available-day-card ${isToday ? "is-today" : ""}">
        <div class="available-day-head">
          <strong>${day}</strong>
          <span>${available.length} slots</span>
          ${isToday ? `<em>Today</em>` : ""}
        </div>
        <div class="available-time-chips">${chips}</div>
      </article>
    `;
  }).join("");
}

function renderFeedback() {
  const groups = buildFeedbackGroups();

  if (groups.length === 0) {
    feedbackBody.innerHTML = `<div class="empty-feedback-state">No students or feedback saved yet.</div>`;
    return;
  }

  if (!expandedFeedbackStudentKey || !groups.some(group => group.key === expandedFeedbackStudentKey)) {
    expandedFeedbackStudentKey = groups[0].key;
  }

  const expandedGroup = groups.find(group => group.key === expandedFeedbackStudentKey);
  const expandedFeedbackIds = new Set(expandedGroup.feedbackRows.map(item => String(item.id)));
  if (!selectedPublicFeedbackId || !expandedFeedbackIds.has(String(selectedPublicFeedbackId))) {
    selectedPublicFeedbackId = expandedGroup.feedbackRows[0]?.id || null;
  }

  feedbackBody.innerHTML = `
    <div class="public-feedback-student-list">
      ${groups.map(group => {
        const isOpen = group.key === expandedFeedbackStudentKey;
        const feedbackCount = group.feedbackRows.length;
        const sessionCount = new Set([
          ...group.feedbackRows.map(item => item.session_number).filter(Boolean),
          ...group.sessionRows.map(item => item.current_session).filter(Boolean),
        ]).size;

        return `
          <article class="public-feedback-student-card ${isOpen ? "is-open" : ""}">
            <button type="button" class="public-feedback-student-btn" data-feedback-student-key="${escapeHtml(group.key)}">
              <span>${escapeHtml(groupStudentName(group))}</span>
              <small>${feedbackCount} feedback · ${sessionCount} sessions</small>
            </button>

            ${isOpen ? `
              <div class="public-feedback-options">
                ${feedbackCount ? group.feedbackRows.map((item, index) => `
                  <button type="button" class="public-feedback-option ${String(item.id) === String(selectedPublicFeedbackId) ? "active" : ""}" data-select-feedback-id="${escapeHtml(item.id)}">
                    <strong>Feedback ${index + 1}</strong>
                    <span>Session ${escapeHtml(item.session_number || "-")} · ${escapeHtml(item.date || "No date")}</span>
                  </button>
                `).join("") : `<div class="feedback-detail-empty small">No feedback saved for this student yet.</div>`}
              </div>
            ` : ""}
          </article>
        `;
      }).join("")}
    </div>

    <div class="public-feedback-detail-panel">
      ${selectedFeedbackDetailsHtml(feedback.find(item => String(item.id) === String(selectedPublicFeedbackId)))}
    </div>
  `;

  feedbackBody.querySelectorAll("[data-feedback-student-key]").forEach(btn => {
    btn.addEventListener("click", () => {
      expandedFeedbackStudentKey = btn.dataset.feedbackStudentKey;
      const group = groups.find(item => item.key === expandedFeedbackStudentKey);
      selectedPublicFeedbackId = group?.feedbackRows[0]?.id || null;
      renderFeedback();
    });
  });

  feedbackBody.querySelectorAll("[data-select-feedback-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPublicFeedbackId = btn.dataset.selectFeedbackId;
      renderFeedback();
    });
  });

  feedbackBody.querySelectorAll("[data-download-feedback-id]").forEach(btn => {
    btn.addEventListener("click", () => openCoordinatorDownloadModal(btn.dataset.downloadFeedbackId));
  });
}

async function downloadReportFromFeedback(feedbackId) {
  await downloadReportFromFeedbackWithFormat(feedbackId, "pdf", { from: null, to: null });
}

coordinatorDownloadForm?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!downloadTargetFeedbackId) return;

  const submitter = event.submitter;
  const format = submitter?.dataset?.format || "pdf";
  const range = normalizeSessionRange(
    document.getElementById("coordinatorDownloadFromSession").value.trim(),
    document.getElementById("coordinatorDownloadToSession").value.trim()
  );
  if (!range) return;

  await downloadReportFromFeedbackWithFormat(downloadTargetFeedbackId, format, range);
  closeCoordinatorDownloadModal();
});

document.getElementById("closeCoordinatorDownloadModal")?.addEventListener("click", closeCoordinatorDownloadModal);


document.getElementById("refreshBtn")?.addEventListener("click", loadData);
publicSearch.addEventListener("input", renderSchedule);

if (checkConfig()) {
  initPublicCoordinatorView();
}
