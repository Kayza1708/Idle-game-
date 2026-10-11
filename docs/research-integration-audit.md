# Auftrag 2 – vollständiger Forschungsvertrag, 11. Oktober 2026

Basis: frisch geholtes `origin/main` **99c10ee**, mit gemergtem PR #81 und #80. Eigener Branch `codex/research-integration`; Vorgängerbranches unverändert, kein Merge. Die nachfolgende Abnahme ist technisch; vorbereitete Bestände und Forschungslevel belegen keine natürlichen Freischaltzeiten oder Monatsbalance.

## Bestand und echte Verbraucher

Die 18 wiederholbaren Grundlagen und drei bisherigen Schlüsselprojekte bleiben erhalten; fünf vorgegebene Schlüsselprojekte kommen hinzu. Der zentrale Katalog hat genau 26 IDs in genau fünf Themen. Anfangs sind nur `dataGeneration`, `modelArchitecture`, `blueprints` zugänglich. Auch diese drei gehören ihren Themen an. Alle bisherigen fachlichen Voraussetzungen bleiben zusätzlich zu den Projektzugängen bestehen.

| Thema | Projekt | regulärer Zugang | tatsächlicher Verbraucher |
|---|---|---|---|
| Datenwissenschaft | dataGeneration | Anfang | dataBonusTerms / dataSynergyPower |
| Datenwissenschaft | syntheticData | dataArchive1 | dataBonusTerms |
| Datenwissenschaft | dataFlywheel | dataArchive2 | dataSynergyScientific / averageDataSynergy |
| Datenwissenschaft | dataPipeline | dataArchive4; dataFlywheel 5 | analysisAffordability → bezahlter Analyse-Start |
| Systemarchitektur | computeOptimization | computeNet1 | computeFactors |
| Systemarchitektur | userScaling | computeNet1 | usersFactors |
| Systemarchitektur | hardwareIntegration | computeNet2 | computeFactors / infrastructureSynergyBase |
| Systemarchitektur | parallelArchitecture | computeNet2 | computeFactors |
| Systemarchitektur | hardwareCoDesign | computeNet4 | computeFactors |
| Systemarchitektur | distributedInference | computeNet4; parallelArchitecture 5 | classComputeTerms, bestehender Nachbarklassen-Link |
| Modellwissenschaft | modelArchitecture | Anfang | creditFactors / modelSynergyScientific |
| Modellwissenschaft | commercialization | computeNet1 | creditFactors |
| Modellwissenschaft | alignment | computeNet1 | trainingDurationQuote, zukünftige Grunddauer ×0,90 |
| Modellwissenschaft | networkEffects | computeNet2 | creditFactors |
| Modellwissenschaft | recursiveLearning | computeNet2 | modelSynergyScientific |
| Modellwissenschaft | tapAmplification | computeNet4 | tapCreditsScientific |
| Modellwissenschaft | modelTransfer | computeNet4; recursiveLearning 5 | trainingDurationQuote / startTraining, erste sechs erfolgreiche Run-Starts ×0,50 |
| Materialwissenschaft | blueprints | Anfang | Bauplanlernen / Modulrezepte |
| Materialwissenschaft | materialAnalysis | analysis1 | completeExperiment, garantierte Komponenten |
| Materialwissenschaft | blueprintAnalysis | analysis2 | completeExperiment, Bauplanfragmente |
| Materialwissenschaft | dropProtocols | analysis2 | tapDropMultiplier, vorhandene Signal-Drops |
| Materialwissenschaft | materialRecycling | analysis4; materialAnalysis 5 + blueprintAnalysis 5 | settleCrafting, Komponenten pro reserviertem Exemplar |
| Labororganisation | operations | labs1 | researchQueueCapacity, zwei → vier wartende Aufträge nach labs2 |
| Labororganisation | labAutomation | labs1 | experimentSpeed, bisheriger Analysebonus |
| Labororganisation | autonomousScience | labs2 | researchPerformanceQuote, +0,02 B je Level |
| Labororganisation | researchScheduling | labs4; operations abgeschlossen + autonomousScience 5 | researchModifiers / Forschungsdirektor |

`researchAccess` steuert Domain, Oberfläche, Ziele, Queue, Wiederholung, Direktor und Export. Node-Käufe speichern genau ihre zugehörigen IDs. Resetpfade sichern auch direkten vorhandenen Node-Nachweis vor dem Entfernen der Nodes. Hauptspiel und Challenge bleiben getrennt.

## Preise, Leistung und gespeicherter Start

Kategorie-Basen bleiben identisch: Data 363/180 s; Analyse 100/600 s; Modell 250/1.800 s; Automation 600/3.600 s. Bestehende Projekt-Kategorien wurden nicht neu kalibriert. Grundlagen kosten wissenschaftlich `ceil(baseData × 1.85^(L−1))`, ohne Kostenobergrenze; Grunddauer `min(baseDuration × 1.35^(L−1), 72 h)`.

| Neues Schlüsselprojekt | einmalige Data | Grunddauer |
|---|---:|---:|
| dataPipeline | 937.622.687 | 86.400 s |
| distributedInference | 645.745.652 | 86.400 s |
| modelTransfer | 645.745.652 | 86.400 s |
| materialRecycling | 258.298.261 | 86.400 s |
| researchScheduling | 1.549.789.564 | 86.400 s |

Die Preise sind zentral `ceil(categoryBase × 1.85^24)`, ausdrücklich vorläufige Designparameter. Kein Credit-/Fragment-/Research-Points-Preis. Ganzzahliges Aufrunden des repräsentierten wissenschaftlichen Koeffizienten verwendet Decimal/BigInt statt einer nativen Großzahlprojektion. Ab 16 Dezimalstellen liegt eine zusätzliche Einheit unter der bestehenden Mantissenpräzision; diese Grenze wird nicht als wirtschaftlicher Clamp behandelt.

`researchPerformanceQuote` summiert nur angewendete Quellen: kompatible tatsächlich ausgerüstete Research-Effekte, kanonischer Manufacturing-Verstärker und Item-Synergiepotenz, bestehende Research-Kombination, Research-Hardwaremeilensteine einschließlich des bisherigen generischen Meilensteinbeitrags, Achievement-Research, Deep Labs und autonome Wissenschaft. Die Item-Synergiepotenz wird einmal auf die gesamte Itemsumme angewendet; die aufgeführten Itemquellen teilen den daraus tatsächlich resultierenden Beitrag proportional. No-Items entfernt Items und ihre Kombination aus B.

Laborfaktor `1 + ln(1+B)`; aktiver Laborbonus ×2 und Research-Overclock ×2; Dauer `max(60, Grunddauer / Laborfaktor / temporäre Faktoren)`. Keine alten Compute-, Data-Bestands-, Modell- oder Lifetime-Data-Potenzen. Research Points bleiben im Save/Export historisch erhalten, werden weder produziert noch ausgegeben und bewirken keinen rückwirkenden Fortschritt.

`researchQuote` liefert Kosten, Fehlmenge, Zugang, sämtliche Voraussetzungen, Quellen und Startdauer. `startResearchProject` zahlt einmal, vergibt eine stabile Auftrags-ID und speichert die Basis, Quellen, Faktoren, Mindestdauerstatus und feste Endzeit. Wechsel/Ablauf verändert laufende Aufträge nicht. Historische Aufträge ohne neue Quote behalten ihre gespeicherten Endzeiten. Neue Quote-Basen werden auf Quellen-/Faktor-/Dauer-/Kostenkonsistenz validiert. Timestamp-Prüfung toleriert 10 Mikrosekunden, da die Addition zu epochbasierten Binary64-Millisekunden kleinere Quantisierungsfehler erzeugt; keine Preis- oder Endzeitkorrektur.

## Automation und weitere Modifier

- labs2 startet die manuelle Queue regulär; keine labs3-Zusatzpflicht. Keine Vorauszahlung. Erledigte einmalige Projekte werden entfernt; noch ungültige Einträge werden übersprungen; der erste gültige unbezahlbare Eintrag blockiert nachfolgende und automatische Aufträge. Zugang, Voraussetzungen und Ziellevel werden beim tatsächlichen Start neu geprüft. Data-Erreichen erhält eine eigene Zeitgrenze: Aufträge starten nicht rückwirkend vor der Gutschrift.
- labs3 erlaubt ein ausdrücklich gewähltes Grundlagenprojekt mit endlichem Ziellevel. Kein vorausgewählter oder unendlicher Ausgabenauftrag.
- labs4 + researchScheduling erlaubt den Direktor: maximal sechs geordnete Ziele, zunächst aus/leere Liste/kein Budget. Budget und Reserve werden rein wissenschaftlich vor jedem bezahlten Start gegen den aktualisierten Zustand geprüft. Nur Direktorstarts belasten sein Run-Budget, niemals manuelle Starts oder Queue. Reihenfolge: Queue → Direktor → einfache Wiederholung. Ein effektiver eingeschalteter Direktor besitzt die automatische Entscheidung auch bei Budget-/Reservemangel. Prüfung im gemeinsamen Online-/Offlinepfad alle zehn Sekunden, höchstens ein erfolgreicher Direktorstart je freiem Labor. Keine Node-/Bauplan-/Reset-Automation.
- alignment und modelTransfer multiplizieren zukünftige Trainingsgrunddauer einmal, Rate bleibt 1; Kostenrabatt bleibt unverändert. Nur erfolgreicher Start erhöht `runTrainingStarted`, auch Queue/Autopilot.
- dataPipeline reduziert nur zukünftige Analyse-Data auf aufgerundete 80 %. Bestehende Basis, Dauer und Belohnungen bleiben erhalten. Laufende Analysen behalten ihre Abbuchung.
- distributedInference aktiviert den vorhandenen lokalen Link: 25 Vorgänger, maximal zehn Nachfolger, vorhandener computeNetworkBonus. Legacy-Link und Forschung sind ein gemeinsames ODER, ohne Doppelbonus oder Hardwarekaufsperre.
- materialRecycling vergibt bei Item-Abschluss 5 % der pro Exemplar tatsächlich reservierten Komponenten über `grantComponents`. Separater Bruchteil je Komponente. Keine Rückgabe von Modulen/Data/Fragmenten/Gems; kein Recycling bei Reservierung, Abbruch, Modulbau, Fusion oder Forge. Mengen/Reload verwenden den bestehenden Fortschritts- und Abschlusszähler.

Normaler Prestige erhält Forschung, Zugänge, laufende Endzeiten und zulässige Einstellungen/Queue; Transfer-Starts und Direktorausgaben beginnen bei null. Axiom entfernt normale Nodes und wartende Forschung, deaktiviert Wiederholung und macht den Direktor ohne labs4 effektiv inaktiv. Auswahl, Ziele, Budget und Reserve bleiben erhalten; kein kostenloser Node-Wiederaufbau. Laufende Forschung bleibt sichtbar, auch wenn ihr Laborzugang für neue Starts verloren wurde.

## Save und Schutzgrenzen

Save **44** migriert Hauptspiel und gespeichertes Challenge-Hauptspiel unabhängig. Bisherige breite Gebietszugänge werden nur für die bisherigen 21 IDs übernommen. Fehlende alte Gebietsfelder werden anhand früherer Nodes, positiver Stufen, Abschluss, laufendem Auftrag oder Queue belegt; Startprojekte allein belegen kein zusätzliches Gebiet. Neue Schlüsselprojekte erhalten keine pauschale Freigabe aus einem alten Gebiet: nur ein tatsächlich vorhandener passender Stufen-Node ist regulärer Zugangsnachweis. Unbelegbare frühere verlorene Nodes/Bonuskäufe werden nicht rekonstruiert.

Neue Run-Zähler und Recyclingreste beginnen bei null; Direktor und Wiederholung ohne alte Konfiguration beginnen ausgeschaltet. Inventar, historische Reservierungen, Analyse-/Archiv-Bruchteile und Research-Points-Bestand bleiben erhalten. Auch in Save 44 bleibt fehlender aktueller Bauplanbesitz ein Importfehler; Itemfunde werden nicht durch den Versionswechsel kostenlos zu Bauplänen. Unbekannte IDs, doppelte Zugänge/Queue/Jobs, ungültige Budgets, Ziellevel, Quellen und Reste werden verworfen; beschädigte Imports ersetzen keine gültigen Saves.

Hardware-/Nodepreise, Core-/Data-Produktion, INT-/Axiomformeln, Dropraten, Rezepte und Itemgrundeffekte sind gegen den gefetchten main-Katalog geprüft. Ausnahmen sind ausschließlich die bestellten Forschungsparameter und Beschreibungen. Zusätzlich wurde ein Mergeverlust aus #80 behoben: main enthielt die Kombinationen und Tests, aber der Compute-Faktor `parallel-architecture` und dessen Produktionszerlegung waren verschwunden. Ihre bestehenden ×1,20 wurden wieder angeschlossen, keine neue Kombinationsformel.

## Nachweis und Prüfungen

[Rohdaten vor/nachher](research-integration-proof.json) stammen aus getrennten Worktrees: unverändertes main 99c10ee und dieser Branch. [Skript](../scripts/research-proof.ts) bereitet Data/INT/Forschungslevel ausdrücklich vor, kauft Nodes regulär, verwendet Quote → bezahlten Domainstart → Serialize/Reload → `settleResearchCompletions` am gespeicherten Endzeitpunkt. Alle 26 Projekte, einschließlich aller fünf neuen, schließen genau einmal ab. Das direkte Platzieren der Testuhr am Endzeitpunkt ist keine Tageskampagne oder natürliche Erreichbarkeitsmessung.

Tatsächliche vorbereitete Vergleiche:

- bisheriges operations: 3.600 s; jetzt mit vorhandenen Deep Labs und autonomousScience 5: **2.769,00799 s**. Mit Research-Hardware, Achievements und beiden temporären Faktoren: vorher nur der Labbonus wirksam, **1.800 s**; jetzt **593,74072 s**, B = 0,675 und Laborfaktor = 1,515813165.
- Research-Points-Produktion derselben vorbereiteten Hardware-/Levelkonfiguration: **3,272722e6/s → 0**; alter Bestand bleibt erhalten.
- erstes Training: **90 → 40,5 s** mit alignment und modelTransfer; reguläre Data-Kosten und Rate 1 bleiben identisch.
- kurze Hardwareanalyse: **57.623 → 46.099 Data**, gespeicherte Abbuchung entspricht dem Quote.
- Nachbarlink: vorher 0; mit Schlüsselprojekt bei 25 Taschenrechnern und 20 SBCs **10 × 12 × 0,25 = 30** zusätzliche rohe SBC-Compute, nur einmal.
- fünf Photonenfelder reservieren unverändert 100 Schaltkreise, 40 Spulen, 60 Wafer, 30 Linsen, fünf Module und 6.000 Data. Vorher keine Rückgabe; danach **5/2/3/1 ganze Komponenten**, plus **0,5 Linsenrest**; exakt fünf Items. Keine Module/Data zurück.

Gezielte Befehle sind mit `timeout 300` begrenzt. Finale Auswahl: **256 Tests in 12 Dateien, 14,38 s**; die anschließend verschärfte Parameter-Schutzassertion wurde separat erneut geprüft; keine Gesamtsuite, FAST/DEEP oder Tages-/Monatskampagne wurde ausgeführt. Geprüft werden alle 26 Starts und alte Verbraucher, Quellen/No-Items, wissenschaftliche Kosten oberhalb 1e308, feste laufende Jobs, parallele Abbuchungen, Queue/Wiederholung/Budget/Reserve, erfolgreiche Trainingsstarts, Recycling/Mengen/Reload/Offline, beide Resets, Challenge-Isolation, Export und beschädigte Imports.

Browser: [sechs protokollierte Fälle](research-integration-browser.json), [reproduzierbares Skript](../scripts/browser-research.py), Chromium bei **360/390/430 px DE/EN**. Je drei Startkarten, kompakte fünf Gebietsstufen, fehlende Fachvoraussetzung, alle fünf neuen Schlüsselkarten mit Kosten/Dauer/Quellen, real bezahlter Anfangs- und Schlüsselprojektstart mit Reload. Direktor zunächst ohne Budget blockiert, dann über echte UI-Aktionen explizites Budget/Reserve/Ziel konfiguriert und regulärer automatischer Start nach zehn Sekunden bezahlt. Geprüfte neue Touchziele ≥44 px, intern scrollende Detail-Sheets, kein Zutaten-/Quotenbeschnitt, keine Seitenüberbreite, keine Browserfehler. Vorhandene generische Research-Grafik ist semantischer neutraler Fallback; keine zufällige Atlaszelle oder neues Artwork.

Typecheck, Production-Build und `git diff --check` bestanden. Der bekannte Bundlehinweis >500 kB bleibt bestehen. Branch-CI erhält Installation/Typecheck/Build und dieselbe kurze Testauswahl statt der Gesamtsuite; keine Langkampagnen.

## Offen

Keine bekannte Reproduktion eines offenen Fehlers im bestellten Vertrag nach den gezielten Prüfungen. Natürliche Erreichbarkeit, Spezialisierungswahl und Monatsbalance der vorgegebenen Schlüsselpreise sind **nicht bestätigt**. Vorhandene Binary64-Mantissengrenzen, der bekannte Vite-Bundlehinweis >500 kB und reale Safari-/Native-Abnahme bleiben offen. Keine neue Hardware-/Ressourcenquelle oder Gratifizierung wurde eingebaut.

### Tatsächlich ausgeführte Schlussbefehle

```sh
timeout 300 npm test -- src/researchIntegration.test.ts src/researchEconomy.test.ts src/researchAreas.test.tsx src/trainingCosts.test.ts src/analysis.test.ts src/atomicCrafting.test.ts src/itemCombinations.test.tsx src/challengeIsolation.test.ts src/saveValidation.test.ts src/clock.test.ts src/balanceExportContracts.test.ts src/blueprints.test.ts
timeout 300 npm test -- src/itemCombinations.test.tsx
npm run typecheck
npm run build
git diff --check
timeout 300 ./node_modules/.bin/vite-node --script scripts/research-proof.ts /workspace/work/research/proof-after.json
timeout 300 python scripts/browser-research.py http://127.0.0.1:5181 /workspace/work/research/browser-final.json
```

Der unveränderte main-Vergleich lief mit demselben Domain-Probeskript im separaten main-Worktree. Der lokale Browser-Server bindet ausschließlich 127.0.0.1.

Implementierungscommit: `e9f9e35`. Draft-PR [#82](https://github.com/Kayza1708/Idle-game-/pull/82) gegen main; nicht mergen.
