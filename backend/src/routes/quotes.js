const express = require('express');
const { z } = require('zod');
const { query, withTransaction } = require('../db/pool');
const { requireAuth, requirePermission } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog');
const { calculateQuote, defaultDownPaymentPct } = require('../services/quoteCalculator');
const { generateQuotePdf } = require('../services/pdfGenerator');
const { getStorage } = require('../services/storage');
const { sendEmail } = require('../services/email');
const { sendTeamsNotification } = require('../services/teams');

const router = express.Router();
router.use(requireAuth);

function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `QT-${year}-${rand}`;
}

const itemSchema = z.object({
  category: z.enum(['materials', 'labor', 'equipment', 'subcontractor', 'other']).default('materials'),
  description: z.string().min(1),
  unit: z.string().default('unit'),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const quoteSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  currency: z.string().default(process.env.DEFAULT_CURRENCY || 'GHS'),
  suppliesMaterials: z.boolean().default(false),
  overheadPct: z.number().min(0).max(1).optional(),
  profitPct: z.number().min(0).max(1).optional(),
  contingencyPct: z.number().min(0).max(1).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  downPaymentPct: z.number().min(0).max(1).optional(),
  escalationClause: z.boolean().default(true),
  validUntil: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, 'At least one line item is required'),
});

async function loadFullQuote(id) {
  const q = await query('SELECT * FROM quotes WHERE id = $1', [id]);
  if (q.rowCount === 0) return null;
  const quote = q.rows[0];

  const items = await query('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY sort_order', [id]);
  const client = quote.client_id ? await query('SELECT * FROM clients WHERE id = $1', [quote.client_id]) : null;
  const project = quote.project_id ? await query('SELECT * FROM projects WHERE id = $1', [quote.project_id]) : null;

  return {
    ...quote,
    items: items.rows,
    client: client?.rows[0] || null,
    project: project?.rows[0] || null,
    balance_amount: Number(quote.total) - Number(quote.down_payment_amount),
  };
}

router.get('/', requirePermission('quotes:read'), asyncHandler(async (req, res) => {
  const { projectId, status } = req.query;
  const conditions = [];
  const params = [];
  if (projectId) { params.push(projectId); conditions.push(`q.project_id = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`q.status = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT q.*, c.name AS client_name, p.name AS project_name
     FROM quotes q
     LEFT JOIN clients c ON c.id = q.client_id
     LEFT JOIN projects p ON p.id = q.project_id
     ${where} ORDER BY q.created_at DESC LIMIT 300`,
    params
  );
  res.json(result.rows);
}));

router.get('/:id', requirePermission('quotes:read'), asyncHandler(async (req, res) => {
  const quote = await loadFullQuote(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  res.json(quote);
}));

// Create a quote: calculates totals server-side (never trusts client-sent totals)
router.post('/', requirePermission('quotes:write'), asyncHandler(async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;

  const calc = calculateQuote(d.items, {
    overheadPct: d.overheadPct,
    profitPct: d.profitPct,
    contingencyPct: d.contingencyPct,
    taxRate: d.taxRate,
    downPaymentPct: d.downPaymentPct,
    suppliesMaterials: d.suppliesMaterials,
  });

  const quote = await withTransaction(async (client) => {
    const qResult = await client.query(
      `INSERT INTO quotes (
         quote_number, project_id, client_id, currency, supplies_materials,
         overhead_pct, profit_pct, contingency_pct, tax_rate,
         subtotal, overhead_amount, profit_amount, contingency_amount, tax_amount, total,
         down_payment_pct, down_payment_amount, escalation_clause, valid_until, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        generateQuoteNumber(), d.projectId || null, d.clientId || null, d.currency, d.suppliesMaterials,
        calc.overheadPct, calc.profitPct, calc.contingencyPct, calc.taxRate,
        calc.subtotal, calc.overheadAmount, calc.profitAmount, calc.contingencyAmount, calc.taxAmount, calc.total,
        calc.downPaymentPct, calc.downPaymentAmount, d.escalationClause, d.validUntil || null, req.user.id,
      ]
    );
    const quoteRow = qResult.rows[0];

    for (let i = 0; i < calc.lineItems.length; i++) {
      const item = calc.lineItems[i];
      await client.query(
        `INSERT INTO quote_items (quote_id, category, description, unit, quantity, unit_price, line_total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [quoteRow.id, item.category, item.description, item.unit, item.quantity, item.unitPrice, item.lineTotal, i]
      );
    }
    return quoteRow;
  });

  await logActivity({ userId: req.user.id, action: 'create', entityType: 'quote', entityId: quote.id });
  res.status(201).json(await loadFullQuote(quote.id));
}));

// Recalculate an existing draft quote's items/percentages
router.put('/:id', requirePermission('quotes:write'), asyncHandler(async (req, res) => {
  const existing = await query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) return res.status(404).json({ error: 'Quote not found' });
  if (existing.rows[0].status !== 'draft') {
    return res.status(409).json({ error: 'Only draft quotes can be edited. Create a new revision instead.' });
  }

  const parsed = quoteSchema.partial({ items: false }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const cur = existing.rows[0];

  const calc = calculateQuote(d.items || [], {
    overheadPct: d.overheadPct ?? cur.overhead_pct,
    profitPct: d.profitPct ?? cur.profit_pct,
    contingencyPct: d.contingencyPct ?? cur.contingency_pct,
    taxRate: d.taxRate ?? cur.tax_rate,
    downPaymentPct: d.downPaymentPct ?? cur.down_payment_pct,
    suppliesMaterials: d.suppliesMaterials ?? cur.supplies_materials,
  });

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE quotes SET currency=$1, supplies_materials=$2, overhead_pct=$3, profit_pct=$4, contingency_pct=$5,
         tax_rate=$6, subtotal=$7, overhead_amount=$8, profit_amount=$9, contingency_amount=$10, tax_amount=$11,
         total=$12, down_payment_pct=$13, down_payment_amount=$14, escalation_clause=$15, valid_until=$16, updated_at=now()
       WHERE id=$17`,
      [
        d.currency ?? cur.currency, d.suppliesMaterials ?? cur.supplies_materials, calc.overheadPct, calc.profitPct,
        calc.contingencyPct, calc.taxRate, calc.subtotal, calc.overheadAmount, calc.profitAmount,
        calc.contingencyAmount, calc.taxAmount, calc.total, calc.downPaymentPct, calc.downPaymentAmount,
        d.escalationClause ?? cur.escalation_clause, d.validUntil ?? cur.valid_until, req.params.id,
      ]
    );

    if (d.items) {
      await client.query('DELETE FROM quote_items WHERE quote_id = $1', [req.params.id]);
      for (let i = 0; i < calc.lineItems.length; i++) {
        const item = calc.lineItems[i];
        await client.query(
          `INSERT INTO quote_items (quote_id, category, description, unit, quantity, unit_price, line_total, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [req.params.id, item.category, item.description, item.unit, item.quantity, item.unitPrice, item.lineTotal, i]
        );
      }
    }
  });

  await logActivity({ userId: req.user.id, action: 'update', entityType: 'quote', entityId: req.params.id });
  res.json(await loadFullQuote(req.params.id));
}));

// Generate (or regenerate) the PDF for a quote and store it as a document
router.post('/:id/generate-pdf', requirePermission('quotes:write'), asyncHandler(async (req, res) => {
  const quote = await loadFullQuote(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  const pdfBuffer = await generateQuotePdf(quote);
  const storage = getStorage();
  const { storageKey, driver } = await storage.save({
    buffer: pdfBuffer,
    originalName: `${quote.quote_number}.pdf`,
    folder: quote.project_id ? `projects/${quote.project_id}/quotes` : 'quotes',
  });

  const doc = await query(
    `INSERT INTO documents (project_id, quote_id, client_id, category, file_name, storage_key, storage_driver, mime_type, size_bytes, uploaded_by)
     VALUES ($1,$2,$3,'quote_pdf',$4,$5,$6,'application/pdf',$7,$8) RETURNING *`,
    [quote.project_id, quote.id, quote.client_id, `${quote.quote_number}.pdf`, storageKey, driver, pdfBuffer.length, req.user.id]
  );

  await query('UPDATE quotes SET pdf_document_id = $1 WHERE id = $2', [doc.rows[0].id, quote.id]);
  await logActivity({ userId: req.user.id, action: 'generate_pdf', entityType: 'quote', entityId: quote.id });

  res.json({ documentId: doc.rows[0].id, downloadUrl: `/api/documents/${doc.rows[0].id}/download` });
}));

// Mark a quote as sent: (re)generates the PDF, emails the client, notifies Teams
router.post('/:id/send', requirePermission('quotes:send'), asyncHandler(async (req, res) => {
  const quote = await loadFullQuote(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!quote.client?.email) {
    return res.status(400).json({ error: 'This quote\'s client has no email address on file' });
  }

  const pdfBuffer = await generateQuotePdf(quote);
  const storage = getStorage();
  const { storageKey, driver } = await storage.save({
    buffer: pdfBuffer,
    originalName: `${quote.quote_number}.pdf`,
    folder: quote.project_id ? `projects/${quote.project_id}/quotes` : 'quotes',
  });
  const doc = await query(
    `INSERT INTO documents (project_id, quote_id, client_id, category, file_name, storage_key, storage_driver, mime_type, size_bytes, uploaded_by)
     VALUES ($1,$2,$3,'quote_pdf',$4,$5,$6,'application/pdf',$7,$8) RETURNING *`,
    [quote.project_id, quote.id, quote.client_id, `${quote.quote_number}.pdf`, storageKey, driver, pdfBuffer.length, req.user.id]
  );

  await query(
    `UPDATE quotes SET status = 'sent', pdf_document_id = $1, updated_at = now() WHERE id = $2`,
    [doc.rows[0].id, quote.id]
  );

  const emailResult = await sendEmail({
    to: quote.client.email,
    subject: `Quotation ${quote.quote_number} — Lumora DeMoore Properties`,
    html: `<p>Dear ${quote.client.contact_person || quote.client.name},</p>
           <p>Please find attached quotation <strong>${quote.quote_number}</strong>
           for ${quote.project?.name || 'your project'}, totalling <strong>${quote.currency} ${Number(quote.total).toLocaleString()}</strong>.</p>
           <p>Kind regards,<br/>Lumora DeMoore Properties</p>`,
    attachments: [{ filename: `${quote.quote_number}.pdf`, content: pdfBuffer }],
    eventType: 'quote_sent',
    relatedProjectId: quote.project_id,
    relatedQuoteId: quote.id,
  });

  await sendTeamsNotification({
    title: `Quote sent: ${quote.quote_number}`,
    text: `${req.user.full_name} sent quote ${quote.quote_number} (${quote.currency} ${Number(quote.total).toLocaleString()}) to ${quote.client.name}.`,
    eventType: 'quote_sent',
    relatedProjectId: quote.project_id,
    relatedQuoteId: quote.id,
  });

  await logActivity({ userId: req.user.id, action: 'send', entityType: 'quote', entityId: quote.id });

  res.json({
    ok: true,
    emailSent: emailResult.sent,
    emailNote: emailResult.sent ? undefined : 'Email not sent — SMTP is not configured yet (see .env).',
    documentId: doc.rows[0].id,
  });
}));

router.post('/:id/status', requirePermission('quotes:write'), asyncHandler(async (req, res) => {
  const schema = z.object({ status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'superseded']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const result = await query('UPDATE quotes SET status = $1, updated_at = now() WHERE id = $2 RETURNING *', [parsed.data.status, req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Quote not found' });

  await logActivity({ userId: req.user.id, action: 'status_change', entityType: 'quote', entityId: req.params.id, details: { status: parsed.data.status } });

  if (parsed.data.status === 'accepted') {
    await sendTeamsNotification({
      title: `Quote accepted: ${result.rows[0].quote_number}`,
      text: `Quote ${result.rows[0].quote_number} was marked as accepted by ${req.user.full_name}.`,
      eventType: 'quote_accepted',
      relatedQuoteId: req.params.id,
      relatedProjectId: result.rows[0].project_id,
    });
  }

  res.json(result.rows[0]);
}));

module.exports = router;
