const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../db/pool');
const { requireAuth, requirePermission, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');

const router = express.Router();
router.use(requireAuth);

router.get('/', requirePermission('users:read'), asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, full_name, email, role, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
}));

const createUserSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'project_manager', 'accountant', 'staff']),
});

// Only admins can create staff accounts
router.post('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const u = parsed.data;

  const existing = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [u.email]);
  if (existing.rowCount > 0) return res.status(409).json({ error: 'A user with this email already exists' });

  const hash = await bcrypt.hash(u.password, 12);
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4)
     RETURNING id, full_name, email, role, is_active, created_at`,
    [u.fullName, u.email, hash, u.role]
  );
  await logActivity({ userId: req.user.id, action: 'create', entityType: 'user', entityId: result.rows[0].id });
  res.status(201).json(result.rows[0]);
}));

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['admin', 'project_manager', 'accountant', 'staff']).optional(),
  isActive: z.boolean().optional(),
});

router.put('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const u = parsed.data;

  const existing = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) return res.status(404).json({ error: 'User not found' });
  const cur = existing.rows[0];

  const result = await query(
    `UPDATE users SET full_name=$1, role=$2, is_active=$3, updated_at=now() WHERE id=$4
     RETURNING id, full_name, email, role, is_active`,
    [u.fullName ?? cur.full_name, u.role ?? cur.role, u.isActive ?? cur.is_active, req.params.id]
  );
  await logActivity({ userId: req.user.id, action: 'update', entityType: 'user', entityId: req.params.id });
  res.json(result.rows[0]);
}));

module.exports = router;
