const PDFDocument = require('pdfkit');

const GOLD = '#a9812f';
const INK = '#1c1b1b';
const MUTED = '#6b6b6b';

function money(amount, currency) {
  const n = Number(amount || 0);
  return `${currency} ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Renders a quote to a PDF buffer.
 * @param {object} quote - row from `quotes` (with calculated totals) + items[] + client{} + project{}
 * @returns {Promise<Buffer>}
 */
function generateQuotePdf(quote) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const currency = quote.currency || 'GHS';

    // Header
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(20).text('LUMORA DEMOORE PROPERTIES', 50, 50);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
      .text('Building Construction · Civil Engineering · Real Estate Development · Architectural Finishing', 50, 74);

    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(14).text('QUOTATION', 400, 50, { align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
      .text(`No. ${quote.quote_number}`, 400, 70, { align: 'right' })
      .text(`Date: ${new Date(quote.created_at || Date.now()).toLocaleDateString('en-GB')}`, 400, 83, { align: 'right' });
    if (quote.valid_until) {
      doc.text(`Valid until: ${new Date(quote.valid_until).toLocaleDateString('en-GB')}`, 400, 96, { align: 'right' });
    }

    doc.moveTo(50, 115).lineTo(545, 115).strokeColor(GOLD).lineWidth(1).stroke();

    // Client / Project block
    let y = 130;
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(10).text('Prepared for', 50, y);
    doc.font('Helvetica').fontSize(10)
      .text(quote.client?.name || quote.client?.company_name || '—', 50, y + 14)
      .text(quote.client?.address || '', 50, y + 28)
      .text(quote.client?.email || '', 50, y + 42);

    doc.font('Helvetica-Bold').fontSize(10).text('Project', 320, y);
    doc.font('Helvetica').fontSize(10)
      .text(quote.project?.name || '—', 320, y + 14, { width: 225 })
      .text(quote.project?.reference_code || '', 320, y + 28);

    y += 75;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
    y += 15;

    // Items table header
    const colX = { desc: 50, cat: 260, qty: 340, unit: 385, price: 430, total: 490 };
    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED);
    doc.text('Description', colX.desc, y);
    doc.text('Category', colX.cat, y);
    doc.text('Qty', colX.qty, y, { width: 40, align: 'right' });
    doc.text('Unit', colX.unit, y);
    doc.text('Unit Price', colX.price, y, { width: 55, align: 'right' });
    doc.text('Total', colX.total, y, { width: 55, align: 'right' });
    y += 14;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
    y += 8;

    doc.font('Helvetica').fontSize(9).fillColor(INK);
    for (const item of quote.items || []) {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(item.description, colX.desc, y, { width: 200 });
      doc.text(item.category, colX.cat, y, { width: 75 });
      doc.text(String(item.quantity), colX.qty, y, { width: 40, align: 'right' });
      doc.text(item.unit, colX.unit, y, { width: 40 });
      doc.text(money(item.unit_price ?? item.unitPrice, currency), colX.price, y, { width: 55, align: 'right' });
      doc.text(money(item.line_total ?? item.lineTotal, currency), colX.total, y, { width: 55, align: 'right' });
      y += 16;
    }

    y += 10;
    doc.moveTo(320, y).lineTo(545, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
    y += 10;

    const summaryLine = (label, value, opts = {}) => {
      doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.bold ? 10 : 9)
        .fillColor(opts.bold ? INK : MUTED);
      doc.text(label, 320, y, { width: 130 });
      doc.text(value, 460, y, { width: 85, align: 'right' });
      y += opts.bold ? 16 : 14;
    };

    summaryLine('Subtotal', money(quote.subtotal, currency));
    summaryLine(`Overhead (${(quote.overhead_pct * 100).toFixed(1)}%)`, money(quote.overhead_amount, currency));
    summaryLine(`Profit margin (${(quote.profit_pct * 100).toFixed(1)}%)`, money(quote.profit_amount, currency));
    summaryLine(`Contingency (${(quote.contingency_pct * 100).toFixed(1)}%)`, money(quote.contingency_amount, currency));
    summaryLine(`Tax / VAT (${(quote.tax_rate * 100).toFixed(1)}%)`, money(quote.tax_amount, currency));
    y += 4;
    doc.moveTo(320, y).lineTo(545, y).strokeColor(GOLD).lineWidth(1).stroke();
    y += 8;
    summaryLine('TOTAL', money(quote.total, currency), { bold: true });

    // Terms
    y += 20;
    if (y > 680) { doc.addPage(); y = 50; }
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Payment Terms', 50, y);
    y += 15;
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    const materialsNote = quote.supplies_materials
      ? 'Lumora DeMoore is supplying materials for this project.'
      : 'Client is supplying materials for this project.';
    doc.text(
      `${materialsNote} A down payment of ${(quote.down_payment_pct * 100).toFixed(0)}% ` +
      `(${money(quote.down_payment_amount, currency)}) is due before work commences. ` +
      `The remaining balance of ${money(quote.balance_amount ?? (quote.total - quote.down_payment_amount), currency)} ` +
      `is payable per the agreed milestone schedule.`,
      50, y, { width: 495 }
    );
    y = doc.y + 10;

    if (quote.escalation_clause) {
      doc.font('Helvetica-Bold').fontSize(10).text('Cost Variation & Escalation', 50, y);
      y += 15;
      doc.font('Helvetica').fontSize(9).text(
        'Prices in this quotation reflect current material and labour costs. Should costs rise materially ' +
        'due to circumstances beyond Lumora DeMoore\'s control (e.g. currency movements, supplier price ' +
        'increases, or regulatory changes) before work is completed, an adjustment will be agreed with the ' +
        'client in writing before proceeding.',
        50, y, { width: 495 }
      );
      y = doc.y + 10;
    }

    doc.font('Helvetica-Bold').fontSize(10).text('Delay Responsibility', 50, y);
    y += 15;
    doc.font('Helvetica').fontSize(9).text(
      'Delays to the agreed schedule caused by the client or third parties outside Lumora DeMoore\'s control ' +
      'may result in additional costs, which will be borne by the party responsible for the delay.',
      50, y, { width: 495 }
    );

    doc.font('Helvetica').fontSize(8).fillColor(MUTED)
      .text('Lumora DeMoore Properties — this quotation is computer-generated and valid as dated above.', 50, 780, { width: 495, align: 'center' });

    doc.end();
  });
}

module.exports = { generateQuotePdf, money };
