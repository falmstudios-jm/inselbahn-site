import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const colors = {
  red: '#F24444',
  dark: '#333',
  textLight: '#666',
  border: '#E0E0E0',
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: colors.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 3, borderBottomColor: colors.red, paddingBottom: 16 },
  companyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', letterSpacing: 2, marginBottom: 2 },
  companyTagline: { fontSize: 8, color: colors.textLight },
  title: { fontSize: 28, fontFamily: 'Helvetica-Bold', letterSpacing: 3, textAlign: 'right' },
  refLine: { fontSize: 11, color: colors.textLight, textAlign: 'right', marginTop: 4 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  addressBlock: { width: '48%' },
  addressLabel: { fontSize: 8, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4 },
  addressText: { fontSize: 10, lineHeight: 1.5 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metaItem: { fontSize: 9, color: colors.textLight },
  metaValue: { fontSize: 10, color: colors.dark, marginTop: 2 },
  table: { marginTop: 16, marginBottom: 16, borderTopWidth: 1, borderTopColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableHead: { flexDirection: 'row', backgroundColor: '#F7F7F7', padding: 8 },
  tableRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: colors.border },
  colDesc: { flex: 4, fontSize: 9 },
  colAmt: { flex: 1, fontSize: 9, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginRight: 16 },
  totalAmt: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.red },
  footer: { marginTop: 40, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, fontSize: 8, color: colors.textLight, lineHeight: 1.5 },
  paymentBox: { marginTop: 16, padding: 12, backgroundColor: '#F7F7F7', borderRadius: 4 },
  paymentTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  paymentLine: { fontSize: 9, color: colors.textLight, lineHeight: 1.5 },
});

interface InvoiceProps {
  reference: string;
  invoiceNumber: string;
  invoiceDate: string;
  description: string;
  amount: number;
  paymentStatus: 'paid' | 'stripe' | 'transfer';
  buyer: {
    name: string;
    street: string;
    postal_code: string;
    city: string;
    country?: string;
    vat_id?: string;
  };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtCur(n: number): string { return n.toFixed(2).replace('.', ',') + ' €'; }

function ManualInvoiceDoc({ data }: { data: InvoiceProps }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>INSELBAHN HELGOLAND</Text>
            <Text style={styles.companyTagline}>Geführte Inselrundfahrten</Text>
          </View>
          <View>
            <Text style={styles.title}>RECHNUNG</Text>
            <Text style={styles.refLine}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Rechnungsempfänger</Text>
            <Text style={styles.addressText}>{data.buyer.name}</Text>
            <Text style={styles.addressText}>{data.buyer.street}</Text>
            <Text style={styles.addressText}>{data.buyer.postal_code} {data.buyer.city}</Text>
            {data.buyer.country && <Text style={styles.addressText}>{data.buyer.country}</Text>}
            {data.buyer.vat_id && <Text style={[styles.addressText, { marginTop: 4, color: colors.textLight }]}>USt-IdNr.: {data.buyer.vat_id}</Text>}
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Rechnungssteller</Text>
            <Text style={styles.addressText}>Helgoländer Dienstleistungs GmbH</Text>
            <Text style={styles.addressText}>Von-Aschen-Str. 594</Text>
            <Text style={styles.addressText}>27498 Helgoland</Text>
            <Text style={styles.addressText}>Deutschland</Text>
            <Text style={[styles.addressText, { marginTop: 4, color: colors.textLight }]}>info@helgolandbahn.de</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaItem}>RECHNUNGSDATUM</Text>
            <Text style={styles.metaValue}>{fmtDate(data.invoiceDate)}</Text>
          </View>
          <View>
            <Text style={styles.metaItem}>RECHNUNGSNUMMER</Text>
            <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Beschreibung</Text>
            <Text style={[styles.colAmt, { fontFamily: 'Helvetica-Bold' }]}>Betrag</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>{data.description}</Text>
            <Text style={styles.colAmt}>{fmtCur(data.amount)}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Gesamtbetrag</Text>
          <Text style={styles.totalAmt}>{fmtCur(data.amount)}</Text>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>
            {data.paymentStatus === 'paid' ? '✓ Bereits bezahlt' : data.paymentStatus === 'stripe' ? 'Online-Zahlung (Stripe)' : 'Zahlung per Überweisung'}
          </Text>
          {data.paymentStatus === 'transfer' && (
            <>
              <Text style={styles.paymentLine}>Helgoländer Dienstleistungs GmbH</Text>
              <Text style={styles.paymentLine}>IBAN: DE94 2175 0000 0190 1018 87</Text>
              <Text style={styles.paymentLine}>BIC: NOLADE21NOS</Text>
              <Text style={styles.paymentLine}>Verwendungszweck: {data.reference}</Text>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland</Text>
          <Text>Geschäftsführer: Kay Martens · HRB 19416 PI · Amtsgericht Pinneberg · USt-IdNr.: DE173507934</Text>
          <Text style={{ marginTop: 6 }}>Helgoland: Gemäß §1 Abs. 2 UStG wird keine Umsatzsteuer erhoben. Alle Preise sind Endpreise.</Text>
        </View>
      </Page>
    </Document>
  );
}

// GET: fetch invoice metadata (or PDF if ?download=1 and invoice_data exists)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { searchParams } = new URL(req.url);
  const download = searchParams.get('download') === '1';

  const supabase = getSupabaseAdmin();
  const { data: inv, error } = await supabase
    .from('manual_invoices')
    .select('*')
    .eq('access_token', token)
    .single();

  if (error || !inv) {
    return NextResponse.json({ error: 'Rechnung nicht gefunden' }, { status: 404 });
  }

  if (download) {
    if (!inv.invoice_data) {
      return NextResponse.json({ error: 'Bitte zuerst Rechnungsdaten ausfüllen' }, { status: 400 });
    }

    // Assign strictly sequential invoice number (fortlaufend, GoBD-compliant)
    // Shares the RE-YYYY-NNNN sequence with booking invoices (bookings.invoice_number)
    let invoiceNumber = inv.invoice_number;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();

      // Find highest existing invoice number across BOTH bookings and manual_invoices
      const [bookingInvs, manualInvs] = await Promise.all([
        supabase
          .from('bookings')
          .select('invoice_number')
          .like('invoice_number', `RE-${year}-%`)
          .not('invoice_number', 'is', null),
        supabase
          .from('manual_invoices')
          .select('invoice_number')
          .like('invoice_number', `RE-${year}-%`)
          .not('invoice_number', 'is', null),
      ]);

      let maxNum = 4200; // so nextNum starts at 4201
      const rows = [...(bookingInvs.data || []), ...(manualInvs.data || [])];
      for (const r of rows) {
        const parts = r.invoice_number?.split('-');
        if (parts && parts.length === 3) {
          const n = parseInt(parts[2], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }
      const nextNum = maxNum + 1;
      invoiceNumber = `RE-${year}-${nextNum}`;

      const { error: updateErr } = await supabase
        .from('manual_invoices')
        .update({ invoice_number: invoiceNumber, invoice_date: new Date().toISOString().slice(0, 10) })
        .eq('id', inv.id)
        .is('invoice_number', null); // Concurrent safety: only set if still null

      if (updateErr) {
        console.error('Invoice number save error:', updateErr);
      }

      // If concurrent request already set one, re-fetch
      const { data: re } = await supabase
        .from('manual_invoices')
        .select('invoice_number')
        .eq('id', inv.id)
        .single();
      if (re?.invoice_number) invoiceNumber = re.invoice_number;
    }

    const pdfBuffer = await renderToBuffer(
      <ManualInvoiceDoc
        data={{
          reference: inv.reference,
          invoiceNumber,
          invoiceDate: inv.invoice_date || new Date().toISOString().slice(0, 10),
          description: inv.description,
          amount: Number(inv.amount),
          paymentStatus: inv.payment_status,
          buyer: inv.invoice_data,
        }}
      />
    );

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Rechnung-${invoiceNumber}.pdf"`,
      },
    });
  }

  return NextResponse.json({
    reference: inv.reference,
    description: inv.description,
    amount: Number(inv.amount),
    payment_status: inv.payment_status,
    stripe_url: inv.stripe_url,
    invoice_data: inv.invoice_data,
    invoice_number: inv.invoice_number,
  });
}

// PATCH: customer submits their billing data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const { invoice_data } = body as { invoice_data?: Record<string, string> };

  if (
    !invoice_data ||
    !invoice_data.name ||
    !invoice_data.street ||
    !invoice_data.postal_code ||
    !invoice_data.city
  ) {
    return NextResponse.json({ error: 'Bitte alle Pflichtfelder ausfüllen' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('manual_invoices')
    .update({ invoice_data })
    .eq('access_token', token);

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
