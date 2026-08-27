const express = require('express');
const { z } = require('zod');
const { query } = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/projects', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, reference_code, name, description, service, location, scope,
            highlights, completion_date, status
     FROM projects WHERE is_published = true
     ORDER BY completion_date DESC NULLS LAST, created_at DESC LIMIT 100`
  );
  res.json(result.rows);
}));

router.get('/projects/:id', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, reference_code, name, description, service, location, scope,
            highlights, completion_date, status
     FROM projects WHERE id = $1 AND is_published = true`,
    [req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
  res.json(result.rows[0]);
}));

const quoteRequestSchema = z.object({
  fullName: z.string().min(2),
  companyName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  projectType: z.string().optional(),
  location: z.string().optional(),
  projectSize: z.string().optional(),
  description: z.string().optional(),
  preferredStartDate: z.string().optional().nullable(),
  budget: z.string().optional(),
  attachments: z.array(z.string()).max(10).optional(),
});

router.post('/quote-requests', asyncHandler(async (req, res) => {
  const parsed = quoteRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const result = await query(
    `INSERT INTO quote_requests
      (full_name, company_name, email, phone, service, project_type, location,
       project_size, description, preferred_start_date, budget, attachments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id, status, created_at`,
    [d.fullName, d.companyName || null, d.email, d.phone || null, d.service || null,
      d.projectType || null, d.location || null, d.projectSize || null, d.description || null,
      d.preferredStartDate || null, d.budget || null, JSON.stringify(d.attachments || [])]
  );
  res.status(201).json({ ok: true, request: result.rows[0] });
}));

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  message: z.string().min(2),
});

router.post('/contact-requests', asyncHandler(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const result = await query(
    `INSERT INTO contact_requests (full_name, email, phone, company_name, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, status, created_at`,
    [d.fullName, d.email, d.phone || null, d.companyName || null, d.message]
  );
  res.status(201).json({ ok: true, request: result.rows[0] });
}));

router.get('/quote-requests', requireAuth, requirePermission('clients:read'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 300');
  res.json(result.rows);
}));

router.get('/contact-requests', requireAuth, requirePermission('clients:read'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 300');
  res.json(result.rows);
}));

module.exports = router;