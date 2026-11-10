import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCw, 
  Copy, 
  Check, 
  Sparkles,
  KeyRound,
  Shield
} from 'lucide-react';
import { 
  isSuperAdminSetupCompleted, 
  setupSuperAdmin, 
  verifySuperAdminPassword, 
  resetSuperAdminWithRecoveryKey, 
  validatePasswordStrength,
  getRateLimitStatus,
  RateLimitStatus
} from '../utils/adminSecurity';

export interface SuperAdminLoginProps {
  onSuccess: (authData: { user: any; token: string }) => void;
  onCancel?: () => void;
}

export default function SuperAdminLogin({ onSuccess, onCancel }: SuperAdminLoginProps) {
  // View mode: 'LOGIN' | 'FIRST_TIME_SETUP' | 'FORGOT_PASSWORD'
  const [viewMode, setViewMode] = useState<'LOGIN' | 'FIRST_TIME_SETUP' | 'FORGOT_PASSWORD'>(() => {
    return isSuperAdminSetupCompleted() ? 'LOGIN' : 'FIRST_TIME_SETUP';
  });

  // Login form state
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Setup form state
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState<string | null>(null);
  const [hasCopiedRecoveryKey, setHasCopiedRecoveryKey] = useState(false);
  const [hasAcknowledgedRecovery, setHasAcknowledgedRecovery] = useState(false);

  // Recovery form state
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Rate limit / lockout live state
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(getRateLimitStatus());

  // Lockout countdown timer
  useEffect(() => {
    if (!rateLimit.isLocked || rateLimit.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimit(prev => {
        if (prev.remainingSeconds <= 1) {
          return { ...prev, isLocked: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimit.isLocked]);

  // Handle standard Super-Admin Login (Password-Only)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimit.isLocked) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await verifySuperAdminPassword(adminPassword);

      if (res.success && res.user) {
        setSuccessMessage('Authentication successful. Initializing administrator console...');
        setTimeout(() => {
          onSuccess({
            user: res.user,
            token: 'jwt_admin_session_' + Date.now()
          });
        }, 350);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        if (res.rateLimit) {
          setRateLimit(res.rateLimit);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle First-Time Owner Password Setup
  const handleInitialSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (setupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const validation = validatePasswordStrength(setupPassword);
    if (!validation.isValid) {
      setErrorMessage(validation.errors[0] || 'Password does not satisfy security policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await setupSuperAdmin(setupPassword);
      if (res.success && res.recoveryKey) {
        setGeneratedRecoveryKey(res.recoveryKey);
        setSuccessMessage('Private administrator credentials established!');
      } else {
        setErrorMessage(res.error || 'Failed to initialize administrator password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Setup error.');
    } finally {
      setLoading(false);
    }
  };

  // Complete setup after acknowledging recovery key
  const handleFinishSetup = async () => {
    if (!hasAcknowledgedRecovery) {
      setErrorMessage('Please confirm that you have saved your Master Recovery Key.');
      return;
    }

    // Auto-login the owner right after setup
    setLoading(true);
    const res = await verifySuperAdminPassword(setupPassword);
    if (res.success && res.user) {
      onSuccess({
        user: res.user,
        token: 'jwt_admin_session_' + Date.now()
      });
    } else {
      setViewMode('LOGIN');
      setSuccessMessage('Setup complete. Please authenticate with your new password.');
    }
    setLoading(false);
  };

  // Handle Forgot Password with Master Recovery Key
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setErrorMessage(validation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await resetSuperAdminWithRecoveryKey(recoveryKeyInput, newPassword);
      if (res.success) {
        setSuccessMessage('Password reset successfully. You may now log in.');
        setViewMode('LOGIN');
        setAdminPassword('');
        setRecoveryKeyInput('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset error.');
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryKey = () => {
    if (generatedRecoveryKey) {
      navigator.clipboard?.writeText(generatedRecoveryKey);
      setHasCopiedRecoveryKey(true);
      setTimeout(() => setHasCopiedRecoveryKey(false), 3000);
    }
  };

  const setupStrength = validatePasswordStrength(setupPassword);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* BRAND & HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-xl shadow-purple-600/30">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {viewMode === 'FIRST_TIME_SETUP' 
            ? 'Initial Administrator Setup'
            : viewMode === 'FORGOT_PASSWORD'
            ? 'Recover Administrator Access'
            : 'Super Admin Login'
          }
        </h2>
        <p className="text-xs text-slate-400">
          {viewMode === 'FIRST_TIME_SETUP'
            ? 'Create a private, unshared master password for your EduMaster instance'
            : viewMode === 'FORGOT_PASSWORD'
            ? 'Enter your 16-character master recovery key to set a new password'
            : 'Authorized platform application owners and system administrators only'
          }
        </p>
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* RATE LIMIT LOCKOUT NOTICE */}
      {rateLimit.isLocked && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Console Access Temporarily Locked</span>
          </div>
          <p className="text-[11px] text-amber-300/80">
            Too many consecutive failed login attempts. To prevent unauthorized intrusion, access is locked for{' '}
            <strong className="font-mono text-white">{rateLimit.remainingSeconds} seconds</strong>.
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. STANDARD LOGIN (PASSWORD ONLY — NO EMAIL / NO PREFILL) */}
      {/* =================================================================== */}
      {viewMode === 'LOGIN' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Administrator Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setViewMode('FORGOT_PASSWORD');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                autoFocus
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={e => {
                  setAdminPassword(e.target.value);
                  setErrorMessage('');
                }}
                disabled={rateLimit.isLocked || loading}
                placeholder="Enter private administrator password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || rateLimit.isLocked || !adminPassword}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Authenticate as Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* SECURITY BADGE */}
          <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected Administrator Access • 100k-PBKDF2 SHA-256</span>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* 2. FIRST-TIME OWNER SETUP FLOW */}
      {/* =================================================================== */}
      {viewMode === 'FIRST_TIME_SETUP' && (
        <div className="space-y-5">
          {!generatedRecoveryKey ? (
            <form onSubmit={handleInitialSetupSubmit} className="space-y-4">
              <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-200 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">First-Time Setup Required</p>
                  <p className="text-[11px] text-purple-300/80 mt-0.5">
                    No default credentials exist. Create your private master password now. This setup flow will be permanently sealed afterward.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  New Super-Admin Password (Min 12 Characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={setupPassword}
                    onChange={e => setSetupPassword(e.target.value)}
                    placeholder="Create private master password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* PASSWORD STRENGTH METER */}
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        setupStrength.score <= 1 
                          ? 'w-1/4 bg-rose-500' 
                          : setupStrength.score === 2 
                          ? 'w-2/4 bg-amber-500' 
                          : setupStrength.score === 3 
                          ? 'w-3/4 bg-blue-500' 
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Password Strength:</span>
                    <span className="font-bold text-slate-300">
                      {setupStrength.score <= 1 ? 'Weak' : setupStrength.score === 2 ? 'Fair' : setupStrength.score === 3 ? 'Good' : 'Strong & Compliant'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat master password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !setupStrength.isValid || setupPassword !== confirmPassword}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Initialize Private Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* RECOVERY KEY REVEAL PANEL */
            <div className="p-5 bg-slate-800/80 border border-purple-500/40 rounded-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Critical Security Step
                </span>
                <h3 className="text-base font-bold text-white">Save Your Master Recovery Key</h3>
                <p className="text-xs text-slate-300">
                  Store this single-use recovery key in a password manager. It is your only way to regain access if you forget your password.
                </p>
              </div>

              {/* RECOVERY KEY CHIP */}
              <div className="p-3.5 bg-slate-950 border border-purple-600/60 rounded-xl flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-purple-300 tracking-wider select-all">
                  {generatedRecoveryKey}
                </span>
                <button
                  type="button"
                  onClick={copyRecoveryKey}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {hasCopiedRecoveryKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* CONFIRMATION CHECKBOX */}
              <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hasAcknowledgedRecovery}
                  onChange={e => setHasAcknowledgedRecovery(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I have securely saved this recovery key in a safe offline location or password manager.
                </span>
              </label>

              <button
                type="button"
                onClick={handleFinishSetup}
                disabled={!hasAcknowledgedRecovery || loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Setup & Enter Console</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. FORGOT PASSWORD / RECOVERY KEY RESET */}
      {/* =================================================================== */}
      {viewMode === 'FORGOT_PASSWORD' && (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-2xl text-xs text-purple-200">
            <p className="font-bold text-white">Emergency Key Recovery</p>
            <p className="text-[11px] text-purple-300/80 mt-0.5">
              Enter the 16-character Master Recovery Key provided during your initial setup.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Master Recovery Key (e.g. EDUM-XXXX-XXXX-XXXX) *
            </label>
            <input
              required
              type="text"
              value={recoveryKeyInput}
              onChange={e => setRecoveryKeyInput(e.target.value.toUpperCase())}
              placeholder="EDUM-XXXX-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              New Administrator Password *
            </label>
            <input
              required
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 12 characters"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Confirm New Password *
            </label>
            <input
              required
              type="password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setViewMode('LOGIN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={loading || !recoveryKeyInput || !newPassword}
              className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Reset Password</span>}
            </button>
          </div>
        </form>
      )}

      {/* CANCEL ACTION */}
      {onCancel && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
          >
            ← Return to Main Portal
          </button>
        </div>
      )}
    </div>
  );
}

