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
  subject?: string;
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
  | 'EXCEL_STUDENT_TUITION'   // PART 1: Student & Tuition Records (.xlsx, 4 sheets)
  | 'EXCEL_TESTS_RESULTS'      // PART 2: Tests & Results (.xlsx, 4 sheets)
  | 'JSON_FULL'                // FULL SYSTEM BACKUP (.json)
  | 'CSV_STUDENTS'             // PART 1 CSV: Student Directory
  | 'CSV_FEES'                 // PART 1 CSV: Fee Structure & Collection
  | 'CSV_ATTENDANCE'           // PART 1 CSV: Daily Attendance
  | 'CSV_BATCHES'              // PART 1 CSV: Batch Details
  | 'CSV_TEST_RESULTS'         // PART 2 CSV: Student Test Results
  | 'EXCEL_ALL';               // Legacy alias (Full Excel)

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

  if (role === 'SUPER_ADMIN' || user.isSuperAdmin) {
    return { authorized: true, clearanceLevel: 'SUPER_ADMIN' };
  }

  if (role === 'TEACHER' || role === 'INSTRUCTOR' || role === 'OWNER' || role === 'TUITION_OWNER') {
    return { authorized: true, clearanceLevel: 'TUITION_OWNER' };
  }

  // Principle of least privilege: default deny for students, guests, or unauthorized roles
  return {
    authorized: false,
    clearanceLevel: 'STUDENT',
    error: 'Security Notice: Unauthorized clearance. Student & non-educator accounts do not have permission to export tuition directories or exam answer keys.'
  };
}

// ============================================================================
// HELPER: DOWNLOAD TRIGGER & SANITIZATION
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
  // Prepend UTF-8 BOM (\uFEFF) so Excel & Google Sheets parse Unicode without encoding bugs
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 2. PART 1: STUDENT & TUITION RECORDS (.xlsx WORKBOOK - 4 WORKSHEETS)
// ============================================================================

export function exportStudentTuitionWorkbook(
  filename: string, 
  dataset: ExportDataset, 
  user?: ExportUserAuth | null
) {
  const wb = XLSX.utils.book_new();
  const perm = validateExportPermission(user);
  const canViewJoinCode = perm.clearanceLevel === 'SUPER_ADMIN' || perm.clearanceLevel === 'TUITION_OWNER' || perm.clearanceLevel === 'TEACHER';

  // --------------------------------------------------------------------------
  // SHEET 1: STUDENT DIRECTORY
  // --------------------------------------------------------------------------
  const studentRows = [
    ['Student ID', 'Student Name', 'Roll Number', 'Assigned Batch', 'Contact Phone', 'Guardian Phone', 'Fee Status', 'Monthly Tuition Fee (INR)', 'Attendance Rate (%)'],
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
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Directory');

  // --------------------------------------------------------------------------
  // SHEET 2: BATCH DETAILS
  // --------------------------------------------------------------------------
  const batchRows = [
    ['Batch ID', 'Batch Name', 'Subject Specialization', 'Assigned Teacher', 'Weekly Schedule', 'Monthly Tuition Fee (INR)', 'Enrolled Students Count', '6-Digit Join Code'],
    ...dataset.batches.map(b => {
      const enrolledCount = dataset.students.filter(s => s.batch === b.name).length;
      return [
        b.id,
        b.name,
        b.subject,
        dataset.teacher.name || 'Instructor',
        b.schedule,
        b.monthlyFee,
        enrolledCount,
        canViewJoinCode ? b.joinCode : '••••••'
      ];
    })
  ];
  const wsBatches = XLSX.utils.aoa_to_sheet(batchRows);
  wsBatches['!cols'] = [
    { wch: 14 }, { wch: 26 }, { wch: 24 }, { wch: 24 }, { wch: 32 }, { wch: 24 }, { wch: 22 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsBatches, 'Batch Details');

  // --------------------------------------------------------------------------
  // SHEET 3: FEE STRUCTURE & COLLECTION
  // --------------------------------------------------------------------------
  const totalBilled = dataset.students.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalPaid = dataset.students
    .filter(s => s.feeStatus === 'Paid')
    .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalPending = dataset.students
    .filter(s => s.feeStatus === 'Pending')
    .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalOverdue = dataset.students
    .filter(s => s.feeStatus === 'Overdue')
    .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalOutstanding = totalPending + totalOverdue;
  const collectionRate = totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : '100.0';

  const feeRows = [
    ['Student Name', 'Roll Number', 'Assigned Batch', 'Fee Status', 'Monthly Tuition Fee (INR)', 'Paid Amount (INR)', 'Pending Amount (INR)', 'Overdue Amount (INR)', 'Contact Phone', 'Guardian Phone'],
    ...dataset.students.map(s => {
      const paid = s.feeStatus === 'Paid' ? s.feeAmount : 0;
      const pending = s.feeStatus === 'Pending' ? s.feeAmount : 0;
      const overdue = s.feeStatus === 'Overdue' ? s.feeAmount : 0;
      return [
        s.name,
        s.rollNo,
        s.batch,
        s.feeStatus,
        s.feeAmount,
        paid,
        pending,
        overdue,
        s.phone || 'N/A',
        s.parentPhone || 'N/A'
      ];
    }),
    [],
    ['--- FINANCIAL SUMMARY TOTALS ---', '', '', '', '', '', '', '', '', ''],
    ['TOTAL BILLED REVENUE', '', '', '', totalBilled, '', '', '', '', ''],
    ['TOTAL COLLECTED AMOUNT (PAID)', '', '', '', totalPaid, '', '', '', '', ''],
    ['TOTAL PENDING RECEIVABLES', '', '', '', totalPending, '', '', '', '', ''],
    ['TOTAL OVERDUE RECEIVABLES', '', '', '', totalOverdue, '', '', '', '', ''],
    ['TOTAL OUTSTANDING RECEIVABLES', '', '', '', totalOutstanding, '', '', '', '', ''],
    ['COLLECTION EFFICIENCY RATE', '', '', '', `${collectionRate}%`, '', '', '', '', '']
  ];
  const wsFees = XLSX.utils.aoa_to_sheet(feeRows);
  wsFees['!cols'] = [
    { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFees, 'Fee Structure & Collection');

  // --------------------------------------------------------------------------
  // SHEET 4: ATTENDANCE RECORDS (DAILY LOGS & BATCH-WISE SUMMARY)
  // --------------------------------------------------------------------------
  const sortedDates = Object.keys(dataset.attendanceRecords || {}).sort().reverse();
  const attendanceRows: (string | number)[][] = [
    ['Record Date', 'Student Name', 'Roll Number', 'Assigned Batch', 'Attendance Status']
  ];

  if (sortedDates.length === 0) {
    attendanceRows.push(['No daily attendance records logged yet.', '', '', '', '']);
  } else {
    sortedDates.forEach(date => {
      const dayLogs = dataset.attendanceRecords[date] || {};
      dataset.students.forEach(st => {
        const status = dayLogs[st.id] || 'N/A';
        attendanceRows.push([date, st.name, st.rollNo, st.batch, status]);
      });
    });
  }

  // Add Batch-wise attendance summary table
  attendanceRows.push([]);
  attendanceRows.push(['--- BATCH-WISE ATTENDANCE SUMMARY ---', '', '', '', '']);
  attendanceRows.push(['Batch Name', 'Enrolled Students', 'Total Session Entries', 'Present Tally', 'Absent Tally', 'Batch Attendance Rate (%)']);

  dataset.batches.forEach(b => {
    const batchStudents = dataset.students.filter(s => s.batch === b.name);
    let presentCount = 0;
    let absentCount = 0;
    let totalEntries = 0;

    sortedDates.forEach(date => {
      const dayLogs = dataset.attendanceRecords[date] || {};
      batchStudents.forEach(st => {
        const status = dayLogs[st.id];
        if (status === 'Present') {
          presentCount++;
          totalEntries++;
        } else if (status === 'Absent') {
          absentCount++;
          totalEntries++;
        }
      });
    });

    const rate = totalEntries > 0 ? ((presentCount / totalEntries) * 100).toFixed(1) : '100.0';
    attendanceRows.push([
      b.name,
      batchStudents.length,
      totalEntries,
      presentCount,
      absentCount,
      `${rate}%`
    ]);
  });

  const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceRows);
  wsAttendance['!cols'] = [
    { wch: 16 }, { wch: 24 }, { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance Records');

  // Dispatch workbook download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 3. PART 2: TESTS & RESULTS (.xlsx WORKBOOK - 4 WORKSHEETS)
// ============================================================================

export function exportTestsResultsWorkbook(
  filename: string, 
  dataset: ExportDataset, 
  user?: ExportUserAuth | null
) {
  const wb = XLSX.utils.book_new();
  const perm = validateExportPermission(user);
  const canViewAnswerKey = perm.clearanceLevel === 'SUPER_ADMIN' || perm.clearanceLevel === 'TUITION_OWNER' || perm.clearanceLevel === 'TEACHER';

  // --------------------------------------------------------------------------
  // SHEET 1: TEST DETAILS
  // --------------------------------------------------------------------------
  const testRows = [
    ['Test ID', 'Test Title', 'Subject', 'Target Batch', 'Teacher / Instructor', 'Duration (Mins)', 'Total Marks', 'Passing Threshold', 'Questions Count', 'Scheduled Date'],
    ...dataset.tests.map(t => [
      t.id,
      t.title,
      t.subject,
      t.batch,
      dataset.teacher.name || 'Instructor',
      t.duration,
      t.totalMarks,
      t.passingScore,
      t.questions?.length ?? 0,
      t.date || 'Active'
    ])
  ];
  const wsTests = XLSX.utils.aoa_to_sheet(testRows);
  wsTests['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 20 }, { wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTests, 'Test Details');

  // --------------------------------------------------------------------------
  // SHEET 2: STUDENT TEST RESULTS
  // --------------------------------------------------------------------------
  const studentMap = new Map<string, ExportStudent>();
  dataset.students.forEach(st => studentMap.set(st.id, st));

  const scoresList = dataset.scores || [];
  let totalScoreSum = 0;
  let totalMaxMarksSum = 0;
  let passedCount = 0;
  let failedCount = 0;

  const resultRows: (string | number)[][] = [
    ['Score ID', 'Test Title', 'Subject', 'Student ID', 'Student Name', 'Roll Number', 'Assigned Batch', 'Obtained Marks', 'Total Marks', 'Percentage (%)', 'Pass/Fail Status', 'Submission Date']
  ];

  if (scoresList.length === 0) {
    resultRows.push(['No student test submissions recorded yet.', '', '', '', '', '', '', '', '', '', '', '']);
  } else {
    scoresList.forEach(sc => {
      const student = studentMap.get(sc.studentId);
      const test = dataset.tests.find(t => t.id === sc.testId);
      const subject = sc.subject || test?.subject || dataset.teacher.subject || 'Academics';
      const rollNo = student?.rollNo || 'N/A';
      const batch = student?.batch || test?.batch || 'General';

      totalScoreSum += sc.score;
      totalMaxMarksSum += sc.totalMarks;
      if (sc.status === 'Passed') passedCount++;
      else failedCount++;

      resultRows.push([
        sc.id,
        sc.testTitle,
        subject,
        sc.studentId,
        sc.studentName,
        rollNo,
        batch,
        sc.score,
        sc.totalMarks,
        `${sc.percentage}%`,
        sc.status,
        sc.date
      ]);
    });

    // Summary Section
    const overallPassRate = scoresList.length > 0 ? ((passedCount / scoresList.length) * 100).toFixed(1) : '0.0';
    const averageScorePct = totalMaxMarksSum > 0 ? ((totalScoreSum / totalMaxMarksSum) * 100).toFixed(1) : '0.0';

    resultRows.push([]);
    resultRows.push(['--- TEST PERFORMANCE SUMMARY ---', '', '', '', '', '', '', '', '', '', '', '']);
    resultRows.push(['TOTAL SUBMISSIONS RECORDED', '', '', '', '', '', '', scoresList.length, '', '', '', '']);
    resultRows.push(['TOTAL PASSED CANDIDATES', '', '', '', '', '', '', passedCount, '', '', '', '']);
    resultRows.push(['TOTAL FAILED CANDIDATES', '', '', '', '', '', '', failedCount, '', '', '', '']);
    resultRows.push(['OVERALL PASS RATE', '', '', '', '', '', '', `${overallPassRate}%`, '', '', '', '']);
    resultRows.push(['AVERAGE MARKS PERCENTAGE', '', '', '', '', '', '', `${averageScorePct}%`, '', '', '', '']);
  }

  const wsResults = XLSX.utils.aoa_to_sheet(resultRows);
  wsResults['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsResults, 'Student Test Results');

  // --------------------------------------------------------------------------
  // SHEET 3: SUBJECT-WISE PERFORMANCE
  // --------------------------------------------------------------------------
  // Aggregate stats across subjects and batches
  const subjectStatsMap = new Map<string, {
    subject: string;
    batch: string;
    testsCount: number;
    submissionsCount: number;
    totalObtained: number;
    totalMax: number;
    passed: number;
    failed: number;
  }>();

  dataset.tests.forEach(t => {
    const key = `${t.subject}__${t.batch}`;
    if (!subjectStatsMap.has(key)) {
      subjectStatsMap.set(key, {
        subject: t.subject,
        batch: t.batch,
        testsCount: 0,
        submissionsCount: 0,
        totalObtained: 0,
        totalMax: 0,
        passed: 0,
        failed: 0
      });
    }
    subjectStatsMap.get(key)!.testsCount++;
  });

  scoresList.forEach(sc => {
    const test = dataset.tests.find(t => t.id === sc.testId);
    const subject = sc.subject || test?.subject || 'Academics';
    const batch = test?.batch || 'General';
    const key = `${subject}__${batch}`;

    if (!subjectStatsMap.has(key)) {
      subjectStatsMap.set(key, {
        subject,
        batch,
        testsCount: 1,
        submissionsCount: 0,
        totalObtained: 0,
        totalMax: 0,
        passed: 0,
        failed: 0
      });
    }
    const stat = subjectStatsMap.get(key)!;
    stat.submissionsCount++;
    stat.totalObtained += sc.score;
    stat.totalMax += sc.totalMarks;
    if (sc.status === 'Passed') stat.passed++;
    else stat.failed++;
  });

  const subjectRows = [
    ['Subject Specialization', 'Batch Name', 'Tests Conducted', 'Total Submissions', 'Average Score', 'Average Percentage (%)', 'Passed Count', 'Failed Count', 'Pass Rate (%)'],
    ...Array.from(subjectStatsMap.values()).map(s => {
      const avgScore = s.submissionsCount > 0 ? (s.totalObtained / s.submissionsCount).toFixed(1) : 'N/A';
      const avgPct = s.totalMax > 0 ? ((s.totalObtained / s.totalMax) * 100).toFixed(1) : 'N/A';
      const passRate = s.submissionsCount > 0 ? ((s.passed / s.submissionsCount) * 100).toFixed(1) : 'N/A';
      return [
        s.subject,
        s.batch,
        s.testsCount,
        s.submissionsCount,
        avgScore,
        avgPct === 'N/A' ? 'N/A' : `${avgPct}%`,
        s.passed,
        s.failed,
        passRate === 'N/A' ? 'N/A' : `${passRate}%`
      ];
    })
  ];

  const wsSubject = XLSX.utils.aoa_to_sheet(subjectRows);
  wsSubject['!cols'] = [
    { wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSubject, 'Subject Performance');

  // --------------------------------------------------------------------------
  // SHEET 4: QUESTION ANALYSIS (CORRECT/INCORRECT ANSWERS - STRICT RBAC)
  // --------------------------------------------------------------------------
  const questionRows: (string | number)[][] = [
    ['Test Title', 'Subject', 'Target Batch', 'Question #', 'Question Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Question Marks']
  ];

  dataset.tests.forEach(test => {
    (test.questions || []).forEach((q, idx) => {
      const qText = q.questionText || q.question || 'Question';
      const optA = q.options?.[0] || '';
      const optB = q.options?.[1] || '';
      const optC = q.options?.[2] || '';
      const optD = q.options?.[3] || '';
      const correctIdx = q.correctAnswer ?? 0;

      // STRICT RBAC: Never leak answer key to unauthorized roles
      const answerDisplay = canViewAnswerKey
        ? (q.options?.[correctIdx] ? `Option ${correctIdx + 1}: ${q.options[correctIdx]}` : `Option ${correctIdx + 1}`)
        : '[PROTECTED - AUTHORIZED EDUCATORS ONLY]';

      questionRows.push([
        test.title,
        test.subject,
        test.batch,
        `Q${idx + 1}`,
        qText,
        optA,
        optB,
        optC,
        optD,
        answerDisplay,
        q.marks || Math.round(test.totalMarks / (test.questions?.length || 1))
      ]);
    });
  });

  const wsQuestions = XLSX.utils.aoa_to_sheet(questionRows);
  wsQuestions['!cols'] = [
    { wch: 28 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 45 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 36 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'Question Analysis');

  // Dispatch workbook download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 4. FULL SYSTEM BACKUP (JSON)
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
    attendance: dataset.attendanceRecords,
    scores: dataset.scores || []
  };

  const blob = new Blob([JSON.stringify(backupObject, null, 2)], { 
    type: 'application/json;charset=utf-8' 
  });
  triggerBlobDownload(blob, filename);
}

// ============================================================================
// 5. MASTER EXPORT DISPATCHER
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
    // ------------------------------------------------------------------------
    // PART 1: STUDENT & TUITION RECORDS (.xlsx)
    // ------------------------------------------------------------------------
    case 'EXCEL_STUDENT_TUITION':
    case 'EXCEL_ALL': {
      const filename = `student_and_tuition_records_${baseSlug}_${dateStr}.xlsx`;
      exportStudentTuitionWorkbook(filename, dataset, user);
      return { 
        success: true, 
        message: `Student & Tuition Records workbook downloaded: ${filename}`, 
        filename 
      };
    }

    // ------------------------------------------------------------------------
    // PART 2: TESTS & RESULTS (.xlsx)
    // ------------------------------------------------------------------------
    case 'EXCEL_TESTS_RESULTS': {
      const filename = `tests_and_results_${baseSlug}_${dateStr}.xlsx`;
      exportTestsResultsWorkbook(filename, dataset, user);
      return { 
        success: true, 
        message: `Tests & Examination Results workbook downloaded: ${filename}`, 
        filename 
      };
    }

    // ------------------------------------------------------------------------
    // FULL SYSTEM BACKUP (JSON)
    // ------------------------------------------------------------------------
    case 'JSON_FULL': {
      const filename = `tuition_backup_${baseSlug}_${dateStr}.json`;
      exportToJsonBackup(filename, dataset);
      return { 
        success: true, 
        message: `Full system backup archive downloaded: ${filename}`, 
        filename 
      };
    }

    // ------------------------------------------------------------------------
    // PART 1 GRANULAR CSV DOWNLOADS
    // ------------------------------------------------------------------------
    case 'CSV_STUDENTS': {
      const filename = `student_directory_${baseSlug}_${dateStr}.csv`;
      const headers = ['Student ID', 'Student Name', 'Roll Number', 'Assigned Batch', 'Contact Phone', 'Guardian Phone', 'Fee Status', 'Monthly Tuition Fee (INR)', 'Attendance Rate (%)'];
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
      const filename = `fee_structure_and_collection_${baseSlug}_${dateStr}.csv`;
      const totalBilled = dataset.students.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalPaid = dataset.students
        .filter(s => s.feeStatus === 'Paid')
        .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalPending = dataset.students
        .filter(s => s.feeStatus === 'Pending')
        .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalOverdue = dataset.students
        .filter(s => s.feeStatus === 'Overdue')
        .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
      const totalOutstanding = totalPending + totalOverdue;

      const headers = ['Student Name', 'Roll Number', 'Assigned Batch', 'Fee Status', 'Monthly Tuition Fee (INR)', 'Paid Amount (INR)', 'Pending Amount (INR)', 'Overdue Amount (INR)', 'Contact Phone', 'Guardian Phone'];
      const rows: (string | number)[][] = dataset.students.map(s => [
        s.name,
        s.rollNo,
        s.batch,
        s.feeStatus,
        s.feeAmount,
        s.feeStatus === 'Paid' ? s.feeAmount : 0,
        s.feeStatus === 'Pending' ? s.feeAmount : 0,
        s.feeStatus === 'Overdue' ? s.feeAmount : 0,
        s.phone || 'N/A',
        s.parentPhone || 'N/A'
      ]);

      rows.push(['--- FINANCIAL SUMMARY TOTALS ---', '', '', '', '', '', '', '', '', '']);
      rows.push(['TOTAL BILLED REVENUE', '', '', '', totalBilled, '', '', '', '', '']);
      rows.push(['TOTAL COLLECTED AMOUNT (PAID)', '', '', '', totalPaid, '', '', '', '', '']);
      rows.push(['TOTAL PENDING RECEIVABLES', '', '', '', totalPending, '', '', '', '', '']);
      rows.push(['TOTAL OVERDUE RECEIVABLES', '', '', '', totalOverdue, '', '', '', '', '']);
      rows.push(['TOTAL OUTSTANDING RECEIVABLES', '', '', '', totalOutstanding, '', '', '', '', '']);

      exportToCsv(filename, headers, rows);
      return { success: true, message: `Fee Structure & Collection CSV exported: ${filename}`, filename };
    }

    case 'CSV_ATTENDANCE': {
      const filename = `daily_attendance_records_${baseSlug}_${dateStr}.csv`;
      const headers = ['Record Date', 'Student Name', 'Roll Number', 'Assigned Batch', 'Attendance Status'];
      const rows: (string | number)[][] = [];

      const sortedDates = Object.keys(dataset.attendanceRecords || {}).sort().reverse();
      if (sortedDates.length === 0) {
        rows.push(['No daily attendance records logged yet.', '', '', '', '']);
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
      const perm = validateExportPermission(user);
      const canViewJoinCode = perm.clearanceLevel === 'SUPER_ADMIN' || perm.clearanceLevel === 'TUITION_OWNER' || perm.clearanceLevel === 'TEACHER';

      const filename = `batch_details_${baseSlug}_${dateStr}.csv`;
      const headers = ['Batch ID', 'Batch Name', 'Subject Specialization', 'Assigned Teacher', 'Weekly Schedule', 'Monthly Tuition Fee (INR)', 'Enrolled Students Count', '6-Digit Join Code'];
      const rows = dataset.batches.map(b => {
        const count = dataset.students.filter(s => s.batch === b.name).length;
        return [
          b.id,
          b.name,
          b.subject,
          dataset.teacher.name || 'Instructor',
          b.schedule,
          b.monthlyFee,
          count,
          canViewJoinCode ? b.joinCode : '••••••'
        ];
      });
      exportToCsv(filename, headers, rows);
      return { success: true, message: `Batch Details CSV exported: ${filename}`, filename };
    }

    // ------------------------------------------------------------------------
    // PART 2 GRANULAR CSV DOWNLOAD
    // ------------------------------------------------------------------------
    case 'CSV_TEST_RESULTS': {
      const filename = `student_test_results_${baseSlug}_${dateStr}.csv`;
      const studentMap = new Map<string, ExportStudent>();
      dataset.students.forEach(st => studentMap.set(st.id, st));

      const headers = ['Score ID', 'Test Title', 'Subject', 'Student Name', 'Roll Number', 'Assigned Batch', 'Obtained Marks', 'Total Marks', 'Percentage (%)', 'Pass/Fail Status', 'Submission Date'];
      const scoresList = dataset.scores || [];

      const rows: (string | number)[][] = scoresList.length === 0
        ? [['No student test submissions recorded yet.', '', '', '', '', '', '', '', '', '', '']]
        : scoresList.map(sc => {
            const student = studentMap.get(sc.studentId);
            const test = dataset.tests.find(t => t.id === sc.testId);
            return [
              sc.id,
              sc.testTitle,
              sc.subject || test?.subject || dataset.teacher.subject || 'Academics',
              sc.studentName,
              student?.rollNo || 'N/A',
              student?.batch || test?.batch || 'General',
              sc.score,
              sc.totalMarks,
              `${sc.percentage}%`,
              sc.status,
              sc.date
            ];
          });

      exportToCsv(filename, headers, rows);
      return { success: true, message: `Student Test Results CSV exported: ${filename}`, filename };
    }

    default:
      return { success: false, message: 'Unsupported export format requested.' };
  }
}
