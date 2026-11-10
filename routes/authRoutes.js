import express from 'express';
import { 
  verifyJoinCode,
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
 * @route   POST /api/auth/verify-join-code
 * @desc    Validate teacher/tuition join code before student account creation
 * @access  Public
 */
router.post('/verify-join-code', verifyJoinCode);

/**
 * @route   POST /api/auth/register-student
 * @desc    Self-register student with verified teacher/tuition join code
 * @access  Public
 */
router.post('/register-student', registerStudent);

/**
 * @route   POST /api/auth/regenerate-join-code
 * @desc    Regenerate teacher's unique tuition registration code
 * @access  Protected (Teachers only)
 */
router.post('/regenerate-join-code', authenticateToken, authorizeRoles('TEACHER', 'TUITION_OWNER'), regenerateTeacherJoinCode);

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
