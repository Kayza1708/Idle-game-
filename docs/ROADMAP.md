# Verbindliche Entwicklungsroadmap

Statuswerte: **In Arbeit**, **Geplant**, **Erledigt**. Der Status und `NEXT_STEPS.md` werden am Ende jedes Auftrags aktualisiert; unerledigte Kriterien bleiben offen.

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
- [ ] Erste Hardwareanalyse nach 15–30 aktiven Minuten: gemessen sind 20 Sekunden.
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
