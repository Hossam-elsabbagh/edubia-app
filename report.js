(function () {
  const INSTRUCTOR_AR = "م. حسام نبيل";
  const DEFAULT_LEVEL = "المستوى الأول";
  const DEFAULT_DURATION = "60 دقيقة";
  const EDUBIA_LOGO_DATA_URL = "data:image/png;base64,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";

  const REPORT_CSS = `
    .edubia-report-root,
    .edubia-report-root * {
      box-sizing: border-box;
    }

    .edubia-report-root {
      position: fixed;
      left: 0;
      top: 0;
      width: 794px;
      z-index: -9999;
      pointer-events: none;
      font-family: "Cairo", "Tahoma", Arial, sans-serif;
      color: #09224a;
      direction: rtl;
    }

    .edubia-report-page {
      width: 794px;
      height: 1123px;
      position: relative;
      overflow: hidden;
      background: #ffffff;
      padding: 26px 34px 30px;
      direction: rtl;
    }

    .edubia-report-page::before {
      content: "";
      position: absolute;
      inset: 18px 20px 18px 20px;
      border-left: 2px solid #fb8500;
      border-right: 2px solid #fb8500;
      pointer-events: none;
    }

    .edubia-report-page::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent 0 48%, rgba(248, 139, 24, 0.08) 49%, transparent 54%),
        radial-gradient(circle at 80% 20%, rgba(255, 148, 23, 0.12), transparent 32%);
      opacity: 0.26;
      pointer-events: none;
    }

    .edubia-report-content {
      position: relative;
      z-index: 1;
      height: 100%;
    }

    .edubia-cover-corners {
      position: absolute;
      inset: 16px 28px;
      pointer-events: none;
      z-index: 2;
    }

    .edubia-corner { position: absolute; width: 30px; height: 30px; border-color: #f8a12a; }
    .edubia-corner.tr { top: 0; right: 0; border-top: 2px solid; border-right: 2px solid; border-top-right-radius: 8px; }
    .edubia-corner.tl { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; border-top-left-radius: 8px; }
    .edubia-corner.br { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; border-bottom-right-radius: 8px; }
    .edubia-corner.bl { bottom: 0; left: 0; border-bottom: 2px solid; border-left: 2px solid; border-bottom-left-radius: 8px; }

    .edubia-hero {
      margin: -8px -14px 0;
      min-height: 230px;
      padding: 34px 42px 28px;
      color: #fff;
      background:
        linear-gradient(135deg, rgba(3, 28, 68, 1), rgba(7, 46, 107, 1)),
        radial-gradient(circle at 30% 70%, rgba(255, 255, 255, .16), transparent 33%);
      border-bottom: 4px solid #fb8500;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .edubia-hero::after,
    .edubia-dark-strip::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255,255,255,.15) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: .45;
    }

    .edubia-hero-top {
      display: flex;
      justify-content: space-between;
      align-items: start;
      position: relative;
      z-index: 1;
    }

    .edubia-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 22px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff9f26, #ff7f0f);
      color: white;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 8px 20px rgba(245, 132, 20, .22);
    }

    .edubia-logo-row { display: flex; align-items: center; gap: 14px; direction: ltr; }
    .edubia-logo-text { color: white; font-family: "Inter", "Cairo", sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -0.03em; }
    .edubia-logo-mark { width: 58px; height: 52px; display: block; object-fit: contain; filter: drop-shadow(0 10px 22px rgba(0,0,0,.12)); }

    .edubia-student-title {
      margin-top: 60px;
      text-align: right;
      position: relative;
      z-index: 1;
    }

    .edubia-student-title h1 {
      margin: 0 0 14px;
      color: white;
      font-size: 38px;
      line-height: 1.18;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .edubia-subtitle {
      color: #ffbf69;
      font-weight: 800;
      font-size: 15px;
    }

    .edubia-meta-row {
      height: 92px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-bottom: 1px solid #edf1f8;
      margin: 0 -6px 20px;
    }

    .edubia-meta-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      border-left: 1px solid #e5eaf2;
      gap: 6px;
    }
    .edubia-meta-item:first-child { border-left: none; }
    .edubia-meta-item span { color: #7a859b; font-size: 13px; font-weight: 800; }
    .edubia-meta-item strong { color: #09224a; font-size: 19px; font-weight: 900; }

    .edubia-two-col { display: grid; grid-template-columns: 1.45fr .82fr; gap: 24px; direction: ltr; }
    .edubia-two-col > * { direction: rtl; }

    .edubia-card {
      background: #fff;
      border: 1px solid #dfe6f0;
      border-radius: 18px;
      box-shadow: 0 8px 22px rgba(15, 35, 70, .04);
      padding: 22px;
    }

    .edubia-section-title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: white;
      background: #08265a;
      border-radius: 10px;
      padding: 10px 22px;
      font-size: 19px;
      font-weight: 900;
      margin-bottom: 20px;
    }
    .edubia-section-title::before { content: ""; width: 12px; height: 12px; border-radius: 999px; background: linear-gradient(135deg, #ffb347, #ff7a00); display: inline-block; }

    .edubia-title-right { text-align: right; }
    .edubia-title-left { text-align: left; }

    .edubia-skill { margin: 0 0 17px; }
    .edubia-skill-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .edubia-skill-name { font-weight: 900; font-size: 16px; color: #17233d; }
    .edubia-score-pill { background: #21a45b; color: white; border-radius: 999px; min-width: 60px; padding: 4px 12px; font-size: 13px; font-weight: 900; text-align: center; direction: ltr; }
    .edubia-bar { height: 12px; background: #edf1f5; border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.08); }
    .edubia-fill { height: 100%; border-radius: 999px; background: linear-gradient(180deg, #52c57e, #1f9d58); }

    .edubia-overall-card { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 338px; }
    .edubia-donut {
      width: 162px; height: 162px; border-radius: 50%;
      background: conic-gradient(#fb8500 var(--angle), #fee8c8 var(--angle));
      display: grid; place-items: center; margin: 6px auto 22px; position: relative;
    }
    .edubia-donut::before { content: ""; position: absolute; inset: 18px; border-radius: 50%; background: #fff9ef; box-shadow: inset 0 0 20px rgba(255, 164, 49, .22); }
    .edubia-donut-inner { position: relative; z-index: 1; text-align: center; direction: rtl; }
    .edubia-donut-score { color: #fb8500; font-size: 46px; font-weight: 900; line-height: 1; direction: ltr; }
    .edubia-donut-sub { color: #687590; font-size: 12px; font-weight: 900; margin: 4px 0; }
    .edubia-stars { color: #fb8500; letter-spacing: 2px; font-size: 16px; direction: ltr; }
    .edubia-overall-label { font-weight: 900; font-size: 20px; margin-bottom: 10px; }
    .edubia-ribbon { color: white; background: linear-gradient(135deg, #ffbd73, #f27c0b); padding: 7px 26px; font-size: 15px; font-weight: 900; clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }

    .edubia-dark-strip {
      margin: 28px 0 22px;
      padding: 24px 28px;
      min-height: 135px;
      border-radius: 20px;
      background: linear-gradient(135deg, #061c43, #0b3670);
      color: #fff;
      display: grid;
      grid-template-columns: 1fr 3fr 1.45fr;
      gap: 28px;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .edubia-dark-strip > * { position: relative; z-index: 1; }
    .edubia-pace-box { border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); border-radius: 14px; min-height: 90px; display: grid; place-items: center; text-align: center; }
    .edubia-pace-box strong { color: #ff9f2d; font-size: 26px; font-weight: 900; direction: ltr; }
    .edubia-pace-box span { display:block; color:#b8c3d8; font-size: 13px; font-weight: 800; }
    .edubia-strip-text { font-size: 16px; font-weight: 800; line-height: 1.8; color: #f6f8ff; }
    .edubia-rank-box { text-align: center; color: #ff9420; font-weight: 900; }
    .edubia-rank-box .trophy { font-size: 37px; display: block; line-height: 1; }
    .edubia-rank-box .rank { font-size: 39px; line-height: 1; direction: ltr; }
    .edubia-rank-box .rank-caption { font-size: 13px; color: #ffd8a5; }

    .edubia-summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; direction: ltr; }
    .edubia-summary-cards > * { direction: rtl; }
    .edubia-mini-card { border: 1px solid #dfe6ef; border-radius: 16px; padding: 18px; min-height: 142px; box-shadow: 0 10px 20px rgba(15, 35, 70, .04); border-right: 4px solid #ffac47; position: relative; }
    .edubia-mini-icon { position: absolute; right: 18px; top: 18px; width: 38px; height: 38px; background: #fff5e9; border-radius: 13px; display: grid; place-items: center; font-size: 22px; }
    .edubia-mini-card span { display: block; margin-top: 56px; color: #7d879d; font-size: 14px; font-weight: 800; }
    .edubia-mini-card strong { display: block; margin: 8px 0 0; color: #062658; font-size: 31px; font-weight: 900; direction: ltr; text-align: right; }
    .edubia-mini-card small { color: #7d879d; font-weight: 800; }

    .edubia-page-body { padding: 20px 24px; }
    .edubia-table-card { padding: 22px; }
    .edubia-lessons-table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 12px; font-size: 14px; }
    .edubia-lessons-table th { background: #062658; color: #fff; padding: 14px; font-weight: 900; text-align: right; }
    .edubia-lessons-table td { padding: 13px 14px; border-bottom: 1px solid #ecf0f6; background: #fff; font-weight: 800; color: #28344c; }
    .edubia-lessons-table tr:nth-child(even) td { background: #f8fafc; }
    .edubia-grade-pill { display: inline-flex; min-width: 42px; justify-content: center; align-items: center; padding: 4px 10px; border-radius: 999px; color: white; font-weight: 900; background: #21a45b; direction: ltr; }
    .edubia-star { color: #f5a008; font-size: 18px; }
    .edubia-final-grade { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; background: #fffaf2; border: 1px solid #f1e3d1; border-radius: 14px; padding: 16px 20px; font-size: 18px; font-weight: 900; }
    .edubia-grade-square { background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; width: 58px; height: 58px; border-radius: 13px; display: grid; place-items: center; font-size: 22px; font-weight: 900; direction: ltr; box-shadow: 0 10px 18px rgba(245, 132, 20, .2); }

    .edubia-chart-card, .edubia-attendance-card, .edubia-advice-card, .edubia-scale-card { margin-top: 22px; }
    .edubia-chart-wrap { height: 245px; position: relative; direction: ltr; }
    .edubia-chart-wrap svg { width: 100%; height: 100%; display: block; }
    .edubia-chart-labels { display: flex; justify-content: space-between; color: #8a94a8; font-size: 12px; font-weight: 700; direction: rtl; }

    .edubia-attendance-grid { display: grid; grid-template-columns: 1.15fr 1fr 1fr 1fr; gap: 12px; align-items: center; direction: ltr; }
    .edubia-attendance-grid > * { direction: rtl; }
    .edubia-rating-lines { font-weight: 800; color: #17233d; line-height: 2.3; }
    .edubia-rating-lines .stars { color: #fb8500; direction: ltr; display: inline-block; margin-inline-start: 12px; letter-spacing: 2px; }
    .edubia-attendance-stat { border: 1px solid #e3e9f2; border-radius: 14px; min-height: 80px; display: grid; place-items: center; text-align: center; color: #66728c; font-weight: 800; }
    .edubia-attendance-stat strong { color: #08265a; font-size: 30px; direction: ltr; }
    .edubia-attendance-stat.present strong { color: #18a457; }
    .edubia-attendance-stat.absent strong { color: #e53e3e; }

    .edubia-note-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; direction: ltr; }
    .edubia-note-grid > * { direction: rtl; }
    .edubia-note { min-height: 185px; padding: 20px; border-radius: 18px; border: 1px solid #e3e8f0; }
    .edubia-note.green { background: linear-gradient(180deg, #f3fff9, #f7fffb); border-color: #cfeee0; }
    .edubia-note.red { background: linear-gradient(180deg, #fff7f7, #fffafa); border-color: #f0d2d2; }
    .edubia-note.blue { background: linear-gradient(180deg, #f7fbff, #ffffff); border-color: #d9e4f3; }
    .edubia-note.orange { background: linear-gradient(180deg, #fffaf2, #ffffff); border-color: #f1dfca; }
    .edubia-note h3 { margin: 0 0 15px; color: #08265a; font-size: 18px; font-weight: 900; }
    .edubia-note p { margin: 0; color: #5d6678; font-size: 15px; font-weight: 700; line-height: 1.9; }
    .edubia-bullets { margin: 0; padding: 0 18px 0 0; color: #5d6678; font-weight: 700; line-height: 1.8; }
    .edubia-bullets li { margin-bottom: 8px; }
    .edubia-bullets li::marker { color: #fb8500; }

    .edubia-badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; direction: ltr; }
    .edubia-badge-grid > * { direction: rtl; }
    .edubia-badge { display: grid; grid-template-columns: 56px 1fr; gap: 14px; align-items: center; border: 1px solid #f0dfca; background: #fffdf9; border-radius: 16px; padding: 16px; min-height: 112px; }
    .edubia-badge-icon { width: 56px; height: 56px; border-radius: 15px; background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; font-size: 27px; display: grid; place-items: center; }
    .edubia-badge strong { display: block; color: #08265a; font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .edubia-badge span { color: #69748b; font-weight: 700; line-height: 1.55; font-size: 13px; }

    .edubia-progress-box { border: 1px solid #e1e8f1; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    .edubia-course-head { display: flex; justify-content: space-between; align-items: center; font-weight: 900; margin-bottom: 14px; }
    .edubia-progress-pill { background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; border-radius: 999px; padding: 5px 16px; font-weight: 900; font-size: 12px; }
    .edubia-progress-bar { height: 8px; background: #edf1f6; border-radius: 999px; overflow: hidden; margin-bottom: 12px; direction: ltr; }
    .edubia-progress-bar span { display: block; height: 100%; background: linear-gradient(90deg, #ffbd73, #c46c00); border-radius: 999px; }
    .edubia-progress-box p { margin: 0; color: #69748b; font-weight: 700; line-height: 1.7; font-size: 14px; }

    .edubia-tips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; direction: ltr; }
    .edubia-tips > * { direction: rtl; }
    .edubia-tip { border: 1px solid #e2e9f2; border-radius: 16px; padding: 20px 14px; min-height: 155px; text-align: center; background: linear-gradient(180deg, #fff, #f8fbff); }
    .edubia-tip-icon { font-size: 26px; margin-bottom: 10px; }
    .edubia-tip strong { display: block; color: #08265a; font-weight: 900; margin-bottom: 8px; }
    .edubia-tip p { margin: 0; color: #707a8f; font-weight: 700; line-height: 1.5; font-size: 13px; }

    .edubia-grade-scale { display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px; direction: ltr; }
    .edubia-scale-item { border: 1px solid #e1e8f1; border-radius: 10px; padding: 9px 4px; text-align: center; background: white; }
    .edubia-scale-grade { color: white; border-radius: 9px; padding: 5px 0; font-weight: 900; font-size: 13px; margin-bottom: 5px; direction: ltr; }
    .edubia-scale-range { color: #7c879b; font-size: 11px; font-weight: 800; direction: ltr; }
    .g-green { background: #1fa463; } .g-yellow { background: #efaa0a; } .g-red { background: #ef5252; }

    .edubia-footer { position: absolute; bottom: 28px; right: 60px; left: 60px; border-top: 1px solid #edf1f6; padding-top: 12px; display: flex; justify-content: space-between; color: #7c879b; font-size: 12px; font-weight: 800; z-index: 2; }

    .edubia-page-plain .edubia-section-title { margin-bottom: 22px; }
    .edubia-page-plain .edubia-card { margin-bottom: 18px; }
  `;

  function addStyleOnce() {
    if (document.getElementById("edubia-report-style")) return;
    const style = document.createElement("style");
    style.id = "edubia-report-style";
    style.textContent = REPORT_CSS;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function asNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round1(value) {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded.toFixed(0)) : String(rounded.toFixed(1));
  }

  function formatDate(dateValue) {
    if (!dateValue) return new Date().toISOString().slice(0, 10).replaceAll("-", "/");
    const parts = String(dateValue).slice(0, 10).split("-");
    if (parts.length === 3) return `${parts[0]}/${Number(parts[1])}/${Number(parts[2])}`;
    return String(dateValue);
  }

  function getArabicMonth(dateValue) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) return "الشهر الحالي";
    return new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(date);
  }

  function normalizeCourseName(course) {
    const text = String(course || "General");
    if (/pictoblox/i.test(text)) return "PictoBlox";
    if (/python/i.test(text)) return "Python";
    if (/scratch/i.test(text)) return "Scratch";
    return text;
  }

  function attendanceArabic(value) {
    const text = String(value || "").toLowerCase();
    if (text.includes("absent") || text.includes("غائب")) return "غائب";
    if (text.includes("late") || text.includes("متأخر")) return "متأخر";
    return "حاضر";
  }

  function gradeFromScore(score) {
    const pct = clamp(asNumber(score, 0) / 5 * 100, 0, 100);
    if (pct >= 90) return "+A";
    if (pct >= 85) return "A";
    if (pct >= 80) return "-A";
    if (pct >= 75) return "+B";
    if (pct >= 70) return "B";
    if (pct >= 65) return "-B";
    if (pct >= 60) return "+C";
    if (pct >= 50) return "C";
    return "-C";
  }

  function ratingLabel(avg) {
    if (avg >= 4.5) return "ممتاز";
    if (avg >= 4) return "جيد جدًا";
    if (avg >= 3) return "جيد";
    return "يحتاج متابعة";
  }

  function rankLabel(avg) {
    if (avg >= 4.8) return "أفضل 10٪";
    if (avg >= 4.4) return "أفضل 20٪";
    if (avg >= 3.8) return "متقدم";
    return "قيد التحسن";
  }

  function starString(avg) {
    const filled = Math.round(clamp(avg, 0, 5));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  function average(values, fallback = 0) {
    const valid = values.map(v => Number(v)).filter(v => Number.isFinite(v));
    if (!valid.length) return fallback;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }

  function latestFeedback(feedbackItems) {
    return [...feedbackItems].sort((a, b) => String(b.date || b.created_at || "").localeCompare(String(a.date || a.created_at || "")))[0] || {};
  }

  function sortedFeedback(feedbackItems) {
    return [...feedbackItems].sort((a, b) => String(a.date || a.created_at || "").localeCompare(String(b.date || b.created_at || "")));
  }

  function splitText(text, fallback) {
    const value = String(text || fallback || "").trim();
    return value.split(/\n|\.|،|-/).map(item => item.trim()).filter(Boolean).slice(0, 3);
  }

  function lessonAverage(item) {
    return average([
      item.understanding_score,
      item.problem_solving_score,
      item.practical_score,
      item.exercise_score,
      item.participation_score,
    ], 0);
  }

  function buildMetrics(payload) {
    const feedbackItems = Array.isArray(payload.feedbackItems) ? payload.feedbackItems : [];
    const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
    const latest = latestFeedback(feedbackItems);
    const ordered = sortedFeedback(feedbackItems);
    const latestDate = latest.date || new Date().toISOString().slice(0, 10);
    const course = normalizeCourseName(payload.course || latest.course || sessions[0]?.course || "General");
    const sessionNo = latest.session_number || sessions[0]?.current_session || feedbackItems.length || "-";

    const skills = [
      { label: "استيعاب المفاهيم", field: "understanding_score" },
      { label: "حل المشكلات (المنطق)", field: "problem_solving_score" },
      { label: "كتابة الكود وتطبيقه", field: "practical_score" },
      { label: "إنجاز التمارين والمشاريع", field: "exercise_score" },
      { label: "التفاعل والمشاركة", field: "participation_score" },
    ].map(skill => {
      const score = average(feedbackItems.map(item => item[skill.field]), 0);
      return { ...skill, score: score || 0 };
    });

    const avg = skills.length ? average(skills.map(skill => skill.score), 0) : 0;
    const totalFeedback = feedbackItems.length;
    const present = feedbackItems.filter(item => {
      const status = attendanceArabic(item.attendance);
      return status === "حاضر" || status === "متأخر";
    }).length;
    const absent = feedbackItems.filter(item => attendanceArabic(item.attendance) === "غائب").length;
    const attendanceTotal = totalFeedback || sessions.length || 0;
    const attendancePct = attendanceTotal ? Math.round((present / attendanceTotal) * 100) : 0;

    const homeworkRows = feedbackItems.filter(item => String(item.previous_homework || "").toLowerCase() !== "not required");
    const homeworkTotal = homeworkRows.length || totalFeedback || 0;
    const homeworkDone = homeworkRows.filter(item => /submitted|تم/i.test(String(item.previous_homework || ""))).length;
    const homeworkPct = homeworkTotal ? Math.round((homeworkDone / homeworkTotal) * 100) : 0;

    const uniqueLessons = new Set(feedbackItems.map(item => item.lesson_title).filter(Boolean)).size || totalFeedback || 1;
    const learningPace = totalFeedback ? totalFeedback / uniqueLessons : 0;
    const courseProgress = Math.min(100, Math.max(10, Math.round((totalFeedback || sessions.length || 1) * 8.75)));

    const chartScores = ordered.map(lessonAverage);
    const lessons = ordered.length ? ordered : [{
      lesson_title: latest.lesson_title || "لم يتم تسجيل دروس بعد",
      understanding_score: avg,
      problem_solving_score: avg,
      practical_score: avg,
      exercise_score: avg,
      participation_score: avg,
    }];

    const strengths = splitText(latest.strengths, "مستوى الطالب جيد، ويظهر تفاعلًا واضحًا داخل الحصة.");
    const improvements = splitText(latest.improvement_areas, "الاستمرار في التدريب العملي وتسليم الواجبات في موعدها.");
    const explained = splitText(latest.explained, "تمت متابعة مفاهيم الدرس والتطبيق العملي عليها.");

    return {
      studentName: payload.studentName || payload.student?.name || latest.student_name || "اسم الطالب",
      course,
      level: payload.level || DEFAULT_LEVEL,
      date: latestDate,
      dateText: formatDate(latestDate),
      monthText: getArabicMonth(latestDate),
      instructor: payload.instructorName || INSTRUCTOR_AR,
      sessionNo,
      duration: payload.duration || DEFAULT_DURATION,
      skills,
      avg,
      avgText: avg ? round1(avg) : "-",
      grade: gradeFromScore(avg || 0),
      rating: ratingLabel(avg),
      rank: rankLabel(avg),
      stars: starString(avg),
      totalFeedback,
      sessionCount: totalFeedback || sessions.length || 0,
      attendancePct,
      present,
      absent,
      attendanceTotal,
      homeworkDone,
      homeworkTotal,
      homeworkPct,
      learningPace,
      learningPaceText: learningPace ? learningPace.toFixed(2) : "-",
      courseProgress,
      lessons,
      chartScores,
      strengths,
      improvements,
      explained,
      commitmentAvg: average(feedbackItems.map(item => item.commitment_score), avg || 0),
      participationAvg: average(feedbackItems.map(item => item.participation_score), avg || 0),
      selectedRange: payload.selectedRange || null,
      rawFeedbackItems: feedbackItems,
      rawSessions: sessions,
    };
  }

  function renderSkill(skill) {
    const score = clamp(skill.score || 0, 0, 5);
    const pct = Math.round((score / 5) * 100);
    return `
      <div class="edubia-skill">
        <div class="edubia-skill-top">
          <span class="edubia-score-pill">${escapeHtml(round1(score))} / 5</span>
          <span class="edubia-skill-name">${escapeHtml(skill.label)}</span>
        </div>
        <div class="edubia-bar"><div class="edubia-fill" style="width:${pct}%"></div></div>
      </div>`;
  }

  function renderLessons(metrics) {
    return metrics.lessons.slice(0, 8).map((item, index) => {
      const score = lessonAverage(item) || metrics.avg;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.lesson_title || `جلسة ${index + 1}`)}</td>
          <td><span class="edubia-grade-pill">${escapeHtml(gradeFromScore(score))}</span></td>
          <td><span class="edubia-star">⭐</span></td>
        </tr>`;
    }).join("");
  }

  function renderChart(metrics) {
    const scores = metrics.chartScores.length ? metrics.chartScores : [metrics.avg || 0];
    const width = 650;
    const height = 220;
    const padX = 26;
    const padY = 20;
    const maxScore = 5;
    const points = scores.map((score, index) => {
      const x = scores.length === 1 ? width / 2 : padX + index * ((width - padX * 2) / (scores.length - 1));
      const y = height - padY - (clamp(score, 0, maxScore) / maxScore) * (height - padY * 2);
      return `${x},${y}`;
    }).join(" ");
    const areaPoints = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`;
    const labels = scores.map((_, index) => `<span>جلسة ${index + 1}</span>`).join("");

    return `
      <div class="edubia-chart-wrap">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="edubiaChartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#ff9f26" stop-opacity=".45" />
              <stop offset="1" stop-color="#ff9f26" stop-opacity=".02" />
            </linearGradient>
          </defs>
          ${[0,1,2,3,4,5].map(i => {
            const y = height - padY - i * ((height - padY * 2) / 5);
            return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="#edf1f6" stroke-width="1" />`;
          }).join("")}
          <polygon points="${areaPoints}" fill="url(#edubiaChartFill)" />
          <polyline points="${points}" fill="none" stroke="#ff9f26" stroke-width="4" stroke-linecap="round" />
          ${scores.map((score, index) => {
            const x = scores.length === 1 ? width / 2 : padX + index * ((width - padX * 2) / (scores.length - 1));
            const y = height - padY - (clamp(score, 0, maxScore) / maxScore) * (height - padY * 2);
            return `<circle cx="${x}" cy="${y}" r="6" fill="#ffffff" stroke="#08265a" stroke-width="3" />`;
          }).join("")}
        </svg>
      </div>
      <div class="edubia-chart-labels">${labels}</div>`;
  }

  function renderList(items) {
    return `<ul class="edubia-bullets">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function edubiaLogoImage() {
    return `<img class="edubia-logo-mark" src="${EDUBIA_LOGO_DATA_URL}" alt="Edubia logo" />`;
  }

  function reportHtml(metrics) {
    const stripText = `أداء ${metrics.studentName} يضعه ضمن ${metrics.rank} من الطلاب في مساق ${metrics.course} هذا الشهر.`;
    const teacherNote = [
      metrics.explained.length ? `تم خلال آخر متابعة: ${metrics.explained.join("، ")}.` : "",
      metrics.strengths.length ? `نقاط مميزة: ${metrics.strengths.join("، ")}.` : "",
      metrics.improvements.length ? `نقطة التركيز القادمة: ${metrics.improvements[0]}.` : "",
    ].filter(Boolean).join(" ");

    const nextStep = metrics.improvements.length
      ? `الاستمرار في تطبيق ما تم شرحه داخل ${metrics.course} مع التركيز على ${metrics.improvements.join("، ")}.`
      : `الاستمرار في تعلم مفاهيم جديدة في ${metrics.course} وتطبيقها في مشروعات أكثر تحديًا.`;

    const badges = [
      {
        icon: "⏱️",
        title: "منضبط بالوقت",
        text: metrics.commitmentAvg >= 4.5 ? "تُمنح لانضباط الطالب في بداية الجلسات والالتزام بالمواعيد." : "يحتاج إلى متابعة الالتزام بالمواعيد بشكل أكبر."
      },
      {
        icon: "⚡",
        title: "متعلّم سريع",
        text: metrics.learningPace && metrics.learningPace <= 1 ? `وتيرة ${metrics.learningPaceText} حصة/درس — استيعاب فعّال.` : "يتقدم بوتيرة مناسبة مع احتياج بسيط لمزيد من التدريب."
      },
      {
        icon: "✅",
        title: "ملتزم بالواجبات",
        text: `${metrics.homeworkDone} من ${metrics.homeworkTotal || 0} واجبات تم تسجيلها كمنجزة.`
      },
      {
        icon: "💬",
        title: "متفاعل",
        text: metrics.participationAvg >= 4.5 ? "مشاركة واضحة وتفاعل جيد داخل الحصة." : "نستهدف زيادة المشاركة خلال التطبيقات العملية."
      }
    ].slice(0, 2);

    return `
      <div class="edubia-report-page">
        <div class="edubia-cover-corners"><span class="edubia-corner tr"></span><span class="edubia-corner tl"></span><span class="edubia-corner br"></span><span class="edubia-corner bl"></span></div>
        <div class="edubia-report-content">
          <section class="edubia-hero">
            <div class="edubia-hero-top">
              <div class="edubia-logo-row"><span class="edubia-logo-text">Edubia</span>${edubiaLogoImage()}</div>
              <span class="edubia-pill">تقرير متابعة الطالب</span>
            </div>
            <div class="edubia-student-title">
              <h1>${escapeHtml(metrics.studentName)}</h1>
              <div class="edubia-subtitle">${escapeHtml(metrics.course)} &nbsp; • &nbsp; ${escapeHtml(metrics.level)} &nbsp; • &nbsp; ${escapeHtml(metrics.monthText)}</div>
            </div>
          </section>

          <section class="edubia-meta-row">
            <div class="edubia-meta-item"><span>المعلم</span><strong>${escapeHtml(metrics.instructor)}</strong></div>
            <div class="edubia-meta-item"><span>التاريخ</span><strong>${escapeHtml(metrics.dateText)}</strong></div>
            <div class="edubia-meta-item"><span>رقم الجلسة</span><strong>${escapeHtml(metrics.sessionNo)}</strong></div>
            <div class="edubia-meta-item"><span>المدة</span><strong>${escapeHtml(metrics.duration)}</strong></div>
          </section>

          <section class="edubia-two-col">
            <div class="edubia-card">
              <div class="edubia-title-left"><div class="edubia-section-title">تقييم المهارات</div></div>
              ${metrics.skills.map(renderSkill).join("")}
            </div>
            <div class="edubia-card edubia-overall-card">
              <div class="edubia-donut" style="--angle:${Math.round((metrics.avg || 0) / 5 * 360)}deg">
                <div class="edubia-donut-inner">
                  <div class="edubia-donut-score">${escapeHtml(metrics.avgText)}</div>
                  <div class="edubia-donut-sub">من 5</div>
                  <div class="edubia-stars">${escapeHtml(metrics.stars)}</div>
                </div>
              </div>
              <div class="edubia-overall-label">التقييم العام</div>
              <div class="edubia-ribbon">${escapeHtml(metrics.rating)}</div>
            </div>
          </section>

          <section class="edubia-dark-strip">
            <div class="edubia-pace-box"><div><strong>${escapeHtml(metrics.learningPaceText)}</strong><span>وتيرة التعلم</span><span>حصص / درس</span></div></div>
            <div class="edubia-strip-text">${escapeHtml(stripText)}</div>
            <div class="edubia-rank-box"><span class="trophy">🏆</span><div class="rank">${escapeHtml(metrics.rank)}</div><div class="rank-caption">الترتيب</div></div>
          </section>

          <section class="edubia-summary-cards">
            <div class="edubia-mini-card"><div class="edubia-mini-icon">🎓</div><span>عدد الجلسات</span><strong>${escapeHtml(metrics.sessionCount)}</strong><small>منذ بداية المساق</small></div>
            <div class="edubia-mini-card"><div class="edubia-mini-icon">✅</div><span>الواجبات المنجزة</span><strong>${escapeHtml(metrics.homeworkDone)} / ${escapeHtml(metrics.homeworkTotal || 0)}</strong><small>${escapeHtml(metrics.homeworkPct)}٪ إنجاز</small></div>
            <div class="edubia-mini-card"><div class="edubia-mini-icon">🗓️</div><span>نسبة الحضور</span><strong>${escapeHtml(metrics.attendancePct)}٪</strong><small>${metrics.attendancePct >= 90 ? "التزام ممتاز" : "تحتاج متابعة"}</small></div>
          </section>
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card edubia-table-card">
            <div class="edubia-title-right"><div class="edubia-section-title">تفصيل الدروس</div></div>
            <table class="edubia-lessons-table">
              <thead><tr><th>#</th><th>الدرس</th><th>الدرجة</th><th>الاختبار</th></tr></thead>
              <tbody>${renderLessons(metrics)}</tbody>
            </table>
            <div class="edubia-final-grade"><span>الدرجة النهائية</span><span class="edubia-grade-square">${escapeHtml(metrics.grade)}</span></div>
          </section>

          <section class="edubia-card edubia-chart-card">
            <div class="edubia-title-right"><div class="edubia-section-title">تطوّر الأداء عبر الجلسات</div></div>
            ${renderChart(metrics)}
          </section>

          <section class="edubia-card edubia-attendance-card">
            <div class="edubia-title-right"><div class="edubia-section-title">الحضور والانضباط</div></div>
            <div class="edubia-attendance-grid">
              <div class="edubia-rating-lines">
                <div><span class="stars">${escapeHtml(starString(metrics.commitmentAvg))}</span> الالتحاق بالوقت</div>
                <div><span class="stars">${escapeHtml(starString(metrics.homeworkPct / 20))}</span> التسليم بالوقت</div>
              </div>
              <div class="edubia-attendance-stat"><div><strong>${escapeHtml(metrics.attendanceTotal)} / ${escapeHtml(metrics.attendanceTotal)}</strong><br>حصص منجزة</div></div>
              <div class="edubia-attendance-stat absent"><div><strong>${escapeHtml(metrics.absent)}</strong><br>غائب</div></div>
              <div class="edubia-attendance-stat present"><div><strong>${escapeHtml(metrics.present)}</strong><br>حاضر</div></div>
            </div>
          </section>
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-note-grid">
            <div class="edubia-note green"><h3>💪 نقاط القوة</h3>${renderList(metrics.strengths)}</div>
            <div class="edubia-note red"><h3>🎯 مجالات التحسين</h3>${renderList(metrics.improvements)}</div>
            <div class="edubia-note blue"><h3>📝 ملاحظات المعلم</h3><p>${escapeHtml(teacherNote || "تم حفظ بيانات المتابعة وسيتم تحديث الملاحظات بعد الجلسة القادمة.")}</p></div>
            <div class="edubia-note orange"><h3>📌 الخطوة الجاية</h3><p>${escapeHtml(nextStep)}</p></div>
          </section>

          <section class="edubia-card" style="margin-top:24px;">
            <div class="edubia-title-right"><div class="edubia-section-title">الشارات المكتسبة</div></div>
            <div class="edubia-badge-grid">
              ${badges.map(badge => `
                <div class="edubia-badge"><div class="edubia-badge-icon">${badge.icon}</div><div><strong>${escapeHtml(badge.title)}</strong><span>${escapeHtml(badge.text)}</span></div></div>
              `).join("")}
            </div>
          </section>
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card">
            <div class="edubia-title-right"><div class="edubia-section-title">ماذا بعد؟</div></div>
            <h3 style="margin:0 0 14px; color:#08265a; font-size:17px;">التقدم في الدراسة الحالية</h3>
            <div class="edubia-progress-box">
              <div class="edubia-course-head"><strong>${escapeHtml(metrics.course)}</strong><span class="edubia-progress-pill">جارية ${escapeHtml(metrics.courseProgress)}٪</span></div>
              <div class="edubia-progress-bar"><span style="width:${metrics.courseProgress}%"></span></div>
              <p>كورس لتعلم البرمجة من خلال التطبيق العملي، حيث يصمم الطالب ألعابًا ومشاريع تفاعلية ويتعلم مفاهيم البرمجة بطريقة سهلة.</p>
            </div>
            <h3 style="margin:10px 0 14px; color:#8a94a8; font-size:16px;">المستويات القادمة (قريبًا)</h3>
            <div class="edubia-progress-box">
              <div class="edubia-course-head"><strong>${escapeHtml(metrics.course)} with AI</strong><span class="edubia-progress-pill" style="background:#e6edf7;color:#08265a;">قريبًا</span></div>
              <p>يجمع بين البرمجة والذكاء الاصطناعي، ويتعلم الطالب فيه مفاهيم مثل التعرف على الصور والصوت وبناء مشاريع تعتمد على تقنيات الذكاء الاصطناعي.</p>
            </div>
          </section>

          <section class="edubia-card edubia-advice-card">
            <div class="edubia-title-right"><div class="edubia-section-title">3 نصائح لولي الأمر</div></div>
            <div class="edubia-tips">
              <div class="edubia-tip"><div class="edubia-tip-icon">📆</div><strong>ثبّت الروتين</strong><p>احرص على الحضور المنتظم والالتزام بالمواعيد ضمن جدول دراسة ثابت.</p></div>
              <div class="edubia-tip"><div class="edubia-tip-icon">🌱</div><strong>ادعم</strong><p>وفّر بيئة تعلم هادئة وخالية من المشتتات، وشجع الفضول وحل المشكلات.</p></div>
              <div class="edubia-tip"><div class="edubia-tip-icon">🤝</div><strong>شارك</strong><p>تابع تقدم ابنك بانتظام واحتفلوا بإنجازاته سويًا.</p></div>
            </div>
          </section>

          <section class="edubia-card edubia-scale-card">
            <div class="edubia-title-right"><div class="edubia-section-title">سلم الدرجات المرجعي</div></div>
            <div class="edubia-grade-scale">
              ${[
                ["-C", "50-40", "g-red"], ["C", "60-50", "g-red"], ["+C", "65-60", "g-red"],
                ["-B", "70-65", "g-yellow"], ["B", "75-70", "g-yellow"], ["+B", "80-75", "g-yellow"],
                ["-A", "85-80", "g-green"], ["A", "90-85", "g-green"], ["+A", "+90%", "g-green"],
              ].map(([g, r, cls]) => `<div class="edubia-scale-item"><div class="edubia-scale-grade ${cls}">${g}</div><div class="edubia-scale-range">${r}</div></div>`).join("")}
            </div>
          </section>

          <footer class="edubia-footer">
            <span>المعلم<br>${escapeHtml(metrics.instructor)}</span>
            <span>تم إنشاء التقرير بواسطة Edubia · تاريخ الإصدار: ${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</span>
          </footer>
        </div>
      </div>`;
  }

  function safeFileName(name) {
    return String(name).replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
  }

  function buildReportData(payload) {
    const source = payload || {};
    const metrics = buildMetrics(source);
    return {
      generated_at: new Date().toISOString(),
      format_version: "edubia-feedback-v2",
      selected_range: source.selectedRange || null,
      student: source.student || { name: metrics.studentName },
      summary: {
        student_name: metrics.studentName,
        course: metrics.course,
        level: metrics.level,
        instructor: metrics.instructor,
        date: metrics.date,
        latest_session: metrics.sessionNo,
        sessions_count: metrics.sessionCount,
        average_score: metrics.avg,
        grade: metrics.grade,
        rating: metrics.rating,
        rank: metrics.rank,
        attendance_percentage: metrics.attendancePct,
        homework_done: metrics.homeworkDone,
        homework_total: metrics.homeworkTotal,
        learning_pace: metrics.learningPace,
      },
      skills: metrics.skills,
      sessions: source.sessions || [],
      feedback: source.feedbackItems || [],
    };
  }

  function downloadBlob(fileName, mimeType, content) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadStudentReportJson(payload) {
    const data = buildReportData(payload || {});
    const fileName = safeFileName(`feedback ${data.summary.student_name} — Edubia.json`);
    downloadBlob(fileName, "application/json;charset=utf-8", JSON.stringify(data, null, 2));
  }

  async function waitForReportAssets(root) {
    const images = [...root.querySelectorAll("img")];
    await Promise.all(images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function downloadStudentReport(payload) {
    if (!window.html2canvas || !window.jspdf?.jsPDF) {
      alert("PDF libraries are still loading. Please wait a few seconds and try again.");
      return;
    }

    addStyleOnce();
    const metrics = buildMetrics(payload || {});

    const root = document.createElement("div");
    root.className = "edubia-report-root";
    root.innerHTML = reportHtml(metrics);
    document.body.appendChild(root);

    try {
      await waitForReportAssets(root);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "pt", "a4");
      const pages = [...root.querySelectorAll(".edubia-report-page")];
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        const canvas = await window.html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 794,
          height: 1123,
          windowWidth: 794,
          windowHeight: 1123,
          scrollX: 0,
          scrollY: 0,
        });
        const image = canvas.toDataURL("image/png");
        if (index > 0) pdf.addPage();
        pdf.addImage(image, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      const fileName = safeFileName(`تقرير الطالب ${metrics.studentName} — Edubia.pdf`);
      pdf.save(fileName);
    } catch (error) {
      console.error("Edubia PDF download failed:", error);
      alert(`PDF download failed: ${error?.message || error}. Please try again or download JSON for now.`);
    } finally {
      root.remove();
    }
  }

  window.EdubiaReport = { downloadStudentReport, downloadStudentReportJson, buildReportData, buildMetrics };
})();
