import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const colors = {
  primary: '#1a3a5c',
  accent: '#e8a838',
  text: '#333333',
  textLight: '#666666',
  border: '#d0d0d0',
  bg: '#f8f9fa',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    fontSize: 11,
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerLeft: {},
  rechnungTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  // ── Address blocks ──
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    width: '48%',
  },
  addressLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  addressText: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.6,
  },
  addressTextBold: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.6,
  },
  // ── Reference row ──
  referenceRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  referenceItem: {
    flex: 1,
  },
  referenceLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  referenceValue: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'Helvetica-Bold',
  },
  // ── Table ──
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 9,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 11,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 11,
    color: colors.text,
    fontFamily: 'Helvetica-Bold',
  },
  colDescription: { width: '45%' },
  colQuantity: { width: '12%', textAlign: 'right' },
  colUnitPrice: { width: '18%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
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
    borderTopColor: colors.primary,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: 11,
    color: colors.text,
  },
  totalLabelFinal: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  totalValueFinal: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  // ── Notes ──
  noteBox: {
    backgroundColor: colors.bg,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: colors.textLight,
    lineHeight: 1.6,
  },
  // ── Payment info ──
  paymentBox: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    paddingLeft: 14,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 2,
  },
  paymentText: {
    fontSize: 11,
    color: colors.textLight,
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
  return amount.toFixed(2).replace('.', ',') + ' \u20AC';
}

// ── Invoice Number Generator ──

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const chars = '0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RE-${year}-${suffix}`;
}

// ── Document Component ──

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const lineItems: InvoiceLineItem[] = [];

  if (data.adults > 0) {
    lineItems.push({
      description: `${data.tourName} — Erwachsene`,
      quantity: data.adults,
      unitPrice: data.priceAdult,
      total: data.adults * data.priceAdult,
    });
  }

  if (data.children > 0) {
    lineItems.push({
      description: `${data.tourName} — Kinder (6–14 Jahre)`,
      quantity: data.children,
      unitPrice: data.priceChild,
      total: data.children * data.priceChild,
    });
  }

  if (data.childrenFree > 0) {
    lineItems.push({
      description: `${data.tourName} — Kinder (0–5 Jahre, frei)`,
      quantity: data.childrenFree,
      unitPrice: 0,
      total: 0,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.rechnungTitle}>RECHNUNG</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Rechnungsdatum: {formatGermanDate(data.invoiceDate)}
            </Text>
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
            <Text style={styles.addressText}>Am Falm 302 A</Text>
            <Text style={styles.addressText}>27498 Helgoland</Text>
            <Text style={styles.addressText}>Deutschland</Text>
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
            {data.buyerVatId ? (
              <Text style={styles.addressText}>
                USt-IdNr.: {data.buyerVatId}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Reference row */}
        <View style={styles.referenceRow}>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceLabel}>Buchungsnummer</Text>
            <Text style={styles.referenceValue}>
              {data.bookingReference}
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceLabel}>Tourdatum</Text>
            <Text style={styles.referenceValue}>
              {formatGermanDate(data.bookingDate)}
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceLabel}>Abfahrt</Text>
            <Text style={styles.referenceValue}>
              {formatTime(data.departureTime)}
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

          {/* Table rows */}
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
              <Text style={styles.totalLabel}>Umsatzsteuer</Text>
              <Text style={styles.totalValue}>0,00 \u20AC</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Gesamtbetrag</Text>
              <Text style={styles.totalValueFinal}>
                {formatCurrency(data.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* VAT Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Hinweis zur Umsatzsteuer</Text>
          <Text style={styles.noteText}>
            Helgoland ist gemäß §1 Abs. 2 UStG kein Inland im Sinne des
            Umsatzsteuergesetzes. Daher wird keine Umsatzsteuer erhoben.
          </Text>
        </View>

        {/* Payment info */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Zahlungsstatus</Text>
          <Text style={styles.paymentText}>
            {data.paidOnline
              ? 'Bereits bezahlt via Online-Zahlung'
              : 'Bezahlt vor Ort'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Unternehmen</Text>
            <Text style={styles.footerText}>
              Helgoländer Dienstleistungs GmbH{'\n'}
              Am Falm 302 A{'\n'}
              27498 Helgoland
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Kontakt</Text>
            <Text style={styles.footerText}>
              info@helgolandbahn.de{'\n'}
              www.helgolandbahn.de
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Hinweis</Text>
            <Text style={styles.footerText}>
              Kein Vorsteuerabzug —{'\n'}
              Helgoland ist umsatzsteuerfreie Zone
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
