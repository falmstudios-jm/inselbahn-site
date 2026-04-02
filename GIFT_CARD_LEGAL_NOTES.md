# Gutscheine -- AGB-Abschnitt (zur Integration in /src/app/agb/page.tsx)

Folgender Text muss als eigener Abschnitt (z.B. SS 8) in die AGB aufgenommen werden:

---

## SS 8 Gutscheine

1. **Gueltigkeit:** Gutscheine sind ab Kaufdatum drei (3) Jahre gueltig (SS 195 BGB). Die Verjährungsfrist beginnt mit dem Schluss des Jahres, in dem der Gutschein erworben wurde (SS 199 Abs. 1 BGB).

2. **Teileinloesung:** Eine Teileinloesung des Gutscheins ist moeglich. Der Restwert bleibt erhalten und kann bei weiteren Buchungen eingeloest werden.

3. **Barauszahlung des Restwerts:** Betraegt der Restwert eines Gutscheins weniger als 1,00 EUR, kann der Inhaber auf Wunsch die Barauszahlung des Restbetrags verlangen.

4. **Keine Erstattung:** Gutscheine sind vom Umtausch und von der Erstattung ausgeschlossen.

5. **Keine Uebertragbarkeit auf andere Anbieter:** Gutscheine koennen ausschliesslich fuer Leistungen der Inselbahn Helgoland eingeloest werden und sind nicht auf andere Anbieter uebertragbar.

6. **Umsatzsteuer:** Alle auf dem Gutschein ausgewiesenen Preise sind Endpreise. Umsatzsteuer faellt nicht an, da Helgoland gemaess SS 1 Abs. 2 UStG nicht zum Inland im Sinne des Umsatzsteuergesetzes gehoert.

7. **Verlust:** Bei Verlust des Gutscheincodes kann kein Ersatz gewaehrt werden. Der Inhaber ist fuer die sichere Aufbewahrung des Codes selbst verantwortlich.

---

## Technische Hinweise

- Migration `006_gift_cards_discounts.sql`: `expires_at` default ist `CURRENT_DATE + INTERVAL '3 years'` (bereits korrigiert).
- Webhook (`/api/webhooks/stripe/route.ts`): E-Mail zeigt konkretes Ablaufdatum (3 Jahre) und Hinweis auf Teileinloesung (bereits korrigiert).
- Gutschein-Seite (`/gutschein/page.tsx`): Zeigt "Gueltig fuer 3 Jahre" und Teileinloesungs-Hinweis (bereits korrigiert).
- API Route (`/api/gift-card/route.ts`): Setzt kein Ablaufdatum -- das wird ueber die DB-Default-Spalte gehandhabt.
