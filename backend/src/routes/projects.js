const express = require('express');
const { z } = require('zod');
const { query } = require('../db/pool');
const { requireAuth, requirePermission } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');
const { sendTeamsNotification } = require('../services/teams');
const { sendEmail } = require('../services/email');

const router = express.Router();
router.use(requireAuth);

function generateReferenceCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LDP-${year}-${rand}`;
}

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  service: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  completionDate: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  clientId: z.string().uuid().optional().nullable(),
  status: z.enum(['lead', 'quoted', 'contracted', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  contractType: z.enum(['general_contracting', 'subcontracting']).optional(),
  suppliesMaterials: z.boolean().optional(),
  budget: z.number().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  projectManagerId: z.string().uuid().optional().nullable(),
});

router.get('/', requirePermission('projects:read'), asyncHandler(async (req, res) => {
  const { status, clientId } = req.query;
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`p.status = $${params.length}`); }
  if (clientId) { params.push(clientId); conditions.push(`p.client_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT p.*, c.name AS client_name, u.full_name AS project_manager_name
     FROM projects p
     LEFT JOIN clients c ON c.id = p.client_id
     LEFT JOIN users u ON u.id = p.project_manager_id
     ${where}
     ORDER BY p.created_at DESC LIMIT 300`,
    params
  );
  res.json(result.rows);
}));

router.get('/:id', requirePermission('projects:read'), asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT p.*, c.name AS client_name, c.email AS client_email, u.full_name AS project_manager_name
     FROM projects p
     LEFT JOIN clients c ON c.id = p.client_id
     LEFT JOIN users u ON u.id = p.project_manager_id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });

  const milestones = await query('SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY due_date NULLS LAST', [req.params.id]);
  const quotes = await query('SELECT id, quote_number, status, total, currency, created_at FROM quotes WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);
  const documents = await query('SELECT id, category, file_name, mime_type, size_bytes, created_at FROM documents WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);

  res.json({ ...result.rows[0], milestones: milestones.rows, quotes: quotes.rows, documents: documents.rows });
}));

router.post('/', requirePermission('projects:write'), asyncHandler(async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const p = parsed.data;

  const result = await query(
    `INSERT INTO projects (reference_code, name, description, service, location, scope, highlights, completion_date, is_published, client_id, status, contract_type, supplies_materials, budget, start_date, end_date, project_manager_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
    [
      generateReferenceCode(), p.name, p.description || null, p.service || null, p.location || null,
      p.scope || null, JSON.stringify(p.highlights || []), p.completionDate || null, p.isPublished || false,
      p.clientId || null, p.status || 'lead', p.contractType || null, p.suppliesMaterials || false,
      p.budget || null, p.startDate || null, p.endDate || null, p.projectManagerId || null, req.user.id,
    ]
  );
  const project = result.rows[0];
  await logActivity({ userId: req.user.id, action: 'create', entityType: 'project', entityId: project.id });

  await sendTeamsNotification({
    title: `New project created: ${project.name}`,
    text: `${req.user.full_name} created project ${project.reference_code} (status: ${project.status}).`,
    eventType: 'project_created',
    relatedProjectId: project.id,
  });

  res.status(201).json(project);
}));

router.put('/:id', requirePermission('projects:write'), asyncHandler(async (req, res) => {
  const parsed = projectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const p = parsed.data;

  const existing = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
  const cur = existing.rows[0];
  const statusChanged = p.status && p.status !== cur.status;

  const result = await query(
    `UPDATE projects SET name=$1, description=$2, service=$3, location=$4, scope=$5, highlights=$6,
       completion_date=$7, is_published=$8, client_id=$9, status=$10, contract_type=$11,
       supplies_materials=$12, budget=$13, start_date=$14, end_date=$15, project_manager_id=$16, updated_at=now()
     WHERE id=$17 RETURNING *`,
    [
      p.name ?? cur.name, p.description ?? cur.description, p.service ?? cur.service,
      p.location ?? cur.location, p.scope ?? cur.scope, p.highlights ? JSON.stringify(p.highlights) : cur.highlights,
      p.completionDate ?? cur.completion_date, p.isPublished ?? cur.is_published, p.clientId ?? cur.client_id,
      p.status ?? cur.status, p.contractType ?? cur.contract_type, p.suppliesMaterials ?? cur.supplies_materials,
      p.budget ?? cur.budget, p.startDate ?? cur.start_date, p.endDate ?? cur.end_date,
      p.projectManagerId ?? cur.project_manager_id, req.params.id,
    ]
  );
  await logActivity({ userId: req.user.id, action: 'update', entityType: 'project', entityId: req.params.id, details: { changes: p } });

  if (statusChanged) {
    await sendTeamsNotification({
      title: `Project status updated: ${result.rows[0].name}`,
      text: `${req.user.full_name} moved ${result.rows[0].reference_code} from "${cur.status}" to "${p.status}".`,
      eventType: 'project_status_changed',
      relatedProjectId: req.params.id,
    });
  }

  res.json(result.rows[0]);
}));

// ---- Milestones (used to track who caused a delay, per the company's contract terms) ----

const milestoneSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'done', 'delayed']).optional(),
  delayCausedBy: z.enum(['lumora', 'client', 'third_party', 'none']).optional(),
  notes: z.string().optional(),
});

router.post('/:id/milestones', requirePermission('projects:write'), asyncHandler(async (req, res) => {
  const parsed = milestoneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const m = parsed.data;

  const result = await query(
    `INSERT INTO project_milestones (project_id, title, due_date, status, delay_caused_by, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.params.id, m.title, m.dueDate || null, m.status || 'pending', m.delayCausedBy || 'none', m.notes || null]
  );

  if (m.status === 'delayed' && m.delayCausedBy && m.delayCausedBy !== 'none') {
    const project = await query('SELECT name, reference_code, client_id FROM projects WHERE id = $1', [req.params.id]);
    await sendTeamsNotification({
      title: `Delay flagged on ${project.rows[0]?.reference_code}`,
      text: `Milestone "${m.title}" delayed — cause attributed to: ${m.delayCausedBy}. Per contract terms, delay-related costs are borne by the responsible party.`,
      eventType: 'milestone_delayed',
      relatedProjectId: req.params.id,
    });
  }

  res.status(201).json(result.rows[0]);
}));

router.put('/:id/milestones/:milestoneId', requirePermission('projects:write'), asyncHandler(async (req, res) => {
  const parsed = milestoneSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const m = parsed.data;

  const existing = await query('SELECT * FROM project_milestones WHERE id = $1 AND project_id = $2', [req.params.milestoneId, req.params.id]);
  if (existing.rowCount === 0) return res.status(404).json({ error: 'Milestone not found' });
  const cur = existing.rows[0];

  const result = await query(
    `UPDATE project_milestones SET title=$1, due_date=$2, status=$3, delay_caused_by=$4, notes=$5 WHERE id=$6 RETURNING *`,
    [m.title ?? cur.title, m.dueDate ?? cur.due_date, m.status ?? cur.status, m.delayCausedBy ?? cur.delay_caused_by, m.notes ?? cur.notes, req.params.milestoneId]
  );
  res.json(result.rows[0]);
}));

module.exports = router;
