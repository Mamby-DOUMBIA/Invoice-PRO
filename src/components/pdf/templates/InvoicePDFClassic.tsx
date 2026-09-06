import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import type { PDFProps } from './shared'
import { formatAmt, fmtDate } from './shared'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#0f172a', backgroundColor: '#ffffff', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  logo: { width: 80, height: 40, objectFit: 'contain' },
  orgName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#2563eb' },
  orgInfo: { fontSize: 8, color: '#64748b', marginTop: 2 },
  docTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', textAlign: 'right' },
  docNumber: { fontSize: 12, color: '#2563eb', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  docMeta: { fontSize: 8, color: '#64748b', textAlign: 'right', marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  sectionBox: { width: '45%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 6 },
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  sectionText: { fontSize: 9, color: '#1e293b', lineHeight: 1.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e40af', padding: '6 4', borderRadius: '4 4 0 0' },
  tableHeaderCell: { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: '5 4' },
  tableRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: '5 4', backgroundColor: '#f8fafc' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  col5: { flex: 1, textAlign: 'right' },
  col6: { flex: 1.5, textAlign: 'right' },
  totalsBox: { alignSelf: 'flex-end', width: 220, marginTop: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '3 0' },
  totalRowBold: { flexDirection: 'row', justifyContent: 'space-between', padding: '6 8', backgroundColor: '#1e40af', borderRadius: 4, marginTop: 4 },
  totalLabel: { fontSize: 8, color: '#64748b' },
  totalValue: { fontSize: 8, color: '#0f172a', fontFamily: 'Helvetica-Bold' },
  totalLabelBig: { fontSize: 10, color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  totalValueBig: { fontSize: 10, color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, fontSize: 7, color: '#94a3b8', textAlign: 'center' },
  notesBox: { marginTop: 16, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6 },
  notesTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  notesText: { fontSize: 8, color: '#475569', lineHeight: 1.5 },
})

export function InvoicePDFClassic({ invoice, org }: PDFProps) {
  const client = invoice.clients as Record<string, string> | null
  const items = invoice.invoice_items ?? []
  const curr = invoice.currency ?? org.currency ?? 'XOF'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {org.logo_url ? (
              <Image src={org.logo_url} style={styles.logo} />
            ) : (
              <Text style={styles.orgName}>{org.name}</Text>
            )}
            <Text style={styles.orgInfo}>{org.address}</Text>
            <Text style={styles.orgInfo}>{[org.city, org.country].filter(Boolean).join(', ')}</Text>
            {org.phone && <Text style={styles.orgInfo}>Tél: {org.phone}</Text>}
            {org.email && <Text style={styles.orgInfo}>{org.email}</Text>}
            {org.nif && <Text style={styles.orgInfo}>NIF: {org.nif}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>FACTURE</Text>
            <Text style={styles.docNumber}>{invoice.number}</Text>
            <Text style={styles.docMeta}>Date: {fmtDate(invoice.date)}</Text>
            {invoice.due_date && <Text style={styles.docMeta}>Échéance: {fmtDate(invoice.due_date)}</Text>}
            {invoice.reference && <Text style={styles.docMeta}>Réf: {invoice.reference}</Text>}
          </View>
        </View>

        {/* Client + Company */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>De</Text>
            <Text style={[styles.sectionText, { fontFamily: 'Helvetica-Bold' }]}>{org.name}</Text>
            {org.address && <Text style={styles.sectionText}>{org.address}</Text>}
            {org.city && <Text style={styles.sectionText}>{org.city}</Text>}
          </View>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Facturé à</Text>
            <Text style={[styles.sectionText, { fontFamily: 'Helvetica-Bold' }]}>{client?.name ?? '—'}</Text>
            {client?.company_name && <Text style={styles.sectionText}>{client.company_name}</Text>}
            {client?.address && <Text style={styles.sectionText}>{client.address}</Text>}
            {client?.phone && <Text style={styles.sectionText}>Tél: {client.phone}</Text>}
            {client?.email && <Text style={styles.sectionText}>{client.email}</Text>}
            {client?.nif && <Text style={styles.sectionText}>NIF: {client.nif}</Text>}
          </View>
        </View>

        {/* Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Prix HT</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Remise</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>TVA</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>Total TTC</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[{ fontSize: 8 }, styles.col1]}>{item.description}</Text>
              <Text style={[{ fontSize: 8 }, styles.col2]}>{item.quantity} {item.unit}</Text>
              <Text style={[{ fontSize: 8 }, styles.col3]}>{formatAmt(item.unit_price, curr)}</Text>
              <Text style={[{ fontSize: 8 }, styles.col4]}>{item.discount_pct > 0 ? `${item.discount_pct}%` : '—'}</Text>
              <Text style={[{ fontSize: 8 }, styles.col5]}>{item.tax_rate}%</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold' }, styles.col6]}>{formatAmt(item.line_ttc ?? 0, curr)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{formatAmt(invoice.subtotal_ht, curr)}</Text>
          </View>
          {invoice.total_discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise</Text>
              <Text style={[styles.totalValue, { color: '#ea580c' }]}>- {formatAmt(invoice.total_discount, curr)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA</Text>
            <Text style={styles.totalValue}>{formatAmt(invoice.total_tax, curr)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text style={styles.totalLabelBig}>TOTAL TTC</Text>
            <Text style={styles.totalValueBig}>{formatAmt(invoice.total_ttc, curr)}</Text>
          </View>
          {invoice.amount_paid > 0 && (
            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={styles.totalLabel}>Payé</Text>
              <Text style={[styles.totalValue, { color: '#16a34a' }]}>{formatAmt(invoice.amount_paid, curr)}</Text>
            </View>
          )}
          {invoice.amount_due > 0 && (
            <View style={[styles.totalRow, { backgroundColor: '#fef3c7', padding: '4 6', borderRadius: 4 }]}>
              <Text style={[styles.totalLabel, { color: '#92400e' }]}>Reste à payer</Text>
              <Text style={[styles.totalValue, { color: '#92400e' }]}>{formatAmt(invoice.amount_due, curr)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Bank info */}
        {org.bank_account && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Informations bancaires</Text>
            {org.bank_name && <Text style={styles.notesText}>Banque: {org.bank_name}</Text>}
            <Text style={styles.notesText}>Compte: {org.bank_account}</Text>
            {org.bank_iban && <Text style={styles.notesText}>IBAN: {org.bank_iban}</Text>}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{org.invoice_footer ?? `${org.name} — Merci pour votre confiance.`}</Text>
          {org.website && <Text>{org.website}</Text>}
        </View>
      </Page>
    </Document>
  )
}
