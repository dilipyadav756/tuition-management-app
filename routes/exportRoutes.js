import express from 'express';
import { handleExportData } from '../controllers/exportController.js';
import { 
  authenticateToken, 
  authorizeRoles, 
  enforceTenantIsolation 
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/export
 * @desc    Generate secure data export (JSON / Excel / CSV) with strict RBAC & tenant isolation.
 * @access  Restricted to TEACHER, TUITION_OWNER, and SUPER_ADMIN roles.
 *          STUDENT access is strictly rejected.
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('TEACHER', 'TUITION_OWNER', 'INSTRUCTOR', 'SUPER_ADMIN'),
  enforceTenantIsolation,
  handleExportData
);

export default router;

