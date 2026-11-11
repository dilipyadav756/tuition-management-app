import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  Users, 
  DollarSign, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Award,
  BookOpen,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { 
  ExportDataset, 
  ExportFormat, 
  ExportUserAuth, 
  executeExport, 
  validateExportPermission 
} from '../utils/exportManager';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ExportDataset;
  currentUser?: ExportUserAuth | null;
  onToast?: (message: string) => void;
}

export function ExportWorkspaceModal({
  isOpen,
  onClose,
  dataset,
  currentUser = null,
  onToast
}: ExportModalProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [recentDownload, setRecentDownload] = useState<string | null>(null);

  if (!isOpen) return null;

  const permission = validateExportPermission(currentUser);

  // Part 1 Metrics Calculation
  const studentsCount = dataset.students.length;
  const batchesCount = dataset.batches.length;
  const totalBilled = dataset.students.reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalPaid = dataset.students
    .filter(s => s.feeStatus === 'Paid')
    .reduce((acc, s) => acc + (s.feeAmount || 0), 0);
  const totalPending = totalBilled - totalPaid;
  const attendanceDays = Object.keys(dataset.attendanceRecords || {}).length;

  // Part 2 Metrics Calculation
  const testsCount = dataset.tests.length;
  const scoresList = dataset.scores || [];
  const scoresCount = scoresList.length;
  const passedScoresCount = scoresList.filter(sc => sc.status === 'Passed').length;
  const passRate = scoresCount > 0 ? Math.round((passedScoresCount / scoresCount) * 100) : 100;
  const totalQuestions = dataset.tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0);
  const subjectsCovered = new Set(dataset.tests.map(t => t.subject)).size || (dataset.teacher.subject ? 1 : 0);

  const handleDownload = (format: ExportFormat) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      const res = executeExport(format, dataset, currentUser);
      setDownloadingFormat(null);
      if (res.success) {
        setRecentDownload(res.filename || 'export');
        if (onToast) onToast(`Export downloaded: ${res.filename}`);
      } else {
        if (onToast) onToast(`Export failed: ${res.message}`);
      }
    }, 180);
  };

  const getClearanceBadge = () => {
    if (permission.clearanceLevel === 'SUPER_ADMIN') {
      return {
        label: 'Super-Admin Clearance',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      };
    }
    if (permission.clearanceLevel === 'TUITION_OWNER') {
      return {
        label: 'Tuition Center Owner',
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
      };
    }
    return {
      label: 'Instructor Clearance',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    };
  };

  const clearance = getClearanceBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* MODAL WRAPPER (FIXED HEIGHT CONTAINER PREVENTS OUT-OF-VIEW OVERFLOW) */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">

        {/* =================================================================== */}
        {/* 1. FIXED MODAL HEADER */}
        {/* =================================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-600/30">
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Export Workspace & Reports
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${clearance.color}`}>
                  {clearance.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consolidated multi-sheet Excel workbooks and granular CSV datasets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Export Workspace"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK STATUS BANNER IF DOWNLOAD RECENT */}
        {recentDownload && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Generated: <strong className="font-mono text-emerald-200">{recentDownload}</strong>
              </span>
            </div>
            <button
              onClick={() => setRecentDownload(null)}
              className="text-emerald-400/80 hover:text-emerald-300 text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. SCROLLABLE CONTENT BODY */}
        {/* =================================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* TWO MAIN REPORT CATEGORIES (SIDE BY SIDE ON DESKTOP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ------------------------------------------------------------- */}
            {/* PART 1: STUDENT & TUITION RECORDS */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-900/90 border border-slate-700/80 hover:border-purple-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-xl hover:shadow-purple-900/10 space-y-5">
              <div className="space-y-4">
                
                {/* Header & Badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                        PART 1
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        Student & Tuition Records
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    4-Sheet .XLSX
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Consolidated operational workbook uniting student rosters, course batch schedules, financial fee collections, and historical daily attendance logs.
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-white">{studentsCount}</span>
                    <span className="text-[10px] text-slate-400">Students</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-white">{batchesCount}</span>
                    <span className="text-[10px] text-slate-400">Batches</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-emerald-400">₹{totalBilled.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">Billed</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-indigo-300">{attendanceDays}</span>
                    <span className="text-[10px] text-slate-400">Days Logged</span>
                  </div>
                </div>

                {/* Report Sections Breakdown */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Included Worksheets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>1. Student Directory</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>2. Batch Details & Codes</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>3. Fee Structure & Totals</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>4. Daily Attendance & %</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Area */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownload('EXCEL_STUDENT_TUITION')}
                  disabled={downloadingFormat === 'EXCEL_STUDENT_TUITION'}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {downloadingFormat === 'EXCEL_STUDENT_TUITION' ? 'Generating Workbook...' : 'Download Consolidated Excel (.xlsx)'}
                  </span>
                </button>

                {/* Granular CSV Downloads */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block text-center">
                    Or download granular CSV dataset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleDownload('CSV_STUDENTS')}
                      disabled={downloadingFormat === 'CSV_STUDENTS'}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-semibold text-center transition-all cursor-pointer truncate"
                      title="Download Student Directory CSV"
                    >
                      Students (CSV)
                    </button>
                    <button
                      onClick={() => handleDownload('CSV_FEES')}
                      disabled={downloadingFormat === 'CSV_FEES'}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-semibold text-center transition-all cursor-pointer truncate"
                      title="Download Fee Records CSV"
                    >
                      Fees (CSV)
                    </button>
                    <button
                      onClick={() => handleDownload('CSV_ATTENDANCE')}
                      disabled={downloadingFormat === 'CSV_ATTENDANCE'}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-semibold text-center transition-all cursor-pointer truncate"
                      title="Download Daily Attendance CSV"
                    >
                      Attendance (CSV)
                    </button>
                    <button
                      onClick={() => handleDownload('CSV_BATCHES')}
                      disabled={downloadingFormat === 'CSV_BATCHES'}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-semibold text-center transition-all cursor-pointer truncate"
                      title="Download Batch Details CSV"
                    >
                      Batches (CSV)
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* PART 2: TESTS & RESULTS */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-xl hover:shadow-indigo-900/10 space-y-5">
              <div className="space-y-4">

                {/* Header & Badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                        PART 2
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        Tests & Examination Results
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    4-Sheet .XLSX
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Academic evaluation dossier compiling quiz parameters, student scores, subject-wise performance aggregates, and RBAC-protected question analysis.
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-white">{testsCount}</span>
                    <span className="text-[10px] text-slate-400">Tests</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-indigo-300">{scoresCount}</span>
                    <span className="text-[10px] text-slate-400">Submissions</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-emerald-400">{passRate}%</span>
                    <span className="text-[10px] text-slate-400">Pass Rate</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-center">
                    <span className="block text-sm font-extrabold text-purple-300">{totalQuestions}</span>
                    <span className="text-[10px] text-slate-400">Questions</span>
                  </div>
                </div>

                {/* Report Sections Breakdown */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Included Worksheets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>1. Test Details & Marks</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>2. Student Results & Pass/Fail</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>3. Subject Performance</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>4. Question Analysis (Protected)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Area */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownload('EXCEL_TESTS_RESULTS')}
                  disabled={downloadingFormat === 'EXCEL_TESTS_RESULTS'}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {downloadingFormat === 'EXCEL_TESTS_RESULTS' ? 'Generating Workbook...' : 'Download Consolidated Excel (.xlsx)'}
                  </span>
                </button>

                {/* Granular CSV Download */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block text-center">
                    Or download granular CSV dataset:
                  </span>
                  <button
                    onClick={() => handleDownload('CSV_TEST_RESULTS')}
                    disabled={downloadingFormat === 'CSV_TEST_RESULTS'}
                    className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-semibold text-center transition-all cursor-pointer truncate"
                    title="Download Student Test Results CSV"
                  >
                    Student Test Results (CSV)
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================================== */}
        {/* 3. FIXED MODAL FOOTER */}
        {/* =================================================================== */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict Tenant Isolation • Password Protected Exports</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExportWorkspaceModal;
