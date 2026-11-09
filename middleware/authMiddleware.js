import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edumaster_secure_jwt_secret_key_2026';

/**
 * Middleware: Verify JWT and attach tenant context to request
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired authorization token.'
      });
    }

    // Attach decoded user info: { userId, role, tuitionId, name, email }
    req.user = user;
    next();
  });
};

/**
 * Middleware: Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles e.g. 'TEACHER', 'SUPER_ADMIN'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles.`
      });
    }
    next();
  };
};

/**
 * Middleware: Multi-Tenant Isolation Enforcement
 * Verifies that the resource's tuitionId matches the requester's active tenant
 */
export const enforceTenantIsolation = (req, res, next) => {
  const targetTuitionId = req.params.tuitionId || req.body.tuitionId || req.query.tuitionId;

  if (targetTuitionId && req.user.role !== 'SUPER_ADMIN') {
    if (req.user.tuitionId !== targetTuitionId) {
      return res.status(403).json({
        success: false,
        message: 'Tenant violation: You do not have permission to access data belonging to another tuition center.'
      });
    }
  }

  next();
};

export default {
  authenticateToken,
  authorizeRoles,
  enforceTenantIsolation
};
