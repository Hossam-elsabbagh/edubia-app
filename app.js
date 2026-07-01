const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];

const PRICE = { paid: 150, cover: 150, free: 100 };
const TYPE_LABELS = { paid: "Paid", cover: "Cover", free: "Free" };
const TEMPORARY_TYPES = ["cover", "free"];
const SESSION_DURATION_HOURS = 1;
const SCHEDULE_DAY_INDEX = Object.fromEntries(DAYS.map((day, index) => [day, index]));

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

let state = { students: [], sessions: [], feedback: [], unavailableSlots: [] };
let selectedStudentId = null;
let feedbackStudentId = null;
let prefillStudentId = null;
let authRenderPromise = null;
let cleanupIntervalId = null;
let downloadTargetStudentId = null;
let editingSessionId = null;
let editingFeedbackId = null;
let selectedFeedbackSessionKey = "all";

const scheduleTable = document.getElementById("scheduleTable");
const studentsTableBody = document.getElementById("studentsTableBody");
const studentModal = document.getElementById("studentModal");
const detailsModal = document.getElementById("detailsModal");
const feedbackModal = document.getElementById("feedbackModal");
const studentForm = document.getElementById("studentForm");
const feedbackForm = document.getElementById("feedbackForm");
const downloadModal = document.getElementById("downloadModal");
const downloadForm = document.getElementById("downloadForm");
const editSessionModal = document.getElementById("editSessionModal");
const editSessionForm = document.getElementById("editSessionForm");
const sessionDay = document.getElementById("sessionDay");
const sessionHour = document.getElementById("sessionHour");
const studentCourse = document.getElementById("studentCourse");
const customCourseLabel = document.getElementById("customCourseLabel");
const customCourse = document.getElementById("customCourse");
const studentSearch = document.getElementById("studentSearch");

function checkConfig() {
  if (SUPABASE_URL.includes("PASTE_") || SUPABASE_URL.includes("YOUR_") || SUPABASE_ANON_KEY.includes("PASTE_") || SUPABASE_ANON_KEY.includes("YOUR_")) {
    alert("Please open config.js and add your Supabase URL and anon key.");
    return false;
  }
  return true;
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getScheduleDayIndex(date = new Date()) {
  // JavaScript getDay(): Sunday = 0 ... Saturday = 6.
  // App schedule: Saturday = 0 ... Friday = 6.
  return (date.getDay() + 1) % 7;
}

function getNextSessionStart(day, hour) {
  const now = new Date();
  const targetDayIndex = SCHEDULE_DAY_INDEX[day];
  const todayIndex = getScheduleDayIndex(now);
  let daysUntil = targetDayIndex - todayIndex;

  const start = new Date(now);
  start.setDate(now.getDate() + daysUntil);
  start.setHours(Number(hour), 0, 0, 0);

  // If the selected day/time already passed this week, save it for next week.
  if (daysUntil < 0 || start <= now) {
    start.setDate(start.getDate() + 7);
  }

  return start;
}

function getSessionDateAndExpiry(type, day, hour) {
  if (!TEMPORARY_TYPES.includes(type)) {
    return { session_date: null, expires_at: null };
  }

  const start = getNextSessionStart(day, hour);
  const expiry = new Date(start);
  expiry.setHours(expiry.getHours() + SESSION_DURATION_HOURS);

  return {
    session_date: toLocalISODate(start),
    expires_at: expiry.toISOString(),
  };
}

function isTemporarySessionExpired(session) {
  if (!TEMPORARY_TYPES.includes(session.type)) return false;

  if (session.expires_at) {
    return new Date(session.expires_at).getTime() <= Date.now();
  }

  // Fallback for old database rows created before the expires_at column existed.
  const todayIndex = getScheduleDayIndex();
  const sessionDayIndex = SCHEDULE_DAY_INDEX[session.day];
  const currentHour = new Date().getHours() + (new Date().getMinutes() / 60);
  return sessionDayIndex < todayIndex || (sessionDayIndex === todayIndex && Number(session.hour) + SESSION_DURATION_HOURS <= currentHour);
}

async function cleanupExpiredTemporarySessions() {
  // Preferred cleanup: safe SQL function. It can run even from the coordinator page if you grant execute to anon.
  const rpcResult = await client.rpc("cleanup_expired_temporary_sessions");
  if (!rpcResult.error) return;

  // Fallback: authenticated admin can still clean rows directly if the RPC was not added yet.
  const nowISO = new Date().toISOString();
  const directResult = await client
    .from("sessions")
    .delete()
    .in("type", TEMPORARY_TYPES)
    .not("expires_at", "is", null)
    .lte("expires_at", nowISO);

  if (directResult.error) {
    console.warn("Temporary session cleanup skipped:", rpcResult.error, directResult.error);
  }
}

function startCleanupTimer() {
  if (cleanupIntervalId) return;
  cleanupIntervalId = setInterval(async () => {
    await cleanupExpiredTemporarySessions();
    await refreshData({ skipCleanup: true });
  }, 60 * 1000);
}

function stopCleanupTimer() {
  if (!cleanupIntervalId) return;
  clearInterval(cleanupIntervalId);
  cleanupIntervalId = null;
}

function getCoordinatorLink() {
  const path = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  return `${window.location.origin}${path}/coordinator.html`;
}

function getStudent(studentId) {
  return state.students.find(s => s.id === studentId);
}

function getSessionsForStudent(studentId) {
  return state.sessions.filter(session => session.student_id === studentId);
}

function getFeedbackForStudent(studentId) {
  return state.feedback.filter(item => item.student_id === studentId);
}


function getSessionById(sessionId) {
  return state.sessions.find(session => String(session.id) === String(sessionId));
}

function getFeedbackById(feedbackId) {
  return state.feedback.find(item => String(item.id) === String(feedbackId));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sessionKeyFromValue(value) {
  const num = extractSessionNumber(value);
  return num === null ? String(value || "unknown").trim().toLowerCase() : `number:${num}`;
}

function sessionLabelFromValue(value) {
  const num = extractSessionNumber(value);
  return num === null ? String(value || "Unknown session") : `Session ${num}`;
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

function filterFeedbackBySessionRange(items, range) {
  return items.filter(item => isInsideSessionRange(item.session_number, range));
}

function filterSessionsBySessionRange(items, range) {
  return items.filter(item => isInsideSessionRange(item.current_session, range));
}

function closeDownloadModal() {
  downloadTargetStudentId = null;
  downloadModal?.close();
}

function openDownloadModal(studentId) {
  const student = getStudent(studentId);
  if (!student || !downloadModal) return;

  downloadTargetStudentId = studentId;
  document.getElementById("downloadStudentName").textContent = `${student.name} Feedback`;
  downloadForm.reset();
  downloadModal.showModal();
}

async function downloadStudentReportByFormat(studentId, format, range) {
  const student = getStudent(studentId);
  if (!student) return;

  const allSessions = getSessionsForStudent(studentId);
  const allFeedback = getFeedbackForStudent(studentId);
  const sessions = filterSessionsBySessionRange(allSessions, range);
  const feedbackItems = filterFeedbackBySessionRange(allFeedback, range);
  const hasRange = Boolean(range?.from !== null || range?.to !== null);

  if (feedbackItems.length === 0) {
    const rangeText = range?.from || range?.to ? ` in sessions ${range.from ?? "start"} to ${range.to ?? "end"}` : "";
    const ok = confirm(`No feedback rows found${rangeText}. Download using schedule data only?`);
    if (!ok) return;
  }

  const payload = {
    studentName: student.name,
    student,
    course: sessions[0]?.course || feedbackItems[0]?.course || allSessions[0]?.course || allFeedback[0]?.course || "General",
    sessions: hasRange ? sessions : allSessions,
    feedbackItems,
    selectedRange: range,
  };

  if (format === "json") {
    window.EdubiaReport.downloadStudentReportJson(payload);
  } else {
    await window.EdubiaReport.downloadStudentReport(payload);
  }
}

function sessionPrice(session) {
  return PRICE[session.type] || 0;
}

function studentWeeklyTotal(studentId) {
  return getSessionsForStudent(studentId).reduce((sum, session) => sum + sessionPrice(session), 0);
}

function isSlotTaken(day, hour) {
  return state.sessions.some(session => session.day === day && Number(session.hour) === Number(hour));
}

function getUnavailableSlot(day, hour) {
  return (state.unavailableSlots || []).find(slot => slot.day === day && Number(slot.hour) === Number(hour));
}

function isSlotUnavailable(day, hour) {
  return Boolean(getUnavailableSlot(day, hour));
}

function isSlotBusy(day, hour) {
  return isSlotTaken(day, hour) || isSlotUnavailable(day, hour);
}

function getAvailableHours(day) {
  return HOURS.filter(hour => !isSlotBusy(day, hour));
}

async function markSlotUnavailable(day, hour) {
  if (isSlotTaken(day, hour)) {
    alert("This slot already has a session, so it is already busy.");
    return;
  }

  const { error } = await client
    .from("unavailable_slots")
    .upsert({ day, hour }, { onConflict: "day,hour" });

  if (error) {
    console.error(error);
    alert("Could not mark this slot unavailable. Run database_update_existing_supabase.sql in Supabase first.");
    return;
  }

  await refreshData();
}

async function markSlotAvailable(day, hour) {
  const { error } = await client
    .from("unavailable_slots")
    .delete()
    .eq("day", day)
    .eq("hour", Number(hour));

  if (error) {
    console.error(error);
    alert("Could not make this slot available again. Check Supabase settings.");
    return;
  }

  await refreshData();
}

function fillScoreSelects() {
  const scoreIds = [
    "commitmentScore",
    "understandingScore",
    "problemSolvingScore",
    "practicalScore",
    "exerciseScore",
    "participationScore",
  ];

  const options = [5, 4, 3, 2, 1].map(score => `<option value="${score}">${score}</option>`).join("");
  scoreIds.forEach(id => {
    document.getElementById(id).innerHTML = options;
  });
}

function buildDayOptions(selectedDay = "") {
  return DAYS.map(day => `<option value="${day}"${day === selectedDay ? " selected" : ""}>${day}</option>`).join("");
}

function initSelects() {
  sessionDay.innerHTML = buildDayOptions();

  const editDaySelect = document.getElementById("editSessionDay");
  if (editDaySelect) {
    editDaySelect.innerHTML = buildDayOptions();
  }

  fillScoreSelects();
  updateAvailableTimeOptions();
}

function updateAvailableTimeOptions(preferredHour = null) {
  const selectedDay = sessionDay.value || DAYS[0];
  let available = getAvailableHours(selectedDay);

  if (preferredHour !== null && !available.includes(Number(preferredHour))) {
    available = [Number(preferredHour), ...available];
  }

  if (available.length === 0) {
    sessionHour.innerHTML = `<option value="">No available time</option>`;
    sessionHour.disabled = true;
    return;
  }

  sessionHour.disabled = false;
  sessionHour.innerHTML = available.map(hour => `<option value="${hour}">${formatHour(hour)}</option>`).join("");

  if (preferredHour !== null && available.includes(Number(preferredHour))) {
    sessionHour.value = String(preferredHour);
  }
}

function isHourAvailableForEdit(day, hour, sessionId) {
  const session = getSessionById(sessionId);
  const isCurrentSlot = session && session.day === day && Number(session.hour) === Number(hour);

  if (isCurrentSlot) return true;

  const takenByAnotherSession = state.sessions.some(item =>
    String(item.id) !== String(sessionId) &&
    item.day === day &&
    Number(item.hour) === Number(hour)
  );

  return !takenByAnotherSession && !isSlotUnavailable(day, hour);
}

function getAvailableHoursForEdit(day, sessionId) {
  return HOURS.filter(hour => isHourAvailableForEdit(day, hour, sessionId));
}

function getEditHourOptionState(day, hour, sessionId) {
  const session = getSessionById(sessionId);
  const isCurrentSlot = session && session.day === day && Number(session.hour) === Number(hour);

  if (isCurrentSlot) {
    return { disabled: false, suffix: "Current" };
  }

  const takenByAnotherSession = state.sessions.some(item =>
    String(item.id) !== String(sessionId) &&
    item.day === day &&
    Number(item.hour) === Number(hour)
  );

  if (takenByAnotherSession) {
    return { disabled: true, suffix: "Busy" };
  }

  if (isSlotUnavailable(day, hour)) {
    return { disabled: true, suffix: "Unavailable" };
  }

  return { disabled: false, suffix: "Free" };
}

function updateEditSessionTimeOptions(preferredHour = null) {
  const editDaySelect = document.getElementById("editSessionDay");
  const editHourSelect = document.getElementById("editSessionHour");
  if (!editDaySelect || !editHourSelect || !editingSessionId) return;

  const session = getSessionById(editingSessionId);
  const selectedDay = editDaySelect.value || session?.day || DAYS[0];
  const preferred = preferredHour !== null ? Number(preferredHour) : null;

  editDaySelect.innerHTML = buildDayOptions(selectedDay);
  editHourSelect.disabled = false;
  editHourSelect.innerHTML = HOURS.map(hour => {
    const optionState = getEditHourOptionState(selectedDay, hour, editingSessionId);
    const disabledAttr = optionState.disabled ? " disabled" : "";
    const selectedAttr = preferred !== null && Number(hour) === preferred ? " selected" : "";
    return `<option value="${hour}"${disabledAttr}${selectedAttr}>${formatHour(hour)} - ${optionState.suffix}</option>`;
  }).join("");

  if (preferred !== null && isHourAvailableForEdit(selectedDay, preferred, editingSessionId)) {
    editHourSelect.value = String(preferred);
    return;
  }

  const firstAvailableHour = HOURS.find(hour => isHourAvailableForEdit(selectedDay, hour, editingSessionId));
  if (firstAvailableHour !== undefined) {
    editHourSelect.value = String(firstAvailableHour);
  }
}

async function refreshData(options = {}) {
  if (!options.skipCleanup) {
    await cleanupExpiredTemporarySessions();
  }

  const [studentsResult, sessionsResult, feedbackResult, unavailableResult] = await Promise.all([
    client.from("students").select("*").order("created_at", { ascending: true }),
    client.from("sessions").select("*").order("created_at", { ascending: true }),
    client.from("feedback").select("*").order("created_at", { ascending: false }),
    client.from("unavailable_slots").select("*").order("created_at", { ascending: true }),
  ]);

  if (studentsResult.error || sessionsResult.error || feedbackResult.error || unavailableResult.error) {
    alert("Could not load data. Make sure you are logged in and database_update_existing_supabase.sql was run in Supabase.");
    console.error(studentsResult.error || sessionsResult.error || feedbackResult.error || unavailableResult.error);
    return;
  }

  state.students = studentsResult.data || [];
  state.sessions = (sessionsResult.data || []).filter(session => !isTemporarySessionExpired(session));
  state.feedback = feedbackResult.data || [];
  state.unavailableSlots = unavailableResult.data || [];

  renderAll();
}

async function renderAuth() {
  if (authRenderPromise) return authRenderPromise;

  authRenderPromise = (async () => {
    const { data } = await client.auth.getSession();
    const loggedIn = Boolean(data.session);

    document.getElementById("loginPanel").classList.toggle("hidden", loggedIn);
    document.getElementById("adminContent").classList.toggle("hidden", !loggedIn);
    document.getElementById("adminActions").classList.toggle("hidden", !loggedIn);

    const coordinatorLink = getCoordinatorLink();
    const coordinatorLinkEl = document.getElementById("coordinatorLinkText");
    coordinatorLinkEl.textContent = coordinatorLink;
    coordinatorLinkEl.href = coordinatorLink;

    if (loggedIn) {
      startCleanupTimer();
      await refreshData();
    } else {
      stopCleanupTimer();
    }
  })();

  try {
    return await authRenderPromise;
  } finally {
    authRenderPromise = null;
  }
}

function renderStats() {
  const weekly = state.sessions.reduce((sum, session) => sum + sessionPrice(session), 0);
  const paid = state.sessions.filter(s => s.type === "paid").length;
  const cover = state.sessions.filter(s => s.type === "cover").length;
  const free = state.sessions.filter(s => s.type === "free").length;

  document.getElementById("weeklyTotal").textContent = `${weekly} LE`;
  document.getElementById("monthlyTotal").textContent = `${weekly * 4} LE`;
  document.getElementById("sessionCounts").textContent = `${paid} / ${cover} / ${free}`;
  document.getElementById("studentCount").textContent = state.students.length;
}

function renderSchedule() {
  const search = studentSearch.value.trim().toLowerCase();

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
      const sessions = state.sessions.filter(session => session.day === day && Number(session.hour) === hour);
      html += `<td>`;

      if (sessions.length === 0) {
        if (isSlotUnavailable(day, hour)) {
          html += `
            <div class="unavailable-slot" data-day="${day}" data-hour="${hour}">
              <span>Unavailable</span>
              <button type="button" class="slot-action-btn available-toggle" data-day="${day}" data-hour="${hour}">Make available</button>
            </div>
          `;
        } else {
          html += `
            <div class="empty-slot" data-day="${day}" data-hour="${hour}">
              <span>Available</span>
              <button type="button" class="slot-action-btn busy-toggle" data-day="${day}" data-hour="${hour}">Busy</button>
            </div>
          `;
        }
      } else {
        for (const session of sessions) {
          const student = getStudent(session.student_id);
          if (!student) continue;

          const matchesSearch = !search ||
            student.name.toLowerCase().includes(search) ||
            session.course.toLowerCase().includes(search);

          if (!matchesSearch) continue;

          html += `
            <button class="session-card type-${session.type}" data-session-id="${session.id}" data-student-id="${student.id}" title="Click to edit this session">
              <strong>${student.name}</strong>
              <span>${session.course} · Session ${session.current_session}</span>
              <span>${TYPE_LABELS[session.type]} · ${sessionPrice(session)} LE</span>
              <em>Edit</em>
            </button>
          `;
        }
      }

      html += `</td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody>`;
  scheduleTable.innerHTML = html;

  document.querySelectorAll(".empty-slot").forEach(slot => {
    slot.addEventListener("click", event => {
      if (event.target.closest(".busy-toggle")) return;
      openAddStudentModal({
        day: slot.dataset.day,
        hour: Number(slot.dataset.hour),
      });
    });
  });

  document.querySelectorAll(".busy-toggle").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      markSlotUnavailable(btn.dataset.day, Number(btn.dataset.hour));
    });
  });

  document.querySelectorAll(".available-toggle").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      markSlotAvailable(btn.dataset.day, Number(btn.dataset.hour));
    });
  });

  document.querySelectorAll(".session-card").forEach(card => {
    card.addEventListener("click", () => openEditSession(card.dataset.sessionId));
  });
}

function renderStudents() {
  if (state.students.length === 0) {
    studentsTableBody.innerHTML = `<tr><td colspan="7">No students yet. Click Add Student to start.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = state.students.map(student => {
    const sessions = getSessionsForStudent(student.id);
    const courses = [...new Set(sessions.map(s => s.course))].join(", ") || "-";
    const weekly = studentWeeklyTotal(student.id);

    return `
      <tr>
        <td><strong>${student.name}</strong></td>
        <td>${student.age || "-"}</td>
        <td>${student.nationality || "-"}</td>
        <td>${courses}</td>
        <td>${sessions.length}</td>
        <td>${weekly} LE</td>
        <td class="actions-cell">
          <button class="small-btn" data-view-student="${student.id}">View</button>
          <button class="feedback-btn" data-feedback-student="${student.id}">Feedback</button>
          <button class="download-report-btn" data-download-student="${student.id}">Download Feedback</button>
          <button class="danger-btn" data-delete-student="${student.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll("[data-view-student]").forEach(btn => {
    btn.addEventListener("click", () => openDetails(btn.dataset.viewStudent));
  });

  document.querySelectorAll("[data-feedback-student]").forEach(btn => {
    btn.addEventListener("click", () => openFeedback(btn.dataset.feedbackStudent));
  });

  document.querySelectorAll("[data-download-student]").forEach(btn => {
    btn.addEventListener("click", () => openDownloadModal(btn.dataset.downloadStudent));
  });

  document.querySelectorAll("[data-delete-student]").forEach(btn => {
    btn.addEventListener("click", () => deleteStudent(btn.dataset.deleteStudent));
  });
}

async function deleteStudent(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  const ok = confirm(`Delete ${student.name} completely? This will delete all sessions and all feedback for this student.`);
  if (!ok) return;

  try {
    const feedbackDelete = await client.from("feedback").delete().eq("student_id", studentId);
    if (feedbackDelete.error) throw feedbackDelete.error;

    const sessionsDelete = await client.from("sessions").delete().eq("student_id", studentId);
    if (sessionsDelete.error) throw sessionsDelete.error;

    const studentDelete = await client.from("students").delete().eq("id", studentId);
    if (studentDelete.error) throw studentDelete.error;

    if (String(selectedStudentId) === String(studentId)) closeDetails();
    if (String(feedbackStudentId) === String(studentId)) closeFeedback();

    await refreshData();
  } catch (error) {
    console.error(error);
    alert("Could not delete the student. Check Supabase policies and try again.");
  }
}

function renderAll() {
  renderStats();
  renderSchedule();
  renderStudents();

  if (selectedStudentId) renderDetails(selectedStudentId);
  if (feedbackStudentId) renderFeedback(feedbackStudentId);
}

function openAddStudentModal(options = {}) {
  prefillStudentId = options.studentId || null;

  document.getElementById("studentModalTitle").textContent = prefillStudentId ? "Add Session" : "Add Student";
  studentForm.reset();
  customCourseLabel.classList.add("hidden");

  if (options.day) sessionDay.value = options.day;

  updateAvailableTimeOptions(options.hour ?? null);

  if (prefillStudentId) {
    const student = getStudent(prefillStudentId);
    document.getElementById("studentName").value = student?.name || "";
    document.getElementById("studentName").readOnly = true;
    document.getElementById("studentAge").value = student?.age || "";
    document.getElementById("studentNationality").value = student?.nationality || "";
  } else {
    document.getElementById("studentName").readOnly = false;
  }

  studentModal.showModal();
}

function closeAddStudentModal() {
  studentModal.close();
  prefillStudentId = null;
  document.getElementById("studentName").readOnly = false;
}

async function upsertStudentFromForm() {
  const name = document.getElementById("studentName").value.trim();
  const ageRaw = document.getElementById("studentAge").value.trim();
  const nationality = document.getElementById("studentNationality").value.trim();

  const age = ageRaw ? Number(ageRaw) : null;

  if (prefillStudentId) {
    const student = getStudent(prefillStudentId);
    if (student) {
      const { error } = await client
        .from("students")
        .update({ age, nationality })
        .eq("id", student.id);

      if (error) throw error;
      return student.id;
    }
  }

  const existing = state.students.find(s => s.name.trim().toLowerCase() === name.toLowerCase());

  if (existing) {
    const { error } = await client
      .from("students")
      .update({ age: age ?? existing.age, nationality: nationality || existing.nationality })
      .eq("id", existing.id);

    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await client
    .from("students")
    .insert({ name, age, nationality })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

async function handleStudentFormSubmit(event) {
  event.preventDefault();

  const selectedCourse = studentCourse.value;
  const course = selectedCourse === "Other" ? customCourse.value.trim() : selectedCourse;
  const type = document.getElementById("sessionType").value;
  const day = sessionDay.value;
  const hour = Number(sessionHour.value);
  const currentSession = document.getElementById("currentSession").value.trim();

  if (!course) {
    alert("Please write or select a course name.");
    return;
  }

  if (!hour) {
    alert("No available time selected. Please choose another day.");
    return;
  }

  if (isSlotBusy(day, hour)) {
    alert("This time is already busy or unavailable. Please choose another available time.");
    updateAvailableTimeOptions();
    return;
  }

  try {
    const studentId = await upsertStudentFromForm();

    const { session_date, expires_at } = getSessionDateAndExpiry(type, day, hour);

    const { error } = await client.from("sessions").insert({
      student_id: studentId,
      day,
      hour,
      course,
      current_session: currentSession,
      type,
      session_date,
      expires_at,
    });

    if (error) throw error;

    closeAddStudentModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    alert("Could not save. Please check Supabase settings.");
  }
}

function openDetails(studentId) {
  selectedStudentId = studentId;
  renderDetails(studentId);
  detailsModal.showModal();
}

function renderDetails(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  const sessions = getSessionsForStudent(studentId);
  const weekly = studentWeeklyTotal(studentId);

  document.getElementById("detailsName").textContent = student.name;
  document.getElementById("detailsAge").textContent = student.age || "-";
  document.getElementById("detailsNationality").textContent = student.nationality || "-";
  document.getElementById("detailsWeekly").textContent = `${weekly} LE`;
  document.getElementById("detailsMonthly").textContent = `${weekly * 4} LE`;

  const body = document.getElementById("detailsSessionsBody");

  if (sessions.length === 0) {
    body.innerHTML = `<tr><td colspan="7">No sessions saved for this student.</td></tr>`;
    return;
  }

  body.innerHTML = sessions.map(session => `
    <tr>
      <td>${session.course}</td>
      <td>Session ${session.current_session}</td>
      <td>${session.day}</td>
      <td>${formatHour(Number(session.hour))}</td>
      <td>${TYPE_LABELS[session.type]}</td>
      <td>${sessionPrice(session)} LE</td>
      <td class="actions-cell">
        <button class="small-btn" data-edit-session="${session.id}">Edit</button>
        <button class="danger-btn" data-delete-session="${session.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-edit-session]").forEach(btn => {
    btn.addEventListener("click", () => openEditSession(btn.dataset.editSession));
  });

  document.querySelectorAll("[data-delete-session]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = confirm("Delete this session?");
      if (!ok) return;

      const { error } = await client.from("sessions").delete().eq("id", btn.dataset.deleteSession);
      if (error) {
        alert("Could not delete session.");
        return;
      }

      await refreshData();
    });
  });
}

function openEditSession(sessionId) {
  const session = getSessionById(sessionId);
  if (!session || !editSessionModal) return;

  const student = getStudent(session.student_id);
  editingSessionId = session.id;

  document.getElementById("editSessionStudentName").textContent = student?.name || "Edit Session";
  document.getElementById("editSessionMeta").textContent = `Current: ${session.day} · ${formatHour(Number(session.hour))}`;
  document.getElementById("editSessionNumber").value = session.current_session || "";
  document.getElementById("editSessionCourse").value = session.course || "";
  document.getElementById("editSessionType").value = session.type || "paid";

  const editDaySelect = document.getElementById("editSessionDay");
  editDaySelect.innerHTML = buildDayOptions(session.day);
  editDaySelect.value = session.day;
  updateEditSessionTimeOptions(Number(session.hour));

  editSessionModal.showModal();
}

function closeEditSession() {
  editingSessionId = null;
  editSessionModal?.close();
}

async function handleEditSessionSubmit(event) {
  event.preventDefault();
  if (!editingSessionId) return;

  const session = getSessionById(editingSessionId);
  if (!session) return;

  const course = document.getElementById("editSessionCourse").value.trim();
  const type = document.getElementById("editSessionType").value;
  const currentSession = document.getElementById("editSessionNumber").value.trim();
  const day = document.getElementById("editSessionDay").value;
  const hour = Number(document.getElementById("editSessionHour").value);

  if (!course || !currentSession) {
    alert("Please fill course and session number.");
    return;
  }

  if (!day || !hour) {
    alert("Please choose an available day and time.");
    return;
  }

  if (!isHourAvailableForEdit(day, hour, editingSessionId)) {
    alert("This time is already busy or unavailable. Please choose another time.");
    updateEditSessionTimeOptions();
    return;
  }

  const expiryData = getSessionDateAndExpiry(type, day, hour);

  const { error } = await client
    .from("sessions")
    .update({
      day,
      hour,
      course,
      type,
      current_session: currentSession,
      session_date: expiryData.session_date,
      expires_at: expiryData.expires_at,
    })
    .eq("id", editingSessionId);

  if (error) {
    console.error(error);
    alert("Could not update this session. Check Supabase settings.");
    return;
  }

  closeEditSession();
  await refreshData();
}

function closeDetails() {
  selectedStudentId = null;
  detailsModal.close();
}

function openFeedback(studentId) {
  feedbackStudentId = studentId;
  selectedFeedbackSessionKey = "all";
  resetFeedbackEditState();
  renderFeedback(studentId);
  feedbackModal.showModal();
}

function renderFeedback(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  document.getElementById("feedbackStudentName").textContent = `${student.name} Feedback`;
  document.getElementById("feedbackDate").value = todayISO();

  const sessions = getSessionsForStudent(studentId);
  const feedbackItemsForCourses = getFeedbackForStudent(studentId);
  const courseOptions = [...new Set([
    ...sessions.map(s => s.course),
    ...feedbackItemsForCourses.map(item => item.course),
  ].filter(Boolean))];

  document.getElementById("feedbackCourse").innerHTML =
    courseOptions.length
      ? courseOptions.map(course => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join("")
      : `<option value="General">General</option>`;

  renderFeedbackSessionPicker(studentId);
  renderFeedbackCards(studentId);
}

function getFeedbackSessionOptions(studentId) {
  const sessions = getSessionsForStudent(studentId).map(session => ({
    key: sessionKeyFromValue(session.current_session),
    label: sessionLabelFromValue(session.current_session),
    value: session.current_session,
    course: session.course,
    source: "schedule",
  }));

  const feedbackItems = getFeedbackForStudent(studentId).map(item => ({
    key: sessionKeyFromValue(item.session_number),
    label: sessionLabelFromValue(item.session_number),
    value: item.session_number,
    course: item.course,
    source: "feedback",
  }));

  const byKey = new Map();
  [...sessions, ...feedbackItems].forEach(option => {
    if (!byKey.has(option.key)) byKey.set(option.key, option);
  });

  return [...byKey.values()].sort((a, b) => {
    const an = extractSessionNumber(a.value);
    const bn = extractSessionNumber(b.value);
    if (an !== null && bn !== null) return an - bn;
    return a.label.localeCompare(b.label);
  });
}

function renderFeedbackSessionPicker(studentId) {
  const picker = document.getElementById("feedbackSessionPicker");
  if (!picker) return;

  const options = getFeedbackSessionOptions(studentId);
  if (selectedFeedbackSessionKey !== "all" && !options.some(option => option.key === selectedFeedbackSessionKey)) {
    selectedFeedbackSessionKey = "all";
  }

  picker.innerHTML = `
    <button type="button" class="feedback-session-pill ${selectedFeedbackSessionKey === "all" ? "active" : ""}" data-feedback-session-key="all">
      All feedback
    </button>
    ${options.map(option => `
      <button type="button" class="feedback-session-pill ${selectedFeedbackSessionKey === option.key ? "active" : ""}" data-feedback-session-key="${escapeHtml(option.key)}" data-feedback-session-value="${escapeHtml(option.value)}" data-feedback-session-course="${escapeHtml(option.course || "")}">
        ${escapeHtml(option.label)}
        <small>${escapeHtml(option.course || "")}</small>
      </button>
    `).join("")}
  `;

  picker.querySelectorAll("[data-feedback-session-key]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFeedbackSessionKey = btn.dataset.feedbackSessionKey;
      if (selectedFeedbackSessionKey !== "all") {
        document.getElementById("feedbackSessionNumber").value = btn.dataset.feedbackSessionValue || "";
        if (btn.dataset.feedbackSessionCourse) document.getElementById("feedbackCourse").value = btn.dataset.feedbackSessionCourse;
      }
      renderFeedback(studentId);
    });
  });
}

function getVisibleFeedbackItems(studentId) {
  const feedbackItems = getFeedbackForStudent(studentId);
  if (selectedFeedbackSessionKey === "all") return feedbackItems;
  return feedbackItems.filter(item => sessionKeyFromValue(item.session_number) === selectedFeedbackSessionKey);
}

function scoreBadge(value) {
  return `<span class="score-badge">${value ?? "-"}/5</span>`;
}

function renderFeedbackCards(studentId) {
  const body = document.getElementById("feedbackCards");
  if (!body) return;

  const feedbackItems = getVisibleFeedbackItems(studentId);
  const emptyText = selectedFeedbackSessionKey === "all"
    ? "No feedback saved yet."
    : "No feedback saved for this selected session yet.";

  if (feedbackItems.length === 0) {
    body.innerHTML = `<div class="empty-feedback-state">${emptyText}</div>`;
    return;
  }

  body.innerHTML = feedbackItems.map(item => `
    <article class="feedback-review-card">
      <div class="feedback-review-head">
        <div>
          <strong>${escapeHtml(sessionLabelFromValue(item.session_number))}</strong>
          <span>${escapeHtml(item.course || "General")} · ${escapeHtml(item.lesson_title || "No lesson title")}</span>
        </div>
        <div class="feedback-review-actions">
          <button type="button" class="small-btn" data-edit-feedback="${item.id}">Edit</button>
          <button type="button" class="danger-btn" data-delete-feedback="${item.id}">Delete</button>
        </div>
      </div>

      <div class="feedback-meta-grid">
        <span><b>Date</b>${escapeHtml(item.date || "-")}</span>
        <span><b>Attendance</b>${escapeHtml(item.attendance || "-")}</span>
        <span><b>Homework</b>${escapeHtml(item.has_homework || "-")}</span>
        <span><b>Previous HW</b>${escapeHtml(item.previous_homework || "-")}</span>
      </div>

      <div class="feedback-score-grid">
        <span>Commitment ${scoreBadge(item.commitment_score)}</span>
        <span>Understanding ${scoreBadge(item.understanding_score)}</span>
        <span>Problem Solving ${scoreBadge(item.problem_solving_score)}</span>
        <span>Practical ${scoreBadge(item.practical_score)}</span>
        <span>Exercises ${scoreBadge(item.exercise_score)}</span>
        <span>Participation ${scoreBadge(item.participation_score)}</span>
      </div>

      <div class="feedback-text-grid">
        <section><b>What was explained</b><p>${escapeHtml(item.explained || "-")}</p></section>
        <section><b>Strengths</b><p>${escapeHtml(item.strengths || "-")}</p></section>
        <section><b>Improvement areas</b><p>${escapeHtml(item.improvement_areas || "-")}</p></section>
      </div>
    </article>
  `).join("");

  body.querySelectorAll("[data-edit-feedback]").forEach(btn => {
    btn.addEventListener("click", () => startEditFeedback(btn.dataset.editFeedback));
  });

  body.querySelectorAll("[data-delete-feedback]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = confirm("Delete this feedback row?");
      if (!ok) return;

      const { error } = await client.from("feedback").delete().eq("id", btn.dataset.deleteFeedback);
      if (error) {
        alert("Could not delete feedback.");
        return;
      }

      await refreshData();
      renderFeedback(feedbackStudentId);
    });
  });
}

function startEditFeedback(feedbackId) {
  const item = getFeedbackById(feedbackId);
  if (!item) return;

  editingFeedbackId = item.id;
  document.getElementById("feedbackFormTitle").textContent = "Edit feedback";
  document.getElementById("feedbackSubmitBtn").textContent = "Update Feedback";
  document.getElementById("cancelFeedbackEditBtn").classList.remove("hidden");

  document.getElementById("feedbackDate").value = item.date || todayISO();
  document.getElementById("feedbackCourse").value = item.course || "General";
  document.getElementById("feedbackSessionNumber").value = item.session_number || "";
  document.getElementById("lessonTitle").value = item.lesson_title || "";
  document.getElementById("attendance").value = item.attendance || "Present";
  document.getElementById("commitmentScore").value = String(item.commitment_score ?? 5);
  document.getElementById("understandingScore").value = String(item.understanding_score ?? 5);
  document.getElementById("problemSolvingScore").value = String(item.problem_solving_score ?? 5);
  document.getElementById("practicalScore").value = String(item.practical_score ?? 5);
  document.getElementById("exerciseScore").value = String(item.exercise_score ?? 5);
  document.getElementById("participationScore").value = String(item.participation_score ?? 5);
  document.getElementById("hasHomework").value = item.has_homework || "Yes";
  document.getElementById("previousHomework").value = item.previous_homework || "Submitted";
  document.getElementById("explained").value = item.explained || "";
  document.getElementById("strengths").value = item.strengths || "";
  document.getElementById("improvementAreas").value = item.improvement_areas || "";

  feedbackForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetFeedbackEditState() {
  editingFeedbackId = null;
  document.getElementById("feedbackFormTitle").textContent = "Add feedback";
  document.getElementById("feedbackSubmitBtn").textContent = "Save Feedback";
  document.getElementById("cancelFeedbackEditBtn").classList.add("hidden");
}

async function handleFeedbackSubmit(event) {
  event.preventDefault();

  if (!feedbackStudentId) return;

  const feedbackRow = {
    student_id: feedbackStudentId,
    date: document.getElementById("feedbackDate").value,
    course: document.getElementById("feedbackCourse").value,
    session_number: document.getElementById("feedbackSessionNumber").value.trim(),
    lesson_title: document.getElementById("lessonTitle").value.trim(),
    attendance: document.getElementById("attendance").value,
    commitment_score: Number(document.getElementById("commitmentScore").value),
    understanding_score: Number(document.getElementById("understandingScore").value),
    problem_solving_score: Number(document.getElementById("problemSolvingScore").value),
    practical_score: Number(document.getElementById("practicalScore").value),
    exercise_score: Number(document.getElementById("exerciseScore").value),
    participation_score: Number(document.getElementById("participationScore").value),
    has_homework: document.getElementById("hasHomework").value,
    previous_homework: document.getElementById("previousHomework").value,
    explained: document.getElementById("explained").value.trim(),
    strengths: document.getElementById("strengths").value.trim(),
    improvement_areas: document.getElementById("improvementAreas").value.trim(),
  };

  const result = editingFeedbackId
    ? await client.from("feedback").update(feedbackRow).eq("id", editingFeedbackId)
    : await client.from("feedback").insert(feedbackRow);

  if (result.error) {
    console.error(result.error);
    alert(editingFeedbackId ? "Could not update feedback." : "Could not save feedback.");
    return;
  }

  feedbackForm.reset();
  resetFeedbackEditState();
  await refreshData();
  renderFeedback(feedbackStudentId);
}

function closeFeedback() {
  feedbackStudentId = null;
  selectedFeedbackSessionKey = "all";
  resetFeedbackEditState();
  feedbackModal.close();
}

async function downloadStudentReportById(studentId) {
  await downloadStudentReportByFormat(studentId, "pdf", { from: null, to: null });
}

async function login(email, password) {
  const loginButton = document.querySelector('#loginForm button[type="submit"]');
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const { error } = await client.auth.signInWithPassword({ email, password });

  loginButton.disabled = false;
  loginButton.textContent = "Login";

  if (error) {
    alert(error.message);
    return;
  }

  await renderAuth();
}

async function signup(email, password) {
  const { error } = await client.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
    return;
  }

  alert("Admin account created. If email confirmation is enabled in Supabase, confirm the email first, then login.");
}

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  await login(
    document.getElementById("loginEmail").value.trim(),
    document.getElementById("loginPassword").value
  );
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  await signup(
    document.getElementById("loginEmail").value.trim(),
    document.getElementById("loginPassword").value
  );
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await client.auth.signOut();
  state = { students: [], sessions: [], feedback: [], unavailableSlots: [] };
  await renderAuth();
});

document.getElementById("openCoordinatorBtn").addEventListener("click", () => {
  const link = getCoordinatorLink();
  const opened = window.open(link, "_blank", "noopener");
  if (!opened) window.location.href = link;
});

document.getElementById("copyCoordinatorBtn").addEventListener("click", async () => {
  const link = getCoordinatorLink();
  await navigator.clipboard.writeText(link);
  alert("Coordinator link copied.");
});

document.getElementById("openAddStudentBtn").addEventListener("click", () => openAddStudentModal());
document.getElementById("closeStudentModal").addEventListener("click", closeAddStudentModal);
document.getElementById("closeDetailsModal").addEventListener("click", closeDetails);
document.getElementById("closeFeedbackModal").addEventListener("click", closeFeedback);

document.getElementById("resetFormBtn").addEventListener("click", () => {
  studentForm.reset();
  updateAvailableTimeOptions();
});

document.getElementById("addSessionToStudentBtn").addEventListener("click", () => {
  if (!selectedStudentId) return;
  detailsModal.close();
  openAddStudentModal({ studentId: selectedStudentId });
});

document.getElementById("openFeedbackFromDetailsBtn").addEventListener("click", () => {
  if (!selectedStudentId) return;
  detailsModal.close();
  openFeedback(selectedStudentId);
});

document.getElementById("deleteStudentFromDetailsBtn").addEventListener("click", () => {
  if (!selectedStudentId) return;
  deleteStudent(selectedStudentId);
});


document.getElementById("closeEditSessionModal")?.addEventListener("click", closeEditSession);
document.getElementById("cancelEditSessionBtn")?.addEventListener("click", closeEditSession);
document.getElementById("editSessionDay")?.addEventListener("change", () => updateEditSessionTimeOptions());
editSessionForm?.addEventListener("submit", handleEditSessionSubmit);

document.getElementById("cancelFeedbackEditBtn")?.addEventListener("click", () => {
  feedbackForm.reset();
  resetFeedbackEditState();
  document.getElementById("feedbackDate").value = todayISO();
});

studentCourse.addEventListener("change", () => {
  customCourseLabel.classList.toggle("hidden", studentCourse.value !== "Other");
});

sessionDay.addEventListener("change", () => updateAvailableTimeOptions());
studentSearch.addEventListener("input", renderSchedule);
studentForm.addEventListener("submit", handleStudentFormSubmit);
feedbackForm.addEventListener("submit", handleFeedbackSubmit);

downloadForm?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!downloadTargetStudentId) return;

  const submitter = event.submitter;
  const format = submitter?.dataset?.format || "pdf";
  const range = normalizeSessionRange(
    document.getElementById("downloadFromSession").value.trim(),
    document.getElementById("downloadToSession").value.trim()
  );
  if (!range) return;

  await downloadStudentReportByFormat(downloadTargetStudentId, format, range);
  closeDownloadModal();
});

document.getElementById("closeDownloadModal")?.addEventListener("click", closeDownloadModal);

client.auth.onAuthStateChange(() => {
  // Supabase can hang if async Supabase calls run directly inside this callback.
  // Deferring renderAuth keeps login stable after refresh/re-open on Vercel.
  setTimeout(() => {
    renderAuth();
  }, 0);
});

if (checkConfig()) {
  initSelects();
  renderAuth();
}
