import express from 'express';
import { getTeacherUpi, updateTeacherUpi } from '../controllers/paymentController.js';
import { 
  authenticateToken, 
  authorizeRoles, 
  enforceTenantIsolation 
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/payment/upi-id or /api/payment/upi-id/:teacherId
 * @desc    Get configured UPI ID for student payment modal or teacher dashboard
 * @access  Authenticated (TEACHER, TUITION_OWNER, STUDENT, SUPER_ADMIN)
 */
router.get(
  '/upi-id',
  authenticateToken,
  getTeacherUpi
);

router.get(
  '/upi-id/:teacherId',
  authenticateToken,
  getTeacherUpi
);

/**
 * @route   PUT /api/payment/upi-id
 * @desc    Save/Update teacher's own UPI ID in database
 * @access  TEACHER, TUITION_OWNER only
 */
router.put(
  '/upi-id',
  authenticateToken,
  authorizeRoles('TEACHER', 'TUITION_OWNER'),
  enforceTenantIsolation,
  updateTeacherUpi
);

export default router;

