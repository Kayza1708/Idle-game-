# Auftrag 8A: Credit-Hardware und frühe Sparziele

Basis: PR #74 / ff840529baa6e35905a643106e100cbf3e43d565 ist gemergt. Eigener Branch `codex/credit-only-hardware-goals` auf frisch gefetchtem main f17bde5; keine offene PR-Abhängigkeit, Vorgängerbranch unverändert.

## Kaufvertrag und Ursache

Die Domain kaufte bereits alle 15 Klassen ausschließlich gegen ihren wissenschaftlichen Creditpreis (abgesehen von der ausdrücklich erhaltenen Five-Hardware-Challenge-Regel). Die Oberfläche verlangte fälschlich Besitz der Vorgängerklasse; das ungepinnte Ziel behauptete sogar eine 10er-Voraussetzung. Beide Sperren sind entfernt. Alle Klassen samt echten Preisen sind sichtbar, erreichbar und nur bei bezahlbarem Domainpreview kaufbar. Tutorial erklärt einen echten SBC-Kauf statt kostenloser Entdeckung durch zehn Taschenrechner. Automations-Unlocks/Reserve/Intervalle bleiben erhalten; der vorhandene globale Meilenstein-Autobuyer betrachtet alle Klassen statt nur bereits entdeckter. Es gibt keine kostenlose Automation oder Hardware.

Sichtbarkeit/Preview verändert keinen Zustand. `hardwareOwnershipAfter` wird erst durch den erfolgreichen Kauf angewendet; Discovery, Mastery und Lifetime-Klassenzähler bleiben Kaufereignisse. Preview berechnet diesen hypothetischen Zustand rein, ohne Events/RNG/Belohnungen. Alle sechs Meilensteine bleiben unverändert. Die ungenutzten Legacy-Konstanten `hardwareUnlockCount`/`hardwareUnlockINT` bleiben kompatibel vorhanden und sind **keine Kaufbedingungen**.

Sparziele und gepinnte Hardwareziele verwenden denselben wissenschaftlichen Bulk-Preview wie die Transaktion: nächste nicht besessene Klasse sowie nächster Meilenstein der höchsten passenden besessenen Klasse. Kosten, Fehlmenge, realer Meilensteineffekt und Link zur passenden Klasse; ETA nur endlich bei positiver Rate (bei schon bezahlbarem Ziel 0). ETA hält die aktuelle passive Rate konstant und berücksichtigt keine zukünftigen Käufe/Taps. Keine Ressourcen werden ausgegeben.

## Messvertrag, keine menschliche Spielzeitprognose

`scripts/hardware-early-calibration.ts` startet beide Strategien frisch mit `newGame(0)` / 50 Credits / 0 Hardware; Entscheidung und regulärer erster Kauf bei t=0, danach genau 5.400 aktive Einsekunden-Advances und echte Taps (ein Tap/Sekunde). Entscheidungen alle zehn Sekunden: zunächst abwechselnd bezahlbares Quality-/Efficiency-Training, dann Datenerzeugung bis maximal Level 2, dann maximal ein Hardwareexemplar. Beide verwenden denselben Eingabe-/Trainings-/Forschungsalgorithmus; ihre Ressourcenentwicklung darf unterschiedliche Startzeitpunkte erzeugen. Domainforschung prüft die tatsächlichen Voraussetzungen. Keine Grants, Claims, Offline-Vorlauf, Analysen, Ausrüstung oder freiwilligen Prestiges. Bestehende reguläre Tap-/Overclock-Effekte bleiben aktiv. RNG ist reproduzierbar konstant 0,5; normale Simulationsereignisse werden nicht unterdrückt, ihre Funde nicht ausgegeben.

A ordnet **bezahlbare** echte `hardwarePurchasePreview.creditGain / cost` wissenschaftlich. B betrachtet die höchste besessene Klasse und den nächsten 10/25/50-Meilenstein; ist der erste Folgekauf billiger als der verbleibende echte Bulk-Aufwand, spart/kauft sie die nächste Klasse; nach 50 geht sie zur nächsten. Keine nachgebauten Preis-/Produktionsformeln. Das Ranking enthält tatsächliche Mastery-/Meilensteinfolgen. Prestige-Verfügbarkeit wird nur beobachtet.

JSON enthält erste Käufe, Meilensteine, gebuchte Einzelkosten, Creditrate, Zeit seit dem vorherigen **beliebigen** Kauf und Fünfminuten-Zustände. Diese Wartezeit ist keine getrennte Messung des Sparens auf eine bestimmte Klasse. `firstPrestige` ist der erste beobachtete echte Anspruch ≥1 INT, kein Reset.

## Preise und drei begrenzte Runden

Nur fünf `BALANCE.hardware.*.baseCost` verändert:

| Klasse | Vorher | Runde 1 | Runde 2 | Final / Runde 3 |
|---|---:|---:|---:|---:|
| SBC | 180 | 6.000 | 6.000 | 6.000 |
| PC | 5.000 | 300.000 | 140.000 | 100.000 |
| GPU | 100.000 | 10.000.000 | 4.000.000 | 4.000.000 |
| Rig | 1.000.000 | 60.000.000 | 75.000.000 | 75.000.000 |
| Server | 51.000.000 | 79.000.000 | 79.000.000 | 79.900.000 |

Calculator 15; Farm 80.000.000 und sämtliche späteren Preise unverändert. Preise strikt aufsteigend. Mengenwachstum, Compute, Meilensteine, Data, Training, Forschung, Prestige und Drops unverändert.

| Erste Käufe (Min:Sek) | A vorher | A Runde 1 | A Runde 2 | A final | B vorher | B final | Neues A-Ziel |
|---|---|---|---|---|---|---|---|
| SBC | 0:30 | 3:30 | 3:30 | 3:30 | 0:40 | 4:10 | 3–5 Min ✅ |
| PC | 1:50 | 21:50 | 16:20 | 13:10 | 2:20 | 9:10 | 8–15 Min ✅ |
| GPU | 4:20 | 55:00 | 33:30 | 31:50 | 3:30 | 18:40 | 20–35 Min ✅ |
| Rig | 5:20 | 75:20 | 55:40 | 52:50 | 5:00 | 37:10 | 45–75 Min ✅ |
| Server | 20:30 | 76:30 | 55:20 | 52:30 | 6:40 | 39:30 | nicht vor 90 Min ❌ |
| Farm | 10:10 | 76:10 | 55:00 | 52:10 | 7:00 | 39:50 | kein neues Ziel |

Der Server-Zielkonflikt bleibt **offen**: final kauft A zuerst die unverändert 80 Mio. teure Farm, deren 650.000 Compute und vorhandene Faktoren den Server kurz danach bezahlen. Der Server muss preislich unter der Farm bleiben. Selbst die erlaubte Anhebung nahe diese Grenze erfüllt das 90-Minuten-Ziel nicht. Wir behaupten keine mathematische Unmöglichkeit für sämtliche denkbaren Preisvektoren; nach genau drei Runden wird nicht weiter gesucht. Kein versteckter Unlock/Multiplikator löst den Konflikt.

Ausgangsmessung 6,36 s; Runden 5,18 / 5,45 / 5,80 s; **22,78 s kumulierte tatsächliche Rechenlaufzeit**, jede Durchführung mit 60-s-Prozesslimit und internem kumuliertem 300-s-Budget. Maximal 90 simulierte Minuten je Strategie/Durchführung. Rohdaten: [before](hardware-early/before.json), [round 1](hardware-early/round-1.json), [round 2](hardware-early/round-2.json), [after](hardware-early/after.json).

Reproduktion mit Node 22 und installiertem Repository: `npx vite-node --script scripts/hardware-early-calibration.ts output.json`. Ohne Override misst das die aktuellen Preise. Historische Preise mit explizitem JSON-Argument (nur die fünf zugelassenen baseCost-IDs) aus der Tabelle; Overrides gelten nur im Messprozess. Budget liegt in ignoriertem `node_modules/.cache/hardware-calibration-budget.json`; für eine **separate** Untersuchung einen neuen Budgetlauf anlegen, niemals den laufenden Dreirundenprozess zurücksetzen. Keine Langzeitkampagne.

ScientificNumber ist binäres Floating Point mit etwa 15–16 Dezimalstellen, keine exakte Dezimalarithmetik; sehr kleine Differenzen neben riesigen Beträgen können nicht dargestellt werden. Kaufprüfung/Abzug/Ranking bleiben wissenschaftlich, native Projektion nur für Anzeige/ETA. Großzahltests prüfen reguläre Käufe auch ohne vorherige Klassen.

## Technische Abnahme und Grenzen

Gezielte Tests und Typecheck/Build/Diffprüfung werden unten mit tatsächlichem Ergebnis ergänzt. Browser Chromium 360/390/430 × 844 DE/EN: alle 15 Klassen, Preis/Detail-Erreichbarkeit auch letzter Klasse, real bezahlter Erstkauf, Sparziele, ≥44-px-Zielbuttons, keine Seitenüberbreite/JS-Fehler; 13,20 s. [Screenshots/Protokoll](screenshots/hardware-early/results.json), `scripts/browser-hardware-goals.py`.

Ein vorhandener Tutorial-Quelltexttest suchte drei inzwischen ausgelagerte Ziele ausschließlich in Panels. Am Ausgangscommit f17bde5 fehlen dieselben drei Literale bereits. Der Test prüft jetzt zusätzlich die tatsächlich eingebundenen ResearchCatalog/AnalysisContracts/InventoryScreen-Dateien; alle bisherigen Assertions bleiben erhalten. Die Tutorial-SBC-Assertion folgt dem ausdrücklich neuen Credit-only-Vertrag.

**Keine Gesamtsuite oder bestätigte Langzeitbalance.** Bekannte Schicht-3-Referenzabweichungen (361/313, 57.700/59.132), Relay-/Archiv-Skalierung und optionale Langzeitbalance unverändert separat offen. Dieses deterministische Tap-Profil ist keine durchschnittliche menschliche Spielzeit. CI-Langzeitläufe werden durch Commit-Body `[skip ci]` vermieden; keine grüne Gesamtabnahme behauptet.

Finale Prüfung: **9 Testdateien / 165 Tests bestanden**, 5,18 s: hardwareCreditOnly, sharedPreviews, runStart, tutorialGuide, tutorialUi, onboarding, mobileFinalPass, storage, scientificNumber. `npm run typecheck`, `npm run build` und `git diff --check` bestanden. Production-Build 1,41 s, vorhandene Vite-Chunkgrößenwarnung (Hauptchunk 653,37 kB), kein Buildfehler. Kein pauschales npm test/FAST/DEEP/Tages-/Monatslauf. Die beiden neuen Legacy-Autobuyer-/Invalidquote-Tests wurden vor dieser finalen Prüfung ergänzt.

Prestige nur beobachtet: Anspruch ≥1 INT vorher A 33:56 / B 14:04, final A 56:21 / B 44:51. Kein Reset in irgendeiner Messung. Beide finalen Runs enden mit Quality 8 / Efficiency 8 / Datenerzeugung 2 und genau 5.400 Taps; der unterschiedliche Hardwarepfad wurde nicht durch vorbereitete Forschung ausgeglichen.
