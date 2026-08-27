const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { expandPermissions } = require('../services/permissions');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');

const router = express.Router();

// Slow down brute-force login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const { email, password } = parsed.data;

  const result = await query(
    'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE lower(email) = lower($1)',
    [email]
  );
  const user = result.rows[0];

  // Constant-shape response whether or not the user exists, to avoid user enumeration
  const dummyHash = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8bTzY7t3Vw3Q2s3z0k5f5s5s5s5s5u';
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : dummyHash);

  if (!user || !user.is_active || !passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  await logActivity({ userId: user.id, action: 'login', entityType: 'user', entityId: user.id });

  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const overridesResult = await query(
    'SELECT permission, allowed FROM user_permission_overrides WHERE user_id = $1',
    [req.user.id]
  );
  const permissions = Array.from(expandPermissions(req.user.role, overridesResult.rows));

  res.json({
    id: req.user.id,
    fullName: req.user.full_name,
    email: req.user.email,
    role: req.user.role,
    permissions,
  });
}));

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { currentPassword, newPassword } = parsed.data;

  const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const ok = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

  const newHash = await bcrypt.hash(newPassword, 12);
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [newHash, req.user.id]);
  await logActivity({ userId: req.user.id, action: 'change_password', entityType: 'user', entityId: req.user.id });

  res.json({ ok: true });
}));

module.exports = router;
