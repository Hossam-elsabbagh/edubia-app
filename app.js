const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [14, 15, 16, 17, 18, 19, 20, 21, 22];

const PRICE = { paid: 150, cover: 150, free: 100 };
const TYPE_LABELS = { paid: "Paid", cover: "Cover", free: "Free" };

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let state = { students: [], sessions: [], feedback: [] };
let selectedStudentId = null;
let feedbackStudentId = null;
let prefillStudentId = null;

const scheduleTable = document.getElementById("scheduleTable");
const studentsTableBody = document.getElementById("studentsTableBody");
const studentModal = document.getElementById("studentModal");
const detailsModal = document.getElementById("detailsModal");
const feedbackModal = document.getElementById("feedbackModal");
const studentForm = document.getElementById("studentForm");
const feedbackForm = document.getElementById("feedbackForm");
const sessionDay = document.getElementById("sessionDay");
const sessionHour = document.getElementById("sessionHour");
const studentCourse = document.getElementById("studentCourse");
const customCourseLabel = document.getElementById("customCourseLabel");
const customCourse = document.getElementById("customCourse");
const studentSearch = document.getElementById("studentSearch");

function checkConfig() {
  if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_KEY.includes("PASTE_")) {
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

function sessionPrice(session) {
  return PRICE[session.type] || 0;
}

function studentWeeklyTotal(studentId) {
  return getSessionsForStudent(studentId).reduce((sum, session) => sum + sessionPrice(session), 0);
}

function isSlotTaken(day, hour) {
  return state.sessions.some(session => session.day === day && Number(session.hour) === Number(hour));
}

function getAvailableHours(day) {
  return HOURS.filter(hour => !isSlotTaken(day, hour));
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

function initSelects() {
  sessionDay.innerHTML = DAYS.map(day => `<option value="${day}">${day}</option>`).join("");
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

async function refreshData() {
  const [studentsResult, sessionsResult, feedbackResult] = await Promise.all([
    client.from("students").select("*").order("created_at", { ascending: true }),
    client.from("sessions").select("*").order("created_at", { ascending: true }),
    client.from("feedback").select("*").order("created_at", { ascending: false }),
  ]);

  if (studentsResult.error || sessionsResult.error || feedbackResult.error) {
    alert("Could not load data. Make sure you are logged in and database.sql was run in Supabase.");
    console.error(studentsResult.error || sessionsResult.error || feedbackResult.error);
    return;
  }

  state.students = studentsResult.data || [];
  state.sessions = sessionsResult.data || [];
  state.feedback = feedbackResult.data || [];

  renderAll();
}

async function renderAuth() {
  const { data } = await client.auth.getSession();
  const loggedIn = Boolean(data.session);

  document.getElementById("loginPanel").classList.toggle("hidden", loggedIn);
  document.getElementById("adminContent").classList.toggle("hidden", !loggedIn);
  document.getElementById("adminActions").classList.toggle("hidden", !loggedIn);

  document.getElementById("coordinatorLinkText").textContent = getCoordinatorLink();

  if (loggedIn) {
    await refreshData();
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
        html += `<div class="empty-slot" data-day="${day}" data-hour="${hour}">Available</div>`;
      } else {
        for (const session of sessions) {
          const student = getStudent(session.student_id);
          if (!student) continue;

          const matchesSearch = !search ||
            student.name.toLowerCase().includes(search) ||
            session.course.toLowerCase().includes(search);

          if (!matchesSearch) continue;

          html += `
            <button class="session-card type-${session.type}" data-student-id="${student.id}">
              <strong>${student.name}</strong>
              <span>${session.course} · Session ${session.current_session}</span>
              <span>${TYPE_LABELS[session.type]} · ${sessionPrice(session)} LE</span>
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
    slot.addEventListener("click", () => {
      openAddStudentModal({
        day: slot.dataset.day,
        hour: Number(slot.dataset.hour),
      });
    });
  });

  document.querySelectorAll(".session-card").forEach(card => {
    card.addEventListener("click", () => openDetails(card.dataset.studentId));
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
          <button class="download-report-btn" data-download-student="${student.id}">Download</button>
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
    btn.addEventListener("click", () => downloadStudentReportById(btn.dataset.downloadStudent));
  });
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

  if (isSlotTaken(day, hour)) {
    alert("This time is already busy. Please choose another available time.");
    updateAvailableTimeOptions();
    return;
  }

  try {
    const studentId = await upsertStudentFromForm();

    const { error } = await client.from("sessions").insert({
      student_id: studentId,
      day,
      hour,
      course,
      current_session: currentSession,
      type,
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
      <td><button class="danger-btn" data-delete-session="${session.id}">Delete</button></td>
    </tr>
  `).join("");

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

function closeDetails() {
  selectedStudentId = null;
  detailsModal.close();
}

function openFeedback(studentId) {
  feedbackStudentId = studentId;
  renderFeedback(studentId);
  feedbackModal.showModal();
}

function renderFeedback(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  document.getElementById("feedbackStudentName").textContent = `${student.name} Feedback`;
  document.getElementById("feedbackDate").value = todayISO();

  const sessions = getSessionsForStudent(studentId);
  const courseOptions = [...new Set(sessions.map(s => s.course))];

  document.getElementById("feedbackCourse").innerHTML =
    courseOptions.length
      ? courseOptions.map(course => `<option value="${course}">${course}</option>`).join("")
      : `<option value="General">General</option>`;

  const feedbackItems = getFeedbackForStudent(studentId);
  const body = document.getElementById("feedbackTableBody");

  if (feedbackItems.length === 0) {
    body.innerHTML = `<tr><td colspan="17">No feedback saved yet.</td></tr>`;
    return;
  }

  body.innerHTML = feedbackItems.map(item => `
    <tr>
      <td>${item.date}</td>
      <td>${item.session_number}</td>
      <td>${item.course}</td>
      <td>${item.lesson_title}</td>
      <td>${item.attendance}</td>
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
      <td><button class="danger-btn" data-delete-feedback="${item.id}">Delete</button></td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-delete-feedback]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = confirm("Delete this feedback row?");
      if (!ok) return;

      const { error } = await client.from("feedback").delete().eq("id", btn.dataset.deleteFeedback);
      if (error) {
        alert("Could not delete feedback.");
        return;
      }

      await refreshData();
    });
  });
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

  const { error } = await client.from("feedback").insert(feedbackRow);

  if (error) {
    console.error(error);
    alert("Could not save feedback.");
    return;
  }

  feedbackForm.reset();
  await refreshData();
  renderFeedback(feedbackStudentId);
}

function closeFeedback() {
  feedbackStudentId = null;
  feedbackModal.close();
}

async function downloadStudentReportById(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  const sessions = getSessionsForStudent(studentId);
  const feedbackItems = getFeedbackForStudent(studentId);

  if (feedbackItems.length === 0) {
    const ok = confirm("No feedback rows are saved for this student yet. Download a report using schedule data only?");
    if (!ok) return;
  }

  await window.EdubiaReport.downloadStudentReport({
    studentName: student.name,
    course: sessions[0]?.course || feedbackItems[0]?.course || "General",
    sessions,
    feedbackItems,
  });
}

async function login(email, password) {
  const { error } = await client.auth.signInWithPassword({ email, password });
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
  state = { students: [], sessions: [], feedback: [] };
  await renderAuth();
});

document.getElementById("openCoordinatorBtn").addEventListener("click", () => {
  window.open(getCoordinatorLink(), "_blank");
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

studentCourse.addEventListener("change", () => {
  customCourseLabel.classList.toggle("hidden", studentCourse.value !== "Other");
});

sessionDay.addEventListener("change", () => updateAvailableTimeOptions());
studentSearch.addEventListener("input", renderSchedule);
studentForm.addEventListener("submit", handleStudentFormSubmit);
feedbackForm.addEventListener("submit", handleFeedbackSubmit);

client.auth.onAuthStateChange(() => renderAuth());

if (checkConfig()) {
  initSelects();
  renderAuth();
}
