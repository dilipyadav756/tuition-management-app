import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  KeyRound,
  RotateCw,
  X,
  Key,
  Upload
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  // Active Tab: 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN'
  const [activeRoleTab, setActiveRoleTab] = useState('TEACHER');

  // Teacher Form Mode: 'LOGIN' | 'REGISTER'
  const [teacherView, setTeacherView] = useState('LOGIN');

  // Student Login Method: 'PASSWORD' | 'OTP'
  const [studentAuthMethod, setStudentAuthMethod] = useState('PASSWORD');

  // Common UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [tenantSwitcherData, setTenantSwitcherData] = useState(null); // { user, tenants, token }

  // Form Fields - Teacher Login
  const [teacherEmailOrPhone, setTeacherEmailOrPhone] = useState('sharma.tuitions@gmail.com');
  const [teacherPassword, setTeacherPassword] = useState('Sharma@123');

  // Form Fields - Teacher Registration
  const [regTuitionName, setRegTuitionName] = useState('');
  const [regTeacherName, setRegTeacherName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('1234');

  // Form Fields - Student Login
  const [studentIdentifier, setStudentIdentifier] = useState('9111122222');
  const [studentPassword, setStudentPassword] = useState('Student@123');
  const [studentOtp, setStudentOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Form Fields - Super-Admin Login
  const [adminUsername, setAdminUsername] = useState('admin@edumaster.io');
  const [adminPasskey, setAdminPasskey] = useState('');

  // Helper to trigger OTP countdown
  const startOtpTimer = () => {
    setOtpTimer(45);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  // 1. Teacher Login Submit
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // Simulating API verification:
      setTimeout(() => {
        setLoading(false);

        // Check dynamically registered accounts from localStorage first
        try {
          const registeredRaw = localStorage.getItem('tm_registered_accounts');
          const registeredAccounts = registeredRaw ? JSON.parse(registeredRaw) : [];
          const matched = registeredAccounts.find(
            a => (a.email?.toLowerCase() === teacherEmailOrPhone.trim().toLowerCase() || a.phone === teacherEmailOrPhone.trim()) &&
                 a.password === teacherPassword
          );
          if (matched) {
            const authData = {
              token: 'jwt_mock_token_teacher_' + Date.now(),
              user: {
                id: matched.id,
                name: matched.name,
                email: matched.email,
                phone: matched.phone,
                role: 'TEACHER',
                tuitionId: matched.id,
                tuitionName: matched.tuitionName
              }
            };
            localStorage.setItem('tm_current_teacher_id', matched.id);
            localStorage.setItem('tm_auth_user', JSON.stringify(authData.user));
            setSuccessMessage('Instructor authenticated successfully! Redirecting...');
            if (onLoginSuccess) {
              setTimeout(() => onLoginSuccess(authData), 600);
            }
            return;
          }
        } catch {}

        if (
          (teacherEmailOrPhone === 'sharma.tuitions@gmail.com' || teacherEmailOrPhone === '9876543210') &&
          (teacherPassword === 'Sharma@123' || teacherPassword === 'demo123')
        ) {
          const authData = {
            token: 'jwt_mock_token_teacher_' + Date.now(),
            user: {
              id: 't1',
              name: 'Prof. Rajesh Sharma',
              email: 'sharma.tuitions@gmail.com',
              role: 'TEACHER',
              tuitionId: 't1',
              tuitionName: 'Sharma Mathematics & Physics Academy'
            }
          };
          localStorage.setItem('tm_current_teacher_id', 't1');
          localStorage.setItem('tm_auth_user', JSON.stringify(authData.user));
          setSuccessMessage('Instructor authenticated successfully! Redirecting...');
          if (onLoginSuccess) {
            setTimeout(() => onLoginSuccess(authData), 600);
          }
        } else if (
          (teacherEmailOrPhone === 'anita.science@gmail.com' || teacherEmailOrPhone === '9812345678') &&
          (teacherPassword === 'demo123' || teacherPassword === 'Verma@123')
        ) {
          const authData = {
            token: 'jwt_mock_token_teacher_' + Date.now(),
            user: {
              id: 't2',
              name: 'Ms. Anita Verma',
              email: 'anita.science@gmail.com',
              role: 'TEACHER',
              tuitionId: 't2',
              tuitionName: 'Verma Science & Biology Hub'
            }
          };
          localStorage.setItem('tm_current_teacher_id', 't2');
          localStorage.setItem('tm_auth_user', JSON.stringify(authData.user));
          setSuccessMessage('Instructor authenticated successfully! Redirecting...');
          if (onLoginSuccess) {
            setTimeout(() => onLoginSuccess(authData), 600);
          }
        } else {
          setErrorMessage('Invalid teacher credentials. Hint: use sharma.tuitions@gmail.com / Sharma@123 or anita.science@gmail.com / demo123');
        }
      }, 700);

    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication error.');
    }
  };

  // 2. Teacher Registration Submit
  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (regPassword.length < 6) {
      setLoading(false);
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setTimeout(() => {
      setLoading(false);
      const newTuitionId = `t_${Date.now()}`;
      const authData = {
        token: 'jwt_mock_token_new_inst_' + Date.now(),
        user: {
          id: newTuitionId,
          name: regTeacherName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          role: 'TEACHER',
          tuitionId: newTuitionId,
          tuitionName: regTuitionName.trim(),
          pin: regPin.trim() || '1234'
        }
      };

      // Persist isolated teacher record and clean initial batch to localStorage
      try {
        const newTeacherRecord = {
          id: newTuitionId,
          name: regTeacherName.trim(),
          subject: regTuitionName.trim() || 'General Academics',
          email: regEmail.trim(),
          phone: regPhone.trim(),
          pin: regPin.trim() || '1234',
          status: 'Active',
          upiId: `${regPhone.trim().replace(/\D/g, '') || 'teacher'}@upi`,
          location: regTuitionName.trim(),
          bio: `Tuition center managed by ${regTeacherName.trim()}. Dedicated coaching and structured test series.`,
          resultsHeadline: 'New Academic Batches Now Open for Enrollment!'
        };

        const initialBatch = {
          id: `b_${Date.now()}`,
          teacherId: newTuitionId,
          name: `${regTuitionName.trim()} - Foundation Batch`,
          subject: regTuitionName.trim() || 'General Academics',
          joinCode: String(Math.floor(100000 + Math.random() * 900000)),
          monthlyFee: 2500,
          schedule: 'Mon, Wed, Fri (5:00 PM - 6:30 PM)'
        };

        const existingRawTeachers = localStorage.getItem('tm_teachers');
        const existingTeachers = existingRawTeachers ? JSON.parse(existingRawTeachers) : [];
        const baseTeachers = existingTeachers.length > 0 ? existingTeachers : [
          { 
            id: 't1', 
            name: 'Prof. Rajesh Sharma', 
            subject: 'Mathematics & Physics', 
            email: 'sharma.tuitions@gmail.com', 
            phone: '+91 98765 43210',
            upiId: 'sharmaclasses@upi',
            location: 'Sector 14, Near City Park, Gurugram',
            bio: '15+ Years experience preparing students for Board exams and competitive entrance tests.',
            resultsHeadline: '98% Students Scored Above 90% in 2026 Board Exams!'
          },
          { 
            id: 't2', 
            name: 'Ms. Anita Verma', 
            subject: 'Chemistry & Biology', 
            email: 'anita.science@gmail.com', 
            phone: '+91 98123 45678',
            upiId: 'anita.verma@okaxis',
            location: 'Model Town, Delhi',
            bio: 'Ex-Lecturer specializing in NEET and CBSE Board preparation.',
            resultsHeadline: 'Top Rankers in NEET 2025 & 2026.'
          }
        ];
        localStorage.setItem('tm_teachers', JSON.stringify([...baseTeachers, newTeacherRecord]));

        const existingRawBatches = localStorage.getItem('tm_batches');
        const existingBatches = existingRawBatches ? JSON.parse(existingRawBatches) : [];
        localStorage.setItem('tm_batches', JSON.stringify([...existingBatches, initialBatch]));

        // Save registered credentials for subsequent logins
        const existingRawAccounts = localStorage.getItem('tm_registered_accounts');
        const existingAccounts = existingRawAccounts ? JSON.parse(existingRawAccounts) : [];
        const newAccount = {
          id: newTuitionId,
          name: regTeacherName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          tuitionName: regTuitionName.trim(),
          password: regPassword
        };
        localStorage.setItem('tm_registered_accounts', JSON.stringify([...existingAccounts, newAccount]));

        // Explicitly set isolated session
        localStorage.setItem('tm_current_teacher_id', newTuitionId);
        localStorage.setItem('tm_auth_user', JSON.stringify(authData.user));
      } catch (err) {
        console.error('Failed to isolate new teacher registration in localStorage', err);
      }

      setSuccessMessage(`Welcome! Tuition Center "${regTuitionName}" created successfully.`);
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(authData), 800);
      }
    }, 900);
  };

  // 3. Student Login Submit
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (studentAuthMethod === 'OTP') {
        if (!otpSent) {
          setErrorMessage('Please click "Send OTP" to receive a verification code.');
          return;
        }
        if (studentOtp !== '8492' && studentOtp !== '123456') {
          setErrorMessage('Invalid verification OTP. Try code 8492.');
          return;
        }
      } else {
        if (studentPassword !== 'Student@123' && studentPassword !== 'demo123') {
          setErrorMessage('Incorrect password. Hint: Student@123 or demo123');
          return;
        }
      }

      // Check single-tuition student (Priya Singh)
      if (studentIdentifier === '9333344444' || studentIdentifier === 'priya102') {
        const authData = {
          token: 'jwt_mock_student_token_' + Date.now(),
          user: {
            id: 's2',
            name: 'Priya Singh',
            phone: '9333344444',
            role: 'STUDENT',
            tuitionId: 't1',
            tuitionName: 'Sharma Mathematics & Physics Academy',
            batch: 'Class 10 - Batch A',
            rollNo: '102'
          }
        };
        setSuccessMessage('Student authenticated! Entering portal...');
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(authData), 600);
        }
        return;
      }

      // Check if student belongs to multiple tuition centers (Multi-Tenant demonstration)
      // Aarav Patel belongs to 2 tuition academies!
      const multiTenants = [
        {
          tuitionId: 't1',
          tuitionName: 'Sharma Mathematics & Physics Academy',
          instructor: 'Prof. Rajesh Sharma',
          batch: 'Class 10 - Batch A',
          rollNo: '101'
        },
        {
          tuitionId: 't2',
          tuitionName: 'Verma Science & Biology Hub',
          instructor: 'Ms. Anita Verma',
          batch: 'Class 10 - Foundation Bio',
          rollNo: 'S-205'
        }
      ];

      // Trigger Tenant Switcher Modal!
      setTenantSwitcherData({
        user: {
          id: 's1',
          name: 'Aarav Patel',
          phone: studentIdentifier,
          role: 'STUDENT'
        },
        tenants: multiTenants,
        token: 'jwt_mock_student_token_' + Date.now()
      });

    }, 700);
  };

  // 4. Request OTP for Student
  const handleSendOtp = () => {
    if (!studentIdentifier || studentIdentifier.length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }
    setErrorMessage('');
    setOtpSent(true);
    startOtpTimer();
    setStudentOtp('8492'); // Auto-fill demo OTP
    setSuccessMessage('Demo OTP [8492] dispatched to ' + studentIdentifier);
  };

  // 5. Select Tuition from Tenant Switcher
  const handleSelectTenant = (selectedTenant) => {
    const finalAuth = {
      token: tenantSwitcherData.token,
      user: {
        ...tenantSwitcherData.user,
        tuitionId: selectedTenant.tuitionId,
        tuitionName: selectedTenant.tuitionName,
        batch: selectedTenant.batch,
        rollNo: selectedTenant.rollNo
      }
    };
    setTenantSwitcherData(null);
    setSuccessMessage(`Entering ${selectedTenant.tuitionName}...`);
    if (onLoginSuccess) {
      setTimeout(() => onLoginSuccess(finalAuth), 400);
    }
  };

  // 6. Forgot Password Submit
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(false);
    setSuccessMessage(`Password recovery instructions dispatched to ${forgotIdentifier}`);
    setForgotIdentifier('');
  };

  // 7. Super-Admin Passkey Login Submit
  const handleSuperAdminLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const trimmed = adminPasskey.trim();
      if (trimmed === 'ADMIN2026' || trimmed === 'admin123' || trimmed === 'superadmin') {
        const authData = {
          token: 'jwt_mock_superadmin_token_' + Date.now(),
          user: {
            id: 'admin_root',
            name: 'Platform Super-Admin',
            email: adminUsername.trim() || 'admin@edumaster.io',
            role: 'SUPER_ADMIN',
            tuitionId: 'system_root',
            tuitionName: 'EduMaster Global Multi-Tenant Network'
          }
        };
        setSuccessMessage('Super-Admin authenticated! Opening Command Center...');
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(authData), 600);
        }
      } else {
        setErrorMessage('Invalid Super-Admin credentials or passkey. Access denied.');
      }
    }, 600);
  };

  // 8. Direct Backup File Import from Computer (.json)
  const handleImportBackupFromComputer = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        if (!backupData.teacher || !backupData.teacher.id) {
          setErrorMessage('Invalid tuition backup file: missing teacher profile.');
          return;
        }

        const t = backupData.teacher;
        // 1. Save teacher into tm_teachers
        const existingTeachersRaw = localStorage.getItem('tm_teachers');
        const existingTeachers = existingTeachersRaw ? JSON.parse(existingTeachersRaw) : [];
        const filtered = existingTeachers.filter(item => item.id !== t.id);
        filtered.push(t);
        localStorage.setItem('tm_teachers', JSON.stringify(filtered));

        // 2. Save batches if present
        if (backupData.batches && backupData.batches.length > 0) {
          const existingBatchesRaw = localStorage.getItem('tm_batches');
          const existingBatches = existingBatchesRaw ? JSON.parse(existingBatchesRaw) : [];
          const bFiltered = existingBatches.filter(b => b.teacherId !== t.id);
          localStorage.setItem('tm_batches', JSON.stringify([...bFiltered, ...backupData.batches]));
        }

        // 3. Save students if present
        if (backupData.students && backupData.students.length > 0) {
          const existingStudentsRaw = localStorage.getItem('tm_students');
          const existingStudents = existingStudentsRaw ? JSON.parse(existingStudentsRaw) : [];
          const sFiltered = existingStudents.filter(s => s.teacherId !== t.id);
          localStorage.setItem('tm_students', JSON.stringify([...sFiltered, ...backupData.students]));
        }

        // 4. Save notes if present
        if (backupData.notes && backupData.notes.length > 0) {
          const existingNotesRaw = localStorage.getItem('tm_notes');
          const existingNotes = existingNotesRaw ? JSON.parse(existingNotesRaw) : [];
          const nFiltered = existingNotes.filter(n => n.teacherId !== t.id);
          localStorage.setItem('tm_notes', JSON.stringify([...nFiltered, ...backupData.notes]));
        }

        // 5. Unlock in sessionStorage
        sessionStorage.setItem(`tm_unlocked_${t.id}`, 'true');
        localStorage.setItem('tm_current_teacher_id', t.id);

        const authData = {
          token: 'jwt_mock_token_imported_' + Date.now(),
          user: {
            id: t.id,
            name: t.name,
            email: t.email || '',
            phone: t.phone || '',
            role: 'TEACHER',
            tuitionId: t.id,
            tuitionName: t.subject || t.name,
            pin: t.pin || '1234'
          }
        };

        setSuccessMessage(`Loaded "${t.name}" workspace successfully from computer! Logging in...`);
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(authData), 600);
        }
      } catch (err) {
        setErrorMessage('Failed to parse backup file. Please select a valid .json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            EduMaster <span className="text-indigo-400">Hub</span>
          </h1>
          <p className="text-xs text-slate-400">
            Secure Multi-Tenant Tuition Portal
          </p>
        </div>

        {/* ROLE TAB SELECTOR (3 ROLES) */}
        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('TEACHER');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeRoleTab === 'TEACHER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Instructor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('STUDENT');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeRoleTab === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('SUPER_ADMIN');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeRoleTab === 'SUPER_ADMIN'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>Super-Admin</span>
          </button>
        </div>

        {/* 1-CLICK QUICK DEMO PROFILES */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-400">1-click test fill</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('TEACHER');
                setTeacherView('LOGIN');
                setTeacherEmailOrPhone('sharma.tuitions@gmail.com');
                setTeacherPassword('Sharma@123');
                setErrorMessage('');
              }}
              className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-indigo-950/70 hover:border-indigo-500/50 border border-slate-800 text-xs transition-all cursor-pointer"
            >
              <p className="font-bold text-indigo-300 truncate">👨‍🏫 Prof. Rajesh Sharma</p>
              <p className="text-[10px] text-slate-400 truncate">Maths & Physics (t1)</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('TEACHER');
                setTeacherView('LOGIN');
                setTeacherEmailOrPhone('anita.science@gmail.com');
                setTeacherPassword('demo123');
                setErrorMessage('');
              }}
              className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-indigo-950/70 hover:border-indigo-500/50 border border-slate-800 text-xs transition-all cursor-pointer"
            >
              <p className="font-bold text-purple-300 truncate">👩‍🏫 Ms. Anita Verma</p>
              <p className="text-[10px] text-slate-400 truncate">Chemistry & Bio (t2)</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('STUDENT');
                setStudentAuthMethod('PASSWORD');
                setStudentIdentifier('9111122222');
                setStudentPassword('Student@123');
                setErrorMessage('');
              }}
              className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-emerald-950/70 hover:border-emerald-500/50 border border-slate-800 text-xs transition-all cursor-pointer"
            >
              <p className="font-bold text-emerald-300 truncate">👨‍🎓 Aarav Patel</p>
              <p className="text-[10px] text-slate-400 truncate">Multi-Tuition Switcher</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('STUDENT');
                setStudentAuthMethod('PASSWORD');
                setStudentIdentifier('9333344444');
                setStudentPassword('demo123');
                setErrorMessage('');
              }}
              className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-emerald-950/70 hover:border-emerald-500/50 border border-slate-800 text-xs transition-all cursor-pointer"
            >
              <p className="font-bold text-emerald-300 truncate">👩‍🎓 Priya Singh</p>
              <p className="text-[10px] text-slate-400 truncate">Single-Tuition (s2)</p>
            </button>

            {/* SUPER ADMIN DEMO PILL */}
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('SUPER_ADMIN');
                setAdminUsername('admin@edumaster.io');
                setAdminPasskey('ADMIN2026');
                setErrorMessage('');
              }}
              className="col-span-2 text-left p-2 rounded-xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-purple-950/70 hover:border-purple-500/60 border border-purple-800/40 text-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="truncate">
                <p className="font-bold text-purple-300 flex items-center gap-1.5 truncate">
                  <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>👑 Demo Super-Admin Workspace</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  admin@edumaster.io • Passkey: <span className="font-mono text-purple-300">ADMIN2026</span>
                </p>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30 shrink-0 ml-2">
                App Owner
              </span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* 1. TEACHER / ADMIN PANEL */}
        {/* =================================================================== */}
        {activeRoleTab === 'TEACHER' && (
          <div>
            {teacherView === 'LOGIN' ? (
              /* TEACHER LOGIN FORM */
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Instructor Email or Mobile
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      required
                      type="text"
                      value={teacherEmailOrPhone}
                      onChange={(e) => setTeacherEmailOrPhone(e.target.value)}
                      placeholder="e.g. sharma.tuitions@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Tuition Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* REGISTER NEW TUITION TRIGGER */}
                <div className="pt-4 border-t border-slate-800/80 text-center">
                  <p className="text-xs text-slate-400 mb-2">New Tutor or Coaching Center?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherView('REGISTER');
                      setErrorMessage('');
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-indigo-300 border border-slate-700/80 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>Register New Tuition Center</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TEACHER REGISTRATION FORM */
              <form onSubmit={handleTeacherRegister} className="space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>Create Tuition Center</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTeacherView('LOGIN')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Back to Login
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tuition / Institute Name
                  </label>
                  <input
                    required
                    type="text"
                    value={regTuitionName}
                    onChange={(e) => setRegTuitionName(e.target.value)}
                    placeholder="e.g. Apex Mathematics Hub"
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Instructor Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={regTeacherName}
                    onChange={(e) => setRegTeacherName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Sharma"
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      required
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tutor@gmail.com"
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone</label>
                    <input
                      required
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      required
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Workspace 4-Digit PIN</label>
                    <input
                      required
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      pattern="\d{4}"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center font-bold tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
                </button>
              </form>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. STUDENT / PARENT PANEL */}
        {/* =================================================================== */}
        {activeRoleTab === 'STUDENT' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {/* SUB-METHOD TOGGLE: PASSWORD VS OTP */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setStudentAuthMethod('PASSWORD')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  studentAuthMethod === 'PASSWORD' ? 'bg-slate-700 text-emerald-300' : 'text-slate-400'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setStudentAuthMethod('OTP')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  studentAuthMethod === 'OTP' ? 'bg-slate-700 text-emerald-300' : 'text-slate-400'
                }`}
              >
                OTP Verification
              </button>
            </div>

            {/* IDENTIFIER INPUT */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Mobile Number / Student Username
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  required
                  type="text"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  placeholder="e.g. 9111122222 or aarav101"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* PASSWORD OR OTP FIELD */}
            {studentAuthMethod === 'PASSWORD' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Student Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter 4-Digit Verification OTP
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={studentOtp}
                      onChange={(e) => setStudentOtp(e.target.value)}
                      placeholder="e.g. 8492"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-wider placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      otpTimer > 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                    }`}
                  >
                    {otpTimer > 0 ? `${otpTimer}s` : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    ✓ Demo OTP: <strong>8492</strong> sent to mobile.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* =================================================================== */}
        {/* 3. SUPER-ADMIN / APP OWNER LOGIN PANEL */}
        {/* =================================================================== */}
        {activeRoleTab === 'SUPER_ADMIN' && (
          <form onSubmit={handleSuperAdminLogin} className="space-y-4">
            <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-2xl text-xs text-purple-200 flex items-start space-x-2.5">
              <Key className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">App Owner & Platform Administration</p>
                <p className="text-[11px] text-purple-300/80 mt-0.5">
                  Restricted access. Requires verified administrative credentials or secret master passkey.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Super-Admin Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  required
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin@edumaster.io"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Secret Master Passkey</label>
                <span className="text-[10px] text-purple-400 font-mono">Restricted Admin Portal</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  placeholder="Enter administrator passkey"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Authenticate as Super-Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* QUICK RESTORE FROM COMPUTER FILE (.JSON) */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <input
            id="login-backup-file-input"
            type="file"
            accept=".json"
            onChange={handleImportBackupFromComputer}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById('login-backup-file-input')?.click()}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center space-x-1.5 mx-auto bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load Workspace File (.json) from Computer</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MULTI-TENANT SWITCHER MODAL */}
      {/* ===================================================================== */}
      {tenantSwitcherData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Multi-Tuition Enrollment Detected
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Select Tuition Center</h3>
                <p className="text-xs text-slate-400">
                  Welcome back, <strong>{tenantSwitcherData.user.name}</strong>. Choose which tuition portal you want to open:
                </p>
              </div>
              <button
                onClick={() => setTenantSwitcherData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {tenantSwitcherData.tenants.map((tenant) => (
                <div
                  key={tenant.tuitionId}
                  onClick={() => handleSelectTenant(tenant)}
                  className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/80 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                      {tenant.tuitionName}
                    </p>
                    <p className="text-xs text-slate-400">
                      Instructor: <span className="text-slate-200">{tenant.instructor}</span> • Batch: <span className="text-emerald-400">{tenant.batch}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Roll No: #{tenant.rollNo}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-700/50 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                You can switch between tuition centers at any time from your account settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. FORGOT PASSWORD / OTP MODAL */}
      {/* ===================================================================== */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Reset Account Password</h3>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-400">
                Enter your registered Email address or 10-digit mobile number to receive a secure password recovery code.
              </p>
              <div>
                <input
                  required
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Email or Mobile"
                  className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Send Recovery OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

