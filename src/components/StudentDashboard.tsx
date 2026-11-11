import React, { useState } from 'react';
import { 
  GraduationCap, 
  QrCode, 
  Printer, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  Calendar, 
  BookOpen, 
  Layers, 
  PlusCircle, 
  ShieldCheck,
  Award
} from 'lucide-react';

export interface EnrolledBatch {
  id?: string;
  batchId?: string;
  batchName?: string;
  name?: string;
  subject?: string;
  monthlyFee?: number;
  schedule?: string;
  joinCode?: string;
  teacherId?: string;
  teacherName?: string;
  tuitionId?: string;
  tuitionName?: string;
  rollNo?: string;
}

export interface StudentDashboardProps {
  student: {
    id: string;
    name: string;
    rollNo?: string;
    phone?: string;
    email?: string;
    batch?: string;
    feeAmount?: number;
    feeStatus: 'PAID' | 'PENDING' | 'UNPAID' | 'Paid' | 'Pending' | 'Overdue';
    attendanceRate?: number;
    enrolledBatches?: EnrolledBatch[];
  };
  activeTeacher?: {
    id: string;
    name: string;
    phone?: string;
    upiId?: string;
    subject?: string;
  };
  onPayViaQR?: () => void;
  onDownloadReceipt?: (batchId?: string) => void;
  onJoinNewBatch?: () => void;
  quizzesAttemptedCount?: number;
}

export default function StudentDashboard({
  student,
  activeTeacher,
  onPayViaQR,
  onDownloadReceipt,
  onJoinNewBatch,
  quizzesAttemptedCount = 0
}: StudentDashboardProps) {
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Normalize fee status string (case-insensitive)
  const normalizedStatus = (student.feeStatus || '').toUpperCase();
  const isPaid = normalizedStatus === 'PAID';

  const handleReceiptClick = async (batchId?: string) => {
    if (!isPaid) {
      setApiErrorMessage('Receipt unavailable. Payment has not been verified by your tuition center.');
      return;
    }
    setDownloadingReceipt(true);
    setApiErrorMessage(null);
    try {
      if (onDownloadReceipt) {
        await onDownloadReceipt(batchId);
      }
    } catch (err: any) {
      setApiErrorMessage(err?.message || 'Error downloading receipt.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PAID</span>
        </span>
      );
    }
    if (normalizedStatus === 'PENDING') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>PENDING VERIFICATION</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>UNPAID</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ERROR ALERT IF RECEIPT ACCESS VIOLATION OCCURS */}
      {apiErrorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{apiErrorMessage}</span>
          </div>
          <button
            onClick={() => setApiErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Enrolled Batch */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Batch</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-black text-white mt-2 truncate">
              {student.batch || 'General Batch'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Roll No: {student.rollNo || 'Pending'}</p>
          </div>
          {onJoinNewBatch && (
            <button
              onClick={onJoinNewBatch}
              className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Join Another Batch</span>
            </button>
          )}
        </div>

        {/* Attendance Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attendance</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {student.attendanceRate || 95}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Regular Batch Attendance</p>
        </div>

        {/* Quizzes Attempted */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quizzes Attempted</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {quizzesAttemptedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Evaluated Submissions</p>
        </div>

        {/* Fee Status Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fee Balance</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-white">₹{student.feeAmount || 2500}</span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Monthly Batch Fee</p>
        </div>

      </div>

      {/* =================================================================== */}
      {/* CONDITIONAL FEE & RECEIPT ACCESS CONTAINER */}
      {/* =================================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white">My Tuition Fee & Official Receipts</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure batch billing ledger with verified receipt access control
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* FEE DETAILS HIGHLIGHT BOX */}
        <div className="p-6 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {student.batch || 'Batch Enrollment'}
            </span>
            <h4 className="text-2xl font-black text-white">
              Monthly Fee: ₹{student.feeAmount || 2500}
            </h4>
            <p className="text-xs text-indigo-200">
              Instructor: <strong>{activeTeacher?.name || 'Assigned Instructor'}</strong>
              {activeTeacher?.phone && ` • Contact: ${activeTeacher.phone}`}
            </p>
            <p className="text-xs text-slate-400">
              Teacher UPI: {activeTeacher?.upiId ? (
                <span className="font-mono text-emerald-400 font-bold">{activeTeacher.upiId}</span>
              ) : (
                <span className="text-amber-400/80 italic text-[11px]">Teacher has not configured UPI payments yet</span>
              )}
            </p>
          </div>

          {/* ACTION BUTTONS & CONDITIONAL RECEIPT GUARD */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Pay via QR button */}
            {onPayViaQR && (
              <button
                onClick={onPayViaQR}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay Now via UPI QR</span>
              </button>
            )}

            {/* CONDITIONAL RECEIPT ACCESS GUARD */}
            {isPaid ? (
              // When feeStatus === 'PAID': Render the Receipt download button
              <button
                onClick={() => handleReceiptClick(student.batch)}
                disabled={downloadingReceipt}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>{downloadingReceipt ? 'Generating Receipt...' : 'Download Official Receipt'}</span>
              </button>
            ) : (
              // When feeStatus is 'PENDING' or 'UNPAID': Hide button and display required text
              <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-semibold text-amber-300 flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Receipt issued upon payment verification</span>
              </div>
            )}

          </div>
        </div>

        {/* SECURITY & RBAC ADVISORY NOTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Payment Verification Policy</span>
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Upon completing payment via UPI, your transaction reference is verified by your tuition center. Once marked as Paid, official tax-compliant fee receipts become instantly accessible.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Strict RBAC Data Isolation</span>
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Students have read-only access to their own billing history. Records belonging to other students and center-wide revenue totals remain inaccessible.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

