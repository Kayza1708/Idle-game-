## 2026-10-17 · V2-Stabilisierung und mehrstufiger Balancebericht

- [x] Integrationstraining in Queue-API, Bedienung und Saveprüfung vereinheitlicht; Unlocks, Challenge-Regeln und vorgemerkte Endstufen berücksichtigt.
- [x] Challenge-Prestige-Kontext, Axiom-Telemetrie-Runstart und V2-Produktions-/Jobdiagnosen korrigiert.
- [x] Save v62, bis zu 100 dauerhafte Run-Zusammenfassungen, wissenschaftliche Produktion/Belohnungen, fünfminütige Zwischenstände und vier zusätzliche Analyse-Dateien implementiert.
- [x] Ältere Runs als Summen archiviert; teilweise erfasste Runs und verworfene Messpunkte kenntlich gemacht; v60/v61 ohne erneute Fortschrittsmigration überführt.
- [x] Node 22.23.3: Typecheck, Produktionsbuild und 1.633 Tests in 117 Dateien bestanden; voller synthetischer Historienexport mit 100 gespeicherten/fünf archivierten Runs und 500 aktuellen Ereignissen nach Reload geprüft (6.331.674 Bytes).
- [ ] Echte iPhone-/WKWebView-Abnahme und Langzeitkalibrierung anhand mehrerer natürlicher Runs bleiben offen.

[Funktionsumfang, Messdefinitionen, Migration und Exportanleitung](v2-stability-balance-report.md).

## 2026-10-17 · Release-Audit

- [x] Ausgangsstand `8e7f978` und neuen Hauptbranch `ff75c464` nach dem während des Audits gemergten Monetarisierungs-PR #118 geprüft; unveränderte Spielregeln, technische Reproduktionen auf beiden Ständen.
- [x] Fünf Shop-/Crafting-/Labor-/Trainingsfehler im Ausgangsstand bestätigt; deren jetzt gemergte Korrektur mit denselben Probes nachgewiesen. Integrations-Queue bleibt zwischen API, UI und Speicherprüfer uneinheitlich.
- [x] Build/Typecheck, Assetreferenzen, Teststruktur, native Integrationsgrenzen und npm-Abhängigkeiten geprüft; Ergebnisse inklusive lokaler Test-Timeouts im Auditbericht dokumentiert.
- [ ] Stabile V2-Spiel-/Speichermatrix und reproduzierbar grüner Node-22-Releasecheck, anschließend V2-Langzeitkalibrierung und echte iPhone-/TestFlight-Abnahme.
- [ ] Vor echtem Verkauf: native Kauf-/Ad-Anbieter, serverseitige Eigentums-/Auslieferungsprüfung, Restore-/Unterbrechungsmatrix und vollständiges App-Store-Paket abnehmen.

[Priorisierte Befunde und Release-Plan](release-audit-2026-10-17.md). [Technische Reproduktionen](../scripts/release-audit-probe.ts).

## 2026-10-16 · Kommerzialisierung V1

- [x] Store-Katalog mit Werbefrei-/Einkommen-Pass, garantierten Starter-Items, Builder-/Laborvorrat und vier Gem-Paketen; echte Store-Preise und Verifikation als anschließbare Schnittstellen.
- [x] Freiwillige Gem-/Drohnen-/Laborbelohnungen mit Quoten, Cooldown, gespeicherten Einmalbelegen und kantigen Shop-/Laboraktionen; Werbefrei nutzt dieselben Limits.
- [x] Gem-Laborabschluss, tatsächliche Zeitgutschrift für Forschung/Crafting und korrektes Integrationstraining; Save v61 ergänzt bestehende Kauf-/Fortschrittsdaten ohne erneute V2-Migration.
- [x] Belegprüfung, idempotente Gutschrift, permanenter Restore/Widerruf und dauerhafter Save vor Store-Abschluss vorbereitet.
- [x] Typecheck, Produktionsbuild und 1.618 Tests/116 Dateien bestanden; darunter 36 neue Monetarisierungsfälle. Visuelle/native Geräteabnahme bleibt offen.
- [ ] Native Store-/Ad-SDKs, authentifizierter Verifikations-/Auslieferungsserver und Sandbox-/iPhone-Abnahme vor echten Käufen und Videos erforderlich. Kein Merge oder Release ausgeführt.

[Inhalte, Preise, Funktionsumfang und offene Release-Integration](commercialization-v1.md).

## 2026-10-16 · Prestige/Axiome V2

- [x] 60 frei nach INT-Preis kaufbare Knoten, 24 Axiom-Upgrades, neuer INT-Anspruch und Credits-/Daten-/Trainingsskalierung integriert.
- [x] Drei Grundslots, dauerhaft erworbene Zusatzslots, geheimes Labor ab 200.000 INT mit zehn entwickelbaren Einzelmodellen und Erkenntnis.
- [x] Garantierte Starterrezepte, gezielte Synthese, zeitbasierte Fusion, dynamische Restarbeit, endliche Resetabsicht und Save-v60-Migration implementiert.
- [x] Typecheck, 1.582 Tests/115 Dateien und Produktionsbuild bestanden; 46 V2-Fälle einschließlich echter Acht-Stunden-Simulation mit 1/3/96 Speicherabschnitten.
- [ ] Visuelle Browser- und iPhone/WKWebView-Abnahme sowie vollständige Langzeit-/Challenge-Kampagnen offen. Kein Merge und keine Veröffentlichung.

[Konzept und Integrationsgrenzen](prestige-v2-implementation.md).

## Shop-Kategorien, Pixel-Icons und Schmiede ohne Stations-Level

- [x] Gumball-Maschine mit bestehender Auszahlung und Animation als eigener oberer Reiter wieder eingebunden.
- [x] Boosts und dauerhafte Upgrades in eigenen oberen Reitern als Shopkarten, mit echten Preisen, Zuständen, Kaufbestätigung und belegtem Kauf-Feedback.
- [x] 100/550/1200-Gem-Pakete verwenden einen/zwei/drei Kristalle; Menü und Einstellungen verwenden zusammenpassende Pixel-Art-Icons.
- [x] Stations-Ausbau-Level entfernt; Item-Veredelung über vorhandenen Zugang direkt möglich, alte bezahlte Boni und Aufträge erhalten, offene Ausbau-Missionen mit Restfortschritt übernommen (Save v59).
- [x] Simulator-Exportweg und lokaler Kopierbefehl dokumentiert; echtes iPhone/Xcode weiterhin geräteabhängig zu prüfen.

## Shop, Forschungsaktion und Einstellungen – Review-Korrektur

- [x] Den bisher nur in den bereits gemergten Arbeitsbranch übernommenen Shop für einen direkten PR gegen main integriert; v58-Migration, Preise und kantige Animationen übernommen.
- [x] Normaler Forschungsbutton startet bei freiem Labor und merkt bei belegten Laboren automatisch vor. Queue-Freischaltung, Kapazität und Voraussetzungen bleiben verbindlich; keine Abbuchung beim Vormerken.
- [x] Leere Queue-Auswahl entfernt, belegte Queue kompakt mit Reihenfolge und Entfernen dargestellt.
- [x] Menü als kantiges Raster, Einstellungen mit vollständig erreichbaren Zeilen und stabiler Eingabefokussierung.
- [x] Sichtbarer Balance-ZIP-Dialog mit Fortschritt, Abbruch, Fehlermeldungen und wiederholbarem Speichern/Teilen; Browserdownload und native Brücke geprüft.
- [ ] Auf dem Mac nach Merge: npm ci, npm run build, npx cap sync ios; App in Xcode neu bauen und ZIP über „In Dateien sichern“ auf echtem iPhone prüfen. Privacy-Manifest-Eintrag gemäß docs/native-integrations.md ergänzen/zusammenführen.

## Kantige Shop- und Item-Oberfläche

- [x] Neue Karten, Buttons, Itemrahmen und Belohnungsflächen verwenden die geraden Ecken des Spiels; Seltenheitsfarben, Größen und Animationen bleiben erhalten.
- [x] Browserprüfung kontrolliert die tatsächlich berechneten Ecken einschließlich der Belohnungs-Portale.

## 2026-10-15 · Neuer Shop — Save v58

- [x] Vier kaufbare Kistenstufen mit garantierten Komponenten, sichtbaren Item-/Seltenheitschancen und bestätigtem Öffnungsbeleg; neue Pixel-Art-Grafiken.
- [x] Kostenlose Common-Kiste alle 24 Stunden, drei zusätzliche providerbestätigte Werbeöffnungen im eigenen 24-Stunden-Fenster; Fehler/Abbruch/Reload ohne erfundene Auszahlung.
- [x] Direkte Materialpakete (u. a. 40 Graphen für 80 Gems), eingefrorene Tagesauswahl, ein echter 40-%-Rabatt und ein tägliches Rare-Item für 500 Gems.
- [x] Gem-/Starter-/Builder-Produktdaten und Native-Receipt-Schnittstelle vorbereitet; echte Käufe bleiben bis zur Integration deaktiviert. Alte dauerhafte Upgrades/Boosts unter Extras erhalten.
- [x] Atomare Tickets, Tagesstock, Cooldowns und Shopbelege über Saves; v58-Migration ohne Gratisnachzahlungen. 1.521 Tests/110 Dateien, Typecheck, Build, acht UI-Profile und separate Providerprüfung grün.
- [ ] Native Werbe-/Store-Anbindung, Server-Verifikation und echte iPhone-Abnahme offen; kein Merge/Release.

[Shop-Dokumentation, Preise, Grafikprompt und echter Clip](shop-rework.md).

## 2026-10-15 · Kräftige Seltenheitsrahmen und größere Items

- [x] Ganze Einfassung in kräftiger Seltenheitsfarbe, dunkle Innenfläche, einmaliger Rahmen-Glanz beim Reveal; Seltenheitsnamen bleiben lesbar.
- [x] Inventar-, Detail- und Ergebnisportraits etwa 10–15 % größer, weiterhin drei Inventarspalten und kompakte Detail-Aktion.
- [x] Sechs echte Seltenheitsrahmen im Browser geprüft; Aktionsprüfung für 18 Mobileprofile wiederholt, 1.490 Tests/109 Dateien, Typecheck und Build grün. [Aktualisierter Clip und Farbpalette](item-presentation.md).
- [ ] Weitere Motion-Ideen für Forschung, Hardware-Meilensteine, Prestige-Pfade und Reward-Transfers vorgeschlagen; native Abnahme bleibt offen. Kein Merge/Release.

## 2026-10-15 · Gemeinsame Item-Präsentation und Animationsabläufe

- [x] Echte Craft-/Fusionsabläufe mit Material- bzw. drei Instanzgrafiken, Energiephase, Item-Reveal, Seltenheit und tatsächlichen Werten. Skip/Weiter und sofortiges Ergebnis bei reduzierter Bewegung/Effekte aus.
- [x] Aufwertung, Veredelungsabschluss, Recycling, An-/Ablegen und Schutzänderungen als kurze bestätigte Rückmeldung; keine falschen Abschlüsse beim Auftragsstart.
- [x] Gemeinsamer Itemrahmen mit Seltenheit/Typ/Level in Inventar, Auswahl, Details, Equipment, Kapsel und Fundmeldung. Kompakter Detail-Hero und drei Inventarspalten.
- [x] 1.490 Tests/109 Dateien, Typecheck, Build und Browserprüfung mit tatsächlichen Aktionen; [Dokumentation und echter Bildschirmclip](item-presentation.md).
- [ ] Native iPhone/WKWebView/VoiceOver und finale Designabnahme offen. Kein Merge/Release.

## 2026-10-15 · Immersive Rückmeldungen nach PR112

- [x] Bonuskiste mit getrenntem Pixel-Art-Deckel/Unterteil, Öffnungschoreografie, Licht, zeitbasierten Partikeln und Materialkarten aus bestätigtem Beleg.
- [x] Herstellung/Fusion mit Abschlussimpuls, drei Fusionsitems; tatsächliche Aufwertung mit Level-Puls. Effekte aus und reduzierte Bewegung berücksichtigt.
- [x] Größere, lesbare Forschungszeilen mit Kosten/Sperrgrund; Item-Aufwertung ohne rohe Dezimalbrüche, doppelte Ergebniswerte oder „Fehlt 0“. Details nach der Hauptaktion eingeklappt.
- [x] 1.473 Tests/108 Dateien, Typecheck und Build. Browserprüfungen und vollständiger Grafikprompt: [immersive-mobile-feedback.md](immersive-mobile-feedback.md).
- [ ] Native iPhone/WKWebView/VoiceOver und subjektive Designabnahme offen. Kein Merge/Release.

## 2026-10-14 · Einheitliche Mobile-Art nach PR111

- [x] Gemeinsamer transparenter Pixel-Art-Atlas für Kapseln, Bonuskisten, Modell-Sockel und Prestige-Hub; echte Grafikzustände statt einfacher Form-Platzhalter.
- [x] Kompaktes Prestige-Fenster, strukturierte Spritenodes, sechs Branch-Sprünge und sichtbarer Startknoten. Zoom-Hitflächen ≥57px, Karte vor der Navigation.
- [x] Maus-/Touch-Knotenklick und Ziehen getrennt; tatsächlicher Archivvertrag auch im Verlust-/Erhalttext. KI-Kern zentriert, sechs geometrische Sockel im selben Materialstil.
- [x] Kisten-Ergebnis kurz sichtbar, danach History-Disclosure; Rezeptauswahl bleibt über Tabs/Reload, Besitz- und Challenge-Prüfung erhalten.
- [x] 1.473 Tests/108 Dateien, Typecheck, Build und Diffcheck; zwölf DE/EN-Mobileprofile mit tatsächlichen Aktionen, zusätzlich Touch-Drag und Archiv-Details. Vorbereitete Fixtures, keine natürliche Balancebehauptung.
- [ ] Native iPhone/WKWebView/VoiceOver und subjektive finale Designabnahme offen; vorhandene Bundlewarnung.

Assetpfad, vollständiger Built-in-Imagegen-Prompt, Verträge, reale Screenshots und Prüfbefehl: [cohesive-mobile-art.md](cohesive-mobile-art.md). Kein Merge/Release, Save/Economy unverändert.

## 2026-10-14 · Mobiler Folgeauftrag nach PR #110 — Save v57

- [x] Wiederhergestellte lokale Arbeit auf Basis von main `cff21a5`; eigener Branch `codex/mobile-forge-research-v2`.
- [x] Hin-/Rückflug mit bewegter Touchfläche und Auszahlung am tatsächlichen Einsammelort; reduzierte Bewegung/Effekte aus berücksichtigt.
- [x] Eine Veredelungsstation mit fünf Ausbaustufen. Historische bezahlte Parallelaufträge und Queues laufen aus; höchste alte Stationstufe und belegter Infrastrukturfortschritt erhalten.
- [x] Zwei Ambossgrafiken mit eingezeichneten Sockeln; leere Auswahl beim Einstieg, herstellbare Items leuchtend, fehlende Materialien ausgegraut. Unbekannte/ungelernte Baupläne zeigen keine Itemgrafik.
- [x] Neuer KI-Kern und sechs Familiensockel: Prozessor Kreis, Kern Dreieck, Forschung Quadrat. Serienfertigung als eigener 100-INT-Knoten nach Fertigung II, Transaktionssperre vor Erwerb.
- [x] Kompakte Forschung mit sichtbaren Laboren, randlosen Screens und vertikalem Touchscroll; Mira-Finger auch bei geöffneter Dialogrede. Item-Level-up direkt aus der angezeigten Kostenkarte ohne Systemdialog.
- [x] Missionskisten in der Schmiede erreichbar, sichtbare Öffnung und tatsächliche Materialicons/-mengen; Reload wiederholt weder Öffnung noch Auszahlung.
- [x] 1.469 Tests/107 Dateien, Typecheck, Build und Diffcheck; zwölf neue Mobileprofile und sechs Modell-/Fusionsprofile mit realen Transaktionen und verifiziertem Save-Reload.
- [ ] Native iPhone/WKWebView-Abnahme sowie natürliche Langzeitbalance des neuen Serienfertigungsknotens bleiben offen.

Verträge und Prüfungen: [mobile-forge-research-v2.md](mobile-forge-research-v2.md). Kein Merge und keine Veröffentlichung.

## 2026-10-14 · Direkte main-Integration und kompakte Mobile-Rückkehr

- Modell-/Schmiedepaket aus PR 109 direkt auf main übernommen: Der frühere Merge ging nach Abschluss von PR 108 nur in dessen Vorgängerbranch. Der neue PR richtet sich direkt an main.
- Kompakter Offline-Dialog mit Ertrag/Materialien/Abschlüssen; vollständige Abrechnung und Navigation unter Details, feste erreichbare Aktionen. Haupttab Labor, Tap-/Hold-Erklärung bei Mira.
- Neuer transparenter Automaten-Bitmap mit detailliertem gestapeltem Kapselinhalt; Kurbel/Ausgabe/Erfolgsfeier erhalten, unabhängige Kugellayer entfernt. Kein zusätzliches UI-Balancing oder Savewechsel.
- Nachgewiesen: zwölf Mobile-Rückkehr-/Kapselprofile (360/390/430 px × 640/844 px × DE/EN), sechs Modell-/Schmiede-Interaktionsprofile, vier Laborlevel und Mira-Trainingsweg. Kleine Rückkehr ohne Scrollbedarf, Ziehen oberhalb der Navigation, keine Seitenüberbreite/fehlenden Assets/JS-Fehler.
- 1.463 Tests/106 Dateien, Source-Path-Check/Typecheck, Build und Diffcheck grün. Native Geräteabnahme und natürliche Balance bleiben offen; kein Merge/Release. Details: [mobile-return-capsule-polish.md](mobile-return-capsule-polish.md).

## 2026-10-14 · Mobile Modell und Schmiede v56

- [x] Modellnetz mit sechs Familiensockeln, passende Ausrüstung/Buildvorschauen und geschützte Challengekopien; stufenweise Manufacturing-Freischaltungen.
- [x] Training künftig Credits, echter später Archivknoten für normalen Prestige, Axiom-/Challengegrenzen; vorher bezahlte Datajobs erhalten.
- [x] Sofortige neue Common-Items, Level1–69, höchstes Fusionlevel/Forge, Original-Schmiedegrafik, konkrete Recyclingrückgabe mit mobilem Dialog; alte bezahlte Timer erhalten.
- [x] Bestätigte Craft-/Fusion-/Recyclingeffekte, reduzierte Bewegung; dezente Laborakzente bei Modelllevel10/25/50.
- [ ] Natürliche Credit-/Item-/Fusion-/Archivkurven kalibrieren; native iPhone-/WKWebView-/VoiceOver-Abnahme und Releaseagenda weiterhin offen. Kein Merge/Release.
- [x] 1.461 Tests/106 Dateien; Typecheck/Build, sechs echte Mobile-Interaktionsprofile DE/EN mit vorbereiteten Beständen und vier Laborlevelansichten; keine natürliche Balance-Abnahme.
- Verträge, Asset und vollständiger Bildprompt: [model-forge-v1.md](model-forge-v1.md).

## 2026-10-14 · Paketdrohnen und tatsächliche iPhone-Korrekturen

- [x] Fünf aktuelle iPhone-Screenshots geprüft; Labor 2 war in einer horizontalen Slotzeile verborgen. Zwei-/Vier-Lab-Raster mit vollständiger Breite, tatsächliche Zugänge unverändert.
- [x] Training wieder klarer Button; randloses Labor ohne feste Tap-Zahl, Tippen-Floater erhalten; farbigere Navigation und kontrastreichere Werte.
- [x] Physisch versetzte kosmetische Kugelpackung an der Glaswanne, eigene detaillierte Paketdrohne statt Kiste; flüssige Bewegung bei stabiler Touchfläche.
- [x] Konkrete Materialnamen/Mengen und Währungen ohne Lootkasten; echte Drop-Belege statt gleichzeitiger passiver Materialien, auch bei folgenden Telemetrieereignissen.
- [x] 1.413 Tests/105 Dateien, Typecheck/Build/Diffcheck, 222 frühe Ansichten und sechs zusätzliche mobile Interaktionsprofile. Asset/Prompt/Vertrag: [delivery-ui-corrections.md](delivery-ui-corrections.md).
- [ ] Native iPhone-Abnahme; Produktions-Werbeanbieter und Kapsel-Langzeitkalibrierung weiterhin offen. Keine Gameplay-/Save-/Balanceänderung, kein Merge/Release.

## 2026-10-14 · Abschluss-, Ausrüstungs- und Prestigeanimationen

- [x] Forschung/Crafting/Forge: kurze freie Abschlusszeile, Gruppierung gleichzeitiger Aufträge, gezielter Impuls sichtbarer Ziele; doppelte Forge-/Craft-Itemtoasts entfernt.
- [x] Bestätigter Itemwechsel: kosmetischer Flug zum sichtbaren Slot; keine blockierten Transfers oder Domainverzögerung.
- [x] Neue Prestige-Knoten und Verbindungen: kurzer wandernder Lichtimpuls, keine dauerhaften Blinker.
- [x] Reduzierte Bewegung/Effekte aus, Abbruch und Bereinigung; kein Replay bei Reload, Kontextwechsel oder Offline-Rückkehr.
- [x] 1.410 Tests/105 Dateien, 99 gezielte Nachlaufprüfungen, Typecheck/Build/Diffcheck und sechs mobile Interaktionsprofile; Vertrag: [progression-motion.md](progression-motion.md).
- [ ] Native iPhone-Abnahme; weiterhin Kapsel-Langzeitkalibrierung und echter Werbeanbieter. Kein Merge/Release dieses Auftrags.

## 2026-10-14 · Beute, Automat und randloses Labor

- [x] Dichte fünffarbige Kugelstapel, besondere Item-/Jackpot-Enthüllung und geprüfte einmalige Auszahlung; sechs echte Click-/Save-/Reload-Profile.
- [x] Neue Gewinntabelle: Low Credits/Komponenten, Mid Data/Gems, High 1%-Item oder 0,25%-Jackpot (20×Zugpreis). Atomarer Gem-Ledger und Save v55; keine rückwirkenden Belohnungen.
- [x] Randloses statisches Labor, Modellüberlagerung entfernt, detaillierte Dropkisten/Öffnung und freier Loottext; Challenges eigener Menüpunkt ohne Profilnavigation.
- [x] Einheitliche Steuerungsglyphen, weniger Listenrahmen, gemeinsame Sheet-/Progress-/Erfolgsanimationen; Effekteinstellung/reduzierte Bewegung berücksichtigt.
- [x] 1.404 Tests/104 Dateien, Typecheck/Build/Diffcheck; 222 frühe + 336 späte Rendereransichten, 360/390/430 px DE/EN. Vertrag, neues Asset und Prompt: [reward-presentation.md](reward-presentation.md).
- [ ] Native iPhone-Abnahme, echter Produktions-Werbeanbieter und langfristige Kalibrierung der erweiterten Gewinntabelle. Kein Merge/Release.

## 2026-10-14 · Detailgrafiken, Einstieg und Drop-Rhythmus

- Detailliertes Pixel-Labor und Automatenkörper integriert; separate LED-/Monitor-/Lüfterebenen, mechanische 1,8-s-Kapselsequenz, reduzierte Bewegung.
- Silkscreen für Titel, IBM Plex Mono für Zahlen/kleine Texte, lokale Fonts/Lizenzen; kompakter Mira-Coach, Finger bis zum echten Bestätigungsbutton, sichtbare Shop-Sperrgründe.
- Erste Quality-/Data-Generation-Einführung: kostenlos, 20 Sekunden, permanente Startnachweise in Save v54; keine Challenge-/Reset-/Reload-Wiederholung oder rückwirkende Erstattung.
- Sichtbare Drops: Basis 90 s, mindestens 30 s, einer gleichzeitig, 12 s sichtbar; passende Pixelkiste ohne ×1. Eingefrorene Mengen kompensieren den geringeren erwarteten Durchsatz; alte Drops bleiben unverändert.
- Prüfung: 1.394 Tests / 103 Dateien, Typecheck/Build/Diffcheck; 558 frühe/späte Renderer-Ansichten, sieben Kapsel-/Providerprofile und sechs Null-Daten-Einstiegsprofile. Vertrag/Asset-Prompts: `pixel-polish.md`.
- Weiter offen: native iPhone-Abnahme, echter Werbeanbieter, natürliche Langzeitkalibrierung der neuen Einstiegs-/Drop-Parameter und des Automaten. Kein Release-/Merge-Nachweis.

## 2026-10-13 · Pixel UI, Kapseln und Tutorialfinger

- Einheitliche Pixel-Console-Oberfläche, lokal mitgelieferte Pixelschrift/OFL, eigene gefüllte Pixelicons und kantige Dialoge auf allen gemeinsam genutzten Screens.
- Eigener SVG-Kapselautomat im Shop: Gem-Zug, reale 1%-Itemchance, zugängliche Komponenten und Mengen, sichtbare Chancen, stabile Quittung. Save v53, Challenge-Isolation und beide Resetverträge integriert.
- Kosmetische Kurbel-/Kugel-/Auswurfanimation und Erfolgsfeedback; Tutorialfinger an tatsächlichen Buttons/Navigation. Einstellungen und reduzierte Bewegung werden respektiert.
- Video nur über echte Provider-Erfolgsrückmeldung; Produktionsanbieter bleibt ausdrücklich nicht verfügbar, bis native Integration vorliegt. Kein Mock-Video-Grant.
- Prüfung: 1.387 Tests / 102 Dateien grün; Typecheck, Build und Diffcheck grün; 558 frühe/späte Ansichten plus sieben Interaktionsprofile im echten Renderer. Native Abnahme bleibt offen.
- Offen für Release: echter Rewarded-Ad-Anbieter mit Ad Units/SDK-Konfiguration, native iPhone-Abnahme und Kalibrierung von Gem-Preis/Mengen/Video-Limit. Siehe `pixel-capsule-ui.md` für Prüfumfang und Grenzen.

## 2026-10-13 · Mira, progressive layers and retained Data

- Normal prestige now preserves unspent Data (native projection and exact scientific ledger); paid cancelled jobs are not refunded. Axiom resets keep their deeper reset contract; challenge isolation is unchanged.
- Axioms stay hidden in Prestige/profile until the first attainable reward and remain visible after reaching the layer.
- Mira is a large freestanding character with an angular speech bubble, concise instructions, target navigation and a visible target arrow. No enclosing dialogue box.
- Concrete production/training/lab previews replace narrow prose columns; research unlocks and calculations open on demand. Equipment combinations, challenge rules and foundries are compact disclosures. Existing three foundry graphics are now bound to their UI.
- Exact large balances and INT claims use bounded scientific display. Empty job metadata and redundant research unlock text no longer occupy the main screens.
- Tests: 1,375 passed; typecheck/build passed. Early/late visual matrix and remaining native acceptance are documented in `mira-streamlined-ui.md`.

## 2026-10-13 · Screenshot-driven mobile layout audit

- Fixed the clipped story dialogue (two simultaneous horizontal translations), merchant-list specificity conflicts and missing shop icon backgrounds.
- Unified rectangular dialogs, compact research labs, analysis/crafting disclosures, inventory density, challenge-family disclosures, profile navigation and prestige canvas sizing/labels/entry zoom.
- Shared detail dialogs retain keyboard focus, restore the trigger and use unique heading IDs. Gameplay, costs, reward formulas and save schema remain unchanged; challenge INT text now formats its ScientificNumber.
- Validation: 1,364 tests passed; typecheck/source-path checks/build passed. Real Chromium views at 360/390/430 px in DE/EN plus short-height tutorial checks. See `docs/mobile-layout-audit.md` for coverage and limits.
- Native iPhone safe areas, VoiceOver, keyboard/large text and all late-game populated variants still need device acceptance. This is not an App Store release certification.

## Kantige Designsprache und Tutorialzeile – 13. Oktober 2026

Mobile-Stylesheet vollständig ersetzt: flache, rechteckige Flächen, Radius null in App und Dialogen, konsistente Preis-/Aktions-/Trennlinienlogik. Tutorial als echte zweite Shellzeile mit gemessenem Dialogabstand; Zielnavigation hebt erst nach Viewwechsel hervor. Shop-/Menü-/Settings-/Screen-/Dialogskin vereinheitlicht. Funktionslose Notification-Schalter entfernt, Integrationshinweis erhalten. Keine Domain-/Save-/Balancingänderung. Vertrag: `square-mobile-design.md`.

Abschließender Typecheck/Source-Path-Check, Build und Diffcheck grün; 32 gezielte UI-Verträge grün. Vollsuite 1.358/1.361 Fälle bestanden; drei Zeitlimits, nach isoliertem Retry zwei bestehende Domain-Timeouter offen (longTermInt 10s, runStart 5s). Keine Vollsuite-/CI-Freigabe behauptet. Screenshotpfade fehlen, keine iPhone-/Browser-Sichtabnahme. Nächster Schritt: Geräte-/Guide-/Overlaymatrix und die zwei Testbudgets/Ursachen prüfen; kein Release oder automatischer Merge.

## Konkretes Mobile-Feedback korrigiert – 13. Oktober 2026

Hardware wieder Preis-only, Laborhintergrund statt aktueller Hardware, Tutorial als Portal mit neuer Begrenzung. Komponenten als Bild/Menge ohne Reservierungszeile/Rahmen; Null-Zutaten ausgeblendet. Menü als Liste, Settings mit festen Feld-/Slidergrößen. Shopkategorien und vollständige Bestätigung im gemeinsamen Detailblatt, Info auch bei blockiertem Kauf erreichbar. Keine Domain-/Save-/Balancingänderung. Vertrag: `mobile-feedback-fixes.md`.

1.361 Tests, Source-Path-Check, Typecheck, Build und Diffcheck grün. Browser-/iOS-Sichtabnahme weiterhin offen, keine tatsächliche Tutorial-/Touchgeometrie gemessen. Nächster notwendiger Schritt: dokumentierte niedrige-Viewport-, Tutorial-/Trainingsblatt-, große-Preis- und Settings-/Shopmatrix; kein Release und kein automatischer Merge.

## Kompakte Kosten und radiales Prestige-Design – 13. Oktober 2026

CostBadge/RecipeIngredient vereinheitlichen Icon + Besitz/Benötigt mit grünem/rotem und zusätzlichem textlichem Status in Hardware, Training, Forschung, Analyse, Crafting und Forge. Rezepte, Mastery, Laborquellen, Diagnose und Notifications öffnen auf Bedarf. Material-/Tutorialnavigation öffnet ihr Disclosure. Prestige: 46 Nodes radial mit echter Abhängigkeitsgeometrie, Pan/Zoom, Einpassen und Zentrieren; Settings/Slots/Karten weiter verdichtet. Keine Domain-/Save-/Balanceänderung. Vertrag: `compact-mobile-design.md`.

1.356 Standardtests grün; nach Kamera-/Revealnacharbeit 28 und 20 gezielte Verträge grün, abschließende Typechecks/Build/Diffcheck grün. Layoutmodell: 115 Mindestabstand bei 88px Nodes, keine Überschneidung/Canvasüberschreitung. Keine echte Pixel-/Touch-/iOS-Abnahme; bereitgestellte Bilder fehlen und Browserinstallation blockiert. Nächster notwendiger Schritt bleibt die vollständige Geräte-/Schriftgrößenmatrix, nicht Release oder Qualitätsfreigabe.

## Durchgehender Mobile-UI-Umbau – 13. Oktober 2026

Action-Screen mit Pixelhardware statt CSS-Würfel; Sparzielkarten/Nächster-Kauf-Text entfernt. Navigation, Menü als Bottom Sheet, Details, Equipment, Profil, Research-/Inventarbereiche, Missionen/Season, Shop, Return und Story mit gemeinsamer kompakter Gestaltung. Alle 15 Hardwarekaufaktionen bleiben; Forschung/Inventar/Forge/Automation in aufklappbaren Bereichen. Keine Wirtschaft-/Saveänderung. Umfang und Matrix: `mobile-ui-overhaul.md`.

1.350 Tests, Source-Path-Check, Typecheck, Build und Diffcheck grün. Browserdownload kein gültiges ZIP, Screenshotpfade fehlen: keine echte Mobile-/iOS-Sichtabnahme, keine gemessene Geometrie/Scrollreduktion behauptet. Nächster notwendiger Schritt ist die dokumentierte 360/390/430px- und niedrige-Viewport-Matrix; kein Release und keine 8/10-Qualitätsbehauptung.

## Mac-Build und Menüs korrigiert – 13. Oktober 2026

Auf main e1f7cb7: UI-Module BonusBoxes.tsx → BonusBoxPanel.tsx und ResearchAutomation.tsx → ResearchAutomationPanel.tsx umbenannt; Domainmodule bleiben. Imports und Renderverträge angepasst. Neue check:source-paths-Prüfung läuft vor jedem Typecheck/Build, lehnt case-insensitive Modulkonflikte und falsch geschriebene lokale Imports ab. Drei künstliche Negativ-/Positivfälle geprüft.

Seitliches Meta-Menü mit eigenem vertikalem Touchscroll, horizontaler Begrenzung, dynamischer Viewporthöhe und vh-Fallback. Alle 20 Komponenten waren bereits im Katalog/Inventar; neue Atlanten und Zuordnungen sind auf main vorhanden. Keine Materialgrants, Unlock-, Balance- oder Saveänderung.

1.346 Tests, Typecheck, Build und Diffcheck bestanden. Echter Mac-/iOS-Simulatorlauf und mobile Scrollabnahme bleiben offen; hier kein Xcodezugang und bereitgestellte Screenshotpfade nicht vorhanden. Vite-Hauptbundlewarnung bleibt. Auf dem Mac erst nach Merge: git pull --ff-only && npm run build && npx cap sync ios && npx cap open ios. Die &&-Kette stoppt vor dem Sync bei Buildfehlern, damit nicht wieder ein alter dist-Stand kopiert wird. Lokalen ios-Ordner/Spielstand nicht löschen.

## Neue Item- und Materialatlanten integriert – 13. Oktober 2026

Nach #97 auf main aufgebaut. Alle 30 Itemtypen auf den farblich/silhouettenmäßig vielfältigen Reworkatlas umgestellt; elf Materialien auf den bestätigten neuen Materialatlas. Neun bestehende Materialmotive und Hauptressourcen bleiben. PNGs inklusive Schmieden-/erster Itemversion im Gitbestand; Schmieden noch ohne UI-Bildfläche. Details: `artwork-integration.md`.

1.346 Tests, Typecheck, Build und Diffcheck grün; quadratische Atlaszellen, Alpha und bytegleiche Buildkopien geprüft. Keine Domain-/Saveänderung. Mobile Sichtprüfung und insbesondere Routerkante bleiben offen, keine Gerätefreigabe behauptet. Nächster Grafikschritt: Inventory, Crafting, Drops und Detailansicht bei 360/390/430 px abnehmen.

## Vollständiger Item-Art-Rework

Alle 30 Itemmotive mit vielfältigen Silhouetten, Materialien und Paletten neu generiert. Materialatlas bleibt erhalten. Details und ID-Reihenfolge: `item-artwork-rework.md`. Noch keine Rasterzuordnung oder Mobileabnahme; vor Integration Zellränder und Routerkabel prüfen.

## Pixelillustrationen erstellt – 13. Oktober 2026

Drei neue transparente Atlanten mit 21 Items, elf Materialien und drei Schmieden erstellt, ohne vorhandene PNGs zu überschreiben. Anzahl/Reihenfolge visuell, PNG-/Alphadaten maschinell geprüft. Spezifikation und Grenzen: `generated-artwork.md`. Nächster Schritt: Rasterzuordnung und Zellgrenzen im Spiel prüfen; noch keine UI-/Mobilefreigabe. Vorhandene SVG-Icons bleiben aktiv. Keine Domainänderung, deshalb Standardtests dieses reinen Assetblocks nicht erneut ausgeführt.

## Assetprüfung und Icons – 13. Oktober 2026

21 Items und elf Materialien nutzen eigene SVG-Motive statt gemeinsamer Platzhalter oder des unpassenden Memristorkristalls. Navigation, Kisten, Equipmentslots und spätere Prestigezweige verwenden semantische SVGs. Passende PNG-Zuordnungen bleiben erhalten. Konkreter Grafikauftrag: `artwork-commission.md`; reproduzierbare Übersicht: `icon-preview.svg` / `scripts/artwork-icon-preview.ts`.

1.346 Tests einschließlich acht neuer Iconverträge, Typecheck und Build bestanden. Mobile Browser-/Geräteabnahme weiterhin offen; keine neue Wirtschaftskalibrierung. Vite meldet weiterhin den großen Hauptbundle. Nächster Assetblock: 32 beauftragte Einzelillustrationen abnehmen und exakt nach ID zuordnen; Schmieden/Hintergründe erst nach definierter UI-Bildfläche. V1-Geräteprüfung und Langzeitbalance bleiben offen.

Mergekorrektur: #95 wurde in den Vorgängerbranch, #96 in den Kistenbranch gemergt; main enthält sie noch nicht. Dieser Arbeitsbranch integriert ihren gemeinsamen Stand f5ca8d6 mit main 2872b03 und den Icons. Kein automatischer main-Merge, kein Release, Vorgängerbranches unverändert.

## Rückkehr- und Freischaltungsführung verbessert – 13. Oktober 2026

Rückkehrbericht trennt Bruttoerzeugung von aktuellem Ledgerbestand, zeigt echte Autobuyereinheiten und respektiert die Zahlenformatierung. Höchstens zwei aktuelle Wege zu Pendingkisten, erworbenem leerem Ausrüstungsslot, Trainingsplan, bezahlbarer Forschung oder realem Forschungszugang. Keine automatische Auswahl/Käufe/Starts, keine neue Hauptscreen-Karte. Rewards führen direkt zu Missionen/Season; überlagernde Menüs werden geschlossen. Kistenbeleg zeigt lokalisierte Namen statt Objektcoercion. Vertrag: `return-unlock-guidance.md`.

Lokale Abnahme: 1.338 Standardtests, zehn neue Domain-/Renderverträge, Typecheck, Build und Diffcheck grün. Keine Balance-/Save-/Rewardänderung. Mobile Browserabnahme konkret blockiert: keine lokale Browserdatei, offizieller Download kein gültiges ZIP, Cloud-Browser erreicht lokalen Server nicht. Deshalb keine 360/390/430px-, Fokus- oder Gerätefreigabe behauptet.

Separater Aufbau auf dem offenen Bonuskisten-PR #95; Vorgängerbranches unverändert. Nächste Abnahme: die dokumentierte mobile Flowmatrix in einer Umgebung mit Browserzugang prüfen. Midgame-/Langzeitbalance sowie native Geräte-, Monetarisierungs-/Analytics- und Storeintegration bleiben V1-Arbeit.

## Bonuskisten als echter Ablauf integriert – 12. Oktober 2026

Tagesbonus verdient eine Kiste statt seines sofortigen Materialpakets; Gems/200 XP unverändert. Familie und 1%-Blueprintwurf werden beim Verdienen eingefroren, beim Öffnen einmalig gebucht. Inventarkarte mit Empfangsbeleg und Tagesbonus-Verweis in sieben Sprachen; kein Login-/Timer-/SDKgenerator. Höchstens 32 Pendingkisten, neuer Overflow automatisch geöffnet; unsicherer Ganzzahlgrant rollt den kompletten Overflowbonus zurück. Save v52, leere Legacy-Migration ohne Nachzahlungen, Prestige/Axiom erhalten Kisten, Challenges getrennt/blockiert. Audit/Savepfad aktualisiert. Vertrag: `bonus-box-flow.md`.

Lokale Abnahme: 1.328 Standardtests, 15 neue Kistenverträge, Typecheck, Build und Diffcheck grün. Ein kurzer natürlicher 600s-Verlauf verdient eine echte Tageskiste ohne vorbereitete Ressourcen/Quests. Alle Sprachen per Renderingvertrag geprüft; keine Browser-/Geräteabnahme oder Monatsökonomie-/Retentionkalibrierung.

Dieser Block liegt separat auf Draft-PR #94 auf; Vorgängerbranch bleibt unverändert. Nächster V1-Block: Rückkehr-/Freischaltungsführung und Mobileabnahme der vollständigen Abläufe. Späterer dritter Equipmentplatz/Buildbalance, Langzeitquests, native Monetarisierung/Analytics, Geräte-/Storeabnahme bleiben offen.

## Buildeinstieg und Ausrüstung integriert – 12. Oktober 2026

Kategorie-/Eigentums-/Sockelprüfung für sämtliche Itemeffekte vereinheitlicht; leere andere Plätze umgehen keine Sperren. Historische Items/Referenzen bleiben, gesperrte Effekte erst nach regulärem Erwerb aktiv. Photonenfeld-Bauplan 6 → 4 Fragmente: gleiche bezahlte Einstiegsauswahl wie Chip, kein Extra-Grant. Vorschau zeigt Training-Data Q/E und neuen Laborfaktor; laufende Forschungszeiten bleiben. Details: `build-equipment-integration.md`.

Sechs Vor-/sechs Nachprofile mit gleicher Forschungsfreiheit, zwei Eingabekadenzen und echten Kosten. Learning vorher leer, jetzt Photonenfeld bei 68:30/72:30 gefertigt; alle finalen Profile 31 Training/7 Forschung. Zwei frühe Plätze regulär erreicht, vollständige Kern-/Researchsets und dritter Platz nicht bewiesen. Vorbereitete statische Vollsetquotes sind getrennt; Produktionsset gewinnt dort auch den vereinfachten Tap-Einkommensvergleich. Späterer reiner Tapbuild und Learningnutzen an Datawalls bleiben offen.

Lokale Abnahme: 1.313 Standardtests, zehn neue Integrationsverträge, App-/strikte CLI-Typechecks, Build/Diffcheck grün. Finale sechs Profile 55,94s; Quellhashes, Gem-/Season-XP-/Data-/Tapabgleich und Reload geprüft. Keine Browser-/Geräteabnahme. Nächster Implementierungsblock: den bisher nur vorbereiteten Bonuskistenablauf vervollständigen; Midgame-/Langzeitbalance bleibt separater V1-Abnahmepunkt.

## Früher Prestige und gleiche Folgepause geprüft – 12. Oktober 2026

Acht zusätzliche natürliche Profile, gleiche Besuche/30min Eingaben, erster Reset ab 1/3 INT und je 5min online + 2h55 offline danach. Früher Reset bei 3h erhält 1 INT und öffnet nur den Einkaufsagenten; späterer bei 6h erhält 6 INT. Bei 9h05: 3 versus 7 erhaltene/abholbare INT. Kein zweiter passiver Reset. Bezahlte Queue-first schafft in gleicher Pause drei statt eines Trainingsabschlusses, verzichtet dafür auf Fertigung/Labor. Keine globale Preis-/Freischaltungsänderung, Prestige weiterhin ab 1 erlaubt. Befunde: `first-prestige-return-findings.md`.

Lokale Abnahme: 1.303 Standardtests, zwei zusätzliche Resetpolicy-Verträge; App-/strikter CLI-Typecheck, Build und Diffcheck grün. Acht Profile in 25,13s, Quellhashes, Gem-/Season-XP-/Data-/Tapbuchungen, identische Folgepausen und Reload geprüft. Keine Browser-/Geräteabnahme oder Langzeitdominanzbehauptung.

Nächster Block: zusätzliche Equipmentplätze und Forschungsfreischaltungen regulär erreichen; drei feste Builds mit gleicher Forschungsfreiheit und gleichem Eingabebudget verbinden. Belegtes Integrationsloch gezielt beheben. Weitere Kalibrierung ersetzt keine V1-Releaseabnahme.

## Passive Rückkehr und bezahlte Automation geprüft – 12. Oktober 2026

Zwölf natürliche Profile: acht kurze Besuchsverläufe bis 15h mit einem echten Offlineabschnitt pro Pause, vier aktive Zwei-Stunden-Vergleiche mit maximal zwei Prestiges. Erstprestige bei Rückkehr nach 6h/12h; zweiter aktiv bei 80:10/80:20, passiv noch nicht erreicht. Nachtpause: 8h angerechnet, 55min verworfen. Nach bezahltem Erstreset: 102 automatische Hardwarekäufe gegen Credits, drei Offline-Trainingsabschlüsse; Zwei-Job-Queue danach leer. Keine Balance-/Save-/UIänderung. Befunde und Grenzen: `passive-return-findings.md`.

Lokale Abnahme: 1.301 Standardtests, sechs neue Mess-/Obserververträge; App-/strikter CLI-Typecheck, Build und Diffcheck grün. Zwölf Profile in 49,33 Sekunden; Sourcehashes, Data-/Tap-, Gem-/Season-XP-Buchungen und Reload geprüft. Keine Browser-/Geräteabnahme; keine Wochen-/Monatskalibrierung.

Nächster Block: bei gleichen kurzen Besuchen Erstreset ab 1 versus 3 INT vergleichen und beiden INT-Kaufreihenfolgen denselben Offlineabschnitt nach dem Reset geben. Erst dann Preis/Freischaltung/Rückkehrführung anpassen; danach echte weitere Buildslots und gleiche Forschungsfreiheit prüfen. Die endliche Queue ist bisher kein starker eigenständiger passiver Build.

## Wochen-/Monatskapitel und Punktkurve umgesetzt – 12. Oktober 2026

Neue Perioden: höchstens ein Credit-/Dataziel, getrennte Arbeitsabschnitte statt mehrfach genutzter Zähler, Zukunftsbänder für längere Perioden und konkrete optionale Hardwarefrontiers. 6/12/30 und Rewardbudgets erhalten. Achievement-Produktion jetzt logarithmisch; Gems, Punkte und Claims bleiben, auch Altaccounts erhalten aber den schwächeren neuen Faktor. Save v51 erhält laufende Altquests bis zum Periodenwechsel. Verträge und Gegenmessung: `quest-chapters-and-achievements.md`.

Lokale Abnahme: 1.295 Standardtests (13 neue Kapitel-/Kurvenverträge), App-/CLI-Typecheck, Build und Diffcheck grün. Finale acht Profile in 45,32 Sekunden; Quellhashes sowie Gem-/Season-XP-Buchungen geprüft. Keine Browser-/Geräteabnahme.

Acht gematchte Zwei-Stunden-Profile: kein Wochenbonus; bei einem Tap/s sechs statt zwölf Wochenziele und vier statt acht Monatsziele fertig, XP 14.500 → 6.900. Prestige 37:30 → 47:30, Chip weiter bei 60:10; kurze Besuche behalten Tagesabschluss/169 Gems, weiterhin kein Prestige. Wochen-/Monatsabschlussquoten und Geräteabnahme offen. Nächster Block: passive Rückkehr, zweiter Prestige und erste echte Automation/Buildslots, danach längere Perioden an diesem Fortschritt prüfen.

## Feste Loadouts und Questökonomie gemessen – 12. Oktober 2026

27 natürliche Zwei-Stunden-Profile, 150,41 Sekunden: feste Relais-/Chipbelegung, 0/1/3 Taps/s, zwei Besuchsmuster mit gleichem 900-Sekunden-Budget, echte Quest-/Achievementclaims. Relais gewinnt bei drei Taps/s, Chip bei null/einem; zusätzliche Forschung ist noch kein eigenständiger fairer dritter Build. Kurze Besuche erreichen weiterhin keinen ersten INT/Prestige im Horizont. Aktive Wochenziele sind binnen zwei Stunden vollständig, 8–10 Monatsziele ebenfalls; Season-XP 13.300–16.300. Kein Monatsbonus. Rohdaten, Zusammenfassung und Einschränkungen: `build-quest-progression-findings.md`.

Lokale Abnahme: 1.282 Standardtests, App-/CLI-Typecheck, Build und Diffcheck grün; acht neue Mess-/Bonusverträge, 27 vollständige Profile und Sourcehash-/Gem-/Season-XP-Abgleich. Keine Browser-/Geräteprüfung.

Behebung: leere Questperioden dürfen keinen Bonus/Season-XP buchen; akzeptierte Profile ohne Gratisbonus zu Zeit null. Keine Balance-/Saveänderung. Nächster Schritt: weniger duplizierte Wochen-/Monatsproduktion und konservatives Zukunftsband prüfen, Achievement-Punktwirkung isolieren, danach gleiche Forschungsfreiheit und echte Midgame-Slots für drei Builds. Diese Messung beweist keine Wochen-/Monatskalibrierung oder Geräteabnahme.

## Achievements und Quests V1 integriert – 12. Oktober 2026

Implementiert: sieben neue permanente Erfolgsfamilien für 20 Materialien, 28 bezahlte Baupläne, 30 selbst gefertigte Itemtypen, fünf Materialfamilien, 15 Schmiede-Ausbaustufen und Challenge-Erstabschlüsse/-Tiefe. Höhere spätere Schwellen; doppelte Item-Endstufe entfernt. Neue Quests verwenden sechs Hardwarefortschrittsbänder, feste Produktionsbudgets und optionale neue Systemziele. Kein neuer Start-/Abbruch-Farm, keine verpflichtende Fusion oder Prestige. Save v50 behält alte Claims und laufende Quests; Hauptspiel und Challenges bleiben isoliert. Vertragsdokument: `achievements-quests-v1.md`.

**Lokale Abnahme:** 1.274 Standardtests und Typecheck grün; 17 gezielte neue Verträge. Keine langen Kampagnen oder Browser-/Geräteprüfung.

**Noch offen:** natürliche Abschlussquoten und Wochen-/Monatskalibrierung, Gem-/Season-XP-Auswirkungen, Browser-/Geräteabnahme. Nächste Progressionsmessung soll passive Kadenz, feste Builds sowie Quest-/Achievementzeitpunkte gemeinsam erfassen. Das nachfolgende ursprüngliche Auftragspaket ist historisch; dessen Struktur-/Savepunkte sind umgesetzt, seine natürliche Langzeitabnahme bleibt offen.

## V1-Auftrag: Achievements und Quests integrieren – 12. Oktober 2026

**Offen; ausdrücklich vom Nutzer ergänzt.** Die folgenden Punkte sind ein Umsetzungspaket, keine bereits ausgelieferte Balanceänderung.

Bestätigte Befunde (`src/achievements.ts`, `src/missions.ts`): Das Itemtypen-Achievement nutzt zehn Schwellen `1,2,3,4,5,6,7,8,9,9` bei inzwischen 30 Itemtypen. Missionsvorlagen haben feste Tages-/Wochen-/Monatsmengen und keine accountabhängige Zielskalierung; zusätzliche Wiederholungsstufen multiplizieren Mengen pauschal mit fünf. Starts und Abschlüsse sind getrennte belohnte Ziele. Neue Bauplan-, Materialfamilien-, Schmiedeausbau- und Challenge-Stufenprogression sind nicht ausdrücklich als Ziele integriert. Damit ist nicht bewiesen, dass sämtliche Aufgaben zu leicht sind: Einige Endstufen sind im Gegenteil extrem hoch und noch nicht natürlich kalibriert.

### Umfang und Reihenfolge

1. **Ziel- und Belohnungsaudit:** Erreichbarkeit, Redundanz, Abbruch-/Start-Farming, mehrfach belohnte gleiche Fortschritte, Gem-/Season-XP-/Materialpaket-Ausgaben prüfen. Periodenbeginn und Challenge-Isolation berücksichtigen.
2. **Langfristige Achievements:** Itemtypen bis zum vollständigen 30er-Katalog erweitern, doppelte Schwelle beseitigen. Bezahltes Bauplanlernen, tatsächlich hergestellte Typen, Materialfamilien, Ausbau der drei Schmieden, erstmals abgeschlossene Challenge-Stufen und Familienmeilensteine integrieren. Erstabschlüsse statt Wiederholungsfarm zählen; keine nur durch Lagerbestand belegten Lifetime-Erfolge. Wiederholung von Starts zugunsten nachweislicher Abschlüsse zurücknehmen. Frühe Einführungsziele erhalten; spätere Kapitel deutlich anspruchsvoller machen.
3. **Quests:** Neue Vorlagen erst nach tatsächlichem Zugang zum jeweiligen System ziehen. Ziele bei Periodenbeginn anhand des erreichten Progressionsbands bestimmen und danach einfrieren. Passive Produktionsziele neben optionalen aktiven Aufgaben anbieten. Wochen-/Monatsziele umfassen mehrere sinnvolle Systemhandlungen; keine Pflicht zum unerwünschten Prestige, zur Itemvernichtung oder zum seltenen Zufallsfund. Teure Fusion/Forge nicht bloß wegen höherer Schwierigkeit häufiger verlangen.
4. **Save-/Resetvertrag:** Bereits beanspruchte Achievement-IDs und Belohnungen erhalten. Neue längere Familien dürfen alte Claims weder erneut vergüten noch entziehen. Laufende Quests samt Ziel, Baseline, Fortschritt und Claims bis zum Periodenwechsel erhalten. Neue Fortschrittszähler nur aus verlässlichen bestehenden Daten migrieren; sonst ab Einführung zählen. Hauptspielaufgaben nicht durch isolierte Challenge-Ressourcen/-Aktionen erfüllen; erstmalige Challenge-Erfolge ausdrücklich im Hauptaccount verbuchen. Prestige/Axiom dürfen Lifetime-Erfolge und Claims nicht löschen.
5. **Balance und Abnahme:** Zahlen ausschließlich in `src/economy.ts`; Dokumentation in `docs/economy.md`. Kurze natürliche frühe Profile und repräsentative belegte Mid-/Late-Zustände nutzen; Wochen-/Monatstimings bleiben bis zu Messungen Annahmen. Tests für Unlocks, eindeutige steigende Schwellen, maximal erreichbare Sammlungsziele, Start-/Abbruch-Exploits, Replay, Reload, Migration, Offline-Abschluss, Periodenwechsel, Automation und Challenge-Isolation. UI/Zieltexte in allen unterstützten Sprachen prüfen; Typecheck, Standardtests und Build vor PR.

**Abhängigkeit:** Als eigener V1-Block vor Season-/Belohnungsabnahme und externer Beta einplanen. Struktur-/Savekorrekturen zuerst; endgültige Schwellen gemeinsam mit passiver Progression und festen Builds kalibrieren. Keine pauschale Verdopplung aller Ziele und keine Erhöhung der Belohnungen proportional zur Schwierigkeit. Zusätzliche manuelle Claim-Arbeit vermeiden; automatische Abschlüsse müssen regulären Systemfortschritt gleichwertig zählen.

# Verbindliche Entwicklungsroadmap

Statuswerte: **In Arbeit**, **Geplant**, **Erledigt**. Der Status und `NEXT_STEPS.md` werden am Ende jedes Auftrags aktualisiert; unerledigte Kriterien bleiben offen.

## Bezahlte Forschung→Crafting-Brücke 12. Oktober 2026 — Erledigt

- [x] Einmalige vier Lernfragmente an ersten bezahlten Hauptspielabschluss von Offene Baupläne gebunden; keine gratis Items/Zutaten/Module.
- [x] Save v49, unabhängige Main-/Challenge-Migration und permanente Receipt-/Kapazitäts-/Resetverträge integriert.
- [x] Forschungsfeedback, sieben Projektübersetzungen und auditierbarer Export/CSV angebunden.
- [x] 20 gezielte Tests sowie vollständiger Standardlauf (1.257 Tests), Typecheck und Build lokal grün.
- [x] Gleiche acht natürliche Profile neu gemessen; Chip in vier aktiven Fällen nach 67:30–68:30; echte passive Itemquote verglichen.
- [ ] Passive Kadenz/Taps isolieren und feste Relais-/Chiploadouts inklusive Bursteinkommen vergleichen.
- [ ] Natürliches Midgame, Forge-/Challenge-Kapitel, Browser/Geräte und Langzeitbalance abnehmen.

Details und Grenzen: `blueprint-research-bridge.md`. Diese Brücke löst das nachgewiesene aktive Lernfragmentgate, nicht die gesamte passive oder monatelange Progression.

## Begrenzte natürliche Einstiegsmessung 12. Oktober 2026 — Erledigt

- [x] Gemergten PR #87 und grüne Node-22-CI bestätigt.
- [x] Acht frische aktive/Sitzungsprofile bis zwei Stunden mit zwei Seeds und unterschiedlichen Ausgabenprioritäten gemessen.
- [x] Echte bezahlte Jobstarts, automatische Käufe, Data-Drops/Produktion, Resetverluste und nicht erreichte Ziele getrennt dokumentiert.
- [x] Messinstrument auf Sitzungsgrenzen, Rückkehr, Seed-Reproduzierbarkeit, Data-Bilanz, Reload und Horizont geprüft; 1.237 Standardtests, Typecheck und Build lokal grün.
- [x] Fragmentgate mit Basisformel belegt und eine begrenzte Forschung→Crafting-Brücke konkret spezifiziert.
- [ ] Den vorgeschlagenen einmaligen Fragment-Grant integrieren, versionieren und dieselben Profile erneut prüfen.
- [ ] Passive Kadenz/Taps isolieren und breitere vorhandene Forschungs-Sinks messen.
- [ ] Natürliches Midgame, Forge-/Buildpfade, Challenge-Kapitel und Langzeitbalance kalibrieren.

Diese Abnahme betrifft die acht dokumentierten Einstiegsmessungen. Sie belegt weder durchschnittliches Spielerverhalten noch Monatsbalance. Keine Spielparameter geändert. Siehe `natural-progression-findings.md`.

## Regression-Verträge 12. Oktober 2026 — Erledigt

- [x] Alle 30 bekannten Fehler des früheren breiten Teillaufs einzeln klassifiziert und korrigiert.
- [x] Tutorial- und Forschungs-Sperrtexte an echte Domain-Voraussetzungen gebunden.
- [x] Fehlerhafte Ressourcen im Diagnoseexport ausgewiesen und vollständige Upgrade-Materialbelege exportiert.
- [x] Vollständiger Standardlauf: 1.229 Tests, Typecheck und Build lokal grün.
- [x] CPU-intensive Kampagnen separat aufrufbar und Worker bei Zeitbudgetende terminiert; kurze Preis-/Kaufverträge im Standardlauf erhalten.
- [ ] Natürliche Profile, alte Kampagnen-Timingfenster und Wochen-/Monatsbalance neu messen und kalibrieren.
- [ ] Browser-/Geräteabnahme und Node-22-CI dieses PRs bestätigen.

Prüfgrenzen und Einzelbefunde: `regression-cleanup.md` und `regression-cleanup-audit.json`. Dieser Status bestätigt Regression-Verträge; Langzeitbalance ist weiterhin offen.

## Stabilisierung 29. September 2026 — Erledigt

- [x] Zeitpartitionierung für Training, passive Produktion und Save/Reload regressionsfest gemacht.
- [x] Dokumentierten kontinuierlichen Quality-/Efficiency-Softcap wiederhergestellt.
- [x] Kumulative INT-Entitlement-Formel einschließlich Erstanspruch und Exactly-once-Claim korrigiert.
- [x] Forschungstests an die aktuelle zentrale BALANCE-Konfiguration gebunden.

## Phase 1 – Spielbarer Kern — In Arbeit
**Ziel:** Ein abwechslungsreicher, stabiler erster Run mit aktiven und passiven Entscheidungen.

**Features:** 15 Hardwareklassen mit je sechs individuellen Mengenmeilensteinen, Klassen-Upgrades, Tap/Halten, Overclock, frühe Experimente/Items, kumulatives INT-Prestige, funktionsorientierte INT-Upgrades, Autokauf und belastbare Save-/Zeitlogik.

**Abhängigkeiten:** Browser-Prototyp, zentrale Economy, Save-Migration v7.

**Abnahmekriterien:** Start-zu-Prestige-Pfad, Profile, Daten/Forschung, 15 datengetriebene Klassen, kontrollierte Modellsoftcaps und Migration v6 sind integriert. Offen bleiben reproduzierbare neue 60-Minuten-/7-Tage-Messungen, vollständige Browserabnahme sowie die unten als Phase 2/3 geführten Build- und Metasysteme.

**Nicht enthalten:** Vollständiges Balancing/Freischaltcontent für Hardware 6–15, Energie/Wärme/Nachfrage, Meta-Prestige, echte Werbung oder Käufe.

## Phase 2 – Builds und Sammlung — Geplant
**Ziel:** Runs über sammelbare Builds unterscheidbar machen.

**Features:** besondere verhaltensändernde Itemeffekte, Crafting-Ausbau, Forschungspfade und Hardware-Synergien.

**Abhängigkeiten:** validierte Phase-1-Balance und Inventar-Telemetrie aus Tests.

**Abnahmekriterien:** mindestens drei konkurrenzfähige Builds, deterministische Tests, verständlicher Vergleich und keine Pflicht-Zufallsbarriere.

**Nicht enthalten:** Hardware 6–15, Cloud-Dienste, Monetarisierung.

## Phase 3 – Langzeitprogression — Geplant
**Ziel:** Mehrwöchige Progression mit neuen Horizonten.

**Features:** vorbereiteter Katalog KI-Workstation, Server-Rack, GPU-Cluster, Hyperscale-Rechenzentrum, Photonik-Cluster, Quantenbeschleuniger, autonome KI-Fabrik, Untersee- und Orbital-Rechenzentrum, Dyson-Rechenschwarm; Prestige-Ausbau, Herausforderungen, später Meta-Prestige.

**Abhängigkeiten:** stabile Builds aus Phase 2 und Langzeitsimulationen.

**Abnahmekriterien:** Hardware 6–15 besitzt jeweils Rolle, Grafik und Tests; mehrere langfristige Ziele funktionieren ohne harte Sackgassen.

**Nicht enthalten:** Store-Release und Echtgeldsysteme.

## Phase 4 – Spielerlebnis und Testgruppe — Geplant
**Ziel:** Verständliche, barrierearme und atmosphärische Testfassung.

**Features:** Grafik-/Soundpass, Einführung, Barrierefreiheit, lokalisierbare Texte und freiwillige, datensparsame Testanalysen.

**Abhängigkeiten:** stabiler Funktionsumfang der Phasen 1–3.

**Abnahmekriterien:** moderierte Tests, Tastatur-/Touchprüfung, Reduced Motion, Kontrast- und Screenreader-Check.

**Nicht enthalten:** native Stores, verpflichtende Analysen.

## Phase 5 – Mobile und Dienste — Geplant
**Ziel:** Zuverlässige native Test-Apps und sichere optionale Dienste.

**Features:** iOS/Android, App-Lebenszyklus, Cloud-Saves, abgesicherte Leaderboards.

**Abhängigkeiten:** Datenschutzkonzept, Backend-Entwurf, Phase-4-Testresultate.

**Abnahmekriterien:** Wiederaufnahme-/Offline-Tests auf echten Geräten, Konfliktauflösung für Saves, serverseitig validierte Ranglisten.

**Nicht enthalten:** Monetarisierung und öffentlicher Launch.

### Lokale Mobile-Beta — In Arbeit (5. Oktober 2026)

- [x] Capacitor-Konfiguration mit App-Name, Bundle-ID, gemeinsamem `dist/`-Build, Safe-Area-/Keyboard-Regeln und Browser-freier Assetbasis angelegt.
- [x] Native und Browser-Lebenszyklen über einen deduplizierten Save-/Offline-/Audio-Pfad verbunden; Android-Zurück schließt Overlays vor der Navigation.
- [x] Bestehende Haptikverwaltung an einen defensiven Capacitor-Haptics-Bridge angebunden und Beta-Export-/Import-/Diagnose-/Testreset-Bedienung ergänzt.
- [x] TypeScript-Blocker durch eindeutig benannte Gem-Shop-UI/Logikmodule behoben und die Capacitor-8-Pakete sowie Node 22 im Projektmanifest verankert.
- [ ] `android/` und `ios/` generieren, synchronisieren und nativ bauen; die Paketinstallation ist in dieser Umgebung durch HTTP 403 der npm-Registry blockiert.
- [ ] Reale Gerätecheckliste aus `docs/mobile-beta.md` vollständig durchführen; kein SDK-, Signierungs- oder Gerätetest wird vorab als bestanden markiert.

## Phase 6 – Monetarisierung und Soft Launch — Geplant
**Ziel:** Faire optionale Finanzierung in einer begrenzten Testregion.

**Features:** Gem-Economy, freiwillige Werbung, Käufe, Datenschutz, Store-Vorbereitung.

**Abhängigkeiten:** neuer ausdrücklicher Auftrag, rechtliche Prüfung, native Basis.

**Abnahmekriterien:** keine Paywall im Kern, Kaufwiederherstellung, Alters-/Datenschutzprüfung und messbare faire Balance.

**Nicht enthalten:** globaler Release.

## Phase 7 – Veröffentlichung und Betrieb — Geplant
**Ziel:** Kontrollierter Release und nachhaltiger Betrieb.

**Features:** gestaffelter Release, Live-Balancing, Inhalte, optionale Events und Supportprozesse.

**Abhängigkeiten:** erfolgreiche Soft-Launch-Kriterien und Freigabe.

**Abnahmekriterien:** Crash-/Save-Ziele, Release-Checkliste, Support- und Rollbackplan.

**Nicht enthalten:** unangekündigte Mechanik- oder Monetarisierungsänderungen.

## Grafik-Integration — Erledigt

Die bereitgestellte frühe Laboransicht sowie die geprüften Hardware-, Ressourcen-, Item- und Prestige-Atlanten sind den bestehenden Spielansichten zugeordnet. Die Oberfläche verwendet nun einen ruhigen, dunklen Pixel-Art-Stil mit kompakten Hardwarezeilen, flachen Bedienelementen, responsiven Inhaltsrastern und reduzierten Effekten. Dieser Grafikpass ändert weder Economy noch Spielmechanik oder Speicherdaten.

## Lokaler Run- und Balancebericht — Erledigt

Save v8 erfasst ab dieser Version typisierte Schlüsselereignisse, dauerhaft aufbewahrte Prestige-/Meilensteinereignisse sowie begrenzte 15-Minuten-Aggregate. Ältere Aggregate werden platzsparend zu Kampagnensummen verdichtet. Ein manueller JSON-Download stellt Kampagne, aktuellen Run, Prestige-Historie, Spielzustand und Verfügbarkeitslücken bereit, ohne Daten automatisch zu übertragen.

## Mira-Prolog und Tutorial — In Arbeit

Prolog, handlungsbasierte Tutorialschritte, geordnete wiederkehrende Dialoge, Journal und Save-v9-Migration sind implementiert. Offen bleibt die visuelle Abnahme mit der geforderten Originaldatei `mira-voss.png`, da sie im bereitgestellten Repository-Stand nicht vorhanden war.

## Zeitbasierte Forschung und Ressourcenfeedback — In Arbeit

Der erste Ausbau ist umgesetzt: Save v10, drei persistente Laborslots, einmalige Startkosten, Offline-Abschluss, konkrete Freischaltungen, ein früher Prestige-Slot sowie ein begrenzter Gem-Komfortslot. Ressourcenanzeigen interpolieren rein visuell und respektieren Reduced Motion. Offen bleiben Forschungswarteschlange/Automation, umfangreichere Projektbäume, Crafting-Timer, vollständige Zweisprachigkeit und Audio; diese Kriterien sind ausdrücklich nicht als erledigt markiert.

## Audio-Paket — Erledigt

Alle acht gelieferten Sounds sind als OGG, MP3 und WAV unter `public/assets/audio/` integriert. Hintergrundmusik und kontextbezogene Effekte besitzen gespeicherte Regler, Autoplay-Schutz, Tab-Pause und einen begrenzten UI-Klicktrigger. Save v11 migriert die Audioeinstellungen ergänzend und erhält v10-Fortschritt.

## Abschluss Save-/Tutorial-/Prestige-Diagnose (24. September 2026)

- [x] Backup-Schreibfehler ist vom eigentlichen Lesevorgang getrennt; Originaldaten sperren Autosave und können lokal gesichert/wiederhergestellt werden.
- [x] Lokale KI-Benennung mit Save-v12-Migration, Reload-/Prestige-Erhalt und normalisiertem DE/EN-Missbrauchsfilter.
- [x] Stabile Tutorial-Ziele für Labor, Hardware, Training und Forschung inklusive Scroll, Touch-/Tastaturzugang und Reduced Motion.
- [x] Bestehende INT-Knoten als mobile, verzweigte Karte mit Kosten, Voraussetzung, Status und wahrheitsgemäßem Effekt dargestellt.
- [x] Exportdiagnose um Forschungsbestand/-ausgaben und Start-/Abschlusszähler ergänzt; keine Kurve anhand eines Einzel-Exports verändert.

## INT-Leiterplatte Stufen 1–3 — Erledigt (24. September 2026)

- [x] Fünf Einstiege zu je 1 INT, vier Knoten zu je 8 INT und vier quer verbundene Knoten zu je 64 INT sind kaufbar und mechanisch angebunden.
- [x] Impulsnetz, Atlas, zusätzlicher INT-Laborplatz, Einkaufsagent, Scanner, Overclock-Kanal, Rechenverbund, Einzel-Queue, persistenter Einkaufsplan, Rückkopplung, Recycling, Labor-Assistent und zwei Item-Kombinationen sind implementiert.
- [x] Save v13 migriert v12, erstattet den ersetzten Baum und trennt Account- von Run-Belohnungen.
- [ ] Stufen 4–7, Challenges, Prototypen, Forschungsnetz, Automationsregeln, Resonanz, Selbstverbesserung und Orbitalprogramm bleiben geplant; die UI zeigt dafür keine kaufbaren Attrappen.
- [ ] Neue vollständige Mehrprestige-/7-Tage-Balanceläufe und moderierte Spielspaßprüfung bleiben offen.

## Persistente Ziele und Browser-Gem-Shop — In Arbeit (24. September 2026)

- [x] Zwölf vierstufige Achievement-Familien plus neun eigenständige, messbare Erfolge und dauerhafter, gedeckelter Forschungsbonus.
- [x] Vier Daily-, fünf Weekly- und fünf Monthly-Aufträge mit gespeicherten Baselines, UTC-Wechsel und automatischer Gutschrift.
- [x] Zwei additive Gem-Laborplätze, Trainings-/Laborboost und garantiertes Komponentenpaket ohne Lootbox.
- [x] Drei stabile native Produkt-IDs werden ohne Preis und ohne Browser-Kaufbutton angezeigt; Integrationsvertrag dokumentiert fehlende native/Backend-Infrastruktur.
- [ ] StoreKit/Play Billing, Accounts, serverseitige Verifikation, Gerätewechsel und Erstattungen bleiben bis zu einem eigenen nativen Auftrag offen.
- [ ] Moderierte mobile Browserabnahme und reale Abschlussquoten bleiben offen.


## Stabilitäts-, Trainings- und Analysepass — In Arbeit (24. September 2026)

- [x] Exponentielle, getrennt bepreiste Quality-/Efficiency-Pfade mit Bonus-Softcap.
- [x] Transaktionales Speichern, drei Backups und automatische Wiederherstellung.
- [x] 60-Sekunden-Simulationsschritte, Endlichkeitsprüfung und Watchdog.
- [x] Lokaler ZIP-Export mit elf Analysedateien.
- [x] Mobile Prestige-Leiterplatte mit Detailfenster.
- [ ] Fünfminütige reale Browser-/Geräteabnahme.

### Langlauf-Korrektur — In Arbeit (24. September 2026)

- [x] Lineare Compute-Kopplung des Trainings durch eine gedeckelte fünfte Wurzel ersetzt.
- [x] ZIP Local- und Central-Directory-Header mit Standardlesern und CRC-Prüfung validiert.
- [x] 30-Sekunden-Snapshots mit adaptiver, auf 300 Einträge begrenzter Historie ergänzt.
- [x] Event-Ressourcen, Kaufdetails, Trainingsdauer und persistente Diagnose in Save v15 ergänzt.
- [x] Automatisierter Kernlanglauf inklusive Save/Reload und Abbruch-Recovery ausgeführt.
- [ ] Browser-UI-Langlauf und macOS-Archivprogramm manuell verifizieren.

### Crash-Diagnose und Lifecycle — In Arbeit (24. September 2026)

- [x] Separater begrenzter Crash-Bericht, Begin-/End-Marker und JSON-Download.
- [x] JavaScript-, Promise-, React-, Long-Task-, Tick-, Save- und Worker-Heartbeat-Diagnose.
- [x] Recovery-Test: gültiger Save, unterbrochener Folgesave, Reload aus Backup bei erhaltener Diagnose.
- [x] Synchrone Ereignis-Saves coalesziert und Snapshot-Historie auf 300 adaptive Einträge begrenzt.
- [ ] 30-Minuten-Abnahme in einem echten Browser mit Performance-/Memory-Profil und Reload während Save.

### Save-Quota-Fehler — In Arbeit (24. September 2026)

- [x] `QuotaExceededError` beim fünften Vollsave im Schritt `temp-write` reproduziert.
- [x] Stufengenaue Save-Fehler und Größenmessung ohne Konsolen-Ausgabe des Spielstands.
- [x] Save-seitige Logkompaktierung und quota-bewusste Temp-/Backup-Reihenfolge.
- [x] Lokaler Spielstandexport nach Save-Fehler sowie fehlende React-Keys/Favicon bereinigt.
- [ ] 30-Minuten-Abnahme im echten Browser bleibt in dieser Umgebung offen.

### IndexedDB-Savepfad und Tick-Korrelation — In Arbeit (24. September 2026)

- [x] Vollständiges localStorage-Origin-Inventar aus Keynamen und Größen ergänzt.
- [x] Bytegleich geprüfte Archivierung bekannter Legacy-Saves ohne Löschen unbekannter Keys.
- [x] Atomarer IndexedDB-Hauptsave mit drei validierten Generationen und Reload-Auswahl.
- [x] Visibility- sowie Hold-Begin/-End-Diagnose zur Trennung von Pause und Blockade.
- [ ] 30-Minuten-Browserlauf und Auswertung der konkret genannten Crash-/ZIP-Dateien offen.

### Forschungsabschluss-Freeze — Erledigt (24. September 2026)

- [x] Ersten Projektabschluss im Simulationskern online, offline, ohne Queue, mit Queue und nach Save/Reload direkt vor dem Ende reproduziert.
- [x] Nicht terminierende Abschlussiteration behoben: Der fertige Laborslot wird vor Belohnung und Ereignis unveränderlich entfernt und kann nicht erneut abgeschlossen werden.
- [x] Abschlussphasen bis zum für Save und React-Render bereiten Zustand einzeln instrumentiert; Forschungsfreischaltung, Zähler und Ereignis werden genau einmal vergeben.
- [x] Bereits abgeschlossene Projekte sind auch gegen direkten oder automatischen Neustart abgesichert.

## Komponentenatlas, Rezeptpfade und Exportvertrag — In Arbeit (25. September 2026)

- [x] Sechs getrennte Komponentenbestände, erreichbare Experimentquellen, exakte Rezepte und Save-v16-Migration implementiert.
- [x] Vorhandenen 1536×1024-RGBA-Atlas anhand des realen 3×2-Rasters in Bestand und Rezeptansicht integriert.
- [x] ZIP um Manifest, Events CSV/JSONL, Economy sowie erweiterte Zeit-/Quellen-Summary ergänzt.
- [x] Bestehenden Forschungsabschluss-Fix im Code geprüft und gezielte Regressionen erweitert, statt ihn zu duplizieren.
- [ ] Gerenderte mobile Browserabnahme und vollständiger Vitest-/Buildlauf bleiben wegen unvollständigem Offline-npm-Cache offen.

## Persistente Forschungsstufen und abbrechbarer Export — In Arbeit (25. September 2026)

- [x] Fünf wiederholbare, persistente Forschungsreihen mit festen präzisen Startdauern, exponentiellen Datenkosten und echten Effekten integriert.
- [x] Drei unterschiedliche Baupläne, exakte Fehlmengenanzeige und garantierter Titan-Schrauben-Pfad implementiert.
- [x] Save v17 migriert v16 und ergänzt gespeicherte Forschungslevel/-verträge, ohne unbekannte Saves zu überschreiben.
- [x] Export arbeitet schrittweise und abbrechbar; verworfene Event-/Snapshotzahlen und Forschungsabschlussphasen werden diagnostiziert.
- [x] Aktiver und passiver 24-Stunden-Kernlauf mit festem RNG und echten Spielaktionen ausgeführt.
- [ ] Vitest-Gesamtlauf und Vite-Production-Bundle bleiben wegen unvollständigem Offline-npm-Cache offen.
- [ ] Gerenderte mobile Browserabnahme, Missionserträge und eigenständige passive Hardwarefunde bleiben offen.

### Transaktionale Komponentenanalysen – In Arbeit (25. September 2026)

- [x] Separater Analyseslot, atomare Credit-/Datenreservierung, gespeicherter Vertrag, Abbruch und konkrete Sperrgründe.
- [x] Regression für verlorenen Reload-Start und festhängende bereits abgeschlossene Analyse ergänzt.
- [x] Datenforschungsbonus softgecappt und Analysekosten in den lokalen Economy-Export aufgenommen.
- [ ] Neuer vollständiger 7-/30-Tage-Lauf sowie gerenderte mobile Browserabnahme bleiben offen.
- [ ] Spätere Prestige-Stufen 4–7 und weiterführende Automationsregeln bleiben ausdrücklich Zukunftsinhalte.

## 2026-09-25 – Economy V18
- [x] Datenforschungs-Softcap auf +50 % begrenzt.
- [x] Fünf Prestige-Äste mit je drei seriellen Knoten zentral konfiguriert.
- [x] Analysebonus, zweiter Laborslot, 2er-Forschungsqueue und Autostart implementiert.
- [x] Zwei Module, datenpflichtiges Item-Crafting und Mythic-Upgrades implementiert.
- [x] Prestige-Abbruch laufender Forschung/Analyse und dauerhafter Erhalt von Komponenten/Modulen/Items umgesetzt.
- [ ] Vollständige Big-Number-Migration und Langzeit-Balanceabnahme ausführen.

### Economy v19 completion pass
- [x] Analyse-Kosten/Bestand/Fehlmenge/ETA im UI
- [x] Passive Hardware-Schaltkreisfunde online/offline
- [x] Hardware-Meilensteine liefern Titan; Gaming-GPU-Meilensteine zusätzlich Laser
- [x] Equipment-Sockel 1 nach erstem Prestige, Sockel 2 über Fertigung I
- [x] Save-v19-Migration für passiven Komponentenfortschritt
- [ ] Big-Number-/Präzisionspfad und Langzeit-Balance-Abnahme abschließen

- v19.4: Atomare Credit-/Datenbuchungen über den zentralen ScientificNumber-Pfad für Kern-Economy-Aktionen; verhindert Teilabbuchungen und vereinheitlicht Produktionsaddition.

- **v20 Economy Precision:** persistente ScientificNumber-Spur für Credits, Daten und INT inklusive v19-Migration, Prestige-Buchungen und Balance-Export umgesetzt. UI/Telemetry bleiben auf endlichen Projektionen, während Economy-Transaktionen die exakte Spur führen.

## Abschlussblock v20.1

- [x] Labore-III-Autostart wartet bei Datenmangel und startet später automatisch bei Bezahlbarkeit.
- [x] Tatsächliche Analysefundmenge wird in der Forschungsansicht aus dem verbuchten Abschluss angezeigt.
- [x] Balance-Export besitzt getrennte Tabellen für Analysen, Komponentenflüsse, Crafting/Itemeffekte und Prestige-Knotenkäufe.

### v20.2 · A–H Precision/Equipment-Abnahme
- Exact-Credit-Ledger bis in Max-Hardwarekäufe durchgezogen; UI-Projektionscap beeinflusst den Kauf nicht mehr.
- Produktionszerlegung für alle Item-Effektfamilien vervollständigt und mit Regressionstests abgesichert.

## v20.3 · A–H acceptance closure
- [x] 15 hardware classes × required six milestones covered by a regression contract.
- [x] Component source metadata aligned with implemented passive hardware, GPU milestone, hardware milestone and analysis sources.
- [x] Full prestige reset/retention list covered by regression, including durable purchased lab slots.
- [x] Every item-recipe component ingredient checked against an implemented acquisition path.
- [x] Balance export includes item-upgrade component consumption as well as crafting ingredients/data costs.
- [ ] External acceptance only: run the repository scripts (`typecheck`, `test`, `build`) once dependencies can be installed; this environment timed out during `npm ci` and therefore does not claim those scripts passed.

## Progression V2 — 2026-09
- [x] Dynamische Achievement-Familien auf langfristige 10-Stufen-Ziele erweitert.
- [x] 6 Daily / 12 Weekly / 30 Monthly mit progressiven Quest-Stufen.
- [x] Individuelle Hardware-Autobuyer für alle 15 Klassen ab 100 Einheiten.
- [x] INT-Baum auf 40 tatsächlich wirksame Knoten / Tiefe 8 erweitert.
- [x] Save v21 mit Migration der neuen Automation-State-Felder.
- [ ] 90-Tage-Balance nach vollständigem npm-Testlauf kalibrieren; Ziel ist Monatsprogression statt Abschluss in Stunden.
- [ ] Zweiten Prestige-Layer erst nach gemessener v21-Langzeitbalance implementieren.

### Progression V2 · Mission Hub / Seasons / Profil
- [x] Ausklappbarer Mission Hub in der Werkstatt mit Daily/Weekly/Monthly und Claim-Badges.
- [x] 30-Tage Neural Season mit 50 Levels, Missions-XP, Gems, Komponenten und permanentem Season Artifact.
- [x] Spielerprofil mit Collection, Season-Historie, Stats, Inbox/Patch Notes und Settings-Grundfläche.
- [x] Persistenz/Migration auf Save v22 und zentrale Inbox-/Quest-/Season-Badges.
- [ ] Premium-Track bleibt absichtlich deaktiviert, bis native Käufe/Server-Verifikation separat beauftragt werden.

### Retention Progression v23
- [x] Hardware-Mastery nach 500 für alle 15 Klassen mit persistenten XP und Compute-Boni.
- [x] Challenge-Star-System mit langfristigen Account-Zielen und einmaligen Claims.
- [x] Collection um Hardware, Komponenten, Items, Artifacts und Mastery erweitert.
- [x] Tiefe Prestige-Tiers an Achievement Points, Mastery und Challenge Stars gekoppelt.
- [ ] Echte regelverändernde Challenge-Runs (No Tap / No Items / eingeschränkte Hardware) als nächster Ausbau.
- [ ] 90-/180-Tage-Simulator kalibriert die neuen Gates und Mastery-Kurven.

## Retention v24 – Challenge Runs

- [x] Fünf echte Challenge-Runs: No Taps, No Items, erste fünf Hardwareklassen, 10 % Daten, 100× Hardwarekosten.
- [x] Start/Abbruch/Abschluss, persistente Clears, Bestzeiten und Challenge-Star-Rewards.
- [x] Challenge-UI im Profil mit aktivem Run und Abschlussstatus.
- [x] Save v24 migriert v23 um Challenge-Run-State.
- [x] Bestehenden Simulator um 7/30/90/180-Tage-Suite erweitert und Langlauf-Telemetrie kompaktiert.
- [ ] Balanceziel für Singularity erst nach reproduzierbarer 180-Tage-Abnahme festlegen.

## Retro UI & Localization Foundation v25
- Einheitliche Retro-/Pixel-UI-Tokens, kantige Panels/Buttons, Pixel-Icon-Komponente und crisp-pixel Asset-Regel eingeführt.
- Mission Hub, Season und Profil nutzen die neue Retro-Oberfläche; Claim-/Inbox-Badges bleiben zentral sichtbar.
- Lokalisierungsgrundlage für EN/DE/ES/FR/PT/IT/PL mit englischem Fallback, persistenter Spracheinstellung und lokalisiertem Zahlenformat.
- Save v25 migriert bestehende v24-Settings verlustfrei. Finale Hardware-/Komponenten-/Artifact-Sprites bleiben der nächste Asset-Pass.


## UI stability v26
Season/Mission Hub and Prestige received crash fixes after browser playtesting. The obsolete introduction experiment was removed from onboarding, and the player profile modal received a responsive layout pass. Deep prestige nodes reuse deterministic atlas cells until unique sprites are produced.

## Quest-, Season-Pass- und Profil-UI — Erledigt (25. September 2026)

- [x] Der Season Pass zeigt Saisonname, Level, XP zum nächsten Level sowie eine horizontal touchbedienbare kostenlose und klar gesperrte Premium-Spur mit lokaler Pixel-Art.
- [x] Daily-, Weekly- und Monthly-Quests besitzen Tabs, Fortschrittsbalken, sichtbare Belohnungen, Status und eine hervorgehobene Abholaktion.
- [x] Das Profil bleibt durch begrenzte Grid-Kinder, viewportgebundene Breite, Safe-Area-Abstände und internen Inhalts-Scroll auf Mobil- und Desktopbreiten vollständig erreichbar.
- [x] Season-Status, Abholbarkeit, Sperre und einmalige Abholung sind durch Vitest-Fälle abgedeckt.

### Scaling & Synergy Pass
- [x] Alte Hardware über Ownership- und Legacy-Multiplikatoren erneut relevant machen.
- [x] Hardware-Mastery an alle Käufe koppeln.
- [x] Itemeffekte an Hardwareklassen, Meilensteine, Rarität und Upgrades koppeln.
- [x] Analyse-Dropchancen und Quellen im UI offenlegen.
- [x] Crafting-Blocker konkret im Herstellbutton anzeigen.
- [x] Grundlage der zweiten Meta-Prestige-Ebene „Axiome“ mit Anspruch, Resetvertrag, persistenten Zählern, Vorschau und Messung umsetzen; Langzeitbalance bleibt ausdrücklich unbestätigt.

## Save-Rennen und Ladebarriere – 29. September 2026

- [x] Event-, Auto-, Visibility- und Pagehide-Saves laufen über einen einzelnen, zusammenfassenden Save-Koordinator.
- [x] Erfolgreiche asynchrone Saves ersetzen den maßgeblichen In-Memory-Zustand nicht mehr durch ihren älteren Snapshot.
- [x] Simulation, Interaktionen und Autosave beginnen erst nach abgeschlossener IndexedDB-Ladeinitialisierung.
- [x] Schreibfehler behalten den aktuellen Run und erlauben einen späteren neuen Save-Versuch; inkompatible Daten und Speicherzugriffsfehler bleiben unterscheidbar.

## Komponentenbelohnungen – 29. September 2026

- [x] Gem-Shop, Ausrüstungs-Onboarding und Rewarded-Ad-Testpfad vergeben ihre bisherigen Mengen als nutzbare Schaltkreise über `grantComponents`.
- [x] Claim-/Transaktionsschutz, Gems, typisierter Bestand, Gesamtzähler, Lifetime-Zähler und bestehende Komponenten-Telemetrie bleiben atomar konsistent.
- [x] Shop- und Onboarding-Anzeigen benennen Schaltkreise auf Deutsch und Englisch und verwenden das bestehende Komponenten-Icon.

## Challenge-Run und Onboarding-Meilenstein – 29. September 2026

- [x] Challenge-Runs besitzen eine eindeutige Run-ID und messen 1 INT ausschließlich aus seit Run-Start erwirtschaftetem, prestigeberechtigtem Umsatz.
- [x] Erstabschluss vergibt Sterne genau einmal; Wiederholungen aktualisieren nur Abschlusszahl und Bestzeit, Abbruch vergibt nichts.
- [x] Das ehemalige Klassen-Upgrade-Onboarding erkennt stattdessen den echten 25-Taschenrechner-Meilenstein und behält die einmalige bestehende Belohnung.

## Drop- und Analysefeedback – 29. September 2026

- [x] Tatsächlich gebuchte Signal-Drop-Funde erscheinen gruppiert in höchstens drei zeitlich begrenzten Fundkarten.
- [x] Analyseergebnisse bleiben mit realen Materialien und Bauplanfragmenten bis zum nächsten regulären Start gespeichert; Online-/Offline-Abschluss bleibt genau einmalig.
- [x] Rückkehrberichte führen Komponenten und Analysen des konkreten Offline-Zeitraums, und die Seltenheitsgarantie verwendet das zentrale Komponentenregister ohne garantierten Quantenkern.

## KI-Ausrüstungsdialog – 29. September 2026

- [x] Die Modellkarte öffnet einen fokussierten, mobilen Ausrüstungsdialog mit drei dauerhaften, zentral gezählten Plätzen.
- [x] Ausrüsten, Ersetzen und Entfernen erhalten Iteminstanzen, erzwingen bestehende Kategorien und zeigen eine Vorschau aus der echten Economy.
- [x] Platzkäufe verwenden exakte ScientificNumber-Prüfung/-Subtraktion und bleiben zusammen mit gültiger Ausrüstung über Reload und Prestige erhalten.

- [x] Zeitbasierte, offlinefähige Werkbank für bestehende Module und Itemrezepte mit einem aktiven und drei wartenden Aufträgen.

## Forschungsarbeitsplatz – Bedienpfade (2026-09-30)

- [x] Mobile-first Forschungsarbeitsplatz mit den getrennten Tabs Forschung, Materialanalysen und Durchbrüche umgesetzt.
- [x] Forschung auf reine Datenkosten umgestellt; feste Laufzeitverträge sowie sichere Abschluss-/Reload-Pfade beibehalten.
- [x] Separaten Analyseslot, konkrete Startsperren, Ergebniswiederholung und bestehende Fragment-Durchbrüche in der Ansicht zusammengeführt.
- [x] Onboarding-Ziel „Forschung beginnt“ auf Datenerzeugung Stufe 1 umgestellt und einmalige Common-Item-Belohnung ergänzt.

## Deterministischer Balance-Simulator – 30. September 2026

- [x] Feste aktive und passive Sitzungsprofile verwenden echte Tap-, Kauf-, Training-, Forschungs-, Analyse-, Crafting-, Claim- und Prestige-Funktionen.
- [x] 1-/7-Tage-Läufe über drei feste Seeds exportieren Min/Median/Max, Scientific-Werte und Zeit-/Engpassdiagnostik.
- [x] Offline-Limit, Ereignisgrenzen, Prestige-Verfügbarkeit und abgeschlossene Craftingresultate werden getrennt ausgewertet.
- [ ] Economy-Anpassungen erst in einem eigenen Folgeauftrag aus den gemessenen Material-/Slotengpässen ableiten.

## Pixel-Art-Atlanten – 30. September 2026

- [x] Vier neue Pixel-Art-Atlanten mit expliziten Komponenten-, passenden Item-, Meta- und Aktivitäten-Zuordnungen integriert; unpassende Itemmotive bleiben reserviert.
- [x] Darstellung nutzt atlaseigene Raster, rechteckige Kacheln für eingebrannte Hintergründe und keine Blend-Modi oder Farbfilter.

## Mira-Benutzerführung – 30. September 2026

- [x] Das bestehende Mira-Tutorial führt über acht echte Aktionen und Abschlüsse vom Labor-Impuls bis zum ersten ausgerüsteten Item.
- [x] Stabile Ziel-IDs, freiwillige Tab-Navigation, nicht blockierende Wartehinweise und ressourcenbasierte Voraussetzungen sind mobil und tastaturbedienbar umgesetzt.
- [x] Überspringen entfernt die Führung ohne Rewards zu verändern; Fortsetzen ist über Miras Journal möglich.

## Rückkehrübersicht und nächstes Ziel – 30. September 2026

- [x] Rückkehrberichte zeigen ab fünf Minuten echte, offline gebuchte ScientificNumber-Erträge, Komponenten, Abschlüsse sowie berücksichtigte und verlorene Zeit.
- [x] Die Werkstatt priorisiert Tutorial, abholbares Onboarding, Ausrüstung, bezahlbares Crafting, startbare Forschung und feste Hardware-Meilensteine ohne automatische Aktionen.
- [x] Quest-/Season-Badges basieren ausschließlich auf tatsächlich abholbaren Belohnungen einschließlich Periodenbonus.

## Mira-Fortschrittskapitel – 30. September 2026

- [x] Fünf zweitseitige Kapitel reagieren einmalig auf Quality-Abschluss, 1.000 gleichzeitige Nutzer, Prestige, ausgerüstetes Item und Server-Rack-Kauf.
- [x] Bestehende Dialogwarteschlange priorisiert Tutorialtexte und ordnet gleichzeitig erreichte Kapitel deterministisch.
- [x] Journal, getrennte Story-Einstellung, Altspielstand-Abgleich sowie deutsche und englische Texte sind umgesetzt.

## Schicht-1-Economy-Kalibrierung – 30. September 2026

- [x] Alle 15 Hardwareklassen sind credit-only und ohne Progressionsvoraussetzungen kaufbar; spätere Klassen bleiben mit Preis und Sparfortschritt aufklappbar sichtbar.
- [x] ScientificNumber-Einzel-/Bulk-/Max-Käufe, exakter Abzug und einmalige Meilensteinkanten sind getestet.
- [x] Reproduzierbare Vorher-/Nachher-Messungen für Strategie A/B sowie eine Kontrollmessung mit allen Systemen sind dokumentiert.
- [x] Erstkauf-Zeitfenster Klassen 1–5, Klasse 6 frühestens nach drei Stunden sowie Rate-/Anteilsgrenzen sind nachgewiesen.
- [ ] Zwei einzelne 2–5-Minuten-Sparphasen vor Klasse 5; die ROI-Strategie unterbricht sie derzeit durch rentable Zwischenkäufe.

## Schicht-2-Economy – Data und Modelltraining (30. September 2026)

- [x] Data-Grundrate auf `0,1 × sqrt(users)` und sämtliche zusätzlichen Data-Prozentboni auf einen gemeinsamen, unter ×5 abgeflachten Multiplikator umgestellt.
- [x] Quality-/Efficiency-Kosten und -Dauern sind getrennt, data-only, beim Start fest gespeichert und unabhängig von Compute, Taps und späteren Beschleunigern.
- [x] Online-/Offline-/Reload-Abschluss, Doppelklickschutz, exakter Abzug, große Zahlen und unveränderte Hardwareparameter sind getestet.
- [x] Basis-, aktiver, passiver und Research-/Analyse-Kontrolllauf sind reproduzierbar dokumentiert.
- [ ] Ziel „erstes Training nach 3–5 aktiven Minuten“: gemessen sind 75 Sekunden.
- [ ] Steigende reine Ansparpausen: im aggressiven 24-h-Hardwarelauf durch schneller wachsende Nutzer-/Data-Rate nicht monoton erfüllt.

## Schicht-3-Economy – Forschung und Analysen (1. Oktober 2026)

- [x] Alle wiederholbaren und einmaligen Forschungen verwenden vier zentrale Kategorien, reine Data-Kosten, ×1,85 Kostenwachstum, ×1,35 Dauerwachstum und den 72-h-Cap.
- [x] Analysen verwenden ihren unabhängigen Slot, die sechs vorgegebenen Data-/Dauerverträge und keine Creditkosten.
- [x] Startdauer, exakter Abzug, parallele Slots, Wiederholung sowie Online-/Offline-/Reload-Abschluss sind getestet.
- [x] Reproduzierbare 1-/7-Tage-Läufe für beide Prioritäten und aktive/passive Sitzungsprofile sind dokumentiert.
- [ ] Erste Forschung nach 5–10 aktiven Minuten: gemessen sind 20 Sekunden.
- [ ] Erste Hardwareanalyse nach 14–30 aktiven Minuten (früheres Ziel 15–30): in diesem historischen Lauf gemessen sind 20 Sekunden; aktueller Vertragswechsel siehe unten.
- [ ] Frühe Data-Priorisierung: durch acht Stunden Produktion vor der ersten Sitzung aktuell nicht erzwungen.

## Schicht-3-Messkorrektur (1. Oktober 2026)

- [x] Kampagnenstart bei `t=0` ohne vorgeschaltete Offline-Produktion simuliert.
- [x] 90-Minuten-Aktivlauf, Rückkehrlauf sowie 1-/7-Tage-Profile trennen aktive, abwesende und gutgeschriebene Zeit.
- [x] Data-Entscheidungen und Abschlüsse reproduzierbar protokolliert.
- [x] Crafting-Blockade pro Rezept und vollständiger Zutatenkette diagnostiziert.
- [x] Erstes Katalogrezept ohne Zuschüsse, neue Quellen oder Drop-Erhöhungen natürlich herstellbar.
- [ ] Frühziele für Forschung und Analyse: mit 130 beziehungsweise 390 aktiven Sekunden weiterhin verfehlt; keine Parameteränderung in diesem Auftrag.

## Schicht 3 v3 – Frühstart und Impulsrelais (1. Oktober 2026)

- [x] Minimale ganzzahlige Kosten 363/57.623 über echte Entscheidungstimeline reproduzierbar bestimmt.
- [x] Forschungs- und Hardwareanalysefenster in Strategien A/B sowie Seeds 1708/42/2026 erreicht.
- [x] Impulsrelais mit permanentem Hardwareanalyse-Bauplan, echtem Rezept und fünf Minuten Werkbankzeit ergänzt.
- [x] Persistenter ScientificNumber-Tapbonus, Prestigeerhalt und Ausrüstungssperre getestet.
- [ ] Herstellungsziel 45–75 aktive Minuten: tatsächlich 30 Minuten; feste Vorgaben und Drops wurden nicht verändert.

## Implementierungs-Audit – 1. Oktober 2026

- [x] Save-Koordinator, Komponentenpfade, Challenges, Forschung/Analysen, Crafting/Equipment und Rückkehrabrechnung mit Code und Tests geprüft.
- [x] Drei nachgewiesene Restfehler behoben: gesperrtes Tutorial-Rezeptziel, falscher Impulsrelais-Prozenttext, veralteter Itemtypen-Gesamtzähler.
- [ ] Vollständiger Browserlauf und 390-px-Sichtprüfung: in dieser Umgebung kein Browser verfügbar.
- [ ] Langzeitsuite in einer Umgebung mit ausreichendem Zeitbudget vollständig abschließen.
## Prestige-Vorschau und Reset-Sicherheit – 1. Oktober 2026

- [x] Reine zentrale Vorschau und tatsächlichen Reset auf denselben Vertrag gestellt.
- [x] Mobiles Bestätigungsfenster mit INT, Bonus, Reset/Erhalt und laufenden Aufträgen ergänzt.
- [x] Doppelklick/Reload, dauerhaften INT-Bonus, Auftragserhalt und ersten Equipment-Platz getestet.
- [x] Aktive 90-Minuten-Vergleichsmessung ohne Änderung der Prestigeparameter dokumentiert.
- [ ] Bestätigungsfenster und direkter Equipment-Weg bei 390 px in einem echten Browser prüfen.

## INT-Anspruchskurve – 1. Oktober 2026

- [x] Ausschließlich die Umsatzschwelle der bestehenden kumulativen INT-Formel kalibriert.
- [x] Kleinsten ganzzahligen Schwellenwert für einen normalen Entscheid bei 45 Minuten deterministisch bestimmt.
- [x] Seeds 1708/42/2026, Vergleich ohne Prestige und zweiten Run dokumentiert.
- [x] Anspruch, Vorschau, Reset und Export verwenden weiterhin dieselbe zentrale Formel.
- [ ] Spürbaren Nutzen des zweiten Runs im folgenden Prestige-Unlock-Auftrag untersuchen; keine Ersatzboni in dieser Kalibrierung.

## Frühe Prestige-Unlocks – 1. Oktober 2026

- [x] `shoppingAgent`, `trainingPlan` und `componentScanner` als unabhängige Einstiegswurzeln ergänzt.
- [x] ScientificNumber-Reserve, persistente Trainingsqueue und normalisierte passive Scannergewichte implementiert.
- [x] Reset, Reload, Online/Offline und Schutz vor doppelter Knotenwirkung getestet.
- [ ] Kompakte Automation und Knotendetails bei 390 px manuell prüfen.
# Prestige tree presentation (completed)

- [x] The complete prestige catalog is rendered from one deterministic layout register.
- [x] Catalog prerequisites drive validated connector lines; node states and the mobile/desktop detail surface are accessible without changing economy values.

## Axiom-Kalibrierung 1. Oktober 2026 — Erledigt

- [x] Ausschließlich die Axiom-Schwelle auf 117 kalibriert, Drei-Seed-Zielkonflikt dokumentiert und echte Sofort-/2-Axiom-Resetpfade bis zum jeweils vollständig messbaren Horizont geprüft.

- [x] Drei permanente Axiom-Einmalkäufe nutzen die vorhandenen Shopping-, Analyse- und Crafting-Transaktionspfade; Besitz und Einstellungen überleben beide Prestigeebenen.

- [x] Gewichtetes ScientificNumber-INT-Ledger, tiefenbasierte Baumpreise, drei INT-Ertragsknoten, Erkenntnisarchiv und permanenter Prestige-Agent sind in die bestehenden Transaktionspfade integriert.

- [x] Doppelte Credits–INT-Rückkopplung entfernt und normalen INT-Creditbonus logarithmisch auf dem exakten Zyklus-INT-Ledger berechnet.

## Axiom-Metaebene v37

- [x] Atomaren Axiom-Resetvertrag und drei wirksame, persistente Axiom-Knoten in bestehende Ledger-, Komponenten- und Prestige-Pfade integriert.
- [x] Prestige-Agent mit ScientificNumber-Mindestanspruch, Laufzeit und getrennten Training-/Analyse-Warteoptionen über denselben Online-/Offline-Pfad geführt.

## Mira-Einstiegskampagne v38

- [x] Namenswahl, echte zehnstufige Aktionsführung und Meilensteindialoge vom Garagenlabor bis zur AI-Company integriert.
- [x] Persistente Tutorialziele, mobile Zielmarkierung, Journal-Neustart, Dialogqueue und Reduced-Motion-Verhalten automatisiert geprüft.

## Mobile Cozy-Pixel-Oberfläche — abgeschlossen (5. Oktober 2026)

- [x] Werkstatt-Ressourcen priorisieren Credits und Data; Compute/Users sind kompakte Sekundärwerte.
- [x] KI-Modellkarte öffnet weiterhin den bestehenden Ausrüstungsdialog und zeigt Name, Q/E-Level sowie Platzbelegung.
- [x] Training zeigt begrenzten Fortschritt und eine aus verbleibender Arbeit und realer Rate berechnete Restzeit.
- [x] Hardwarekarten nutzen echte Atlaszuordnungen; Amortisation und Ansparzeit liegen in aufklappbaren Kaufdetails.
- [x] Quest-/Season-Hub ist kompakt, zeigt nur echte Abholindikatoren, begrenzte Fortschritte, Resetzeit und beide Belohnungsspuren.
- [x] Profil nutzt fünf erreichbare Hauptbereiche und echte Profilwerte; Dialogfokus, Escape, Fokuswiederherstellung und Scrollsperre sind umgesetzt.
- [x] Mobile Safe-Area, 44-px-Ziele, interne Scrollbereiche und Reduced Motion bleiben berücksichtigt.
- [ ] Gerenderte Browserabnahme bei 360/390/430 px und Desktop ausführen, sobald eine Browser-Runtime verfügbar ist.

## Rückkehr, Ziele und Season-Archiv — abgeschlossen (5. Oktober 2026)

- [x] Rückkehrbericht ab 60 Sekunden mit tatsächlicher/gutgeschriebener/verlorener Zeit, echten Ressourcen, gruppierten Komponenten, Abschlüssen und neu abholbaren Belohnungen erweitert.
- [x] Gemeinsame Zielpriorität Tutorial → abholbare Belohnung → angeheftetes Ziel → nächste Hardwareklasse umgesetzt; genau ein Hardware-, Forschungs-, Rezept- oder Prestigeziel wird in Save v38 gespeichert.
- [x] Zielkarten zeigen Fortschritt, konkrete Fehlmenge, verlässliche ETA und Bereichsaktion, ohne Käufe oder Claims automatisch auszuführen.
- [x] Nicht mehr verfügbare Questaktionen werden im laufenden Zeitraum durch die erreichbare Credit-Produktion mit unveränderter Gem-Belohnung ersetzt; Periodenbaselines bleiben zeitlich getrennt.
- [x] Season-Wechsel archiviert höchstens eine vorherige Season sieben Tage, bewahrt Artefakte und verhindert doppelte Claims.
- [x] Lokale, begrenzte Telemetrie erfasst Rückkehr, Zielwahl/-abschluss, Quest-Claims und Season-Wechsel; der Balance-Export enthält Ziel- und Seasonstatus.

## Zentraler Gem-Shop — abgeschlossen (5. Oktober 2026)

- [x] Laborplätze 3/4, dreistufige Offline-Kapazität, anteilige Crafting-/Trainingsverkürzung und freischaltungsabhängige Materialpakete zentral konfiguriert.
- [x] Kaufprüfung, atomarer Gem-Abzug, Doppelklickschutz, kanonische Komponentenbuchung und einmaliger Auftragsabschluss getestet.
- [x] Permanente Käufe über normalen Prestige, Axiom-Reset und Save-v39-Reload erhalten.
- [x] Mobile Shopbereiche mit Sperrgründen, Bestätigung und Gem-Bestand vorher/nachher umgesetzt.
- [x] Lokalen Gem-Export nach Einnahmequelle und Angebot ergänzt und 30-Tage-Lauf ohne Echtgeld dokumentiert.
- [ ] Native Store-Anbindung und Browser-Screenshotabnahme bleiben ausdrücklich offen.

## Retro-Audio und optionale Haptik — abgeschlossen (5. Oktober 2026)

- [x] Vorhandene OGG-/MP3-Dateien zentral und erfolgsabhängig Navigation, Käufen, Meilensteinen, Funden, Abschlüssen, Claims sowie beiden Resetarten zugeordnet.
- [x] Eine entsperrbare Idle-Loop-Instanz mit Hintergrundpause, Musik-/Effektlautstärke und robuster Play-Ablehnung umgesetzt.
- [x] Gemeinsame optionale Native-/Browser-Haptik mit drei Mustern integriert; automatische und Offline-Aktionen bleiben stumm.
- [x] 100-ms-Drossel, Vier-Effekt-Limit, Tap-Begrenzung und Tests gegen doppelte Auslösung ergänzt.
- [x] Save v40 erhält bestehende Lautstärken und ergänzt Haptik standardmäßig deaktiviert.
- [x] Fehlende eigenständige Audiomotive dokumentiert; keine nicht vorhandenen Pfade eingebunden.
- [ ] Hör- und Haptikabnahme auf realen iOS-/Android-Geräten bleibt offen.

## Mobile-first interface (2026-10-05)
- [x] Compact safe-area resource bar and four-item bottom navigation implemented.
- [x] Workshop reordered around an interactive AI core, compact model controls, and visual hardware rows.
- [x] Profile, season, missions, achievements, audio, effects, and language moved behind the meta menu.
- [x] Research, inventory, prestige, missions, and reusable detail overlays received mobile density and touch-target treatment.
- [ ] Final VoiceOver and physical-device usability review remains outstanding.

## Mobile UI pass 2 (2026-10-05)
- [x] Root viewport containment and portrait-width source contracts cover 375, 390, 393, 402 and 430 px.
- [x] Research, analyses, breakthroughs, inventory, crafting, prestige, missions, achievements, season and profile use dedicated mobile information architecture.
- [x] Reusable bottom-sheet architecture introduced for secondary information and actions.
- [x] Redundant Research Data, Mission Gem account, repeated component sources and empty crafting/equipment diagnostics removed from overviews.
- [ ] Physical-device VoiceOver and Dynamic Type acceptance remains open.

## Final mobile UX and active-first opening (2026-10-05)
- [x] Fresh saves begin at zero hardware and zero passive income; the first Calculator is earned from core impulses.
- [x] Every 100 active impulses automatically triggers the existing 15-second Overclock boost.
- [x] Drop rewards resolve inside the core scene without interruptive cards or dismiss buttons.
- [x] One compact hardware list exposes all classes and moves mastery/milestone detail into a sheet.
- [x] Item collection, AI equipment, research, analyses, breakthroughs, prestige nodes, missions and season rewards use dense mobile layouts.
- [x] Gameplay screens no longer render reset, crash, save, balance or debug utilities.
- [ ] Final physical-device haptic, VoiceOver and Dynamic Type acceptance remains open.

## Finaler Mobile-UX-Fix (2026-10-05)
- [x] Prestige als innerhalb des Viewports geclippte, zoombare und verschiebbare 2D-Netzkarte mit echten Abhängigkeitslinien umgesetzt.
- [x] Fünf mobile Hauptziele einschließlich vorbereitetem Shop sowie Freischaltsperre für Prestige umgesetzt.
- [x] Missionszeilen, Forschung, Hardware-Kaufaktion, Ressourcenformatierung und Settings/Reset für iPhone-Breiten stabilisiert.

## Mobile-Test-Harness-Fix (2026-10-05)
- [x] CSS-Source-Contracts lesen `src/style.css` direkt aus dem Dateisystem, statt den leeren Vitest-CSS-Modulwert zu prüfen.

## Strukturierter Mobile-UX- und Layout-Pass (5. Oktober 2026)
- [x] Werkstatt als feste Ressourcen-/Core-/Navigations-Shell mit ausschließlich intern scrollender Hardwarefläche umgesetzt.
- [x] Core-Szene auf kompakten CSS-Dark-Tech-Hintergrund umgestellt und Modell/Training in ein Detail-Sheet verlagert.
- [x] Permanentes „Nächstes Ziel“-Panel entfernt; Mira-Coach und hervorgehobene Aktionsziele bleiben handlungsführend.
- [x] Nächsten Labor-Unlock inline, Gem-Shop als kompakte Tiles und Prestige-Kopf als Summary mit Detail-Sheet umgesetzt.
- [x] Missionszeile strukturell in Icon, flexiblen Inhalt, Reward und Claim bei begrenzter Höhe zerlegt.
- [ ] Reale iPhone-16-Pro-Simulator-Abnahme dieses Passes steht aus.

## Shop-Copy-Korrektur (5. Oktober 2026)
- [x] Die erklärende Lootbox-/Monetarisierungszeile wurde vollständig aus der sichtbaren Gem-Shop-Komponente entfernt.

## Mobile Meta-System Polish (5. Oktober 2026)
- [x] Gemeinsame Safe-Area-Shell für feste ResourceBar/BottomNav und scrollenden Screeninhalt nachgeschärft.
- [x] Core-Zentrierung, Research-Tabs, kompakte Kurz-Materialanalyse und lesbare Missions-Claims stabilisiert.
- [x] Permanenten Crash-Hinweis entfernt; Diagnoseexport ausschließlich in den Einstellungen belassen.
- [x] Profil und Einstellungen als getrennte Menümodi konsolidiert; Settings gruppiert und dynamische Prozentwerte stabilisiert.
- [x] Kanonisches Gem-Artwork für Missionen, Shop, Achievements und Laborpreise vereinheitlicht.
- [x] Season-Header, Countdown, Free/Premium-Erklärung und konkrete Reward-Vorschauen verdichtet.
- [x] Native Store-, Ads- und Notification-Grenzen ehrlich dokumentiert; keine Fake-Käufe, Fake-Ads oder erfundenen Rewards ergänzt.
- [ ] Daily-Shop-Rotation bleibt bis zu einer genehmigten zentralen Reward-Tabelle und versioniertem Claim-State offen.

## Gameplay-UX und Progression-Pass (5. Oktober 2026)
- [x] Normaler Prestige- und Axiom-Reset starten wieder mit exakt null Hardware; Regressionstest ergänzt.
- [x] Prestige-Tree nutzt den verfügbaren mobilen Raum mit größerem Startzoom, klaren Kosten und kompaktem Node-Sheet.
- [x] Prestige-Bestätigung auf Bonus, Reset, Erhalt und einen sicheren CTA verdichtet.
- [x] Hardwarezeilen zeigen autoritative aktuelle Klassenproduktion und Kaufmodus-abhängigen Produktionsgewinn.
- [x] Core-Hierarchie und Impulsanzeige vereinfacht; Model-Sheet zeigt echte Quality-/Efficiency-Werte und verweist auf bestehende Core-Research-Progression.
- [x] Research Rows vollständig tappbar gemacht und Startaktionen in ein gemeinsames Detail-Sheet verschoben.
- [ ] Reale Touch-/Pinch-/Safe-Area-Abnahme auf iPhone bleibt erforderlich.

## Verifikations-Nachschärfung (5. Oktober 2026)
- [x] Reset-Verträge auf Reload/Offline-Fortschritt, alle Hardwareklassen und null Hardware-Compute erweitert.
- [x] Hardwareanzeige auf denselben globalen Compute-Pfad wie die Economy umgestellt; ×10/MAX werden gegen den echten Zustandsdelta geprüft.
- [x] Retention-Gates in Tree-State und Node-Sheet vereinheitlicht; konkrete Sperrgründe ergänzt.
- [x] Labore zu einer kompakten Statusgruppe verdichtet und bestehende Core-Research-Einträge direkt verlinkt.
- [ ] Ausführung der vollständigen Toolchain steht in dieser Umgebung wegen nicht installierbarer npm-Abhängigkeiten aus.

## Resource-Header und Workshop-Hero (6. Oktober 2026)
- [x] ResourceBar strukturell in vier identische ResourceCells zwischen symmetrischen 44-px-Seitenbereichen organisiert.
- [x] Workshop-Action-Area in getrennte Core-Interaktion, Tap-Ertrag, Impulsfortschritt und kompakte Model-Metriken gegliedert.
- [x] Sichtbare Model-Werte verwenden weiterhin die autoritativen Quality-/Efficiency-Funktionen.
- [ ] Visuelle Xcode-Abnahme für 375×667 bis 430×932 steht aus.

## Mobile-Sheet Release-Blocker (6. Oktober 2026)
- [x] Detail-Sheets aus den geclippten Screen-Scrollern in ein Body-Portal verschoben und auf festen Header, ausschließlich scrollenden Body und festen Action-Footer konsolidiert.
- [x] Verfügbare Overlay-Höhe zieht BottomNav und iOS-Bottom-Safe-Area über eine gemeinsame Shell-Variable ab.
- [x] Prestige- und Research-Aktionen bleiben für verfügbare, gesperrte, laufende und abgeschlossene Zustände im Footer sichtbar.
- [x] Offline-Report verwendet dieselbe Header-/Body-/Footer-Höhenlogik.
- [ ] Reale CTA-Sichtbarkeit und Tappbarkeit auf den sechs Ziel-iPhone-Viewports bleibt in Xcode abzunehmen.

## Prestige- und Season-Wertigkeit (6. Oktober 2026)
- [x] Permanenten INT-Bonus auf eine stärkere, weiterhin logarithmisch abflachende autoritative Kurve umgestellt.
- [x] Prestige-Confirmation als goldbetonten Mobile-Moment mit breitem Primär-CTA und sekundärem Abbrechen neu gegliedert.
- [x] ResourceBar nutzt ohne künstlichen linken Spacer die gesamte Breite vor dem 44-px-Menübereich.
- [x] Free- und Premium-Season-Vorschauen über alle 50 Level getrennt; 5er-Meilensteine und Finale hervorgehoben.
- [ ] Neue Balance und visuelle Season-/Prestige-Hierarchie im iPhone-Simulator abnehmen.

## ScientificNumber und Kaufmathematik (6. Oktober 2026)
- [x] Unterdeckten 12,589-/15-Credit-Kauf mit den echten Domainfunktionen reproduziert und durch werttreue Normalisierung gebrochener Exponenten behoben.
- [x] Wissenschaftliche Kaufprüfung/Abbuchung, geometrische Summen, ×10, MAX, Safe-Integer-Limits und ungültige Eingaben durch Regressionstests geprüft.
- [x] Gültige ältere Ledger-Paare bei Save/Reload normalisiert; beschädigte Saves bleiben geschützt, Saveversion und Economy-Regeln unverändert.
- [x] Typecheck und 222 betroffene Tests bestanden; numerische Präzision und Vorher/Nachher-Ergebnisse in `docs/scientific-purchase-audit.md` dokumentiert.
- [x] Production-Build und echte UI-Prüfung bestanden; vollständige Suite ausgeführt und Ergebnis dokumentiert: 559 bestandene Tests, drei bestehende Clock-Fehler, zwei bestehende Vite-Ladefehler und ein Runner-RPC-Timeout. Keine grüne Gesamtabnahme behauptet.

## Atomare Zutatenreservierung und sichere Spielstände (6. Oktober 2026)
- [x] Voraussetzung `47d706d` auf frisch abgerufenem `main` nachgewiesen; PR #64 ist gemergt. Eigener Folgebranch ohne offene PR-Abhängigkeit.
- [x] Fünferauftrag mit nur einem Compute-Bus und 1800 Data sowie importbedingten Produktionsabsturz mit echten Domainfunktionen reproduziert und behoben.
- [x] Gemeinsame Gesamtrezeptberechnung für Vorschau, Ressourcenprüfung, manuelle Reservierung, Queue, Planer und Validierung vorhandener Reservierungen.
- [x] Gültige Aufträge, Teilabschluss, Offline-Fortschritt, Stornierung/Erstattung und Ergebnisvergabe ohne Doppelvergabe durch Regressionen geprüft; Saveversion 40 unverändert.
- [x] Gemeinsame Save-/Load-/Importvalidierung gegen Kataloge, eindeutige IDs, Ausrüstungsreferenzen, Mengen und Zeitdaten; fehlgeschlagener Import erhält Spielstand und Savegenerationen.
- [x] Typecheck, 257 betroffene Tests einschließlich 71 neuer Regressionen, Production-Build und `git diff --check` bestanden.
- [x] Vollständige Abschluss-Suite durchgeführt und dokumentiert: 630 Tests bestanden; dieselben drei Clock-Assertions, zwei Vite-Ladefehler und ein RPC-Timeout wie im vollständigen Ausgangslauf. Keine grüne Gesamtabnahme behauptet.
- [ ] Grüne Gesamtsuite nach separaten Reparaturen der belegten Clock-, Vite- und RPC-Probleme.

## Einheitlicher Run-Start und Auto-Prestige (6. Oktober 2026)
- [x] Auftrag 1 (`47d706d`) und Auftrag 2 (`d9c8bb3`) auf tatsächlich aktualisiertem Main `484b5cb` bestätigt; eigener Branch ohne offene PR-Abhängigkeit.
- [x] Automatischen Stillstand mit echten Domainfunktionen reproduziert: nach Reset und 60 Sekunden weiterhin null Credits/null Hardware.
- [x] Zentraler Startvertrag für neue Spielstände, normales Prestige und Axiom-Reset: exakt 50 Credits, wissenschaftliches Ledger konsistent, null Hardware, keine Einnahme-/Umsatz-/INT-/Questbuchung.
- [x] Regulärer bezahlter erster Taschenrechnerkauf trotz 75-%-Reserve; danach normale Reserven. Freischaltung/Deaktivierung und verlorene INT-Unlocks nach Axiom-Reset bleiben wirksam.
- [x] Auto-Prestige ausschließlich über normale Transaktion und bei wirksamem automatischem Neustart; Mindestanspruch/-laufzeit, Warteoptionen, Timer, Offline-Gleichheit und Reload geprüft.
- [x] Zwei automatische Folgezyklen ohne Taps, Grants oder vorgekaufte Hardware ab Start des gemessenen Verlaufs nachgewiesen und vorbereitetes legales Account-Setup dokumentiert.
- [x] Deutsche/englische Vorschauen und konkrete Agent-Sperrgründe ergänzt; Typecheck, 335 betroffene Tests und Production-Build bestanden.
- [x] Vollständige Suite einschließlich Langzeitsimulation abgeschlossen und ehrlich dokumentiert: 658 Tests bestanden, fünf fehlgeschlagen, zwei Vite-Ladefehler und ein RPC-Timeout. Produktionscode unverändert; historische Test-Fixture danach separat verstärkt/nachgeprüft.
- [ ] Grüne Gesamtsuite: bestehende Clock-/Vite-/RPC-Probleme und zwei durch den vorgeschriebenen 50-Credit-Start neu verletzte Analyse-Kalibrierungsgrenzen. Keine Gegenkalibrierung oder Abschwächung der Tests.

## Technische Nachbesserung Run-Start / PR #66
- [x] Drei Clock-Fixtures mit echten bezahlten Hardwarekäufen repariert; tatsächliche Zeitdeltas, Offline-Limit, Reload und fehlende Produktion ohne Hardware geprüft (15 Tests).
- [x] Vite-URL-/SSR-Transformursache in beiden mobilen Suiten entfernt; alle 24 ursprünglichen UI-Tests ausgeführt und bestanden.
- [x] Synchrone Langzeitsimulation vom Runner-Kontrollloop getrennt, Horizonte/Profile unverändert und sequenziell; Heartbeat und vollständige Domain-Parität getestet.
- [x] Minimaler Neustart mit einzigem Shopping-Knoten, echtem ersten Kauf und positiver Produktion; Kommerzialisierung-250-Verlauf als technischer Ablaufnachweis gekennzeichnet.
- [x] Zwei damalige Analyse-Timingfehler reproduziert: 870 s statt mindestens 880 s; 50-Credit-Start als Ursache. Die damalige offene Entscheidung wird durch den unten dokumentierten neuen Zielvertrag ersetzt.
- Finale technische Abschlusszahlen stehen in Draft-PR #66 und der Übergabe; kein Merge, kein zusätzlicher PR. Die frühere Abnahme auf `22bc6fb` hatte 699 bestandene und zwei fehlgeschlagene Timingtests.

## Akzeptierter Analyse-Zielvertrag / PR #66
- [x] Nutzerentscheidung: übergeordnetes Early-Game-Ziel von 15–30 auf 14–30 aktive Minuten angepasst; Testfenster bisher 880–1800 s (zuvor gemessen 890), jetzt 840–1800 s (gemessen 870).
- [x] Ausschließlich die beiden Strategie-Analyseuntergrenzen geändert; echte Simulation, Ressourcenprüfungen und Start bei `t=0` ohne vorgeschaltete Offline-Produktion erhalten.
- [ ] Nun erreichte Ressourcen-Kalibrierungsassertions separat entscheiden: Forschungsgrenze 361 statt erwartet 313; zusätzlich gemessene Analysegrenze 57700 statt erwartet 59132. Diese Erwartungen bleiben in diesem Auftrag unverändert.
- Abschlussprüfungen auf dem finalen Commit und tatsächliche Ergebnisse im bestehenden Draft-PR #66 dokumentieren. Technische Testvalidität und optionale Langzeit-Balancebewertung bleiben getrennt; keine bestätigte Langzeitbalance aus einer grünen Suite ableiten.

## Auftrag 4 – Challenge-Isolation / Folge-PR zu #66

- [x] Eigener Branch ab `06d39de`; #66 noch offen, deshalb abhängiger PR gegen `codex/run-start-auto-prestige`; Vorgängerbranch unverändert.
- [x] Vollständiges Hauptspiel separat erhalten; Challenge startet mit 50 Credits/0 Hardware ohne Einnahmen-/INT-/Quest-Gutschrift.
- [x] Gemeinsame bestehende Simulation, passiver Hauptfortschritt und persistenter einmal konsumierter Zeitanker; reguläre Jobs/Reservierungen bleiben erhalten.
- [x] Erfolgssterne einmal, Abbruch ohne Belohnung, keine Challenge-Ressourcenübernahme; Reset-/Shop-/Claim-Sperren und DE/EN-Rückkehranzeige mit Abbruchbestätigung.
- [x] Save v41 mit gemeinsamer Validierung und transparenter Legacy-Wiederherstellung des noch bekannten Standes; beschädigte Imports und Originale geschützt.
- [x] Kurze gezielte Domain-/Save-/Lifecycle-/UI-Regressionen sowie mobiler Browsernachweis; keine Gesamtabnahme behauptet.
- [ ] Schicht-3-Referenzabweichungen und Langzeitbalance bleiben separat offen. Historisch verlorene Hauptstände alter Challenge-Saves können nicht rekonstruiert werden.

Ursache, Zeit-/Zustandsvertrag, tatsächlicher Prüfumfang und Grenzen: [Audit](challenge-isolation-audit.md).

## Auftrag 5 – gemeinsame Vorschauen und Balanceexport

- [x] Reine gemeinsame Kosten-/Ressourcenhelfer und echte Transaktionsregressionen.
- [x] Produktionsfaktoren aus derselben Berechnung, wissenschaftlicher Snapshot für UI/Diagnose/Export.
- [x] Lokaler ZIP-Export mit Kontext-/Auftragszuordnung, Reservierungen, Startkapital und Messlücken.
- [x] Kurze gezielte Prüfungen und mobile DE/EN-Details; siehe `preview-export-audit.md`.
- [ ] Gesamtabnahme/Langzeitbalance und bekannte Schicht-3-Referenzabweichungen bleiben separat offen.

## Auftrag 6 – vorhandene Mechaniken bedienen

- [x] Vier Inventarbereiche, Modulrezepte/Reservierungen und konkrete Zutatenquellen.
- [x] Einzelne Itemdetails, bezahlte wirksame Verbesserungen, bestätigte Fusion mit Instanzschutz.
- [x] Vorhandene Forschungsqueue mit Reload/Entfernen; Kurz-/Langanalysen und unabhängiger Slot.
- [x] Werkstatt → Equipment; Axiom-Navigation, 44-px-Ziele und Browsermatrix 360/390/430 DE/EN mit Screenshots.
- [x] Kurze gezielte Tests, Typecheck, Build und Diffprüfung; siehe `mechanics-ui-audit.md`.
- [ ] Trainings- und feste Typbelohnungen ohne Verbesserungsskalierung bleiben ausdrücklich offen; keine Ersatzmechanik erfunden.
- [ ] Dedizierte Modulillustrationen, Schicht-3-Referenzentscheidungen und Langzeitbalance bleiben separat offen.

## Auftrag 7A – Core Loop und Compute-Nutzung

- [x] Volle Compute-Rate für Users; keine Profilaufteilung oder konkurrierende Kapazitätsformel.
- [x] Training/Forschung/Analysen parallel bei unveränderten Kosten und festen Zeiten.
- [x] Gemeinsame Domain-/UI-/Exportzerlegung, volle Auslastung und DE/EN-Hinweis; alte Profile save-kompatibel.
- [x] Kurze echte Domainregressionen und vorbereiteter Vorher/Nachher-Vergleich; siehe [Audit](core-loop-audit.md).
- [ ] Wirkungslose Trainingsboni für Auftrag 7B, bekannte Schicht-3-Referenzabweichungen und Langzeitbalance bleiben separat offen.

## Auftrag 7B – wirksame Trainingskostenboni

- [x] Gemeinsame wissenschaftliche Data-Startkosten: vorhandene Beiträge addiert, Faktor max(0,5; 1/(1+B)), erst Endkosten aufgerundet.
- [x] Tatsächliche Item-/Meilenstein-/Graph-/temporäre Trainingswerte angebunden; keine erfundenen Quellen.
- [x] Kostenbasis gespeichert/protokolliert, Queue prüft beim Start; laufende Jobs und Zeiten bleiben unverändert, Legacy-Saves erhalten.
- [x] DE/EN-Kosten-/Rabatt-/Itemvergleich, wirksame Verbesserungen bedienbar; Snapshot und Export identisch.
- [x] Kurze echte Transaktions-/Queue-/Reload-/Großzahltests, Typecheck, Build und Diffprüfung; [Audit](training-cost-audit.md).
- [ ] Relay-/Archiv-Skalierung, Schicht-3-Referenzabweichungen und Langzeitbalance bleiben separat offen.

## Auftrag 7C – permanente Forschungsbereiche

- [x] Anfangsbereich mit drei Projekten; alle 21 Research-IDs eindeutig vorhandenen Bereichen/Nodes zugeordnet.
- [x] Regulärer Node-Kauf öffnet Accountzugang einmal; gemeinsame Prüfung in Domain/Queue/Autostart/Vorschau/UI.
- [x] Zugang bleibt bei Prestige/Axiom/Reload; evidenzbasierte Legacy-Migration samt Challenge-Hauptzustand, keine Challenge-Vererbung.
- [x] DE/EN-Bereiche, kompakte Abschlüsse und eine deterministische Preview mit echtem Node-Detail-Link; erste Analyse/Crafting erreichbar.
- [x] Kurze gezielte Tests, Typecheck, Build, Diffprüfung und Browser 390 px DE/EN; [Audit](research-area-audit.md).
- [ ] Schicht-3-Referenzabweichungen, Relay-/Archiv-Skalierung und Langzeitbalance bleiben separat offen.

## Auftrag 8A – Credit-Hardware und Sparziele

- [x] Alle 15 Klassen mit tatsächlichem Preis erreichbar; Kauf allein gegen Credits, Discovery und Klassenfolgen erst bei realem Kauf; bestehende Challenge-/Automationregeln erhalten.
- [x] Gemeinsame wissenschaftliche Klassen-/Meilenstein-Sparziele, Fehlmenge/finite ETA/echte Wirkung und richtige Detailnavigation.
- [x] Frische Domainmessung A/B, exakt drei begrenzte Preisrunden; nur fünf baseCost geändert. A: SBC 3:30, PC 13:10, GPU 31:50, Rig 52:50 im neuen Fenster.
- [ ] Server ≥90 Min nicht erreicht: 52:30; unveränderter Farm-Preis/Compute erzeugt Konflikt. Keine zusätzliche Sperre eingeführt.
- [x] Kurze gezielte Tests, Typecheck, Build, Diffprüfung; Browser 360/390/430 DE/EN. [Audit und Daten](hardware-early-audit.md).
- [ ] Schicht-3-Referenzabweichungen, Relay-/Archiv-Skalierung und Langzeitbalance unverändert separat offen; keine Gesamtabnahme.

## Auftrag 8B – Server/Farm-Sparphasen

- [x] Nur zwei Basispreise geändert; sämtliche anderen Economy-/Kaufregeln unverändert.
- [x] Drei begrenzte Preisrunden, 180-Minuten-Domainmessung A/B; A Rig 52:10 / Server 116:30 / Farm 171:40, B Server 76:40 / Farm 140:10: alle neuen Vorgaben im Messprofil erfüllt.
- [x] Getrennte Ziel-Sparfenster und Kaufabstände, echte Ratenzuwächse/Meilensteine/1-und-3-INT-Beobachtung ohne Reset; Ratenzeitparameter korrigiert.
- [x] 81 gezielte Hardware-/Vorschau-/ScientificNumber-Tests, Typecheck, Build und Diffprüfung bestanden.
- [ ] Keine Langzeitbalance: Schicht-3-Referenzabweichungen und Relay-/Archiv-Skalierung bleiben offen.

## Auftrag 8C – Integration 8B und erster attraktiver Prestige

- [x] Neuer Branch auf gefetchtem main 600ca6d; fehlende 8B-Nachbesserung konfliktfrei übernommen, Server/Farm 15 Mrd./120 Mrd., Vorgänger/geschlossenen PR #75 unverändert.
- [x] Ausschließlich prestigeBaseRevenue aus echtem SCI-Umsatz bei 60:00 ÷9 abgeleitet; keine Anspruchs-/Bonus-/Baum-/Axiomformel verändert.
- [x] Gleicher Parameter und echter gemeinsamer No-Prestige-Profilpfad: A 3 INT 60:00, B 59:14; 1 INT 45:14/44:56 ohne Zeitgate.
- [x] Regulärer 3-INT-Reset, Einkaufsagent regulär für 1 INT, 25-%-Reserve, bezahlte Autobuyer-Käufe und frühe 10er-Meilensteine im kurzen neuen Run; [Audit](first-prestige-audit.md).
- [ ] Keine bestätigte Langzeit-/Axiombalance; Schicht-3-Referenzen und Relay-/Archiv-Skalierung bleiben separat offen.
- [x] 91 gezielte Prestige-/Reset-/SCI-/Hardwaretests, Typecheck, Build und Diffprüfung bestanden; kein pauschales npm test.

## Auftrag 9A – Impulsrelais/Erkenntnisarchiv

- [x] Feste Spezialwerte durch kanonischen Common-Level-0-Forge-0-Quotienten ersetzt; Relais vergüteter Tap 10 / Archiv nur zukünftige berechtigte Buchungen.
- [x] Tatsächliche Ausrüstung/No-Items und bestehende Stapelungs-/Reset-/Fusionsregeln erhalten; bezahlte Upgrade-/Forgewege jetzt wirksam bedienbar.
- [x] Gemeinsame DE/EN-Quotes/Before-After in Details/Equipment/Export, getrennte Haupt-/Challenge-Kontexte und begrenzte aktuelle Quotezeilen.
- [x] 92 gezielte Tests, Typecheck, Build, Diffprüfung; mobile 390 px DE/EN mit tatsächlicher Verbesserung bestanden. [Audit](special-items-audit.md).
- [ ] Schicht-3-Referenzabweichungen und optionale Langzeit-/Axiombalance bleiben offen; technische Verbesserung bestätigt keine natürliche Progression.

## Auftrag 9B – permanente gelernte Baupläne

- [x] Unveränderte Katalogwerte als einmaliger Lernpreis; reine gemeinsame Quote und atomare explizite Lernaktion mit Doppelklickschutz.
- [x] Fragmentfreie Herstellung bei unveränderten Komponenten-/Modul-/Data-/Zeitkosten; Queue/Planer verlangen Besitz und lernen nichts ungefragt.
- [x] Save 42: belegte Altbesitzmigration einschließlich reservierter Aufträge, dauerhafter Reset-Erhalt, getrennte Challenge-/Hauptkontexte und beschädigte Saves geschützt.
- [x] DE/EN-Lernbestätigung/Status und getrennte Exportereignisse/Besitz-/Herstellungskosten; bestehende Grenzen erhalten.
- [x] 174 kurze gezielte Tests, Typecheck, Build, Diffprüfung und mobile 390 DE/EN mit Lernen/zwei bezahlten Aufträgen; [Audit](blueprint-learning-audit.md).
- [ ] Keine natürliche Progression oder Langzeit-/Axiombalance bestätigt; bekannte Schicht-3-Abweichungen bleiben offen.

- [x] 9B.1: Alte englische Screenshotabweichung reproduziert; responsive Zutatenkarten mit Icons/Name/Bestand/Bedarf/Fehlmenge, 360/390/430 DE/EN und alle sechs Item-/zwei Modulrezepte geprüft. [Audit und Diagnosegrenze](blueprint-learning-audit.md#auftrag-9b1--mobile-zutatenkarten).

## Auftrag 9B.1 – mobile Zutatenbeschriftungen

- [x] Darstellung auf gemeinsamem reinem Ingredient-Baustein: eigener Icon-/Texttrack, min-width:0, vollständiger Umbruch, eine/zwei Spalten bei 390 px.
- [x] 438 reguläre Karten-Geometrieprüfungen und 390 lange Anzeigetextprüfungen; echte Lern-/Item-/Modulaktionen in sechs mobilen Kombinationen.
- [x] Sechs kurze UI-Tests, Typecheck, Build, Diffprüfung; Vorher/Nachher-Screenshots und Audit ergänzt, bestehender PR #78 aktualisiert.
- [ ] Der ursprüngliche browserinterne Paintauslöser ist nicht vollständig isoliert; keine unbewiesene DOM-Overflow-Ursache behaupten. Bekannte Balancegrenzen unverändert.


## Auftrag 9C – vollständiger Itemrezeptkatalog (11. Oktober 2026)

- [x] Alle elf Itemtypen besitzen genau ein gültiges Rezept; ausschließlich fünf neue Rezepte in festgelegter Reihenfolge/Werten. Sechs alte Rezepte und alle Itemeffekte gegen origin/main geprüft.
- [x] Offene Baupläne abgeschlossen / einmaliges Lernen / dauerhafter Besitz getrennt; zentrale atomare Herstellung, Queue, Planer, Zielanheftung und Export.
- [x] Historische Altbesitz-Migration über vollständigen Katalog; aktuelle Funde lernen nichts, Inventarinstanzen und Haupt-/Challenge-Isolation erhalten.
- [x] DE/EN mit Common-Ergebniseffekten und responsive Zutatenkarten aus #78; 390px alle fünf Karten, Sperren/Lernen und tatsächlicher Craft/Reload, keine Zutatenabschneidung oder horizontale Überbreite.
- [x] 174 gezielte Tests, Typecheck/Build/Diffcheck, vorbereiteter regulärer technischer Nachweis für alle fünf; tatsächliche Quellen für alle Zutaten dokumentiert. [Audit und Prüfabweichung](item-recipes-audit.md).
- [ ] Natürliche Erreichbarkeit und Balance des vorgegebenen Ausgangskatalogs nicht bestätigt; keine Parametersuche. Draft prüfen, nicht mergen.


## Auftrag 1 – bestätigte technische Bugs (11. Oktober 2026)

- [x] Fünf Befunde auf aktuellem main 7b265cb zuerst mit Domainfunktionen reproduziert; neuer Branch ohne Vorgängeränderung.
- [x] Dauerhafte belegte Slots aus Node-/Creditkäufen, gemeinsame Slotfunktion, Axiom/Prestige/Serialize/Reload und getrennte Migration.
- [x] Aktions-/Lifecycle-/Savezeit einmal aktiv/passiv; höchste Hardware-Discovery, unabhängiger Archivzähler mit jedem vierten Duplikat.
- [x] Wissenschaftliche zeitabhängige Intervallgutschrift und Prestige-/Axiomvorschauen/Payout/Käufe, valide Fixtures über 1e308 ohne wirtschaftliche Clamps.
- [x] Gezielte kurze Domain-/App-Regressionen, Typecheck, Production-Build und Diffcheck; unveränderte BALANCE-JSON. CI dieses PRs kurz begrenzt, Typecheck/Build erhalten. [Audit](technical-bugs-audit.md).
- [ ] Historisch unbelegbarer Slotbesitz/Itemverlust nicht rekonstruierbar; bestehende Mantissen-/Bundle-/Balancegrenzen erhalten. Draft prüfen, nicht mergen.

## Auftrag 2 – vollständige Forschungsintegration, 11. Oktober 2026 — Erledigt (technische Abnahme)

- [x] 26 IDs, fünf Themen, genau drei Startprojekte; dauerhafte projektgenaue Prestige-Zugänge und getrennte Legacy-/Challenge-Migration.
- [x] Gemeinsamer wissenschaftlicher researchQuote mit angewendeten Laborquellen, Mindestdauer und eingefrorenen bezahlten Aufträgen; historischer Research-Points-Bestand ohne weitere Produktion.
- [x] operations/alignment/labAutomation/autonomousScience und alle fünf vorgegebenen Schlüsselprojekte haben tatsächliche zentrale Verbraucher.
- [x] Reguläre labs2-Queue, endliche labs3-Wiederholung und labs4-Forschungsdirektor mit explizitem Budget/Reserve/Priorität im gemeinsamen Zeitpfad.
- [x] Training-/Analyse-/Craftingquotes, Recyclingreste, Resetvertrag, Save 44, Ziele und Economy-Export integriert; übrige Parameter geschützt.
- [x] Alle 26 bezahlten Domainstarts/Reload/Abschlüsse in vorbereiteten Fixtures; kurze Regressionen, Typecheck, Build, Diffcheck und Browser 360/390/430 px DE/EN.
- [ ] Natürliche Erreichbarkeit und Monatsbalance der vorläufigen Schlüsselpreise nicht bestätigt; keine Langkampagne beauftragt oder ausgeführt.

[Audit und Rohdaten](research-integration-audit.md). Technischer Abschluss bedeutet keine grüne Langzeitbalance.

Auftrag-2-Implementierungscommit `e9f9e35`, Draft-PR [#82](https://github.com/Kayza1708/Idle-game-/pull/82) gegen main; nicht gemergt.

## Auftrag 3 — Data-Economy und Analyseverträge — technische Integration erledigt, Konkurrenzziel offen

- [x] Unbegrenzte wissenschaftliche Data-Softbonusformel, zentrale Quote und tatsächliche DE/EN-Vergleiche.
- [x] Sechs festgelegte Analysepreise, Kurzfaktoren nach Grunddauerverhältnis, separate Pipeline/Garantien, persistente Bruchteile.
- [x] Save 45: historische Verträge unverändert, Hauptspiel/Challenge getrennt, ungültige aktuelle Verträge abgewiesen.
- [x] Vorhandener Director/Budget/Reserve geschützt; gemeinsamer Data-Bestand erklärt.
- [x] Erste Forschung und kurze Hardwareanalyse in zwei echten frischen Profilen binnen 90 aktiven Minuten, eine Tapaktion pro Sekunde.
- [x] 298 gezielte Regressionen und DE/EN-Browserprüfung 360/390/430 px ohne horizontale Überbreite.
- [ ] Dauerhaft knappe Data und Konkurrenz aller vier Ausgabefamilien: nicht bestätigt; Profile enden mit 653.652 / 568.826 Data, Crafting in dieser Policy nicht erreicht.
- [ ] Natürliche Langzeitbalance, vollständige Gesamtabnahme, reale Safari-/Native-Prüfung.

Abhängig von PR #82 `d8d5a29`; keine automatische Integration. Nachweis: `data-analysis-audit.md` und Rohmessungen.

## Auftrag 4 — Item-Grind und Bauplan-Meisterschaft — technische Integration und begrenzter Spielerpfad

- [x] Quellenmatrix für alle elf kanonischen Itemtypen vor der Implementierung erfasst; explizite Familienzuordnung und feste Zusatzpreise je Zielseltenheit zentral.
- [x] Atomare ScientificNumber-Aufwertung mit vollständigen Fehlmengen/Effektquotes; bisherige Schaltkreis-/Dataformeln, Forge und geschützte Fusion erhalten.
- [x] Permanente Meisterschaft 0–4 (10/25/60/150 Fragmente), nach regulärem Craft; Rundung je Exemplar, eingefrorene Reservierungen und Recycling aus tatsächlich bezahlten Mengen.
- [x] Manuelle 10:1-Fragmentumwandlung erst nach allen drei regulären Durchbrüchen; sichere Mengen, aktuelle Bestände und Revision gegen veraltete/doppelte Tickets.
- [x] Bestehende Fünf-Typen-Sammlerwirkung verwendet tatsächliche permanente Materialentdeckungen; keine zusätzliche Wirkung oder Änderung der Dropquellen.
- [x] Bestehende DE/EN-Details mit Quellen, Kurz-/Langanalyse, einzelnen Zielen und erhaltenen Instanzen; gebündelte Online-/Offline-Anzeige, bestehendes Audio/Haptik.
- [x] Save 46, konservative Altbelege, beide tatsächlichen Resets/Reload und Challenge-Isolation; zentrale Exportquotes mit bestehenden Schutzgrenzen.
- [x] Gezielte Tests, Typecheck/Production-Build/Diffcheck; Browser 360/390/430 px DE/EN mit bezahlter Aufwertung, Meisterschaft und Herstellung, Reload und mindestens 44 px für neue Touchziele.
- [x] Genau zwei frische 120-Minuten-Profile ohne Grants/freie Freischaltungen; beide erste Relaisherstellung, Gesamtrechenzeit 36,160 s.
- [ ] Natürliche Erreichbarkeit aller Meisterschaften/seltenen Builds und langfristige Data-/Fragment-/Monatsbalance. Beide Profile erreichen Meisterschaft 1 nicht: zehn Fragmente fehlen; Data am Ende reichlich vorhanden.

[Quellen, Verträge, konkrete Vorher/Nachher-Werte und Grenzen](item-grind-audit.md). Basis finaler offener #83-Head, abhängig von #83 und #82; Vorgänger unverändert, kein Merge.

[Draft-PR #84](https://github.com/Kayza1708/Idle-game-/pull/84), Implementierung `23659632f4de6ba74aee92f877db81984f4dcc48`; kurze CI am Implementierungscommit grün. Weiterhin abhängig von #83/#82, nicht gemergt.


## Auftrag 5 — Materialwirtschaft, 30 Geräte, Schmieden, Challenge-Stufen — technisch erledigt (12.10.2026)

- [x] 20 stabile Materialien, bezahlte dauerhafte Zugänge, alte Bestände/Quellen erhalten; zentrale Fokus-/Paket-/Quellenquotes.
- [x] 15 Klassen ×6 bezahlte Kanten, Bulk-/Run-/Reload-/Migrationsschutz und zusätzlicher bezahlter Klassenupgrade ohne neue Preisformel.
- [x] Belegte Komponentenbasis, Fusion ohne Vervielfachung, 60-%-Gesamtbudget einschließlich Craft-Recycling; 3/5-Budget auch am maximalen sicheren Integer exakt zerlegt.
- [x] 30 Itemtypen mit realen Verbrauchern; 19 neue Rezepte/Entdeckungen, Lernen und Meisterschaft getrennt und permanent.
- [x] Drei permanente Schmieden ×5 Stufen, eingefrorene bezahlte Aufträge, zwei unbezahlte Wartestellen, Reseterhalt.
- [x] Zehn Familien ×69 wissenschaftliche versionierte Ziele, Kapitelregeln, erlaubte kopierte Loadouts, getrennte Produktion, einmalige Rewards und sichtbare vorhandene Automationsoptionen.
- [x] Save v47/Migration, Resetvorschauen, Auftrags-/Quellen-/Zielanzeigen, DE/EN, Export, bestehende Audio/Haptik integriert.
- [x] 531 unterschiedliche gezielte Regressionstests in 23 Dateien (528 im abgegrenzten Lauf/57,11 s, anschließend 97 im Nachlauf/3,83 s einschließlich drei neuer Ausrüstungs-Bulkregrressionen); Typecheck, Production-Build, Diffcheck; Browser 360/390/430 px DE/EN ohne Seitenüberbreite.
- [ ] Natürliche Material-/Schmiede-/69-Stufen-Progression und Langzeitbalance kalibrieren (kein Nachweis dieses Auftrags).
- [ ] Eigene Grafiken für 19 neue Geräte, zehn neue Materialien und umbenannte Memristor-Arrays; aktuell ehrliche neutrale Symbole.
- [ ] Echter Bonuskistenfluss separat spezifizieren; dieser Auftrag bereitet nur den zentralen Grant vor.

Nachweise und ausdrücklich dokumentierte Ausgangswerte: [Audit](material-builds-audit.md), [vollständiger Katalog](material-builds-catalog.json), [Domain](material-builds-proof.json), [Browser](material-builds-browser.json).

## PR #85 correction — challenge contracts and recovery

- [x] Fusion retains the explicitly selected first base instance, level/Forge/counter and paid material receipts.
- [x] New analysis contracts retain fractional yields per material across reload and resets; old pending contracts retain payout policy.
- [x] New catalogue v2 uses bounded Quality/Efficiency prerequisites, distinct science/supply objectives, real entry progress and selectable network edges. Running v0/v1 challenges remain intact.
- [x] Shared automation depends on total first completions; prior options are retained. Passive, Mastery and network rewards differ.
- [x] Save v48, quotes, DE/EN rendering, regression coverage and economy documentation updated.
- [x] Two genuine two-hour early profiles: first Relay 22:30 / 21:30; no grants or claims. Three equal prepared build comparisons expose tradeoffs, not natural unlock timing.
- [ ] All 690 natural completions, late item/foundry timings and long-term build dominance remain uncalibrated.
- [ ] New visual/mobile browser validation remains open (Chromium download unavailable).
- [ ] Existing main-wide regression failures remain: broad baseline comparison has the same 30 failures and no new failures; both full-suite attempts timed out at 300 seconds.

See [correction contracts](challenge-corrections.md), [checks](challenge-correction-checks.json), [early profiles](challenge-correction-early-profiles.json) and [prepared build comparison](challenge-correction-build-comparison.json). No merge/release or new SDKs.
