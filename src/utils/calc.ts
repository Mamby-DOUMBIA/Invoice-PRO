/**
 * Calculs financiers fiables pour InvoicePro
 * Tous les arrondis se font à la fin, pas au milieu
 */

export interface LineItem {
  quantity: number
  unit_price: number
  discount_pct: number   // 0-100
  discount_amt: number   // montant fixe
  tax_rate: number       // 0-100
}

export interface LineCalc {
  line_ht: number
  line_tax: number
  line_ttc: number
  discount_total: number
}

export interface DocumentTotals {
  subtotal_ht: number    // Somme lignes HT avant remise
  total_discount: number // Remise totale
  taxable_base: number   // HT après remise
  total_tax: number      // TVA totale
  total_ttc: number      // TTC
}

export function calcLine(item: LineItem): LineCalc {
  const gross = item.quantity * item.unit_price
  const discountFromPct = gross * (item.discount_pct / 100)
  const discountTotal = discountFromPct + item.discount_amt
  const line_ht = gross - discountTotal
  const line_tax = line_ht * (item.tax_rate / 100)
  const line_ttc = line_ht + line_tax
  return {
    line_ht: round2(line_ht),
    line_tax: round2(line_tax),
    line_ttc: round2(line_ttc),
    discount_total: round2(discountTotal),
  }
}

export function calcDocumentTotals(items: LineItem[]): DocumentTotals {
  let subtotal_ht = 0
  let total_discount = 0
  let total_tax = 0

  for (const item of items) {
    const c = calcLine(item)
    subtotal_ht += item.quantity * item.unit_price
    total_discount += c.discount_total
    total_tax += c.line_tax
  }

  const taxable_base = subtotal_ht - total_discount
  const total_ttc = taxable_base + total_tax

  return {
    subtotal_ht: round2(subtotal_ht),
    total_discount: round2(total_discount),
    taxable_base: round2(taxable_base),
    total_tax: round2(total_tax),
    total_ttc: round2(total_ttc),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function roundCFA(n: number): number {
  return Math.round(n)
}

export function applyRounding(totals: DocumentTotals, currency: string): DocumentTotals {
  if (currency === 'XOF' || currency === 'GNF') {
    return {
      subtotal_ht: roundCFA(totals.subtotal_ht),
      total_discount: roundCFA(totals.total_discount),
      taxable_base: roundCFA(totals.taxable_base),
      total_tax: roundCFA(totals.total_tax),
      total_ttc: roundCFA(totals.total_ttc),
    }
  }
  return totals
}
