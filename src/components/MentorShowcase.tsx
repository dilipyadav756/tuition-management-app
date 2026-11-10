/**
 * MentorShowcase.tsx
 * Public-safe mentor directory for the Tuition Management Portal.
 *
 * PRIVACY RULES (enforced by design):
 *  - phone, email, upiId, location, pin are NEVER rendered.
 *  - Contact is routed via "Request Callback" (student submits their number)
 *    or "Send In-App Message" (no email exposed).
 */

import React, { useState, useMemo } from 'react';
import {
  Star,
  MessageCircle,
  Calendar,
  Award,
  BookOpen,
  User,
  Play,
  X,
  ChevronRight,
  Clock,
  GraduationCap,
  Users,
  Search,
  Filter,
  Bell,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { Teacher } from '../../tuition_management_portal';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface MentorBatch {
  name: string;
  schedule: string;
  monthlyFee: number;
  subject: string;
}

interface MentorReview {
  studentName: string;
  text: string;
  rating: number;
  date: string;
}

interface MentorProfile {
  id: string;
  name: string;
  primarySubject: string;
  bio: string;
  resultsHeadline: string;
  qualifications: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  subjects: string[];
  activeBatches: MentorBatch[];
  reviews: MentorReview[];
  status: 'Active' | 'Suspended';
  avatarColor: string;
}

interface CallbackRequest {
  mentorId: string;
  requesterName: string;
  contactNumber: string;
  preferredSlot: 'morning' | 'afternoon' | 'evening';
}

interface InAppMessage {
  mentorId: string;
  senderName: string;
  message: string;
}

export interface MentorShowcaseProps {
  teachers: Teacher[];
  onRequestCallback?: (req: CallbackRequest) => void;
  onSendMessage?: (msg: InAppMessage) => void;
  standalone?: boolean;
}

// ─── Mock enrichment data keyed by teacher id ──────────────────────────────────

const ENRICHMENT: Record<
  string,
  Omit<MentorProfile, 'id' | 'name' | 'primarySubject' | 'bio' | 'resultsHeadline' | 'status'>
> = {
  t1: {
    qualifications: ['M.Sc Mathematics (Gold Medalist)', 'B.Ed', 'JEE Advanced Mentor – 8 yrs'],
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 128,
    subjects: ['Mathematics', 'Physics', 'JEE Mains', 'Board Exam Prep'],
    avatarColor: 'from-indigo-500 to-purple-600',
    activeBatches: [
      { name: 'Class 10 – Batch A', schedule: 'Mon, Wed, Fri · 5:00–6:30 PM', monthlyFee: 2500, subject: 'Mathematics & Physics' },
      { name: 'Class 12 – Math', schedule: 'Tue, Thu, Sat · 6:00–7:30 PM', monthlyFee: 3000, subject: 'Advanced Mathematics' },
    ],
    reviews: [
      { studentName: 'Arjun K.', text: 'Sir explains concepts with incredible clarity. My board score jumped from 72% to 94%!', rating: 5, date: 'Oct 2026' },
      { studentName: 'Priya S.', text: 'The best Math tutor I\'ve had. Practice sheets are top notch.', rating: 5, date: 'Sep 2026' },
      { studentName: 'Rohit M.', text: 'Very patient and always available for doubt sessions.', rating: 5, date: 'Aug 2026' },
    ],
  },
  t2: {
    qualifications: ['M.Sc Biochemistry', 'B.Ed', 'Ex-Lecturer – DU', 'NEET Mentor – 6 yrs'],
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 94,
    subjects: ['Chemistry', 'Biology', 'NEET Prep', 'CBSE Board'],
    avatarColor: 'from-emerald-500 to-teal-600',
    activeBatches: [
      { name: 'Class 11 – Bio', schedule: 'Mon, Thu, Sat · 4:00–5:30 PM', monthlyFee: 2800, subject: 'Cell Biology & Genetics' },
    ],
    reviews: [
      { studentName: 'Sneha R.', text: 'Ma\'am\'s notes are like a treasure chest. Got AIR 1200 in NEET!', rating: 5, date: 'Oct 2026' },
      { studentName: 'Karan P.', text: 'Chemistry was my weak point. Now it\'s my strength. Thank you ma\'am!', rating: 5, date: 'Sep 2026' },
      { studentName: 'Divya T.', text: 'Very systematic approach and great doubt resolution sessions.', rating: 4, date: 'Aug 2026' },
    ],
  },
};

// Extra mock mentors for showcase richness
const EXTRA_MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'mock_1',
    name: 'Dr. Suresh Patel',
    primarySubject: 'English & Social Science',
    bio: '18+ years crafting confident communicators. Specialises in CBSE English, SST, and competitive exam essay writing.',
    resultsHeadline: '100% Board pass rate for 6 consecutive years!',
    qualifications: ['M.A. English Literature (IIT Kanpur)', 'B.Ed', 'Published Author – 2 books'],
    experienceYears: 18,
    rating: 4.7,
    reviewCount: 76,
    subjects: ['English', 'Social Science', 'Essay Writing', 'CUET'],
    avatarColor: 'from-amber-500 to-orange-600',
    activeBatches: [
      { name: 'Class 9–10 English', schedule: 'Tue, Thu · 4:00–5:30 PM', monthlyFee: 2000, subject: 'English Language & Literature' },
      { name: 'CUET Prep Batch', schedule: 'Sat · 10:00 AM–1:00 PM', monthlyFee: 3500, subject: 'English & General Test' },
    ],
    reviews: [
      { studentName: 'Anika J.', text: 'My writing improved drastically. Got 95 in English Board!', rating: 5, date: 'Oct 2026' },
      { studentName: 'Manas G.', text: 'Patient, thorough, and genuinely caring mentor.', rating: 5, date: 'Sep 2026' },
      { studentName: 'Ritika B.', text: 'The essay templates are golden. Highly recommend!', rating: 4, date: 'Aug 2026' },
    ],
    status: 'Active',
  },
  {
    id: 'mock_2',
    name: 'Ms. Kavita Joshi',
    primarySubject: 'Computer Science & AI',
    bio: '10 years in EdTech and school CS teaching. Expert in Python, Data Structures, AI fundamentals and CBSE CS curriculum.',
    resultsHeadline: '92% students secured A1 in CS Board 2026.',
    qualifications: ['M.Tech Computer Science (NIT Trichy)', 'B.Tech', 'Google Certified Educator'],
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 112,
    subjects: ['Python', 'Computer Science', 'AI & ML Basics', 'Data Structures'],
    avatarColor: 'from-blue-500 to-cyan-600',
    activeBatches: [
      { name: 'Class 11–12 CS', schedule: 'Mon, Wed, Fri · 6:00–7:30 PM', monthlyFee: 3200, subject: 'Computer Science (CBSE)' },
      { name: 'Python for Beginners', schedule: 'Sat, Sun · 9:00–10:30 AM', monthlyFee: 2500, subject: 'Python Programming' },
    ],
    reviews: [
      { studentName: 'Yash K.', text: 'Ma\'am breaks down algorithms so simply. Got 98 in CS!', rating: 5, date: 'Oct 2026' },
      { studentName: 'Pooja M.', text: 'The project-based learning approach is amazing.', rating: 5, date: 'Sep 2026' },
      { studentName: 'Dev S.', text: 'Best CS teacher in Delhi NCR, hands down!', rating: 5, date: 'Aug 2026' },
    ],
    status: 'Active',
  },
];

// ─── Helper: build MentorProfile from Teacher + enrichment ────────────────────

function buildProfile(teacher: Teacher): MentorProfile {
  const extra = ENRICHMENT[teacher.id];
  return {
    id: teacher.id,
    name: teacher.name,
    primarySubject: teacher.subject,
    bio: teacher.bio ?? 'Dedicated educator committed to academic excellence.',
    resultsHeadline: teacher.resultsHeadline ?? '',
    status: teacher.status ?? 'Active',
    qualifications: extra?.qualifications ?? ['B.Ed', 'Post Graduate'],
    experienceYears: extra?.experienceYears ?? 5,
    rating: extra?.rating ?? 4.5,
    reviewCount: extra?.reviewCount ?? 20,
    subjects: extra?.subjects ?? [teacher.subject],
    avatarColor: extra?.avatarColor ?? 'from-slate-500 to-slate-700',
    activeBatches: extra?.activeBatches ?? [],
    reviews: extra?.reviews ?? [],
  };
}

// ─── Star Rating Display ───────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function MentorAvatar({ name, gradient, size = 'lg' }: { name: string; gradient: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Callback Request Modal ────────────────────────────────────────────────────

function CallbackModal({
  mentor,
  onClose,
  onSubmit,
}: {
  mentor: MentorProfile;
  onClose: () => void;
  onSubmit: (req: CallbackRequest) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit({ mentorId: mentor.id, requesterName: name, contactNumber: phone, preferredSlot: slot });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Request Batch Callback</h3>
              <p className="text-xs text-slate-500">From {mentor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">Request Sent!</h4>
            <p className="text-slate-500 text-sm">The mentor will contact you at your provided number shortly.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Your Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student / Parent name"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Your Contact Number *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                type="tel"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Your number is shared only with the mentor — never shown publicly.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Preferred Call Time</label>
              <div className="grid grid-cols-3 gap-2">
                {(['morning', 'afternoon', 'evening'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      slot === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Send Callback Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── In-App Message Modal ─────────────────────────────────────────────────────

function MessageModal({
  mentor,
  onClose,
  onSubmit,
}: {
  mentor: MentorProfile;
  onClose: () => void;
  onSubmit: (msg: InAppMessage) => void;
}) {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;
    onSubmit({ mentorId: mentor.id, senderName, message });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Send In-App Message</h3>
              <p className="text-xs text-slate-500">To {mentor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">Message Sent!</h4>
            <p className="text-slate-500 text-sm">The mentor will respond within 24 hours via the portal inbox.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Your Name *</label>
              <input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Student / Parent name"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Your Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about batches, schedules, fees, or anything else..."
                required
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> No personal emails are exposed. Messages stay inside the portal.
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Bio / Profile Modal ───────────────────────────────────────────────────────

function ProfileModal({
  mentor,
  onClose,
  onRequestCallback,
  onSendMessage,
}: {
  mentor: MentorProfile;
  onClose: () => void;
  onRequestCallback: () => void;
  onSendMessage: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${mentor.avatarColor} p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-start gap-4">
            <MentorAvatar name={mentor.name} gradient="from-white/20 to-white/10" size="lg" />
            <div className="text-white min-w-0">
              <h2 className="text-xl font-bold">{mentor.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{mentor.primarySubject}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span className="text-sm font-bold">{mentor.rating}</span>
                  <span className="text-white/70 text-xs">({mentor.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{mentor.experienceYears} Yrs Exp</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{mentor.activeBatches.length} Batches</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Results Headline */}
          {mentor.resultsHeadline && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm font-semibold">{mentor.resultsHeadline}</p>
            </div>
          )}

          {/* Bio */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> About
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{mentor.bio}</p>
          </div>

          {/* Qualifications */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" /> Qualifications
            </h3>
            <ul className="space-y-1">
              {mentor.qualifications.map((q, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <Award className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Subjects Taught
            </h3>
            <div className="flex flex-wrap gap-2">
              {mentor.subjects.map((s) => (
                <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Video Intro Placeholder */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-500" /> Video Introduction
            </h3>
            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center gap-3 relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mentor.avatarColor} opacity-30`}
              />
              <div className="relative z-10 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
              <p className="relative z-10 text-white/70 text-xs text-center px-4">
                Video introduction available to enrolled students
              </p>
            </div>
          </div>

          {/* Active Batches */}
          {mentor.activeBatches.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Open Batches
              </h3>
              <div className="space-y-2">
                {mentor.activeBatches.map((batch, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{batch.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{batch.schedule}</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg flex-shrink-0">
                      ₹{batch.monthlyFee.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {mentor.reviews.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> Student Testimonials
              </h3>
              <div className="space-y-3">
                {mentor.reviews.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {r.studentName[0]}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{r.studentName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { onClose(); onRequestCallback(); }}
              className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Bell className="w-4 h-4" />
              Request Callback
            </button>
            <button
              onClick={() => { onClose(); onSendMessage(); }}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual Mentor Card ────────────────────────────────────────────────────

function MentorCard({
  mentor,
  onViewProfile,
  onRequestCallback,
  onSendMessage,
}: {
  mentor: MentorProfile;
  onViewProfile: () => void;
  onRequestCallback: () => void;
  onSendMessage: () => void;
}) {
  if (mentor.status === 'Suspended') return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${mentor.avatarColor} p-5`}>
        <div className="flex items-start justify-between">
          <MentorAvatar name={mentor.name} gradient="from-white/20 to-white/10" size="lg" />
          <span className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
            {mentor.experienceYears} Yrs
          </span>
        </div>
        <div className="mt-3 text-white">
          <h3 className="font-bold text-base leading-tight">{mentor.name}</h3>
          <p className="text-white/80 text-xs mt-0.5">{mentor.primarySubject}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <StarRating rating={mentor.rating} />
          <span className="text-xs font-bold text-slate-700">{mentor.rating}</span>
          <span className="text-[10px] text-slate-400">({mentor.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{mentor.activeBatches.length} batch{mentor.activeBatches.length !== 1 ? 'es' : ''}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        {/* Bio snippet */}
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{mentor.bio}</p>

        {/* Results headline */}
        {mentor.resultsHeadline && (
          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg p-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-[11px] font-semibold leading-tight">{mentor.resultsHeadline}</p>
          </div>
        )}

        {/* Subject chips */}
        <div className="flex flex-wrap gap-1.5">
          {mentor.subjects.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-semibold">
              {s}
            </span>
          ))}
          {mentor.subjects.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
              +{mentor.subjects.length - 3} more
            </span>
          )}
        </div>

        {/* Qualification highlight */}
        {mentor.qualifications[0] && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] truncate">{mentor.qualifications[0]}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={onViewProfile}
          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          View Full Profile
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRequestCallback}
            className="flex items-center justify-center gap-1 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <Bell className="w-3 h-3" />
            Callback
          </button>
          <button
            onClick={onSendMessage}
            className="flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            <MessageCircle className="w-3 h-3" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type SortKey = 'rating' | 'experience' | 'name';

export default function MentorShowcase({
  teachers,
  onRequestCallback,
  onSendMessage,
  standalone = false,
}: MentorShowcaseProps) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const [profileMentor, setProfileMentor] = useState<MentorProfile | null>(null);
  const [callbackMentor, setCallbackMentor] = useState<MentorProfile | null>(null);
  const [messageMentor, setMessageMentor] = useState<MentorProfile | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Build profiles: real teachers first, then extras
  const allProfiles = useMemo<MentorProfile[]>(() => {
    const realProfiles = teachers
      .filter((t) => t.status !== 'Suspended')
      .map(buildProfile);
    return [...realProfiles, ...EXTRA_MOCK_MENTORS];
  }, [teachers]);

  // Unique subjects for filter
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    allProfiles.forEach((m) => m.subjects.forEach((s) => set.add(s)));
    return ['All', ...Array.from(set).sort()];
  }, [allProfiles]);

  // Filtered + sorted
  const displayed = useMemo(() => {
    let list = allProfiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.primarySubject.toLowerCase().includes(q) ||
          m.subjects.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (subjectFilter !== 'All') {
      list = list.filter((m) => m.subjects.includes(subjectFilter));
    }
    list = [...list].sort((a, b) => {
      if (sortKey === 'rating') return b.rating - a.rating;
      if (sortKey === 'experience') return b.experienceYears - a.experienceYears;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [allProfiles, search, subjectFilter, sortKey]);

  const handleCallback = (req: CallbackRequest) => {
    onRequestCallback?.(req);
    showToast('Request sent! The mentor will contact you shortly.');
  };

  const handleMessage = (msg: InAppMessage) => {
    onSendMessage?.(msg);
    showToast('Message delivered! You will receive a reply within 24 hours.');
  };

  return (
    <div className={`space-y-6 ${standalone ? 'min-h-screen bg-slate-50 p-6' : ''}`}>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Meet Our Mentors</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Expert educators dedicated to your academic success.{' '}
              <span className="font-semibold text-indigo-600">{displayed.length} mentors</span> available.
            </p>
          </div>
          {/* Privacy badge */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">
              Contact info is private — reach mentors via secure in-app channels only.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or subject…"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          {/* Subject filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 appearance-none cursor-pointer"
            >
              {allSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 appearance-none cursor-pointer"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="name">Sort: A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mentor Grid */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No mentors found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayed.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onViewProfile={() => setProfileMentor(mentor)}
              onRequestCallback={() => setCallbackMentor(mentor)}
              onSendMessage={() => setMessageMentor(mentor)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {profileMentor && (
        <ProfileModal
          mentor={profileMentor}
          onClose={() => setProfileMentor(null)}
          onRequestCallback={() => setCallbackMentor(profileMentor)}
          onSendMessage={() => setMessageMentor(profileMentor)}
        />
      )}
      {callbackMentor && (
        <CallbackModal
          mentor={callbackMentor}
          onClose={() => setCallbackMentor(null)}
          onSubmit={handleCallback}
        />
      )}
      {messageMentor && (
        <MessageModal
          mentor={messageMentor}
          onClose={() => setMessageMentor(null)}
          onSubmit={handleMessage}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

