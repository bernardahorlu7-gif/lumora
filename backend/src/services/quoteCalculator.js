/**
 * Quote calculation engine.
 *
 * Pricing model:
 *   subtotal            = sum(item.quantity * item.unit_price)
 *   overhead_amount     = subtotal * overhead_pct
 *   profit_amount       = (subtotal + overhead_amount) * profit_pct
 *   contingency_amount  = subtotal * contingency_pct
 *   pre_tax_total       = subtotal + overhead_amount + profit_amount + contingency_amount
 *   tax_amount          = pre_tax_total * tax_rate
 *   total               = pre_tax_total + tax_amount
 *
 * Down payment defaults follow Lumora DeMoore's standard terms:
 *   70% up front when Lumora supplies materials, 50% when it does not.
 * These are defaults only — each quote stores its own down_payment_pct so a
 * quote's terms remain fixed even if the company default changes later.
 */

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function defaultDownPaymentPct(suppliesMaterials) {
  const withMaterials = parseFloat(process.env.DOWN_PAYMENT_WITH_MATERIALS_PCT || '0.70');
  const withoutMaterials = parseFloat(process.env.DOWN_PAYMENT_WITHOUT_MATERIALS_PCT || '0.50');
  return suppliesMaterials ? withMaterials : withoutMaterials;
}

/**
 * @param {Array<{quantity:number, unitPrice:number}>} items
 * @param {object} opts
 * @param {number} opts.overheadPct
 * @param {number} opts.profitPct
 * @param {number} opts.contingencyPct
 * @param {number} opts.taxRate
 * @param {number} [opts.downPaymentPct] - overrides the materials-based default when provided
 * @param {boolean} [opts.suppliesMaterials]
 */
function calculateQuote(items, opts) {
  const {
    overheadPct = parseFloat(process.env.DEFAULT_OVERHEAD_PCT || '0.10'),
    profitPct = parseFloat(process.env.DEFAULT_PROFIT_PCT || '0.12'),
    contingencyPct = parseFloat(process.env.DEFAULT_CONTINGENCY_PCT || '0.05'),
    taxRate = parseFloat(process.env.DEFAULT_TAX_RATE || '0.15'),
    suppliesMaterials = false,
  } = opts || {};

  const downPaymentPct = opts && opts.downPaymentPct != null
    ? opts.downPaymentPct
    : defaultDownPaymentPct(suppliesMaterials);

  const lineItems = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice ?? item.unit_price) || 0;
    return { ...item, quantity, unitPrice, lineTotal: round2(quantity * unitPrice) };
  });

  const subtotal = round2(lineItems.reduce((sum, i) => sum + i.lineTotal, 0));
  const overheadAmount = round2(subtotal * overheadPct);
  const profitAmount = round2((subtotal + overheadAmount) * profitPct);
  const contingencyAmount = round2(subtotal * contingencyPct);
  const preTaxTotal = round2(subtotal + overheadAmount + profitAmount + contingencyAmount);
  const taxAmount = round2(preTaxTotal * taxRate);
  const total = round2(preTaxTotal + taxAmount);
  const downPaymentAmount = round2(total * downPaymentPct);
  const balanceAmount = round2(total - downPaymentAmount);

  return {
    lineItems,
    subtotal,
    overheadPct,
    overheadAmount,
    profitPct,
    profitAmount,
    contingencyPct,
    contingencyAmount,
    preTaxTotal,
    taxRate,
    taxAmount,
    total,
    downPaymentPct,
    downPaymentAmount,
    balanceAmount,
  };
}

module.exports = { calculateQuote, defaultDownPaymentPct, round2 };
