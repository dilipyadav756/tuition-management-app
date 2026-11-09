import React, { useState } from 'react';
import TuitionPortal from '../tuition_management_portal';
import LoginPage from './components/LoginPage';
import SuperAdminWorkspace from './components/SuperAdminWorkspace';
import { Key, Lock, X, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  const handleLoginSuccess = (authData) => {
    setCurrentUser(authData.user);
    try {
      localStorage.setItem('tm_auth_user', JSON.stringify(authData.user));
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

  // Direct passkey authorization into Super-Admin Workspace
  const handleAdminPasskeySubmit = (e) => {
    e.preventDefault();
    const trimmed = passkeyInput.trim();
    if (trimmed === 'ADMIN2026' || trimmed === 'admin123' || trimmed === 'superadmin') {
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
      setShowAdminPasskeyModal(false);
      setPasskeyInput('');
      setPasskeyError('');
    } else {
      setPasskeyError('Invalid secret passkey. Access denied.');
    }
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
        {/* Passkey Super-Admin Access Button */}
        <button
          onClick={() => setShowAdminPasskeyModal(true)}
          className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 hover:border-purple-400 text-purple-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-purple-700/80 flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer"
          title="Open Super-Admin App Owner Console"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <Key className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">👑 Super-Admin</span>
        </button>

        {/* Toggle Login Page Pill */}
        <button
          onClick={() => setShowLoginScreen(true)}
          className="bg-slate-900/95 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-slate-700/80 flex items-center space-x-2 backdrop-blur-md transition-all cursor-pointer hover:border-indigo-500"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>🔐 Login Screen</span>
        </button>
      </div>

      {/* SECRET PASSKEY MODAL FOR SUPER-ADMIN */}
      {showAdminPasskeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-800/80 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Super-Admin Access</h3>
                  <p className="text-[11px] text-slate-400">Enter App Owner secret passkey</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowAdminPasskeyModal(false); setPasskeyError(''); setPasskeyInput(''); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminPasskeySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Secret Master Passkey</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    required
                    autoFocus
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => { setPasskeyInput(e.target.value); setPasskeyError(''); }}
                    placeholder="Enter passkey (e.g. ADMIN2026)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Authorized App Owners & System Administrators only.</p>
              </div>

              {passkeyError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passkeyError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdminPasskeyModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Unlock Console</span>
                </button>
              </div>
            </form>
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
