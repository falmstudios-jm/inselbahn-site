import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingConfirmPage({ params }: PageProps) {
  const { id } = await params;

  const { data: booking, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*, departures:departure_id(*, tours:tour_id(*))')
    .eq('id', id)
    .eq('status', 'confirmed')
    .single();

  if (error || !booking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Buchung nicht gefunden
          </h1>
          <p className="text-gray-600 mb-6">
            Diese Buchung existiert nicht oder wurde noch nicht bestätigt.
            Bitte überprüfen Sie Ihre E-Mail für die Buchungsbestätigung.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#1a3a5c] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#15304d] transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const tour = booking.departures?.tours;
  const departure = booking.departures;

  const formattedDate = new Date(
    booking.booking_date + 'T00:00:00'
  ).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const passengers: string[] = [];
  passengers.push(`${booking.adults} Erwachsene`);
  if (booking.children > 0)
    passengers.push(`${booking.children} Kinder (6–14)`);
  if (booking.children_free > 0)
    passengers.push(`${booking.children_free} Kinder (0–5, frei)`);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-[#1a3a5c] px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 animate-bounce">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Buchung bestätigt!
          </h1>
          <p className="text-blue-200 mt-2 text-sm">
            Vielen Dank für Ihre Buchung bei der Inselbahn Helgoland
          </p>
        </div>

        {/* Booking Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Buchungsnummer
              </p>
              <p className="text-lg font-bold text-[#1a3a5c]">
                {booking.booking_reference}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Tour
              </p>
              <p className="text-gray-800 font-medium">
                {tour?.name || 'Inselbahn Tour'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Datum &amp; Uhrzeit
              </p>
              <p className="text-gray-800">
                {formattedDate}, {departure?.departure_time} Uhr
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Fahrgäste
              </p>
              <p className="text-gray-800">{passengers.join(', ')}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Gesamtpreis
              </p>
              <p className="text-lg font-bold text-[#1a3a5c]">
                {booking.total_price.toFixed(2).replace('.', ',')} &euro;
              </p>
            </div>
          </div>

          {/* Meeting Point */}
          <div className="border-l-4 border-amber-500 pl-4 py-2">
            <p className="font-semibold text-gray-800 text-sm">Treffpunkt</p>
            <p className="text-gray-600 text-sm">
              Franz-Schensky-Platz, Helgoland
            </p>
            <p className="text-gray-600 text-sm">
              Bitte seien Sie <strong>15 Minuten vor Abfahrt</strong> am
              Treffpunkt.
            </p>
          </div>

          {/* Email Notice */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              Eine Buchungsbestätigung wird per E-Mail an{' '}
              <strong>{booking.customer_email}</strong> gesendet.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="px-6 pb-6 text-center">
          <Link
            href="/"
            className="inline-block bg-[#1a3a5c] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#15304d] transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
