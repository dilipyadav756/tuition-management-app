import express from 'express';
import { 
  verifyBatchCode,
  joinBatch,
  regenerateBatchCode,
  registerStudent,
  regenerateTeacherJoinCode,
  registerTeacher, 
  login, 
  forgotPassword, 
  verifyOtp 
} from '../controllers/authController.js';
import { 
  authenticateToken, 
  authorizeRoles 
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register-student
 * @desc    Self-register student independently without requiring batch code
 * @access  Public
 */
router.post('/register-student', registerStudent);

/**
 * @route   POST /api/auth/verify-batch-code
 * @desc    Validate 6-digit batch code and return resolved batch details
 * @access  Public
 */
router.post('/verify-batch-code', verifyBatchCode);

/**
 * @route   POST /api/auth/join-batch
 * @desc    Enroll authenticated student into a batch via verified batch code
 * @access  Protected (Students)
 */
router.post('/join-batch', joinBatch);

/**
 * @route   POST /api/auth/regenerate-batch-code
 * @desc    Regenerate unique 6-digit batch code for an existing batch
 * @access  Protected (Teachers only)
 */
router.post('/regenerate-batch-code', regenerateBatchCode);

/**
 * @route   POST /api/auth/register-teacher
 * @desc    Create Tuition record + Teacher user in DB. Hash password.
 * @access  Public
 */
router.post('/register-teacher', registerTeacher);

/**
 * @route   POST /api/auth/login
 * @desc    Verify credentials, check user role (TEACHER, STUDENT, SUPER_ADMIN), and return JWT token.
 *          Handles multi-tenant selection for students enrolled across multiple tuition centers.
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP or password reset token to user's registered contact.
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify phone OTP for passwordless login.
 * @access  Public
 */
router.post('/verify-otp', verifyOtp);

export default router;
