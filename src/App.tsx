import React, { useState } from 'react';
import TuitionPortal from '../tuition_management_portal';
import LoginPage from './components/LoginPage';
import SuperAdminWorkspace from './components/SuperAdminWorkspace';
import SuperAdminLogin from './components/SuperAdminLogin';
import TeacherAuthModal from './components/TeacherAuthModal';
import { Key, Lock, X, Sparkles, ArrowRight, ShieldCheck, AlertCircle, GraduationCap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showAdminPasskeyModal, setShowAdminPasskeyModal] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);

  const handleLoginSuccess = (authData) => {
    const user = authData?.user || authData;
    setCurrentUser(user);
    try {
      localStorage.setItem('tm_auth_user', JSON.stringify(user));
    } catch {}
    setShowLoginScreen(false);
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('tm_auth_user', JSON.stringify(updatedUser));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('tm_auth_user');
      localStorage.removeItem('tm_current_teacher_id');
      // Wipe all session unlocks to prevent session fixation/cross-session leaks
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('tm_unlocked_')) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {}
    setShowLoginScreen(true);
  };

  // Super-Admin switches into a specific teacher's portal to inspect
  const handleSwitchToPortal = (teacherId) => {
    let targetId = teacherId;
    let teacherName = 'Instructor';

    // Strictly resolve from storage; never hardcode fallback to 't1'
    try {
      const savedTeachers = localStorage.getItem('tm_teachers');
      if (savedTeachers) {
        const parsed = JSON.parse(savedTeachers);
        if (!targetId && parsed.length > 0) {
          targetId = parsed[0].id;
        }
        const match = parsed.find(t => t.id === targetId);
        if (match) teacherName = match.name;
      }
    } catch {}

    if (!targetId) {
      alert('No active tuition center found to inspect.');
      return;
    }

    const teacherUser = {
      id: targetId,
      name: teacherName,
      role: 'TEACHER',
      tuitionId: targetId,
      tuitionName: teacherName,
      isImpersonating: true
    };
    setCurrentUser(teacherUser);
    try {
      localStorage.setItem('tm_auth_user', JSON.stringify(teacherUser));
      localStorage.setItem('tm_current_teacher_id', targetId);
      // Auto unlock for inspected portal session
      sessionStorage.setItem(`tm_unlocked_${targetId}`, 'true');
    } catch {}
  };

  // 1. RENDER SUPER-ADMIN WORKSPACE IF AUTHENTICATED AS SUPER-ADMIN
  if (currentUser?.role === 'SUPER_ADMIN') {
    return (
      <SuperAdminWorkspace 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onSwitchToPortal={handleSwitchToPortal} 
      />
    );
  }

  // 2. RENDER LOGIN SCREEN IF REQUESTED
  if (showLoginScreen) {
    return (
      <div className="relative">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowLoginScreen(false)}
            className="bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer"
          >
            <span>← Return to Tuition Portal</span>
          </button>
        </div>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // 3. RENDER TUITION PORTAL
  return (
    <div className="relative">
      {/* FLOATING ACTION PILLS */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2">
        {/* Toggle Login Page Pill */}
        <button
          onClick={() => setShowLoginScreen(true)}
          className="bg-slate-900/95 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-slate-700/80 flex items-center space-x-2 backdrop-blur-md transition-all cursor-pointer hover:border-indigo-500"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>🔐 Login Screen</span>
        </button>
      </div>

      {/* DYNAMIC TEACHER AUTHENTICATION & ONBOARDING MODAL */}
      {showTeacherAuthModal && (
        <TeacherAuthModal
          isOpen={showTeacherAuthModal}
          onClose={() => setShowTeacherAuthModal(false)}
          onSuccess={(authData) => {
            setShowTeacherAuthModal(false);
            handleLoginSuccess(authData);
          }}
        />
      )}

      {/* SECURE SUPER-ADMIN AUTHENTICATION MODAL */}
      {showAdminPasskeyModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-800/80 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 relative my-8">
            <button 
              onClick={() => setShowAdminPasskeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <SuperAdminLogin
              onSuccess={(authData) => {
                setShowAdminPasskeyModal(false);
                handleLoginSuccess(authData);
              }}
              onCancel={() => setShowAdminPasskeyModal(false)}
            />
          </div>
        </div>
      )}

      {/* SUPER-ADMIN IMPERSONATION BANNER */}
      {currentUser?.isImpersonating && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px] font-mono">AUDIT MODE</span>
            <span>Inspecting Center: <u>{currentUser.name}</u> (ID: {currentUser.tuitionId})</span>
          </div>
          <button
            onClick={() => {
              const adminUser = {
                id: 'admin_root',
                name: 'Platform Super-Admin',
                email: 'admin@edumaster.io',
                role: 'SUPER_ADMIN',
                tuitionId: 'system_root',
                tuitionName: 'EduMaster Global Multi-Tenant Network'
              };
              setCurrentUser(adminUser);
              try {
                localStorage.setItem('tm_auth_user', JSON.stringify(adminUser));
              } catch {}
            }}
            className="bg-slate-950 hover:bg-slate-900 text-amber-300 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            ← Exit to Super-Admin Console
          </button>
        </div>
      )}

      <TuitionPortal currentUser={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    </div>
  );
}
