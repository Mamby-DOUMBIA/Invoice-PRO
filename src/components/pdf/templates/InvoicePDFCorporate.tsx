import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { PDFProps } from './shared'
import { formatAmt, fmtDate, getDocumentTitle } from './shared'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: '#ffffff', padding: 0 },
  topBar: { height: 8, backgroundColor: '#1e40af' },
  body: { padding: '28 40 40 40' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo: { width: 90, height: 45, objectFit: 'contain' },
  orgName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  orgInfo: { fontSize: 7.5, color: '#64748b', marginTop: 2, lineHeight: 1.4 },
  titleBlock: { alignItems: 'flex-end' },
  docTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  docNum: { fontSize: 10, color: '#1e293b', marginTop: 4, fontFamily: 'Helvetica-Bold' },
  docMeta: { fontSize: 7.5, color: '#64748b', marginTop: 2 },
  hr: { height: 1, backgroundColor: '#cbd5e1', marginBottom: 20 },
  addresses: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  addrBox: { width: '44%', padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  addrTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  addrName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  addrLine: { fontSize: 8, color: '#64748b', marginTop: 2 },
  thead: { flexDirection: 'row', backgroundColor: '#1e40af', padding: '6 5', borderRadius: '3 3 0 0' },
  thCell: { fontSize: 7.5, color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  trow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: '5 5' },
  trowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: '5 5', backgroundColor: '#f8fafc' },
  c1: { flex: 3 }, c2: { flex: 1, textAlign: 'right' }, c3: { flex: 1, textAlign: 'right' },
  c4: { flex: 1, textAlign: 'right' }, c5: { flex: 1.5, textAlign: 'right' },
  totals: { alignSelf: 'flex-end', width: 210, marginTop: 16 },
  tRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '3 4' },
  tLabel: { fontSize: 8, color: '#64748b' },
  tVal: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  grand: { flexDirection: 'row', justifyContent: 'space-between', padding: '7 8', backgroundColor: '#1e40af', borderRadius: 4, marginTop: 4 },
  bottomBar: { height: 6, backgroundColor: '#1e40af', position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerText: { fontSize: 7, color: '#94a3b8', textAlign: 'center', marginTop: 24, marginBottom: 16 },
})

export function InvoicePDFCorporate({ invoice, org, documentTitle }: PDFProps) {
  const client = invoice.clients as Record<string, string> | null
  const items = invoice.invoice_items ?? invoice.quote_items ?? invoice.purchase_order_items ?? invoice.items ?? []
  const curr = invoice.currency ?? org.currency ?? 'XOF'
  const title = getDocumentTitle(invoice, documentTitle)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />
        <View style={s.body}>
          <View style={s.header}>
            <View>
              {org.logo_url ? <Image src={org.logo_url} style={s.logo} /> : <Text style={s.orgName}>{org.name}</Text>}
              {org.logo_url && <Text style={s.orgName}>{org.name}</Text>}
              {org.address && <Text style={s.orgInfo}>{org.address}</Text>}
              {org.phone && <Text style={s.orgInfo}>{org.phone}</Text>}
              {org.email && <Text style={s.orgInfo}>{org.email}</Text>}
            </View>
            <View style={s.titleBlock}>
              <Text style={s.docTitle}>{title}</Text>
              <Text style={s.docNum}>{invoice.number}</Text>
              <Text style={s.docMeta}>Date: {fmtDate(invoice.date)}</Text>
              {invoice.expiry_date ? <Text style={s.docMeta}>Expiration: {fmtDate(invoice.expiry_date)}</Text> : null}
              {invoice.expected_date ? <Text style={s.docMeta}>Date prévue: {fmtDate(invoice.expected_date)}</Text> : null}
              {invoice.due_date ? <Text style={s.docMeta}>Échéance: {fmtDate(invoice.due_date)}</Text> : null}
            </View>
          </View>
          <View style={s.hr} />

          <View style={s.addresses}>
            <View style={s.addrBox}>
              <Text style={s.addrTitle}>Émetteur</Text>
              <Text style={s.addrName}>{org.name}</Text>
              {org.nif && <Text style={s.addrLine}>NIF: {org.nif}</Text>}
              {org.website && <Text style={s.addrLine}>{org.website}</Text>}
            </View>
            <View style={s.addrBox}>
              <Text style={s.addrTitle}>Destinataire</Text>
              <Text style={s.addrName}>{client?.name ?? '—'}</Text>
              {client?.company_name && <Text style={s.addrLine}>{client.company_name}</Text>}
              {client?.address && <Text style={s.addrLine}>{client.address}</Text>}
              {client?.nif && <Text style={s.addrLine}>NIF: {client.nif}</Text>}
            </View>
          </View>

          <View style={s.thead}>
            <Text style={[s.thCell, s.c1]}>Description</Text>
            <Text style={[s.thCell, s.c2]}>Qté</Text>
            <Text style={[s.thCell, s.c3]}>Prix HT</Text>
            <Text style={[s.thCell, s.c4]}>TVA</Text>
            <Text style={[s.thCell, s.c5]}>Total TTC</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={i % 2 === 0 ? s.trow : s.trowAlt}>
              <Text style={[{ fontSize: 8 }, s.c1]}>{item.description}</Text>
              <Text style={[{ fontSize: 8 }, s.c2]}>{item.quantity} {item.unit}</Text>
              <Text style={[{ fontSize: 8 }, s.c3]}>{formatAmt(item.unit_price, curr)}</Text>
              <Text style={[{ fontSize: 8 }, s.c4]}>{item.tax_rate}%</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold' }, s.c5]}>{formatAmt(item.line_ttc ?? 0, curr)}</Text>
            </View>
          ))}

          <View style={s.totals}>
            <View style={s.tRow}><Text style={s.tLabel}>Sous-total HT</Text><Text style={s.tVal}>{formatAmt(invoice.subtotal_ht, curr)}</Text></View>
            {(invoice.total_discount ?? 0) > 0 && <View style={s.tRow}><Text style={s.tLabel}>Remise</Text><Text style={[s.tVal, { color: '#ea580c' }]}>- {formatAmt(invoice.total_discount ?? 0, curr)}</Text></View>}
            <View style={s.tRow}><Text style={s.tLabel}>TVA</Text><Text style={s.tVal}>{formatAmt(invoice.total_tax, curr)}</Text></View>
            <View style={s.grand}>
              <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>TOTAL TTC</Text>
              <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{formatAmt(invoice.total_ttc, curr)}</Text>
            </View>
          </View>

          {(invoice.notes || invoice.conditions) && (
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 16 }}>
              {invoice.notes && (
                <View style={{ flex: 1, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Notes</Text>
                  <Text style={{ fontSize: 7.5, color: '#475569' }}>{invoice.notes}</Text>
                </View>
              )}
              {invoice.conditions && (
                <View style={{ flex: 1, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Conditions</Text>
                  <Text style={{ fontSize: 7.5, color: '#475569' }}>{invoice.conditions}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={s.footerText}>
            {org.invoice_footer ?? `${org.name} — ${org.address ?? ''} — ${org.phone ?? ''}`}
          </Text>
        </View>
        <View style={s.bottomBar} />
      </Page>
    </Document>
  )
}
