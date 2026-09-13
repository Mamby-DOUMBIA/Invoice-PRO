import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PDFProps } from './shared'
import { formatAmt, fmtDate, getDocumentTitle } from './shared'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', padding: 50, backgroundColor: '#ffffff' },
  h: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 16 },
  org: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  orgSub: { fontSize: 8, color: '#64748b', marginTop: 3, lineHeight: 1.5 },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  num: { fontSize: 9, color: '#64748b', textAlign: 'right', marginTop: 2 },
  date: { fontSize: 8, color: '#94a3b8', textAlign: 'right', marginTop: 1 },
  clientSec: { marginBottom: 28 },
  clientLabel: { fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  clientSub: { fontSize: 8, color: '#64748b', marginTop: 2 },
  th: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#0f172a', padding: '5 0', marginBottom: 2 },
  thT: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: '5 0' },
  c1: { flex: 3 }, c2: { flex: 1, textAlign: 'right' }, c3: { flex: 1, textAlign: 'right' }, c4: { flex: 1.5, textAlign: 'right' },
  tot: { alignSelf: 'flex-end', width: 180, marginTop: 20 },
  tr2: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  total: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#0f172a', paddingTop: 6, marginTop: 4 },
})

export function InvoicePDFMinimal({ invoice, org, documentTitle }: PDFProps) {
  const client = invoice.clients as Record<string, string> | null
  const items = invoice.invoice_items ?? invoice.quote_items ?? invoice.purchase_order_items ?? invoice.items ?? []
  const curr = invoice.currency ?? org.currency ?? 'XOF'
  const title = getDocumentTitle(invoice, documentTitle)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.h}>
          <View>
            <Text style={s.org}>{org.name}</Text>
            {org.address && <Text style={s.orgSub}>{org.address}</Text>}
            {org.phone && <Text style={s.orgSub}>{org.phone}</Text>}
          </View>
          <View>
            <Text style={s.title}>{title}</Text>
            <Text style={s.num}>{invoice.number}</Text>
            <Text style={s.date}>{fmtDate(invoice.date)}</Text>
          </View>
        </View>

        <View style={s.clientSec}>
          <Text style={s.clientLabel}>Facturé à</Text>
          <Text style={s.clientName}>{client?.name ?? '—'}</Text>
          {client?.company_name && <Text style={s.clientSub}>{client.company_name}</Text>}
          {client?.email && <Text style={s.clientSub}>{client.email}</Text>}
        </View>

        <View style={s.th}>
          <Text style={[s.thT, s.c1]}>Description</Text>
          <Text style={[s.thT, s.c2]}>Qté</Text>
          <Text style={[s.thT, s.c3]}>Prix HT</Text>
          <Text style={[s.thT, s.c4]}>Total TTC</Text>
        </View>
        {items.map(item => (
          <View key={item.id} style={s.tr}>
            <Text style={[{ fontSize: 8 }, s.c1]}>{item.description}</Text>
            <Text style={[{ fontSize: 8 }, s.c2]}>{item.quantity}</Text>
            <Text style={[{ fontSize: 8 }, s.c3]}>{formatAmt(item.unit_price, curr)}</Text>
            <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold' }, s.c4]}>{formatAmt(item.line_ttc ?? 0, curr)}</Text>
          </View>
        ))}

        <View style={s.tot}>
          <View style={s.tr2}><Text style={{ fontSize: 8, color: '#64748b' }}>HT</Text><Text style={{ fontSize: 8 }}>{formatAmt(invoice.subtotal_ht, curr)}</Text></View>
          <View style={s.tr2}><Text style={{ fontSize: 8, color: '#64748b' }}>TVA</Text><Text style={{ fontSize: 8 }}>{formatAmt(invoice.total_tax, curr)}</Text></View>
          <View style={s.total}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>TOTAL</Text>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{formatAmt(invoice.total_ttc, curr)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <Text style={{ marginTop: 24, fontSize: 8, color: '#64748b', lineHeight: 1.5 }}>{invoice.notes}</Text>
        )}
        <Text style={{ marginTop: 40, fontSize: 7, color: '#94a3b8', textAlign: 'center' }}>
          {org.invoice_footer ?? `${org.name} — Merci pour votre confiance.`}
        </Text>
      </Page>
    </Document>
  )
}
