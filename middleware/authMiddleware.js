import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'edumaster_secure_jwt_secret_key_2026';

// Helper to decode/verify token
const verifyTokenSafe = (token, secret) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Mock token support e.g. jwt_mock_token_...
      if (token.startsWith('jwt_')) {
        return { userId: 'u_user', role: 'TEACHER', tuitionId: 't_inst_1' };
      }
      return null;
    }
    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest('base64url');
    if (expectedSig !== signatureB64) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
};

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

  const user = verifyTokenSafe(token, JWT_SECRET);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }

  // Attach decoded user info: { userId, role, tuitionId, name, email }
  req.user = user;
  next();
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
