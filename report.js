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
      padding: 18px 34px 22px;
      direction: rtl;
    }

    .edubia-report-page::before {
      content: "";
      position: absolute;
      inset: 16px 20px 16px 20px;
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
      margin: -4px -14px 0;
      min-height: 178px;
      padding: 26px 42px 20px;
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
      margin-top: 36px;
      text-align: right;
      position: relative;
      z-index: 1;
    }

    .edubia-student-title h1 {
      margin: 0 0 14px;
      color: white;
      font-size: 34px;
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
      height: 76px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-bottom: 1px solid #edf1f8;
      margin: 0 -6px 16px;
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
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(15, 35, 70, .04);
      padding: 18px;
    }

    .edubia-section-title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: white;
      background: #08265a;
      border-radius: 10px;
      padding: 9px 20px;
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 14px;
    }
    .edubia-section-title::before { content: ""; width: 12px; height: 12px; border-radius: 999px; background: linear-gradient(135deg, #ffb347, #ff7a00); display: inline-block; }

    .edubia-title-right { text-align: right; }
    .edubia-title-left { text-align: left; }

    .edubia-skill { margin: 0 0 13px; }
    .edubia-skill-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .edubia-skill-name { font-weight: 900; font-size: 16px; color: #17233d; }
    .edubia-score-pill { background: #21a45b; color: white; border-radius: 999px; min-width: 60px; padding: 4px 12px; font-size: 13px; font-weight: 900; text-align: center; direction: ltr; }
    .edubia-bar { height: 10px; background: #edf1f5; border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.08); }
    .edubia-fill { height: 100%; border-radius: 999px; background: linear-gradient(180deg, #52c57e, #1f9d58); }

    .edubia-overall-card { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 292px; }
    .edubia-donut {
      width: 136px; height: 136px; border-radius: 50%;
      background: conic-gradient(#fb8500 var(--angle), #fee8c8 var(--angle));
      display: grid; place-items: center; margin: 6px auto 22px; position: relative;
    }
    .edubia-donut::before { content: ""; position: absolute; inset: 15px; border-radius: 50%; background: #fff9ef; box-shadow: inset 0 0 20px rgba(255, 164, 49, .22); }
    .edubia-donut-inner { position: relative; z-index: 1; text-align: center; direction: rtl; }
    .edubia-donut-score { color: #fb8500; font-size: 38px; font-weight: 900; line-height: 1; direction: ltr; }
    .edubia-donut-sub { color: #687590; font-size: 12px; font-weight: 900; margin: 4px 0; }
    .edubia-stars { color: #fb8500; letter-spacing: 2px; font-size: 16px; direction: ltr; }
    .edubia-overall-label { font-weight: 900; font-size: 20px; margin-bottom: 10px; }
    .edubia-ribbon { color: white; background: linear-gradient(135deg, #ffbd73, #f27c0b); padding: 7px 26px; font-size: 15px; font-weight: 900; clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }

    .edubia-dark-strip {
      margin: 18px 0 16px;
      padding: 18px 24px;
      min-height: 112px;
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
    .edubia-pace-box { border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); border-radius: 14px; min-height: 78px; display: grid; place-items: center; text-align: center; }
    .edubia-pace-box strong { color: #ff9f2d; font-size: 26px; font-weight: 900; direction: ltr; }
    .edubia-pace-box span { display:block; color:#b8c3d8; font-size: 13px; font-weight: 800; }
    .edubia-strip-text { font-size: 14px; font-weight: 800; line-height: 1.8; color: #f6f8ff; }
    .edubia-rank-box { text-align: center; color: #ff9420; font-weight: 900; }
    .edubia-rank-box .trophy { font-size: 37px; display: block; line-height: 1; }
    .edubia-rank-box .rank { font-size: 34px; line-height: 1; direction: ltr; }
    .edubia-rank-box .rank-caption { font-size: 13px; color: #ffd8a5; }

    .edubia-summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; direction: ltr; }
    .edubia-summary-cards > * { direction: rtl; }
    .edubia-mini-card { border: 1px solid #dfe6ef; border-radius: 16px; padding: 14px; min-height: 112px; box-shadow: 0 10px 20px rgba(15, 35, 70, .04); border-right: 4px solid #ffac47; position: relative; }
    .edubia-mini-icon { position: absolute; right: 14px; top: 14px; width: 32px; height: 32px; background: #fff5e9; border-radius: 13px; display: grid; place-items: center; font-size: 22px; }
    .edubia-mini-card span { display: block; margin-top: 40px; color: #7d879d; font-size: 14px; font-weight: 800; }
    .edubia-mini-card strong { display: block; margin: 5px 0 0; color: #062658; font-size: 27px; font-weight: 900; direction: ltr; text-align: right; }
    .edubia-mini-card small { color: #7d879d; font-weight: 800; }

    .edubia-page-body { padding: 14px 20px 0; }
    .edubia-table-card { padding: 18px; }
    .edubia-lessons-table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 12px; font-size: 14px; }
    .edubia-lessons-table th { background: #062658; color: #fff; padding: 11px 12px; font-weight: 900; text-align: right; }
    .edubia-lessons-table td { padding: 10px 12px; border-bottom: 1px solid #ecf0f6; background: #fff; font-weight: 800; color: #28344c; }
    .edubia-lessons-table tr:nth-child(even) td { background: #f8fafc; }
    .edubia-grade-pill { display: inline-flex; min-width: 42px; justify-content: center; align-items: center; padding: 4px 10px; border-radius: 999px; color: white; font-weight: 900; background: #21a45b; direction: ltr; }
    .edubia-star { color: #f5a008; font-size: 18px; }
    .edubia-final-grade { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; background: #fffaf2; border: 1px solid #f1e3d1; border-radius: 14px; padding: 16px 20px; font-size: 18px; font-weight: 900; }
    .edubia-grade-square { background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; width: 52px; height: 52px; border-radius: 13px; display: grid; place-items: center; font-size: 22px; font-weight: 900; direction: ltr; box-shadow: 0 10px 18px rgba(245, 132, 20, .2); }

    .edubia-chart-card, .edubia-attendance-card, .edubia-advice-card, .edubia-scale-card { margin-top: 16px; }
    .edubia-chart-wrap { height: 190px; position: relative; direction: ltr; }
    .edubia-chart-wrap svg { width: 100%; height: 100%; display: block; }
    .edubia-chart-labels { display: flex; justify-content: space-between; color: #8a94a8; font-size: 12px; font-weight: 700; direction: rtl; }

    .edubia-attendance-grid { display: grid; grid-template-columns: 1.15fr 1fr 1fr 1fr; gap: 12px; align-items: center; direction: ltr; }
    .edubia-attendance-grid > * { direction: rtl; }
    .edubia-rating-lines { font-weight: 800; color: #17233d; line-height: 2.3; }
    .edubia-rating-lines .stars { color: #fb8500; direction: ltr; display: inline-block; margin-inline-start: 12px; letter-spacing: 2px; }
    .edubia-attendance-stat { border: 1px solid #e3e9f2; border-radius: 14px; min-height: 68px; display: grid; place-items: center; text-align: center; color: #66728c; font-weight: 800; }
    .edubia-attendance-stat strong { color: #08265a; font-size: 26px; direction: ltr; }
    .edubia-attendance-stat.present strong { color: #18a457; }
    .edubia-attendance-stat.absent strong { color: #e53e3e; }

    .edubia-note-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; direction: ltr; }
    .edubia-note-grid > * { direction: rtl; }
    .edubia-note { min-height: 165px; padding: 17px; border-radius: 18px; border: 1px solid #e3e8f0; }
    .edubia-note.green { background: linear-gradient(180deg, #f3fff9, #f7fffb); border-color: #cfeee0; }
    .edubia-note.red { background: linear-gradient(180deg, #fff7f7, #fffafa); border-color: #f0d2d2; }
    .edubia-note.blue { background: linear-gradient(180deg, #f7fbff, #ffffff); border-color: #d9e4f3; }
    .edubia-note.orange { background: linear-gradient(180deg, #fffaf2, #ffffff); border-color: #f1dfca; }
    .edubia-note h3 { margin: 0 0 10px; color: #08265a; font-size: 17px; font-weight: 900; }
    .edubia-note p { margin: 0; color: #5d6678; font-size: 13px; font-weight: 700; line-height: 1.65; }
    .edubia-bullets { margin: 0; padding: 0 18px 0 0; color: #5d6678; font-weight: 700; line-height: 1.55; font-size: 13px; }
    .edubia-bullets li { margin-bottom: 8px; }
    .edubia-bullets li::marker { color: #fb8500; }

    .edubia-badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; direction: ltr; }
    .edubia-badge-grid > * { direction: rtl; }
    .edubia-badge { display: grid; grid-template-columns: 50px 1fr; gap: 12px; align-items: center; border: 1px solid #f0dfca; background: #fffdf9; border-radius: 16px; padding: 14px; min-height: 96px; }
    .edubia-badge-icon { width: 50px; height: 50px; border-radius: 15px; background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; font-size: 27px; display: grid; place-items: center; }
    .edubia-badge strong { display: block; color: #08265a; font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .edubia-badge span { color: #69748b; font-weight: 700; line-height: 1.55; font-size: 13px; }

    .edubia-progress-box { border: 1px solid #e1e8f1; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
    .edubia-course-head { display: flex; justify-content: space-between; align-items: center; font-weight: 900; margin-bottom: 14px; }
    .edubia-progress-pill { background: linear-gradient(135deg, #ffbd73, #f27c0b); color: white; border-radius: 999px; padding: 5px 16px; font-weight: 900; font-size: 12px; }
    .edubia-progress-bar { height: 8px; background: #edf1f6; border-radius: 999px; overflow: hidden; margin-bottom: 12px; direction: ltr; }
    .edubia-progress-bar span { display: block; height: 100%; background: linear-gradient(90deg, #ffbd73, #c46c00); border-radius: 999px; }
    .edubia-progress-box p { margin: 0; color: #69748b; font-weight: 700; line-height: 1.7; font-size: 14px; }

    .edubia-tips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; direction: ltr; }
    .edubia-tips > * { direction: rtl; }
    .edubia-tip { border: 1px solid #e2e9f2; border-radius: 16px; padding: 14px 12px; min-height: 128px; text-align: center; background: linear-gradient(180deg, #fff, #f8fbff); }
    .edubia-tip-icon { font-size: 26px; margin-bottom: 10px; }
    .edubia-tip strong { display: block; color: #08265a; font-weight: 900; margin-bottom: 8px; }
    .edubia-tip p { margin: 0; color: #707a8f; font-weight: 700; line-height: 1.5; font-size: 13px; }

    .edubia-grade-scale { display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px; direction: ltr; }
    .edubia-scale-item { border: 1px solid #e1e8f1; border-radius: 10px; padding: 7px 3px; text-align: center; background: white; }
    .edubia-scale-grade { color: white; border-radius: 9px; padding: 5px 0; font-weight: 900; font-size: 13px; margin-bottom: 5px; direction: ltr; }
    .edubia-scale-range { color: #7c879b; font-size: 11px; font-weight: 800; direction: ltr; }
    .g-green { background: #1fa463; } .g-yellow { background: #efaa0a; } .g-red { background: #ef5252; }

    .edubia-footer { margin-top: 14px; border-top: 1px solid #edf1f6; padding-top: 10px; display: flex; justify-content: space-between; color: #7c879b; font-size: 11px; font-weight: 800; z-index: 2; }

    .edubia-page-plain .edubia-section-title { margin-bottom: 22px; }
    .edubia-page-plain .edubia-card { margin-bottom: 14px; }


    .edubia-next-page .edubia-card { padding: 17px; }
    .edubia-next-page h3 { line-height: 1.25; }
    .edubia-next-page .edubia-section-title { margin-bottom: 12px; }
    .edubia-report-page .edubia-card,
    .edubia-report-page .edubia-note { break-inside: avoid; }
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

  function limitText(text, maxLength = 230) {
    const value = String(text || "").trim().replace(/\s+/g, " ");
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trim()}...`;
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


  function normalizeReportDraft(draft) {
    if (!draft || typeof draft !== "object") return null;
    const hasDraftShape = draft.fields || draft.skills || draft.sessions || draft.lessons || draft.badges || draft.modules;
    if (!hasDraftShape) return null;
    return {
      app: draft.app || "edubia-report",
      v: draft.v || 2,
      lang: draft.lang || "ar",
      logoData: draft.logoData ?? null,
      fields: { ...(draft.fields || {}) },
      skills: Array.isArray(draft.skills) ? draft.skills : [],
      sessions: Array.isArray(draft.sessions) ? draft.sessions : [],
      lessons: Array.isArray(draft.lessons) ? draft.lessons : [],
      badges: Array.isArray(draft.badges) ? draft.badges : [],
      modules: Array.isArray(draft.modules) ? draft.modules : [],
    };
  }

  function numericText(value, fallback = "") {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  }

  function normalizeDuration(value) {
    const text = numericText(value, DEFAULT_DURATION).trim();
    if (!text) return DEFAULT_DURATION;
    return /دقيقة|minute|min/i.test(text) ? text : `${text} دقيقة`;
  }

  function gradeScore(grade) {
    const normalized = String(grade || "").trim().toUpperCase().replace(/\s+/g, "");
    const map = { "A+": 4.9, "+A": 4.9, "A": 4.5, "A-": 4.2, "-A": 4.2, "B+": 3.9, "+B": 3.9, "B": 3.5, "B-": 3.2, "-B": 3.2, "C+": 2.9, "+C": 2.9, "C": 2.5, "C-": 2.1, "-C": 2.1, "F": 1 };
    return map[normalized] || 0;
  }

  function draftSkillItems(draft, fallbackSkills) {
    if (!draft?.skills?.length) return fallbackSkills;
    return draft.skills.map((item, index) => ({
      label: item.ar || item.en || fallbackSkills[index]?.label || `مهارة ${index + 1}`,
      field: fallbackSkills[index]?.field || `skill_${index + 1}`,
      score: clamp(asNumber(item.v, fallbackSkills[index]?.score || 0), 0, 5),
      en: item.en || fallbackSkills[index]?.en || "",
    }));
  }

  function draftLessonItems(draft, fallbackLessons, fallbackAvg) {
    if (!draft?.lessons?.length) return fallbackLessons;
    return draft.lessons.map((item, index) => {
      const score = gradeScore(item.grade) || fallbackAvg || 0;
      return {
        lesson_title: item.ar || item.en || `جلسة ${index + 1}`,
        lesson_title_en: item.en || item.ar || `S${index + 1}`,
        grade: item.grade || gradeFromScore(score),
        quiz: item.quiz || "—",
        understanding_score: score,
        problem_solving_score: score,
        practical_score: score,
        exercise_score: score,
        participation_score: score,
      };
    });
  }

  function draftSessionScores(draft, fallbackScores) {
    if (!draft?.sessions?.length) return fallbackScores;
    return draft.sessions.map(item => clamp(asNumber(item.v, 0), 0, 5));
  }

  function defaultModules(course, progress) {
    const safeCourse = course || "Python";
    return [
      {
        ar: safeCourse,
        en: safeCourse,
        status: "ongoing",
        pct: progress || 55,
        d_ar: "يتقدم الطالب في المساق الحالي من خلال التطبيق العملي وحل التمارين وبناء مشروعات صغيرة خطوة بخطوة.",
        d_en: "Current course progress with hands-on practice and guided projects.",
      },
      {
        ar: "Web Development",
        en: "Web Development",
        status: "soon",
        pct: 0,
        d_ar: "يتعلم الطلاب تصميم وتطوير مواقع الويب باستخدام HTML وCSS وJavaScript وإنشاء صفحات ومواقع تفاعلية.",
        d_en: "Design and build interactive websites using HTML, CSS, and JavaScript.",
      },
      {
        ar: "App Development",
        en: "App Development",
        status: "soon",
        pct: 0,
        d_ar: "كورس لتصميم وتطوير تطبيقات الهواتف الذكية، حيث يتعلم الطلاب كيفية إنشاء تطبيقاتهم الخاصة وإضافة مميزات مختلفة لها.",
        d_en: "Mobile application development with practical app features.",
      },
      {
        ar: "Game Development",
        en: "Game Development",
        status: "soon",
        pct: 0,
        d_ar: "يتعلم الطلاب كيفية تصميم وتطوير الألعاب، من إنشاء الشخصيات والمراحل إلى إضافة المؤثرات والقواعد البرمجية.",
        d_en: "Game design and development through characters, stages, effects, and rules.",
      },
      {
        ar: "UI/UX Design",
        en: "UI/UX Design",
        status: "soon",
        pct: 0,
        d_ar: "يتعلم الطلاب تصميم واجهات المستخدم وتجربة المستخدم، وكيفية جعل التطبيقات والمواقع سهلة الاستخدام وجذابة للمستخدمين.",
        d_en: "User interface and user experience design fundamentals.",
      },
      {
        ar: "Graphic Design",
        en: "Graphic Design",
        status: "soon",
        pct: 0,
        d_ar: "كورس يركز على التصميم الإبداعي باستخدام أدوات التصميم المختلفة لإنشاء الشعارات، البوسترات، الإعلانات، والعروض التقديمية.",
        d_en: "Creative design for logos, posters, ads, and presentations.",
      },
      {
        ar: "Artificial Intelligence (AI)",
        en: "Artificial Intelligence (AI)",
        status: "soon",
        pct: 0,
        d_ar: "يتعرف الطلاب على أساسيات الذكاء الاصطناعي وتطبيقاته المختلفة، وكيفية تدريب النماذج وإنشاء مشاريع تعتمد على تقنيات AI الحديثة.",
        d_en: "AI basics, model training, and modern AI-based projects.",
      },
    ];
  }

  function normalizeBadgeItems(items) {
    return (items || []).map(item => ({
      ic: item.ic || item.icon || "🏅",
      t_ar: item.t_ar || item.title || "شارة",
      t_en: item.t_en || "Badge",
      d_ar: item.d_ar || item.text || "تم منح هذه الشارة بناءً على أداء الطالب خلال الفترة.",
      d_en: item.d_en || "Awarded based on the student's performance during this period.",
    }));
  }

  function defaultBadges(metricsLike) {
    const hwDone = metricsLike.homeworkDone ?? 0;
    const hwTotal = metricsLike.homeworkTotal ?? 0;
    const attendance = metricsLike.attendancePct ?? 0;
    return normalizeBadgeItems([
      attendance >= 95 ? {
        ic: "✅",
        t_ar: "حضور كامل",
        t_en: "Perfect Attendance",
        d_ar: `تُمنح عند تحقيق نسبة حضور ${attendance}٪ خلال الفترة المحددة، وقد حضر الطالب معظم الحصص المسجلة.`,
        d_en: `Awarded for an attendance rate of ${attendance}% during the selected period.`,
      } : {
        ic: "⏱️",
        t_ar: "منضبط بالوقت",
        t_en: "Timely Titan",
        d_ar: "تُمنح للطالب الذي يظهر التزامًا واضحًا بمواعيد الحصص والمتابعة.",
        d_en: "Awarded for clear punctuality and steady follow-up.",
      },
      {
        ic: "📚",
        t_ar: "متابع للواجبات",
        t_en: "Homework Tracker",
        d_ar: `تُمنح لإتمام ${hwDone}/${hwTotal || 0} من الواجبات المطلوبة خلال الفترة.`,
        d_en: `Awarded for completing ${hwDone}/${hwTotal || 0} homework tasks during the period.`,
      },
      {
        ic: "⚡",
        t_ar: "وتيرة تعلم جيدة",
        t_en: "Fast Learner",
        d_ar: `تُمنح للطالب الذي يحقق وتيرة تعلم مناسبة. الوتيرة الحالية ${metricsLike.learningPaceText || "-"} حصة/درس.`,
        d_en: `Awarded for maintaining an efficient learning pace of ${metricsLike.learningPaceText || "-"} classes per lesson.`,
      },
    ]);
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

    const draft = normalizeReportDraft(payload.reportDraft || null);
    const draftFields = draft?.fields || {};
    const baseMetrics = {
      homeworkDone,
      homeworkTotal,
      attendancePct,
      learningPaceText: learningPace ? learningPace.toFixed(2) : "-",
    };
    const finalSkills = draftSkillItems(draft, skills);
    const finalAvg = finalSkills.length ? average(finalSkills.map(skill => skill.score), 0) : avg;
    const finalLessons = draftLessonItems(draft, lessons, finalAvg);
    const finalSessions = draftSessionScores(draft, chartScores);
    const finalBadges = normalizeBadgeItems(draft?.badges?.length ? draft.badges : defaultBadges(baseMetrics));
    const finalModules = draft?.modules?.length ? draft.modules : defaultModules(course, courseProgress);
    const fieldsPresent = asNumber(draftFields.present, present);
    const fieldsAbsent = asNumber(draftFields.absent, absent);
    const fieldsTotal = asNumber(draftFields.classesTotal, attendanceTotal || fieldsPresent + fieldsAbsent);
    const fieldsAttendance = asNumber(draftFields.attendance, attendancePct);
    const fieldsHwDone = asNumber(draftFields.hwDone, homeworkDone);
    const fieldsHwTotal = asNumber(draftFields.hwTotal, homeworkTotal);
    const fieldsPunctJoin = asNumber(draftFields.punctJoin, average(feedbackItems.map(item => item.commitment_score), finalAvg || 0));
    const fieldsPunctSubmit = asNumber(draftFields.punctSubmit, fieldsHwTotal ? (fieldsHwDone / fieldsHwTotal) * 5 : homeworkPct / 20);
    const finalCourseProgress = clamp(asNumber(finalModules[0]?.pct, courseProgress), 0, 100);

    return {
      studentName: draftFields.student || payload.studentName || payload.student?.name || latest.student_name || "اسم الطالب",
      course: draftFields.course || course,
      level: draftFields.level || payload.level || DEFAULT_LEVEL,
      date: draftFields.date || latestDate,
      dateText: formatDate(draftFields.date || latestDate),
      issueDate: draftFields.issueDate || new Date().toISOString().slice(0, 10),
      monthText: draftFields.period || getArabicMonth(latestDate),
      instructor: draftFields.teacher || payload.instructorName || INSTRUCTOR_AR,
      sessionNo: draftFields.sessionNo || sessionNo,
      duration: normalizeDuration(draftFields.duration || payload.duration || DEFAULT_DURATION),
      skills: finalSkills,
      avg: finalAvg,
      avgText: finalAvg ? round1(finalAvg) : "-",
      grade: draftFields.finalGrade || gradeFromScore(finalAvg || 0),
      rating: draftFields.rating || ratingLabel(finalAvg),
      rank: draftFields.topPct !== undefined && draftFields.topPct !== "" ? `أفضل ${numericText(draftFields.topPct, "0")}٪` : rankLabel(finalAvg),
      stars: starString(finalAvg),
      totalFeedback,
      sessionCount: asNumber(draftFields.classesDone, totalFeedback || sessions.length || 0),
      attendancePct: fieldsAttendance,
      present: fieldsPresent,
      absent: fieldsAbsent,
      attendanceTotal: fieldsTotal,
      homeworkDone: fieldsHwDone,
      homeworkTotal: fieldsHwTotal,
      homeworkPct: fieldsHwTotal ? Math.round((fieldsHwDone / fieldsHwTotal) * 100) : asNumber(draftFields.homeworkPct, homeworkPct),
      learningPace: asNumber(draftFields.pace, learningPace),
      learningPaceText: numericText(draftFields.pace, learningPace ? learningPace.toFixed(2) : "-"),
      courseProgress: finalCourseProgress,
      lessons: finalLessons,
      chartScores: finalSessions,
      strengths: splitText(draftFields.strengths, latest.strengths || "مستوى الطالب جيد، ويظهر تفاعلًا واضحًا داخل الحصة."),
      improvements: splitText(draftFields.improve, latest.improvement_areas || "الاستمرار في التدريب العملي وتسليم الواجبات في موعدها."),
      explained: splitText(latest.explained, "تمت متابعة مفاهيم الدرس والتطبيق العملي عليها."),
      teacherNote: draftFields.teacherNote || "",
      nextStep: draftFields.homework || "",
      commitmentAvg: fieldsPunctJoin,
      participationAvg: average(feedbackItems.map(item => item.participation_score), finalAvg || 0),
      submitAvg: fieldsPunctSubmit,
      selectedRange: payload.selectedRange || null,
      rawFeedbackItems: feedbackItems,
      rawSessions: sessions,
      badges: finalBadges,
      modules: finalModules,
      reportDraft: draft,
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
      const score = lessonAverage(item) || gradeScore(item.grade) || metrics.avg;
      const grade = item.grade || gradeFromScore(score);
      const quiz = item.quiz || "—";
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.lesson_title || item.ar || `جلسة ${index + 1}`)}</td>
          <td><span class="edubia-grade-pill">${escapeHtml(grade)}</span></td>
          <td><span class="edubia-star">${escapeHtml(quiz)}</span></td>
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

  function renderModules(modules) {
    const items = Array.isArray(modules) ? modules : [];
    const current = items.filter(module => String(module.status || "").toLowerCase() === "ongoing");
    const upcoming = items.filter(module => String(module.status || "").toLowerCase() !== "ongoing");
    const renderModule = (module, isCurrent = false) => `
      <div class="edubia-progress-box">
        <div class="edubia-course-head">
          <strong>${escapeHtml(module.ar || module.en || "Module")}</strong>
          <span class="edubia-progress-pill" style="${isCurrent ? "" : "background:#e6edf7;color:#08265a;"}">${isCurrent ? `جارية ${escapeHtml(clamp(asNumber(module.pct, 0), 0, 100))}٪` : "قريبًا"}</span>
        </div>
        ${isCurrent ? `<div class="edubia-progress-bar"><span style="width:${clamp(asNumber(module.pct, 0), 0, 100)}%"></span></div>` : ""}
        <p>${escapeHtml(module.d_ar || module.d_en || "سيتم إضافة تفاصيل هذا المستوى قريبًا.")}</p>
      </div>`;
    return `
      <h3 style="margin:0 0 14px; color:#08265a; font-size:17px;">التقدم في الدراسة الحالية</h3>
      ${(current.length ? current : items.slice(0, 1)).map(module => renderModule(module, true)).join("")}
      <h3 style="margin:10px 0 14px; color:#8a94a8; font-size:16px;">المستويات القادمة (قريبًا)</h3>
      ${(upcoming.length ? upcoming : items.slice(1)).slice(0, 6).map(module => renderModule(module, false)).join("")}
    `;
  }

  function reportHtml(metrics) {
    const stripText = `أداء ${metrics.studentName} يضعه ضمن ${metrics.rank} من الطلاب في مساق ${metrics.course} هذا الشهر.`;
    const teacherNote = metrics.teacherNote || [
      metrics.explained.length ? `تم خلال آخر متابعة: ${metrics.explained.join("، ")}.` : "",
      metrics.strengths.length ? `نقاط مميزة: ${metrics.strengths.join("، ")}.` : "",
      metrics.improvements.length ? `نقطة التركيز القادمة: ${metrics.improvements[0]}.` : "",
    ].filter(Boolean).join(" ");

    const nextStep = metrics.nextStep || (metrics.improvements.length
      ? `الاستمرار في تطبيق ما تم شرحه داخل ${metrics.course} مع التركيز على ${metrics.improvements.join("، ")}.`
      : `الاستمرار في تعلم مفاهيم جديدة في ${metrics.course} وتطبيقها في مشروعات أكثر تحديًا.`);

    const badges = normalizeBadgeItems(metrics.badges?.length ? metrics.badges : defaultBadges(metrics));
    const modules = Array.isArray(metrics.modules) && metrics.modules.length ? metrics.modules : defaultModules(metrics.course, metrics.courseProgress);

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
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card edubia-attendance-card" style="margin-top:0; margin-bottom:16px;">
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

          <section class="edubia-note-grid">
            <div class="edubia-note green"><h3>💪 نقاط القوة</h3>${renderList(metrics.strengths)}</div>
            <div class="edubia-note red"><h3>🎯 مجالات التحسين</h3>${renderList(metrics.improvements)}</div>
            <div class="edubia-note blue"><h3>📝 ملاحظات المعلم</h3><p>${escapeHtml(limitText(teacherNote || "تم حفظ بيانات المتابعة وسيتم تحديث الملاحظات بعد الجلسة القادمة.", 260))}</p></div>
            <div class="edubia-note orange"><h3>📌 الخطوة الجاية</h3><p>${escapeHtml(limitText(nextStep, 210))}</p></div>
          </section>

        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card" style="margin-top:0;">
            <div class="edubia-title-right"><div class="edubia-section-title">الشارات المكتسبة</div></div>
            <div class="edubia-badge-grid">
              ${badges.map(badge => `
                <div class="edubia-badge"><div class="edubia-badge-icon">${escapeHtml(badge.ic)}</div><div><strong>${escapeHtml(badge.t_ar)}</strong><span>${escapeHtml(badge.d_ar)}</span></div></div>
              `).join("")}
            </div>
          </section>
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain edubia-next-page">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card" style="margin-top:0;">
            <div class="edubia-title-right"><div class="edubia-section-title">ماذا بعد؟</div></div>
            ${renderModules(modules)}
          </section>
        </div>
      </div>

      <div class="edubia-report-page edubia-page-plain edubia-next-page">
        <div class="edubia-report-content edubia-page-body">
          <section class="edubia-card edubia-advice-card" style="margin-top:0;">
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
    const draft = normalizeReportDraft(source.reportDraft || null);
    if (draft) {
      return {
        app: "edubia-report",
        v: 2,
        lang: draft.lang || "ar",
        logoData: draft.logoData ?? null,
        fields: { ...(draft.fields || {}) },
        skills: (draft.skills || []).map(item => ({ ar: item.ar || "", en: item.en || "", v: asNumber(item.v, 0) })),
        sessions: (draft.sessions || []).map(item => ({ ar: item.ar || "", en: item.en || "", v: asNumber(item.v, 0) })),
        lessons: (draft.lessons || []).map(item => ({ ar: item.ar || "", en: item.en || "", grade: item.grade || "", quiz: item.quiz || "—" })),
        badges: normalizeBadgeItems(draft.badges || []),
        modules: (draft.modules || []).map(item => ({
          ar: item.ar || "",
          en: item.en || "",
          status: item.status || "soon",
          pct: asNumber(item.pct, 0),
          d_ar: item.d_ar || "",
          d_en: item.d_en || "",
        })),
      };
    }

    const skillEn = [
      "Concept Understanding",
      "Problem Solving (Logic)",
      "Coding & Implementation",
      "Exercises & Projects",
      "Engagement & Participation",
    ];
    const lessonRows = metrics.lessons.slice(0, 8);
    const sessionsRows = metrics.chartScores.length ? metrics.chartScores : lessonRows.map(item => lessonAverage(item) || metrics.avg || 0);
    const cleanDuration = String(metrics.duration || DEFAULT_DURATION).replace(/\s*دقيقة\s*/g, "").trim() || "60";

    return {
      app: "edubia-report",
      v: 2,
      lang: "ar",
      logoData: null,
      fields: {
        student: metrics.studentName,
        course: metrics.course,
        level: metrics.level,
        teacher: metrics.instructor,
        period: metrics.monthText,
        date: metrics.dateText,
        issueDate: formatDate(metrics.issueDate || new Date().toISOString().slice(0, 10)),
        sessionNo: String(metrics.sessionNo || ""),
        duration: cleanDuration,
        topPct: String(metrics.rank || "0").replace(/[^0-9.]/g, "") || "0",
        pace: metrics.learningPaceText,
        attendance: String(metrics.attendancePct),
        hwDone: String(metrics.homeworkDone),
        hwTotal: String(metrics.homeworkTotal || 0),
        present: String(metrics.present),
        absent: String(metrics.absent),
        classesDone: String(metrics.sessionCount),
        classesTotal: String(metrics.attendanceTotal || metrics.sessionCount),
        punctJoin: round1(metrics.commitmentAvg || 0),
        punctSubmit: round1(metrics.submitAvg || 0),
        finalGrade: metrics.grade,
        teacherNote: metrics.teacherNote || [
          metrics.explained.length ? `تم خلال آخر متابعة: ${metrics.explained.join("، ")}.` : "",
          metrics.strengths.length ? `نقاط مميزة: ${metrics.strengths.join("، ")}.` : "",
          metrics.improvements.length ? `نقطة التركيز القادمة: ${metrics.improvements[0]}.` : "",
        ].filter(Boolean).join(" "),
        homework: metrics.nextStep || (metrics.improvements.length ? `الاستمرار في التدريب على ${metrics.improvements.join("، ")}.` : "الاستمرار في حل الواجبات والتطبيق العملي بانتظام."),
        strengths: metrics.strengths.join("\n"),
        improve: metrics.improvements.join("\n"),
      },
      skills: metrics.skills.map((skill, index) => ({
        ar: skill.label,
        en: skill.en || skillEn[index] || skill.label,
        v: Number(round1(skill.score || 0)),
      })),
      sessions: sessionsRows.map((score, index) => ({
        ar: `جلسة ${index + 1}`,
        en: `S${index + 1}`,
        v: Number(round1(score || 0)),
      })),
      lessons: lessonRows.map((item, index) => {
        const score = lessonAverage(item) || gradeScore(item.grade) || metrics.avg || 0;
        return {
          ar: item.lesson_title || item.ar || `جلسة ${index + 1}`,
          en: item.lesson_title_en || item.en || item.lesson_title || `S${index + 1}`,
          grade: item.grade || gradeFromScore(score),
          quiz: item.quiz || "—",
        };
      }),
      badges: normalizeBadgeItems(metrics.badges),
      modules: metrics.modules.map(item => ({
        ar: item.ar || "",
        en: item.en || "",
        status: item.status || "soon",
        pct: asNumber(item.pct, 0),
        d_ar: item.d_ar || "",
        d_en: item.d_en || "",
      })),
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

  const COMMON_BADGE_EMOJIS = ["⏱️", "⚡", "✅", "📚", "🏆", "⭐", "🎯", "💪", "🧠", "🚀", "🌱", "🤝", "💬", "🔥", "🎓", "📅", "📝", "💡", "👨‍💻", "👩‍💻", "🧩", "🎨", "📈", "🥇", "🥈", "🥉", "💯", "✨", "🌟", "👏"];

  function addReportEditorStyleOnce() {
    if (document.getElementById("edubia-report-editor-style")) return;
    const style = document.createElement("style");
    style.id = "edubia-report-editor-style";
    style.textContent = `
      .report-editor-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #071226;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 390px;
        gap: 18px;
        padding: 18px;
        direction: rtl;
        font-family: "Cairo", "Inter", sans-serif;
      }
      .report-editor-preview {
        background: #f5f7fb;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 18px;
        overflow: auto;
        padding: 22px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .report-editor-preview .edubia-report-preview-root {
        position: static !important;
        left: auto !important;
        top: auto !important;
        z-index: auto !important;
        pointer-events: auto !important;
        width: 794px !important;
        transform: scale(.86);
        transform-origin: top center;
        margin-bottom: -140px;
      }
      .report-editor-panel {
        overflow: auto;
        border: 1px solid rgba(255,255,255,.13);
        border-radius: 18px;
        background: #111d38;
        color: #eef5ff;
        padding: 16px;
        box-shadow: 0 20px 50px rgba(0,0,0,.3);
      }
      .report-editor-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px; }
      .report-editor-head h3 { margin:0; color:white; font-size:22px; }
      .report-editor-head p { margin:5px 0 0; color:#94a3b8; font-size:13px; line-height:1.55; }
      .report-editor-close { border:0; background:#293858; color:#fff; width:36px; height:36px; border-radius:10px; font-weight:900; cursor:pointer; }
      .report-editor-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
      .report-editor-actions button, .report-editor-add-btn {
        border:0;
        border-radius:12px;
        padding:11px 12px;
        font-weight:900;
        cursor:pointer;
      }
      .report-editor-actions .pdf { color:white; background:linear-gradient(135deg,#ff9f26,#f27c0b); }
      .report-editor-actions .json { color:#08265a; background:linear-gradient(135deg,#dbeafe,#ffffff); }
      .report-editor-section { border:1px solid rgba(255,255,255,.12); border-radius:15px; padding:13px; margin-bottom:13px; background:rgba(255,255,255,.035); }
      .report-editor-section h4 { margin:0 0 10px; color:white; font-size:16px; display:flex; gap:8px; align-items:center; }
      .report-editor-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .report-editor-field { display:grid; gap:5px; min-width:0; }
      .report-editor-field.full { grid-column:1/-1; }
      .report-editor-field span { color:#cbd5e1; font-size:12px; font-weight:800; }
      .report-editor-field input, .report-editor-field textarea, .report-editor-field select {
        width:100%;
        border:1px solid rgba(255,255,255,.14);
        background:#1b2948;
        color:#fff;
        border-radius:10px;
        padding:9px 10px;
        outline:none;
        font:inherit;
      }
      .report-editor-field textarea { min-height:76px; resize:vertical; line-height:1.55; }
      .report-editor-row { border:1px solid rgba(255,255,255,.1); border-radius:13px; padding:10px; margin-bottom:10px; background:rgba(255,255,255,.035); }
      .report-editor-row-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; color:#ffbd73; font-weight:900; }
      .report-editor-remove { border:0; background:#4b2231; color:#fecdd3; border-radius:9px; padding:5px 8px; cursor:pointer; font-weight:900; }
      .report-editor-add-btn { width:100%; background:transparent; color:#ffbd73; border:1px dashed #f27c0b; margin-top:4px; }
      .report-editor-note { color:#94a3b8; font-size:12px; line-height:1.55; margin:8px 0 0; }
      @media (max-width: 1050px) {
        .report-editor-overlay { grid-template-columns:1fr; }
        .report-editor-panel { max-height:58vh; order:1; }
        .report-editor-preview { order:2; }
        .report-editor-preview .edubia-report-preview-root { transform: scale(.72); }
      }
    `;
    document.head.appendChild(style);
  }

  function cloneReportData(data) {
    return JSON.parse(JSON.stringify(data || {}));
  }

  function setByPath(object, path, value) {
    const parts = String(path).split(".");
    let cursor = object;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (cursor[key] === undefined) cursor[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cursor = cursor[key];
    }
    const last = parts[parts.length - 1];
    cursor[last] = value;
  }

  function editorInput(path, label, value, type = "text", extra = "") {
    return `<label class="report-editor-field ${extra}"><span>${escapeHtml(label)}</span><input data-edit-path="${escapeHtml(path)}" type="${type}" value="${escapeHtml(value ?? "")}" /></label>`;
  }

  function editorTextarea(path, label, value, extra = "full") {
    return `<label class="report-editor-field ${extra}"><span>${escapeHtml(label)}</span><textarea data-edit-path="${escapeHtml(path)}">${escapeHtml(value ?? "")}</textarea></label>`;
  }

  function editorSelect(path, label, value, options, extra = "") {
    return `<label class="report-editor-field ${extra}"><span>${escapeHtml(label)}</span><select data-edit-path="${escapeHtml(path)}">${options.map(option => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
  }

  function renderEditorPanel(data, preferredFormat) {
    const f = data.fields || {};
    const statusOptions = [{ value: "ongoing", label: "جارية" }, { value: "soon", label: "قريبًا" }];
    return `
      <datalist id="edubiaBadgeEmojiList">${COMMON_BADGE_EMOJIS.map(emoji => `<option value="${escapeHtml(emoji)}"></option>`).join("")}</datalist>
      <div class="report-editor-head">
        <div>
          <h3>تعديل التقرير قبل التحميل</h3>
          <p>عدّل البيانات هنا، وستتحدث المعاينة مباشرة. التحميل كـ PDF يستخدم نفس شكل تقرير Edubia، والـ JSON يستخدم نفس أساس ملف البيانات.</p>
        </div>
        <button class="report-editor-close" data-editor-close>×</button>
      </div>
      <div class="report-editor-actions">
        <button class="pdf" data-editor-download="pdf">📄 حفظ PDF</button>
        <button class="json" data-editor-download="json">🧾 حفظ JSON</button>
      </div>
      <section class="report-editor-section">
        <h4>🧑‍🎓 بيانات الطالب والجلسة</h4>
        <div class="report-editor-grid">
          ${editorInput("fields.student", "اسم الطالب", f.student)}
          ${editorInput("fields.course", "المساق", f.course)}
          ${editorInput("fields.level", "المستوى", f.level)}
          ${editorInput("fields.teacher", "المعلم", f.teacher)}
          ${editorInput("fields.period", "الشهر / الفترة", f.period)}
          ${editorInput("fields.date", "التاريخ", f.date)}
          ${editorInput("fields.issueDate", "تاريخ الإصدار", f.issueDate)}
          ${editorInput("fields.sessionNo", "رقم الجلسة", f.sessionNo)}
          ${editorInput("fields.duration", "المدة بالدقائق", f.duration)}
          ${editorInput("fields.finalGrade", "الدرجة النهائية", f.finalGrade)}
        </div>
      </section>
      <section class="report-editor-section">
        <h4>📊 الإحصائيات والحضور</h4>
        <div class="report-editor-grid">
          ${editorInput("fields.topPct", "ضمن أفضل (%)", f.topPct, "number")}
          ${editorInput("fields.pace", "وتيرة التعلم", f.pace, "number")}
          ${editorInput("fields.attendance", "نسبة الحضور (%)", f.attendance, "number")}
          ${editorInput("fields.hwDone", "الواجبات المنجزة", f.hwDone, "number")}
          ${editorInput("fields.hwTotal", "إجمالي الواجبات", f.hwTotal, "number")}
          ${editorInput("fields.present", "عدد الحضور", f.present, "number")}
          ${editorInput("fields.absent", "عدد الغياب", f.absent, "number")}
          ${editorInput("fields.classesDone", "حصص منجزة", f.classesDone, "number")}
          ${editorInput("fields.classesTotal", "إجمالي الحصص", f.classesTotal, "number")}
          ${editorInput("fields.punctJoin", "الالتحاق بالوقت (0-5)", f.punctJoin, "number")}
          ${editorInput("fields.punctSubmit", "التسليم بالوقت (0-5)", f.punctSubmit, "number")}
        </div>
      </section>
      <section class="report-editor-section">
        <h4>📝 نقاط القوة والتحسين والواجب</h4>
        <div class="report-editor-grid">
          ${editorTextarea("fields.strengths", "نقاط القوة", f.strengths)}
          ${editorTextarea("fields.improve", "مجالات التحسين", f.improve)}
          ${editorTextarea("fields.teacherNote", "ملاحظات المعلم", f.teacherNote)}
          ${editorTextarea("fields.homework", "الخطوة الجاية / الواجب", f.homework)}
        </div>
      </section>
      <section class="report-editor-section">
        <h4>⭐ المهارات (0 - 5)</h4>
        ${(data.skills || []).map((skill, index) => `
          <div class="report-editor-row">
            <div class="report-editor-row-head">مهارة ${index + 1}</div>
            <div class="report-editor-grid">
              ${editorInput(`skills.${index}.ar`, "العنوان عربي", skill.ar)}
              ${editorInput(`skills.${index}.en`, "العنوان إنجليزي", skill.en)}
              ${editorInput(`skills.${index}.v`, "التقييم", skill.v, "number", "full")}
            </div>
          </div>`).join("")}
      </section>
      <section class="report-editor-section">
        <h4>📈 التقدم عبر الجلسات</h4>
        ${(data.sessions || []).map((session, index) => `
          <div class="report-editor-row">
            <div class="report-editor-row-head">جلسة ${index + 1}</div>
            <div class="report-editor-grid">
              ${editorInput(`sessions.${index}.ar`, "اسم الجلسة عربي", session.ar)}
              ${editorInput(`sessions.${index}.en`, "اسم الجلسة إنجليزي", session.en)}
              ${editorInput(`sessions.${index}.v`, "القيمة", session.v, "number", "full")}
            </div>
          </div>`).join("")}
      </section>
      <section class="report-editor-section">
        <h4>📚 تفصيل الدروس</h4>
        ${(data.lessons || []).map((lesson, index) => `
          <div class="report-editor-row">
            <div class="report-editor-row-head">درس ${index + 1}<button type="button" class="report-editor-remove" data-editor-remove="lessons" data-editor-index="${index}">حذف</button></div>
            <div class="report-editor-grid">
              ${editorInput(`lessons.${index}.ar`, "الدرس عربي", lesson.ar)}
              ${editorInput(`lessons.${index}.en`, "الدرس إنجليزي", lesson.en)}
              ${editorInput(`lessons.${index}.grade`, "الدرجة", lesson.grade)}
              ${editorInput(`lessons.${index}.quiz`, "الاختبار", lesson.quiz)}
            </div>
          </div>`).join("")}
        <button type="button" class="report-editor-add-btn" data-editor-add="lessons">+ إضافة درس</button>
      </section>
      <section class="report-editor-section">
        <h4>🏅 الشارات المكتسبة</h4>
        <p class="report-editor-note">خانة الإيموجي تقبل أي Emoji مباشرة، ويمكنك اختيار أو كتابة أي رمز مثل ✅ ⚡ 🏆 📚.</p>
        ${(data.badges || []).map((badge, index) => `
          <div class="report-editor-row">
            <div class="report-editor-row-head">شارة ${index + 1}<button type="button" class="report-editor-remove" data-editor-remove="badges" data-editor-index="${index}">حذف</button></div>
            <div class="report-editor-grid">
              <label class="report-editor-field"><span>الإيموجي</span><input list="edubiaBadgeEmojiList" data-edit-path="badges.${index}.ic" value="${escapeHtml(badge.ic || "🏅")}" /></label>
              ${editorInput(`badges.${index}.t_ar`, "العنوان عربي", badge.t_ar)}
              ${editorInput(`badges.${index}.t_en`, "العنوان إنجليزي", badge.t_en)}
              ${editorTextarea(`badges.${index}.d_ar`, "الوصف عربي", badge.d_ar)}
              ${editorTextarea(`badges.${index}.d_en`, "الوصف إنجليزي", badge.d_en)}
            </div>
          </div>`).join("")}
        <button type="button" class="report-editor-add-btn" data-editor-add="badges">+ إضافة شارة</button>
      </section>
      <section class="report-editor-section">
        <h4>🧭 الوحدات القادمة</h4>
        ${(data.modules || []).map((module, index) => `
          <div class="report-editor-row">
            <div class="report-editor-row-head">وحدة ${index + 1}<button type="button" class="report-editor-remove" data-editor-remove="modules" data-editor-index="${index}">حذف</button></div>
            <div class="report-editor-grid">
              ${editorInput(`modules.${index}.ar`, "الاسم عربي", module.ar)}
              ${editorInput(`modules.${index}.en`, "الاسم إنجليزي", module.en)}
              ${editorSelect(`modules.${index}.status`, "الحالة", module.status, statusOptions)}
              ${editorInput(`modules.${index}.pct`, "نسبة التقدم", module.pct, "number")}
              ${editorTextarea(`modules.${index}.d_ar`, "الوصف عربي", module.d_ar)}
              ${editorTextarea(`modules.${index}.d_en`, "الوصف إنجليزي", module.d_en)}
            </div>
          </div>`).join("")}
        <button type="button" class="report-editor-add-btn" data-editor-add="modules">+ إضافة وحدة</button>
      </section>
    `;
  }

  function openReportEditor(payload, preferredFormat = "pdf") {
    addStyleOnce();
    addReportEditorStyleOnce();
    const data = cloneReportData(buildReportData(payload || {}));
    document.querySelector(".report-editor-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "report-editor-overlay";
    overlay.innerHTML = `<main class="report-editor-preview"></main><aside class="report-editor-panel"></aside>`;
    document.body.appendChild(overlay);
    const preview = overlay.querySelector(".report-editor-preview");
    const panel = overlay.querySelector(".report-editor-panel");
    let previewTimer = null;

    function updatePreview() {
      const metrics = buildMetrics({ reportDraft: data });
      preview.innerHTML = `<div class="edubia-report-root edubia-report-preview-root">${reportHtml(metrics)}</div>`;
    }

    function schedulePreview() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(updatePreview, 120);
    }

    function renderPanel() {
      panel.innerHTML = renderEditorPanel(data, preferredFormat);
    }

    function addItem(type) {
      if (type === "lessons") data.lessons.push({ ar: "درس جديد", en: "New lesson", grade: "A", quiz: "—" });
      if (type === "badges") data.badges.push({ ic: "🏅", t_ar: "شارة جديدة", t_en: "New Badge", d_ar: "وصف الشارة الجديدة.", d_en: "New badge description." });
      if (type === "modules") data.modules.push({ ar: "وحدة جديدة", en: "New module", status: "soon", pct: 0, d_ar: "وصف الوحدة القادمة.", d_en: "Upcoming module description." });
      renderPanel();
      updatePreview();
    }

    panel.addEventListener("input", event => {
      const target = event.target;
      const path = target?.dataset?.editPath;
      if (!path) return;
      setByPath(data, path, target.value);
      schedulePreview();
    });

    panel.addEventListener("change", event => {
      const target = event.target;
      const path = target?.dataset?.editPath;
      if (!path) return;
      setByPath(data, path, target.value);
      schedulePreview();
    });

    panel.addEventListener("click", async event => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.editorClose !== undefined) {
        overlay.remove();
        return;
      }
      if (target.dataset.editorAdd) {
        addItem(target.dataset.editorAdd);
        return;
      }
      if (target.dataset.editorRemove) {
        const collection = target.dataset.editorRemove;
        const index = Number(target.dataset.editorIndex);
        if (Array.isArray(data[collection]) && Number.isFinite(index)) {
          data[collection].splice(index, 1);
          renderPanel();
          updatePreview();
        }
        return;
      }
      if (target.dataset.editorDownload === "json") {
        const fileName = safeFileName(`edubia-${data.fields?.student || "student"}.json`);
        downloadBlob(fileName, "application/json;charset=utf-8", JSON.stringify(buildReportData({ reportDraft: data }), null, 2));
        return;
      }
      if (target.dataset.editorDownload === "pdf") {
        await downloadStudentReport({ reportDraft: data });
      }
    });

    overlay.addEventListener("keydown", event => {
      if (event.key === "Escape") overlay.remove();
    });

    renderPanel();
    updatePreview();
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

  window.EdubiaReport = { downloadStudentReport, downloadStudentReportJson, buildReportData, buildMetrics, openReportEditor };
})();
