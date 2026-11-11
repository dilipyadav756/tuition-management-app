import fs from 'fs';
import path from 'path';

/**
 * Database Repository: EduMaster Multi-Tenant Persistent Storage
 * Persists to data/edumaster_db.json so data survives server restarts and redeployments.
 */

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'edumaster_db.json');

const SEED_TUITIONS = [
  {
    id: 't_inst_1',
    name: 'Sharma Mathematics & Physics Academy',
    code: 'SHARMA-101',
    joinCode: '849201',
    phone: '+91 98765 43210',
    ownerId: 'u_teacher_1',
    upiId: 'sharmaclasses@upi',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 't_inst_2',
    name: 'Verma Science & Biology Hub',
    code: 'VERMA-202',
    joinCode: '526318',
    phone: '+91 98123 45678',
    ownerId: 'u_teacher_2',
    upiId: 'anita.verma@okaxis',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

const SEED_BATCHES = [
  {
    id: 'b1',
    tuitionId: 't_inst_1',
    teacherId: 'u_teacher_1',
    name: 'Class 10 - Batch A',
    subject: 'Mathematics & Physics',
    joinCode: '849201',
    monthlyFee: 2500,
    schedule: 'Mon, Wed, Fri (5:00 PM - 6:30 PM)'
  },
  {
    id: 'b2',
    tuitionId: 't_inst_1',
    teacherId: 'u_teacher_1',
    name: 'Class 12 - Math',
    subject: 'Advanced Mathematics',
    joinCode: '713904',
    monthlyFee: 3000,
    schedule: 'Tue, Thu, Sat (6:00 PM - 7:30 PM)'
  },
  {
    id: 'b3',
    tuitionId: 't_inst_2',
    teacherId: 'u_teacher_2',
    name: 'Class 11 - Bio',
    subject: 'Cell Biology & Genetics',
    joinCode: '526318',
    monthlyFee: 2800,
    schedule: 'Mon, Thu, Sat (4:00 PM - 5:30 PM)'
  }
];

const SEED_USERS = [
  {
    id: 'u_teacher_1',
    name: 'Prof. Rajesh Sharma',
    email: 'sharma.tuitions@gmail.com',
    phone: '9876543210',
    passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
    registrationJoinCode: 'SHARMA-101',
    role: 'TEACHER',
    tuitionId: 't_inst_1',
    upiId: 'sharmaclasses@upi',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u_teacher_2',
    name: 'Ms. Anita Verma',
    email: 'anita.science@gmail.com',
    phone: '9812345678',
    passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
    registrationJoinCode: 'VERMA-202',
    role: 'TEACHER',
    tuitionId: 't_inst_2',
    upiId: 'anita.verma@okaxis',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u_student_1',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    phone: '9111122222',
    username: 'aarav101',
    passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
    role: 'STUDENT',
    tenants: [
      { tuitionId: 't_inst_1', tuitionName: 'Sharma Mathematics & Physics Academy', batch: 'Class 10 - Batch A', rollNo: '101' },
      { tuitionId: 't_inst_2', tuitionName: 'Verma Science & Biology Hub', batch: 'Class 10 - Foundation Science', rollNo: 'S-205' }
    ],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin_root',
    name: 'Platform Super-Admin',
    email: 'admin@edumaster.io',
    phone: '9999999999',
    username: 'admin',
    passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
    role: 'SUPER_ADMIN',
    tuitionId: 'system_root',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// Helper to load or initialize database
function loadInitialData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);

      // Merge stored tuitions with seeds
      const tuitions = [...SEED_TUITIONS];
      (parsed.tuitions || []).forEach(t => {
        if (!tuitions.some(existing => existing.id === t.id)) {
          tuitions.push(t);
        }
      });

      // Merge stored batches with seeds
      const batches = [...SEED_BATCHES];
      (parsed.batches || []).forEach(b => {
        if (!batches.some(existing => existing.id === b.id)) {
          batches.push(b);
        }
      });

      // Merge stored users with seeds
      const users = [...SEED_USERS];
      (parsed.users || []).forEach(u => {
        const existingIdx = users.findIndex(existing => existing.id === u.id);
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...u };
        } else {
          users.push(u);
        }
      });

      return { tuitions, batches, users };
    }
  } catch (err) {
    console.warn('[DB] Failed to load data from disk, using in-memory defaults:', err.message);
  }

  return {
    tuitions: [...SEED_TUITIONS],
    batches: [...SEED_BATCHES],
    users: [...SEED_USERS]
  };
}

const initial = loadInitialData();

export const db = {
  tuitions: initial.tuitions,
  batches: initial.batches,
  users: initial.users,
  otps: new Map(),
  resetTokens: new Map()
};

/**
 * Persist current state to disk
 */
export const saveDb = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = JSON.stringify({
      tuitions: db.tuitions,
      batches: db.batches,
      users: db.users
    }, null, 2);

    fs.writeFileSync(DB_FILE, payload, 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save database to disk:', err.message);
  }
};

// Initial flush to ensure file exists
saveDb();

export default db;
