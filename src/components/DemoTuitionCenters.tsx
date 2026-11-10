import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Clock, 
  Award, 
  BookOpen, 
  KeyRound, 
  QrCode, 
  MessageCircle, 
  Sparkles, 
  ChevronRight, 
  X, 
  Bell, 
  ArrowRight, 
  FileText, 
  Check, 
  Layers, 
  Users,
  Send,
  Building2,
  Info
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES (STRICT CLIENT-SIDE HARDCODED DATA ONLY)
// ============================================================================

export interface DemoMentor {
  id: string;
  name: string;
  specialization: string;
  experienceLevel: string;
  centerName: string;
  rating: number;
  reviewCount: number;
  badge: string;
  subjectsOffered: string[];
  keyServices: string[];
  avatarGradient: string;
  bioSummary: string;
  sampleBatches: {
    batchName: string;
    schedule: string;
    monthlyFee: number;
    seatsLeft: number;
  }[];
}

export interface PlatformFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  bullets: string[];
}

export interface DemoTuitionCentersProps {
  onBatchJoinClick?: () => void;
  onExploreMore?: () => void;
  standalone?: boolean;
}

// ============================================================================
// HARDCODED CLIENT-SIDE DEMO DATA (ZERO DATABASE / ZERO PII EXPOSURE)
// ============================================================================

const DEMO_MENTORS: DemoMentor[] = [
  {
    id: 'demo_sharma',
    name: 'Prof. Rajesh Sharma',
    specialization: 'Senior Physics & Mathematics Specialist',
    experienceLevel: '15+ Years Board & Competitive Coaching',
    centerName: 'Apex Science & Mathematics Academy',
    rating: 4.9,
    reviewCount: 128,
    badge: 'Verified Demo Profile',
    bioSummary: 'Gold Medalist with 15+ years experience mentoring secondary and senior secondary students for CBSE Board excellence and competitive engineering foundations.',
    subjectsOffered: [
      'Class 10 CBSE Math & Science',
      'Class 12 Advanced Physics',
      'IIT-JEE Mathematics Foundation',
      'Board Exam Revision Intensive'
    ],
    keyServices: [
      'Weekly diagnostic test series & relative percentile ranking',
      'Daily 1-on-1 personalized doubt clearing clinics',
      'Formula mind-maps and curated chapter-wise problem sets',
      'Structured parent progress briefings every month'
    ],
    avatarGradient: 'from-indigo-600 via-indigo-700 to-purple-800',
    sampleBatches: [
      { batchName: 'Class 10 Board Accelerator', schedule: 'Mon, Wed, Fri · 5:00 PM - 6:30 PM', monthlyFee: 2500, seatsLeft: 4 },
      { batchName: 'Class 12 Advanced Physics Core', schedule: 'Tue, Thu, Sat · 6:00 PM - 7:30 PM', monthlyFee: 3000, seatsLeft: 2 }
    ]
  },
  {
    id: 'demo_verma',
    name: 'Ms. Anita Verma',
    specialization: 'Chemistry & Biology Specialist',
    experienceLevel: '12+ Years NEET & CBSE Preparation',
    centerName: 'BioChem Excellence Learning Hub',
    rating: 4.8,
    reviewCount: 96,
    badge: 'Verified Demo Profile',
    bioSummary: 'Ex-College Lecturer specializing in NEET medical entrance preparation, cellular genetics, organic synthesis mechanisms, and CBSE senior board curricula.',
    subjectsOffered: [
      'Class 11 & 12 Organic Chemistry',
      'NEET Cell Biology & Genetics',
      'Class 10 Board Science Mastery',
      'Practical & Diagrammatic Biology'
    ],
    keyServices: [
      'High-yield NEET diagrammatic flashcards & revision sheets',
      'Chapter-wise speed quizzes with instantaneous score evaluation',
      'Customized organic reaction mechanism walkthroughs',
      'Dedicated doubt clearing desk with solved audio-visual guides'
    ],
    avatarGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    sampleBatches: [
      { batchName: 'NEET 2027 Medical Sprint', schedule: 'Mon, Thu, Sat · 4:00 PM - 5:30 PM', monthlyFee: 2800, seatsLeft: 5 },
      { batchName: 'Class 11 Foundation Chemistry', schedule: 'Tue, Fri, Sun · 5:30 PM - 7:00 PM', monthlyFee: 2600, seatsLeft: 3 }
    ]
  },
  {
    id: 'demo_aditya',
    name: 'Er. Vikram Aditya',
    specialization: 'Applied Computer Science & Foundation Mathematics',
    experienceLevel: '9+ Years STEM & Board Curriculum',
    centerName: 'Code & Logic Secondary Academy',
    rating: 4.9,
    reviewCount: 84,
    badge: 'Verified Demo Profile',
    bioSummary: 'Software Engineer turned educator specializing in CBSE Class 11-12 Computer Science (Python), analytical problem solving, and secondary school foundation mathematics.',
    subjectsOffered: [
      'CBSE Class 11-12 Computer Science (Python)',
      'Data Structures & Algorithm Basics',
      'Class 9 & 10 Secondary Mathematics',
      'Practical Project Labs & Viva Preparation'
    ],
    keyServices: [
      'Line-by-line Python code reviews & hands-on logic debugging',
      'Weekly timed problem solving competitions with automated scorecards',
      'Comprehensive digital code repositories and cheat-sheets',
      'Annual board exam practical simulation masterclasses'
    ],
    avatarGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    sampleBatches: [
      { batchName: 'Class 12 Python & CS Boards', schedule: 'Mon, Wed, Fri · 6:30 PM - 8:00 PM', monthlyFee: 3200, seatsLeft: 6 },
      { batchName: 'Middle School Math Olympiad', schedule: 'Sat, Sun · 10:00 AM - 11:30 AM', monthlyFee: 2400, seatsLeft: 7 }
    ]
  }
];

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: 'feat_join',
    title: '6-Digit Secure Batch Join',
    subtitle: 'Zero-Friction Student Access',
    description: 'Students enroll into authorized classes using a unique 6-digit cryptographic join code provided by their instructor. Eliminates unauthorized access while strictly isolating student cohorts and records.',
    icon: KeyRound,
    tag: 'Strict Data Isolation',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-700',
    iconColor: 'text-indigo-600',
    bullets: [
      'Instant authorization without complex password setups',
      'Isolated access to student-specific batch notes & quizzes',
      'Zero exposure to peer contacts, rolls, or fee ledgers'
    ]
  },
  {
    id: 'feat_repo',
    title: 'Digital Study Repository',
    subtitle: 'Dual-Format Learning Assets',
    description: 'Instructors share rich formatted text lecture summaries and upload local files (PDFs, DOCX, worksheets, images up to 10MB). Students preview files directly in-browser with single-click offline download support.',
    icon: BookOpen,
    tag: 'In-Browser File Preview',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    bullets: [
      'Drag-and-drop file upload with 10MB size validation',
      'Searchable study grid filtered strictly by active batch',
      'Embedded PDF / Image preview modal with 1-click download'
    ]
  },
  {
    id: 'feat_upi',
    title: 'Instant Dynamic UPI QR Fee Receipts',
    subtitle: 'Zero-Commission Settlement',
    description: 'Generate dynamic Bharat-UPI payment QR codes tailored to exact monthly student dues. Instant payment confirmation generates automated, tamper-evident digital receipts with detailed student ledger entries.',
    icon: QrCode,
    tag: 'Automated Digital Receipts',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    bullets: [
      'Instant QR generation with embedded tuition UPI handles',
      'Automated receipt PDF generation with transaction ID',
      'Real-time student fee ledger balance updates'
    ]
  },
  {
    id: 'feat_whatsapp',
    title: 'Automated WhatsApp Class Updates',
    subtitle: 'Seamless Guardian Communication',
    description: 'Send scheduled homework summaries, class test scorecards, attendance alerts, and fee due reminders directly to parents via WhatsApp templates without exposing personal instructor mobile numbers.',
    icon: MessageCircle,
    tag: 'Shielded Messaging',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    bullets: [
      'Automated batch announcements & test reminders',
      'Instant quiz scorecard sharing to parent phone',
      'Strict communication gateway preserving educator privacy'
    ]
  }
];

// ============================================================================
// MAIN COMPONENT: Selected Tuition Centers & Mentors Section
// ============================================================================

export default function DemoTuitionCenters({
  onBatchJoinClick,
  onExploreMore,
  standalone = false
}: DemoTuitionCentersProps) {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [activeMentorModal, setActiveMentorModal] = useState<DemoMentor | null>(null);
  const [inquiryMentor, setInquiryMentor] = useState<DemoMentor | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredMentors = useMemo(() => {
    if (selectedSubjectFilter === 'ALL') return DEMO_MENTORS;
    if (selectedSubjectFilter === 'MATH_PHYSICS') {
      return DEMO_MENTORS.filter(m => m.id === 'demo_sharma');
    }
    if (selectedSubjectFilter === 'CHEM_BIO') {
      return DEMO_MENTORS.filter(m => m.id === 'demo_verma');
    }
    if (selectedSubjectFilter === 'CS_STEM') {
      return DEMO_MENTORS.filter(m => m.id === 'demo_aditya');
    }
    return DEMO_MENTORS;
  }, [selectedSubjectFilter]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryMentor(null);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
      showToast('Demo inquiry dispatched! A batch coordinator will contact you shortly.');
    }, 1200);
  };

  return (
    <section className={`w-full bg-slate-50 text-slate-900 ${standalone ? 'min-h-screen py-12 px-4 sm:px-6 lg:px-8' : 'py-8 px-4 sm:px-6'}`}>
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ----------------------------------------------------------------- */}
        {/* PRIVACY GUARANTEE BANNER */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Privacy Safeguard Active
                </span>
                <span className="text-xs font-medium text-emerald-700 hidden md:inline">Client-Side Demo Sandbox</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">
                Zero personal contact numbers, residential addresses, or private emails are exposed. All instructor cards below showcase sample teaching credentials for public preview.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
              <Check className="w-3.5 h-3.5" />
              <span>100% PII Protected</span>
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* HEADER: SECTION TITLE & SUBJECT FILTER TABS */}
        {/* ----------------------------------------------------------------- */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curated Academic Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Selected Tuition Centers & Mentors
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Connect with seasoned educators specializing in secondary and senior secondary board exam prep, NEET medical foundations, and competitive STEM mastery.
          </p>

          {/* FILTER TABS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'ALL', label: 'All Faculty & Centers' },
              { id: 'MATH_PHYSICS', label: 'Mathematics & Physics' },
              { id: 'CHEM_BIO', label: 'Chemistry & Biology' },
              { id: 'CS_STEM', label: 'Computer Science & STEM' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubjectFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedSubjectFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* DEMO PROFILES SHOWCASE (3-CARD GRID) */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredMentors.map(mentor => {
            const initials = mentor.name
              .split(' ')
              .filter(p => !p.startsWith('Prof.') && !p.startsWith('Ms.') && !p.startsWith('Er.'))
              .map(p => p[0])
              .slice(0, 2)
              .join('') || mentor.name.slice(0, 2);

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* CARD HERO BANNER */}
                <div>
                  <div className={`p-6 bg-gradient-to-r ${mentor.avatarGradient} text-white relative`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black text-white shadow-md shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/25">
                              {mentor.badge}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-white mt-1 leading-snug group-hover:text-indigo-100 transition-colors">
                            {mentor.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90">
                      <div className="flex items-center space-x-1 font-semibold">
                        <Building2 className="w-3.5 h-3.5 opacity-80" />
                        <span className="truncate max-w-[190px]">{mentor.centerName}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-lg border border-amber-400/30 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>{mentor.rating}</span>
                        <span className="opacity-75">({mentor.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY DETAILS */}
                  <div className="p-6 space-y-5">
                    {/* SPECIALIZATION & EXPERIENCE */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                        Academic Specialization
                      </p>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {mentor.specialization}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mentor.experienceLevel}</span>
                      </p>
                    </div>

                    {/* BIO SNIPPET */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {mentor.bioSummary}
                    </p>

                    {/* SUBJECTS OFFERED CHIPS */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Subjects & Curricula Offered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {mentor.subjectsOffered.map((subj, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* KEY TEACHING SERVICES */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Key Teaching Services
                      </p>
                      <ul className="space-y-1.5">
                        {mentor.keyServices.slice(0, 3).map((srv, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* SAMPLE BATCHES AVAILABLE */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-indigo-600" />
                          <span>Active Enrollment Batches</span>
                        </span>
                        <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                          Admissions Open
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        {mentor.sampleBatches.map((b, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800 truncate max-w-[180px]">{b.batchName}</span>
                            <span className="text-indigo-700 font-bold">₹{b.monthlyFee}/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS (ZERO CONTACT INFO EXPOSURE) */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveMentorModal(mentor)}
                      className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      <span>Full Bio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInquiryMentor(mentor);
                        setInquirySubmitted(false);
                      }}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Request Callback</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400">
                    🔒 Direct in-app request • Instructor phone & email protected
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GENERAL PLATFORM FEATURES SECTION (4-CARD GRID) */}
        {/* ----------------------------------------------------------------- */}
        <div className="space-y-8 pt-8 border-t border-slate-200">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Student & Parent Platform Tools</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Unified Platform Capabilities
            </h3>
            <p className="text-sm text-slate-600">
              Modern digital infrastructure connecting tuition mentors, enrolled students, and parents into one seamless, secure workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_FEATURES.map(feat => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center shadow-sm`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                        {feat.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        {feat.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {feat.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    {feat.id === 'feat_join' && onBatchJoinClick ? (
                      <button
                        type="button"
                        onClick={onBatchJoinClick}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Try Sample Join Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Included in all tuition centers</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* CALLOUT FOOTER BANNER */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20">
                Are You An Independent Tuition Teacher?
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Digitize Your Own Batches in Under 2 Minutes
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Create an educator workspace, generate 6-digit student join codes, share study materials, and collect fees with automated UPI receipts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            {onBatchJoinClick && (
              <button
                type="button"
                onClick={onBatchJoinClick}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Join a Batch with Code</span>
              </button>
            )}
            {onExploreMore && (
              <button
                type="button"
                onClick={onExploreMore}
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Full Showcase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 1. MENTOR FULL BIO MODAL */}
      {/* =================================================================== */}
      {activeMentorModal && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveMentorModal(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className={`p-6 bg-gradient-to-r ${activeMentorModal.avatarGradient} text-white relative`}>
              <button
                type="button"
                onClick={() => setActiveMentorModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-md shrink-0">
                  {activeMentorModal.name[0]}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/25">
                    {activeMentorModal.badge}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {activeMentorModal.name}
                  </h3>
                  <p className="text-xs text-white/90">
                    {activeMentorModal.specialization} • {activeMentorModal.centerName}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Privacy Verified: Instructor contact numbers and personal emails are kept private to prevent spam and preserve direct in-app communication.
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">
                  Academic Profile & Teaching Philosophy
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {activeMentorModal.bioSummary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 uppercase tracking-wide">
                  Key Teaching Services Included
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMentorModal.keyServices.map((srv, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 uppercase tracking-wide">
                  Open Batches & Weekly Schedules
                </h4>
                <div className="space-y-2">
                  {activeMentorModal.sampleBatches.map((batch, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{batch.batchName}</p>
                        <p className="text-[11px] text-slate-500">{batch.schedule}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-700">₹{batch.monthlyFee}/month</span>
                        <span className="block text-[10px] text-emerald-600 font-semibold">{batch.seatsLeft} seats left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveMentorModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = activeMentorModal;
                  setActiveMentorModal(null);
                  setInquiryMentor(m);
                  setInquirySubmitted(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Request Batch Callback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. REQUEST DEMO CALLBACK MODAL */}
      {/* =================================================================== */}
      {inquiryMentor && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setInquiryMentor(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Request Batch Callback</h3>
                  <p className="text-xs text-slate-500">For {inquiryMentor.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInquiryMentor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Inquiry Dispatched!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your inquiry has been logged in the client-side sandbox. The mentor will review batch availability and reach out to your specified number.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    required
                    type="text"
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    placeholder="Student or Parent name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Contact Phone *</label>
                  <input
                    required
                    type="tel"
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Your phone is shared only with the instructor — never published publicly.</span>
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Message or Target Class (Optional)</label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={e => setInquiryMessage(e.target.value)}
                    placeholder="e.g. Inquiring for Class 10 Board prep starting next month..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setInquiryMentor(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Callback Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOAST NOTIFICATION */}
      {/* =================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}
