# INT-Anspruchskurve – Kalibrierung 2026-10-01

## Kurve und Parametersuche

Das kumulative Modell bleibt unverändert:

`Gesamtanspruch = floor(3 × log10(1 + berechtigter Umsatz / Schwelle)^1,5)`

`beanspruchbare INT = Gesamtanspruch − bereits beanspruchter Anspruch`

Nur `BALANCE.prestigeThreshold` wurde von **1.400.000.000** auf **428.273.652.944** erhöht. `prestigeScale = 3`, `prestigePower = 1,5`, Logarithmusbasis 10 und der dauerhafte Bonus `1 + 0,1 × totalINTEarned` bleiben unverändert. Eine ganzzahlige binäre Suche mit der echten 90-Minuten-Simulation ergab: 428.273.652.943 führt zum normalen Entscheid bei 2.690 s; 428.273.652.944 ist der kleinste Schwellenwert mit 2.700 s und liegt damit im Zielfenster 45–75 Minuten. Die Messregel ist nur eine Simulatorentscheidung und keine UI-Sperre.

## Vorher/Nachher

| Kurve | Erste INT verfügbar | Normaler Entscheid | INT beim Entscheid |
|---|---:|---:|---:|
| vorher, Schwelle 1.400.000.000 | 765 s (12:45) | 1.050 s (17:30) | 3 |
| nachher, Schwelle 428.273.652.944 | 2.115 s (35:15) | 2.700 s (45:00) | 3 |

## 90-Minuten-Lauf

Seeds 1708, 42 und 2026 liefern dieselben INT-Werte. Der Vergleich ohne Prestige zeigt den kumulativen Gesamtanspruch; der normale Lauf beansprucht bei Minute 45 drei INT.

| Minute | Ohne Prestige: Gesamt/verfügbar | Normal: Gesamtanspruch/verfügbar | Dauerhaft verdient |
|---:|---:|---:|---:|
| 15 | 0 / 0 | 0 / 0 | 0 |
| 30 | 0 / 0 | 0 / 0 | 0 |
| 45 | 3 / 3 | 3 / 0 | 3 |
| 60 | 6 / 6 | 3 / 0 | 3 |
| 75 | 10 / 10 | 3 / 0 | 3 |
| 90 | 13 / 13 | 5 / 2 | 3 |

Prestige bleibt bereits ab der ersten beanspruchbaren INT bei 35:15 möglich. Der normale Messentscheid wartet ausschließlich, bis der Bonusquotient mindestens 1,25 beträgt; bei drei INT ist er `1,3 / 1,0 = 1,30`.

## Zweiter Run

Nach dem normalen Prestige bei 2.700 s kehren die frühen Meilensteine in allen drei Seeds wie folgt zurück:

| Meilenstein | Erster Run | Zweiter Run nach Reset | Differenz |
|---|---:|---:|---:|
| Taschenrechner 10 | 170 s | 170 s | 0 s |
| SBC 10 | 240 s | 230 s | −10 s |
| Taschenrechner 25 | 450 s | 450 s | 0 s |
| SBC 25 | 780 s | 750 s | −30 s |
| PC 10 | 800 s | 770 s | −30 s |

Der nächste normale Prestigeentscheid fällt bei 5.820 s Wandzeit, also **3.120 s beziehungsweise 52 Minuten nach dem ersten Reset**. Seed 1708 und 2026 erreichen den dritten Entscheid bei 9.300 s, Seed 42 bei 9.290 s. Der zweite Run ist bei einzelnen frühen Meilensteinen nur 10–30 Sekunden schneller und damit noch nicht deutlich spürbar; dies bleibt Grundlage für den folgenden Unlock-Auftrag. Es wurden keine anderen Systeme verändert.

## Warum das Impulsrelais weiterhin exakt nach 30 Minuten fertig ist

Bei allen Seeds startet die kurze Hardwareanalyse bei 900 s und endet nach ihrer festen Laufzeit bei 1.500 s. Ihr Abschluss schaltet den Bauplan frei. Bis dahin erzeugen die regulären Taps 33 echte World-Drops mit insgesamt 71 Komponenten; die passive Hardwarequelle liefert zwei Schaltkreise und die Analyse einen weiteren Schaltkreis. Vor Reservierung besitzt jeder Seed deutlich mehr als die benötigten 12 Schaltkreise und 2 Kupferspulen (nach Reservierung verbleiben je nach Seed 47–62 Schaltkreise und 13–22 Kupferspulen). Deshalb beginnt die unveränderte 300-Sekunden-Herstellung sofort bei 1.500 s und endet deterministisch bei 1.800 s. Das frühere Itemziel 45–75 Minuten bleibt verfehlt; Rezept, Quellen, Drops und Herstellungsdauer wurden nicht geändert.
