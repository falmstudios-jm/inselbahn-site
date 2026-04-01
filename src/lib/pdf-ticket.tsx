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
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 6,
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#a3c4e0',
    fontSize: 12,
    marginTop: 6,
  },
  referenceBox: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  detailsCard: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: 120,
    paddingTop: 2,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  detailValueBold: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  amountValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    flex: 1,
  },
  infoBox: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    paddingLeft: 14,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 1.5,
  },
  hintsBox: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 20,
    borderStyle: 'dashed',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#aaaaaa',
  },
});

export interface TicketData {
  bookingReference: string;
  tourName: string;
  bookingDate: string; // ISO date string e.g. "2026-04-04"
  departureTime: string; // e.g. "14:00:00"
  adults: number;
  children: number;
  childrenFree: number;
  totalAmount: number;
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

export function TicketDocument({ data }: { data: TicketData }) {
  const passengers: string[] = [];
  passengers.push(
    `${data.adults} ${data.adults === 1 ? 'Erwachsener' : 'Erwachsene'}`
  );
  if (data.children > 0) {
    passengers.push(
      `${data.children} ${data.children === 1 ? 'Kind' : 'Kinder'} (6\u201314 Jahre)`
    );
  }
  if (data.childrenFree > 0) {
    passengers.push(
      `${data.childrenFree} ${data.childrenFree === 1 ? 'Kind' : 'Kinder'} (0\u20135 Jahre)`
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INSELBAHN HELGOLAND</Text>
          <Text style={styles.headerSubtitle}>Fahrkarte / Ticket</Text>
        </View>

        {/* Booking Reference */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Buchungsnummer</Text>
          <Text style={styles.referenceValue}>{data.bookingReference}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tour</Text>
            <Text style={styles.detailValueBold}>{data.tourName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Datum</Text>
            <Text style={styles.detailValue}>
              {formatGermanDate(data.bookingDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Abfahrt</Text>
            <Text style={styles.detailValueBold}>
              {formatTime(data.departureTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fahrgäste</Text>
            <Text style={styles.detailValue}>{passengers.join(', ')}</Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.detailLabel}>Gesamtpreis</Text>
            <Text style={styles.amountValue}>
              {formatAmount(data.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Meeting Point */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Treffpunkt</Text>
          <Text style={styles.infoText}>
            Franz-Schensky-Platz, Helgoland
          </Text>
        </View>

        {/* Hints */}
        <View style={styles.hintsBox}>
          <Text style={styles.hintText}>
            {'\u2022'} Bitte 15 Minuten vor Abfahrt am Treffpunkt sein
          </Text>
          <Text style={styles.hintText}>
            {'\u2022'} Stornierung bis Mitternacht am Vortag kostenlos
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Helgoländer Dienstleistungs GmbH · info@helgolandbahn.de
          </Text>
        </View>
      </Page>
    </Document>
  );
}
