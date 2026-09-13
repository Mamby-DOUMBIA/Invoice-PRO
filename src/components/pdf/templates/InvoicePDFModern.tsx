import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { PDFProps } from './shared'
import { formatAmt, fmtDate, getDocumentTitle } from './shared'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: '#ffffff' },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 140, backgroundColor: '#1e40af' },
  main: { marginLeft: 160, padding: '40 40 40 0' },
  logo: { width: 80, height: 40, objectFit: 'contain', marginTop: 30, marginLeft: 15 },
  orgNameSide: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginTop: 8, marginLeft: 15 },
  orgInfoSide: { fontSize: 7, color: '#93c5fd', marginTop: 2, marginLeft: 15 },
  docTitle: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 4 },
  docNum: { fontSize: 11, color: '#64748b', marginBottom: 16 },
  clientBox: { backgroundColor: '#f1f5f9', borderRadius: 6, padding: 10, marginBottom: 20, width: '60%' },
  clientLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  clientDetail: { fontSize: 8, color: '#475569', marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metaBox: { backgroundColor: '#eff6ff', borderRadius: 6, padding: '6 10' },
  metaLabel: { fontSize: 7, color: '#3b82f6', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  metaValue: { fontSize: 9, color: '#1e293b', fontFamily: 'Helvetica-Bold', marginTop: 2 },
  th: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: '5 4', borderRadius: '3 3 0 0' },
  thCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', textTransform: 'uppercase' },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: '5 4' },
  c1: { flex: 3 }, c2: { flex: 1, textAlign: 'right' }, c3: { flex: 1, textAlign: 'right' },
  c4: { flex: 1, textAlign: 'right' }, c5: { flex: 1.5, textAlign: 'right' },
  totals: { alignSelf: 'flex-end', width: 200, marginTop: 16 },
  tRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '3 0' },
  tLabel: { fontSize: 8, color: '#64748b' },
  tVal: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tGrand: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1e40af', padding: '7 8', borderRadius: 4, marginTop: 4 },
})

export function InvoicePDFModern({ invoice, org, documentTitle }: PDFProps) {
  const client = invoice.clients as Record<string, string> | null
  const items = invoice.invoice_items ?? invoice.quote_items ?? invoice.purchase_order_items ?? invoice.items ?? []
  const curr = invoice.currency ?? org.currency ?? 'XOF'
  const title = getDocumentTitle(invoice, documentTitle)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Blue sidebar */}
        <View style={styles.sidebar} fixed>
          {org.logo_url && <Image src={org.logo_url} style={styles.logo} />}
          <Text style={styles.orgNameSide}>{org.name}</Text>
          {org.phone && <Text style={styles.orgInfoSide}>{org.phone}</Text>}
          {org.email && <Text style={styles.orgInfoSide}>{org.email}</Text>}
          {org.address && <Text style={styles.orgInfoSide}>{org.address}</Text>}
          {org.nif && <Text style={styles.orgInfoSide}>NIF: {org.nif}</Text>}
        </View>

        <View style={styles.main}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docNum}>{invoice.number}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{fmtDate(invoice.date)}</Text>
            </View>
            {invoice.due_date && (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Échéance</Text>
                <Text style={styles.metaValue}>{fmtDate(invoice.due_date)}</Text>
              </View>
            )}
          </View>

          {/* Client */}
          <View style={styles.clientBox}>
            <Text style={styles.clientLabel}>Facturé à</Text>
            <Text style={styles.clientName}>{client?.name ?? '—'}</Text>
            {client?.company_name && <Text style={styles.clientDetail}>{client.company_name}</Text>}
            {client?.address && <Text style={styles.clientDetail}>{client.address}</Text>}
            {client?.phone && <Text style={styles.clientDetail}>{client.phone}</Text>}
          </View>

          {/* Table */}
          <View style={styles.th}>
            <Text style={[styles.thCell, styles.c1]}>Description</Text>
            <Text style={[styles.thCell, styles.c2]}>Qté</Text>
            <Text style={[styles.thCell, styles.c3]}>Prix HT</Text>
            <Text style={[styles.thCell, styles.c4]}>TVA</Text>
            <Text style={[styles.thCell, styles.c5]}>Total TTC</Text>
          </View>
          {items.map(item => (
            <View key={item.id} style={styles.tr}>
              <Text style={[{ fontSize: 8 }, styles.c1]}>{item.description}</Text>
              <Text style={[{ fontSize: 8 }, styles.c2]}>{item.quantity} {item.unit}</Text>
              <Text style={[{ fontSize: 8 }, styles.c3]}>{formatAmt(item.unit_price, curr)}</Text>
              <Text style={[{ fontSize: 8 }, styles.c4]}>{item.tax_rate}%</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold' }, styles.c5]}>{formatAmt(item.line_ttc ?? 0, curr)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.tRow}><Text style={styles.tLabel}>Sous-total HT</Text><Text style={styles.tVal}>{formatAmt(invoice.subtotal_ht, curr)}</Text></View>
            <View style={styles.tRow}><Text style={styles.tLabel}>TVA</Text><Text style={styles.tVal}>{formatAmt(invoice.total_tax, curr)}</Text></View>
            <View style={styles.tGrand}>
              <Text style={{ fontSize: 10, color: '#fff', fontFamily: 'Helvetica-Bold' }}>TOTAL TTC</Text>
              <Text style={{ fontSize: 10, color: '#fff', fontFamily: 'Helvetica-Bold' }}>{formatAmt(invoice.total_ttc, curr)}</Text>
            </View>
          </View>

          {invoice.notes && (
            <View style={{ marginTop: 20, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
              <Text style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Notes</Text>
              <Text style={{ fontSize: 8, color: '#475569' }}>{invoice.notes}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
