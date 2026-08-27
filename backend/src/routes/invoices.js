const express = require('express');
const { z } = require('zod');
const { query, withTransaction } = require('../db/pool');
const { requireAuth, requirePermission } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { calculateInvoice } = require('../services/invoiceCalculator');
const { generateInvoicePdf } = require('../services/invoicePdfGenerator');
const { getStorage } = require('../services/storage');

const router = express.Router();
router.use(requireAuth);

const itemSchema = z.object({ description: z.string().min(1), unit: z.string().default('unit'), quantity: z.number().positive(), unitPrice: z.number().nonnegative() });
const invoiceSchema = z.object({ clientId: z.string().uuid().optional().nullable(), projectId: z.string().uuid().optional().nullable(), quoteId: z.string().uuid().optional().nullable(), currency: z.string().default('GHS'), issueDate: z.string().optional(), dueDate: z.string().optional().nullable(), notes: z.string().optional(), markupAmount: z.number().nonnegative().default(0), vatRate: z.number().min(0).max(1).optional(), nhilRate: z.number().min(0).max(1).optional(), getfundRate: z.number().min(0).max(1).optional(), withholdingRate: z.number().min(0).max(1).optional(), items: z.array(itemSchema).min(1) });

function invoiceNumber() { return `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`; }

async function loadInvoice(id) {
  const invoice = await query('SELECT i.*, c.name AS client_name, p.name AS project_name FROM invoices i LEFT JOIN clients c ON c.id=i.client_id LEFT JOIN projects p ON p.id=i.project_id WHERE i.id=$1', [id]);
  if (!invoice.rowCount) return null;
  const row = invoice.rows[0];
  const items = await query('SELECT * FROM invoice_items WHERE invoice_id=$1 ORDER BY sort_order', [id]);
  const payments = await query('SELECT * FROM invoice_payments WHERE invoice_id=$1 ORDER BY paid_at DESC', [id]);
  const client = row.client_id ? await query('SELECT * FROM clients WHERE id=$1', [row.client_id]) : null;
  const project = row.project_id ? await query('SELECT * FROM projects WHERE id=$1', [row.project_id]) : null;
  const paid = payments.rows.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return { ...row, items: items.rows, payments: payments.rows, client: client?.rows[0] || null, project: project?.rows[0] || null, amount_paid: paid, balance_due: Number(row.net_amount_payable) - paid };
}

router.get('/', requirePermission('invoices:read'), asyncHandler(async (req, res) => { const result = await query('SELECT i.*, c.name AS client_name, p.name AS project_name FROM invoices i LEFT JOIN clients c ON c.id=i.client_id LEFT JOIN projects p ON p.id=i.project_id ORDER BY i.created_at DESC LIMIT 300'); res.json(result.rows); }));

router.get('/:id', requirePermission('invoices:read'), asyncHandler(async (req, res) => { const invoice = await loadInvoice(req.params.id); if (!invoice) return res.status(404).json({ error: 'Invoice not found' }); res.json(invoice); }));

router.post('/', requirePermission('invoices:write'), asyncHandler(async (req, res) => {
  const parsed = invoiceSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const taxResult = await query("SELECT value FROM company_settings WHERE key='tax'");
  const calc = calculateInvoice(d.items, { ...(taxResult.rows[0]?.value || {}), ...d });
  const invoice = await withTransaction(async (client) => {
    const result = await client.query(`INSERT INTO invoices (invoice_number,client_id,project_id,quote_id,currency,issue_date,due_date,notes,subtotal,markup_amount,taxable_value,nhil_amount,getfund_amount,vat_amount,withholding_amount,gross_total,net_amount_payable,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`, [invoiceNumber(), d.clientId || null, d.projectId || null, d.quoteId || null, d.currency, d.issueDate || new Date().toISOString().slice(0, 10), d.dueDate || null, d.notes || null, calc.subtotal, calc.markupAmount, calc.taxableValue, calc.nhilAmount, calc.getfundAmount, calc.vatAmount, calc.withholdingAmount, calc.grossTotal, calc.netAmountPayable, req.user.id]);
    for (let index = 0; index < calc.lineItems.length; index += 1) { const item = calc.lineItems[index]; await client.query('INSERT INTO invoice_items (invoice_id,description,unit,quantity,unit_price,line_total,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', [result.rows[0].id, item.description, item.unit, item.quantity, item.unitPrice, item.lineTotal, index]); }
    return result.rows[0];
  });
  res.status(201).json(await loadInvoice(invoice.id));
}));

router.post('/:id/issue', requirePermission('invoices:write'), asyncHandler(async (req, res) => { const result = await query("UPDATE invoices SET status='issued', updated_at=now() WHERE id=$1 AND status='draft' RETURNING id", [req.params.id]); if (!result.rowCount) return res.status(409).json({ error: 'Only draft invoices can be issued' }); res.json(await loadInvoice(req.params.id)); }));

router.post('/:id/payments', requirePermission('invoices:write'), asyncHandler(async (req, res) => { const parsed = z.object({ amount: z.number().positive(), method: z.string().min(1), reference: z.string().optional(), paidAt: z.string().optional(), notes: z.string().optional() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message }); const d = parsed.data; const invoice = await loadInvoice(req.params.id); if (!invoice) return res.status(404).json({ error: 'Invoice not found' }); if (d.amount > invoice.balance_due) return res.status(400).json({ error: 'Payment exceeds invoice balance' }); await query('INSERT INTO invoice_payments (invoice_id,amount,method,reference,paid_at,notes,recorded_by) VALUES ($1,$2,$3,$4,$5,$6,$7)', [req.params.id, d.amount, d.method, d.reference || null, d.paidAt || new Date().toISOString().slice(0, 10), d.notes || null, req.user.id]); const status = d.amount === invoice.balance_due ? 'paid' : 'part_paid'; await query('UPDATE invoices SET status=$1, updated_at=now() WHERE id=$2', [status, req.params.id]); res.status(201).json(await loadInvoice(req.params.id)); }));

router.post('/:id/generate-pdf', requirePermission('invoices:read'), asyncHandler(async (req, res) => { const invoice = await loadInvoice(req.params.id); if (!invoice) return res.status(404).json({ error: 'Invoice not found' }); const settingsResult = await query("SELECT key,value FROM company_settings WHERE key IN ('company','payment')"); const settings = Object.fromEntries(settingsResult.rows.map((row) => [row.key, row.value])); const pdf = await generateInvoicePdf(invoice, { ...settings.company, ...settings.payment }); const storage = getStorage(); const saved = await storage.save({ buffer: pdf, originalName: `${invoice.invoice_number}.pdf`, folder: `invoices/${invoice.id}` }); const doc = await query("INSERT INTO documents (project_id,client_id,category,file_name,storage_key,storage_driver,mime_type,size_bytes,uploaded_by) VALUES ($1,$2,'invoice',$3,$4,$5,'application/pdf',$6,$7) RETURNING id", [invoice.project_id, invoice.client_id, `${invoice.invoice_number}.pdf`, saved.storageKey, saved.driver, pdf.length, req.user.id]); res.json({ documentId: doc.rows[0].id, downloadUrl: `/api/documents/${doc.rows[0].id}/download` }); }));

module.exports = router;