# Verbindliche Entwicklungsroadmap

Statuswerte: **In Arbeit**, **Geplant**, **Erledigt**. Der Status und `NEXT_STEPS.md` werden am Ende jedes Auftrags aktualisiert; unerledigte Kriterien bleiben offen.

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
