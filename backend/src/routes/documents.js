const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { query } = require('../db/pool');
const { requireAuth, requirePermission } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');
const { getStorage } = require('../services/storage');

const router = express.Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

const uploadMetaSchema = z.object({
  projectId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  category: z.enum(['quote_pdf', 'contract', 'invoice', 'drawing', 'photo', 'general']).default('general'),
});

router.post('/', requirePermission('documents:write'), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (expected multipart field "file")' });

  const parsed = uploadMetaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const meta = parsed.data;

  const storage = getStorage();
  const folder = meta.projectId ? `projects/${meta.projectId}` : 'general';
  const { storageKey, driver } = await storage.save({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    folder,
  });

  const result = await query(
    `INSERT INTO documents (project_id, quote_id, client_id, category, file_name, storage_key, storage_driver, mime_type, size_bytes, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      meta.projectId || null, meta.quoteId || null, meta.clientId || null, meta.category,
      req.file.originalname, storageKey, driver, req.file.mimetype, req.file.size, req.user.id,
    ]
  );

  await logActivity({ userId: req.user.id, action: 'upload', entityType: 'document', entityId: result.rows[0].id });
  res.status(201).json(result.rows[0]);
}));

router.get('/', requirePermission('documents:read'), asyncHandler(async (req, res) => {
  const { projectId, quoteId, clientId, category } = req.query;
  const conditions = [];
  const params = [];
  if (projectId) { params.push(projectId); conditions.push(`project_id = $${params.length}`); }
  if (quoteId) { params.push(quoteId); conditions.push(`quote_id = $${params.length}`); }
  if (clientId) { params.push(clientId); conditions.push(`client_id = $${params.length}`); }
  if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(`SELECT * FROM documents ${where} ORDER BY created_at DESC LIMIT 300`, params);
  res.json(result.rows);
}));

async function sendDocument(req, res, disposition) {
  const result = await query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Document not found' });
  const doc = result.rows[0];

  const storage = getStorage();
  const buffer = await storage.read(doc.storage_key);

  res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
  const safeName = doc.file_name.replace(/[\\"\r\n]/g, '_');
  res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
  res.send(buffer);
}

router.get('/:id/download', requirePermission('documents:read'), asyncHandler(async (req, res) => {
  await sendDocument(req, res, 'attachment');
}));

router.get('/:id/preview', requirePermission('documents:read'), asyncHandler(async (req, res) => {
  await sendDocument(req, res, 'inline');
}));

router.delete('/:id', requirePermission('documents:write'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Document not found' });

  const storage = getStorage();
  await storage.delete(result.rows[0].storage_key);
  await query('DELETE FROM documents WHERE id = $1', [req.params.id]);
  await logActivity({ userId: req.user.id, action: 'delete', entityType: 'document', entityId: req.params.id });

  res.status(204).end();
}));

module.exports = router;
