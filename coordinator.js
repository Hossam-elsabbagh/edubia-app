const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];
const TYPE_LABELS = { paid: "Paid", cover: "Cover", covered: "Cover", free: "Free" };
const TEMPORARY_TYPES = ["cover", "covered", "free"];
const SESSION_UNLOCK_KEY = "edubia_coordinator_unlocked";
const SESSION_DURATION_HOURS = 1;
const SCHEDULE_DAY_INDEX = Object.fromEntries(DAYS.map((day, index) => [day, index]));

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

let schedule = [];
let feedback = [];
let loadTimerId = null;
let authRenderPromise = null;

const loginPanel = document.getElementById("coordinatorLoginPanel");
const contentPanel = document.getElementById("coordinatorContent");
const actionsPanel = document.getElementById("coordinatorActions");
const loginForm = document.getElementById("coordinatorLoginForm");
const scheduleTable = document.getElementById("publicScheduleTable");
const feedbackBody = document.getElementById("publicFeedbackBody");
const publicSearch = document.getElementById("publicSearch");
const availableWeekList = document.getElementById("availableWeekList");

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
    scheduleTable.innerHTML = `<tbody><tr><td>Could not load data. Make sure database_update_existing_supabase.sql was run in Supabase and the coordinator is logged in.</td></tr></tbody>`;
    return;
  }

  schedule = (scheduleResult.data || []).filter(session => !isTemporarySessionExpired(session));
  feedback = feedbackResult.data || [];

  renderSchedule();
  renderFeedback();
}

async function renderAuth() {
  if (authRenderPromise) return authRenderPromise;

  authRenderPromise = (async () => {
    const { data } = await client.auth.getSession();
    const hasSupabaseSession = Boolean(data.session);
    const coordinatorUnlocked = sessionStorage.getItem(SESSION_UNLOCK_KEY) === "true";
    const loggedIn = hasSupabaseSession && coordinatorUnlocked;

    loginPanel.classList.toggle("hidden", loggedIn);
    contentPanel.classList.toggle("hidden", !loggedIn);
    actionsPanel.classList.toggle("hidden", !loggedIn);

    if (loggedIn) {
      await loadData();
      startAutoRefresh();
    } else {
      stopAutoRefresh();
      schedule = [];
      feedback = [];
    }
  })();

  try {
    return await authRenderPromise;
  } finally {
    authRenderPromise = null;
  }
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

async function loginCoordinator(email, password) {
  const loginButton = document.querySelector('#coordinatorLoginForm button[type="submit"]');
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const { error } = await client.auth.signInWithPassword({ email, password });

  loginButton.disabled = false;
  loginButton.textContent = "Login";

  if (error) {
    alert(error.message);
    return;
  }

  sessionStorage.setItem(SESSION_UNLOCK_KEY, "true");
  await renderAuth();
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  await loginCoordinator(
    document.getElementById("coordinatorEmail").value.trim(),
    document.getElementById("coordinatorPassword").value
  );
});

document.getElementById("refreshBtn").addEventListener("click", loadData);
document.getElementById("coordinatorLogoutBtn").addEventListener("click", async () => {
  sessionStorage.removeItem(SESSION_UNLOCK_KEY);
  await client.auth.signOut();
  await renderAuth();
});
publicSearch.addEventListener("input", renderSchedule);

client.auth.onAuthStateChange(() => {
  setTimeout(() => {
    renderAuth();
  }, 0);
});

if (checkConfig()) {
  renderAuth();
}
