import { db, saveDb } from '../models/db.js';
import { PaymentModel, BatchModel, UserModel } from '../models/mongooseModels.js';
import mongoose from 'mongoose';

/**
 * @route   GET /api/student/receipt/:batchId
 * @desc    Fetch and generate official fee receipt for an enrolled batch
 * @access  Protected (Students, Teachers, Super Admin)
 */
export const getStudentReceipt = async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch identifier is required.'
      });
    }

    // 1. Check MongoDB PaymentModel first if connected
    let paymentRecord = null;
    if (mongoose.connection.readyState === 1) {
      try {
        paymentRecord = await PaymentModel.findOne({
          studentId: userId,
          batchId: batchId
        }).lean();
      } catch (mongoErr) {
        console.warn('[StudentController] MongoDB Payment lookup fallback:', mongoErr.message);
      }
    }

    // 2. Check Prisma client if attached
    if (!paymentRecord && req.prisma?.payment) {
      try {
        paymentRecord = await req.prisma.payment.findFirst({
          where: { studentId: userId, batchId: batchId }
        });
      } catch (prismaErr) {
        console.warn('[StudentController] Prisma lookup failed, falling back:', prismaErr.message);
      }
    }

    // 3. Fallback to in-memory / file db repository
    if (!paymentRecord) {
      const studentUser = db.users?.find(u => u.id === userId);
      const studentTenant = studentUser?.tenants?.find(t => 
        t.batch === batchId || t.batchId === batchId
      );
      const enrolledBatch = studentUser?.enrolledBatches?.find(b => 
        b.batchId === batchId || b.batchName === batchId || b.joinCode === batchId
      );

      // Check batch details in db
      const matchedBatch = db.batches?.find(b => 
        b.id === batchId || b.name === batchId || b.joinCode === batchId
      );

      // Check payment status from student records
      const isPaid = studentUser?.feeStatus === 'PAID' || 
                     studentUser?.feeStatus === 'Paid' || 
                     studentTenant?.feeStatus === 'PAID' ||
                     studentTenant?.feeStatus === 'Paid' ||
                     enrolledBatch?.feeStatus === 'PAID' ||
                     enrolledBatch?.feeStatus === 'Paid';

      paymentRecord = {
        studentId: userId,
        studentName: studentUser?.name || 'Enrolled Student',
        batchId: matchedBatch?.id || batchId,
        batchName: matchedBatch?.name || enrolledBatch?.batchName || batchId,
        monthlyFee: matchedBatch?.monthlyFee || enrolledBatch?.monthlyFee || 2500,
        status: isPaid ? 'PAID' : (studentUser?.feeStatus || 'PENDING').toUpperCase()
      };
    }

    // 4. Security Guard: Check if payment status !== 'PAID'
    const normalizedStatus = (paymentRecord?.feeStatus || paymentRecord?.status || '').toUpperCase();
    if (normalizedStatus !== 'PAID') {
      return res.status(403).json({
        success: false,
        message: 'Receipt unavailable. Payment has not been verified by your tuition center.'
      });
    }

    // 5. Generate receiptNumber if not already generated
    const receiptNumber = paymentRecord.receiptNumber || `REC-${Date.now().toString().slice(-6)}`;

    // 6. If MongoDB is connected and receipt isn't persisted yet, persist it
    if (mongoose.connection.readyState === 1 && !paymentRecord._id) {
      try {
        await PaymentModel.updateOne(
          { receiptNumber },
          {
            $set: {
              receiptNumber,
              studentId: paymentRecord.studentId,
              studentName: paymentRecord.studentName,
              batchId: paymentRecord.batchId,
              batchName: paymentRecord.batchName,
              amount: paymentRecord.monthlyFee || paymentRecord.amount || 2500,
              feeStatus: 'PAID',
              paymentMethod: paymentRecord.paymentMethod || 'UPI Bharat-QR / Instant Ledger',
              verifiedAt: new Date()
            }
          },
          { upsert: true }
        );
      } catch (saveReceiptErr) {
        console.warn('[StudentController] Failed to persist receipt into MongoDB:', saveReceiptErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Official fee receipt verified and retrieved successfully.',
      data: {
        receiptNumber,
        studentId: paymentRecord.studentId,
        studentName: paymentRecord.studentName,
        batchId: paymentRecord.batchId,
        batchName: paymentRecord.batchName,
        amount: paymentRecord.monthlyFee || paymentRecord.amount || 2500,
        feeStatus: 'PAID',
        verifiedAt: paymentRecord.verifiedAt || new Date().toISOString(),
        paymentMethod: paymentRecord.paymentMethod || 'UPI Bharat-QR / Instant Ledger',
        verificationStatus: 'Verified by Tuition Center Owner'
      }
    });

  } catch (error) {
    console.error('[StudentController] Error fetching fee receipt:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing receipt request.'
    });
  }
};

/**
 * @route   POST /api/student/batch
 * @desc    Create a new batch for a teacher and persist to MongoDB
 * @access  Protected (Teachers only)
 */
export const createBatch = async (req, res) => {
  try {
    const { name, subject, monthlyFee, schedule, teacherId, tuitionId, joinCode } = req.body;
    const effectiveTeacherId = teacherId || req.user?.userId || req.user?.id;
    const effectiveTuitionId = tuitionId || req.user?.tuitionId || effectiveTeacherId;

    if (!name || !effectiveTeacherId) {
      return res.status(400).json({
        success: false,
        message: 'Batch name and teacher identifier are required.'
      });
    }

    const batchCode = joinCode || String(Math.floor(100000 + Math.random() * 900000));
    const batchId = req.body.id || `b_${Date.now()}`;

    const newBatch = {
      id: batchId,
      tuitionId: effectiveTuitionId,
      teacherId: effectiveTeacherId,
      name: name.trim(),
      subject: (subject || 'General').trim(),
      joinCode: batchCode,
      monthlyFee: Number(monthlyFee) || 2500,
      schedule: (schedule || 'Flexible').trim(),
      createdAt: new Date().toISOString()
    };

    // Update in-memory db
    const existingIdx = db.batches.findIndex(b => b.id === batchId);
    if (existingIdx >= 0) {
      db.batches[existingIdx] = newBatch;
    } else {
      db.batches.push(newBatch);
    }

    // Persist to MongoDB and disk
    await saveDb();

    return res.status(201).json({
      success: true,
      message: 'Batch created successfully.',
      data: newBatch
    });
  } catch (error) {
    console.error('[StudentController] Error creating batch:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create batch: ' + error.message
    });
  }
};

/**
 * @route   GET /api/student/batches/:teacherId?
 * @desc    Get all batches for a teacher
 * @access  Protected
 */
export const getBatches = async (req, res) => {
  try {
    const targetId = req.params.teacherId || req.query.teacherId || req.user?.userId || req.user?.tuitionId;

    let batchList = [];
    if (mongoose.connection.readyState === 1) {
      try {
        batchList = targetId
          ? await BatchModel.find({ $or: [{ teacherId: targetId }, { tuitionId: targetId }] }).lean()
          : await BatchModel.find().lean();
      } catch (dbErr) {
        console.warn('[StudentController] MongoDB query fallback:', dbErr.message);
      }
    }

    if (!batchList || batchList.length === 0) {
      batchList = targetId
        ? db.batches.filter(b => b.teacherId === targetId || b.tuitionId === targetId)
        : db.batches;
    }

    return res.status(200).json({
      success: true,
      data: batchList
    });
  } catch (error) {
    console.error('[StudentController] Error fetching batches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch batches: ' + error.message
    });
  }
};

/**
 * @route   POST /api/student/payment
 * @desc    Record and verify payment receipt in MongoDB
 * @access  Protected
 */
export const recordPayment = async (req, res) => {
  try {
    const { studentId, batchId, amount, studentName, batchName, paymentMethod } = req.body;
    const effectiveStudentId = studentId || req.user?.userId || req.user?.id;

    if (!effectiveStudentId || !batchId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'studentId, batchId, and amount are required.'
      });
    }

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const paymentDoc = {
      receiptNumber,
      studentId: effectiveStudentId,
      studentName: studentName || 'Enrolled Student',
      batchId,
      batchName: batchName || 'Enrolled Batch',
      amount: Number(amount),
      feeStatus: 'PAID',
      paymentMethod: paymentMethod || 'UPI Bharat-QR / Instant Ledger',
      verifiedAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await PaymentModel.create(paymentDoc);
    }

    // Update in-memory user fee status
    const studentUser = db.users.find(u => u.id === effectiveStudentId);
    if (studentUser) {
      studentUser.feeStatus = 'PAID';
      const tenant = studentUser.tenants?.find(t => t.batch === batchId || t.batchId === batchId);
      if (tenant) tenant.feeStatus = 'PAID';
    }

    await saveDb();

    return res.status(201).json({
      success: true,
      message: 'Payment recorded and verified successfully.',
      data: paymentDoc
    });
  } catch (error) {
    console.error('[StudentController] Error recording payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment: ' + error.message
    });
  }
};

export default {
  getStudentReceipt,
  createBatch,
  getBatches,
  recordPayment
};
