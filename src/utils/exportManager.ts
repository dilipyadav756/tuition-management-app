import * as XLSX from 'xlsx';

// ============================================================================
// DATA INTERFACES
// ============================================================================

export interface ExportTeacherProfile {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  upiId?: string;
  location?: string;
  bio?: string;
  resultsHeadline?: string;
  status?: string;
}

export interface ExportBatch {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  joinCode: string;
  monthlyFee: number;
  schedule: string;
}

export interface ExportStudent {
  id: string;
  teacherId: string;
  name: string;
  rollNo: string;
  batch: string;
  phone: string;
  parentPhone?: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  feeAmount: number;
  attendanceRate?: number;
}

export interface ExportNote {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  batch: string;
  content: string;
  date: string;
  fileAttachment?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface ExportTest {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  batch: string;
  totalMarks: number;
  passingScore: number;
  duration: number;
  date?: string;
  questions?: Array<{
    id: string;
    questionText?: string;
    question?: string;
    options: string[];
    correctAnswer?: number;
    marks?: number;
  }>;
}

export interface ExportScoreRecord {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  date: string;
}

export interface ExportBatchJoinRequest {
  id: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  teacherName: string;
  studentName: string;
  studentPhone: string;
  parentPhone?: string;
  rollNo?: string;
  status: string;
  requestedAt: string;
}

export interface ExportDataset {
  teacher: ExportTeacherProfile;
  batches: ExportBatch[];
  students: ExportStudent[];
  notes: ExportNote[];
  tests: ExportTest[];
  attendanceRecords: Record<string, Record<string, 'Present' | 'Absent'>>;
  scores?: ExportScoreRecord[];
  pendingRequests?: ExportBatchJoinRequest[];
}

export interface ExportUserAuth {
  id?: string;
  role?: string;
  name?: string;
  tuitionId?: string;
  isSuperAdmin?: boolean;
}

export type ExportFormat = 
  | 'JSON_FULL'
  | 'EXCEL_ALL'
  | 'CSV_STUDENTS'
  | 'CSV_FEES'
  | 'CSV_ATTENDANCE'
  | 'CSV_BATCHES';

// ============================================================================
// SECURITY & PERMISSION VALIDATOR
// ============================================================================

export function validateExportPermission(user?: ExportUserAuth | null): {
  authorized: boolean;
  clearanceLevel: 'SUPER_ADMIN' | 'TUITION_OWNER' | 'TEACHER' | 'STUDENT';
  error?: string;
} {
  if (!user) {
    // Demo / public mode instructor view
    return { authorized: true, clearanceLevel: 'TUITION_OWNER' };
  }

  const role = (user.role || '').toUpperCase();

  if (role === 'SUPER_ADMIN') {
    return { authorized: true, clearanceLevel: 'SUPER_ADMIN' };
  }

  if (role === 'TEACHER' || role === 'INSTRUCTOR' || role === 'OWNER') {
    return { authorized: true, clearanceLevel: 'TUITION_OWNER' };
  }

  if (role === 'STUDENT') {
    return {
      authorized: false,
      clearanceLevel: 'STUDENT',
      error: 'Security Notice: Student accounts do not have clearance to export tuition directories or financial records.'
    };
  }

  return { authorized: true, clearanceLevel: 'TEACHER' };
}

// ============================================================================
// HELPER: DOWNLOAD TRIGGER
// ============================================================================

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function sanitizeSlug(str: string): string {
  return (str || 'tuition').trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================================
// 1. CSV EXPORT UTILITY (RFC 4180 COMPLIANT WITH UTF-8 BOM)
// ============================================================================

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  const csvContent = csvRows.join('\r\n');
  // Prepend UTF-8 BOM (\uFEFF) so Excel & Google Sheets parse Unicode/symbols without encoding issues
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 2. EXCEL WORKBOOK EXPORT UTILITY (XLSX MULTI-SHEET)
// ============================================================================

export function exportToExcelWorkbook(filename: string, dataset: ExportDataset) {
  const wb = XLSX.utils.book_new();

  // --------------------------------------------------------------------------
  // SHEET 1: STUDENT DIRECTORY
  // --------------------------------------------------------------------------
  const studentRows = [
    ['Student ID', 'Student Name', 'Roll Number', 'Assigned Batch', 'Contact Phone', 'Guardian Phone', 'Fee Status', 'Monthly Fee (INR)', 'Attendance Rate (%)'],
    ...dataset.students.map(s => [
      s.id,
      s.name,
      s.rollNo,
      s.batch,
      s.phone || 'N/A',
      s.parentPhone || 'N/A',
      s.feeStatus,
      s.feeAmount,
      `${s.attendanceRate ?? 0}%`
    ])
  ];
  const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
  wsStudents['!cols'] = [
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Directory');

  // --------------------------------------------------------------------------
  // SHEET 2: BATCH DETAILS
  // --------------------------------------------------------------------------
  const batchRows = [
    ['Batch ID', 'Batch Name', 'Subject Specialization', '6-Digit Join Code', 'Weekly Schedule', 'Monthly Tuition Fee (INR)', 'Enrolled Students Count'],
    ...dataset.batches.map(b => {
      const enrolledCount = dataset.students.filter(s => s.batch === b.name).length;
      return [
        b.id,
        b.name,
        b.subject,
        b.joinCode,
        b.schedule,
        b.monthlyFee,
        enrolledCount
      ];
    })
  ];
  const wsBatches = XLSX.utils.aoa_to_sheet(batchRows);
  wsBatches['!cols'] = [
    { wch: 14 }, { wch: 26 }, { wch: 24 }, { wch: 18 }, { wch: 32 }, { wch: 24 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsBatches, 'Batch Details');

  // --------------------------------------------------------------------------
  // SHEET 3: FEE COLLECTION
  // --------------------------------------------------------------------------
  const totalBilled = dataset.students.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalCollected = dataset.students
    .filter(s => s.feeStatus === 'Paid')
    .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;

  const feeRows = [
    ['Student Name', 'Roll Number', 'Batch Name', 'Fee Status', 'Monthly Fee (INR)', 'Student Phone', 'Guardian Phone'],
    ...dataset.students.map(s => [
      s.name,
      s.rollNo,
      s.batch,
      s.feeStatus,
      s.feeAmount,
      s.phone || 'N/A',
      s.parentPhone || 'N/A'
    ]),
    [],
    ['--- FINANCIAL SUMMARY TOTALS ---', '', '', '', '', '', ''],
    ['TOTAL BILLED REVENUE', '', '', '', totalBilled, '', ''],
    ['TOTAL REALIZED / COLLECTED (PAID)', '', '', '', totalCollected, '', ''],
    ['TOTAL PENDING & OVERDUE RECEIVABLES', '', '', '', totalOutstanding, '', '']
  ];
  const wsFees = XLSX.utils.aoa_to_sheet(feeRows);
  wsFees['!cols'] = [
    { wch: 24 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFees, 'Fee Collection');

  // --------------------------------------------------------------------------
  // SHEET 4: DAILY ATTENDANCE
  // --------------------------------------------------------------------------
  const sortedDates = Object.keys(dataset.attendanceRecords || {}).sort().reverse();
  const attendanceRows: (string | number)[][] = [
    ['Record Date', 'Student Name', 'Roll Number', 'Assigned Batch', 'Attendance Status']
  ];

  if (sortedDates.length === 0) {
    attendanceRows.push(['No historical attendance records logged yet.', '', '', '', '']);
  } else {
    sortedDates.forEach(date => {
      const dayLogs = dataset.attendanceRecords[date] || {};
      dataset.students.forEach(st => {
        const status = dayLogs[st.id] || 'N/A';
        attendanceRows.push([date, st.name, st.rollNo, st.batch, status]);
      });
    });
  }

  const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceRows);
  wsAttendance['!cols'] = [
    { wch: 16 }, { wch: 24 }, { wch: 14 }, { wch: 24 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Daily Attendance');

  // --------------------------------------------------------------------------
  // SHEET 5: STUDY NOTES
  // --------------------------------------------------------------------------
  const noteRows = [
    ['Note ID', 'Title', 'Subject', 'Target Batch', 'Publish Date', 'Content Snippet', 'Attachment File Name', 'Attachment File Type', 'Attachment Size (KB)'],
    ...dataset.notes.map(n => [
      n.id,
      n.title,
      n.subject,
      n.batch,
      n.date,
      (n.content || '').slice(0, 160).replace(/\n/g, ' '),
      n.fileAttachment?.name || 'None',
      n.fileAttachment?.type || 'N/A',
      n.fileAttachment ? (n.fileAttachment.size / 1024).toFixed(1) : '0'
    ])
  ];
  const wsNotes = XLSX.utils.aoa_to_sheet(noteRows);
  wsNotes['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 20 }, { wch: 24 }, { wch: 16 }, { wch: 45 }, { wch: 24 }, { wch: 20 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsNotes, 'Study Notes');

  // --------------------------------------------------------------------------
  // SHEET 6: TESTS & QUIZZES
  // --------------------------------------------------------------------------
  const testRows = [
    ['Test ID', 'Test Title', 'Subject', 'Target Batch', 'Total Marks', 'Passing Threshold', 'Duration (Mins)', 'Questions Count', 'Test Scheduled Date'],
    ...dataset.tests.map(t => [
      t.id,
      t.title,
      t.subject,
      t.batch,
      t.totalMarks,
      t.passingScore,
      t.duration,
      t.questions?.length ?? 0,
      t.date || 'Active'
    ])
  ];
  const wsTests = XLSX.utils.aoa_to_sheet(testRows);
  wsTests['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 20 }, { wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTests, 'Tests & Quizzes');

  // Generate buffer and trigger download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 3. FULL SYSTEM BACKUP (JSON)
// ============================================================================

export function exportToJsonBackup(filename: string, dataset: ExportDataset) {
  // Sanitize teacher record to prevent token / raw password leakage
  const sanitizedTeacher = {
    id: dataset.teacher.id,
    name: dataset.teacher.name,
    subject: dataset.teacher.subject,
    email: dataset.teacher.email,
    phone: dataset.teacher.phone,
    upiId: dataset.teacher.upiId,
    location: dataset.teacher.location,
    bio: dataset.teacher.bio,
    resultsHeadline: dataset.teacher.resultsHeadline,
    status: dataset.teacher.status || 'Active'
  };

  const backupObject = {
    version: '2.0',
    platform: 'EduMaster Tuition Platform',
    exportedAt: new Date().toISOString(),
    system: {
      centerId: dataset.teacher.id,
      centerName: dataset.teacher.subject,
      instructor: dataset.teacher.name
    },
    // Core records maintaining backward compatibility with restore workflow
    teacher: sanitizedTeacher,
    batches: dataset.batches,
    students: dataset.students,
    notes: dataset.notes,
    tests: dataset.tests,
    pendingRequests: dataset.pendingRequests || [],
    // Extended modules
    attendance: dataset.attendanceRecords,
    scores: dataset.scores || []
  };

  const blob = new Blob([JSON.stringify(backupObject, null, 2)], { 
    type: 'application/json;charset=utf-8' 
  });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 4. MASTER EXPORT DISPATCHER
// ============================================================================

export function executeExport(
  format: ExportFormat, 
  dataset: ExportDataset, 
  user?: ExportUserAuth | null
): { success: boolean; message: string; filename?: string } {
  // 1. Role & permission validation
  const check = validateExportPermission(user);
  if (!check.authorized) {
    return {
      success: false,
      message: check.error || 'Access denied: You do not have permission to export tuition data.'
    };
  }

  const baseSlug = sanitizeSlug(dataset.teacher.name || dataset.teacher.subject || 'tuition');
  const dateStr = getTodayString();

  switch (format) {
    case 'JSON_FULL': {
      const filename = `tuition_backup_${baseSlug}_${dateStr}.json`;
      exportToJsonBackup(filename, dataset);
      return { success: true, message: `Full system backup downloaded: ${filename}`, filename };
    }

    case 'EXCEL_ALL': {
      const filename = `tuition_reports_${baseSlug}_${dateStr}.xlsx`;
      exportToExcelWorkbook(filename, dataset);
      return { success: true, message: `Comprehensive Excel report workbook downloaded: ${filename}`, filename };
    }

    case 'CSV_STUDENTS': {
      const filename = `student_directory_${baseSlug}_${dateStr}.csv`;
      const headers = ['Student ID', 'Student Name', 'Roll Number', 'Assigned Batch', 'Student Phone', 'Guardian Phone', 'Fee Status', 'Monthly Fee (INR)', 'Attendance Rate (%)'];
      const rows = dataset.students.map(s => [
        s.id,
        s.name,
        s.rollNo,
        s.batch,
        s.phone || 'N/A',
        s.parentPhone || 'N/A',
        s.feeStatus,
        s.feeAmount,
        `${s.attendanceRate ?? 0}%`
      ]);
      exportToCsv(filename, headers, rows);
      return { success: true, message: `Student Directory CSV exported: ${filename}`, filename };
    }

    case 'CSV_FEES': {
      const filename = `fee_collection_ledger_${baseSlug}_${dateStr}.csv`;
      const totalBilled = dataset.students.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalCollected = dataset.students
        .filter(s => s.feeStatus === 'Paid')
        .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalOutstanding = totalBilled - totalCollected;

      const headers = ['Student Name', 'Roll Number', 'Batch Name', 'Fee Status', 'Monthly Fee (INR)', 'Student Phone', 'Guardian Phone'];
      const rows: (string | number)[][] = dataset.students.map(s => [
        s.name,
        s.rollNo,
        s.batch,
        s.feeStatus,
        s.feeAmount,
        s.phone || 'N/A',
        s.parentPhone || 'N/A'
      ]);

      // Summary lines
      rows.push(['--- FINANCIAL SUMMARY ---', '', '', '', '', '', '']);
      rows.push(['TOTAL BILLED AMOUNT', '', '', '', totalBilled, '', '']);
      rows.push(['TOTAL COLLECTED FEES (PAID)', '', '', '', totalCollected, '', '']);
      rows.push(['TOTAL OUTSTANDING / PENDING', '', '', '', totalOutstanding, '', '']);

      exportToCsv(filename, headers, rows);
      return { success: true, message: `Fee Collection Ledger CSV exported: ${filename}`, filename };
    }

    case 'CSV_ATTENDANCE': {
      const filename = `daily_attendance_${baseSlug}_${dateStr}.csv`;
      const headers = ['Record Date', 'Student Name', 'Roll Number', 'Assigned Batch', 'Attendance Status'];
      const rows: (string | number)[][] = [];

      const sortedDates = Object.keys(dataset.attendanceRecords || {}).sort().reverse();
      if (sortedDates.length === 0) {
        rows.push(['No attendance records logged yet.', '', '', '', '']);
      } else {
        sortedDates.forEach(date => {
          const dayMap = dataset.attendanceRecords[date] || {};
          dataset.students.forEach(st => {
            rows.push([date, st.name, st.rollNo, st.batch, dayMap[st.id] || 'N/A']);
          });
        });
      }

      exportToCsv(filename, headers, rows);
      return { success: true, message: `Daily Attendance Records CSV exported: ${filename}`, filename };
    }

    case 'CSV_BATCHES': {
      const filename = `batch_details_${baseSlug}_${dateStr}.csv`;
      const headers = ['Batch ID', 'Batch Name', 'Subject Specialization', '6-Digit Join Code', 'Weekly Schedule', 'Monthly Fee (INR)', 'Enrolled Students Count'];
      const rows = dataset.batches.map(b => {
        const count = dataset.students.filter(s => s.batch === b.name).length;
        return [
          b.id,
          b.name,
          b.subject,
          b.joinCode,
          b.schedule,
          b.monthlyFee,
          count
        ];
      });
      exportToCsv(filename, headers, rows);
      return { success: true, message: `Batch Details CSV exported: ${filename}`, filename };
    }

    default:
      return { success: false, message: 'Unsupported export format requested.' };
  }
}
