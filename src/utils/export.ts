/**
 * Utility functions for exporting data to Excel-compatible CSV (with UTF-8 BOM)
 */

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return '""'
    const str = String(cell)
    return `"${str.replace(/"/g, '""')}"`
  }

  const csvContent = [
    headers.map(escapeCell).join(';'),
    ...rows.map(row => row.map(escapeCell).join(';')),
  ].join('\r\n')

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) needed by Excel to properly display accents
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportInvoicesToCSV(invoices: any[], currency = 'XOF') {
  const headers = [
    'Numéro',
    'Client',
    'Entreprise',
    'Date',
    'Échéance',
    'Statut',
    'Total HT',
    'TVA',
    'Total TTC',
    'Montant Payé',
    'Reste Dû',
    'Devise',
    'Référence',
  ]

  const rows = invoices.map(inv => [
    inv.number,
    inv.clients?.name || '—',
    inv.clients?.company_name || '',
    inv.date,
    inv.due_date || '',
    inv.status,
    inv.subtotal_ht ?? 0,
    inv.total_tax ?? 0,
    inv.total_ttc ?? 0,
    inv.amount_paid ?? 0,
    inv.amount_due ?? ((inv.total_ttc ?? 0) - (inv.amount_paid ?? 0)),
    inv.currency || currency,
    inv.reference || '',
  ])

  downloadCSV(`factures_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function exportQuotesToCSV(quotes: any[], currency = 'XOF') {
  const headers = [
    'Numéro',
    'Client',
    'Entreprise',
    'Date',
    'Expiration',
    'Statut',
    'Total HT',
    'TVA',
    'Total TTC',
    'Devise',
    'Référence',
  ]

  const rows = quotes.map(q => [
    q.number,
    q.clients?.name || '—',
    q.clients?.company_name || '',
    q.date,
    q.expiry_date || '',
    q.status,
    q.subtotal_ht ?? 0,
    q.total_tax ?? 0,
    q.total_ttc ?? 0,
    q.currency || currency,
    q.reference || '',
  ])

  downloadCSV(`devis_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function exportPurchaseOrdersToCSV(orders: any[], currency = 'XOF') {
  const headers = [
    'Numéro',
    'Destinataire',
    'Date',
    'Date prévue',
    'Statut',
    'Total HT',
    'TVA',
    'Total TTC',
    'Devise',
    'Référence',
  ]

  const rows = orders.map(po => [
    po.number,
    po.clients?.name || '—',
    po.date,
    po.expected_date || '',
    po.status,
    po.subtotal_ht ?? 0,
    po.total_tax ?? 0,
    po.total_ttc ?? 0,
    po.currency || currency,
    po.reference || '',
  ])

  downloadCSV(`bons_de_commande_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function exportClientsToCSV(clients: any[]) {
  const headers = [
    'Nom',
    'Société',
    'Email',
    'Téléphone',
    'WhatsApp',
    'Adresse',
    'Ville',
    'Pays',
    'NIF',
    'Statut',
  ]

  const rows = clients.map(c => [
    c.name,
    c.company_name || '',
    c.email || '',
    c.phone || '',
    c.whatsapp || '',
    c.address || '',
    c.city || '',
    c.country || '',
    c.nif || '',
    c.is_active ? 'Actif' : 'Inactif',
  ])

  downloadCSV(`clients_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function exportProductsToCSV(products: any[]) {
  const headers = [
    'Désignation',
    'Type',
    'Référence/SKU',
    'Prix HT',
    'Taux TVA (%)',
    'Prix TTC',
    'Unité',
    'Description',
    'Statut',
  ]

  const rows = products.map(p => [
    p.name,
    p.type === 'service' ? 'Service' : 'Produit',
    p.sku || '',
    p.price_ht ?? 0,
    p.tax_rate ?? 0,
    p.price_ttc ?? (p.price_ht * (1 + (p.tax_rate ?? 0) / 100)),
    p.unit || 'unité',
    p.description || '',
    p.is_active ? 'Actif' : 'Inactif',
  ])

  downloadCSV(`catalogue_produits_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function exportPaymentsToCSV(payments: any[], currency = 'XOF') {
  const headers = [
    'Date',
    'Facture',
    'Client',
    'Mode de paiement',
    'Référence',
    'Montant',
    'Devise',
    'Notes',
  ]

  const rows = payments.map(p => [
    p.date,
    p.invoices?.number || '—',
    p.invoices?.clients?.name || p.clients?.name || '—',
    p.method,
    p.reference || '',
    p.amount,
    currency,
    p.notes || '',
  ])

  downloadCSV(`paiements_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}
