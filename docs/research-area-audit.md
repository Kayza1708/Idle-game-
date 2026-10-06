# Auftrag 7C – schrittweise permanente Forschung

## Ausgangsstand und Ursache

AGENTS.md gelesen; Repository ausschließlich Kayza1708/Idle-game-, sauberer Ausgangsarbeitsbaum, origin HTTPS geprüft. PR #73 ist gemergt. Erfolgreich abgeglichenes Main `002aae8db44c37e6fbc63bb442d4da101c5bbf0b` enthält `6337b10256e0b6db96217e064e8430bc8085e252`. Eigener Branch `codex/permanent-research-areas`, Vorgängerbranch unverändert; keine offene PR-Abhängigkeit.

Vorher zeigte der Forschungsbereich alle 21 Projekte als Projektkarten. Es gab kein separates Feld für den gewünschten dauerhaften Bereichszugang. Zusätzlich zeigte die Browserprüfung eine Persistenzlücke: `node` fehlte in der Liste sofort gespeicherter Transaktionen. Neue Zugänge wären bis zum periodischen Save bei Reload verloren gegangen. Der reguläre Node-Kauf löst jetzt denselben unmittelbaren Savepfad wie andere bezahlte Aktionen aus.

## Freischaltmatrix

| Bereich | Erforderlicher vorhandener Node | IDs |
|---|---|---|
| Anfangsbereich | keiner; interne Voraussetzungen unverändert | dataGeneration, modelArchitecture, blueprints |
| Datenwissenschaft | dataArchive1 | syntheticData, dataFlywheel |
| Modell-/Systemarchitektur | computeNet1 | computeOptimization, userScaling, hardwareIntegration, commercialization, networkEffects, parallelArchitecture, hardwareCoDesign, recursiveLearning, tapAmplification, alignment |
| Material-/Bauplanforschung | analysis1 | materialAnalysis, blueprintAnalysis, dropProtocols |
| Laborautomation | labs1 | operations, labAutomation, autonomousScience |

Die reine Katalogprüfung vergleicht alle 21 registrierten IDs auf vollständige und eindeutige Zuordnung. Die Tests prüfen außerdem den unveränderten azyklischen Graph der projektinternen Voraussetzungen und die bestehenden unabhängigen Node-Wurzeln. Keine neue Forschung und keine Kosten-/Effektkalibrierung. Insbesondere Labs-Zugang ersetzt weder Slot-/Queue-Unlocks noch `blueprintAnalysis` als Voraussetzung für `labAutomation`.

## Zustands-, Reset- und Migrationsvertrag

`researchAreas` ist ein permanentes Accountfeld. Der echte `buyNode`-Erfolg bezahlt reguläre INT-Kosten, erhält alle bisherigen Effekte und fügt den zugehörigen Bereich einmal hinzu. Doppelklick/erneuter Kauf fügt keinen zusätzlichen Bereich oder Forschungsbonus hinzu. `researchAccess` ist der gemeinsame Verbraucher für tatsächlichen Start, Queue, Autostart, Vorschau und UI. Aktive Forschung behält ihre festen Kosten und Endzeiten.

Normaler Prestige behält Zugang und bisherige Nodewirkungen. Axiom-Reset behält Zugang, verliert aber weiterhin INT-Nodes und deren bisherige sonstige Wirkungen (z.B. den zweiten Laborslot/Queue). Nach erneutem regulären Kauf werden nur die normalen Nodewirkungen wieder aktiv. Das bestehende aktive Forschungs-/Queue-Resetverhalten bleibt unverändert.

Kein Saveversionswechsel: additives optionales Feld im bestehenden v41. Alle bekannten älteren Formate passieren weiterhin ihre bestehenden Migrationen und danach den gemeinsamen Zugangsmigrationspfad. Nur bei fehlendem historischen Feld werden Nodes, positive Stufen, abgeschlossene, aktive oder wartende Forschung ausgewertet. Nullstufen, Umsatz oder fremder Accountfortschritt sind keine Belege. Ein vorhandenes Feld wird validiert und nicht opportunistisch aus aktuellem Zustand erweitert. Unbekannte/doppelte IDs sind Importfehler. Gültige Bestände, Forschung und Zeitanker werden nicht verändert; fehlenden historischen Zugang nicht erfinden.

Bei aktiven Challenges werden Run und gespeichertes Hauptspiel getrennt migriert. Neue Runs kommen aus `newGame` mit leerem Zugangsfeld und übernehmen keine Hauptforschungsboni. Hauptzugang bleibt bei Abbruch/Rückkehr erhalten; Challenge-Nodekäufe bleiben blockiert.

## Oberfläche und frühe Wege

DE/EN zeigt den Anfangsbereich, offene permanente Bereiche und genau eine kompakte Vorschau. Reihenfolge der Vorschau: Datenwissenschaft → Architektur → Materialforschung → Automation, bereits offene Bereiche übersprungen. Die Vorschau nennt Nutzen, echten Node und öffnet seine bestehende Prestige-Detailansicht. Einmalige abgeschlossene Projekte liegen kompakt unter Abgeschlossen. Queueauswahl zeigt ausschließlich zugängliche Projekte. Alte Verweise auf noch gesperrte Forschung führen zum passenden Node statt ins Leere. Keine Betriebs-/Buildprofilbuttons.

Erste Hardwareanalyse verwendet den bestehenden unabhängigen Analyseslot. Offene Baupläne ist weiter Anfangsforschung. Der kurze Domaintest bezahlt Hardware, startet regulär Hardwareanalyse plus Offene Baupläne parallel, lässt beide regulär abschließen und reserviert danach das erste Impulsrelais-Rezept ohne zusätzliche Forschungsbereiche. Vorbereitete Data/Komponenten sind Testzustand, keine natürliche Progressions- oder Balancemessung. Keine zirkuläre Prestigevoraussetzung eingeführt.

Vorher: neuer Stand mit ausreichend Ressourcen sah 21 Projektkarten. Nachher: exakt 3; weitere Bereiche erscheinen erst nach regulärem Node-Kauf. Bei Axiom-Reset werden Nodes leer, das Feld mit vier gekauften Bereichen bleibt identisch, auch nach Save/Reload. Legacy-Job mit verlorenem Labs-Node öffnet nach Migration nur Automation und behält exakt dieselben Endzeiten.

## Tatsächliche kurze Prüfungen

Gezielte Suite: researchAreas, researchEconomy, sharedPreviews, prestigeTree, saveValidation, storage, challengeIsolation, challengeUi, prestigeTreeUi, durableStorage, existingMechanics und mobileFinalPass. Nach den ersten 133 bestandenen Tests wurden zwei zusätzliche Autostart-/isolierte Evidenztests ergänzt; zusätzlich 12 bestehende Mechanik-/Queue- und 11 mobile UI-Vertragstests bestanden. Finaler Umfang: 158 Tests in zwölf Dateien. Die alten Kosten-/Queuefixtures kaufen nun den erforderlichen Zugang regulär; bestehende Assertions für Preise, Großzahlen, Abbuchung und Dauer bleiben erhalten. Keine Tests deaktiviert oder Werte gelockert. Alle Testaufrufe mit `timeout 300`.

Typecheck, Production-Build und `git diff --check` bestanden; bestehender Vite-Hinweis auf Chunk über 500 kB, kein Buildfehler. Prüfungen werden auf dem finalen Commit wiederholt.

Browser: Chromium, 390×844 px, DE/EN. Reale App-Dispatcher-Aktionen: drei Anfangskarten, exakt eine Vorschau, vier Nodekäufe samt exaktem Node-Detailtitel, neue Reihenfolge, Reload und Hardwareanalyse. Keine Pageerrors, keine horizontale Überbreite, überprüfte Forschungs-/Previewbuttons mindestens 44 px. Reproduktion: `python scripts/browser-research-areas.py http://127.0.0.1:5177 docs/screenshots/research-areas` bei laufendem Vite. Ressourcen/INT vorbereitet, anschließend ausschließlich reguläre UI-Käufe. [Screenshots und Ergebnisprotokoll](screenshots/research-areas/results.json). Die anfängliche Fixture-Startup-Race wurde im Prüfskript durch Warten auf Appinitialisierung beseitigt; sie ist kein Economy-Fix.

## Grenzen und offen

Keine Gesamtsuite, FAST/DEEP oder Langzeitkampagne. `[skip ci]` verhindert den pauschalen CI-Gesamtlauf gemäß Nutzergrenze. Keine bestätigte Langzeitbalance. Hardwarepreise, Data-Produktion, Forschungszeiten/-kosten, Items, Drops, INT/Axiom-Formeln und Relay-/Archiv-Skalierung unverändert. Bekannte Schicht-3-Referenzabweichungen und Langzeitbalance bleiben separat offen. Bereits abgeschlossene historische Balanceberichte bleiben historische Berichte, keine Messung dieses Zugangssystems.
