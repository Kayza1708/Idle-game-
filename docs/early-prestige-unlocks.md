# Frühe Prestige-Unlocks – Messung

Fester Start 2026-01-01, 90 Minuten aktiv, ein Tap/s, Entscheidungen alle zehn Sekunden, Seeds 1708/42/2026. Alle Varianten prestigieren normal bei 2.700 s mit 3 INT; danach wird entweder kein Knoten oder genau der genannte Einstiegsknoten gekauft.

| Variante | Rechner 10 | SBC 10 | Rechner 25 | SBC 25 | PC 10 | Hardwarekäufe nach Prestige | Trainingsabschlüsse gesamt | Komponenten gesamt |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A kein Knoten | 170 s | 230 s | 450 s | 750 s | 770 s | 195 | 23 | 415 |
| B `shoppingAgent`, beide an, 25 % | 40 s | 50 s | 110 s | 120 s | 220 s | 348 | 26 | 433 |
| C `trainingPlan`, Q/E wiederkehrend | 170 s | 230 s | 450 s | 750 s | 770 s | 195 | 23 | 415 |
| D `componentScanner`, Schaltkreise | 170 s | 230 s | 450 s | 750 s | 770 s | 195 | 23 | 415 |

Die Zeiten und Summen sind in allen drei Seeds identisch. Alle Profile haben 540 manuelle Entscheidungszeitpunkte; B ergänzt 153 automatische Einzelkäufe und ersetzt keine manuellen Strategieentscheidungen. C erhöht in diesem Horizont den Durchsatz nicht, weil die bestehende Strategie Training bereits ohne Leerlauf startet; der Knoten reduziert Bedienaufwand, vergibt aber weder Data noch Tempo. D hält neun passive Fundwürfe und die Gesamtfundzahl unverändert. Die Zielgewichtung verändert nur die Verteilung: gegenüber A besitzt D am Ende bei Seed 42 drei und bei Seed 2026 eine zusätzliche Schaltkreis-Komponente; Seed 1708 rollt trotz erhöhter Chance dieselbe Verteilung. Analysen und Weltdrops sind unverändert.
