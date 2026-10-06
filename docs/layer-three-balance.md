# Schicht-3-Balance v3: Frühstart und Impulsrelais

Seeds 1708, 42, 2026, Start 2026-01-01T00:00:00.000Z. Version 3 ersetzt die früheren Schicht-3-Messwerte. Keine Offline-Produktion vor t=0.

Aktueller Zielvertrag nach dem bewusst eingeführten 50-Credit-Start: **14–30 aktive Minuten (840–1800 s)** für die erste Hardwareanalyse, statt des übergeordneten 15–30-Minuten-Ziels. Die beiden Strategie-Tests verwendeten bisher 880–1800 s und maßen vor dem Startkapital 890 s; jetzt messen beide mit Seed 1708 870 s innerhalb des akzeptierten 840–1800-s-Fensters. Die nachfolgenden Tabellen bleiben historische v3-Messungen, keine neu erzeugten Ergebnisse. Produktions-, Preis-, Forschungs-, Analyse-, Prestige- und Drop-Parameter bleiben unverändert; die Langzeit-Balancebewertung bleibt unabhängig von dieser Early-Game-Entscheidung.

## Deterministische Kostenkalibrierung

Gesuchtes kleinstes ganzzahliges Paar: Datenerzeugung 363 Data, kurze Hardwareanalyse 57623 Data. Die Suche liest die Data-Bestände an den 10-Sekunden-Entscheidungsgrenzen aus: 362 Data erlauben Forschung bereits bei 290 s, 363 erst bei 300 s; 57.622 Data erlauben die Hardwareanalyse bei 890 s, 57.623 erst bei 900 s. Beide Strategien wurden anschließend separat verifiziert.

- Seed 1708, Strategie A: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.
- Seed 1708, Strategie B: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.
- Seed 42, Strategie A: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.
- Seed 42, Strategie B: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.
- Seed 2026, Strategie A: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.
- Seed 2026, Strategie B: Forschung 300s, Hardwareanalyse 900s, Bauplan 1500s, bezahlbar 1500s, fertig 1800s.

## Messläufe

| Seed | Lauf | Profil | Strategie | Prestige | Forschung | Analyse | Bauplan | bezahlbar | fertig | Prestige | ausgerüstet | aktiv/offline gutgeschrieben |
|---:|---|---|:---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1708 | 90m | active | A | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 1708 | 90m | active | B | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 1708 | 7d | active | A | normal | 300s | 900s | 29410s | 29410s | 29710s | 1050s | 29710s | 33600/571200s |
| 1708 | 7d | active | A | delayed | 300s | 900s | 28800s | 28810s | 29110s | 29110s | 29120s | 33600/571200s |
| 1708 | 7d | passive | A | normal | 300s | 28810s | 72000s | 72010s | 86400s | 72010s | 86410s | 6300/499800s |
| 1708 | 7d | passive | A | delayed | 300s | 28810s | 72000s | 72010s | 86400s | 86410s | 86420s | 6300/499800s |
| 42 | 90m | active | A | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 42 | 90m | active | B | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 42 | 7d | active | A | normal | 300s | 900s | 29410s | 29410s | 29710s | 1050s | 29710s | 33600/571200s |
| 42 | 7d | active | A | delayed | 300s | 900s | 28800s | 28810s | 29110s | 29110s | 29120s | 33600/571200s |
| 42 | 7d | passive | A | normal | 300s | 28810s | 72000s | 72010s | 86400s | 72010s | 86410s | 6300/499800s |
| 42 | 7d | passive | A | delayed | 300s | 28810s | 72000s | 72010s | 86400s | 86410s | 86420s | 6300/499800s |
| 2026 | 90m | active | A | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 2026 | 90m | active | B | delayed | 300s | 900s | 1500s | 1500s | 1800s | 1800s | 1810s | 5400/0s |
| 2026 | 7d | active | A | normal | 300s | 900s | 29410s | 29410s | 29710s | 1050s | 29710s | 33600/571200s |
| 2026 | 7d | active | A | delayed | 300s | 900s | 28800s | 28810s | 29110s | 29110s | 29120s | 33600/571200s |
| 2026 | 7d | passive | A | normal | 300s | 28810s | 72000s | 72010s | 86400s | 72010s | 86410s | 6300/499800s |
| 2026 | 7d | passive | A | delayed | 300s | 28810s | 72000s | 72010s | 86400s | 86410s | 86420s | 6300/499800s |

## Zielstatus

- Forschung startet in beiden Strategien und allen Seeds nach 300 aktiven Sekunden: Ziel 5–10 Minuten erreicht.
- Die erste Hardwareanalyse startet in diesem historischen Bericht in beiden Strategien und allen Seeds nach 900 aktiven Sekunden. Das aktuelle Ziel beträgt 14–30 aktive Minuten; zum Vertragswechsel und den neueren 870-s-Messungen siehe oben.
- Das Impulsrelais wird im 90-Minuten-Lauf nach 1.800 aktiven Sekunden fertig. Das Ziel 45–75 Minuten wird verfehlt: Analyseabschluss bei 1.500 s plus feste 300-s-Herstellung ergeben bereits 30 Minuten, und die vorhandenen echten Komponenten reichen zu diesem Zeitpunkt aus. Drop-Raten und Rezept wurden nicht verändert.
- Normales und bis zum fertigen Einstiegsitem verschobenes Prestige werden getrennt gezeigt. Das normale Entscheidungsverhalten wurde nicht automatisiert geändert.

## Impulsrelais

- Rezept: 12 Schaltkreise, 2 Kupferspulen, keine Data, Fragmente oder Zwischenprodukte; 300 Sekunden echte Werkbankzeit.
- Bauplan wird ausschließlich beim Abschluss der ersten Hardwareanalyse dauerhaft gesetzt. Item, Komponenten und Freischaltung überleben Prestige.
- Nur ausgerüstet: jeder zehnte vergütete Tap addiert per ScientificNumber zwei Sekunden der aktuellen passiven Creditproduktion. Der persistente Zähler gehört zur Iteminstanz; der Bonus erzeugt weder Tap noch Combo und skaliert nicht mit Seltenheit.
- Für das neue Item existierte keine fachlich eindeutige Atlaszelle. Deshalb verwendet die UI eine eigene CSS-Relaisgrafik statt einer falschen Sprite-Zuordnung.

Die JSON-Datei enthält für alle 90-Minuten-Läufe die echte Entscheidungstimeline und Abschlussereignisse.
