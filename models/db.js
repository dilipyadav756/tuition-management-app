import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { UserModel, TuitionModel, BatchModel, PaymentModel } from './mongooseModels.js';

/**
 * Database Repository: EduMaster Multi-Tenant Persistent Storage
 * Dual-Mode Resilience Engine:
 *  1. Cloud / Local MongoDB: MongoDB Atlas or local daemon (port 27017)
 *  2. Local File Persistence: data/edumaster_db.json (automatic fallback for offline / disconnected environments)
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
    username: 'sharma_math',
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
    username: 'anita_verma',
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

// Helper to load or initialize database from disk
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

let mongoConnected = false;
let activeDatabaseSource = 'Uninitialized';
let listenersRegistered = false;

export const isMongoConnected = () => mongoConnected;
export const getActiveDatabaseSource = () => activeDatabaseSource;

/**
 * Configure Mongoose Connection Lifecycle Event Listeners
 */
function setupMongooseListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    mongoConnected = true;
    console.log('✅ [Database] Mongoose Event: Connected successfully to MongoDB daemon/cluster.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ [Database] Mongoose Event: Connection error encountered:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    mongoConnected = false;
    console.warn('⚠️ [Database] Mongoose Event: Disconnected from MongoDB daemon.');
  });

  mongoose.connection.on('reconnected', () => {
    mongoConnected = true;
    console.log('🔄 [Database] Mongoose Event: Reconnected to MongoDB.');
  });
}

/**
 * Synchronize MongoDB documents with in-memory database and disk
 */
async function syncMongoCollections() {
  const userCount = await UserModel.countDocuments();
  if (userCount === 0) {
    console.log('[Database] MongoDB collection is empty. Seeding initial records...');
    if (db.tuitions.length > 0) await TuitionModel.insertMany(db.tuitions);
    if (db.batches.length > 0) await BatchModel.insertMany(db.batches);
    if (db.users.length > 0) await UserModel.insertMany(db.users);
    console.log('[Database] Seed records successfully inserted into MongoDB.');
  } else {
    // Hydrate memory with MongoDB records
    const mongoTuitions = await TuitionModel.find().lean();
    const mongoBatches = await BatchModel.find().lean();
    const mongoUsers = await UserModel.find().lean();

    if (mongoTuitions && mongoTuitions.length > 0) {
      mongoTuitions.forEach(mt => {
        const idx = db.tuitions.findIndex(t => t.id === mt.id);
        if (idx >= 0) db.tuitions[idx] = { ...db.tuitions[idx], ...mt };
        else db.tuitions.push(mt);
      });
    }

    if (mongoBatches && mongoBatches.length > 0) {
      mongoBatches.forEach(mb => {
        const idx = db.batches.findIndex(b => b.id === mb.id);
        if (idx >= 0) db.batches[idx] = { ...db.batches[idx], ...mb };
        else db.batches.push(mb);
      });
    }

    if (mongoUsers && mongoUsers.length > 0) {
      mongoUsers.forEach(mu => {
        const idx = db.users.findIndex(u => u.id === mu.id);
        if (idx >= 0) db.users[idx] = { ...db.users[idx], ...mu };
        else db.users.push(mu);
      });
    }

    console.log(`[Database] Hydrated ${db.users.length} users, ${db.tuitions.length} tuitions, and ${db.batches.length} batches.`);
  }

  // Ensure disk file is updated with merged data
  flushToFile();
}

/**
 * Flush in-memory collections directly to disk
 */
function flushToFile() {
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
}

/**
 * Connect to MongoDB with environment-aware fallback cascade:
 *
 *  PRODUCTION (NODE_ENV === 'production'):
 *    MONGODB_URI is REQUIRED. No localhost fallback — if Atlas is unreachable
 *    the server reports an error instead of silently falling back to nothing.
 *
 *  DEVELOPMENT / LOCAL:
 *    Priority 1: MONGODB_URI (if set)
 *    Priority 2: Local MongoDB Daemon (mongodb://127.0.0.1:27017/edumaster)
 *    Priority 3: Persistent File Storage (data/edumaster_db.json)
 */
export async function connectMongo(preferredUri = process.env.MONGODB_URI) {
  setupMongooseListeners();

  const isProduction = process.env.NODE_ENV === 'production';
  const targets = [];

  // --- Diagnostics (credentials are never logged) ---
  if (preferredUri) {
    const safeUri = preferredUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log(`[Database] MONGODB_URI detected: ${safeUri}`);

    const isCloud = preferredUri.includes('mongodb+srv://') || preferredUri.includes('.mongodb.net');
    targets.push({
      uri: preferredUri,
      label: isCloud ? 'MongoDB Atlas (Cloud Cluster)' : 'Configured MongoDB URI'
    });
  } else {
    console.warn('[Database] MONGODB_URI environment variable is NOT set.');
    if (isProduction) {
      console.error('❌ [Database] FATAL: MONGODB_URI must be set in production. Set it in Render → Environment → Environment Variables.');
    }
  }

  // Only add localhost fallback in development — never in production
  if (!isProduction) {
    const localUri = 'mongodb://127.0.0.1:27017/edumaster';
    if (!targets.some(t => t.uri.includes('127.0.0.1:27017') || t.uri.includes('localhost:27017'))) {
      targets.push({
        uri: localUri,
        label: 'Local MongoDB Daemon (127.0.0.1:27017)'
      });
    }
  }

  // --- Connection attempts with retry ---
  for (const target of targets) {
    const maxRetries = isProduction ? 3 : 1;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`[Database] Retry ${attempt}/${maxRetries} for ${target.label} in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }

        console.log(`[Database] Connecting to ${target.label}... (attempt ${attempt}/${maxRetries})`);
        await mongoose.connect(target.uri, {
          serverSelectionTimeoutMS: isProduction ? 10000 : 4000,
          connectTimeoutMS: isProduction ? 10000 : 4000,
          socketTimeoutMS: 45000,
          heartbeatFrequencyMS: 10000,
          retryWrites: true,
          retryReads: true
        });

        mongoConnected = true;
        activeDatabaseSource = target.label;
        console.log(`✅ [Database] Successfully connected to ${target.label}.`);

        // Seed & Hydrate
        await syncMongoCollections();
        return true;
      } catch (err) {
        console.warn(`⚠️ [Database] Connection attempt ${attempt}/${maxRetries} failed for ${target.label}: ${err.message}`);
        // If this was the last retry for this target, move on
        if (attempt === maxRetries) {
          console.error(`❌ [Database] All ${maxRetries} attempt(s) exhausted for ${target.label}.`);
        }
      }
    }
  }

  // All targets exhausted — fallback to file storage
  mongoConnected = false;
  activeDatabaseSource = 'Persistent Local File Storage (data/edumaster_db.json)';
  if (isProduction) {
    console.error(`🔴 [Database] PRODUCTION WARNING: MongoDB is NOT connected. Running on file fallback — data will NOT persist across deploys!`);
    console.error(`🔴 [Database] Fix: Set a valid MONGODB_URI in Render → Environment → Environment Variables.`);
  }
  console.log(`ℹ️ [Database] Running in zero-downtime offline fallback: ${activeDatabaseSource}`);
  return false;
}

/**
 * Persist current state to disk and cloud/local MongoDB (if connected)
 */
export const saveDb = async () => {
  // 1. Always flush to local disk first
  flushToFile();

  // 2. If MongoDB is connected, bulk-upsert asynchronously
  if (mongoose.connection.readyState === 1) {
    try {
      const userOps = db.users.map(u => {
        const { _id, ...cleanUser } = u;
        return {
          updateOne: {
            filter: { id: u.id },
            update: { $set: cleanUser },
            upsert: true
          }
        };
      });

      const tuitionOps = db.tuitions.map(t => {
        const { _id, ...cleanTuition } = t;
        return {
          updateOne: {
            filter: { id: t.id },
            update: { $set: cleanTuition },
            upsert: true
          }
        };
      });

      const batchOps = db.batches.map(b => {
        const { _id, ...cleanBatch } = b;
        return {
          updateOne: {
            filter: { id: b.id },
            update: { $set: cleanBatch },
            upsert: true
          }
        };
      });

      const ops = [];
      if (userOps.length > 0) ops.push(UserModel.bulkWrite(userOps, { ordered: false }));
      if (tuitionOps.length > 0) ops.push(TuitionModel.bulkWrite(tuitionOps, { ordered: false }));
      if (batchOps.length > 0) ops.push(BatchModel.bulkWrite(batchOps, { ordered: false }));

      if (ops.length > 0) {
        await Promise.all(ops);
      }
    } catch (mongoErr) {
      console.warn('[DB] MongoDB persistence sync warning:', mongoErr.message);
    }
  }
};

// Initial flush to disk on module load
saveDb();

export { UserModel, TuitionModel, BatchModel, PaymentModel };
export default db;
