import express from 'express';
import { handleExportData, getExportAuditLogs } from '../controllers/exportController.js';
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

/**
 * @route   GET /api/export/audit-logs
 * @desc    Retrieve export activity logs.
 * @access  SUPER_ADMIN and TUITION_OWNER
 */
router.get(
  '/audit-logs',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'TUITION_OWNER'),
  getExportAuditLogs
);

export default router;

