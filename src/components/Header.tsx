import React from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  Bell, 
  Globe, 
  Key, 
  Download, 
  Upload, 
  Lock, 
  ShieldCheck, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';

/**
 * Demo accounts strictly permitted for public tuition center selection.
 * All live/registered database accounts are removed from this selector array.
 */
export const DEMO_PUBLIC_TEACHERS: { id: string; name: string; subject: string }[] = [
  { id: 't1', name: 'Prof. Rajesh Sharma', subject: 'Mathematics & Physics' },
  { id: 't2', name: 'Ms. Anita Verma', subject: 'Chemistry & Biology' }
];

export interface HeaderProps {
  currentRole: 'teacher' | 'student';
  currentTeacherId: string;
  onSwitchTeacher: (teacherId: string) => void;
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    tuitionId?: string;
  } | null;
  activeStudent?: {
    name: string;
    batch: string;
    rollNo: string;
  };
  pendingRequestsCount?: number;
  onOpenRequests?: () => void;
  onOpenAdmissionsSite?: () => void;
  onJoinBatchClick?: () => void;
  onRoleSwitch?: (role: 'teacher' | 'student') => void;
  onLogout?: () => void;
  isTeacherUnlocked?: boolean;
  onOpenChangePin?: () => void;
  onExportData?: () => void;
  onImportDataClick?: () => void;
  onLockTeacher?: () => void;
}

export default function Header({
  currentRole,
  currentTeacherId,
  onSwitchTeacher,
  currentUser = null,
  activeStudent,
  pendingRequestsCount = 0,
  onOpenRequests,
  onOpenAdmissionsSite,
  onJoinBatchClick,
  onRoleSwitch,
  onLogout,
  isTeacherUnlocked = false,
  onOpenChangePin,
  onExportData,
  onImportDataClick,
  onLockTeacher,
}: HeaderProps) {
  // Ensure the selected value always stays constrained to demo accounts for public users
  const activeSelectorValue = (currentTeacherId === 't1' || currentTeacherId === 't2') 
    ? currentTeacherId 
    : 't1';

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRAND IDENTITY */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-400/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
              EduMaster <span className="text-xs bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">Tuition Hub</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Role-Based Tuition & Batch Management Platform</p>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {currentRole === 'teacher' ? (
            <div className="flex items-center space-x-2">
              
              {/* TUITION CENTER SELECTION DROPDOWN (ONLY 2 DEMO ACCOUNTS VISIBLE TO PUBLIC USERS) */}
              {(!currentUser || currentUser.role !== 'TEACHER') && (
                <div className="flex items-center bg-slate-800 rounded-lg px-2 sm:px-3 py-1.5 border border-slate-700">
                  <UserCheck className="w-4 h-4 text-indigo-400 mr-2 hidden sm:block" />
                  <span className="text-xs text-slate-400 mr-2 hidden md:inline">Tuition Center:</span>
                  <select 
                    value={activeSelectorValue} 
                    onChange={(e) => onSwitchTeacher(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-indigo-200 cursor-pointer"
                    aria-label="Select Demo Tuition Center"
                  >
                    {DEMO_PUBLIC_TEACHERS.map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-800 text-white">
                        {t.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* BATCH JOIN REQUESTS ALERT PILL */}
              {onOpenRequests && (
                <button
                  onClick={onOpenRequests}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    pendingRequestsCount > 0 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View incoming student join requests"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Requests</span>
                  {pendingRequestsCount > 0 && (
                    <span className="bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}

              {/* PUBLIC ADMISSIONS MICROSITE BUTTON */}
              {onOpenAdmissionsSite && (
                <button
                  onClick={onOpenAdmissionsSite}
                  className="bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
                  title="Open Public Admissions Microsite"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Admissions Site</span>
                </button>
              )}

              {/* TEACHER SECURITY TOOLS (PIN, BACKUP, LOCK) */}
              {isTeacherUnlocked && (
                <>
                  {onOpenChangePin && (
                    <button
                      onClick={onOpenChangePin}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-slate-700"
                      title="Change 4-Digit Security PIN"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">PIN</span>
                    </button>
                  )}
                  {onExportData && (
                    <button
                      onClick={onExportData}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-slate-700"
                      title="Export Tuition Backup (JSON)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Export</span>
                    </button>
                  )}
                  {onImportDataClick && (
                    <button
                      onClick={onImportDataClick}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-slate-700"
                      title="Import & Load Backup File (.json)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Import</span>
                    </button>
                  )}
                  {onLockTeacher && (
                    <button
                      onClick={onLockTeacher}
                      className="bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-amber-500/40"
                      title="Lock workspace immediately"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lock</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* STUDENT PROFILE PILL */}
              {activeStudent && (
                <div className="flex items-center bg-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 border border-slate-700">
                  <User className="w-4 h-4 text-emerald-400 mr-2" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-emerald-300 leading-none">{activeStudent.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{activeStudent.batch} • Roll #{activeStudent.rollNo}</p>
                  </div>
                </div>
              )}

              {/* STUDENT JOIN BATCH ACTION */}
              {onJoinBatchClick && (
                <button
                  onClick={onJoinBatchClick}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all ring-1 ring-emerald-400/30"
                  title="Enter 6-digit code to join a batch"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Join Batch</span>
                </button>
              )}
            </div>
          )}

          {/* ROLE SWITCHER / BADGE */}
          {currentUser ? (
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border ${
              currentRole === 'teacher' 
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
            }`}>
              {currentRole === 'teacher' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="capitalize">{currentRole === 'teacher' ? 'Instructor' : 'Student'} Role</span>
            </div>
          ) : onRoleSwitch && (
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => onRoleSwitch('teacher')}
                className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentRole === 'teacher' 
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-white/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Teacher</span>
              </button>
              <button
                onClick={() => onRoleSwitch('student')}
                className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentRole === 'student' 
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-white/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>
          )}

          {/* LOGOUT */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Log Out of Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
