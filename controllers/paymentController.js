import { db, saveDb } from '../models/db.js';

/**
 * Validates standard Indian UPI Virtual Payment Address (VPA) format.
 * Format: username@bankhandle (e.g., sharma@oksbi, 9876543210@paytm, anita.verma@okaxis)
 */
export const isValidUpiId = (upiId) => {
  if (!upiId || typeof upiId !== 'string') return false;
  const trimmed = upiId.trim();
  // Standard UPI regex: 2 to 256 alphanumeric characters, dots, hyphens, underscores before '@', followed by 2 to 64 alphabetic bank handle
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(trimmed);
};

/**
 * @route   GET /api/payment/upi-id/:teacherId?
 * @desc    Fetch the verified UPI ID for a teacher / tuition center
 * @access  Protected (Authenticated Teachers & Students)
 */
export const getTeacherUpi = async (req, res) => {
  try {
    const user = req.user;
    const requestedTeacherId = req.params.teacherId || req.query.teacherId;

    let targetTuitionId = null;
    let targetTeacher = null;

    if (user.role === 'TEACHER' || user.role === 'TUITION_OWNER') {
      // Teachers can view their own settings
      targetTuitionId = user.tuitionId;
      targetTeacher = db.users.find(u => u.id === user.userId || u.tuitionId === user.tuitionId);
    } else if (user.role === 'STUDENT') {
      // Students can view their assigned teacher's UPI ID
      if (requestedTeacherId) {
        targetTeacher = db.users.find(u => u.id === requestedTeacherId || u.tuitionId === requestedTeacherId);
        targetTuitionId = targetTeacher ? targetTeacher.tuitionId : requestedTeacherId;
      } else {
        targetTuitionId = user.tuitionId;
        targetTeacher = db.users.find(u => u.tuitionId === targetTuitionId);
      }
    } else if (user.role === 'SUPER_ADMIN') {
      targetTeacher = db.users.find(u => u.id === requestedTeacherId || u.tuitionId === requestedTeacherId);
      targetTuitionId = targetTeacher ? targetTeacher.tuitionId : requestedTeacherId;
    }

    const tuition = db.tuitions.find(t => t.id === targetTuitionId || t.ownerId === targetTeacher?.id);
    const activeUpiId = (targetTeacher?.upiId || tuition?.upiId || '').trim();

    return res.status(200).json({
      success: true,
      data: {
        teacherId: targetTeacher?.id || requestedTeacherId,
        teacherName: targetTeacher?.name || tuition?.name || 'Tuition Instructor',
        tuitionName: tuition?.name || 'Tuition Center',
        upiId: activeUpiId || null,
        isConfigured: Boolean(activeUpiId)
      }
    });
  } catch (error) {
    console.error('[PaymentController] Error fetching UPI ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment settings.'
    });
  }
};

/**
 * @route   PUT /api/payment/upi-id
 * @desc    Update teacher's personal UPI ID in database
 * @access  Protected (TEACHER & TUITION_OWNER only)
 */
export const updateTeacherUpi = async (req, res) => {
  try {
    const user = req.user;
    const { upiId } = req.body;

    // 1. Strict Role Authorization
    if (user.role !== 'TEACHER' && user.role !== 'TUITION_OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only authenticated teachers can configure payment settings.'
      });
    }

    // 2. Validate UPI ID format
    if (!upiId || !isValidUpiId(upiId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI ID format. Please provide a valid Virtual Payment Address (e.g., yourname@bank or 9876543210@paytm).'
      });
    }

    const sanitizedUpiId = upiId.trim().toLowerCase();

    // 3. Database Persistence: Find and update authenticated teacher and tuition record
    const teacherUser = db.users.find(u => u.id === user.userId || u.id === user.id);
    const tuitionRecord = db.tuitions.find(t => t.id === user.tuitionId || t.ownerId === user.userId || t.ownerId === user.id);

    if (teacherUser) {
      teacherUser.upiId = sanitizedUpiId;
    }
    if (tuitionRecord) {
      tuitionRecord.upiId = sanitizedUpiId;
    }

    // Persist to disk
    saveDb();

    console.log(`[Payment Audit] Teacher ${user.name} (${user.userId}) updated UPI ID to: ${sanitizedUpiId}`);

    return res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully. Students will now pay directly to this UPI ID.',
      data: {
        teacherId: user.userId || user.id,
        tuitionId: user.tuitionId,
        upiId: sanitizedUpiId
      }
    });

  } catch (error) {
    console.error('[PaymentController] Error updating UPI ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving payment settings.'
    });
  }
};

export default {
  isValidUpiId,
  getTeacherUpi,
  updateTeacherUpi
};
