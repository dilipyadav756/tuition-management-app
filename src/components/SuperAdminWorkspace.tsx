import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Activity, 
  ArrowRight, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Sliders, 
  LogOut, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  Key, 
  Lock, 
  Unlock, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Plus, 
  X, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Layers,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  upiId?: string;
  pin?: string;
  location?: string;
  bio?: string;
  resultsHeadline?: string;
  status?: 'Active' | 'Suspended';
  joinedAt?: string;
}

export interface Student {
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

export interface Batch {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  joinCode: string;
  monthlyFee: number;
  schedule: string;
}

export interface SystemLog {
  id: string;
  type: 'TEACHER_REGISTER' | 'BATCH_CREATE' | 'STUDENT_ENROLL' | 'FEE_PAYMENT' | 'STATUS_CHANGE' | 'SECURITY';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

const DEFAULT_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log_1',
    type: 'TEACHER_REGISTER',
    title: 'New Center Onboarded',
    description: 'Prof. Rajesh Sharma registered Sharma Mathematics & Physics Academy.',
    actor: 'Prof. Rajesh Sharma',
    timestamp: '2026-11-09 10:30'
  },
  {
    id: 'log_2',
    type: 'BATCH_CREATE',
    title: 'Batch Created',
    description: 'Class 10 - Batch A created with unique Join Code 849201.',
    actor: 'Sharma Academy',
    timestamp: '2026-11-09 11:15'
  },
  {
    id: 'log_3',
    type: 'STUDENT_ENROLL',
    title: 'Student Enrolled',
    description: 'Aarav Patel enrolled into Class 10 - Batch A (Roll #101).',
    actor: 'Aarav Patel',
    timestamp: '2026-11-09 14:20'
  },
  {
    id: 'log_4',
    type: 'FEE_PAYMENT',
    title: 'Tuition Fee Cleared',
    description: 'Payment of ₹2,500 verified for Aarav Patel (Class 10 - Batch A).',
    actor: 'Aarav Patel',
    timestamp: '2026-11-09 15:45'
  },
  {
    id: 'log_5',
    type: 'TEACHER_REGISTER',
    title: 'New Center Onboarded',
    description: 'Ms. Anita Verma registered Verma Science & Biology Hub.',
    actor: 'Ms. Anita Verma',
    timestamp: '2026-11-09 16:10'
  },
  {
    id: 'log_6',
    type: 'BATCH_CREATE',
    title: 'Batch Created',
    description: 'Class 11 - Bio created with unique Join Code 526318.',
    actor: 'Verma Science Hub',
    timestamp: '2026-11-09 16:40'
  },
  {
    id: 'log_7',
    type: 'STUDENT_ENROLL',
    title: 'Student Enrolled',
    description: 'Ananya Sharma enrolled into Class 11 - Bio (Roll #201).',
    actor: 'Ananya Sharma',
    timestamp: '2026-11-09 17:05'
  },
  {
    id: 'log_8',
    type: 'FEE_PAYMENT',
    title: 'Tuition Fee Cleared',
    description: 'Payment of ₹2,800 received for Ananya Sharma (NEET Biology).',
    actor: 'Ananya Sharma',
    timestamp: '2026-11-09 18:00'
  },
  {
    id: 'log_9',
    type: 'SECURITY',
    title: 'Multi-Tenant Security Sweep',
    description: 'Zero cross-tenant data leaks detected. RBAC tenant isolation verified.',
    actor: 'System Daemon',
    timestamp: '2026-11-09 23:59'
  }
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

interface SuperAdminWorkspaceProps {
  currentUser?: any;
  onLogout: () => void;
  onSwitchToPortal: (teacherId?: string) => void;
}

export default function SuperAdminWorkspace({
  currentUser,
  onLogout,
  onSwitchToPortal
}: SuperAdminWorkspaceProps) {
  // --- STATE PERSISTENCE ---
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('tm_teachers');
      return saved ? JSON.parse(saved) : [
        { 
          id: 't1', 
          name: 'Prof. Rajesh Sharma', 
          subject: 'Mathematics & Physics', 
          email: 'sharma.tuitions@gmail.com', 
          phone: '+91 98765 43210',
          upiId: 'sharmaclasses@upi',
          location: 'Sector 14, Near City Park, Gurugram',
          status: 'Active',
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
          status: 'Active',
          bio: 'Ex-Lecturer specializing in NEET and CBSE Board preparation.',
          resultsHeadline: 'Top Rankers in NEET 2025 & 2026.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem('tm_batches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('tm_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    try {
      const saved = localStorage.getItem('tm_system_logs');
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_LOGS;
    } catch {
      return DEFAULT_SYSTEM_LOGS;
    }
  });

  // Sync teachers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tm_teachers', JSON.stringify(teachers));
    } catch {}
  }, [teachers]);

  // Sync logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tm_system_logs', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  // Active Tab: 'OVERVIEW' | 'TEACHERS' | 'ACTIVITY' | 'BATCHES'
  const [activeAdminTab, setActiveAdminTab] = useState<'OVERVIEW' | 'TEACHERS' | 'ACTIVITY' | 'BATCHES'>('OVERVIEW');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Suspended'>('ALL');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add / Register New Teacher from Super Admin Modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    showToast(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // --- TOGGLE TEACHER ACTIVE / SUSPENDED STATUS ---
  const handleToggleTeacherStatus = (teacherId: string) => {
    const target = teachers.find(t => t.id === teacherId);
    if (!target) return;

    const currentStatus: 'Active' | 'Suspended' = target.status === 'Suspended' ? 'Suspended' : 'Active';
    const nextStatus: 'Active' | 'Suspended' = currentStatus === 'Active' ? 'Suspended' : 'Active';

    const updatedTeachers: Teacher[] = teachers.map(t => 
      t.id === teacherId ? { ...t, status: nextStatus } : t
    );
    setTeachers(updatedTeachers);

    // Record system log
    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: `Account ${nextStatus}`,
      description: `Instructor "${target.name}" account status was toggled to ${nextStatus.toUpperCase()} by Super-Admin.`,
      actor: 'Super-Admin',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLogs(prev => [newLog, ...prev]);

    showToast(`Status for "${target.name}" updated to ${nextStatus}!`);
  };

  // --- REGISTER NEW TEACHER BY ADMIN ---
  const handleAdminRegisterTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newId = `t_${Date.now()}`;
    const name = (formData.get('name') as string).trim();
    const subject = (formData.get('subject') as string).trim();
    const email = (formData.get('email') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const location = (formData.get('location') as string).trim() || name;
    const pin = (formData.get('pin') as string)?.trim() || '1234';
    const password = (formData.get('password') as string)?.trim() || 'Teacher@123';

    const newTeacher: Teacher = {
      id: newId,
      name,
      subject,
      email,
      phone,
      pin,
      location,
      status: 'Active',
      upiId: `${phone.replace(/\D/g, '') || 'teacher'}@upi`,
      bio: `Tuition center managed by ${name}.`,
      resultsHeadline: 'Enrolling new students!'
    };

    const initialBatch: Batch = {
      id: `b_${Date.now()}`,
      teacherId: newId,
      name: `${subject.split('&')[0].trim()} Foundation Batch`,
      subject,
      joinCode: String(Math.floor(100000 + Math.random() * 900000)),
      monthlyFee: 2500,
      schedule: 'Mon, Wed, Fri (5:00 PM)'
    };

    const updatedTeachers = [...teachers, newTeacher];
    const updatedBatches = [...batches, initialBatch];
    setTeachers(updatedTeachers);
    setBatches(updatedBatches);
    setShowAddTeacherModal(false);

    try {
      localStorage.setItem('tm_teachers', JSON.stringify(updatedTeachers));
      localStorage.setItem('tm_batches', JSON.stringify(updatedBatches));

      // Provision credentials so teacher can log in immediately from LoginPage
      const existingAccountsRaw = localStorage.getItem('tm_registered_accounts');
      const accounts = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];
      accounts.push({
        tuitionId: newId,
        tuitionName: name,
        teacherName: name,
        email,
        phone,
        password,
        pin
      });
      localStorage.setItem('tm_registered_accounts', JSON.stringify(accounts));
    } catch {}

    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      type: 'TEACHER_REGISTER',
      title: 'Teacher Provisioned',
      description: `Super-Admin registered new tuition center "${name}" with batch code ${initialBatch.joinCode}.`,
      actor: 'Super-Admin',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLogs(prev => [newLog, ...prev]);

    showToast(`Center "${name}" provisioned with Batch Code ${initialBatch.joinCode}!`);
  };

  // --- KPI CALCULATIONS ---
  const totalTeachers = teachers.length;
  const activeTeachersCount = teachers.filter(t => t.status !== 'Suspended').length;
  const suspendedTeachersCount = teachers.filter(t => t.status === 'Suspended').length;

  const totalStudents = students.length;
  const paidStudentsCount = students.filter(s => s.feeStatus === 'Paid').length;
  const pendingStudentsCount = students.filter(s => s.feeStatus === 'Pending').length;
  const overdueStudentsCount = students.filter(s => s.feeStatus === 'Overdue').length;

  const totalBatches = batches.length;

  const totalPlatformRevenue = useMemo(() => {
    return students
      .filter(s => s.feeStatus === 'Paid')
      .reduce((sum, s) => sum + (Number(s.feeAmount) || 0), 0);
  }, [students]);

  const totalPendingRevenue = useMemo(() => {
    return students
      .filter(s => s.feeStatus !== 'Paid')
      .reduce((sum, s) => sum + (Number(s.feeAmount) || 0), 0);
  }, [students]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        (t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const isSuspended = t.status === 'Suspended';
      const matchesStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'Active' ? !isSuspended :
        isSuspended;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchQuery, statusFilter]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return logs;
    return logs.filter(l => l.type === logFilter);
  }, [logs, logFilter]);

  // Center-by-Center Revenue Distribution Chart
  const revenueByTeacherData = useMemo(() => {
    return teachers.map(t => {
      const teacherStudents = students.filter(s => s.teacherId === t.id);
      const revenue = teacherStudents
        .filter(s => s.feeStatus === 'Paid')
        .reduce((sum, s) => sum + (Number(s.feeAmount) || 0), 0);
      return {
        name: t.name.split(' ').slice(0, 2).join(' '),
        revenue,
        studentsCount: teacherStudents.length
      };
    });
  }, [teachers, students]);

  // Fee Status Breakdown Pie Data
  const feeStatusPieData = useMemo(() => {
    return [
      { name: 'Paid Fees', value: paidStudentsCount },
      { name: 'Pending Dues', value: pendingStudentsCount },
      { name: 'Overdue Dues', value: overdueStudentsCount }
    ].filter(item => item.value > 0);
  }, [paidStudentsCount, pendingStudentsCount, overdueStudentsCount]);

  // Download logs as JSON
  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `edumaster_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit trail exported successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-indigo-500/50 animate-bounce">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <header className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-2.5 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  EduMaster <span className="text-indigo-400">Super-Admin</span>
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/40 uppercase tracking-wider hidden sm:inline-block">
                  App Owner Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Multi-Tenant Network Operational • All Tenancies Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Switcher into Teacher Portal */}
            <button
              onClick={() => onSwitchToPortal(teachers[0]?.id)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:border-indigo-500"
              title="Open Teacher Tuition Management Portal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Open Instructor Portal</span>
            </button>

            {/* Logout Admin Button */}
            <button
              onClick={onLogout}
              className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              title="Lock Admin Workspace and Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock / Logout</span>
            </button>
          </div>

        </div>

        {/* SUBNAV TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveAdminTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'OVERVIEW'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>KPI Overview</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('TEACHERS')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'TEACHERS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master Teacher Directory</span>
            <span className="bg-slate-800 text-indigo-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {teachers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('BATCHES')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'BATCHES'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Platform Batches & Codes</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('ACTIVITY')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'ACTIVITY'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>System Activity Feed</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              Live
            </span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI OVERVIEW TAB */}
        {activeAdminTab === 'OVERVIEW' && (
          <div className="space-y-8">
            
            {/* HERO BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10 max-w-xl">
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold border border-indigo-400/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Owner Command Center
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Platform Operations & Health
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Real-time aggregation across {totalTeachers} tuition center tenants, {totalBatches} active coaching batches, and {totalStudents} enrolled student accounts.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 relative z-10">
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Center</span>
                </button>
                <button
                  onClick={handleExportLogs}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Audit Logs</span>
                </button>
              </div>
            </div>

            {/* SYSTEM-WIDE KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. TOTAL REGISTERED TEACHERS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-indigo-500/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Centers</span>
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{totalTeachers}</p>
                  <div className="flex items-center space-x-2 mt-1.5 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {activeTeachersCount} Active
                    </span>
                    {suspendedTeachersCount > 0 && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {suspendedTeachersCount} Suspended
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Capacity: Unlimited</span>
                  <button 
                    onClick={() => setActiveAdminTab('TEACHERS')} 
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    View Directory →
                  </button>
                </div>
              </div>

              {/* 2. TOTAL ENROLLED STUDENTS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-emerald-500/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{totalStudents}</p>
                  <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold">{paidStudentsCount} Paid</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{pendingStudentsCount} Pending</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">{overdueStudentsCount} Overdue</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Across all tenancies</span>
                  <span className="text-emerald-400 font-semibold">100% RBAC Safe</span>
                </div>
              </div>

              {/* 3. ACTIVE BATCHES */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-purple-500/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Batches</span>
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{totalBatches}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {batches.length > 0 
                      ? `Avg. Monthly Fee: ₹${Math.round(batches.reduce((a, b) => a + (b.monthlyFee || 0), 0) / batches.length)}`
                      : 'No batches provisioned'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Unique 6-digit join codes</span>
                  <button 
                    onClick={() => setActiveAdminTab('BATCHES')} 
                    className="text-purple-400 hover:underline font-bold"
                  >
                    Manage Codes →
                  </button>
                </div>
              </div>

              {/* 4. TOTAL PLATFORM REVENUE */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processed Revenue</span>
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-emerald-400">
                    ₹{totalPlatformRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-amber-400 mt-1.5 font-semibold">
                    ₹{totalPendingRevenue.toLocaleString('en-IN')} in dues pipeline
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total Tuition Volume</span>
                  <span className="text-indigo-400 font-bold">UPI / Cash</span>
                </div>
              </div>

            </div>

            {/* PLATFORM CHARTS & VISUALIZATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* REVENUE BY TEACHER BAR CHART */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">Fee Collection Volume by Coaching Academy</h3>
                    <p className="text-xs text-slate-400">Aggregated revenue collected per tuition institute</p>
                  </div>
                  <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    Monthly INR
                  </span>
                </div>

                <div className="h-64 w-full">
                  {revenueByTeacherData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByTeacherData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                        />
                        <Bar dataKey="revenue" name="Cleared Revenue (₹)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      No tuition revenue data recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* FEE STATUS DISTRIBUTION PIE CHART */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-base">Fee Recovery Status</h3>
                    <span className="text-xs text-slate-400">{totalStudents} Accounts</span>
                  </div>
                  
                  <div className="h-52 w-full mt-2">
                    {feeStatusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={feeStatusPieData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={75} 
                            innerRadius={45} 
                            paddingAngle={4}
                          >
                            {feeStatusPieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        No student fee records found.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Paid Accounts:
                    </span>
                    <span className="font-bold">{paidStudentsCount} ({totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Pending Dues:
                    </span>
                    <span className="font-bold">{pendingStudentsCount} ({totalStudents > 0 ? Math.round((pendingStudentsCount / totalStudents) * 100) : 0}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Overdue Critical:
                    </span>
                    <span className="font-bold">{overdueStudentsCount} ({totalStudents > 0 ? Math.round((overdueStudentsCount / totalStudents) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* QUICK TEACHER DIRECTORY PREVIEW */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Master Registered Centers Quick Overview</h3>
                  <p className="text-xs text-slate-400">Manage tenant accounts, examine statuses, or impersonate instructor desks</p>
                </div>
                <button
                  onClick={() => setActiveAdminTab('TEACHERS')}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Open Full Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px]">
                      <th className="p-3">Tuition Center & Instructor</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Enrolled</th>
                      <th className="p-3">Batches</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teachers.slice(0, 4).map(t => {
                      const centerStudents = students.filter(s => s.teacherId === t.id);
                      const centerBatches = batches.filter(b => b.teacherId === t.id);
                      const isSuspended = t.status === 'Suspended';

                      return (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-white text-sm">{t.name}</p>
                            <p className="text-slate-400 text-xs">{t.location || 'Coaching Center'}</p>
                          </td>
                          <td className="p-3">
                            <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                              {t.subject}
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5 text-slate-300">
                            <p className="flex items-center gap-1 font-mono">{t.phone}</p>
                            <p className="text-slate-400 text-[11px]">{t.email}</p>
                          </td>
                          <td className="p-3 font-bold text-slate-200">
                            {centerStudents.length} Students
                          </td>
                          <td className="p-3 text-slate-300">
                            {centerBatches.length} Batches
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isSuspended 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {isSuspended ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleTeacherStatus(t.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSuspended 
                                  ? 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40' 
                                  : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40'
                              }`}
                              title={isSuspended ? 'Activate tuition center' : 'Suspend tuition center'}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => onSwitchToPortal(t.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-bold transition-all"
                              title="Impersonate & Inspect Instructor Desk"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* MASTER TEACHER DIRECTORY TAB */}
        {activeAdminTab === 'TEACHERS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* DIRECTORY HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Master Teacher Directory</h2>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/40">
                    {filteredTeachers.length} of {teachers.length} Centers
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Full multi-tenant registry with live account suspension toggles and direct dashboard access
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Center</span>
                </button>
              </div>
            </div>

            {/* SEARCH & STATUS FILTER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by instructor name, subject, phone, email, or city..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                <span className="text-xs text-slate-400 mr-2">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-indigo-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">All Accounts ({teachers.length})</option>
                  <option value="Active" className="bg-slate-900 text-white">Active Only ({activeTeachersCount})</option>
                  <option value="Suspended" className="bg-slate-900 text-white">Suspended Only ({suspendedTeachersCount})</option>
                </select>
              </div>
            </div>

            {/* TEACHER DIRECTORY CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeachers.map(teacher => {
                const centerStudents = students.filter(s => s.teacherId === teacher.id);
                const centerBatches = batches.filter(b => b.teacherId === teacher.id);
                const isSuspended = teacher.status === 'Suspended';
                const centerRevenue = centerStudents
                  .filter(s => s.feeStatus === 'Paid')
                  .reduce((a, b) => a + (Number(b.feeAmount) || 0), 0);

                return (
                  <div 
                    key={teacher.id} 
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isSuspended
                        ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-700/60'
                        : 'bg-slate-800/50 border-slate-700/70 hover:border-indigo-500/60 shadow-lg'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Card Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-base text-white">{teacher.name}</h3>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {teacher.id}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-indigo-300 mt-0.5">{teacher.subject}</p>
                          {teacher.location && (
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{teacher.location}</span>
                            </p>
                          )}
                        </div>

                        {/* STATUS TOGGLE BADGE */}
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => handleToggleTeacherStatus(teacher.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                              isSuspended
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                            }`}
                            title="Click to toggle Active / Suspended status"
                          >
                            {isSuspended ? (
                              <>
                                <ToggleLeft className="w-4 h-4 text-rose-400" />
                                <span>SUSPENDED</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-400" />
                                <span>ACTIVE</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-slate-500 font-medium">Click to toggle</span>
                        </div>
                      </div>

                      {/* Contact Info Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="font-mono truncate">{teacher.phone}</span>
                          </span>
                          <button 
                            onClick={() => handleCopy(teacher.phone)}
                            className="text-slate-400 hover:text-white ml-1"
                            title="Copy Phone"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </span>
                          <button 
                            onClick={() => handleCopy(teacher.email)}
                            className="text-slate-400 hover:text-white ml-1"
                            title="Copy Email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Batches & Stats Row */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Students</span>
                          <span className="text-base font-extrabold text-white mt-0.5 block">{centerStudents.length}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Batches</span>
                          <span className="text-base font-extrabold text-indigo-300 mt-0.5 block">{centerBatches.length}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Collected</span>
                          <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">₹{centerRevenue}</span>
                        </div>
                      </div>

                      {/* Batches Preview */}
                      {centerBatches.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Active Batches & Join Codes:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {centerBatches.map(b => (
                              <span 
                                key={b.id} 
                                className="bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5"
                              >
                                <span className="font-medium truncate max-w-[120px]">{b.name}</span>
                                <span className="font-mono font-bold text-indigo-400">#{b.joinCode}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="font-mono text-emerald-400">{teacher.upiId || 'upi-registered'}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleTeacherStatus(teacher.id)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend Account'}
                        </button>
                        <button
                          onClick={() => onSwitchToPortal(teacher.id)}
                          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                          title="Open this instructor's tuition dashboard"
                        >
                          <span>Inspect Center</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-300 text-base">No Tuition Centers Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No registered coaching academies matched your search query or status filter.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                  className="mt-3 text-xs text-indigo-400 hover:underline font-bold"
                >
                  Clear search filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* PLATFORM BATCHES & JOIN CODES TAB */}
        {activeAdminTab === 'BATCHES' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Platform Batches & 6-Digit Join Codes</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Master index of all active classroom batches and enrolment join codes across all instructors
                </p>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
                {batches.length} Active Batches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map(batch => {
                const teacher = teachers.find(t => t.id === batch.teacherId);
                const batchStudents = students.filter(s => s.batch === batch.name && s.teacherId === batch.teacherId);

                return (
                  <div key={batch.id} className="bg-slate-800/50 border border-slate-700/70 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {batch.subject}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400">₹{batch.monthlyFee}/mo</span>
                      </div>
                      
                      <h3 className="font-extrabold text-white text-base mt-1">{batch.name}</h3>
                      <p className="text-xs text-slate-400">
                        Instructor: <strong className="text-slate-200">{teacher?.name || batch.teacherId}</strong>
                      </p>
                      <p className="text-xs text-slate-500">
                        Schedule: {batch.schedule}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Join Code</span>
                        <span className="font-mono text-xl font-black text-indigo-400 tracking-wider">
                          {batch.joinCode}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleCopy(batch.joinCode)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                          title="Copy 6-digit Join Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <span className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1.5 rounded-xl border border-slate-800 font-bold">
                          {batchStudents.length} Enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SYSTEM ACTIVITY FEED TAB */}
        {activeAdminTab === 'ACTIVITY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">System Activity Audit Trail</h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Chronological event log capturing registrations, batch creations, student admissions, and security audits
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLogs}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>

            {/* EVENT CATEGORY FILTER PILLS */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'TEACHER_REGISTER', label: 'Teacher Sign-ups' },
                { id: 'BATCH_CREATE', label: 'Batch Creations' },
                { id: 'STUDENT_ENROLL', label: 'Student Enrollments' },
                { id: 'FEE_PAYMENT', label: 'Fee Payments' },
                { id: 'STATUS_CHANGE', label: 'Status Updates' },
                { id: 'SECURITY', label: 'Security' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLogFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    logFilter === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* LOG TIMELINE */}
            <div className="space-y-3">
              {filteredLogs.map(log => {
                const getLogIcon = () => {
                  switch (log.type) {
                    case 'TEACHER_REGISTER': return <Building2 className="w-4 h-4 text-indigo-400" />;
                    case 'BATCH_CREATE': return <Key className="w-4 h-4 text-purple-400" />;
                    case 'STUDENT_ENROLL': return <GraduationCap className="w-4 h-4 text-blue-400" />;
                    case 'FEE_PAYMENT': return <DollarSign className="w-4 h-4 text-emerald-400" />;
                    case 'STATUS_CHANGE': return <Sliders className="w-4 h-4 text-amber-400" />;
                    case 'SECURITY': return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
                    default: return <Activity className="w-4 h-4 text-slate-400" />;
                  }
                };

                const getBadgeClass = () => {
                  switch (log.type) {
                    case 'TEACHER_REGISTER': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
                    case 'BATCH_CREATE': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
                    case 'STUDENT_ENROLL': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
                    case 'FEE_PAYMENT': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                    case 'STATUS_CHANGE': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                    case 'SECURITY': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
                    default: return 'bg-slate-800 text-slate-400 border-slate-700';
                  }
                };

                return (
                  <div key={log.id} className="p-4 bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl border border-slate-800 transition-all flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shrink-0 mt-0.5">
                        {getLogIcon()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeClass()}`}>
                            {log.type.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-white text-sm">{log.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {log.description}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Initiated by: <span className="font-semibold text-slate-400">{log.actor}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs text-slate-400 block">{log.timestamp}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Logged</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        EduMaster Multi-Tenant Hub • Super-Admin Security Suite • Passkey Protected Console
      </footer>

      {/* PROVISION NEW TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Provision New Tuition Center</h3>
                  <p className="text-xs text-slate-400">Admin direct tenant onboarding</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminRegisterTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Instructor / Tuition Name</label>
                <input 
                  required 
                  name="name" 
                  type="text" 
                  placeholder="e.g. Dr. H. C. Verma Institute" 
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject Specialization</label>
                <input 
                  required 
                  name="subject" 
                  type="text" 
                  placeholder="e.g. Physics & Mechanics" 
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email</label>
                  <input 
                    required 
                    name="email" 
                    type="email" 
                    placeholder="verma.classes@gmail.com" 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone</label>
                  <input 
                    required 
                    name="phone" 
                    type="tel" 
                    placeholder="+91 98888 12345" 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Login Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    defaultValue="Teacher@123" 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">4-Digit Security PIN</label>
                  <input 
                    name="pin" 
                    type="password" 
                    maxLength={4}
                    defaultValue="" 
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Location / Center Address</label>
                <input 
                  name="location" 
                  type="text" 
                  placeholder="e.g. Hauz Khas, New Delhi" 
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <span>An initial batch and a unique 6-digit Join Code will automatically be generated for this new center.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  Provision Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
