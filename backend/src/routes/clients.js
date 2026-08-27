const express = require('express');
const { z } = require('zod');
const { query } = require('../db/pool');
const { requireAuth, requirePermission } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');

const router = express.Router();
router.use(requireAuth);

const clientSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', requirePermission('clients:read'), asyncHandler(async (req, res) => {
  const search = (req.query.search || '').trim();
  const params = [];
  let where = '';
  if (search) {
    params.push(`%${search}%`);
    where = `WHERE name ILIKE $1 OR company_name ILIKE $1 OR email ILIKE $1`;
  }
  const result = await query(
    `SELECT * FROM clients ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  res.json(result.rows);
}));

router.get('/:id', requirePermission('clients:read'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Client not found' });

  const projects = await query('SELECT id, reference_code, name, status FROM projects WHERE client_id = $1', [req.params.id]);
  res.json({ ...result.rows[0], projects: projects.rows });
}));

router.post('/', requirePermission('clients:write'), asyncHandler(async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const c = parsed.data;

  const result = await query(
    `INSERT INTO clients (name, company_name, contact_person, email, phone, address, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [c.name, c.companyName, c.contactPerson, c.email || null, c.phone, c.address, c.notes, req.user.id]
  );
  await logActivity({ userId: req.user.id, action: 'create', entityType: 'client', entityId: result.rows[0].id });
  res.status(201).json(result.rows[0]);
}));

router.put('/:id', requirePermission('clients:write'), asyncHandler(async (req, res) => {
  const parsed = clientSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const c = parsed.data;

  const existing = await query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) return res.status(404).json({ error: 'Client not found' });
  const cur = existing.rows[0];

  const result = await query(
    `UPDATE clients SET name=$1, company_name=$2, contact_person=$3, email=$4, phone=$5, address=$6, notes=$7, updated_at=now()
     WHERE id=$8 RETURNING *`,
    [
      c.name ?? cur.name, c.companyName ?? cur.company_name, c.contactPerson ?? cur.contact_person,
      c.email ?? cur.email, c.phone ?? cur.phone, c.address ?? cur.address, c.notes ?? cur.notes,
      req.params.id,
    ]
  );
  await logActivity({ userId: req.user.id, action: 'update', entityType: 'client', entityId: req.params.id });
  res.json(result.rows[0]);
}));

router.delete('/:id', requirePermission('clients:write'), asyncHandler(async (req, res) => {
  await query('DELETE FROM clients WHERE id = $1', [req.params.id]);
  await logActivity({ userId: req.user.id, action: 'delete', entityType: 'client', entityId: req.params.id });
  res.status(204).end();
}));

module.exports = router;
