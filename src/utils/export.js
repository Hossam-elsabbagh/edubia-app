import * as XLSX from 'xlsx';
import { TYPE_LABELS } from '../constants';
import { formatHour } from './date';

function autoWidth(rows) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    wch: Math.min(42, Math.max(key.length + 2, ...rows.map((row) => String(row[key] ?? '').length + 2))),
  }));
}

export function exportMonthlyAttendance({ month, instructorName, attendanceRows }) {
  const details = attendanceRows.map((row) => ({
    Date: row.attendance_date,
    Day: row.day,
    Student: row.student_name,
    Course: row.course,
    'Session Number': row.session_number,
    Time: formatHour(row.hour),
    Type: TYPE_LABELS[row.type] || row.type,
    Status: row.status === 'attended' ? 'Attended' : 'Absent',
  }));

  const byStudent = new Map();
  details.forEach((row) => {
    const item = byStudent.get(row.Student) || {
      Student: row.Student,
      'Total Sessions': 0,
      Attended: 0,
      Absent: 0,
      'Attendance Rate': '0%',
    };
    item['Total Sessions'] += 1;
    item[row.Status] += 1;
    item['Attendance Rate'] = `${Math.round((item.Attended / item['Total Sessions']) * 100)}%`;
    byStudent.set(row.Student, item);
  });

  const typeSummary = ['paid', 'cover', 'free'].map((type) => {
    const rows = attendanceRows.filter((row) => row.type === type);
    const attended = rows.filter((row) => row.status === 'attended').length;
    return {
      Type: TYPE_LABELS[type],
      'Total Sessions': rows.length,
      Attended: attended,
      Absent: rows.length - attended,
    };
  });

  const overview = [
    { Field: 'Instructor', Value: instructorName || 'Instructor' },
    { Field: 'Month', Value: month },
    { Field: 'Total recorded sessions', Value: attendanceRows.length },
    { Field: 'Paid sessions', Value: typeSummary[0]['Total Sessions'] },
    { Field: 'Cover sessions', Value: typeSummary[1]['Total Sessions'] },
    { Field: 'Free sessions', Value: typeSummary[2]['Total Sessions'] },
  ];

  const workbook = XLSX.utils.book_new();
  const overviewSheet = XLSX.utils.json_to_sheet(overview);
  const detailSheet = XLSX.utils.json_to_sheet(details.length ? details : [{ Message: 'No attendance records for this month.' }]);
  const studentSheet = XLSX.utils.json_to_sheet([...byStudent.values()].length ? [...byStudent.values()] : [{ Message: 'No student summary available.' }]);
  const typeSheet = XLSX.utils.json_to_sheet(typeSummary);

  overviewSheet['!cols'] = autoWidth(overview);
  detailSheet['!cols'] = autoWidth(details.length ? details : [{ Message: 'No attendance records for this month.' }]);
  studentSheet['!cols'] = autoWidth([...byStudent.values()].length ? [...byStudent.values()] : [{ Message: 'No student summary available.' }]);
  typeSheet['!cols'] = autoWidth(typeSummary);

  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Attendance Details');
  XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Summary');
  XLSX.utils.book_append_sheet(workbook, typeSheet, 'Type Summary');
  XLSX.writeFile(workbook, `Edubia_Attendance_${month}.xlsx`);
}
