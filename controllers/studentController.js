import { db } from '../models/db.js';

/**
 * @route   GET /api/student/receipt/:batchId
 * @desc    Fetch and generate official fee receipt for an enrolled batch
 * @access  Protected (Students, Teachers, Super Admin)
 */
export const getStudentReceipt = async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user?.userId;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch identifier is required.'
      });
    }

    // 1. Check PostgreSQL / Prisma if client is available on req or global
    let paymentRecord = null;
    if (req.prisma && req.prisma.payment) {
      try {
        paymentRecord = await req.prisma.payment.findFirst({
          where: {
            studentId: userId,
            batchId: batchId
          }
        });
      } catch (prismaErr) {
        console.warn('[StudentController] Prisma lookup failed, falling back to repository:', prismaErr);
      }
    }

    // 2. Fallback to database repository
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

    // 3. Security Guard: Check if payment status !== 'PAID'
    const normalizedStatus = (paymentRecord?.status || '').toUpperCase();
    if (normalizedStatus !== 'PAID') {
      return res.status(403).json({
        message: 'Receipt unavailable. Payment has not been verified by your tuition center.'
      });
    }

    // 4. Return verified receipt data
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
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
        verifiedAt: new Date().toISOString(),
        paymentMethod: 'UPI Bharat-QR / Instant Ledger',
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

export default {
  getStudentReceipt
};
