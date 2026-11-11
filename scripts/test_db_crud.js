import net from 'net';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

import { UserModel, TuitionModel, BatchModel, PaymentModel } from '../models/mongooseModels.js';
import { db, saveDb, connectMongo, isMongoConnected, getActiveDatabaseSource } from '../models/db.js';

console.log('================================================================');
console.log('🧪 EDUMASTER DATABASE END-TO-END DIAGNOSTIC & VERIFICATION SUITE');
console.log('================================================================');

async function checkLocalMongoPort(port = 27017, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(1500);

    socket.on('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve({ active: true, message: `Active and listening on ${host}:${port}` });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ active: false, message: `Connection timed out on ${host}:${port}` });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ active: false, message: `Refused / Unreachable (${err.code})` });
    });

    try {
      socket.connect(port, host);
    } catch (e) {
      resolve({ active: false, message: e.message });
    }
  });
}

async function runDiagnostics() {
  const results = {
    localMongoDaemon: false,
    atlasConnection: false,
    eventListeners: false,
    userCrud: false,
    tuitionCrud: false,
    batchCrud: false,
    paymentCrud: false,
    dualModePersistence: false
  };

  // Step 1: System & DB Health (Local Port 27017)
  console.log('\n--- 1. SYSTEM & LOCAL MONGODB DAEMON HEALTH CHECK ---');
  const localCheck = await checkLocalMongoPort();
  console.log(`📡 Local Port 27017 Status: ${localCheck.active ? '✅ ONLINE' : '⚠️ OFFLINE'} (${localCheck.message})`);
  results.localMongoDaemon = localCheck.active;
  if (!localCheck.active) {
    console.log('ℹ️ Notice: Local MongoDB is not running or blocked. Using MongoDB Atlas URI fallback.');
  }

  // Step 2: Connection to Database via Mongoose
  console.log('\n--- 2. MONGOOSE CONNECTION & EVENT LISTENERS CHECK ---');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edumaster';
  console.log(`Connecting to: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  let eventConnectedFired = false;
  mongoose.connection.on('connected', () => {
    eventConnectedFired = true;
  });

  const connected = await connectMongo(uri);
  results.atlasConnection = connected && isMongoConnected();
  results.eventListeners = eventConnectedFired || mongoose.connection.readyState === 1;

  console.log(`Connection Status: ${results.atlasConnection ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Active Storage Mode: ${getActiveDatabaseSource()}`);
  console.log(`Mongoose readyState: ${mongoose.connection.readyState} (1 = connected)`);
  console.log(`Event Listener Fired: ${results.eventListeners ? '✅ YES' : '❌ NO'}`);

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Mongoose not connected. Cannot proceed with cloud CRUD tests.');
    process.exit(1);
  }

  // Step 3: CRUD Operations Verification
  console.log('\n--- 3. ISOLATED CRUD INSERT & READ VERIFICATION ---');

  const testId = `diag_${Date.now()}`;

  // 3a. UserModel Test
  try {
    const testUser = {
      id: `u_${testId}`,
      name: 'Dr. Diagnostic Test',
      email: `test_${testId}@diagnostic.io`,
      phone: '9999000011',
      username: `diag_usr_${testId}`,
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      role: 'TEACHER',
      tuitionId: `t_${testId}`,
      upiId: 'diag@upi',
      isActive: true
    };

    console.log('Inserting test User into MongoDB UserModel...');
    const insertedUser = await UserModel.create(testUser);
    if (!insertedUser || insertedUser.id !== testUser.id) throw new Error('User creation returned invalid document');

    console.log('Reading back test User from MongoDB UserModel...');
    const retrievedUser = await UserModel.findOne({ id: testUser.id }).lean();
    if (!retrievedUser || retrievedUser.email !== testUser.email) throw new Error('User read failed or field mismatch');

    console.log('Cleaning up test User...');
    await UserModel.deleteOne({ id: testUser.id });
    results.userCrud = true;
    console.log('✅ UserModel Insert, Read & Clean: PASSED');
  } catch (err) {
    console.error('❌ UserModel CRUD failed:', err.message);
  }

  // 3b. TuitionModel Test
  try {
    const testTuition = {
      id: `t_${testId}`,
      name: 'Diagnostic Physics Institute',
      code: 'DIAG-777',
      joinCode: '777888',
      phone: '9999000022',
      ownerId: `u_${testId}`,
      upiId: 'diag.institute@okaxis',
      isActive: true
    };

    console.log('Inserting test Tuition into MongoDB TuitionModel...');
    const insertedTuition = await TuitionModel.create(testTuition);
    if (!insertedTuition || insertedTuition.id !== testTuition.id) throw new Error('Tuition creation returned invalid document');

    console.log('Reading back test Tuition from MongoDB TuitionModel...');
    const retrievedTuition = await TuitionModel.findOne({ id: testTuition.id }).lean();
    if (!retrievedTuition || retrievedTuition.code !== testTuition.code) throw new Error('Tuition read failed or code mismatch');

    console.log('Cleaning up test Tuition...');
    await TuitionModel.deleteOne({ id: testTuition.id });
    results.tuitionCrud = true;
    console.log('✅ TuitionModel Insert, Read & Clean: PASSED');
  } catch (err) {
    console.error('❌ TuitionModel CRUD failed:', err.message);
  }

  // 3c. BatchModel Test
  try {
    const testBatch = {
      id: `b_${testId}`,
      tuitionId: `t_${testId}`,
      teacherId: `u_${testId}`,
      name: 'Diagnostic Advanced Physics',
      subject: 'Thermodynamics & Quantum',
      joinCode: '777888',
      monthlyFee: 3200,
      schedule: 'Mon, Wed, Fri 4:00 PM'
    };

    console.log('Inserting test Batch into MongoDB BatchModel...');
    const insertedBatch = await BatchModel.create(testBatch);
    if (!insertedBatch || insertedBatch.id !== testBatch.id) throw new Error('Batch creation returned invalid document');

    console.log('Reading back test Batch from MongoDB BatchModel...');
    const retrievedBatch = await BatchModel.findOne({ id: testBatch.id }).lean();
    if (!retrievedBatch || retrievedBatch.monthlyFee !== 3200) throw new Error('Batch read failed or fee mismatch');

    console.log('Cleaning up test Batch...');
    await BatchModel.deleteOne({ id: testBatch.id });
    results.batchCrud = true;
    console.log('✅ BatchModel Insert, Read & Clean: PASSED');
  } catch (err) {
    console.error('❌ BatchModel CRUD failed:', err.message);
  }

  // 3d. PaymentModel Test
  try {
    const testPayment = {
      receiptNumber: `REC-DIAG-${Date.now().toString().slice(-6)}`,
      studentId: `u_student_${testId}`,
      studentName: 'Diagnostic Student',
      batchId: `b_${testId}`,
      batchName: 'Diagnostic Advanced Physics',
      amount: 3200,
      feeStatus: 'PAID',
      paymentMethod: 'UPI Bharat-QR / Instant Ledger',
      verifiedAt: new Date()
    };

    console.log('Inserting test Payment into MongoDB PaymentModel...');
    const insertedPayment = await PaymentModel.create(testPayment);
    if (!insertedPayment || insertedPayment.receiptNumber !== testPayment.receiptNumber) throw new Error('Payment creation returned invalid document');

    console.log('Reading back test Payment from MongoDB PaymentModel...');
    const retrievedPayment = await PaymentModel.findOne({ receiptNumber: testPayment.receiptNumber }).lean();
    if (!retrievedPayment || retrievedPayment.amount !== 3200) throw new Error('Payment read failed or amount mismatch');

    console.log('Cleaning up test Payment...');
    await PaymentModel.deleteOne({ receiptNumber: testPayment.receiptNumber });
    results.paymentCrud = true;
    console.log('✅ PaymentModel Insert, Read & Clean: PASSED');
  } catch (err) {
    console.error('❌ PaymentModel CRUD failed:', err.message);
  }

  // Step 4: Dual-Mode Persistence & saveDb() Test
  console.log('\n--- 4. DUAL-MODE PERSISTENCE (saveDb) VERIFICATION ---');
  try {
    const dualUser = {
      id: `u_dual_${testId}`,
      name: 'Dual Sync Test User',
      email: `dualsync_${testId}@test.com`,
      phone: '9888877777',
      username: `dual_${testId}`,
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      role: 'STUDENT',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Add to in-memory db
    db.users.push(dualUser);

    // Call saveDb (syncs to disk + MongoDB)
    console.log('Calling await saveDb()...');
    await saveDb();

    // Verify written to disk file
    const dbFile = path.resolve(process.cwd(), 'data', 'edumaster_db.json');
    const diskContent = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    const onDisk = diskContent.users.some(u => u.id === dualUser.id);
    console.log(`Persisted to local disk file (${dbFile}): ${onDisk ? '✅ YES' : '❌ NO'}`);

    // Verify written to MongoDB
    const inMongo = await UserModel.findOne({ id: dualUser.id }).lean();
    console.log(`Persisted to cloud MongoDB (UserModel): ${inMongo ? '✅ YES' : '❌ NO'}`);

    // Clean up
    db.users = db.users.filter(u => u.id !== dualUser.id);
    await UserModel.deleteOne({ id: dualUser.id });
    await saveDb();

    results.dualModePersistence = onDisk && !!inMongo;
    console.log('✅ Dual-Mode Persistence (File + Cloud): PASSED');
  } catch (err) {
    console.error('❌ Dual-mode test failed:', err.message);
  }

  // Step 5: Final Summary
  console.log('\n================================================================');
  console.log('📊 FINAL DIAGNOSTIC & VERIFICATION RESULTS');
  console.log('================================================================');
  console.log(`1. Local MongoDB Daemon Port 27017:   ${results.localMongoDaemon ? 'ONLINE' : 'HANDLED VIA ATLAS FALLBACK'}`);
  console.log(`2. MongoDB Atlas Cloud Connection:    ${results.atlasConnection ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`3. Mongoose Event Listeners:          ${results.eventListeners ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`4. UserModel CRUD Pipeline:           ${results.userCrud ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`5. TuitionModel CRUD Pipeline:        ${results.tuitionCrud ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`6. BatchModel CRUD Pipeline:          ${results.batchCrud ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`7. PaymentModel CRUD Pipeline:        ${results.paymentCrud ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`8. Dual-Mode Storage Sync (saveDb):   ${results.dualModePersistence ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  console.log('Disconnected cleanly from database.');

  const allPassed = results.atlasConnection && 
                    results.eventListeners && 
                    results.userCrud && 
                    results.tuitionCrud && 
                    results.batchCrud && 
                    results.paymentCrud && 
                    results.dualModePersistence;

  if (allPassed) {
    console.log('🎉 ALL DIAGNOSTIC CHECKS PASSED WITH 100% SUCCESS.');
    process.exit(0);
  } else {
    console.error('❌ Some checks failed.');
    process.exit(1);
  }
}

runDiagnostics().catch(err => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
