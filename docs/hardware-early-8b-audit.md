# Auftrag 8B: Server und Farm als aufeinanderfolgende Sparphasen

Ausgangscommit 3db19c85e08d7f168ddfa23c9a652fa102e2f8c8, sauberer bestehender Branch `codex/credit-only-hardware-goals`. PR #75 war bei Auftragseingang bereits gemergt; auf ausdrücklichen Wunsch **derselbe Branch und bestehender PR**, kein neuer PR/Branch. Nachbesserungscommits sind deshalb nicht automatisch in main; keine erneute Integration oder Veröffentlichung ausgeführt.

## Unveränderter Spiel-/Messvertrag

Nur `BALANCE.hardware.server.baseCost` und `farm.baseCost` ändern sich. Calculator/SBC/PC/GPU/Rig 15 / 6.000 / 100.000 / 4 Mio. / 75 Mio.; Campus 1e14 und alle späteren Preise unverändert. Mengenwachstum, Compute, Meilensteine, Data, Training, Forschung und Prestige bleiben unverändert. Alle Preise strikt aufsteigend, alle Klassen Credit-only; keine Vorgänger-/Research-/INT-/Kalendersperre, keine Produktionsdrossel.

Dasselbe Skript, dieselben echten Helfer und dieselben Strategien wie 8A; einzig der Endzeitpunkt wird von 5.400 auf **10.800 Sekunden** erhöht. Frisch 50 Credits bei t=0, regulärer Erstkauf in t=0-Entscheidung, danach ein aktives Domain-Advance und ein regulärer Tap je Sekunde, Entscheidungen alle zehn Sekunden. Alternierendes bezahlbares Q/E-Training zuerst, Datenerzeugung höchstens Level 2 danach. A kauft maximal ein bezahlbares Exemplar mit höchstem tatsächlichen Preview-Creditgain/SCI-Cost; B verfolgt die höchste besessene Klasse zum nächsten 10/25/50-Meilenstein oder die billigere Folgetier-Basis. RNG 0,5; keine Grants/Claims/Items/Analysen/Offline-Vorlauf oder freiwilligen Prestiges. Reguläre Overclock-Effekte bleiben Bestandteil des Profils. Keine Spielzeiten-/Forschungsreferenzen angepasst.

Messkorrektur: 8A-Ratenlogs hatten `creditRateScientific` teilweise ohne `now` aufgerufen (Default t=0); aktive Overclocks konnten dadurch aus der **protokollierten Rate** fehlen. Ranking und Kaufgain nutzten bereits den tatsächlichen savedAt-Zeitpunkt. Jetzt verwenden Vorher-/Nachherrate und Checkpoints ebenfalls savedAt. Ausgangspreise und Runden 1/2 wurden mit identischen Preisen erneut gemessen; erste Käufe bleiben identisch. Keine zusätzliche Preisrunde. Alte 8A-Rohdaten bleiben als historische Messung erhalten; neue 8B-Raten sind maßgeblich für aktive Produktion.

## Drei Preisrunden, Ergebnisse in Min:Sek

| Stand | Serverkosten | Farmkosten | A Rig | A Server | A Farm | B Server | B Farm |
|---|---:|---:|---|---|---|---|---|
| 8A vorher | 79,9 Mio. | 80 Mio. | 52:50 | 52:30 | 52:10 | 39:30 | 39:50 |
| 1, vorgegebener Suchstart | 750 Mio. | 7,5 Mrd. | 52:10 | 65:00 | 66:50 | 55:20 | 68:50 |
| 2 | 15 Mrd. | 750 Mrd. | 52:10 | 116:30 | nicht bis 180:00 | 76:40 | nicht bis 180:00 |
| **3, final** | **15 Mrd.** | **120 Mrd.** | **52:10** | **116:30** | **171:40** | **76:40** | **140:10** |

Runde 1 zu früh für beide Strategien. Runde 2: hohe Serverkosten passen; Farm 750 Mrd. wird bis zum Messende nicht gekauft, A investiert stattdessen weiter in Server, B erreicht bei Server 10 etwa 482,5 Mrd. Guthaben zum Ende. Runde 3 hält den passenden Serverpreis und setzt Farm auf 120 Mrd.: oberhalb des späteren Einzelserverpreises, aber rechtzeitig innerhalb A-Fensters bezahlbar. Kein weiterer Suchlauf.

**Alle 8B-Ziele im gemessenen Profil erfüllt:** A Rig 45–75, Server 90–120, Farm 150–180 Minuten; B Server nicht vor 75, Farm nicht vor 120 Minuten. Beide kaufen Rig→Server→Farm, kein früher Farmkauf umgeht die Phase. SBC/PC/GPU-Zeiten unverändert (A 3:30 / 13:10 / 31:50; B 4:10 / 9:10 / 18:40). Keine verfehlten finalen Vorgaben; die verfehlten Runden bleiben dokumentiert. Kein Beweis für sämtliche Strategien oder menschliche Spielzeiten.

## Produktionssprünge und Meilensteine (final)

Aktuelle tatsächliche Credits/s am Kaufzeitpunkt inklusive aktiver Boni, wissenschaftlich im JSON:

| Strategie/Klasse | Vorher C/s | Nachher C/s | Zuwachs C/s |
|---|---:|---:|---:|
| A Rig | 1,387838e6 | 2,470581e6 | 1,082743e6 |
| A Server | 1,161695e8 | 1,767018e8 | 6,053222e7 |
| A Farm | 2,375101e9 | 4,144046e9 | 1,768945e9 |
| B Rig | 4,970117e4 | 3,508970e5 | 3,011958e5 |
| B Server | 1,346919e7 | 3,035628e7 | 1,688709e7 |
| B Farm | 4,306230e7 | 2,281635e8 | 1,851012e8 |

A vor Rig: Calculator 10/25/50, SBC 10/25/50, PC 10/25, GPU 10. Vor Server zusätzlich Calculator 100, GPU 25, Rig 10/25, PC 50. Vor Farm zusätzlich GPU 50, SBC 100 und Server 10. B vor Rig: Calculator 10/25, PC 10; vor Server zusätzlich Rig 10; vor Farm keine zusätzlichen Meilensteine. Vollständige Ereignisreihenfolge, Kosten, Raten und sämtliche Meilensteine vor jedem Klassenwechsel stehen in `events` der Rohdaten. B spart gezielter, A baut mehr ältere Hardware/Meilensteine; dadurch unterschiedliche Kaufzeitpunkte und Progression.

## Sparzeit ist nicht Abstand zwischen beliebigen Käufen

A hat **keine explizite Sparreservierung** für eine teurere Klasse; sie kauft weiter profitable bezahlbare Exemplare. Deshalb darf eine reine Sparphase ohne andere Ausgaben nicht erfunden werden. Gemeinsame messbare Definition: Zielfenster beginnt bei der ersten Einsekundenmessung nach Kauf der unmittelbar vorherigen Klasse und endet beim ersten Zielkauf. `unaffordableSeconds` zählt die Messsekunden mit echter SCI-Fehlmenge innerhalb dieses Fensters, `firstAffordableAt` den ersten tatsächlich bezahlbaren Zustand. Diese Fenster enthalten zwischenzeitliche Käufe/Training/Produktion und sind **keine** theoretische Kosten/Rate-ETA oder ununterbrochene ausschließliche Ansparung. B trifft zusätzlich seine bestehenden Milestone-vs-Folgekauf-Entscheidungen unverändert.

| Final | Zielfenster Start→Kauf | Dauer des Zielfensters | Sekunden mit Fehlmenge | Erstmals bezahlbar | Abstand zum letzten beliebigen Kauf |
|---|---|---|---:|---|---|
| A Server | 52:11→116:30 | 64:19 | 3.858 | 116:30 | 1:10 |
| A Farm | 116:31→171:40 | 55:09 | 3.308 | 171:40 | 1:00 |
| B Server | 37:11→76:40 | 39:29 | 2.368 | 76:40 | 27:10 |
| B Farm | 76:41→140:10 | 63:29 | 3.807 | 140:09 | 63:30 |

Zusätzlich direkt im unveränderten B-Entscheidungspfad gemessene **erste Auswahlwartephase**: Server als konkret gewähltes, noch unbezahlbares Ziel 49:40→76:40 = 27:00; Farm 76:50→140:10 = 63:20. `targetSelectionWaits` protokolliert diese Intervalle getrennt; weitere Farmintervalle nach dem ersten Kauf gehören zu Folgeexemplaren. Bei A ist diese Größe null, weil A keine unbezahlbaren Zielkäufe auswählt; eine echte explizite Ansparstrategie wird ihr nicht unterstellt. Die finale identische Preisprüfung zur Ergänzung dieser Beobachtung änderte keine Entscheidung und zählt zur kumulierten Laufzeit.

Ausgangs-A überspringt Rig/Server vor der Farm: kein reguläres Folgeziel-Zielfenster, daher null/„nicht beobachtbar“ statt erfundener Sparzeit. Bei nicht erreichten Käufen in Runde 2 ist Kauf/Dauer null; Fehlmengensekunden sind nur die beobachtete Teilphase bis 180 Minuten, keine extrapolierte Kaufzeit.

## Prestige nur beobachtet

| Stand | A ≥1 INT | A ≥3 INT | B ≥1 INT | B ≥3 INT |
|---|---|---|---|---|
| Vorher | 56:21 | 64:33 | 44:51 | 54:32 |
| Runde 1 | 69:12 | 76:44 | 79:59 | 100:43 |
| Runde 2 | 117:40 | 173:08 | 150:43 | nicht bis 180:00 |
| Final | 117:40 | 172:27 | 158:37 | nicht bis 180:00 |

Genuine `newINTScientific` jeden Spielsekundenzeitpunkt nach Advance/Tap, ohne Reset; 3 INT bei finalem B bleibt im begrenzten Zeitraum unbekannt, keine extrapolierte Behauptung.

## Laufzeit, Reproduktion, Abnahme

Genau drei verschiedene Preisrunden plus Ausgangsmessung; zusätzliche identische Wiederholungen zur Korrektur der Ratenprotokollierung und Erfassung getrennt gewählter Sparziele. **92,82 Sekunden kumulierte Rechenlaufzeit einschließlich Wiederholungen**, unter fünf Minuten. Jede Prozessinvokation mit 60-s-Limit; interne SCI-Messschleife prüft das kumulierte 300-s-Budget je Sekunde. [Budgetprotokoll](hardware-early-8b/runtime-budget.json), [Vorher](hardware-early-8b/before.json), [Runde 1](hardware-early-8b/round-1.json), [Runde 2](hardware-early-8b/round-2.json), [Final](hardware-early-8b/after.json). `priceRoundsUsed` ist der verbrauchte Budget-Rundenzähler zum jeweiligen Messzeitpunkt, nicht die Dateinummer; Rohdaten enthalten die vollständigen tatsächlichen Preise.

Node 22, installiertes Repo: `npx vite-node --script scripts/hardware-early-calibration.ts output.json` misst aktuelle Preise. Zweites Argument optional JSON nur mit server/farm-baseCost. Höchstens drei neue Preisrunden pro Budgetlauf; `--remeasure` erlaubt nur die exakt bereits in der Ausgabedatei gespeicherten zwei Preise. Neue 8B-Budgetdatei im ignorierten node_modules/.cache, 8A-Budget unberührt. Kein unabhängiges Kaufmodell.

ScientificNumber bleibt ca. 15–16 signifikante Dezimalstellen / Floating Point. Keine beliebig genaue Dezimalarithmetik. SCI-Ledger, Kauf-/Bulk-/Previewkosten und Ranking verwenden echte zentrale Helfer. Keine fachfremden Forschungsassertions verändert. Keine Gesamtsuite/FAST/DEEP/Tages-/Monatskampagne. Langzeitbalance, Schicht-3-Referenzabweichungen und Relay-/Archiv-Skalierung bleiben separat offen. Ein erfülltes deterministisches Early-Game-Fenster bestätigt keine Langzeitbalance.

Technische Abnahme: **4 Dateien / 81 gezielte Tests bestanden**, 1,87 s (hardware8b, hardwareCreditOnly, sharedPreviews, scientificNumber); Typecheck und Production-Build bestanden, Build 1,39 s mit bekannter Hauptchunkwarnung 653,37 kB. `git diff --check` sauber. Gesamtsuite/FAST/DEEP/Tages-/Monatsläufe nicht ausgeführt; Commit `[skip ci]` verhindert pauschale CI-Langzeitläufe.
