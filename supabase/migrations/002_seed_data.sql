-- Seed tours
INSERT INTO tours (slug, name, description, duration_minutes, max_capacity, price_adult, price_child, wheelchair_accessible, dogs_allowed, highlights, notes) VALUES
('unterland', 'Unterland-Tour', 'Die klassische Inselrundfahrt durch das Unterland. Sie fahren entlang der Landungsbrücke, durch das malerische Unterland und erhalten einen Fotostopp im Nordostland mit Blick auf die Düne.', 45, 42, 11.00, 6.00, true, true, ARRAY['Hafen & Landungsbrücke', 'Nordostland erkunden', 'Historische Gebäude', 'Fotostopp an den Hummerbuden'], 'Kinder fahren um 14:30 kostenlos! 1 Rollstuhlplatz verfügbar.'),
('premium', 'Premium-Tour', 'Das komplette Helgoland-Erlebnis mit Ausstieg an der Langen Anna. Exklusive Kleingruppe mit maximal 18 Personen. Ober- und Unterland komplett mit 30 Minuten freier Erkundung.', 90, 18, 22.00, 15.00, false, false, ARRAY['Ober- und Unterland komplett', '30 Min freie Erkundung', 'Exklusive Kleingruppe', 'Ausstieg an der Langen Anna'], 'Keine Hunde erlaubt. Festes Schuhwerk empfohlen.');

-- Seed departures for Unterland
INSERT INTO departures (tour_id, departure_time, notes)
SELECT id, '12:15'::TIME, 'Nach Schiffsankunft' FROM tours WHERE slug = 'unterland';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '13:30'::TIME FROM tours WHERE slug = 'unterland';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '14:30'::TIME FROM tours WHERE slug = 'unterland';
INSERT INTO departures (tour_id, departure_time, notes)
SELECT id, '14:50'::TIME, 'Letzte Tour' FROM tours WHERE slug = 'unterland';

-- Seed departures for Premium
INSERT INTO departures (tour_id, departure_time)
SELECT id, '11:00'::TIME FROM tours WHERE slug = 'premium';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '12:15'::TIME FROM tours WHERE slug = 'premium';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '13:15'::TIME FROM tours WHERE slug = 'premium';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '14:00'::TIME FROM tours WHERE slug = 'premium';
INSERT INTO departures (tour_id, departure_time)
SELECT id, '15:00'::TIME FROM tours WHERE slug = 'premium';
INSERT INTO departures (tour_id, departure_time, notes)
SELECT id, '16:00'::TIME, 'Letzte Tour' FROM tours WHERE slug = 'premium';
