import React from 'react';
import { 
  GraduationCap, 
  X, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  UserPlus, 
  LogIn,
  Layers,
  FileSpreadsheet,
  Users
} from 'lucide-react';

export interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onStudentLogin?: () => void;
  intendedAction?: string;
}

export default function AuthGateModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onStudentLogin,
  intendedAction
}: AuthGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* MODAL WRAPPER */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 flex flex-col animate-in zoom-in-95 duration-150 relative">

        {/* TOP ACCENT STRIP */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

        {/* MODAL HEADER WITH CLOSE BUTTON */}
        <div className="p-6 pb-2 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              {intendedAction && (
                <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mb-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Sign in required for: {intendedAction}</span>
                </div>
              )}
              {/* EXACT REQUIRED TITLE */}
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Start Managing Your Tuition Centre
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="px-6 py-4 space-y-5">
          
          {/* EXACT REQUIRED DESCRIPTION */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create your free EduMaster account to access all management features.
          </p>

          {/* VALUE HIGHLIGHTS */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Batch, Attendance & Fee Register management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dynamic Bharat-UPI QR codes for instant payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Digital study material desk & auto-evaluated quizzes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-sheet Excel (.xlsx) reports with tenant isolation</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-1">
            {/* BUTTON 1: LOGIN TO YOUR ACCOUNT */}
            <button
              onClick={onLogin}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* BUTTON 2: CREATE FREE ACCOUNT */}
            <button
              onClick={onRegister}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 text-indigo-200 hover:text-white border border-slate-700/80 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Create Free Account</span>
            </button>
          </div>

        </div>

        {/* FOOTER NOTE & STUDENT LINK */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-center space-y-1.5">
          {onStudentLogin && (
            <button
              type="button"
              onClick={onStudentLogin}
              className="text-xs text-slate-400 hover:text-emerald-300 transition-colors inline-flex items-center space-x-1 cursor-pointer font-medium"
            >
              <span>Enrolled student or parent? Access Student Portal →</span>
            </button>
          )}
          <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict Multi-Tenant Privacy • Free 14-Day Full Access</span>
          </div>
        </div>

      </div>

    </div>
  );
}
