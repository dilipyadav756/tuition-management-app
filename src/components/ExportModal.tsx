import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileCode, 
  FileSpreadsheet, 
  Users, 
  DollarSign, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ArrowRight,
  Database,
  Building2,
  Lock
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

interface ExportCardConfig {
  id: ExportFormat;
  title: string;
  badge: string;
  formatBadge: string;
  badgeColor: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  dataPoints: string[];
}

export default function ExportModal({
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

  const exportOptions: ExportCardConfig[] = [
    {
      id: 'JSON_FULL',
      title: 'Full System Backup',
      badge: 'Complete Archive',
      formatBadge: '.JSON',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Complete authorized data snapshot including instructor profile, batches, student rosters, notes, quizzes, and join requests. Formatted for secure 1-click system restore.',
      icon: Database,
      iconBg: 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400',
      iconColor: 'text-indigo-400',
      dataPoints: [
        `${dataset.students.length} Students`,
        `${dataset.batches.length} Batches`,
        `${dataset.notes.length} Study Notes`,
        `${dataset.tests.length} Quizzes`
      ]
    },
    {
      id: 'EXCEL_ALL',
      title: 'Comprehensive Excel Reports',
      badge: 'Multi-Sheet Workbook',
      formatBadge: '.XLSX',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Professional workbook featuring 6 organized sheets: Student Directory, Batch Details, Fee Collection (with auto-calculated totals), Daily Attendance, Study Notes, and Quizzes.',
      icon: FileSpreadsheet,
      iconBg: 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400',
      iconColor: 'text-emerald-400',
      dataPoints: [
        '6 Formatted Worksheets',
        'Auto-Calculated Fee Totals',
        'Formatted Column Widths',
        'Compatible with Excel & Sheets'
      ]
    },
    {
      id: 'CSV_STUDENTS',
      title: 'Student Directory',
      badge: 'Roster Export',
      formatBadge: '.CSV',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Clean tabular export of enrolled student records, roll numbers, assigned batches, attendance rates, and contact details with UTF-8 BOM encoding.',
      icon: Users,
      iconBg: 'bg-blue-600/20 border border-blue-500/30 text-blue-400',
      iconColor: 'text-blue-400',
      dataPoints: [
        `${dataset.students.length} Student Rows`,
        'Roll Numbers & Batches',
        'Guardian Contacts'
      ]
    },
    {
      id: 'CSV_FEES',
      title: 'Fee Collection Ledger',
      badge: 'Financial Audit',
      formatBadge: '.CSV',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Detailed monthly tuition dues ledger with Paid, Pending, and Overdue statuses, itemized student amounts, and summary financial totals.',
      icon: DollarSign,
      iconBg: 'bg-amber-600/20 border border-amber-500/30 text-amber-400',
      iconColor: 'text-amber-400',
      dataPoints: [
        'Itemized Fee Statuses',
        'Billed vs Collected Totals',
        'Pending Receivables'
      ]
    },
    {
      id: 'CSV_ATTENDANCE',
      title: 'Daily Attendance Records',
      badge: 'Historical Log',
      formatBadge: '.CSV',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Chronological roll-call logs detailing student presence and absence across active batches for compliance verification and parent reporting.',
      icon: Calendar,
      iconBg: 'bg-purple-600/20 border border-purple-500/30 text-purple-400',
      iconColor: 'text-purple-400',
      dataPoints: [
        `${Object.keys(dataset.attendanceRecords || {}).length} Days Logged`,
        'Present / Absent Tally',
        'Batch Cross-Reference'
      ]
    },
    {
      id: 'CSV_BATCHES',
      title: 'Batch Details & Schedules',
      badge: 'Course Registry',
      formatBadge: '.CSV',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Summary of active batches, subject specializations, 6-digit cryptographic join codes, class timing schedules, and enrollment metrics.',
      icon: Layers,
      iconBg: 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-400',
      iconColor: 'text-cyan-400',
      dataPoints: [
        `${dataset.batches.length} Active Batches`,
        '6-Digit Join Codes',
        'Weekly Time Slots'
      ]
    }
  ];

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

  const badge = getClearanceBadge();

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden relative text-white flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Export Workspace Data & Reports
                </h3>
                <p className="text-xs text-slate-400">
                  EduMaster Secure Multi-Tenant Data Export System
                </p>
              </div>
            </div>

            {/* CONTEXT META */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                {badge.label}
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300 font-semibold">{dataset.teacher.name}</span>
                <span className="text-slate-500">({dataset.teacher.subject})</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close Export Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECURITY & DATA ISOLATION CALLOUT */}
        <div className="px-6 py-3 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Strict RBAC Active:</strong> Export datasets are cryptographically filtered to your tuition center. Cross-tuition records and private credentials are excluded.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 hidden md:inline">
            Zero PII Leakage
          </span>
        </div>

        {/* ACCESS DENIED STATE (FOR STUDENTS) */}
        {!permission.authorized ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Export Permissions Restricted</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {permission.error || 'Student accounts do not possess permission to export tuition directories or ledger books.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* EXPORT CARDS GRID */
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportOptions.map(option => {
                const IconComp = option.icon;
                const isDownloading = downloadingFormat === option.id;

                return (
                  <div
                    key={option.id}
                    className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-11 h-11 rounded-xl ${option.iconBg} flex items-center justify-center shadow-sm`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                              {option.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {option.badge}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg border ${option.badgeColor}`}>
                          {option.formatBadge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {option.description}
                      </p>

                      {/* DATA PILLS */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {option.dataPoints.map((dp, i) => (
                          <span
                            key={i}
                            className="bg-slate-900/80 text-slate-300 border border-slate-700/60 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {dp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/50">
                      <button
                        type="button"
                        onClick={() => handleDownload(option.id)}
                        disabled={isDownloading}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm ${
                          option.id === 'JSON_FULL'
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                            : option.id === 'EXCEL_ALL'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <span className="animate-spin text-sm">⏳</span>
                            <span>Generating {option.formatBadge}...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {option.formatBadge} File</span>
                            <ArrowRight className="w-3 h-3 opacity-60" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {recentDownload ? (
                <span className="text-emerald-300 font-semibold">Latest Export: {recentDownload}</span>
              ) : (
                'All export formats preserve Unicode UTF-8 encoding and backward compatibility.'
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
