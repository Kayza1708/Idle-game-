# Audit: Run-Start und Auto-Prestige (6. Oktober 2026)

## Ausgangsstand und Ursache

Repository `/workspace/Idle-game-`, Remote `Kayza1708/Idle-game-`, sauberer Arbeitsbaum. `AGENTS.md` gelesen. `origin/main` erfolgreich abgerufen: `484b5cb57cd9133f298dfa9046264862b5841562`. Enthalten sind ScientificNumber-/Kaufreparatur `47d706d` (PR #64) und atomare Zutaten-/Savevalidierung `d9c8bb3` (PR #65, am 6. Oktober 2026 um 13:20:21 UTC gemergt). Keine parallele Arbeit von Auftrag 2, keine offene PR-Abhängigkeit. Eigener Branch `codex/run-start-auto-prestige` ab diesem Main-Stand.

Neue Spielstände, normale Prestiges und Axiom-Resets initialisierten beide Credit-Anzeigen auf null und entfernten sämtliche Hardware. Der Prestige-Agent prüfte INT, Laufzeit und wartende Arbeiten, aber keinen wirksamen automatischen Neustart. Der vorhandene Einkaufsagent konnte ohne Credits nichts kaufen. Außerdem konnte eine hohe prozentuale Reserve selbst bei Startkapital den ersten Kauf verhindern.

## Reparaturvertrag

- Ein zentraler `runStartContract` mit `BALANCE.runStartCredits = 50` setzt durch `initializeRun` native Credits und kanonisches Ledger auf `50`/`{m:5,e:1}` und alle Hardwarebestände auf null. Neue Spielstände und beide tatsächlichen Resettransaktionen verwenden ihn, ebenso die Vorschauen.
- Das Startkapital wird direkt gesetzt, nicht als Einnahme oder Reward gebucht. Produktions-/Umsatz-/INT-Zähler, Quests und Einnahmetelemetrie erhalten keinen Zuschlag. Bestehende gültige Saves mit beispielsweise 0, 7, 12,589, 35 oder 1234 Credits behalten ihren Wert; Reload, Rückkehr und Offline-Simulation vergeben kein Startkapital.
- Der existierende Einkaufsagent kauft den ersten Taschenrechner im regulären Zehn-Sekunden-Intervall über `buyHardwareClass`, zum vollständigen ScientificNumber-Preis. Nur bei null Hardware ignoriert dieser erste Taschenrechnerkauf die prozentuale Reserve. Der nächste Kauf verwendet sofort wieder die normale Reserve. Andere Hardwareklassen und die absolute Legacy-Reserve werden nicht ausgenommen.
- `automaticRestartAvailable` verwendet die vorhandene effektive Einkaufsagent-Freischaltung und den aktivierten Taschenrechner-Autobuyer. Verlorene INT-Knoten nach Axiom-Reset werden nicht durch gespeicherte Schalter ersetzt; bereits vorhandene permanente Freischaltungen bleiben über dieselbe effektive Abfrage wirksam.
- Auto-Prestige prüft diesen Neustartweg, den aktuellen wissenschaftlichen Mindestanspruch, den normalen Ein-INT-Mindestanspruch, Mindestlaufzeit und die unabhängigen Training-/Analyse-Warteoptionen. Die Transaktion bleibt ausschließlich `prestige`, höchstens einmal pro Prüfzeitpunkt. Run-Timer/-Zähler und Einkaufstimer beginnen beim Reset neu. Der nächste Hardwarekauf erfolgt erst bei einem späteren zeitlichen Einkaufstermin.
- Neue Spielstände behalten Auto-Prestige ausgeschaltet; vorhandene Einstellungen werden erhalten. Kein automatischer Axiom-Reset, kein Sofortkauf im Reset, kein Produktionsbonus. Online und Offline benutzen denselben vorhandenen Simulationsablauf einschließlich Zeitlimit und Iterationsschutz.
- Deutsche und englische Vorschauen zeigen den tatsächlichen Startvertrag. Der Agent zeigt konkrete Sperrgründe sowie den Neustartstatus, insbesondere „Automatischer Neustart benötigt einen aktivierten Einkaufsagenten“.

Keine Änderungen an Preisen, Produktionskurven, Prestige-/Axiomformeln, Rezepten, Drops, Saveversion 40 oder sonstigen Resetregeln. Challenge-Isolation und neue Features gehören nicht zu diesem Auftrag.

## Vorher/Nachher mit echten Domainfunktionen

Reproduktionsfolge: `newGame(0)` → `addCreditsScientific(..., ScientificNumber.from(BALANCE.prestigeBaseRevenue * 9))` als vorbereitete berechtigte Einnahmen → wirksamer INT-Einkaufsagent, Taschenrechner-Autobuyer an, 75-%-Reserve, Axiom-Automation und Prestige-Agent an, Mindestlaufzeit 15 Minuten; Prüfzeitpunkt bei 900000 ms. Dann `runPrestigeAgent`, anschließend `advance(reset, 60, false, () => .5)`.

| Ergebnis | Main `484b5cb` | Reparatur |
|---|---:|---:|
| Agent vor Reset | ready | ready |
| Credits direkt nach Reset | 0 | 50 |
| Wissenschaftliches Ledger | `{m:0,e:0}` | `{m:5,e:1}` |
| Hardware direkt nach Reset | 0 | 0 |
| Credits nach 60 Sekunden | 0 | ca. 233,8528884574 |
| Hardware nach 60 Sekunden | 0 | 5 |
| Manueller Prestige: Startcredits | 0 | 50 |

Ohne wirksamen oder bei deaktiviertem Taschenrechner-Einkaufsagenten wird Auto-Prestige jetzt vollständig abgewiesen. Manuelles Prestige bleibt möglich. Nach zehn Sekunden hat der echte erste Einkauf 15 Credits bezahlt: 50 → 35 Credits, Hardware 0 → 1; die nächsten zehn Sekunden ohne hohe permanente Forschungsboni reichen bei 75-%-Reserve nicht für den zweiten Kauf.

## Reproduzierbarer automatischer Folgezyklus

`npm test -- src/runStart.test.ts` führt den gesamten Verlauf über echte Domain-/Simulationsfunktionen aus. Der Integrationstest bereitet einen legal erreichbaren Account aus früheren Runs vor: Die historische Vorbereitung verbucht über `addCreditsScientific` berechtigten Umsatz von `prestigeBaseRevenue × (9 × axiomThresholdScientific())²`; `prestige` erzeugt daraus 9 × Axiom-Schwelle tatsächliche Zyklus-INT, und `axiomReset` ergibt drei Axiome; Axiom-Automation wird regulär für die unveränderten zwei Axiome gekauft; ein Axiom bleibt verfügbar. Ein anschließender normaler Prestige mit vier verdienten INT finanziert den Einkaufsagent-Knoten für ein INT. Dauerhaft abgeschlossene Forschungen Datenerzeugung I, Modellarchitektur I und Kommerzialisierung 250 bleiben erhalten. Kommerzialisierung besitzt keinen Level-Cap; Kosten und Laufzeiten dieser vorhandenen Forschung sind wissenschaftlich darstellbar. Diese umfangreiche vorbereitete Forschung beschleunigt nur den Test; Produktionsformeln sind unverändert.

Ab Beginn des gemessenen Verlaufs: 50 Credits, null Hardware, nur Taschenrechner-Autobuyer an, 75-%-Reserve, Prestige-Agent an, Mindestanspruch ein INT, Mindestlaufzeit 15 Minuten. Keine Taps, Debug-Grants, laufenden Forschungen, Ressourcenvergaben, vorgekaufte Hardware oder weiteren manuellen Aktionen. RNG konstant `.5`.

| Simulationszeit | Credits | Hardware | Normaler Prestige-Zähler | Aktion |
|---|---:|---:|---:|---|
| 0 s | 50 | 0 | 2 | vorbereiteter Start |
| 10 s | 35 | 1 | 2 | erster regulär bezahlter Taschenrechner |
| 900 s | 50 | 0 | 3 | erster automatischer Prestige; ca. 1,247388e21 Run-Produktion, 53090 INT |
| 910 s | 35 | 1 | 3 | erneut regulär bezahlter Taschenrechner |
| 1800 s | 50 | 0 | 4 | zweiter automatischer Prestige; ca. 4,940263e21 Run-Produktion, ca. 65158 INT |

Tap-Zähler bleibt null, Axiom-Reset-Zähler bleibt auf dem vorbereiteten Wert eins. Online und Offline erhalten identische wissenschaftliche Ledger, Hardwarebestände, Prestigeentscheidungen und -historien. Ein Save/Reload bei 900 Sekunden verändert den zweiten Zyklus nicht. Große Zeitsprünge werden auf die vorhandene Offline-Kapazität begrenzt; Mindestlaufzeit und ein Reset pro Prüfzeitpunkt begrenzen die Resetanzahl.

ScientificNumber bleibt die in Auftrag 1 dokumentierte binäre Gleitkommadarstellung mit ungefähr 15–16 signifikanten Dezimalstellen, keine beliebig exakte Dezimalarithmetik. Tests prüfen kanonische wissenschaftliche Werte und native Projektionen innerhalb dieses Vertrags; Kaufentscheidungen verwenden wissenschaftliche Kosten.

## Geänderte Dateien

- Domain/Simulation: `src/economy.ts`, `src/prestige.ts`, `src/simulation.ts`.
- Oberfläche/Texte: `src/Panels.tsx`, `src/prestigeText.ts` (neu).
- Neue Regressionen: `src/runStart.test.ts`.
- Angepasste bestehende Fixtures/Startvertragsprüfungen: `src/axiom.test.ts`, `src/axiomUpgrades.test.ts`, `src/crashDiagnostics.test.ts`, `src/economy.test.ts`, `src/longTermInt.test.ts`, `src/onboarding.test.ts`, `src/prestigePreview.test.ts`, `src/prestigeTree.test.ts`, `src/purchaseMath.test.ts`, `src/training.test.ts`, `src/tutorialGuide.test.ts`.
- Dokumentation: `docs/economy.md`, `docs/ROADMAP.md`, `docs/NEXT_STEPS.md`, dieses Audit (neu).

## Prüfungen und offene Abnahme

Node 22.23.3/npm 10.9.9, unveränderte Manifeste, Lockfile und Testkonfiguration.

- Typecheck bestanden.
- 335 betroffene Tests in 17 Dateien bestanden, einschließlich 29 neuer Run-Start-/Auto-Prestige-Regressionen und der vollständigen Zahlen-, Kauf-, Reservierungs- und Save-Regressionsprüfungen aus Auftrag 1/2.
- Bestehende Kauf-Testfixtures besitzen weiterhin genau ihren angegebenen Testbetrag; Startkapital wird nicht versehentlich zusätzlich zu einem 12,589-/15-/MAX-Grenzbetrag gebucht. Exakte Preis-/MAX-/Debit-Assertions bleiben erhalten. Bestehende Reset-/Training-/Backup-/Rewardtests berücksichtigen den ausdrücklich geänderten Startvertrag oder prüfen den unveränderten tatsächlichen Ressourcendelta. Tutorial-Reihenfolge wird sowohl für einen gespeicherten Nullbestand als auch für den neuen 50-Credit-Start geprüft.
- Production-Build bestanden; bestehende Warnung über einen JavaScript-Chunk über 500 kB.
- Vor Änderungen erneut auf `484b5cb` ausgeführt: `clock.test.ts` mit denselben drei Fehlern („1000 > 1000“ nach Prestige ohne Hardware) und `mobileMetaPolish.test.ts`/`prestigeSeasonMobile.test.ts` mit denselben Vite-SSR-Ladefehlern bei `import.meta.url`, dort keine Assertions ausgeführt. Diese Clock-Tests erhalten keine kostenlose Hardware oder künstliche Produktion.
- Der vollständige Abschlusslauf von Auftrag 2 hat auf dem tatsächlichen Ausgangscode 630 Tests bestanden, dieselben drei Clock-Fehler, zwei Vite-Ladefehler und `[vitest-worker]: Timeout calling "onTaskUpdate"` nachgewiesen. Ein Git-Archiv des jetzt verwendeten Main-Ausgangsstands `484b5cb` stimmt für sämtliche TypeScript-/TSX-Quellen mit dessen vor/nach dem vollständigen Lauf erfassten Prüfsummen überein; Main enthält gegenüber `d9c8bb3` nur den Merge-Commit. Der bestehende RPC-Fehler wird daher anhand dieses vollständigen nachgewiesenen Ausgangslaufs eingeordnet, nicht vermutet.
- Zwei neue Kalibrierungsfehler: `layerThreeSimulation.test.ts`, beide Strategien. Separat über unverändertes Git-Archiv des Ausgangsstands nachgewiesen: erste Forschung 310 s, erste Analyse 890 s, Forschungsgrenze 313, Analysegrenze 59132. Das vorgeschriebene Startkapital ermöglicht jetzt die erste Analyse bei 870 s, unter der unveränderten Test-Untergrenze 880 s. Die Kalibrierungstests bleiben unverändert; keine Assertions abgeschwächt, keine Balancewerte gegengeregelt. Diese Fehler sind Auswirkungen des neuen Startvertrags und werden ausdrücklich nicht als bestehend bezeichnet.
- Browser-App mit Chromium bei 390 × 844: deutsche und englische Startvorschauen sowie Neustart-Sperrgrund sichtbar; keine `pageerror`-Ereignisse. Wechsel zur Axiomansicht per Tastatur. Die beiden ersten Pointer-Smokes liefen in einen Timeout: der Axiom-Reiter liegt bei y=803 unter der festen unteren Navigation. Separater Nachweis mit der originalen Prestige-Komponente aus dem Git-Archiv `484b5cb`, derselben unveränderten CSS-Datei und der fünfteiligen unteren Navigation reproduziert dieselbe Überdeckung (`elementFromPoint` liefert `tab-prestige`). Diese vorhandene Layoutabweichung bleibt als gesonderter UI-Folgepunkt offen; keine vollständige Touch-Abnahme behauptet.
- `git diff --check`: bestanden.
- Vollständige Suite auf unveränderten Produktionsquellen: `npm test`, Exitcode 1, 1524,70 Sekunden. 58 Dateien: 54 bestanden, vier fehlgeschlagen. 658 Tests bestanden, fünf Assertions fehlgeschlagen: die drei belegten Clock-Assertions und die zwei neuen Analyse-Kalibrierungsgrenzen. Zwei bekannte Vite-Ladefehler ohne ausgeführte Assertions sowie derselbe `onTaskUpdate`-RPC-Timeout wie auf dem Ausgangscode. Langzeitsimulation technisch bestanden (1421,154 Sekunden); optionale Balancebewertung `Overall: FAIL`. Der Lauf wurde nicht abgebrochen; alle Quellenprüfsummen vor/nach dem Lauf sind identisch.
- Nach diesem vollständigen Lauf wurde ausschließlich die historische Vorbereitung der Integrationstest-Fixture verstärkt: historische INT samt Umsatz-Ledger entstehen jetzt über die echten Einnahme-/Prestige-Transaktionen; zusätzliche Assertions prüfen historischen Umsatz und die regulären Axiomkosten. Die identischen zwei Folgezyklen wurden separat reproduziert. Produktionscode bleibt unverändert; Typecheck und alle 335 betroffenen Tests bestanden auf der präzisierten Fixture erneut (17 Dateien, 23,43 Sekunden). Die vollständige Suite wurde nach dieser reinen Fixture-Verstärkung nicht ein zweites Mal ausgeführt.
- Keine erforderliche Prüfung war durch Umgebung oder Zugriff blockiert. Eine grüne Gesamtabnahme bleibt wegen der dokumentierten Fehler offen.

Keine Tests deaktiviert. Kein Merge und keine Veröffentlichung.
