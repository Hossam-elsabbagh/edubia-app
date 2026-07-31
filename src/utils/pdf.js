import { jsPDF } from 'jspdf';

const scoreFields = [
  ['commitment_score', 'Commitment'],
  ['understanding_score', 'Understanding'],
  ['problem_solving_score', 'Problem solving'],
  ['practical_score', 'Practical application'],
  ['exercise_score', 'Exercises'],
  ['participation_score', 'Participation'],
];

function safeFileName(value) {
  return String(value || 'feedback')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'feedback';
}

export function averageFeedbackScore(item) {
  const values = scoreFields.map(([key]) => Number(item?.[key] || 0));
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

async function loadLogoDataUrl() {
  try {
    const response = await fetch('/edubia-logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function writeWrapped(doc, label, value, x, y, width) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(62, 72, 96);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(32, 39, 57);
  const lines = doc.splitTextToSize(String(value || '—'), width);
  doc.text(lines, x, y + 5);
  return y + 5 + (lines.length * 4.5);
}

export async function downloadFeedbackPdf({
  title = 'Feedback Report',
  subtitle = '',
  records = [],
  fileName = 'feedback-report.pdf',
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const logo = await loadLogoDataUrl();
  let y = 16;

  function addHeader() {
    if (logo) {
      doc.addImage(logo, 'PNG', margin, 10, 20, 20, undefined, 'FAST');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(22, 32, 57);
    doc.text(title, logo ? margin + 25 : margin, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(105, 116, 135);
    doc.text(subtitle || `${records.length} feedback record(s)`, logo ? margin + 25 : margin, 24);
    doc.setDrawColor(224, 228, 238);
    doc.line(margin, 34, pageWidth - margin, 34);
    y = 41;
  }

  function ensureSpace(required = 54) {
    if (y + required <= pageHeight - 15) return;
    doc.addPage();
    addHeader();
  }

  addHeader();

  if (!records.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(105, 116, 135);
    doc.text('No feedback records are available for this report.', margin, y + 5);
  }

  records.forEach((item, index) => {
    const explainedLines = doc.splitTextToSize(String(item.explained || '—'), contentWidth - 12);
    const strengthsLines = doc.splitTextToSize(String(item.strengths || '—'), contentWidth - 12);
    const improveLines = doc.splitTextToSize(String(item.improvement_areas || '—'), contentWidth - 12);
    const estimatedHeight = 52 + ((explainedLines.length + strengthsLines.length + improveLines.length) * 4.5);
    ensureSpace(Math.min(estimatedHeight, 105));

    const startY = y;
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(224, 228, 238);
    doc.roundedRect(margin, startY, contentWidth, Math.min(estimatedHeight, pageHeight - startY - 15), 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 32, 57);
    const studentPrefix = item.student_name ? `${item.student_name} — ` : '';
    const heading = `${studentPrefix}${item.lesson_title || 'Lesson feedback'}`;
    doc.text(doc.splitTextToSize(heading, contentWidth - 40), margin + 6, startY + 8);

    doc.setFontSize(9);
    doc.setTextColor(113, 86, 245);
    doc.text(`${averageFeedbackScore(item)} / 5`, pageWidth - margin - 6, startY + 8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(105, 116, 135);
    doc.text(`${item.date || '—'}  |  ${item.course || '—'}  |  Session ${item.session_number || '—'}  |  ${item.attendance || '—'}`, margin + 6, startY + 15);

    let innerY = startY + 23;
    const scoreText = scoreFields.map(([key, label]) => `${label}: ${item[key] || '—'}/5`).join('   •   ');
    doc.setFontSize(8.2);
    doc.setTextColor(62, 72, 96);
    const scoreLines = doc.splitTextToSize(scoreText, contentWidth - 12);
    doc.text(scoreLines, margin + 6, innerY);
    innerY += (scoreLines.length * 4) + 3;

    innerY = writeWrapped(doc, 'Explained', item.explained, margin + 6, innerY, contentWidth - 12) + 3;
    innerY = writeWrapped(doc, 'Strengths', item.strengths, margin + 6, innerY, contentWidth - 12) + 3;
    innerY = writeWrapped(doc, 'Improvement areas', item.improvement_areas, margin + 6, innerY, contentWidth - 12) + 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(105, 116, 135);
    doc.text(`Homework: ${item.has_homework || '—'}  |  Previous homework: ${item.previous_homework || '—'}`, margin + 6, innerY);

    y = Math.max(startY + 38, innerY + 9);
    if (index < records.length - 1) y += 4;
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 148, 165);
    doc.text(`Generated by Edubia · Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  doc.save(fileName.endsWith('.pdf') ? fileName : `${safeFileName(fileName)}.pdf`);
}

export function feedbackPdfFileName(name) {
  return `${safeFileName(name)}-feedback.pdf`;
}
