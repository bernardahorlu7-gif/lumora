const PDFDocument = require('pdfkit');

function money(value, currency) {
  return `${currency} ${Number(value || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateInvoicePdf(invoice, settings = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    const currency = invoice.currency || 'GHS';
    doc.fillColor('#1c1b1b').font('Helvetica-Bold').fontSize(20).text(settings.companyName || 'LUMORA DEMOORE PROPERTIES', 50, 50);
    doc.font('Helvetica').fontSize(9).fillColor('#6b6b6b').text(settings.address || 'Ofankor Barrier, Accra, Ghana', 50, 75);
    doc.fillColor('#a9812f').font('Helvetica-Bold').fontSize(14).text('INVOICE', 400, 50, { align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor('#6b6b6b').text(`No. ${invoice.invoice_number}`, 400, 70, { align: 'right' }).text(`Issued: ${invoice.issue_date}`, 400, 83, { align: 'right' }).text(`Due: ${invoice.due_date || 'On receipt'}`, 400, 96, { align: 'right' });
    doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#a9812f').stroke();
    doc.fillColor('#1c1b1b').font('Helvetica-Bold').fontSize(10).text('Bill to', 50, 135);
    doc.font('Helvetica').fontSize(10).text(invoice.client?.name || invoice.client?.company_name || 'Client', 50, 150).text(invoice.client?.address || '', 50, 165).text(invoice.client?.email || '', 50, 180);
    doc.font('Helvetica-Bold').fontSize(10).text('Project', 320, 135);
    doc.font('Helvetica').fontSize(10).text(invoice.project?.name || 'General services', 320, 150, { width: 225 }).text(invoice.project?.reference_code || '', 320, 165);
    let y = 220;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#6b6b6b').text('Description', 50, y).text('Qty', 350, y).text('Unit price', 410, y, { width: 65, align: 'right' }).text('Total', 480, y, { width: 65, align: 'right' });
    y += 15; doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').stroke(); y += 10;
    doc.font('Helvetica').fontSize(9).fillColor('#1c1b1b');
    for (const item of invoice.items || []) { doc.text(item.description, 50, y, { width: 280 }); doc.text(String(item.quantity), 350, y); doc.text(money(item.unit_price, currency), 410, y, { width: 65, align: 'right' }); doc.text(money(item.line_total, currency), 480, y, { width: 65, align: 'right' }); y += 18; }
    y += 15; doc.moveTo(320, y).lineTo(545, y).strokeColor('#dddddd').stroke(); y += 12;
    const line = (label, value, bold = false) => { doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9).fillColor(bold ? '#1c1b1b' : '#6b6b6b').text(label, 320, y, { width: 130 }).text(money(value, currency), 460, y, { width: 85, align: 'right' }); y += bold ? 17 : 14; };
    line('Subtotal', invoice.subtotal); line('Markup', invoice.markup_amount); line('Taxable value', invoice.taxable_value); line(`NHIL (${Number(invoice.nhil_rate || 0.025) * 100}%)`, invoice.nhil_amount); line(`GETFund (${Number(invoice.getfund_rate || 0.025) * 100}%)`, invoice.getfund_amount); line(`VAT (${Number(invoice.vat_rate || 0.15) * 100}%)`, invoice.vat_amount); line('Gross total', invoice.gross_total, true); line('Withholding', invoice.withholding_amount); line('NET AMOUNT PAYABLE', invoice.net_amount_payable, true);
    y += 18; doc.font('Helvetica-Bold').fontSize(10).fillColor('#1c1b1b').text('Payment instructions', 50, y); y += 15; doc.font('Helvetica').fontSize(9).text(settings.paymentInstructions || 'Demo payment: MTN MoMo 024 000 0000, account name Lumora DeMoore Properties.', 50, y, { width: 495 });
    doc.font('Helvetica').fontSize(8).fillColor('#6b6b6b').text(`TIN: ${settings.tin || 'DEMO-TIN-000000000'} | VAT: ${settings.vatNumber || 'DEMO-VAT-000000000'}`, 50, 780, { width: 495, align: 'center' });
    doc.end();
  });
}

module.exports = { generateInvoicePdf };