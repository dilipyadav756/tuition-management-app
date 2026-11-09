import express from 'express';
import { 
  registerTeacher, 
  login, 
  forgotPassword, 
  verifyOtp 
} from '../controllers/authController.js';
import { 
  authenticateToken, 
  authorizeRoles, 
  enforceTenantIsolation 
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register-teacher
 * @desc    Create Tuition record + Teacher user in DB. Hash password with bcrypt.
 */
router.post('/register-teacher', registerTeacher);

/**
 * @route   POST /api/auth/login
 * @desc    Verify credentials, check user role (TEACHER, STUDENT, SUPER_ADMIN), and return JWT token.
 *          Handles multi-tenant selection for students enrolled across multiple tuition centers.
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP or password reset token to user's registered contact.
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify phone OTP for passwordless login.
 */
router.post('/verify-otp', verifyOtp);

export default router;
