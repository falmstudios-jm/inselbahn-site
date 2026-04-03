import { supabase } from './supabase';

export interface Tour {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
  price_adult: number;
  price_child: number;
  child_age_limit: number;
  wheelchair_accessible: boolean;
  dogs_allowed: boolean;
  highlights: string[];
  notes: string;
}

export interface Departure {
  id: string;
  tour_id: string;
  departure_time: string;
  is_active: boolean;
  notes: string | null;
}

export interface DepartureWithTour extends Departure {
  tour: Tour;
}

export async function getTours(): Promise<Tour[]> {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('price_adult', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getDepartures(): Promise<DepartureWithTour[]> {
  const { data, error } = await supabase
    .from('departures')
    .select('*, tour:tours(*)')
    .eq('is_active', true)
    .order('departure_time', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ── Fallback data when Supabase is unreachable ──

export const FALLBACK_TOURS: Tour[] = [
  {
    id: 'fallback-unterland',
    slug: 'unterland-tour',
    name: 'Unterland-Tour',
    description:
      'An Bord unserer 2025 speziell für Helgoland angefertigten Inselbahn gleiten Sie mit maximal 6 km/h durch das Unterland — vorbei an den legendären Hummerbuden mit ihren Galerien und Schmuckläden, dem historischen Binnenhafen (von den Helgoländern „Scheibenhafen" genannt), dem Seenotrettungskreuzer Hermann Marwede und dem Alfred-Wegener-Institut für Meeresforschung. Ihr Guide erzählt vom „Big Bang" 1947, der Rückkehr der Insel 1952 und dem zollfreien Alltag auf Deutschlands einziger Hochseeinsel.',
    duration_minutes: 40,
    max_capacity: 42,
    price_adult: 11,
    price_child: 6,
    child_age_limit: 15,
    wheelchair_accessible: true,
    dogs_allowed: true,
    highlights: [
      'Hafen, Landungsbrücke & Südstrandpromenade',
      'Hummerbuden & historischer Binnenhafen',
      'Hermann Marwede & AWI Meeresforschung',
      'Fotostopp im Nordostland mit Dünenblick',
    ],
    notes: 'inkl. kurzem Fotostopp im Nordostland',
  },
  {
    id: 'fallback-premium',
    slug: 'premium-tour',
    name: 'Premium-Tour',
    description:
      'Das komplette Helgoland-Erlebnis in kleiner Gruppe. Zunächst erkunden Sie das Unterland, dann geht es hinauf ins Oberland („deät Bopperlun") bis zum Pinneberg auf 61,3 m — Deutschlands kleinster Gemeinde auf dem höchsten Punkt. Vorbei am stärksten Leuchtturm Deutschlands (ehemaliger Flak-Turm!), den rund 70 Kleingärten und dem Lummenfelsen mit 30 Minuten freier Erkundungszeit an der Langen Anna, dem berühmten 47-Meter-Wahrzeichen.',
    duration_minutes: 90,
    max_capacity: 18,
    price_adult: 22,
    price_child: 15,
    child_age_limit: 15,
    wheelchair_accessible: false,
    dogs_allowed: false,
    highlights: [
      'Unterland & Oberland mit Pinneberg (61,3 m)',
      '30 Min freie Erkundung an der Langen Anna',
      'Leuchtturm, Kleingärten & Lummenfelsen',
      'Kleine Gruppe (max. 18 Personen)',
      'Einblicke in den Inselalltag — Geschichten, die nicht im Reiseführer stehen',
    ],
    notes: 'inkl. Ausstieg an der Langen Anna',
  },
];

export const FALLBACK_DEPARTURES: DepartureWithTour[] = [
  {
    id: 'fallback-dep-u1',
    tour_id: 'fallback-unterland',
    departure_time: '13:30:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[0],
  },
  {
    id: 'fallback-dep-u2',
    tour_id: 'fallback-unterland',
    departure_time: '14:30:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[0],
  },
  {
    id: 'fallback-dep-p1',
    tour_id: 'fallback-premium',
    departure_time: '11:00:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[1],
  },
  {
    id: 'fallback-dep-p2',
    tour_id: 'fallback-premium',
    departure_time: '13:15:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[1],
  },
  {
    id: 'fallback-dep-p3',
    tour_id: 'fallback-premium',
    departure_time: '14:00:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[1],
  },
  {
    id: 'fallback-dep-p4',
    tour_id: 'fallback-premium',
    departure_time: '15:00:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[1],
  },
  {
    id: 'fallback-dep-p5',
    tour_id: 'fallback-premium',
    departure_time: '16:00:00',
    is_active: true,
    notes: null,
    tour: FALLBACK_TOURS[1],
  },
];

/**
 * Safely fetch tours with fallback if Supabase is unreachable.
 */
export async function getToursWithFallback(): Promise<Tour[]> {
  try {
    const tours = await getTours();
    return tours.length > 0 ? tours : FALLBACK_TOURS;
  } catch {
    console.error('Supabase unreachable, using fallback tour data');
    return FALLBACK_TOURS;
  }
}

/**
 * Safely fetch departures with fallback if Supabase is unreachable.
 */
export async function getDeparturesWithFallback(): Promise<DepartureWithTour[]> {
  try {
    const departures = await getDepartures();
    return departures.length > 0 ? departures : FALLBACK_DEPARTURES;
  } catch {
    console.error('Supabase unreachable, using fallback departure data');
    return FALLBACK_DEPARTURES;
  }
}
