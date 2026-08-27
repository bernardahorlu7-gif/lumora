function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function calculateInvoice(items, options = {}) {
  const vatRate = Number(options.vatRate ?? process.env.DEFAULT_VAT_RATE ?? 0.15);
  const nhilRate = Number(options.nhilRate ?? process.env.DEFAULT_NHIL_RATE ?? 0.025);
  const getfundRate = Number(options.getfundRate ?? process.env.DEFAULT_GETFUND_RATE ?? 0.025);
  const withholdingRate = Number(options.withholdingRate ?? process.env.DEFAULT_WITHHOLDING_RATE ?? 0);
  const markupAmount = round2(options.markupAmount || 0);
  const lineItems = items.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice ?? item.unit_price),
    lineTotal: round2(Number(item.quantity) * Number(item.unitPrice ?? item.unit_price)),
  }));
  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const taxableValue = round2(subtotal + markupAmount);
  const nhilAmount = round2(taxableValue * nhilRate);
  const getfundAmount = round2(taxableValue * getfundRate);
  const vatAmount = round2(taxableValue * vatRate);
  const grossTotal = round2(taxableValue + nhilAmount + getfundAmount + vatAmount);
  const withholdingAmount = round2(grossTotal * withholdingRate);
  return { lineItems, subtotal, markupAmount, taxableValue, nhilAmount, getfundAmount, vatAmount, grossTotal, withholdingAmount, netAmountPayable: round2(grossTotal - withholdingAmount), vatRate, nhilRate, getfundRate, withholdingRate };
}

module.exports = { calculateInvoice, round2 };