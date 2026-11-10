import React, { useState, useEffect, useMemo, useRef } from 'react';
import StudyMaterialsManager, { FileAttachment } from './src/components/StudyMaterialsManager';
import MentorShowcase from './src/components/MentorShowcase';
import DemoTuitionCenters from './src/components/DemoTuitionCenters';
import ExportModal from './src/components/ExportModal';
import { ExportDataset } from './src/utils/exportManager';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Award, 
  BarChart3, 
  Plus, 
  Search, 
  UserCheck, 
  User, 
  ShieldCheck, 
  Bell, 
  Calendar, 
  Edit, 
  Trash2, 
  Play, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  GraduationCap, 
  Sparkles, 
  Download, 
  AlertCircle, 
  Eye, 
  Filter, 
  RefreshCw, 
  X, 
  FileCheck, 
  Key, 
  Copy, 
  UserPlus,
  MessageCircle,
  QrCode,
  Globe,
  Share2,
  Printer,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Lock,
  Upload,
  CreditCard,
  Edit3,
  Save
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

// --- STRICT ROLE-BASED ACCESS CONTROL (RBAC) DEFINITIONS ---

type RoleType = 'teacher' | 'student';

type TabType = 
  | 'dashboard'
  // Teacher-Only Tabs
  | 'students'
  | 'attendance'
  | 'fees'
  | 'analytics'
  // Shared Content Tabs
  | 'notes'
  | 'tests'
  | 'mentors'
  // Student-Only Tabs
  | 'my-attendance'
  | 'my-fees'
  | 'my-progress';

const TEACHER_ALLOWED_TABS: TabType[] = [
  'dashboard', 
  'students', 
  'attendance', 
  'fees', 
  'notes', 
  'tests', 
  'analytics',
  'mentors'
];

const STUDENT_ALLOWED_TABS: TabType[] = [
  'dashboard', 
  'my-attendance', 
  'my-fees', 
  'notes', 
  'tests', 
  'my-progress',
  'mentors'
];

const isTabAuthorized = (role: RoleType, tab: TabType): boolean => {
  if (role === 'teacher') return TEACHER_ALLOWED_TABS.includes(tab);
  if (role === 'student') return STUDENT_ALLOWED_TABS.includes(tab);
  return false;
};

// --- DATA TYPES ---

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  upiId?: string;
  registrationJoinCode?: string;
  pin?: string;
  location?: string;
  bio?: string;
  resultsHeadline?: string;
  status?: 'Active' | 'Suspended';
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
  joinCode: string; // Unique 6-digit join code
  monthlyFee: number;
  schedule: string;
}

export interface BatchJoinRequest {
  id: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  teacherName: string;
  studentName: string;
  studentPhone: string;
  parentPhone?: string;
  rollNo: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface Note {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  batch: string;
  date: string;
  link?: string;
  content: string;
  attachment?: FileAttachment;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  batch: string;
  duration: number; // in minutes
  totalMarks: number;
  passingScore: number;
  questions: Question[];
}

export interface ScoreRecord {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  subject: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'Passed' | 'Failed';
  date: string;
}

// --- INITIAL MOCK DATA ---

// Strictly restricted demo accounts visible in the public top header selector
const DEMO_PUBLIC_TEACHERS: { id: string; name: string; subject: string }[] = [
  { id: 't1', name: 'Prof. Rajesh Sharma', subject: 'Mathematics & Physics' },
  { id: 't2', name: 'Ms. Anita Verma', subject: 'Chemistry & Biology' }
];

const DEFAULT_TEACHERS: Teacher[] = [
  { 
    id: 't1', 
    name: 'Prof. Rajesh Sharma', 
    subject: 'Mathematics & Physics', 
    email: 'sharma.tuitions@gmail.com', 
    phone: '+91 98765 43210',
    registrationJoinCode: 'SHARMA-101',
    pin: '1234',
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
    registrationJoinCode: 'VERMA-202',
    pin: '5678',
    upiId: 'anita.verma@okaxis',
    location: 'Model Town, Delhi',
    status: 'Active',
    bio: 'Ex-Lecturer specializing in NEET and CBSE Board preparation.',
    resultsHeadline: 'Top Rankers in NEET 2025 & 2026.'
  },
];

const DEFAULT_BATCHES: Batch[] = [
  { id: 'b1', teacherId: 't1', name: 'Class 10 - Batch A', subject: 'Mathematics & Physics', joinCode: '849201', monthlyFee: 2500, schedule: 'Mon, Wed, Fri (5:00 PM - 6:30 PM)' },
  { id: 'b2', teacherId: 't1', name: 'Class 12 - Math', subject: 'Advanced Mathematics', joinCode: '713904', monthlyFee: 3000, schedule: 'Tue, Thu, Sat (6:00 PM - 7:30 PM)' },
  { id: 'b3', teacherId: 't2', name: 'Class 11 - Bio', subject: 'Cell Biology & Genetics', joinCode: '526318', monthlyFee: 2800, schedule: 'Mon, Thu, Sat (4:00 PM - 5:30 PM)' },
];

const DEFAULT_JOIN_REQUESTS: BatchJoinRequest[] = [
  {
    id: 'req_1',
    batchId: 'b1',
    batchName: 'Class 10 - Batch A',
    teacherId: 't1',
    teacherName: 'Prof. Rajesh Sharma',
    studentName: 'Devansh Joshi',
    studentPhone: '+91 98888 77777',
    parentPhone: '+91 98888 77770',
    rollNo: '105',
    status: 'Pending',
    requestedAt: '2026-11-09 18:30'
  },
  {
    id: 'req_2',
    batchId: 'b2',
    batchName: 'Class 12 - Math',
    teacherId: 't1',
    teacherName: 'Prof. Rajesh Sharma',
    studentName: 'Meera Nair',
    studentPhone: '+91 97777 66666',
    parentPhone: '+91 97777 66600',
    rollNo: '106',
    status: 'Pending',
    requestedAt: '2026-11-09 20:15'
  }
];

const DEFAULT_STUDENTS: Student[] = [
  { id: 's1', teacherId: 't1', name: 'Aarav Patel', rollNo: '101', batch: 'Class 10 - Batch A', phone: '+91 91111 22222', parentPhone: '+91 91111 22200', feeStatus: 'Paid', feeAmount: 2500, attendanceRate: 92 },
  { id: 's2', teacherId: 't1', name: 'Priya Singh', rollNo: '102', batch: 'Class 10 - Batch A', phone: '+91 93333 44444', parentPhone: '+91 93333 44400', feeStatus: 'Pending', feeAmount: 2500, attendanceRate: 85 },
  { id: 's3', teacherId: 't1', name: 'Rohan Gupta', rollNo: '103', batch: 'Class 12 - Math', phone: '+91 95555 66666', parentPhone: '+91 95555 66600', feeStatus: 'Paid', feeAmount: 3000, attendanceRate: 96 },
  { id: 's4', teacherId: 't1', name: 'Sneha Reddy', rollNo: '104', batch: 'Class 12 - Math', phone: '+91 97777 88888', parentPhone: '+91 97777 88800', feeStatus: 'Overdue', feeAmount: 3000, attendanceRate: 74 },
  { id: 's5', teacherId: 't2', name: 'Ananya Sharma', rollNo: '201', batch: 'Class 11 - Bio', phone: '+91 92222 33333', parentPhone: '+91 92222 33300', feeStatus: 'Paid', feeAmount: 2800, attendanceRate: 95 },
  { id: 's6', teacherId: 't2', name: 'Kabir Mehta', rollNo: '202', batch: 'Class 11 - Bio', phone: '+91 94444 55555', parentPhone: '+91 94444 55500', feeStatus: 'Pending', feeAmount: 2800, attendanceRate: 88 },
];

const DEFAULT_NOTES: Note[] = [
  { 
    id: 'n1', 
    teacherId: 't1', 
    title: 'Quadratic Equations Formula Sheet', 
    subject: 'Mathematics', 
    batch: 'Class 10 - Batch A', 
    date: '2026-11-01', 
    link: '#', 
    content: 'Comprehensive formula guide for quadratic equations: ax² + bx + c = 0. Discriminant D = b² - 4ac. Roots: x = (-b ± √D) / 2a. Real & unequal roots if D > 0; real & equal roots if D = 0; complex roots if D < 0. Sum of roots = -b/a, Product of roots = c/a.',
    attachment: {
      name: 'Class10_Math_Quadratic_Formulas.pdf',
      size: 1420000,
      sizeFormatted: '1.4 MB',
      type: 'application/pdf',
      extension: 'pdf',
      uploadedAt: '2026-11-01T10:00:00.000Z'
    }
  },
  { 
    id: 'n2', 
    teacherId: 't1', 
    title: 'Laws of Motion & Numericals', 
    subject: 'Physics', 
    batch: 'Class 12 - Math', 
    date: '2026-11-05', 
    link: '#', 
    content: "Newton's First Law (Inertia), Second Law (F = dp/dt = ma), Third Law (Action-Reaction). Friction f_s ≤ μ_s * N. Momentum conservation principle and 10 step-by-step solved pulley & inclined plane numerical problems.",
    attachment: {
      name: 'Physics_Laws_Of_Motion_Problems.docx',
      size: 2850000,
      sizeFormatted: '2.8 MB',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      uploadedAt: '2026-11-05T14:30:00.000Z'
    }
  },
  { 
    id: 'n3', 
    teacherId: 't2', 
    title: 'Organic Chemistry Reactions Mindmap', 
    subject: 'Chemistry', 
    batch: 'Class 11 - Bio', 
    date: '2026-11-03', 
    link: '#', 
    content: 'Quick reaction mechanism flowchart for Hydrocarbons: Electrophilic addition in alkenes (Markovnikov rule), Free radical halogenation of alkanes, Ozonolysis of alkynes, and acidic nature of terminal alkynes.',
    attachment: {
      name: 'Organic_Reactions_Mindmap.png',
      size: 890000,
      sizeFormatted: '890 KB',
      type: 'image/png',
      extension: 'png',
      uploadedAt: '2026-11-03T16:00:00.000Z'
    }
  },
];

const DEFAULT_TESTS: Test[] = [
  {
    id: 'test1',
    teacherId: 't1',
    title: 'Algebra & Geometry Quiz',
    subject: 'Mathematics',
    batch: 'Class 10 - Batch A',
    duration: 15,
    totalMarks: 20,
    passingScore: 12,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the discriminant of quadratic equation ax² + bx + c = 0?',
        options: ['b² - 4ac', 'b² + 4ac', '2b - 4ac', '4ac - b²'],
        correctAnswer: 0
      },
      {
        id: 'q2',
        questionText: 'Sum of roots for equation x² - 5x + 6 = 0 is:',
        options: ['6', '-5', '5', '-6'],
        correctAnswer: 2
      },
      {
        id: 'q3',
        questionText: 'The line segment joining two points on a circle is called a:',
        options: ['Radius', 'Chord', 'Tangent', 'Secant'],
        correctAnswer: 1
      },
      {
        id: 'q4',
        questionText: 'If sin θ = 1/2, what is the value of θ (in degrees for acute angle)?',
        options: ['45°', '60°', '30°', '90°'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'test2',
    teacherId: 't1',
    title: 'Electrostatics Chapter Test',
    subject: 'Physics',
    batch: 'Class 12 - Math',
    duration: 20,
    totalMarks: 20,
    passingScore: 10,
    questions: [
      {
        id: 'q101',
        questionText: 'The SI unit of electric charge is:',
        options: ['Ampere', 'Coulomb', 'Volt', 'Ohm'],
        correctAnswer: 1
      },
      {
        id: 'q102',
        questionText: 'Electric field inside a hollow spherical conductor is:',
        options: ['Maximum', 'Zero', 'Infinite', 'Constant non-zero'],
        correctAnswer: 1
      },
      {
        id: 'q103',
        questionText: 'Capacitance of a parallel plate capacitor is inversely proportional to:',
        options: ['Area of plates', 'Distance between plates', 'Dielectric constant', 'Charge on plates'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'test3',
    teacherId: 't2',
    title: 'Cell Biology & Genetics Basic Quiz',
    subject: 'Biology',
    batch: 'Class 11 - Bio',
    duration: 15,
    totalMarks: 20,
    passingScore: 12,
    questions: [
      {
        id: 'q201',
        questionText: 'Which organelle is famously known as the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
        correctAnswer: 1
      },
      {
        id: 'q202',
        questionText: 'DNA replication occurs during which phase of the cell cycle?',
        options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'],
        correctAnswer: 1
      }
    ]
  }
];

const DEFAULT_SCORES: ScoreRecord[] = [
  { id: 'sc1', testId: 'test1', studentId: 's1', studentName: 'Aarav Patel', subject: 'Mathematics', testTitle: 'Algebra & Geometry Quiz', score: 20, totalMarks: 20, percentage: 100, status: 'Passed', date: '2026-11-04' },
  { id: 'sc2', testId: 'test1', studentId: 's2', studentName: 'Priya Singh', subject: 'Mathematics', testTitle: 'Algebra & Geometry Quiz', score: 15, totalMarks: 20, percentage: 75, status: 'Passed', date: '2026-11-04' },
  { id: 'sc3', testId: 'test2', studentId: 's3', studentName: 'Rohan Gupta', subject: 'Physics', testTitle: 'Electrostatics Chapter Test', score: 20, totalMarks: 20, percentage: 100, status: 'Passed', date: '2026-11-07' },
  { id: 'sc4', testId: 'test3', studentId: 's5', studentName: 'Ananya Sharma', subject: 'Biology', testTitle: 'Cell Biology & Genetics Basic Quiz', score: 20, totalMarks: 20, percentage: 100, status: 'Passed', date: '2026-11-08' },
];

const DEFAULT_ATTENDANCE: Record<string, Record<string, 'Present' | 'Absent'>> = {
  '2026-11-09': {
    's1': 'Present',
    's2': 'Absent',
    's3': 'Present',
    's4': 'Present',
    's5': 'Present',
    's6': 'Present'
  },
  '2026-11-08': {
    's1': 'Present',
    's2': 'Present',
    's3': 'Present',
    's4': 'Absent',
    's5': 'Present',
    's6': 'Absent'
  }
};

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App({ 
  currentUser, 
  onLogout,
  onUserUpdate
}: { 
  currentUser?: any; 
  onLogout?: () => void;
  onUserUpdate?: (user: any) => void;
} = {}) {
  // --- PERSISTED STATE ---
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    let list: Teacher[] = DEFAULT_TEACHERS;
    try {
      const saved = localStorage.getItem('tm_teachers');
      if (saved) list = JSON.parse(saved);
    } catch {}
    // If currentUser is a TEACHER not yet in list, ensure they are registered in state
    if (currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'teacher')) {
      const tid = currentUser.tuitionId || currentUser.id;
      if (tid && !list.some(t => t.id === tid)) {
        list = [...list, {
          id: tid,
          name: currentUser.name || 'Instructor',
          subject: currentUser.tuitionName || 'Tuition Center',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          upiId: currentUser.upiId || '',
          location: currentUser.tuitionName || '',
          bio: `Dedicated tuition center led by ${currentUser.name || 'Instructor'}.`,
          resultsHeadline: 'New Academic Batches Now Open for Enrollment!'
        }];
      }
    }
    return list;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem('tm_batches');
      return saved ? JSON.parse(saved) : DEFAULT_BATCHES;
    } catch {
      return DEFAULT_BATCHES;
    }
  });

  const [joinRequests, setJoinRequests] = useState<BatchJoinRequest[]>(() => {
    try {
      const saved = localStorage.getItem('tm_join_requests');
      return saved ? JSON.parse(saved) : DEFAULT_JOIN_REQUESTS;
    } catch {
      return DEFAULT_JOIN_REQUESTS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('tm_students');
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('tm_notes');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  const [tests, setTests] = useState<Test[]>(() => {
    try {
      const saved = localStorage.getItem('tm_tests');
      return saved ? JSON.parse(saved) : DEFAULT_TESTS;
    } catch {
      return DEFAULT_TESTS;
    }
  });

  const [scores, setScores] = useState<ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tm_scores');
      return saved ? JSON.parse(saved) : DEFAULT_SCORES;
    } catch {
      return DEFAULT_SCORES;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<string, 'Present' | 'Absent'>>>(() => {
    try {
      const saved = localStorage.getItem('tm_attendance');
      return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE;
    } catch {
      return DEFAULT_ATTENDANCE;
    }
  });

  // Local storage synchronization
  useEffect(() => {
    try {
      localStorage.setItem('tm_teachers', JSON.stringify(teachers));
    } catch {}
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_batches', JSON.stringify(batches));
    } catch {}
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_join_requests', JSON.stringify(joinRequests));
    } catch {}
  }, [joinRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_students', JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_tests', JSON.stringify(tests));
    } catch {}
  }, [tests]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_scores', JSON.stringify(scores));
    } catch {}
  }, [scores]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_attendance', JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  // --- USER SESSION & ROLE STATE (ISOLATED RBAC SESSION) ---
  const [currentRole, setCurrentRole] = useState<'teacher' | 'student'>(() => {
    if (currentUser?.role) {
      return (currentUser.role === 'STUDENT' || currentUser.role === 'student') ? 'student' : 'teacher';
    }
    try {
      const savedAuth = localStorage.getItem('tm_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u.role === 'STUDENT' || u.role === 'student') return 'student';
      }
    } catch {}
    return 'teacher';
  });

  const [currentTeacherId, setCurrentTeacherId] = useState<string>(() => {
    if (currentUser) {
      if (currentUser.tuitionId) return currentUser.tuitionId;
      if (currentUser.role === 'TEACHER' || currentUser.role === 'teacher') return currentUser.id;
    }
    try {
      const savedAuth = localStorage.getItem('tm_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u.tuitionId) return u.tuitionId;
        if (u.role === 'TEACHER' || u.role === 'teacher') return u.id;
      }
      const savedTeacherId = localStorage.getItem('tm_current_teacher_id');
      if (savedTeacherId) return savedTeacherId;
    } catch {}
    return '';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    if (currentUser && (currentUser.role === 'STUDENT' || currentUser.role === 'student')) {
      return currentUser.id || '';
    }
    try {
      const savedAuth = localStorage.getItem('tm_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u.role === 'STUDENT' || u.role === 'student') return u.id || '';
      }
    } catch {}
    return '';
  });

  // Keep localStorage session aligned with currentTeacherId
  useEffect(() => {
    if (currentTeacherId) {
      try {
        localStorage.setItem('tm_current_teacher_id', currentTeacherId);
      } catch {}
    }
  }, [currentTeacherId]);

  // --- TEACHER PROFILE PIN AUTHENTICATION STATE ---
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('tm_auth_user');
      if (savedAuth) {
        const u = JSON.parse(savedAuth);
        if (u.role === 'TEACHER' || u.role === 'teacher') {
          const tid = u.tuitionId || u.id;
          return sessionStorage.getItem(`tm_unlocked_${tid}`) === 'true';
        }
      }
    } catch {}
    return false;
  });
  const [teacherPinInput, setTeacherPinInput] = useState<string>('');
  const [teacherPinError, setTeacherPinError] = useState<string>('');
  const [showPinUnlockModal, setShowPinUnlockModal] = useState<boolean>(false);
  const [pinAttempts, setPinAttempts] = useState<number>(0);
  const [pinLockoutUntil, setPinLockoutUntil] = useState<number>(0);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [changePinCurrent, setChangePinCurrent] = useState<string>('');
  const [changePinNew, setChangePinNew] = useState<string>('');
  const [changePinConfirm, setChangePinConfirm] = useState<string>('');
  const [changePinError, setChangePinError] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Synchronize with currentUser prop from auth session
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'TEACHER' || currentUser.role === 'teacher') {
        setCurrentRole('teacher');
        const targetId = currentUser.tuitionId || currentUser.id;
        if (targetId) {
          setCurrentTeacherId(targetId);
          setIsTeacherUnlocked(true);
          try {
            sessionStorage.setItem(`tm_unlocked_${targetId}`, 'true');
            localStorage.setItem('tm_current_teacher_id', targetId);
          } catch {}
          setTeachers(prev => {
            if (prev.some(t => t.id === targetId)) return prev;
            return [...prev, {
              id: targetId,
              name: currentUser.name || 'Instructor',
              subject: currentUser.tuitionName || 'Tuition Center',
              email: currentUser.email || '',
              phone: currentUser.phone || '',
              pin: currentUser.pin || '1234',
              upiId: currentUser.upiId || '',
              location: currentUser.tuitionName || '',
              bio: `Dedicated tuition center led by ${currentUser.name || 'Instructor'}.`,
              resultsHeadline: 'New Academic Batches Now Open for Enrollment!'
            }];
          });
        }
      } else if (currentUser.role === 'STUDENT' || currentUser.role === 'student') {
        setCurrentRole('student');
        if (currentUser.id) {
          setCurrentStudentId(currentUser.id);
        }
        if (currentUser.tuitionId) {
          setCurrentTeacherId(currentUser.tuitionId);
        } else if (currentUser.id) {
          const matchStudent = students.find(s => s.id === currentUser.id);
          if (matchStudent && matchStudent.teacherId) {
            setCurrentTeacherId(matchStudent.teacherId);
          }
        }
      }
    }
  }, [currentUser]);

  // Verify secret 4-digit PIN for teacher profile access (with rate limiting)
  const handleVerifyTeacherPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Rate-limiting check: 3 failed attempts => 30s lockout
    if (pinLockoutUntil > Date.now()) {
      const secsLeft = Math.ceil((pinLockoutUntil - Date.now()) / 1000);
      setTeacherPinError(`Too many failed attempts. Try again in ${secsLeft}s.`);
      return;
    }
    const targetTeacher = teachers.find(t => t.id === currentTeacherId);
    const expectedPin = targetTeacher?.pin || '1234';
    if (teacherPinInput.trim() === expectedPin) {
      setIsTeacherUnlocked(true);
      setTeacherPinError('');
      setTeacherPinInput('');
      setShowPinUnlockModal(false);
      setPinAttempts(0);
      setPinLockoutUntil(0);
      try {
        sessionStorage.setItem(`tm_unlocked_${currentTeacherId}`, 'true');
      } catch {}
      showToast(`Welcome ${targetTeacher?.name || 'Instructor'}! Workspace unlocked.`);
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      if (newAttempts >= 3) {
        setPinLockoutUntil(Date.now() + 30000);
        setTeacherPinError('3 incorrect attempts! Locked for 30 seconds.');
        setPinAttempts(0);
      } else {
        setTeacherPinError(`Incorrect PIN. ${3 - newAttempts} attempt(s) remaining.`);
      }
    }
  };

  const handleLockTeacherProfile = () => {
    setIsTeacherUnlocked(false);
    setTeacherPinInput('');
    setTeacherPinError('');
    try {
      sessionStorage.removeItem(`tm_unlocked_${currentTeacherId}`);
    } catch {}
    showToast('Teacher profile locked.');
  };

  const handleSwitchTeacher = (targetId: string) => {
    setCurrentTeacherId(targetId);
    let unlocked = false;
    try {
      unlocked = sessionStorage.getItem(`tm_unlocked_${targetId}`) === 'true';
    } catch {}
    setIsTeacherUnlocked(unlocked);
    setTeacherPinInput('');
    setTeacherPinError('');
  };

  // Change Security PIN handler
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPinStored = activeTeacher.pin || '1234';
    if (changePinCurrent.trim() !== currentPinStored) {
      setChangePinError('Current PIN does not match.');
      return;
    }
    if (!/^\d{4}$/.test(changePinNew.trim())) {
      setChangePinError('New PIN must be exactly 4 digits.');
      return;
    }
    if (changePinNew.trim() !== changePinConfirm.trim()) {
      setChangePinError('New PIN and confirmation do not match.');
      return;
    }

    const newPin = changePinNew.trim();
    setTeachers(prev => {
      const updated = prev.map(t => t.id === currentTeacherId ? { ...t, pin: newPin } : t);
      try {
        localStorage.setItem('tm_teachers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser && (currentUser.tuitionId === currentTeacherId || currentUser.id === currentTeacherId)) {
      if (onUserUpdate) {
        onUserUpdate({ ...currentUser, pin: newPin });
      }
    }

    setShowChangePinModal(false);
    setChangePinCurrent('');
    setChangePinNew('');
    setChangePinConfirm('');
    setChangePinError('');
    showToast('Security PIN updated successfully!');
  };

  // Export workspace data as JSON backup
  const handleExportWorkspaceData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: 'EduMaster Tuition Platform',
      teacher: activeTeacher,
      batches: teacherBatchesList,
      students: teacherStudents,
      notes: visibleNotes,
      tests: visibleTests,
      pendingRequests: teacherPendingRequests
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tuition_backup_${(activeTeacher.name || 'instructor').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Tuition workspace backup (JSON) exported successfully!');
  };

  const fileImportInputRef = useRef<HTMLInputElement>(null);

  // Import & Restore workspace data from computer JSON file (e.g. tuition_backup_*.json)
  const handleImportWorkspaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backupData = JSON.parse(content);

        // Validation
        if (!backupData.teacher || !backupData.teacher.id) {
          showToast('Invalid backup file format: missing teacher profile data.');
          return;
        }

        const importedTeacher: Teacher = backupData.teacher;
        const importedBatches: Batch[] = backupData.batches || [];
        const importedStudents: Student[] = backupData.students || [];
        const importedNotes: Note[] = backupData.notes || [];
        const importedTests: Test[] = backupData.tests || [];
        const importedRequests: BatchJoinRequest[] = backupData.pendingRequests || [];

        // 1. Update Teachers list
        setTeachers(prev => {
          const filtered = prev.filter(t => t.id !== importedTeacher.id);
          const updated = [...filtered, importedTeacher];
          try { localStorage.setItem('tm_teachers', JSON.stringify(updated)); } catch {}
          return updated;
        });

        // 2. Set current teacher to imported teacher and unlock profile
        setCurrentTeacherId(importedTeacher.id);
        setIsTeacherUnlocked(true);
        setCurrentRole('teacher');

        try {
          sessionStorage.setItem(`tm_unlocked_${importedTeacher.id}`, 'true');
          localStorage.setItem('tm_current_teacher_id', importedTeacher.id);
        } catch {}

        // 3. Update Batches
        if (importedBatches.length > 0) {
          setBatches(prev => {
            const existingOther = prev.filter(b => b.teacherId !== importedTeacher.id);
            const updated = [...existingOther, ...importedBatches];
            try { localStorage.setItem('tm_batches', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }

        // 4. Update Students
        if (importedStudents.length > 0) {
          setStudents(prev => {
            const existingOther = prev.filter(s => s.teacherId !== importedTeacher.id);
            const updated = [...existingOther, ...importedStudents];
            try { localStorage.setItem('tm_students', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }

        // 5. Update Notes
        if (importedNotes.length > 0) {
          setNotes(prev => {
            const existingOther = prev.filter(n => n.teacherId !== importedTeacher.id);
            const updated = [...existingOther, ...importedNotes];
            try { localStorage.setItem('tm_notes', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }

        // 6. Update Tests
        if (importedTests.length > 0) {
          setTests(prev => {
            const existingOther = prev.filter(t => t.teacherId !== importedTeacher.id);
            const updated = [...existingOther, ...importedTests];
            try { localStorage.setItem('tm_tests', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }

        // 7. Update Join Requests
        if (importedRequests.length > 0) {
          setJoinRequests(prev => {
            const existingOther = prev.filter(r => r.teacherId !== importedTeacher.id);
            const updated = [...existingOther, ...importedRequests];
            try { localStorage.setItem('tm_join_requests', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }

        // Update auth user if currentUser exists
        if (onUserUpdate) {
          onUserUpdate({
            id: importedTeacher.id,
            name: importedTeacher.name,
            role: 'TEACHER',
            tuitionId: importedTeacher.id,
            tuitionName: importedTeacher.subject,
            pin: importedTeacher.pin || '1234'
          });
        }

        showToast(`🎉 Restored "${importedTeacher.name}" (${importedTeacher.subject}) from computer backup!`);
      } catch (err) {
        showToast('Error parsing backup file. Please select a valid .json file.');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper: XSS sanitizer for print templates
  const escapeHtml = (unsafe: string = ''): string => {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Active Tab with Strict RBAC typing
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Strict RBAC Tab Sanitizer: Prevent role tab cross-contamination
  useEffect(() => {
    if (currentRole === 'student') {
      if (!STUDENT_ALLOWED_TABS.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (currentRole === 'teacher') {
      if (!TEACHER_ALLOWED_TABS.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, activeTab]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState('ALL');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modals & Active State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showRegisterTeacherModal, setShowRegisterTeacherModal] = useState(false);
  
  // BATCH CODE JOIN & APPROVAL STATE
  const [showJoinBatchModal, setShowJoinBatchModal] = useState(false);
  const [showBatchRequestsModal, setShowBatchRequestsModal] = useState(false);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);

  // BUSINESS GROWTH & INTERACTIVE MODALS
  const [showQRModal, setShowQRModal] = useState<Student | null>(null);
  const [showLandingPageModal, setShowLandingPageModal] = useState(false);
  const [landingPageTab, setLandingPageTab] = useState<'MICROSITE' | 'DEMO_CENTERS'>('MICROSITE');

  // TEACHER UPI PAYMENT SETTINGS STATE
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [teacherUpiInput, setTeacherUpiInput] = useState('');
  const [upiSaveError, setUpiSaveError] = useState('');
  const [upiSaveSuccess, setUpiSaveSuccess] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [showTeacherQrPreview, setShowTeacherQrPreview] = useState(false);

  // Student join code input state
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joinStudentName, setJoinStudentName] = useState('');
  const [joinStudentPhone, setJoinStudentPhone] = useState('');
  const [joinParentPhone, setJoinParentPhone] = useState('');
  const [joinStudentRoll, setJoinStudentRoll] = useState('');

  // Test Taking & Results State
  const [activeTakingTest, setActiveTakingTest] = useState<Test | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(0);
  const [testCompletedResult, setTestCompletedResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    status: 'Passed' | 'Failed';
    test: Test;
    answers: Record<number, number>;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Copied Batch Code "${code}" to clipboard!`);
  };

  // Teacher Payment Settings Handler
  const handleSaveTeacherUpi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = teacherUpiInput.trim().toLowerCase();

    // Strict UPI ID format validation (username@bankhandle)
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(trimmed)) {
      setUpiSaveError('Invalid UPI ID format. Please enter a valid Virtual Payment Address (e.g. sharma@oksbi or 9876543210@paytm).');
      setUpiSaveSuccess('');
      return;
    }

    setIsSavingUpi(true);
    setUpiSaveError('');

    // Persist to teachers state
    const targetTeacherId = activeTeacher.id;
    const updatedTeachers = teachers.map(t => {
      if (t.id === targetTeacherId) {
        return { ...t, upiId: trimmed };
      }
      return t;
    });

    setTeachers(updatedTeachers);

    try {
      localStorage.setItem('tm_teachers', JSON.stringify(updatedTeachers));

      // If current user is logged-in teacher, update session data
      if (currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'teacher')) {
        const updatedUser = { ...currentUser, upiId: trimmed };
        localStorage.setItem('tm_auth_user', JSON.stringify(updatedUser));
        if (onUserUpdate) onUserUpdate(updatedUser);
      }
    } catch (err) {
      console.error('Failed to save UPI ID to localStorage:', err);
    }

    setIsSavingUpi(false);
    setIsEditingUpi(false);
    setUpiSaveSuccess(`UPI ID saved successfully as "${trimmed}". Students will now pay directly to this UPI address.`);
    showToast(`Payment settings saved: ${trimmed}`);
  };

  // --- ENTITY RESOLUTION & STRICT RBAC DATA ISOLATION ---
  const activeTeacher = useMemo<Teacher>(() => {
    if (currentTeacherId) {
      const found = teachers.find(t => t.id === currentTeacherId);
      if (found) return found;
    }
    if (currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'teacher')) {
      const tid = currentUser.tuitionId || currentUser.id || currentTeacherId;
      if (tid) {
        const match = teachers.find(t => t.id === tid);
        if (match) return match;
      }
      return {
        id: tid || 'unassigned',
        name: currentUser.name || 'Instructor',
        subject: currentUser.tuitionName || 'Tuition Center',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        pin: currentUser.pin || '1234',
        upiId: currentUser.upiId || '',
        location: currentUser.tuitionName || '',
        status: (currentUser.status as 'Active' | 'Suspended') || 'Active',
        bio: `Dedicated tuition center led by ${currentUser.name || 'Instructor'}.`,
        resultsHeadline: 'New Academic Batches Now Open for Enrollment!'
      };
    }
    return {
      id: currentTeacherId || '',
      name: currentTeacherId ? 'Tuition Instructor' : 'No Teacher Selected',
      subject: 'Academics',
      email: '',
      phone: '',
      upiId: '',
      location: '',
      bio: '',
      resultsHeadline: ''
    };
  }, [teachers, currentTeacherId, currentUser]);

  // Unique Tuition Registration Join Code for active teacher
  const teacherRegistrationCode = useMemo(() => {
    if (activeTeacher.registrationJoinCode) return activeTeacher.registrationJoinCode;
    if (activeTeacher.id === 't1') return 'SHARMA-101';
    if (activeTeacher.id === 't2') return 'VERMA-202';
    const prefix = (activeTeacher.name.split(' ').pop() || 'CODE').toUpperCase().replace(/[^A-Z]/g, '');
    return `${prefix}-${activeTeacher.id.slice(-3).toUpperCase()}`;
  }, [activeTeacher]);

  // Regenerate Teacher Registration Join Code handler
  const handleRegenerateJoinCode = () => {
    const teacherPrefix = (activeTeacher.name.split(' ').pop() || 'CODE').toUpperCase().replace(/[^A-Z]/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newCode = `${teacherPrefix}-${randomNum}`;

    const updatedTeachers = teachers.map(t => {
      if (t.id === activeTeacher.id) {
        return { ...t, registrationJoinCode: newCode };
      }
      return t;
    });
    setTeachers(updatedTeachers);
    try {
      localStorage.setItem('tm_teachers', JSON.stringify(updatedTeachers));
    } catch {}
    showToast(`Registration Join Code successfully regenerated: ${newCode}`);
  };

  const activeStudent = useMemo<Student>(() => {
    // If student is logged in via multi-tenant session, prioritize matching both id & tuitionId
    if (currentUser && (currentUser.role === 'STUDENT' || currentUser.role === 'student')) {
      const matchInDb = students.find(s => s.id === currentUser.id && s.teacherId === (currentUser.tuitionId || currentTeacherId));
      if (matchInDb) return matchInDb;
      return {
        id: currentUser.id || currentStudentId || 'unassigned',
        teacherId: currentUser.tuitionId || currentTeacherId || '',
        name: currentUser.name || 'Student',
        rollNo: currentUser.rollNo || '-',
        batch: currentUser.batch || 'General Batch',
        phone: currentUser.phone || '',
        parentPhone: currentUser.parentPhone || '',
        feeStatus: 'Paid' as const,
        feeAmount: 0,
        attendanceRate: 100
      };
    }
    if (currentStudentId) {
      const found = students.find(s => s.id === currentStudentId && (!currentTeacherId || s.teacherId === currentTeacherId))
                 || students.find(s => s.id === currentStudentId);
      if (found) return found;
    }
    return {
      id: currentStudentId || '',
      teacherId: currentTeacherId || '',
      name: currentStudentId ? 'Student' : 'No Student Selected',
      rollNo: '-',
      batch: 'Unassigned',
      phone: '',
      parentPhone: '',
      feeStatus: 'Paid' as const,
      feeAmount: 0,
      attendanceRate: 100
    };
  }, [students, currentStudentId, currentTeacherId, currentUser]);

  // Batches strictly belonging to the active teacher
  const teacherBatchesList = useMemo(() => {
    return batches.filter(b => b.teacherId === currentTeacherId);
  }, [batches, currentTeacherId]);

  // Pending join requests strictly for the active teacher
  const teacherPendingRequests = useMemo(() => {
    return joinRequests.filter(r => r.teacherId === currentTeacherId && r.status === 'Pending');
  }, [joinRequests, currentTeacherId]);

  // Detected batch for student code input
  const detectedBatch = useMemo(() => {
    const trimmed = inputJoinCode.trim().toUpperCase();
    if (trimmed.length < 4) return null;
    return batches.find(b => b.joinCode.toUpperCase() === trimmed) || null;
  }, [inputJoinCode, batches]);

  // When switching student, automatically sync currentTeacherId to the student's teacher
  const handleSelectStudent = (studentId: string) => {
    setCurrentStudentId(studentId);
    const targetStudent = students.find(s => s.id === studentId);
    if (targetStudent && targetStudent.teacherId) {
      setCurrentTeacherId(targetStudent.teacherId);
    }
  };

  // Students strictly enrolled under the active teacher
  const teacherStudents = useMemo(() => {
    return students.filter(s => s.teacherId === currentTeacherId);
  }, [students, currentTeacherId]);

  const teacherBatchNames = useMemo(() => {
    const fromBatches = teacherBatchesList.map(b => b.name);
    const fromStudents = teacherStudents.map(s => s.batch);
    return Array.from(new Set([...fromBatches, ...fromStudents]));
  }, [teacherBatchesList, teacherStudents]);

  // Dynamic Attendance Calculation for any student ID
  const getCalculatedAttendanceRate = (studentId: string): number => {
    const dates = Object.keys(attendanceRecords);
    let attended = 0;
    let total = 0;
    dates.forEach(d => {
      const record = attendanceRecords[d]?.[studentId];
      if (record) {
        total++;
        if (record === 'Present') attended++;
      }
    });
    if (total === 0) {
      const st = students.find(s => s.id === studentId);
      return st?.attendanceRate ?? 100;
    }
    return Math.round((attended / total) * 100);
  };

  // STRICT RBAC: Student's Personal Attendance History (ZERO exposure to other students)
  const studentAttendanceLog = useMemo(() => {
    const dates = Object.keys(attendanceRecords).sort().reverse();
    return dates.map(date => {
      const status = attendanceRecords[date]?.[activeStudent.id] || 'Present';
      return { date, status };
    });
  }, [attendanceRecords, activeStudent.id]);

  const studentAttendancePresentCount = useMemo(() => {
    return studentAttendanceLog.filter(log => log.status === 'Present').length;
  }, [studentAttendanceLog]);

  // STRICT RBAC: Student's Personal Enrolled Batch
  const studentEnrolledBatch = useMemo(() => {
    return batches.find(b => b.name === activeStudent.batch && b.teacherId === activeStudent.teacherId) || null;
  }, [batches, activeStudent]);

  // STRICT RBAC: Student's Personal Test Scores (ZERO exposure to other students' scores)
  const studentPersonalScores = useMemo(() => {
    return scores.filter(sc => sc.studentId === activeStudent.id);
  }, [scores, activeStudent.id]);

  // STRICT RBAC: Content Filtering (Notes & Tests never leak across teachers or student batches)
  const visibleNotes = useMemo(() => {
    if (currentRole === 'teacher') {
      return notes.filter(n => n.teacherId === currentTeacherId);
    }
    // Student only sees notes strictly for their enrolled batch & teacher
    return notes.filter(n => 
      n.teacherId === activeStudent.teacherId && 
      (n.batch === activeStudent.batch || n.batch === 'ALL' || n.batch === 'All Batches')
    );
  }, [notes, currentRole, currentTeacherId, activeStudent]);

  const visibleTests = useMemo(() => {
    if (currentRole === 'teacher') {
      return tests.filter(t => t.teacherId === currentTeacherId);
    }
    // Student only sees quizzes strictly for their enrolled batch & teacher
    return tests.filter(t => 
      t.teacherId === activeStudent.teacherId && 
      (t.batch === activeStudent.batch || t.batch === 'ALL' || t.batch === 'All Batches')
    );
  }, [tests, currentRole, currentTeacherId, activeStudent]);

  // Strictly isolate scores for export to current tuition center
  const centerScores = useMemo(() => {
    const testIds = new Set(visibleTests.map(t => t.id));
    const studentIds = new Set(teacherStudents.map(s => s.id));
    return scores.filter(sc => testIds.has(sc.testId) || studentIds.has(sc.studentId));
  }, [scores, visibleTests, teacherStudents]);

  // Export Dataset (Strictly isolated to authorized teacher/center scope)
  const exportDataset: ExportDataset = useMemo(() => ({
    teacher: activeTeacher,
    batches: teacherBatchesList,
    students: teacherStudents,
    notes: visibleNotes,
    tests: visibleTests,
    attendanceRecords,
    scores: centerScores,
    pendingRequests: teacherPendingRequests
  }), [activeTeacher, teacherBatchesList, teacherStudents, visibleNotes, visibleTests, attendanceRecords, centerScores, teacherPendingRequests]);

  // Statistics
  const totalStudentsCount = teacherStudents.length;
  const paidCount = teacherStudents.filter(s => s.feeStatus === 'Paid').length;
  const pendingCount = teacherStudents.filter(s => s.feeStatus === 'Pending').length;
  const overdueCount = teacherStudents.filter(s => s.feeStatus === 'Overdue').length;
  const totalPendingFees = teacherStudents.filter(s => s.feeStatus !== 'Paid').reduce((acc, s) => acc + s.feeAmount, 0);
  const totalCollectedFees = teacherStudents.filter(s => s.feeStatus === 'Paid').reduce((acc, s) => acc + s.feeAmount, 0);

  // Filtered Students for Student Directory Tab
  const filteredStudents = useMemo(() => {
    return teacherStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.phone.includes(searchQuery);
      const matchesBatch = selectedBatchFilter === 'ALL' || s.batch === selectedBatchFilter;
      const matchesFee = selectedFeeFilter === 'ALL' || s.feeStatus === selectedFeeFilter;
      return matchesSearch && matchesBatch && matchesFee;
    });
  }, [teacherStudents, searchQuery, selectedBatchFilter, selectedFeeFilter]);

  // Test Timer Effect
  useEffect(() => {
    if (!activeTakingTest || testTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTestTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTakingTest, testTimeRemaining]);

  // --- AUTOMATED WHATSAPP REMINDERS (BIZ-GROWTH FEATURE 1) ---
  const sendWhatsAppFeeReminder = (student: Student) => {
    const targetPhone = (student.parentPhone || student.phone).replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Dear Parent, This is a gentle reminder from ${activeTeacher.name} regarding monthly tuition fees for ${student.name} (${student.batch}). Amount due: ₹${student.feeAmount}. Status: ${student.feeStatus.toUpperCase()}. Please clear at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
    showToast(`WhatsApp Fee Reminder drafted for ${student.name}'s parent!`);
  };

  const sendWhatsAppAbsenceAlert = (student: Student) => {
    const targetPhone = (student.parentPhone || student.phone).replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Notice from ${activeTeacher.name}: Dear Parent, your child ${student.name} was marked ABSENT today (${attendanceDate}) in ${student.batch}. Please connect if you have any questions.`
    );
    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
    showToast(`Absence Alert sent to ${student.name}'s parent!`);
  };

  // --- DIGITAL FEE RECEIPTS (BIZ-GROWTH FEATURE 2) ---
  const printFeeReceipt = (student: Student) => {
    const windowPrint = window.open('', '', 'width=800,height=600');
    if (!windowPrint) return;
    windowPrint.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${escapeHtml(student.name)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .receipt-box { border: 2px solid #4f46e5; padding: 32px; border-radius: 16px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
            .header h2 { margin: 0 0 4px 0; color: #1e1b4b; font-size: 24px; }
            .header p { margin: 0 0 12px 0; color: #64748b; font-size: 14px; }
            .header h3 { display: inline-block; background: #eef2ff; color: #4338ca; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin: 0; }
            .details { margin-bottom: 24px; font-size: 14px; line-height: 1.8; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 8px 0; }
            .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; font-weight: bold; border-radius: 20px; font-size: 12px; }
            .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .amount-val { font-size: 28px; font-weight: 800; color: #0f172a; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h2>${escapeHtml(activeTeacher.name)}</h2>
              <p>${escapeHtml(activeTeacher.subject)} • ${escapeHtml(activeTeacher.phone)} ${activeTeacher.location ? '• ' + escapeHtml(activeTeacher.location) : ''}</p>
              <h3>OFFICIAL TUITION FEE RECEIPT</h3>
            </div>
            <div class="details">
              <div class="row"><span>Receipt Date:</span><strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              <div class="row"><span>Student Name:</span><strong>${escapeHtml(student.name)}</strong></div>
              <div class="row"><span>Roll Number:</span><strong>#${escapeHtml(student.rollNo)}</strong></div>
              <div class="row"><span>Batch Enrolled:</span><strong>${escapeHtml(student.batch)}</strong></div>
              <div class="row"><span>Student Phone:</span><strong>${escapeHtml(student.phone)}</strong></div>
              ${student.parentPhone ? `<div class="row"><span>Parent WhatsApp:</span><strong>${escapeHtml(student.parentPhone)}</strong></div>` : ''}
              <div class="row"><span>Payment Status:</span><span class="badge">PAID / CLEARED</span></div>
              <div class="row"><span>Reference ID:</span><span style="font-family: monospace;">TXN-${Date.now().toString(36).toUpperCase()}</span></div>
            </div>
            <div class="amount-box">
              <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600;">Total Amount Received</div>
              <div class="amount-val">₹${student.feeAmount}</div>
            </div>
            <div class="footer">
              <p>Thank you for your prompt payment!</p>
              <p>Generated securely via EduMaster Hub Multi-Tenant Tuition Platform</p>
            </div>
          </div>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
    }, 250);
    showToast(`Print receipt opened for ${student.name}`);
  };

  // --- BATCH CODE JOIN & APPROVAL HANDLERS ---

  // Student Submits 6-digit Join Code Request
  const handleStudentJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedBatch) {
      alert('Please enter a valid 6-digit batch join code.');
      return;
    }
    if (!joinStudentName.trim() || !joinStudentPhone.trim()) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    const teacher = teachers.find(t => t.id === detectedBatch.teacherId);
    const newRequest: BatchJoinRequest = {
      id: `req_${Date.now()}`,
      batchId: detectedBatch.id,
      batchName: detectedBatch.name,
      teacherId: detectedBatch.teacherId,
      teacherName: teacher ? teacher.name : 'Tuition Instructor',
      studentName: joinStudentName.trim(),
      studentPhone: joinStudentPhone.trim(),
      parentPhone: joinParentPhone.trim() || undefined,
      rollNo: joinStudentRoll.trim() || String(Math.floor(100 + Math.random() * 900)),
      status: 'Pending',
      requestedAt: new Date().toLocaleString()
    };

    setJoinRequests([newRequest, ...joinRequests]);
    setShowJoinBatchModal(false);
    setInputJoinCode('');
    setJoinStudentName('');
    setJoinStudentPhone('');
    setJoinParentPhone('');
    setJoinStudentRoll('');

    showToast(`Join Request sent for "${detectedBatch.name}"! Waiting for instructor approval.`);
  };

  // Teacher Approves Student Join Request
  const handleApproveJoinRequest = (req: BatchJoinRequest) => {
    const batch = batches.find(b => b.id === req.batchId);
    const newStudentId = `s_${Date.now()}`;
    const newStudent: Student = {
      id: newStudentId,
      teacherId: req.teacherId,
      name: req.studentName,
      rollNo: req.rollNo,
      batch: req.batchName,
      phone: req.studentPhone,
      parentPhone: req.parentPhone,
      feeStatus: 'Pending',
      feeAmount: batch ? batch.monthlyFee : 2500,
      attendanceRate: 100
    };

    // Update request status
    setJoinRequests(joinRequests.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    // Add student to directory
    setStudents(prev => [...prev, newStudent]);

    showToast(`Approved ${req.studentName}! Enrolled in ${req.batchName}.`);
  };

  // Teacher Rejects Student Join Request
  const handleRejectJoinRequest = (reqId: string) => {
    setJoinRequests(joinRequests.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r));
    showToast('Student join request declined.');
  };

  // Teacher Creates a New Batch with unique 6-digit join code
  const handleCreateBatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const subject = (formData.get('subject') as string).trim();
    const monthlyFee = Number(formData.get('monthlyFee')) || 2500;
    const schedule = (formData.get('schedule') as string).trim();

    // Generate random unique 6-digit numeric code
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

    const newBatch: Batch = {
      id: `b_${Date.now()}`,
      teacherId: currentTeacherId,
      name,
      subject,
      joinCode: generatedCode,
      monthlyFee,
      schedule
    };

    setBatches([...batches, newBatch]);
    setShowCreateBatchModal(false);
    showToast(`Batch created with Unique Join Code: ${generatedCode}`);
  };

  // --- GENERAL HANDLERS ---

  // Register New Teacher Submit
  const handleRegisterTeacherSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTeacherId = `t_${Date.now()}`;
    const name = (formData.get('name') as string).trim();
    const subject = (formData.get('subject') as string).trim();
    const email = (formData.get('email') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const pin = ((formData.get('pin') as string) || '').trim() || '1234';
    const upiId = ((formData.get('upiId') as string) || '').trim();
    const location = ((formData.get('location') as string) || '').trim() || name;
    const bio = ((formData.get('bio') as string) || '').trim() || `Tuition center managed by ${name}.`;
    const resultsHeadline = ((formData.get('resultsHeadline') as string) || '').trim() || 'New Academic Batches Now Open for Enrollment!';

    const newTeacher: Teacher = {
      id: newTeacherId,
      name,
      subject,
      email,
      phone,
      pin,
      upiId,
      location,
      status: 'Active',
      bio,
      resultsHeadline
    };

    // Auto-create a sample default batch for this teacher with a unique 6-digit code
    const defaultBatch: Batch = {
      id: `b_${Date.now()}`,
      teacherId: newTeacherId,
      name: `${subject.split('&')[0].trim()} Foundation Batch`,
      subject: subject,
      joinCode: String(Math.floor(100000 + Math.random() * 900000)),
      monthlyFee: 2500,
      schedule: 'Mon, Wed, Fri (5:00 PM)'
    };

    const updatedTeachers = [...teachers, newTeacher];
    const updatedBatches = [...batches, defaultBatch];
    setTeachers(updatedTeachers);
    setBatches(updatedBatches);
    setCurrentTeacherId(newTeacherId);
    setCurrentRole('teacher');
    setIsTeacherUnlocked(true);
    setShowRegisterTeacherModal(false);

    try {
      sessionStorage.setItem(`tm_unlocked_${newTeacherId}`, 'true');
    } catch {}

    // Save clean isolated session to localStorage
    const newAuthUser = {
      id: newTeacherId,
      name: newTeacher.name,
      role: 'TEACHER',
      tuitionId: newTeacherId,
      tuitionName: newTeacher.name,
      email: newTeacher.email,
      phone: newTeacher.phone
    };
    try {
      localStorage.setItem('tm_teachers', JSON.stringify(updatedTeachers));
      localStorage.setItem('tm_batches', JSON.stringify(updatedBatches));
      localStorage.setItem('tm_current_teacher_id', newTeacherId);
      localStorage.setItem('tm_auth_user', JSON.stringify(newAuthUser));
    } catch {}

    if (onUserUpdate) {
      onUserUpdate(newAuthUser);
    }

    showToast(`Tuition center registered! Batch Code generated: ${defaultBatch.joinCode}`);
  };

  // Add / Edit Student Submit
  const handleSaveStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const rollNo = (formData.get('rollNo') as string).trim();
    const batch = (formData.get('batch') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const parentPhone = ((formData.get('parentPhone') as string) || '').trim();
    const feeStatus = formData.get('feeStatus') as 'Paid' | 'Pending' | 'Overdue';
    const feeAmount = Number(formData.get('feeAmount')) || 2500;

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? {
        ...s,
        name,
        rollNo,
        batch,
        phone,
        parentPhone: parentPhone || s.parentPhone,
        feeStatus,
        feeAmount
      } : s));
      showToast(`Student ${name} updated successfully!`);
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: `s_${Date.now()}`,
        teacherId: currentTeacherId,
        name,
        rollNo,
        batch,
        phone,
        parentPhone: parentPhone || undefined,
        feeStatus,
        feeAmount,
        attendanceRate: 100
      };
      setStudents([...students, newStudent]);
      showToast(`Student ${name} added successfully!`);
      setShowAddStudentModal(false);
    }
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to remove ${studentName}?`)) {
      setStudents(students.filter(s => s.id !== studentId));
      showToast(`Removed student ${studentName}`);
    }
  };

  // Add Note Submit
  const handleAddNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newNote: Note = {
      id: `n_${Date.now()}`,
      teacherId: currentTeacherId,
      title: formData.get('title') as string,
      subject: formData.get('subject') as string,
      batch: formData.get('batch') as string,
      date: new Date().toISOString().split('T')[0],
      link: '#',
      content: formData.get('content') as string
    };
    setNotes([newNote, ...notes]);
    setShowAddNoteModal(false);
    showToast('Study note uploaded successfully!');
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this study material note?')) {
      setNotes(notes.filter(n => n.id !== noteId));
      showToast('Note deleted.');
    }
  };

  // Trigger file download simulation
  const handleDownloadNote = (note: Note) => {
    const fileContent = `# ${note.title}\nSubject: ${note.subject}\nBatch: ${note.batch}\nDate: ${note.date}\n\n${note.content}`;
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded: ${note.title}`);
  };

  // Update Student Fee Status
  const handleUpdateFee = (studentId: string, status: 'Paid' | 'Pending' | 'Overdue') => {
    setStudents(students.map(s => s.id === studentId ? { ...s, feeStatus: status } : s));
    showToast(`Fee status updated to "${status}"`);
  };

  // Toggle Attendance
  const handleToggleAttendance = (studentId: string) => {
    const currentDayRecord: Record<string, 'Present' | 'Absent'> = { ...(attendanceRecords[attendanceDate] || {}) };
    const currentStatus: 'Present' | 'Absent' = currentDayRecord[studentId] || 'Present';
    const nextStatus: 'Present' | 'Absent' = currentStatus === 'Present' ? 'Absent' : 'Present';

    currentDayRecord[studentId] = nextStatus;

    setAttendanceRecords(prev => ({
      ...prev,
      [attendanceDate]: currentDayRecord
    }));
  };

  const handleMarkAllAttendance = (status: 'Present' | 'Absent') => {
    const currentDayRecord: Record<string, 'Present' | 'Absent'> = { ...(attendanceRecords[attendanceDate] || {}) };
    teacherStudents.forEach(s => {
      currentDayRecord[s.id] = status;
    });
    setAttendanceRecords(prev => ({
      ...prev,
      [attendanceDate]: currentDayRecord
    }));
    showToast(`Marked all students as ${status} for ${attendanceDate}`);
  };

  // Start a Test
  const handleStartTest = (test: Test) => {
    setActiveTakingTest(test);
    setUserAnswers({});
    setTestTimeRemaining(test.duration * 60);
    setActiveTab('tests');
  };

  // Finish / Submit Test
  const handleFinishTest = () => {
    if (!activeTakingTest) return;
    
    let correctCount = 0;
    activeTakingTest.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const marksPerQuestion = activeTakingTest.totalMarks / activeTakingTest.questions.length;
    const earnedMarks = Math.min(
      activeTakingTest.totalMarks,
      Math.round(correctCount * marksPerQuestion)
    );
    const percentage = Math.round((earnedMarks / activeTakingTest.totalMarks) * 100);
    const passed = earnedMarks >= activeTakingTest.passingScore;

    const newScoreRecord: ScoreRecord = {
      id: `sc_${Date.now()}`,
      testId: activeTakingTest.id,
      studentId: currentStudentId,
      studentName: activeStudent.name,
      subject: activeTakingTest.subject,
      testTitle: activeTakingTest.title,
      score: earnedMarks,
      totalMarks: activeTakingTest.totalMarks,
      percentage,
      status: passed ? 'Passed' : 'Failed',
      date: new Date().toISOString().split('T')[0]
    };

    setScores(prev => [newScoreRecord, ...prev]);

    // Show completion results modal
    setTestCompletedResult({
      score: earnedMarks,
      totalMarks: activeTakingTest.totalMarks,
      percentage,
      status: passed ? 'Passed' : 'Failed',
      test: activeTakingTest,
      answers: { ...userAnswers }
    });

    setActiveTakingTest(null);
    setUserAnswers({});
    showToast(`Test submitted! You scored ${earnedMarks}/${activeTakingTest.totalMarks}`);
  };

  // Test Creation Form State
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestSubject, setNewTestSubject] = useState(() => activeTeacher.subject || 'Academics');
  const [newTestBatch, setNewTestBatch] = useState(() => teacherBatchesList[0]?.name || 'Foundation Batch');
  const [newTestDuration, setNewTestDuration] = useState(15);
  const [newTestTotalMarks, setNewTestTotalMarks] = useState(20);
  const [newTestPassingScore, setNewTestPassingScore] = useState(10);
  const [newTestQuestions, setNewTestQuestions] = useState<Question[]>([
    {
      id: 'nq_1',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  // Synchronize new test defaults with active teacher's batches
  useEffect(() => {
    if (showCreateTestModal) {
      if (activeTeacher.subject) setNewTestSubject(activeTeacher.subject);
      if (teacherBatchesList.length > 0 && (!newTestBatch || newTestBatch === 'Class 10 - Batch A')) {
        setNewTestBatch(teacherBatchesList[0].name);
      }
    }
  }, [showCreateTestModal, activeTeacher.subject, teacherBatchesList]);

  const handleAddQuestionField = () => {
    setNewTestQuestions([
      ...newTestQuestions,
      {
        id: `nq_${Date.now()}`,
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const handleRemoveQuestionField = (idx: number) => {
    if (newTestQuestions.length <= 1) {
      alert('At least one question is required.');
      return;
    }
    setNewTestQuestions(newTestQuestions.filter((_, i) => i !== idx));
  };

  const handleCreateTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) {
      alert('Please provide a test title.');
      return;
    }

    for (let i = 0; i < newTestQuestions.length; i++) {
      const q = newTestQuestions[i];
      if (!q.questionText.trim()) {
        alert(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`All 4 options for Question #${i + 1} must be filled.`);
        return;
      }
    }

    const createdTest: Test = {
      id: `test_${Date.now()}`,
      teacherId: currentTeacherId,
      title: newTestTitle.trim(),
      subject: newTestSubject.trim(),
      batch: newTestBatch.trim(),
      duration: Number(newTestDuration) || 15,
      totalMarks: Number(newTestTotalMarks) || 20,
      passingScore: Number(newTestPassingScore) || 10,
      questions: newTestQuestions
    };

    setTests([createdTest, ...tests]);
    setShowCreateTestModal(false);
    showToast(`Test "${createdTest.title}" created successfully!`);
    
    setNewTestTitle('');
    setNewTestQuestions([
      { id: 'nq_1', questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter(t => t.id !== testId));
      showToast('Test deleted.');
    }
  };

  // Reset to sample defaults
  const handleResetData = () => {
    if (confirm('Reset portal data back to original sample data? Any added records will be replaced.')) {
      setTeachers(DEFAULT_TEACHERS);
      setBatches(DEFAULT_BATCHES);
      setJoinRequests(DEFAULT_JOIN_REQUESTS);
      setStudents(DEFAULT_STUDENTS);
      setNotes(DEFAULT_NOTES);
      setTests(DEFAULT_TESTS);
      setScores(DEFAULT_SCORES);
      setAttendanceRecords(DEFAULT_ATTENDANCE);
      const targetedKeys = [
        'tm_teachers', 'tm_batches', 'tm_join_requests', 'tm_students',
        'tm_notes', 'tm_tests', 'tm_scores', 'tm_attendance', 'tm_current_teacher_id'
      ];
      targetedKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      showToast('Portal reset to initial sample data.');
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Analytics data calculation
  const analyticsData = useMemo(() => {
    if (currentRole === 'student') {
      const studentHistory = scores.filter(sc => sc.studentId === currentStudentId);
      return studentHistory.map(sc => ({
        testTitle: sc.testTitle.length > 18 ? sc.testTitle.substring(0, 16) + '...' : sc.testTitle,
        score: sc.score,
        totalMarks: sc.totalMarks,
        percentage: sc.percentage,
        date: sc.date
      }));
    } else {
      const teacherTestIds = tests.filter(t => t.teacherId === currentTeacherId).map(t => t.id);
      const relevantScores = scores.filter(sc => teacherTestIds.includes(sc.testId));
      
      const groupedTests: Record<string, { totalScore: number; maxMarks: number; count: number; title: string }> = {};
      relevantScores.forEach(sc => {
        if (!groupedTests[sc.testId]) {
          groupedTests[sc.testId] = { totalScore: 0, maxMarks: sc.totalMarks, count: 0, title: sc.testTitle };
        }
        groupedTests[sc.testId].totalScore += sc.score;
        groupedTests[sc.testId].count += 1;
      });

      return Object.values(groupedTests).map(g => ({
        testTitle: g.title.length > 18 ? g.title.substring(0, 16) + '...' : g.title,
        score: Math.round(g.totalScore / (g.count || 1)),
        totalMarks: g.maxMarks,
        attempts: g.count
      }));
    }
  }, [scores, currentRole, currentStudentId, currentTeacherId, tests]);

  const passFailData = useMemo(() => {
    const relevantScores = currentRole === 'student' 
      ? scores.filter(sc => sc.studentId === currentStudentId)
      : scores.filter(sc => {
          const test = tests.find(t => t.id === sc.testId);
          return test && test.teacherId === currentTeacherId;
        });
    const passed = relevantScores.filter(sc => sc.status === 'Passed').length;
    const failed = relevantScores.filter(sc => sc.status === 'Failed').length;
    return [
      { name: 'Passed', value: passed },
      { name: 'Needs Review', value: failed }
    ];
  }, [scores, currentRole, currentStudentId, currentTeacherId, tests]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* RBAC CONTEXT CONTROLS */}
            {currentRole === 'teacher' ? (
              <div className="flex items-center space-x-2">
                {/* Tuition Center Selection Dropdown: Strictly restricted to the 2 public demo accounts */}
                {(!currentUser || currentUser.role !== 'TEACHER') && (
                  <div className="flex items-center bg-slate-800 rounded-lg px-2 sm:px-3 py-1.5 border border-slate-700">
                    <UserCheck className="w-4 h-4 text-indigo-400 mr-2 hidden sm:block" />
                    <span className="text-xs text-slate-400 mr-2 hidden md:inline">Tuition Center:</span>
                    <select 
                      value={currentTeacherId && (currentTeacherId === 't1' || currentTeacherId === 't2') ? currentTeacherId : 't1'} 
                      onChange={(e) => handleSwitchTeacher(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-indigo-200 cursor-pointer"
                    >
                      {DEMO_PUBLIC_TEACHERS.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-800 text-white">
                          {t.name} ({t.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Batch Join Requests Alert Pill */}
                <button
                  onClick={() => setShowBatchRequestsModal(true)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    teacherPendingRequests.length > 0 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View incoming student join requests"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Requests</span>
                  {teacherPendingRequests.length > 0 && (
                    <span className="bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {teacherPendingRequests.length}
                    </span>
                  )}
                </button>

                {/* Public Admissions Microsite Button */}
                <button
                  onClick={() => setShowLandingPageModal(true)}
                  className="bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
                  title="Open Public Admissions Microsite"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Admissions Site</span>
                </button>

                {/* Teacher Security & Management Tools (PIN, Backup, Lock) */}
                {isTeacherUnlocked && currentTeacherId && (
                  <>
                    <button
                      onClick={() => setShowChangePinModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-slate-700"
                      title="Change 4-Digit Security PIN"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">PIN</span>
                    </button>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-slate-700 cursor-pointer"
                      title="Export Tuition Reports & Backups (JSON, Excel, CSV)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Export</span>
                    </button>
                    <button
                      onClick={handleLockTeacherProfile}
                      className="bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all border border-amber-500/40"
                      title="Lock workspace immediately (requires PIN to re-enter)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lock</span>
                    </button>
                  </>
                )}

                {/* Register New Teacher Account */}
                <button
                  onClick={() => setShowRegisterTeacherModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
                  title="Register a new Tuition Center / Teacher Account"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Teacher</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* STRICT RBAC: Student Profile Pill (Zero exposure to other teachers or peer directories) */}
                <div className="flex items-center bg-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 border border-slate-700">
                  <User className="w-4 h-4 text-emerald-400 mr-2" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-emerald-300 leading-none">{activeStudent.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{activeStudent.batch} • Roll #{activeStudent.rollNo}</p>
                  </div>
                </div>

                {/* Student Join Batch with Code Action */}
                <button
                  onClick={() => setShowJoinBatchModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all ring-1 ring-emerald-400/30"
                  title="Enter 6-digit code to join a batch"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Join Batch</span>
                </button>
              </div>
            )}

            {/* Role Enforcement Badge / Switcher */}
            {currentUser ? (
              // Locked role display if authenticated via login session
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border ${
                currentRole === 'teacher' 
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' 
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              }`}>
                {currentRole === 'teacher' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="capitalize">{currentRole === 'teacher' ? 'Instructor' : 'Student'} Role</span>
              </div>
            ) : (
              // Dev demo switcher
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => { setCurrentRole('teacher'); setActiveTab('dashboard'); }}
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
                  onClick={() => { 
                    setCurrentRole('student'); 
                    setActiveTab('dashboard');
                    if (activeStudent && activeStudent.teacherId) {
                      setCurrentTeacherId(activeStudent.teacherId);
                    }
                  }}
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

            {/* Logout / Switch Session */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem('tm_auth_user');
                  window.location.reload();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Log Out of Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* PIN UNLOCK GATE — Full-screen overlay when teacher not unlocked  */}
      {/* ================================================================ */}
      {currentRole === 'teacher' && !isTeacherUnlocked && currentTeacherId && (() => {
        const pinTeacher = teachers.find(t => t.id === currentTeacherId) || activeTeacher;
        return (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Profile Locked</h2>
                <p className="text-indigo-200 text-sm mt-1">Enter your 4-digit PIN to access</p>
                <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-block">
                  <p className="font-bold text-white text-base">{pinTeacher?.name || 'Instructor'}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{pinTeacher?.subject || ''}</p>
                </div>
              </div>

              {/* PIN Form */}
              <form onSubmit={handleVerifyTeacherPin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 text-center">Enter 4-Digit Security PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={teacherPinInput}
                    onChange={(e) => { setTeacherPinInput(e.target.value.replace(/\D/g, '')); setTeacherPinError(''); }}
                    className="w-full p-3 text-center text-2xl font-bold tracking-[0.5em] border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="••••"
                    autoFocus
                  />
                  {teacherPinError && (
                    <div className="mt-2 flex items-center space-x-1.5 text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{teacherPinError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={teacherPinInput.length !== 4}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Workspace</span>
                </button>

                {/* Switch Teacher or Sign Out link */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      if (onLogout) {
                        onLogout();
                      } else {
                        localStorage.removeItem('tm_auth_user');
                        window.location.reload();
                      }
                    } else {
                      setCurrentTeacherId('');
                      setTeacherPinError('');
                      setTeacherPinInput('');
                    }
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-indigo-600 transition-colors mt-2 underline underline-offset-2"
                >
                  {currentUser ? '← Sign out of this account' : '← Switch to a different teacher'}
                </button>

                {/* Direct File Restore from Computer */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => fileImportInputRef.current?.click()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center space-x-1.5 mx-auto py-1 cursor-pointer hover:underline"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Workspace File (.json) from Computer</span>
                  </button>
                </div>

                {/* Demo hint */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <p className="font-bold mb-1">🔐 Demo PINs:</p>
                  <div className="space-y-0.5">
                    <p>Prof. Rajesh Sharma → <span className="font-mono font-bold">1234</span></p>
                    <p>Ms. Anita Verma → <span className="font-mono font-bold">5678</span></p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION WITH STRICT ROLE-BASED TABS */}
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className={`px-4 py-3 rounded-xl border ${currentRole === 'teacher' ? 'bg-indigo-50/70 border-indigo-100' : 'bg-emerald-50/70 border-emerald-100'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {currentRole === 'teacher' ? 'Instructor Portal' : 'Student Learning Desk'}
                </p>
                <span className={`w-2 h-2 rounded-full ${currentRole === 'teacher' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-ping`}></span>
              </div>
              <p className="font-bold text-slate-800 text-sm truncate mt-1">
                {currentRole === 'teacher' ? activeTeacher.name : activeStudent.name}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {currentRole === 'teacher' ? activeTeacher.subject : `${activeStudent.batch} • Roll #${activeStudent.rollNo}`}
              </p>
            </div>

            <nav className="space-y-1">
              {/* DASHBOARD TAB (SHARED) */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>{currentRole === 'teacher' ? 'Dashboard' : 'My Learning Desk'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* ---------------- TEACHER-ONLY TABS ---------------- */}
              {currentRole === 'teacher' && (
                <>
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'students' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4" />
                      <span>Student Directory</span>
                    </div>
                    <span className="text-xs bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-md font-bold">
                      {totalStudentsCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'attendance' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4" />
                      <span>Daily Attendance</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveTab('fees')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'fees' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4" />
                      <span>Fee Ledger</span>
                    </div>
                    {pendingCount + overdueCount > 0 && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-bold">
                        {pendingCount + overdueCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* ---------------- STUDENT-ONLY TABS (STRICT RBAC) ---------------- */}
              {currentRole === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('my-attendance')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'my-attendance' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4" />
                      <span>My Attendance</span>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                      {getCalculatedAttendanceRate(activeStudent.id)}%
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('my-fees')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'my-fees' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4" />
                      <span>My Fee & Receipts</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      activeStudent.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activeStudent.feeStatus}
                    </span>
                  </button>
                </>
              )}

              {/* SHARED CONTENT TABS (FILTERED STRICTLY BY BATCH/TEACHER) */}
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'notes' 
                    ? (currentRole === 'teacher' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentRole === 'teacher' ? 'Study Notes' : 'Class Notes'}</span>
                </div>
                <span className="text-xs bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-md font-bold">
                  {visibleNotes.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'tests' 
                    ? (currentRole === 'teacher' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-4 h-4" />
                  <span>{currentRole === 'teacher' ? 'Tests & Quizzes' : 'Quizzes & Tests'}</span>
                </div>
                <span className="text-xs bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-md font-bold">
                  {visibleTests.length}
                </span>
              </button>

              {/* TEACHER-ONLY: SCORE ANALYTICS */}
              {currentRole === 'teacher' && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'analytics' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>Score Analytics</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}

              {/* STUDENT-ONLY: MY PERFORMANCE */}
              {currentRole === 'student' && (
                <button
                  onClick={() => setActiveTab('my-progress')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'my-progress' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>My Progress</span>
                  </div>
                  <span className="text-xs bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-md font-bold">
                    {studentPersonalScores.length}
                  </span>
                </button>
              )}

              {/* SHARED: MENTOR DIRECTORY */}
              <button
                onClick={() => setActiveTab('mentors')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'mentors'
                    ? (currentRole === 'teacher' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4" />
                  <span>Mentor Directory</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </nav>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 space-y-2">
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center space-x-1.5 text-xs text-slate-400 hover:text-slate-600 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">EduMaster Hub v2.1 • RBAC Secured</p>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* STRICT RBAC TAB ACCESS GUARD */}
          {!isTabAuthorized(currentRole, activeTab) && (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  403 Forbidden • Access Restricted
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {currentRole === 'student' ? 'Instructor Privilege Required' : 'Student Privilege Required'}
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {currentRole === 'student' 
                    ? `You are signed in as a Student (${activeStudent.name}). Role-based access control (RBAC) strictly prevents student access to teacher financial ledgers, administrative registers, or peer contact records.`
                    : `You are in Instructor mode. This tab is reserved for personal student learning desks.`}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && isTabAuthorized(currentRole, 'dashboard') && (
            <div className="space-y-6">
              {/* SUSPENDED ACCOUNT WARNING BANNER (ADMIN CONTROLLED) */}
              {currentRole === 'teacher' && activeTeacher.status === 'Suspended' && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-rose-200 text-rose-800 rounded-xl shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-sm sm:text-base">Tuition Center Status: SUSPENDED</h4>
                        <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Admin Flagged
                        </span>
                      </div>
                      <p className="text-xs text-rose-700 mt-0.5">
                        This center has been marked as Suspended by the platform Super-Admin. New student admissions and public enrollment codes are restricted.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-xl whitespace-nowrap">
                    Contact Platform Owner
                  </span>
                </div>
              )}

              {/* WELCOME BANNER */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-400/30">
                      {currentRole === 'teacher' ? 'Instructor Dashboard' : 'Student Learning Desk'}
                    </span>
                    {currentRole === 'teacher' && teacherPendingRequests.length > 0 && (
                      <span className="bg-amber-500 text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                        <Bell className="w-3 h-3" /> {teacherPendingRequests.length} Pending Join Request(s)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mt-2">
                    Welcome back, {currentRole === 'teacher' ? activeTeacher.name : activeStudent.name}!
                  </h2>
                  <p className="text-indigo-200 text-sm mt-1 max-w-xl">
                    {currentRole === 'teacher' 
                      ? `Overseeing ${totalStudentsCount} enrolled students across ${teacherBatchesList.length} batch(es). Share your unique 6-digit join codes with new students.` 
                      : `Enrolled in ${activeStudent.batch}. Access your study materials, attempt quizzes, or join a new batch using an instructor code.`}
                  </p>
                </div>
                
                {currentRole === 'teacher' ? (
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowBatchRequestsModal(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-sm transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Review Requests ({teacherPendingRequests.length})</span>
                    </button>
                    <button 
                      onClick={() => setShowCreateBatchModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all"
                    >
                      <Key className="w-4 h-4" />
                      <span>Create Batch</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowJoinBatchModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-sm transition-all ring-2 ring-emerald-400/20"
                    >
                      <Key className="w-4 h-4" />
                      <span>Join Batch with Code</span>
                    </button>
                  </div>
                )}
              </div>

              {/* DEDICATED STUDENT REGISTRATION JOIN CODE SECTION (TEACHER DASHBOARD) */}
              {currentRole === 'teacher' && (
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-indigo-800/40 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tuition Self-Registration System</span>
                      </div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Student Registration Join Code</span>
                        <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                          ● Active Code
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Share this unique registration code with prospective students. Students must enter this code during self-registration to securely enroll into <strong>{activeTeacher.subject || activeTeacher.name}</strong>.
                      </p>
                    </div>

                    {/* Join Code Display and Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl shadow-inner">
                      <div className="px-3.5 py-1.5 bg-slate-950 rounded-lg border border-indigo-500/40">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Registration Code</span>
                        <span className="font-mono text-xl font-extrabold text-indigo-400 tracking-wider">
                          {teacherRegistrationCode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(teacherRegistrationCode)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                        title="Copy Registration Join Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>

                      <button
                        onClick={handleRegenerateJoinCode}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-indigo-200 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                        title="Generate a new registration join code"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate Code</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 relative z-10">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Security Protection: Students without this verified code cannot create accounts or join your tuition center.</span>
                    </div>
                    <div className="text-slate-400">
                      Default batch for newly registered students: <strong className="text-slate-200">{teacherBatchesList[0]?.name || 'Foundation Batch'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* BATCH JOIN CODES SHOWCASE CARD (TEACHER VIEW) */}
              {currentRole === 'teacher' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Your Active Batches & 6-Digit Join Codes</h3>
                        <p className="text-xs text-slate-500">Students enter these codes in their portal to request enrollment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCreateBatchModal(true)}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Batch</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherBatchesList.map(b => (
                      <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {b.subject}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">₹{b.monthlyFee}/mo</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mt-2">{b.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{b.schedule}</p>
                        </div>

                        {/* 6-DIGIT CODE PILL */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Student Join Code</span>
                            <span className="font-mono text-lg font-extrabold text-indigo-700 tracking-wider">
                              {b.joinCode}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(b.joinCode)}
                            className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 shadow-sm transition-all"
                            title="Copy 6-digit code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STRICT RBAC: STUDENT ENROLLED BATCH & INSTRUCTOR CARD */}
              {currentRole === 'student' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Enrolled Tuition Batch</h3>
                        <p className="text-xs text-slate-500">Your registered class and assigned faculty</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowJoinBatchModal(true)}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Join Another Batch</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {activeTeacher.subject}
                      </span>
                      <h4 className="font-bold text-slate-900 text-lg mt-1">{activeStudent.batch}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Faculty: <strong>{activeTeacher.name}</strong> • Location: {activeTeacher.location || 'Sector 14, Gurugram Center'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Schedule: {studentEnrolledBatch?.schedule || 'Mon, Wed, Fri (5:00 PM - 6:30 PM)'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center min-w-28">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">My Roll No</span>
                        <span className="font-bold text-slate-800 text-base block mt-0.5">#{activeStudent.rollNo}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center min-w-28">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Fee</span>
                        <span className="font-bold text-indigo-700 text-base block mt-0.5">₹{activeStudent.feeAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OVERVIEW STATS CARDS */}
              {currentRole === 'teacher' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalStudentsCount}</p>
                    <p className="text-xs text-slate-400 mt-1">{teacherBatchNames.length} active batch(es)</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fee Collection</span>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">
                      {totalStudentsCount > 0 ? Math.round((paidCount / totalStudentsCount) * 100) : 0}%
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">₹{totalCollectedFees} collected</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Join Requests</span>
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <UserPlus className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">{teacherPendingRequests.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Pending instructor review</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Study Notes</span>
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{visibleNotes.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Shared with your batches</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900 mt-2">
                        {getCalculatedAttendanceRate(activeStudent.id)}%
                      </p>
                      <p className="text-xs text-emerald-600 mt-1 font-semibold">Consistent class record</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('my-attendance')}
                      className="mt-3 text-xs text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>View Full Attendance Log</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tuition Fee</span>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          activeStudent.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          activeStudent.feeStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {activeStudent.feeStatus}
                        </span>
                        <span className="text-xl font-bold text-slate-800">₹{activeStudent.feeAmount}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Monthly batch subscription</p>
                    </div>
                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
                      <button 
                        onClick={() => setShowQRModal(activeStudent)}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay via QR</span>
                      </button>
                      <button 
                        onClick={() => printFeeReceipt(activeStudent)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Quizzes Attempted</span>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900 mt-2">
                        {studentPersonalScores.length}
                      </p>
                      <p className="text-xs text-purple-600 mt-1 font-medium">Evaluated quizzes</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('my-progress')}
                      className="mt-3 text-xs text-purple-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>View My Scores & Progress</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TEACHER PAYMENT SETTINGS SECTION */}
              {currentRole === 'teacher' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-base">Payment Settings</h3>
                          {activeTeacher.upiId ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active UPI Receiver
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Not Configured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Set your official UPI Virtual Payment Address (VPA) to receive direct fee payments via dynamic QR code
                        </p>
                      </div>
                    </div>

                    {!isEditingUpi && (
                      <div className="flex items-center gap-2">
                        {activeTeacher.upiId && (
                          <button
                            type="button"
                            onClick={() => setShowTeacherQrPreview(!showTeacherQrPreview)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            <span>{showTeacherQrPreview ? 'Hide QR Preview' : 'Preview Fee QR'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherUpiInput(activeTeacher.upiId || '');
                            setUpiSaveError('');
                            setUpiSaveSuccess('');
                            setIsEditingUpi(true);
                          }}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{activeTeacher.upiId ? 'Edit UPI ID' : 'Configure UPI ID'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FEEDBACK BANNERS */}
                  {upiSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{upiSaveSuccess}</span>
                      </div>
                      <button onClick={() => setUpiSaveSuccess('')} className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {upiSaveError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{upiSaveError}</span>
                      </div>
                      <button onClick={() => setUpiSaveError('')} className="text-rose-700 hover:text-rose-900 text-xs cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* EDIT FORM VS DISPLAY VIEW */}
                  {isEditingUpi ? (
                    <form onSubmit={handleSaveTeacherUpi} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Teacher UPI ID / Virtual Payment Address (VPA) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            autoFocus
                            value={teacherUpiInput}
                            onChange={(e) => {
                              setTeacherUpiInput(e.target.value);
                              setUpiSaveError('');
                            }}
                            placeholder="e.g. sharma@oksbi or 9876543210@paytm"
                            className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          />
                          <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">
                            VPA
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-1">
                          <span>Supported handles:</span>
                          <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">@oksbi</span>
                          <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">@okhdfcbank</span>
                          <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">@okaxis</span>
                          <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">@paytm</span>
                          <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">@upi</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingUpi(false);
                            setUpiSaveError('');
                          }}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingUpi}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingUpi ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Registered Payment Address
                          </span>
                          {activeTeacher.upiId ? (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-base font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm">
                                {activeTeacher.upiId}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(activeTeacher.upiId!);
                                  showToast(`Copied UPI ID "${activeTeacher.upiId}" to clipboard!`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                title="Copy UPI ID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-xs text-amber-700 font-semibold italic">
                                Teacher has not configured UPI payments yet.
                              </span>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Click "Configure UPI ID" above to set up direct digital fee collection.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Settlement Mode
                          </span>
                          <span className="text-xs font-bold text-emerald-700 flex items-center sm:justify-end gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Direct Bank Transfer
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-indigo-900 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Zero Platform Fee
                        </span>
                        <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                          Student fees settle instantly into your linked bank account with 0% gateway commission.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LIVE QR PREVIEW TOGGLE */}
                  {showTeacherQrPreview && activeTeacher.upiId && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                          Live QR Code Preview
                        </span>
                        <h4 className="text-sm font-bold text-white">Sample ₹2,500 Dynamic Payment QR</h4>
                        <p className="text-xs text-slate-400 max-w-md">
                          This is how your students see and scan your fee QR code on their phones. Scanning resolves to <strong className="text-emerald-300 font-mono">{activeTeacher.upiId}</strong>.
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-700 shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=${activeTeacher.upiId}&pn=${encodeURIComponent(activeTeacher.name)}&am=2500&cu=INR`)}`}
                          alt="Teacher QR Preview"
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DASHBOARD PREVIEW PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* RECENT NOTES */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Recent Study Materials</h3>
                        <p className="text-xs text-slate-400">Handouts and revision summaries</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('notes')} 
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View All ({visibleNotes.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {visibleNotes.slice(0, 3).map(n => (
                        <div key={n.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between">
                          <div className="min-w-0 pr-3">
                            <p className="font-semibold text-slate-800 text-sm truncate">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.subject} • {n.batch}</p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => setViewingNote(n)}
                              className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Read</span>
                            </button>
                            <button
                              onClick={() => handleDownloadNote(n)}
                              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Get</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {visibleNotes.length === 0 && (
                        <p className="text-xs text-slate-400 py-4 text-center">No study materials available yet.</p>
                      )}
                    </div>
                  </div>

                  {currentRole === 'teacher' && (
                    <button
                      onClick={() => setShowAddNoteModal(true)}
                      className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload New Study Note</span>
                    </button>
                  )}
                </div>

                {/* AVAILABLE TESTS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Active Quizzes & Tests</h3>
                        <p className="text-xs text-slate-400">Timed evaluations with instant grading</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('tests')} 
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View All ({visibleTests.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {visibleTests.slice(0, 3).map(t => {
                        const studentScore = scores.find(sc => sc.testId === t.id && sc.studentId === currentStudentId);
                        return (
                          <div key={t.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between">
                            <div className="min-w-0 pr-3">
                              <p className="font-semibold text-slate-800 text-sm truncate">{t.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {t.subject} • {t.questions.length} Questions • {t.duration} Mins
                              </p>
                            </div>
                            <div>
                              {currentRole === 'student' ? (
                                studentScore ? (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                    {studentScore.score}/{studentScore.totalMarks} Marks
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleStartTest(t)}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-colors"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>Attempt</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-lg">
                                  {t.totalMarks} Marks
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {visibleTests.length === 0 && (
                        <p className="text-xs text-slate-400 py-4 text-center">No quizzes created yet.</p>
                      )}
                    </div>
                  </div>

                  {currentRole === 'teacher' && (
                    <button
                      onClick={() => setShowCreateTestModal(true)}
                      className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Quiz</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MENTOR SHOWCASE HIGHLIGHT BANNER */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                      Faculty & Mentors
                    </span>
                    <span className="text-xs text-indigo-200">Verified Academic Experts</span>
                  </div>
                  <h3 className="text-lg font-bold">Explore Our Mentor Directory</h3>
                  <p className="text-xs text-indigo-100/80 max-w-xl">
                    Discover subject matter specialists, review qualifications, track records, and student ratings. Request batch callbacks or send secure in-app inquiries with zero exposure of personal contact details.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('mentors')}
                  className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>View All Mentors</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STUDENT DIRECTORY TAB (TEACHER ONLY) */}
          {activeTab === 'students' && currentRole === 'teacher' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
                  <p className="text-xs text-slate-500">
                    Enrolled students under {activeTeacher.name} ({teacherStudents.length} total)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowBatchRequestsModal(true)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-amber-600" />
                    <span>Join Requests ({teacherPendingRequests.length})</span>
                  </button>
                  <button 
                    onClick={() => { setEditingStudent(null); setShowAddStudentModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, roll no, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedBatchFilter}
                    onChange={(e) => setSelectedBatchFilter(e.target.value)}
                    className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ALL">All Batches</option>
                    {teacherBatchNames.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedFeeFilter}
                    onChange={(e) => setSelectedFeeFilter(e.target.value)}
                    className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ALL">All Fee Statuses</option>
                    <option value="Paid">Paid Only</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Overdue">Overdue Only</option>
                  </select>
                </div>
              </div>

              {/* STUDENTS TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/80">
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Batch</th>
                      <th className="p-3.5">Contact & WhatsApp</th>
                      <th className="p-3.5">Fee Status</th>
                      <th className="p-3.5">Attendance</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredStudents.map(s => {
                      const dynamicAtt = getCalculatedAttendanceRate(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-700">#{s.rollNo}</td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-400">ID: {s.id}</div>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{s.batch}</td>
                          <td className="p-3.5 text-slate-500 text-xs">
                            <div className="text-slate-800 font-medium">{s.phone}</div>
                            {s.parentPhone && (
                              <div className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>Parent: {s.parentPhone}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              s.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              s.feeStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {s.feeStatus} (₹{s.feeAmount})
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${
                                dynamicAtt >= 90 ? 'text-emerald-600' : dynamicAtt >= 75 ? 'text-indigo-600' : 'text-rose-600'
                              }`}>
                                {dynamicAtt}%
                              </span>
                              <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    dynamicAtt >= 90 ? 'bg-emerald-500' : dynamicAtt >= 75 ? 'bg-indigo-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, dynamicAtt)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => sendWhatsAppFeeReminder(s)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex"
                              title="Send WhatsApp Fee Reminder to Parent"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingStudent(s); setShowAddStudentModal(true); }}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                              title="Edit Student"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id, s.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                          No students found matching your search filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DAILY ATTENDANCE TAB (TEACHER ONLY) */}
          {activeTab === 'attendance' && currentRole === 'teacher' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Daily Attendance Register</h2>
                  <p className="text-xs text-slate-500">Record and track present / absent status date-by-date</p>
                </div>
                
                {/* DATE SELECTOR & PRESETS */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Select Date:</span>
                  <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* QUICK BATCH ACTIONS & STATS */}
              {(() => {
                const dayRecords = attendanceRecords[attendanceDate] || {};
                const presentCount = teacherStudents.filter(s => (dayRecords[s.id] || 'Present') === 'Present').length;
                const absentCount = teacherStudents.length - presentCount;
                return (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-4 text-xs font-semibold">
                      <span className="text-slate-600">Date: <strong className="text-slate-800">{attendanceDate}</strong></span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Present: {presentCount}</span>
                      <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Absent: {absentCount}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMarkAllAttendance('Present')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
                      >
                        Mark All Present
                      </button>
                      <button
                        onClick={() => handleMarkAllAttendance('Absent')}
                        className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ATTENDANCE TOGGLE LIST */}
              <div className="space-y-3">
                {teacherStudents.map(s => {
                  const dayRecords = attendanceRecords[attendanceDate] || {};
                  const isPresent = (dayRecords[s.id] || 'Present') === 'Present';
                  const dynamicRate = getCalculatedAttendanceRate(s.id);

                  return (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-all">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            Roll #{s.rollNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {s.batch} • Cumulative Attendance: <span className="font-semibold text-slate-700">{dynamicRate}%</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isPresent && (
                          <button
                            onClick={() => sendWhatsAppAbsenceAlert(s)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                            title="Send WhatsApp Absence Alert to Parent"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span className="hidden sm:inline">Alert Parent</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAttendance(s.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                            isPresent 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300' 
                              : 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-300'
                          }`}
                        >
                          {isPresent ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{isPresent ? 'PRESENT' : 'ABSENT'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEE TRACKING TAB (TEACHER ONLY) */}
          {activeTab === 'fees' && currentRole === 'teacher' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Tuition Fee Ledger</h2>
                <p className="text-xs text-slate-500">Track and update student fee payments, dues, and overdue accounts</p>
              </div>

              {/* FEE SUMMARY BANNER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Paid & Cleared</span>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">₹{totalCollectedFees}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{paidCount} student accounts</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-xs font-bold text-amber-700 uppercase">Pending Collection</span>
                  <p className="text-2xl font-extrabold text-amber-800 mt-1">
                    ₹{teacherStudents.filter(s => s.feeStatus === 'Pending').reduce((a, b) => a + b.feeAmount, 0)}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">{pendingCount} student accounts</p>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-xs font-bold text-rose-700 uppercase">Overdue Critical</span>
                  <p className="text-2xl font-extrabold text-rose-800 mt-1">
                    ₹{teacherStudents.filter(s => s.feeStatus === 'Overdue').reduce((a, b) => a + b.feeAmount, 0)}
                  </p>
                  <p className="text-xs text-rose-600 mt-0.5">{overdueCount} student accounts</p>
                </div>
              </div>

              {/* FEE TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/80">
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Batch</th>
                      <th className="p-3.5">Monthly Fee</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Update Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {teacherStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-400">Roll #{s.rollNo} • {s.phone}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">{s.batch}</td>
                        <td className="p-3.5 font-bold text-slate-800">₹{s.feeAmount}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            s.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            s.feeStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {s.feeStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button 
                            onClick={() => setShowQRModal(s)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1"
                            title="Generate UPI QR Payment Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Pay</span>
                          </button>
                          <button 
                            onClick={() => printFeeReceipt(s)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1"
                            title="Print / Download Official Fee Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          {s.feeStatus !== 'Paid' && (
                            <button 
                              onClick={() => sendWhatsAppFeeReminder(s)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1"
                              title="Send WhatsApp Fee Reminder to Parent"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Remind</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateFee(s.id, 'Paid')}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg shadow-sm"
                          >
                            Paid
                          </button>
                          <button 
                            onClick={() => handleUpdateFee(s.id, 'Pending')}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg shadow-sm"
                          >
                            Pending
                          </button>
                          <button 
                            onClick={() => handleUpdateFee(s.id, 'Overdue')}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-semibold rounded-lg shadow-sm"
                          >
                            Overdue
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MY ATTENDANCE TAB (STUDENT ONLY - STRICT RBAC) */}
          {activeTab === 'my-attendance' && currentRole === 'student' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">My Attendance Register</h2>
                  <p className="text-xs text-slate-500">
                    Personal attendance history for {activeStudent.name} • {activeStudent.batch} (Roll #{activeStudent.rollNo})
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{getCalculatedAttendanceRate(activeStudent.id)}% Overall Rate</span>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Present Sessions</span>
                  <p className="text-3xl font-extrabold text-emerald-900 mt-1">{studentAttendancePresentCount}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Classes attended successfully</p>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Absent Sessions</span>
                  <p className="text-3xl font-extrabold text-rose-900 mt-1">
                    {studentAttendanceLog.length - studentAttendancePresentCount}
                  </p>
                  <p className="text-xs text-rose-600 mt-0.5">Classes missed</p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Recorded Days</span>
                  <p className="text-3xl font-extrabold text-indigo-900 mt-1">{studentAttendanceLog.length}</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Current academic term</p>
                </div>
              </div>

              {/* PERSONAL LOG TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Enrolled Class Batch</th>
                      <th className="p-3.5">Faculty / Center</th>
                      <th className="p-3.5 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {studentAttendanceLog.map(record => (
                      <tr key={record.date} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{record.date}</td>
                        <td className="p-3.5 text-slate-600 font-medium">{activeStudent.batch}</td>
                        <td className="p-3.5 text-slate-500 text-xs">{activeTeacher.name}</td>
                        <td className="p-3.5 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            record.status === 'Present' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {record.status === 'Present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{record.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                    {studentAttendanceLog.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                          No attendance records logged yet for this term.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict RBAC Active: You are viewing solely your personal attendance record. Contact info and attendance data of other students are kept strictly private.</span>
              </div>
            </div>
          )}

          {/* MY FEES & RECEIPTS TAB (STUDENT ONLY - STRICT RBAC) */}
          {activeTab === 'my-fees' && currentRole === 'student' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">My Tuition Fee & Receipts</h2>
                  <p className="text-xs text-slate-500">
                    Monthly subscription, instant UPI QR payment, and digital fee receipts
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeStudent.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  activeStudent.feeStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Status: {activeStudent.feeStatus}
                </span>
              </div>

              {/* TUITION FEE CARD */}
              <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    {activeStudent.batch}
                  </span>
                  <h3 className="text-2xl font-black mt-2 text-white">Monthly Fee: ₹{activeStudent.feeAmount}</h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Instructor: <strong>{activeTeacher.name}</strong> • Phone: {activeTeacher.phone}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    UPI ID: {activeTeacher.upiId ? (
                      <span className="font-mono text-emerald-300 font-bold">{activeTeacher.upiId}</span>
                    ) : (
                      <span className="text-amber-300 italic text-[11px]">Teacher has not configured UPI payments yet</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowQRModal(activeStudent)}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pay Now via UPI QR</span>
                  </button>
                  <button
                    onClick={() => printFeeReceipt(activeStudent)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Receipt</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT INFORMATION GUIDE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Verification Process</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Once you scan the QR code and pay via any UPI app (Google Pay, PhonePe, Paytm, BHIM), please share the transaction reference with your tutor. Your fee status is cleared upon receipt confirmation.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Zero Data Leakage Guarantee</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under strict RBAC, you only see your personal ledger and receipts. Total tuition revenues, center profits, and fee records of other enrolled students are completely inaccessible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STUDY MATERIAL & ATTACHMENTS DESK */}
          {activeTab === 'notes' && (
            <StudyMaterialsManager
              notes={visibleNotes}
              onAddNote={(newNote) => {
                setNotes([newNote, ...notes]);
                showToast(`Study material published: "${newNote.title}"`);
              }}
              onDeleteNote={(noteId) => {
                if (confirm('Delete this study material note?')) {
                  setNotes(notes.filter(n => n.id !== noteId));
                  showToast('Note deleted.');
                }
              }}
              currentRole={currentRole}
              currentTeacherId={currentTeacherId}
              teacherBatchNames={teacherBatchNames}
              activeStudentBatch={activeStudent?.batch}
            />
          )}

          {/* TESTS & QUIZZES TAB */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {/* TAKING A TEST ACTIVE VIEW */}
              {activeTakingTest ? (
                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500 shadow-lg space-y-6">
                  {/* TEST HEADER & COUNTDOWN */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-700 uppercase bg-indigo-100 px-2.5 py-0.5 rounded-md">
                          {activeTakingTest.subject}
                        </span>
                        <span className="text-xs text-slate-500">{activeTakingTest.batch}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeTakingTest.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total Marks: {activeTakingTest.totalMarks} • Passing: {activeTakingTest.passingScore}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm">
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-amber-700">Time Left</p>
                          <p className="text-lg font-mono font-bold leading-none">{formatTime(testTimeRemaining)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  {(() => {
                    const answeredCount = Object.keys(userAnswers).length;
                    const totalQ = activeTakingTest.questions.length;
                    const pct = Math.round((answeredCount / totalQ) * 100);
                    return (
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                          <span>Answered {answeredCount} of {totalQ} questions</span>
                          <span>{pct}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* QUESTIONS LIST */}
                  <div className="space-y-6">
                    {activeTakingTest.questions.map((q, idx) => (
                      <div key={q.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/60 space-y-3">
                        <p className="font-bold text-base text-slate-800">
                          Question {idx + 1}: {q.questionText}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => (
                            <label 
                              key={optIdx} 
                              className={`flex items-center space-x-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                userAnswers[idx] === optIdx 
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-500' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={`q_${q.id}`} 
                                checked={userAnswers[idx] === optIdx}
                                onChange={() => setUserAnswers({ ...userAnswers, [idx]: optIdx })}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SUBMISSION BUTTONS */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <button 
                      onClick={() => {
                        if (confirm('Cancel test attempt? Your answers will not be recorded.')) {
                          setActiveTakingTest(null);
                          setUserAnswers({});
                        }
                      }}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>

                    <button 
                      onClick={handleFinishTest}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit Answers</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* REGULAR TESTS OVERVIEW */
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Online Tests & Quizzes</h2>
                      <p className="text-xs text-slate-500">
                        {currentRole === 'teacher' 
                          ? 'Create and manage subject tests with automatic instant evaluation'
                          : 'Attempt your batch tests, review instantaneous results and analytics'}
                      </p>
                    </div>

                    {currentRole === 'teacher' && (
                      <button 
                        onClick={() => setShowCreateTestModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Quiz</span>
                      </button>
                    )}
                  </div>

                  {/* TESTS CARDS LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleTests.map(t => {
                      const studentScore = scores.find(sc => sc.testId === t.id && sc.studentId === currentStudentId);
                      const submissionsCount = scores.filter(sc => sc.testId === t.id).length;

                      return (
                        <div key={t.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/70 hover:border-indigo-300 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                  {t.subject}
                                </span>
                                <h3 className="font-bold text-slate-800 text-base mt-2">{t.title}</h3>
                              </div>
                              <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                                {t.totalMarks} Marks
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              Batch: {t.batch} • Passing Score: {t.passingScore}/{t.totalMarks}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {t.duration} Mins ({t.questions.length} Questions)
                            </span>

                            {currentRole === 'student' ? (
                              studentScore ? (
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                    studentScore.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {studentScore.score}/{studentScore.totalMarks} ({studentScore.percentage}%)
                                  </span>
                                  <button
                                    onClick={() => handleStartTest(t)}
                                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2.5 py-1 rounded-lg"
                                  >
                                    Retake
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartTest(t)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-colors"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Attempt Test</span>
                                </button>
                              )
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500 font-medium">
                                  {submissionsCount} student attempt(s)
                                </span>
                                <button
                                  onClick={() => handleDeleteTest(t.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Test"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {visibleTests.length === 0 && (
                      <div className="col-span-2 p-12 text-center text-slate-400 text-sm">
                        No tests or quizzes created yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MY PROGRESS TAB (STUDENT ONLY - STRICT RBAC) */}
          {activeTab === 'my-progress' && currentRole === 'student' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">My Academic Progress</h2>
                  <p className="text-xs text-slate-500">
                    Quiz scores, evaluated submissions, and test progression for {activeStudent.name}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Attempt Active Quizzes</span>
                </button>
              </div>

              {/* STATS TILES */}
              {(() => {
                const avgPct = studentPersonalScores.length > 0 
                  ? Math.round(studentPersonalScores.reduce((acc, s) => acc + s.percentage, 0) / studentPersonalScores.length) 
                  : 0;
                const highPct = studentPersonalScores.length > 0 
                  ? Math.max(...studentPersonalScores.map(s => s.percentage)) 
                  : 0;
                const passCount = studentPersonalScores.filter(s => s.status === 'Passed').length;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <span className="text-xs font-bold text-indigo-700 uppercase">My Average Score</span>
                      <p className="text-3xl font-extrabold text-indigo-900 mt-1">{avgPct}%</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Across {studentPersonalScores.length} evaluated quizzes</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-xs font-bold text-emerald-700 uppercase">My Best Score</span>
                      <p className="text-3xl font-extrabold text-emerald-900 mt-1">{highPct}%</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Peak performance achieved</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                      <span className="text-xs font-bold text-purple-700 uppercase">Quizzes Passed</span>
                      <p className="text-3xl font-extrabold text-purple-900 mt-1">
                        {passCount} / {studentPersonalScores.length}
                      </p>
                      <p className="text-xs text-purple-600 mt-0.5">
                        {studentPersonalScores.length > 0 ? Math.round((passCount / studentPersonalScores.length) * 100) : 0}% success rate
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* PERSONAL TEST SCORES TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Quiz / Test Title</th>
                      <th className="p-3.5">Score Obtained</th>
                      <th className="p-3.5">Result</th>
                      <th className="p-3.5 text-right">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {studentPersonalScores.map(sc => (
                      <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{sc.subject}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{sc.testTitle}</td>
                        <td className="p-3.5 font-bold text-indigo-700">{sc.score} / {sc.totalMarks} ({sc.percentage}%)</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            sc.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-400 text-right">{sc.date}</td>
                      </tr>
                    ))}
                    {studentPersonalScores.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                          No quiz attempts recorded yet. Head over to Quizzes & Tests to take your first quiz!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict RBAC Active: You only see your personal score records and evaluations. Class performance matrices and peer scores are isolated.</span>
              </div>
            </div>
          )}

          {/* SCORE ANALYTICS & CHARTS TAB (TEACHER ONLY) */}
          {activeTab === 'analytics' && currentRole === 'teacher' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Performance & Score Analytics</h2>
                <p className="text-xs text-slate-500">
                  Aggregate batch scores and class evaluation trends for {activeTeacher.name}
                </p>
              </div>

              {/* STATS TILES */}
              {(() => {
                const relevantScores = scores.filter(sc => {
                  const test = tests.find(t => t.id === sc.testId);
                  return test && test.teacherId === currentTeacherId;
                });
                
                const avgPct = relevantScores.length > 0 
                  ? Math.round(relevantScores.reduce((acc, s) => acc + s.percentage, 0) / relevantScores.length) 
                  : 0;
                const highPct = relevantScores.length > 0 
                  ? Math.max(...relevantScores.map(s => s.percentage)) 
                  : 0;
                const passCount = relevantScores.filter(s => s.status === 'Passed').length;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <span className="text-xs font-bold text-indigo-700 uppercase">Average Percentage</span>
                      <p className="text-3xl font-extrabold text-indigo-900 mt-1">{avgPct}%</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Across {relevantScores.length} test submissions</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-xs font-bold text-emerald-700 uppercase">Highest Score</span>
                      <p className="text-3xl font-extrabold text-emerald-900 mt-1">{highPct}%</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Peak performance achieved</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                      <span className="text-xs font-bold text-purple-700 uppercase">Pass Rate</span>
                      <p className="text-3xl font-extrabold text-purple-900 mt-1">
                        {relevantScores.length > 0 ? Math.round((passCount / relevantScores.length) * 100) : 0}%
                      </p>
                      <p className="text-xs text-purple-600 mt-0.5">{passCount} passed out of {relevantScores.length}</p>
                    </div>
                  </div>
                );
              })()}

              {/* RECHARTS VISUALIZATION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                    Average Marks per Quiz
                  </p>
                  <div className="h-72 w-full">
                    {analyticsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="testTitle" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Score Obtained" />
                          <Bar dataKey="totalMarks" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Total Marks" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No test scores recorded yet. Attempt a quiz to view visual analytics.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                    Pass vs Needs Review Ratio
                  </p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passFailData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {passFailData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">Based on passing mark threshold</p>
                </div>
              </div>

              {/* SCORE HISTORY TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Test Title</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Result</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {scores.filter(sc => {
                      const test = tests.find(t => t.id === sc.testId);
                      return test && test.teacherId === currentTeacherId;
                    }).map(sc => (
                      <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{sc.studentName}</td>
                        <td className="p-3.5 text-slate-600">{sc.subject}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{sc.testTitle}</td>
                        <td className="p-3.5 font-bold text-indigo-700">{sc.score} / {sc.totalMarks} ({sc.percentage}%)</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            sc.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-400">{sc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENTOR DIRECTORY TAB (SHARED — both roles) */}
          {activeTab === 'mentors' && isTabAuthorized(currentRole, 'mentors') && (
            <MentorShowcase
              teachers={teachers}
              onRequestCallback={(req) => {
                showToast(`Callback request sent to mentor successfully!`);
                console.info('[MentorShowcase] Callback request:', req);
              }}
              onSendMessage={(msg) => {
                showToast(`Message delivered to mentor inbox.`);
                console.info('[MentorShowcase] In-app message:', msg);
              }}
            />
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* STUDENT JOIN BATCH WITH 6-DIGIT CODE MODAL */}
      {showJoinBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Join Batch with Code</h3>
                  <p className="text-xs text-slate-500">Enter the 6-digit code shared by your teacher</p>
                </div>
              </div>
              <button onClick={() => setShowJoinBatchModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentJoinSubmit} className="space-y-4 text-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">6-Digit Batch Join Code</label>
                  <button
                    type="button"
                    onClick={() => setInputJoinCode('849201')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Try Sample: 849201
                  </button>
                </div>
                <input 
                  required 
                  type="text" 
                  maxLength={6}
                  value={inputJoinCode}
                  onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest p-2.5 bg-slate-50 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:outline-none uppercase" 
                  placeholder="849201" 
                />
              </div>

              {/* LIVE DETECTED BATCH CARD */}
              {detectedBatch ? (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Verified Batch Found
                    </span>
                    <span className="text-xs font-bold text-emerald-700">₹{detectedBatch.monthlyFee}/mo</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{detectedBatch.name}</p>
                  <p className="text-xs text-slate-600">
                    Instructor: {teachers.find(t => t.id === detectedBatch.teacherId)?.name} • {detectedBatch.schedule}
                  </p>
                </div>
              ) : inputJoinCode.trim().length >= 4 ? (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No batch found with this code. Check the code provided by your teacher.</span>
                </div>
              ) : null}

              {/* STUDENT CREDENTIALS */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={joinStudentName}
                    onChange={(e) => setJoinStudentName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="e.g. Vikram Malhotra" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                    <input 
                      required 
                      type="text" 
                      value={joinStudentPhone}
                      onChange={(e) => setJoinStudentPhone(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs" 
                      placeholder="+91 98765 00000" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent WhatsApp</label>
                    <input 
                      type="text" 
                      value={joinParentPhone}
                      onChange={(e) => setJoinParentPhone(e.target.value)}
                      className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs" 
                      placeholder="+91 98765 00001 (Optional)" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll / Ref No (Optional)</label>
                  <input 
                    type="text" 
                    value={joinStudentRoll}
                    onChange={(e) => setJoinStudentRoll(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs" 
                    placeholder="e.g. 107" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowJoinBatchModal(false)} 
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!detectedBatch}
                  className={`px-5 py-2 rounded-xl font-bold shadow-sm flex items-center space-x-1.5 ${
                    detectedBatch 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Send Join Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER REVIEW BATCH JOIN REQUESTS MODAL */}
      {showBatchRequestsModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Batch Join Requests</h3>
                  <p className="text-xs text-slate-500">Students who submitted your 6-digit batch join code</p>
                </div>
              </div>
              <button onClick={() => setShowBatchRequestsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* REQUESTS LIST */}
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {joinRequests.filter(r => r.teacherId === currentTeacherId).map(req => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    req.status === 'Pending' 
                      ? 'bg-amber-50/60 border-amber-200' 
                      : req.status === 'Approved'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900 text-base">{req.studentName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Applying for: <strong className="text-slate-800">{req.batchName}</strong> • Roll: #{req.rollNo}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phone: {req.studentPhone} • Requested: {req.requestedAt}
                    </p>
                  </div>

                  {req.status === 'Pending' ? (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleRejectJoinRequest(req.id)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveJoinRequest(req)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Enroll</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-500">
                      {req.status === 'Approved' ? 'Enrolled in Student Directory' : 'Application Declined'}
                    </div>
                  )}
                </div>
              ))}

              {joinRequests.filter(r => r.teacherId === currentTeacherId).length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No student join requests received yet. Share your 6-digit code with students to invite them.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button 
                onClick={() => setShowBatchRequestsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER CREATE NEW BATCH MODAL */}
      {showCreateBatchModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create New Tuition Batch</h3>
                  <p className="text-xs text-slate-500">Auto-generates a unique 6-digit student join code</p>
                </div>
              </div>
              <button onClick={() => setShowCreateBatchModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name</label>
                <input 
                  required 
                  name="name" 
                  type="text" 
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="e.g. Class 11 - Advanced Physics" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
                <input 
                  required 
                  name="subject" 
                  type="text" 
                  defaultValue={activeTeacher.subject}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input 
                    required 
                    name="monthlyFee" 
                    type="number" 
                    defaultValue="2500"
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Schedule</label>
                  <input 
                    required 
                    name="schedule" 
                    type="text" 
                    defaultValue="Mon, Wed, Fri (5:00 PM)"
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                <span>Upon creation, a fresh 6-digit numeric join code will be generated for your students to enter.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowCreateBatchModal(false)} 
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Generate Batch & Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE SECURITY PIN MODAL */}
      {showChangePinModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Security PIN</h3>
                  <p className="text-xs text-slate-500">{activeTeacher.name}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowChangePinModal(false); setChangePinError(''); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current 4-Digit PIN</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={changePinCurrent}
                  onChange={(e) => { setChangePinCurrent(e.target.value.replace(/\D/g, '')); setChangePinError(''); }}
                  placeholder="••••"
                  className="w-full p-2.5 border rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New 4-Digit PIN</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={changePinNew}
                  onChange={(e) => { setChangePinNew(e.target.value.replace(/\D/g, '')); setChangePinError(''); }}
                  placeholder="••••"
                  className="w-full p-2.5 border rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New PIN</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={changePinConfirm}
                  onChange={(e) => { setChangePinConfirm(e.target.value.replace(/\D/g, '')); setChangePinError(''); }}
                  placeholder="••••"
                  className="w-full p-2.5 border rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {changePinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{changePinError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => { setShowChangePinModal(false); setChangePinError(''); }}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW TEACHER ACCOUNT MODAL */}
      {showRegisterTeacherModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Tuition Teacher Account</h3>
                  <p className="text-xs text-slate-500">Register your independent coaching center</p>
                </div>
              </div>
              <button onClick={() => setShowRegisterTeacherModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTeacherSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher / Institute Name</label>
                <input required name="name" type="text" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Prof. R. K. Gupta" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
                <input required name="subject" type="text" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Mathematics & Computer Science" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input required name="email" type="email" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="teacher@gmail.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input required name="phone" type="text" className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="+91 98000 00000" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Secret 4-Digit PIN</label>
                <input 
                  required 
                  name="pin" 
                  type="password" 
                  maxLength={4} 
                  pattern="\d{4}" 
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="e.g. 1234" 
                />
                <p className="text-xs text-slate-400 mt-1">Students cannot access your workspace without this PIN.</p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                <span>Creating an account generates an isolated tuition workspace. Other teachers cannot view your students, attendance, or fees.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowRegisterTeacherModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm">
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {showAddStudentModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button 
                onClick={() => { setShowAddStudentModal(false); setEditingStudent(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                <input 
                  required 
                  name="name" 
                  type="text" 
                  defaultValue={editingStudent?.name || ''}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="e.g. Rahul Sharma" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
                  <input 
                    required 
                    name="rollNo" 
                    type="text" 
                    defaultValue={editingStudent?.rollNo || ''}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="e.g. 105" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch</label>
                  <input 
                    required 
                    name="batch" 
                    type="text" 
                    defaultValue={editingStudent?.batch || (teacherBatchesList[0]?.name || 'Foundation Batch')}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="e.g. Class 10 - Batch A" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Phone</label>
                  <input 
                    required 
                    name="phone" 
                    type="text" 
                    defaultValue={editingStudent?.phone || ''}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="+91 99999 00000" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent WhatsApp (Alerts)</label>
                  <input 
                    name="parentPhone" 
                    type="text" 
                    defaultValue={editingStudent?.parentPhone || ''}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="+91 99999 00001 (Optional)" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                <input 
                  required 
                  name="feeAmount" 
                  type="number" 
                  defaultValue={editingStudent?.feeAmount || 2500}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Fee Status</label>
                <select 
                  name="feeStatus" 
                  defaultValue={editingStudent?.feeStatus || 'Paid'}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => { setShowAddStudentModal(false); setEditingStudent(null); }} 
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD STUDY NOTE MODAL */}
      {showAddNoteModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Upload Study Material & Note</h3>
              <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input 
                  required 
                  name="title" 
                  type="text" 
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="e.g. Thermodynamics Quick Revision Formulae" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input 
                    required 
                    name="subject" 
                    type="text" 
                    defaultValue={activeTeacher.subject ? activeTeacher.subject.split('&')[0].trim() : 'General'}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="e.g. Physics" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Batch</label>
                  <input 
                    required 
                    name="batch" 
                    type="text" 
                    defaultValue={teacherBatchesList[0]?.name || 'All Batches'}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="e.g. Class 10 - Batch A" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note Content / Notes Body</label>
                <textarea 
                  required 
                  name="content" 
                  rows={4} 
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs leading-relaxed" 
                  placeholder="Paste or write detailed summary, formulas, principles, or notes here..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddNoteModal(false)} 
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW NOTE POPUP MODAL */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">{viewingNote.subject} • {viewingNote.batch}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{viewingNote.title}</h3>
              </div>
              <button onClick={() => setViewingNote(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{viewingNote.content}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-slate-400">Date shared: {viewingNote.date}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleDownloadNote(viewingNote)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TEST MODAL (TEACHER) */}
      {showCreateTestModal && currentRole === 'teacher' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Quiz / Exam</h3>
                <p className="text-xs text-slate-500">Design multiple-choice evaluation with automatic evaluation</p>
              </div>
              <button onClick={() => setShowCreateTestModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title</label>
                  <input 
                    required 
                    type="text" 
                    value={newTestTitle}
                    onChange={(e) => setNewTestTitle(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="e.g. Periodic Table & Bonding Quiz" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input 
                    required 
                    type="text" 
                    value={newTestSubject}
                    onChange={(e) => setNewTestSubject(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch</label>
                  <input 
                    required 
                    type="text" 
                    value={newTestBatch}
                    onChange={(e) => setNewTestBatch(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input 
                    required 
                    type="number" 
                    min={5}
                    value={newTestDuration}
                    onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                  <input 
                    required 
                    type="number" 
                    min={5}
                    value={newTestTotalMarks}
                    onChange={(e) => setNewTestTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              {/* QUESTIONS BUILDER */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                    Questions List ({newTestQuestions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                  {newTestQuestions.map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-600">Question #{qIdx + 1}</span>
                        {newTestQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionField(qIdx)}
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Enter question statement..."
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...newTestQuestions];
                          updated[qIdx].questionText = e.target.value;
                          setNewTestQuestions(updated);
                        }}
                        className="w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-1.5 bg-white p-1.5 rounded-lg border">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => {
                                const updated = [...newTestQuestions];
                                updated[qIdx].correctAnswer = optIdx;
                                setNewTestQuestions(updated);
                              }}
                              className="w-3.5 h-3.5 text-indigo-600"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...newTestQuestions];
                                updated[qIdx].options[optIdx] = e.target.value;
                                setNewTestQuestions(updated);
                              }}
                              className="w-full text-xs focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">Select the radio button next to the correct answer option.</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowCreateTestModal(false)} 
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST RESULT SUMMARY DIALOG (STUDENT) */}
      {testCompletedResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                testCompletedResult.status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {testCompletedResult.status === 'Passed' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {testCompletedResult.status === 'Passed' ? 'Congratulations! Passed!' : 'Test Completed - Needs Review'}
              </h3>
              <p className="text-xs text-slate-500">{testCompletedResult.test.title}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Score</p>
                <p className="text-xl font-bold text-slate-800">
                  {testCompletedResult.score} / {testCompletedResult.totalMarks}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Percentage</p>
                <p className="text-xl font-bold text-indigo-600">{testCompletedResult.percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Threshold</p>
                <p className="text-xl font-bold text-slate-800">{testCompletedResult.test.passingScore} Marks</p>
              </div>
            </div>

            {/* QUESTION REVIEW ACCORDION */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
              {testCompletedResult.test.questions.map((q, idx) => {
                const userChoice = testCompletedResult.answers[idx];
                const isCorrect = userChoice === q.correctAnswer;
                return (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1">
                    <p className="font-semibold text-slate-800">{idx + 1}. {q.questionText}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        Your Choice: {userChoice !== undefined ? q.options[userChoice] : 'Unanswered'}
                      </span>
                      {!isCorrect && (
                        <span className="text-slate-500">Correct: <strong>{q.options[q.correctAnswer]}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => {
                  setTestCompletedResult(null);
                  setActiveTab(currentRole === 'student' ? 'my-progress' : 'analytics');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {currentRole === 'student' ? 'View My Progress' : 'Go to Analytics'}
              </button>
              <button
                onClick={() => setTestCompletedResult(null)}
                className="px-4 py-2 border rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR PAYMENT MODAL */}
      {showQRModal && (() => {
        // Strictly resolve teacher by student's teacherId to prevent cross-teacher payment mismatch
        const studentTeacher = teachers.find(t => t.id === showQRModal.teacherId) || activeTeacher;
        const teacherUpiId = (studentTeacher?.upiId || '').trim();
        const hasConfiguredUpi = Boolean(teacherUpiId);
        const upiPaymentUri = hasConfiguredUpi
          ? `upi://pay?pa=${teacherUpiId}&pn=${encodeURIComponent(studentTeacher.name)}&am=${showQRModal.feeAmount}&cu=INR&tn=${encodeURIComponent(`Tuition Fee - ${showQRModal.name}`)}`
          : '';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 text-center animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">UPI Instant Payment</h3>
                    <p className="text-[11px] text-slate-500">Scan to pay tuition fee</p>
                  </div>
                </div>
                <button onClick={() => setShowQRModal(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">{studentTeacher.name}</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">₹{showQRModal.feeAmount}</p>
                  <p className="text-xs text-slate-500">Student: <strong>{showQRModal.name}</strong> • {showQRModal.batch}</p>
                </div>

                {hasConfiguredUpi ? (
                  <>
                    {/* DYNAMIC QR CODE DISPLAY */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-inner inline-block">
                      <div className="w-44 h-44 mx-auto rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-white">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(upiPaymentUri)}`}
                          alt={`UPI QR for ${teacherUpiId}`}
                          className="w-44 h-44 object-contain rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = document.getElementById('qr-modal-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div id="qr-modal-fallback" style={{ display: 'none' }} className="w-44 h-44 bg-slate-950 p-2 rounded-lg flex-col items-center justify-center relative overflow-hidden">
                          <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-90">
                            {Array.from({ length: 36 }).map((_, i) => (
                              <div key={i} className={`rounded-sm ${(i % 7 === 0 || i % 5 === 0 || i < 7 || i > 28) ? 'bg-white' : (i % 2 === 0 ? 'bg-indigo-400' : 'bg-slate-900')}`}></div>
                            ))}
                          </div>
                          <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center border border-slate-200">
                            <span className="text-[10px] font-black text-indigo-600">UPI</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* UPI ID PILL */}
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">UPI ID:</span>
                      <span className="font-mono font-bold text-indigo-700 truncate max-w-[170px]" title={teacherUpiId}>
                        {teacherUpiId}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(teacherUpiId);
                          showToast(`Copied UPI ID "${teacherUpiId}" to clipboard!`);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer shrink-0"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* UNCONFIGURED UPI WARNING MESSAGE */
                  <div className="py-5 px-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2">
                    <div className="w-9 h-9 bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-amber-800 text-xs sm:text-sm">
                      Teacher has not configured UPI payments yet
                    </h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Your instructor ({studentTeacher.name}) has not set up their UPI payment ID. Please contact your instructor to configure digital payments, or settle your fee offline.
                    </p>
                  </div>
                )}
              </div>

              {hasConfiguredUpi && (
                <div className="text-[11px] text-slate-400 flex items-center justify-center space-x-2">
                  <span>Supports GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {hasConfiguredUpi && (
                  <a
                    href={upiPaymentUri}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Open in UPI App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {showQRModal.feeStatus !== 'Paid' && (
                  <button
                    onClick={() => {
                      handleUpdateFee(showQRModal.id, 'Paid');
                      setShowQRModal(null);
                      showToast(`Payment of ₹${showQRModal.feeAmount} confirmed! Receipt generated.`);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentRole === 'student' ? 'Confirm Payment & Generate Receipt' : 'Mark as Paid Directly'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* PUBLIC ADMISSIONS MICROSITE & DEMO SHOWCASE MODAL */}
      {showLandingPageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`bg-white rounded-3xl shadow-2xl ${landingPageTab === 'DEMO_CENTERS' ? 'max-w-6xl' : 'max-w-2xl'} w-full p-6 sm:p-8 space-y-6 border border-slate-200 my-8 transition-all duration-300`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Public Tuition Admissions & Showcase</h3>
                  <p className="text-xs text-slate-500">Live preview of student admissions landing page & demo tuition network</p>
                </div>
              </div>

              {/* TAB TOGGLE: MICROSITE vs DEMO CENTERS */}
              <div className="flex items-center space-x-2">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setLandingPageTab('MICROSITE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      landingPageTab === 'MICROSITE'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Center Microsite
                  </button>
                  <button
                    type="button"
                    onClick={() => setLandingPageTab('DEMO_CENTERS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      landingPageTab === 'DEMO_CENTERS'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Demo Tuition Centers & Tools
                  </button>
                </div>
                <button onClick={() => setShowLandingPageModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: TEACHER'S OWN MICROSITE PREVIEW */}
            {landingPageTab === 'MICROSITE' ? (
              <>
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/30 font-semibold">
                        Admissions Open • 2026-2027 Academic Year
                      </span>
                      <h2 className="text-2xl font-black mt-2 text-white">{activeTeacher.name}</h2>
                      <p className="text-indigo-200 text-sm">{activeTeacher.subject}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        📍 {activeTeacher.location || 'Main Center, Sector 14, City Park'} • 📞 {activeTeacher.phone}
                      </p>
                    </div>
                  </div>

                  {/* HEADLINE CALLOUT */}
                  <div className="p-4 bg-white/10 rounded-xl border border-white/15">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">🏆 Track Record & Results</p>
                    <p className="text-sm font-semibold text-white mt-1">
                      "{activeTeacher.resultsHeadline || '98% Students Scored Above 90% in 2026 Board Exams!'}"
                    </p>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {activeTeacher.bio || '15+ Years experience preparing students for Board exams and competitive entrance tests.'}
                    </p>
                  </div>

                  {/* ACTIVE BATCHES WITH JOIN CODES */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available Batches & Join Codes</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teacherBatchesList.map(b => (
                        <div key={b.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-white">{b.name}</p>
                            <p className="text-xs text-slate-400">{b.schedule} • ₹{b.monthlyFee}/mo</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Join Code</span>
                            <span className="font-mono text-emerald-400 font-extrabold text-base">{b.joinCode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Share this link with parents to let them review credentials and join batches.
                  </span>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setShowLandingPageModal(false);
                        setActiveTab('mentors');
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Mentor Showcase</span>
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?tuition=${activeTeacher.id}`;
                        navigator.clipboard?.writeText(url);
                        showToast('Public Admissions Microsite link copied!');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        const message = encodeURIComponent(
                          `Admissions Open at ${activeTeacher.name} for ${activeTeacher.subject}! Join active batches directly with join codes. Contact: ${activeTeacher.phone}.`
                        );
                        window.open(`https://wa.me/?text=${message}`, '_blank');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* TAB 2: SELECTED TUITION CENTERS & GENERAL PLATFORM FEATURES DEMO */
              <div className="max-h-[75vh] overflow-y-auto pr-1">
                <DemoTuitionCenters
                  onBatchJoinClick={() => {
                    setShowLandingPageModal(false);
                    setShowJoinBatchModal(true);
                  }}
                  onExploreMore={() => {
                    setShowLandingPageModal(false);
                    setActiveTab('mentors');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE WORKSPACE EXPORT MODAL (JSON, EXCEL, CSV) */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataset={exportDataset}
        currentUser={currentUser}
        onToast={showToast}
      />

    </div>
  );
}
