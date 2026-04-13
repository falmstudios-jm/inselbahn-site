import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';

const colors = {
  red: '#F24444',
  dark: '#333333',
  surface: '#F7F7F7',
  green: '#4B8B3B',
  textLight: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
  amber: '#D97706',
  navy: '#1E3A5F',
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    fontSize: 11,
    color: colors.dark,
  },
  // ── Header ──
  headerBar: {
    borderBottomWidth: 3,
    borderBottomColor: colors.red,
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.red,
    marginTop: 4,
    letterSpacing: 2,
  },
  // ── Reference ──
  referenceBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  referenceValue: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    letterSpacing: 3,
  },
  // ── Customer ──
  customerRow: {
    marginBottom: 14,
  },
  customerLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  // ── Info Boxes ──
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  infoBoxAmber: {
    borderLeftColor: colors.amber,
  },
  infoBoxNavy: {
    borderLeftColor: colors.navy,
  },
  infoBoxDefault: {
    borderLeftColor: colors.red,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: 90,
    paddingTop: 2,
  },
  infoValue: {
    fontSize: 12,
    color: colors.dark,
    flex: 1,
  },
  infoValueBold: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    flex: 1,
  },
  // ── Passengers ──
  passengersBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  passengersTitle: {
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  passengerLine: {
    fontSize: 12,
    color: colors.dark,
    marginBottom: 4,
    lineHeight: 1.6,
  },
  // ── Total ──
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.dark,
    borderBottomWidth: 2,
    borderBottomColor: colors.dark,
    paddingVertical: 10,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
  },
  // ── Meeting Point ──
  meetingBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  meetingTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    marginBottom: 6,
  },
  meetingText: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 1.6,
  },
  // ── Tips ──
  tipsBox: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  tipsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.dark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tipLine: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: 1.7,
    marginBottom: 3,
  },
  // ── Cancel link ──
  cancelText: {
    fontSize: 9,
    color: colors.textLight,
    marginBottom: 4,
  },
  cancelLink: {
    fontSize: 9,
    color: colors.red,
    textDecoration: 'underline',
  },
  // ── Divider ──
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: 16,
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
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    marginBottom: 3,
  },
});

export interface TicketData {
  bookingReference: string;
  customerName: string;
  tourName: string;
  bookingDate: string; // ISO date string e.g. "2026-04-04"
  departureTime: string; // e.g. "14:00:00"
  adults: number;
  children: number;
  childrenFree: number;
  totalAmount: number;
  cancelUrl?: string;
  createdAt?: string; // ISO date string for when booking was made
}

function formatGermanDate(isoDate: string): string {
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];
  const date = new Date(isoDate + 'T00:00:00');
  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday}, ${day}. ${month} ${year}`;
}

function formatTime(time: string): string {
  return time.slice(0, 5) + ' Uhr';
}

function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' \u20AC';
}

function getTourBorderStyle(tourName: string) {
  const lower = tourName.toLowerCase();
  if (lower.includes('premium')) return styles.infoBoxNavy;
  if (lower.includes('unterland')) return styles.infoBoxAmber;
  return styles.infoBoxDefault;
}

export function TicketDocument({ data }: { data: TicketData }) {
  const passengers: string[] = [];
  if (data.adults > 0) {
    passengers.push(
      `${data.adults} ${data.adults === 1 ? 'Erwachsener' : 'Erwachsene'}`
    );
  }
  if (data.children > 0) {
    passengers.push(
      `${data.children} ${data.children === 1 ? 'Kind' : 'Kinder'} (bis 15 J.)`
    );
  }
  if (data.childrenFree > 0) {
    passengers.push(
      `${data.childrenFree} ${data.childrenFree === 1 ? 'Kind' : 'Kinder'} (0\u20135 Jahre, kostenlos)`
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>INSELBAHN HELGOLAND</Text>
          <Text style={styles.headerSubtitle}>FAHRKARTE</Text>
        </View>

        {/* Booking Reference — large and prominent */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Buchungsnummer</Text>
          <Text style={styles.referenceValue}>{data.bookingReference}</Text>
        </View>

        {/* Customer Name */}
        <View style={styles.customerRow}>
          <Text style={styles.customerLabel}>Fahrgast</Text>
          <Text style={styles.customerName}>{data.customerName}</Text>
          {data.createdAt && (
            <Text style={[styles.customerLabel, { marginTop: 4 }]}>
              Gebucht am: {formatGermanDate(data.createdAt)}
            </Text>
          )}
        </View>

        {/* Tour Info Box */}
        <View style={[styles.infoBox, getTourBorderStyle(data.tourName)]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tour</Text>
            <Text style={styles.infoValueBold}>{data.tourName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Datum</Text>
            <Text style={styles.infoValue}>{formatGermanDate(data.bookingDate)}</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.infoLabel}>Abfahrt</Text>
            <Text style={styles.infoValueBold}>{formatTime(data.departureTime)}</Text>
          </View>
        </View>

        {/* Passengers */}
        <View style={styles.passengersBox}>
          <Text style={styles.passengersTitle}>Fahrgäste</Text>
          {passengers.map((p, i) => (
            <Text key={i} style={styles.passengerLine}>{'\u2022'} {p}</Text>
          ))}
        </View>

        {/* Total Amount */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Gesamtpreis</Text>
          <Text style={styles.totalValue}>{formatAmount(data.totalAmount)}</Text>
        </View>

        {/* Meeting Point */}
        <View style={styles.meetingBox}>
          <Text style={styles.meetingTitle}>Treffpunkt: Franz-Schensky-Platz</Text>
          <Text style={styles.meetingText}>
            Direkt zwischen Tourist-Information und Büste von H. Hoffmann von Fallersleben, am Landungsbrückenvorplatz{'\n'}
            Halunder Jet / Katamarane: ca. 5 Min. · MS Helgoland: ca. 15 Min.{'\n'}
            Landungsbrücke (Börteboot): ca. 3 Min. · Düne: ca. 2 Min.
          </Text>
        </View>

        {/* Important Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Wichtige Hinweise</Text>
          <Text style={styles.tipLine}>
            {'\u2022'} Bitte 15 Minuten vor Abfahrt am Treffpunkt sein
          </Text>
          <Text style={styles.tipLine}>
            {'\u2022'} Toilette: Im Gebäude der Landungsbrücke (kostenlos). Während der Premium-Tour gibt es keine Toilettenmöglichkeit!
          </Text>
          <Text style={styles.tipLine}>
            {'\u2022'} Bei Regen fahren wir — unsere Wagen sind überdacht
          </Text>
        </View>

        {/* Cancellation Link */}
        {data.cancelUrl ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.cancelText}>
              Buchung stornieren (kostenlos bis Mitternacht am Vortag):
            </Text>
            <Link src={data.cancelUrl} style={styles.cancelLink}>
              {data.cancelUrl}
            </Link>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland · info@helgolandbahn.de
          </Text>
          <Text style={styles.footerText}>
            Alle Preise sind Endpreise. Keine Umsatzsteuer (§1 Abs. 2 UStG).
          </Text>
        </View>
      </Page>
    </Document>
  );
}
