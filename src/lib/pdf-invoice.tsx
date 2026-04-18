import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const colors = {
  red: '#F24444',
  dark: '#333333',
  surface: '#F7F7F7',
  green: '#4B8B3B',
  textLight: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    fontSize: 10,
    color: colors.dark,
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: colors.red,
    paddingBottom: 16,
  },
  headerLeft: {},
  companyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: 2,
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 8,
    color: colors.textLight,
  },
  rechnungTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: 3,
    textAlign: 'right',
  },
  invoiceNumberHeader: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  // ── Address blocks ──
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  addressBlock: {
    width: '48%',
  },
  addressLabel: {
    fontSize: 8,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  addressText: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.6,
  },
  addressTextBold: {
    fontSize: 10,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.6,
  },
  // ── Invoice details row ──
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  // ── Table ──
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableTourRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableTourCell: {
    fontSize: 10,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    fontSize: 10,
    color: colors.dark,
  },
  tableCellBold: {
    fontSize: 10,
    color: colors.dark,
    fontFamily: 'Helvetica-Bold',
  },
  colDescription: { width: '45%' },
  colQuantity: { width: '15%', textAlign: 'center' },
  colUnitPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  // ── Totals ──
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  totalsBox: {
    width: 240,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: colors.dark,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: 10,
    color: colors.dark,
  },
  totalLabelFinal: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  totalValueFinal: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  // ── Payment ──
  paymentBox: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    marginBottom: 2,
  },
  paymentText: {
    fontSize: 10,
    color: colors.textLight,
  },
  // ── Notes ──
  noteBox: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: colors.textLight,
    lineHeight: 1.6,
  },
  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerCol: {
    width: '32%',
  },
  footerLabel: {
    fontSize: 7,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    lineHeight: 1.5,
  },
});

// ── Types ──

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string; // ISO date string
  bookingReference: string;
  // Buyer
  buyerCompanyName: string;
  buyerStreet: string;
  buyerPostalCode: string;
  buyerCity: string;
  buyerCountry?: string;
  buyerVatId?: string;
  // Tour info
  tourName: string;
  bookingDate: string; // ISO date string
  departureTime: string; // e.g. "14:00:00"
  // Line items
  adults: number;
  children: number;
  childrenFree: number;
  priceAdult: number;
  priceChild: number;
  totalAmount: number;
  // Payment
  paidOnline: boolean;
  paymentMethod?: string | null;
}

// ── Helpers ──

function formatGermanDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const day = date.getDate();
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];
  return `${day}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(time: string): string {
  return time.slice(0, 5) + ' Uhr';
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

// ── Invoice Number Generator ──

// This is now a fallback only — prefer getNextInvoiceNumber() for sequential numbering
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const num = 4200 + Math.floor(Math.random() * 100);
  return `RE-${year}-${num}`;
}

// ── Document Component ──

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const lineItems: InvoiceLineItem[] = [];

  if (data.adults > 0) {
    lineItems.push({
      description: 'Erwachsene',
      quantity: data.adults,
      unitPrice: data.priceAdult,
      total: data.adults * data.priceAdult,
    });
  }

  if (data.children > 0) {
    lineItems.push({
      description: 'Kinder (bis 15 J.)',
      quantity: data.children,
      unitPrice: data.priceChild,
      total: data.children * data.priceChild,
    });
  }

  if (data.childrenFree > 0) {
    lineItems.push({
      description: 'Kinder (0\u20135 Jahre)',
      quantity: data.childrenFree,
      unitPrice: 0,
      total: 0,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const tourLine = `${data.tourName}, ${formatGermanDate(data.bookingDate)}, ${formatTime(data.departureTime)}`;

  const paymentDate = formatGermanDate(data.invoiceDate);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>INSELBAHN HELGOLAND</Text>
            <Text style={styles.companyTagline}>Helgoländer Dienstleistungs GmbH</Text>
          </View>
          <View>
            <Text style={styles.rechnungTitle}>RECHNUNG</Text>
            <Text style={styles.invoiceNumberHeader}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressRow}>
          {/* Seller */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Rechnungssteller</Text>
            <Text style={styles.addressTextBold}>
              Helgoländer Dienstleistungs GmbH
            </Text>
            <Text style={styles.addressText}>Von-Aschen-Str. 594</Text>
            <Text style={styles.addressText}>27498 Helgoland</Text>
            <Text style={styles.addressText}>Deutschland</Text>
            <Text style={styles.addressText}>USt-IdNr.: DE173507934</Text>
          </View>
          {/* Buyer */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Rechnungsempfänger</Text>
            <Text style={styles.addressTextBold}>
              {data.buyerCompanyName}
            </Text>
            <Text style={styles.addressText}>{data.buyerStreet}</Text>
            <Text style={styles.addressText}>
              {data.buyerPostalCode} {data.buyerCity}
            </Text>
            {data.buyerCountry && data.buyerCountry !== 'Deutschland' ? (
              <Text style={styles.addressText}>{data.buyerCountry}</Text>
            ) : null}
            {data.buyerVatId ? (
              <Text style={styles.addressText}>
                USt-IdNr.: {data.buyerVatId}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Invoice details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rechnungsnr.</Text>
            <Text style={styles.detailValue}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rechnungsdatum</Text>
            <Text style={styles.detailValue}>{formatGermanDate(data.invoiceDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Buchungsnr.</Text>
            <Text style={styles.detailValue}>{data.bookingReference}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Buchungsdatum</Text>
            <Text style={styles.detailValue}>{formatGermanDate(data.bookingDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Zahlung</Text>
            <Text style={styles.detailValue}>
              {data.paymentMethod === 'gift_card'
                ? 'Gutschein'
                : data.paymentMethod === 'cash'
                  ? 'Bar'
                  : data.paymentMethod === 'sumup'
                    ? 'SumUp'
                    : data.paidOnline
                      ? 'Online'
                      : 'Vor Ort'}
            </Text>
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Beschreibung
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
              Menge
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>
              Einzelpreis
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>
              Gesamt
            </Text>
          </View>

          {/* Tour name row */}
          <View style={styles.tableTourRow}>
            <Text style={[styles.tableTourCell, { width: '100%' }]}>
              {tourLine}
            </Text>
          </View>

          {/* Line item rows */}
          {lineItems.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colUnitPrice]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCellBold, styles.colTotal]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Nettobetrag</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>USt 0% (§1 Abs. 2 UStG)</Text>
              <Text style={styles.totalValue}>{formatCurrency(0)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Gesamtbetrag</Text>
              <Text style={styles.totalValueFinal}>
                {formatCurrency(data.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment status */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Zahlungsstatus</Text>
          <Text style={styles.paymentText}>
            {data.paymentMethod === 'gift_card'
              ? 'Bezahlt mit Gutschein'
              : data.paymentMethod === 'cash'
                ? 'Bezahlt vor Ort (Bar)'
                : data.paymentMethod === 'sumup'
                  ? 'Bezahlt vor Ort (Karte/SumUp)'
                  : data.paidOnline
                    ? `Bezahlt am ${paymentDate} via Online-Zahlung`
                    : 'Bezahlt vor Ort (Bar/Karte)'}
          </Text>
        </View>

        {/* VAT Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Hinweis zur Umsatzsteuer</Text>
          <Text style={styles.noteText}>
            Helgoland ist gemäß §1 Abs. 2 UStG kein Inland im Sinne des
            Umsatzsteuergesetzes. Daher wird keine Umsatzsteuer erhoben.
            Alle Preise sind Endpreise.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Unternehmen</Text>
            <Text style={styles.footerText}>
              Helgoländer Dienstleistungs GmbH{'\n'}
              Von-Aschen-Str. 594{'\n'}
              27498 Helgoland{'\n'}
              Geschäftsführer: Kay Martens
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Register</Text>
            <Text style={styles.footerText}>
              HRB 19416 PI{'\n'}
              Amtsgericht Pinneberg{'\n'}
              USt-IdNr.: DE173507934
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Steuerhinweis</Text>
            <Text style={styles.footerText}>
              Kein Vorsteuerabzug —{'\n'}
              Helgoland ist gemäß §1 Abs. 2{'\n'}
              UStG umsatzsteuerfrei
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
