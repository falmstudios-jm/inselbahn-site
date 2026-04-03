const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

export function buildConfirmationEmail(params: {
  customerName: string;
  bookingReference: string;
  tourName: string;
  bookingDate: string;
  departureTime: string;
  adults: number;
  children: number;
  childrenFree: number;
  totalAmount: string;
  ticketUrl: string;
  cancelUrl: string;
  invoiceUrl?: string;
}): string {
  const {
    bookingReference,
    customerName,
    tourName,
    bookingDate,
    departureTime,
    adults,
    children,
    childrenFree,
    totalAmount,
    cancelUrl,
    ticketUrl,
    invoiceUrl,
  } = params;

  const invoicePageUrl = `${BASE_URL}/booking/invoice`;

  const formattedDate = new Date(bookingDate + 'T00:00:00').toLocaleDateString(
    'de-DE',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  const formattedTime = departureTime.slice(0, 5);

  const totalNum = parseFloat(totalAmount);
  const formattedTotal = isNaN(totalNum) ? totalAmount : totalNum.toFixed(2).replace('.', ',');

  const passengers: string[] = [];
  passengers.push(`${adults} ${adults === 1 ? 'Erwachsener' : 'Erwachsene'}`);
  if (children > 0) passengers.push(`${children} ${children === 1 ? 'Kind' : 'Kinder'} (6\u201314 Jahre)`);
  if (childrenFree > 0) passengers.push(`${childrenFree} ${childrenFree === 1 ? 'Kind' : 'Kinder'} (0\u20135 Jahre, frei)`);

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:'Montserrat',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Red top border -->
          <tr>
            <td style="background-color:#F24444;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 24px 20px;text-align:center;">
              <h1 style="color:#333333;margin:0;font-size:22px;font-weight:700;letter-spacing:2px;">INSELBAHN HELGOLAND</h1>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#4B8B3B;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">\u2713 Buchung best\u00E4tigt</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, vielen Dank f\u00FCr Ihre Buchung!
              </p>

              <!-- Booking Reference -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Buchungsnummer</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#333333;letter-spacing:3px;">${bookingReference}</p>
                  </td>
                </tr>
              </table>

              <!-- Tour Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#333333;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum &amp; Uhrzeit</p>
                    <p style="margin:0 0 14px;font-size:15px;color:#333;">${formattedDate}, ${formattedTime} Uhr</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Fahrg\u00E4ste</p>
                    <p style="margin:0 0 14px;font-size:15px;color:#333;">${passengers.join('<br>')}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Gesamtpreis</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#333333;">${formattedTotal} \u20AC</p>
                  </td>
                </tr>
              </table>

              <!-- Meeting Point -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #F24444;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;"><a href="https://www.google.com/maps/place/Inselbahn+Rundfahrten+Helgoland/@54.1810127,7.8906696,17z" style="color:#333;text-decoration:none;">Treffpunkt: Franz-Schensky-Platz \u{1F4CD}</a></p>
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                      Halunder Jet / Katamarane: ca. 5 Min. \u00B7 MS Helgoland: ca. 15 Min.<br>
                      Landungsbr\u00FCcke (B\u00F6rteboot/D\u00FCne): ca. 2\u20133 Min.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tips Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#333;">Gut zu wissen</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5;">\u23F0 Bitte 15 Min. vor Abfahrt da sein</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5;">\uD83D\uDEBB Toilette an der Landungsbr\u00FCcke (kostenlos). Keine Toilette w\u00E4hrend der Premium-Tour!</p>
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.5;">\uD83C\uDF27\uFE0F Bei Regen fahren wir (\u00FCberdachte Wagen)</p>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${ticketUrl}" style="display:block;background-color:#F24444;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      Fahrkarte herunterladen (PDF)
                    </a>
                  </td>
                </tr>
                ${invoiceUrl ? `
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${invoiceUrl}" style="display:block;background-color:#555555;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      Rechnung herunterladen (PDF)
                    </a>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Self-service Links -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #E0E0E0;">
                    ${!invoiceUrl ? `<p style="margin:0 0 6px;font-size:12px;"><a href="${invoicePageUrl}" style="color:#888;text-decoration:underline;">Rechnung nachtr\u00E4glich anfordern</a></p>` : ''}
                    <p style="margin:0 0 6px;font-size:12px;color:#888;">Kostenlose Stornierung bis Mitternacht am Vortag: <a href="${cancelUrl}" style="color:#888;text-decoration:underline;">Buchung stornieren</a></p>
                    <p style="margin:0;font-size:12px;"><a href="${BASE_URL}/agb" style="color:#888;text-decoration:underline;">AGB &amp; Stornierungsbedingungen</a></p>
                  </td>
                </tr>
              </table>

              <!-- Tax note -->
              <p style="font-size:11px;color:#999;line-height:1.5;margin:0;">
                Alle Preise sind Endpreise. Gem\u00E4\u00DF \u00A71 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F7F7;padding:24px;text-align:center;border-top:1px solid #E0E0E0;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;">
                Helgol\u00E4nder Dienstleistungs GmbH \u00B7 Von-Aschen-Str. 594 \u00B7 27498 Helgoland
              </p>
              <a href="mailto:info@helgolandbahn.de" style="font-size:12px;color:#F24444;text-decoration:none;">
                info@helgolandbahn.de
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#aaa;">
                Inselbahn Helgoland \u2014 Gef\u00FChrte Inselrundfahrten auf Deutschlands einziger Hochseeinsel
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
