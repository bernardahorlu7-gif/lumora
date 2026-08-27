const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { expandPermissions, hasPermission } = require('../services/permissions');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Account not found or deactivated' });
    }

    const overridesResult = await query(
      'SELECT permission, allowed FROM user_permission_overrides WHERE user_id = $1',
      [user.id]
    );

    req.user = user;
    req.permissions = expandPermissions(user.role, overridesResult.rows);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.permissions || !hasPermission(req.permissions, permission)) {
      return res.status(403).json({ error: `Forbidden — missing permission: ${permission}` });
    }
    next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient role' });
    }
    next();
  };
}

module.exports = { requireAuth, requirePermission, requireRole };
