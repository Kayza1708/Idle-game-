# Übergabe und nächste Schritte

## Aktueller Stand

Save v9 ergänzt sechs individuelle Meilensteine pro Hardwareklasse, additive INT-Progression, einen funktionsorientierten INT-Baum, lokale Run-Telemetrie und gespeicherten Story-/Tutorialfortschritt. Alle 90 Meilensteine liegen in der zentralen Hardwarekonfiguration.

## Letzter abgeschlossener Arbeitsauftrag

Der kurze Mira-Prolog, das überspringbare handlungsbasierte Tutorial, einmalige Fortschrittsdialoge und Miras Journal sind implementiert. Dialoge werden einzeln geordnet, blockieren die Simulation nicht und bestehende Saves überspringen den Prolog bei der v9-Migration.

## Bekannte Einschränkungen

- Module/Loadouts, deterministische Durchbruchswahlen, Prototyp-Items und Axiome sind dokumentierte Folgeschritte, keine fertigen Menüpunkte.
- Klassen 6–15 besitzen eigene Illustrationen, Rollen und Meilensteine; die Nebeneffekte Automation, Overclock, Offline und Synergie sind teilweise erst als Konfigurationsvertrag vorbereitet.
- Die aktuellen Tabellen in `balance-report.md` sind eine Vergleichsbasis der vorherigen Phase-1.1-Kurve; nach der Compute-Aufteilung ist ein neuer vollständiger Simulationslauf erforderlich.
- Für vor Save v8 liegende Kampagnenabschnitte existieren keine nachträglich rekonstruierbaren Ereignis-, Quellen- oder Offlinewerte; Exporte markieren diese Bereiche als nicht verfügbar.
- `mira-voss.png` war im bereitgestellten Repository-Stand weder im Root noch an anderer Stelle im Dateisystem vorhanden. Die Dialogkomponente verweist bereits ausschließlich auf den geforderten Zielpfad `public/assets/game/mira-voss.png`; die Originaldatei muss dort noch ergänzt werden, bevor die visuelle Abnahme erfüllt ist.
- Registry-Zugriff auf `vitest` antwortet in dieser Umgebung mit HTTP 403. Deshalb konnten `npm ci`, Vitest, Production-Build, Audit und Browser-Screenshots nicht ehrlich abgeschlossen werden. TypeScript-Typecheck lief erfolgreich.

## Nächste drei priorisierte Aufgaben

1. Den Forschungsabschluss-Fix zusätzlich auf einem betroffenen Mac in Safari verifizieren und den dortigen Crash-Bericht mit der neuen Abschlussphasenfolge vergleichen.
2. Den ausgeführten v7-Kontrolllauf als eingechecktes Simulationswerkzeug ausbauen und Forschungsbedingungen der späteren Klassen kalibrieren.
3. Phase 2 mit drei Modulsockeln, gespeicherten Loadouts und deterministischen Durchbruchswahlen implementieren.

## Übergabe Forschungsabschluss-Freeze – 24. September 2026

Der konkrete Stillstand lag im Abschlussblock des Simulationskerns. Bei
`next.researchLabs = next.researchLabs.map(...)` wurde das Zuweisungsziel vor dem
Callback ausgewertet. Der Callback ersetzte `next` beim Schreiben des Telemetrie-
Ereignisses; das anschließend erzeugte Array mit leerem Slot landete deshalb auf dem
alten Objekt. Im aktuellen Zustand blieb das abgelaufene Projekt aktiv, erzeugte in
jeder Mikroiteration erneut Zähler und Ereignis und erreichte nach 200.000 Iterationen
den Sicherheitsabbruch, der den ursprünglichen Zustand zurückgab. Das sah im Browser
wie ein reproduzierbarer Freeze genau beim ersten Forschungsabschluss aus.

Der Abschluss entfernt nun alle fälligen Slots zuerst in einem neuen Zustand und
vergibt Freischaltung/Zähler/Ereignis danach genau einmal. Eine explizite Phasenfolge
deckt Projektende, Belohnung, Freischaltung, Queue, Missionen/Achievements und Übergabe
an Save/Render ab. Direkter und automatischer Neustart bereits abgeschlossener Projekte
ist gesperrt. Regressionstests decken aktive und Offline-Zeit, Queue, Reload kurz vor
Ende sowie genau ein Abschlussereignis ab.

## Letzter tatsächlich ausgeführter Teststand

Am 24. September 2026 waren Typecheck und der kompilierte v7-Economy-Kontrolllauf erfolgreich. Der Kontrolllauf maß erste INT nach 22:52 aktiv beziehungsweise 115:15 passiv. Vitest/Build bleiben vom Registry-HTTP-403 abhängig; kein erzwungenes Audit-Fix wurde eingesetzt.

## Offene Designentscheidungen

- Rollen/Synergien und Freischaltbedingungen der Klassen 6–15 nach echten Langzeitmessungen.
- Konkrete Opportunitätskosten der vier geplanten Labor-Builds.
- Anforderungen und Resetumfang des späteren Axiom-Layers.

## Übergabe 24. September 2026 – Laborgrundlage

- Die vom Nutzer bereitgestellte Originaldatei liegt geprüft als PNG unter `public/assets/game/mira-voss.png`; Dialoge verwenden `/assets/game/mira-voss.png`.
- Save v10 migriert v9 verlustfrei um drei leere Laborslots und die Zahl gekaufter Slots. Laufende Forschung speichert absolute Simulationszeitpunkte und wird durch denselben Offline-Simulator wie Training und Experimente abgeschlossen.
- Die aktuelle Forschungsformel lautet `180 s × 1,30^Rang` (Ränge 0/8/20). Sie deckt derzeit Minuten bis etwa 9,5 Stunden ab; Tagesprojekte und belastbare Mehrprestige-Simulationen bleiben offen.
- Nicht abgeschlossen sind Big-Number-Arithmetik bis 10^1.000.000, vollständiges DE/EN-i18n, Audio, Crafting-Timer, Forschungswarteschlange/-automation und die vollständige Prestige-Karte. Diese Punkte benötigen eigene, getestete Ausbauschritte und werden nicht als geliefert behauptet.
- `npm run typecheck` war vor dem Installationsversuch erfolgreich. `npm ci` scheiterte danach am Registry-HTTP-403 für Vitest und entfernte dabei die unvollständigen lokalen Module; Tests, Build und Browser-Screenshot konnten deshalb in dieser Umgebung nicht erneut ausgeführt werden.

## Übergabe 24. September 2026 – Audio

- `idle-loop` sowie sieben Ereigniseffekte liegen in OGG, MP3 und WAV unter `public/assets/audio/`; die Laufzeit verwendet OGG mit MP3-Fallback und lädt WAV nicht regulär.
- Musik startet nur über den Audio-Schalter, pausiert bei verborgenem Tab und ist separat regelbar. Effektlautstärke und Stummschaltung sind ebenfalls in Save v11 gespeichert; v10 wird mit sicheren Standardwerten migriert.
- Kauf, Freischaltung, Forschungsabschluss, Prestige, Gem-Abholung und Fehler sind getrennt zugeordnet. UI-Klicks werden gedrosselt; Simulations-Ticks und bloße Ressourcenänderungen lösen keinen Sound aus.

## Übergabe 24. September 2026 – Save v12 und Diagnose

- Reproduzierter konkreter Fehlerpfad: Ein gültiger v11-Spielstand wurde migriert, doch ein Fehler beim Schreiben der Backup-Kopie fiel in denselben äußeren `catch` wie `getItem` und zeigte fälschlich „konnte nicht gelesen werden“. Laden und Backup sind nun getrennt; bei fehlender Sicherungsmöglichkeit bleibt Autosave gesperrt und das Original kann heruntergeladen werden.
- Beschädigte und inkompatible Daten bleiben unangetastet. Recovery bietet Originaldownload und validierten manuellen Import; erst nach erfolgreichem Import wird Schreiben wieder aktiviert.
- Offen: weitere reale Exporte sammeln, bevor zusätzliche Forschungsprojekte oder größere Kurvenänderungen beschlossen werden. Die 1,08 Mio. FP sind wegen dauerhaft zugewiesenem Forschungs-Compute und nur 525 FP bestehender Projektausgaben plausibel, zeigen aber eine Inhaltslücke.
- Die vorgeschriebenen Abhängigkeitschecks sind in dieser Umgebung weiterhin durch Registry-HTTP-403 für `vitest` begrenzt; TypeScript konnte vor dem fehlgeschlagenen `npm ci` erfolgreich ausgeführt werden.

## Übergabe 24. September 2026 – neuer INT-Baum

Die Spezifikation wurde seriös bis einschließlich Stufe 3 vertikal umgesetzt (13 funktionierende Knoten). Der alte Baum wird in Save v13 entfernt und vollständig zurückerstattet. Stufen 4–7 sind bewusst nicht als Buttons vorhanden. Nächster Ausbau ist Stufe 4 mit ROI-Agent, echter Run-Durchbruchswahl und zwei Challenges; erst danach Stufe 5.

Die bestehende v7-Kontrollmessung bleibt die letzte reproduzierbare Langmessung: erste INT nach **22:52 aktiv** bzw. **115:15 passiv**. Die neuen Knoten wirken erst nach einem Prestige und verändern diese erste Anspruchsschwelle daher nicht. Vor dem ersten Prestige lag die reguläre Kurve im frühen Hardwarebereich; die 20-Mrd.-Credit-Cloudklasse liegt über dem für 1 INT nötigen berechtigten Umsatz und soll nicht regulär davor erreicht werden. Neue Mehrprestige-Messwerte konnten in diesem Auftrag nicht ehrlich erzeugt werden, weil `npm ci` weiterhin am Registry-403 für Vitest scheitert und dabei die lokalen Build-Werkzeuge entfernt. Dies ist eine Messlücke, kein Nachweis von Spielspaß.

## Übergabe 24. September 2026 – Achievements, Aufträge und Gems

Save v14 migriert v13 ohne Verlust von Gems oder Achievement-Punkten und ergänzt konservativ neue Lifetime-Zähler. Der Browser bietet ausschließlich Käufe mit erspielten Gems. Echtgeldpakete besitzen stabile IDs, aber absichtlich weder Preis noch aktiven Kaufpfad: Native Hülle, Store-SDK, Account und verifizierender Server fehlen.

Das rechnerische Vollteilnahmebudget beträgt bei 30 Tagen rund 675 Gems/Monat. Der erste 900-Gem-Laborplatz liegt ohne einmalige Achievements bei ungefähr 40 Tagen. Als nächstes sind reale mobile Abschlussquoten und die Zeit bis 900 Gems zu messen; erst danach Ziele oder Preise ändern.


## Übergabe 24. September 2026 – Stabilität, Training und Analyse

Training verwendet reale Arbeitszeit und exponentielle Ziele ab 90 Sekunden; beide Pfade haben getrennte Kosten. Saves werden temporär geschrieben, vollständig validiert und mit drei Generationen abgesichert. Große Zeiträume laufen iterativ in höchstens 60-Sekunden-Schritten. Der lokale ZIP-Bericht enthält elf Analyse-Dateien ohne Upload. Die mobile INT-Ansicht verwendet eine kompakte Leiterplatte und ein touchfreundliches Detailfenster. Offen bleibt die tatsächliche fünfminütige Browser-/Geräteabnahme.

## Korrektur nach Langzeit-Reproduktion – 24. September 2026

Ein automatisierter Kernlauf mit 36 Käufen, 34 Trainings, wechselnder Online-/Offline-
Simulation, Save/Reload, Backup-Recovery und ZIP-Export simulierte 981.240 Sekunden.
Ein vollständiger UI-Freeze ließ sich ohne echten Browser nicht reproduzieren. Es wurde
aber eine konkrete Main-Thread-Last identifiziert: 11.692 vollständige Snapshots machten
den Save 7,28 MB und den ZIP-Export 4,18 MB groß; Simulation plus Export benötigten
21,28 Sekunden. Die begrenzte, ältere Daten automatisch ausdünnende Snapshot-Reihe
reduziert denselben Lauf auf 1.692 Snapshots, 1,51 MB Save, 1,19 MB ZIP und 13,04
Sekunden bei 35,04 MB Heap-Zuwachs. Damit ist die Datenexplosion korrigiert; eine reale
fünfminütige Browserprüfung bleibt offen.

Python `zipfile` und `unzip -t` lasen alle elf Dateien und bestätigten sämtliche CRCs.
Die Ursache des zuvor defekten Archivs waren falsch dimensionierte bzw. falsch belegte
Central-Directory-Header im handgeschriebenen ZIP-Writer.

## Übergabe Crash-Diagnose und Lifecycle – 24. September 2026

- Ein vom Game-Save unabhängiger, hart begrenzter Crash-Bericht überlebt beschädigte
  Spielstände und kennzeichnet ungewöhnlich beendete Sitzungen beim nächsten Start.
- Fehlerquellen werden als Exception, langsamer Tick, langer Save, Heartbeat-Ausfall,
  Savefehler oder unbekannte Ursache unterschieden. Begin-/End-Marker vermeiden falsche
  Kausalitätsbehauptungen.
- Ein Worker kann einen zeitweise blockierten Hauptthread nach dessen Erholung erkennen.
  Einen vollständigen Browser-/Prozessabsturz kann auch er nicht garantiert protokollieren.
- Der Bericht ist in der Meldung nach ungewöhnlichem Ende und dauerhaft unten über
  „Crash-Bericht exportieren“ erreichbar.
- Gemessene synchrone Save-Last wurde durch maximal 300 adaptive Snapshots sowie
  verzögerte, zusammengefasste Ereignis-Saves reduziert. Eine echte 30-Minuten-
  Browserabnahme bleibt mangels startbarer Browser-Toolchain offen.

## Übergabe konkreter Save-Fehler – 24. September 2026

Der reproduzierte Fehler ist `QuotaExceededError` in `temp-write`, nicht blockiertes
`localStorage`: Hauptsave, drei Backups und der temporäre Vollsave erzeugten eine fünfte
Kopie. Ein 2.000-Snapshot-Teststand maß 1.159.161 Byte vor und 179.011 Byte nach der
Save-seitigen Kompaktierung auf 300 Snapshots. Der neue Ablauf räumt bei Quota-Druck nur
alte Backup-Generationen, löscht den validierten Temp-Key vor der Rotation und bewahrt
den bisherigen Hauptsave bis zum Commit. Jeder Fehler meldet Stufe, Error-Name,
Error-Text und Key-/Loggrößen; die UI bietet dann den lokalen Spielstandexport an.

## Übergabe IndexedDB und Tick-Korrelation – 24. September 2026

- Das Origin-Inventar erfasst alle localStorage-Keynamen und Größen, aber keine Inhalte;
  unbekannte Daten werden niemals gelöscht.
- Bekannte lokale Save-Generationen werden bytegleich verifiziert in IndexedDB
  archiviert, bevor ausschließlich ihre bekannten localStorage-Keys freigegeben werden.
- Aktuelle Saves plus drei Backups werden atomar in IndexedDB rotiert und nach dem
  Schreiben erneut validiert. Dadurch hängt sicheres Speichern nicht mehr von freier
  localStorage-Quota ab.
- Die Diagnose trennt Visibility-Wechsel, Worker-/UI-Heartbeat, Tick und gehaltene
  Tap-Gesten. Der alte Bericht beweist keine sichtbare Main-Thread-Blockade; eine
  spätere Save-Zeit ist ohne Session-/Load-Grenze kein Gegenbeweis zu früheren Fehlern.
- Offen bleibt die geforderte reale 30-Minuten-Browserabnahme, da die bereitgestellten
  Crash-/ZIP-Dateien nicht im Arbeitsverzeichnis liegen und die lokale Browser-
  Toolchain weiterhin nicht startbar ist.

## Übergabe 25. September 2026 – Komponenten und Analyseexport

Der Arbeitsbranch `work` enthält Save v16 mit sechs typisierten Komponenten, zentralen Quellen/Rezepten, dem realen Komponentenatlas sowie dem erweiterten ZIP-Vertrag. Der Remote ist inzwischen als `origin` konfiguriert; ein Fetch oder Abgleich mit `main` bleibt wegen `CONNECT tunnel failed, response 403` in dieser Umgebung nicht möglich. Der Atlas lag bereits im Branch und wurde nicht ersetzt.

Als Nächstes sind ein gerenderter Mobile-Browsertest (Bestand, Funddarstellung, lange Rezeptzeilen, 44-px-Ziele) und der vollständige CI-Lauf nach Wiederherstellung des Registry-Zugriffs erforderlich. `npm ci` scheiterte konkret mit HTTP 403 beim Abruf von Vitest und entfernte die vorher nur teilweise vorhandenen Module. Die bestehenden historischen aktiven/passiven v7-Messungen bleiben deshalb unverändert; es wurden keine neuen Langlaufzahlen erfunden.

## Übergabe 25. September 2026 – Forschung v17

Branch `work` im verifizierten Repository `Kayza1708/Idle-game-` enthält fünf echte Forschungsstufen, drei konkrete Baupläne, garantierte aktive/offline Analysequellen für alle sechs Komponenten, Atlasdarstellung in Bestand/Quellen/Rezepten sowie schrittweisen Export mit Abbruch. Der vorhandene Forschungsabschluss-Fix bleibt Grundlage: Slotentfernung geschieht vor Belohnung, nun auch für Ziellevel; Phasenzähler und Exactly-once-Ereignis wurden ergänzt.

`origin` zeigt auf das richtige GitHub-Repository, der Fetch bleibt aber durch `CONNECT tunnel failed, response 403` blockiert. Der lokale Atlas liegt als 1536×1024-RGBA-PNG mit sechs 512×512-Zellen vor und wurde direkt sowie als Gesamtbild geprüft. Eine gerenderte Mobile-UI-Prüfung war nicht möglich: der Offline-npm-Cache enthält TypeScript/React, aber nicht die ausführbaren Abhängigkeiten von Vitest/Rollup. Typecheck und kompilierte Kernsimulation liefen erfolgreich.

Gemessene offene Balancepunkte: Nach dem frühen Spiel explodiert die Datenrate, sodass Forschungsdauer statt Datenpreis dominiert; alle drei Baupläne werden in der aktuellen festen Analysestrategie nahezu gleichzeitig nach rund 12,6–12,8 Stunden craftbar. Missionen und eigenständige passive Hardwarefunde sind noch keine implementierten Komponentenquellen. Als Nächstes sind reale Browserabnahme, vollständige CI sowie eine getrennte Mehrprestige-Kalibrierung von Datenkurve und Rezeptdifferenzierung erforderlich.

## Übergabe Komponentenanalysen und Datenkurve (25. September 2026)

- In einer Umgebung mit vollständigem npm-Cache zuerst `npm ci`, danach Typecheck,
  Vitest und Production-Build erneut ausführen. Der Typecheck lief vor dem fehlgeschlagenen
  Neuaufbau von `node_modules` erfolgreich; Vitest/Build sind nicht als bestanden markiert.
- Den festen aktiven/passiven Seedlauf für 1 Stunde, 1/7/30 Tage mit den neuen
  Analysekosten und dem Datensoftcap wiederholen. Hardware-Meilensteine, mehrere
  Prestiges und alle drei Rezepte getrennt protokollieren.
- Mobile Ansicht bei 320/375/430 px prüfen: laufender Analyseslot, Fehlmengentexte,
  Abbruch und wissenschaftliche Notation. Kein Screenshot wurde ohne Browser erzeugt.
- Prestige-Stufen 4–7, gezielte Komponentenquellen und Automationsreserven bleiben
  geplant und dürfen bis zur Implementierung nicht als kaufbare Knoten erscheinen.

## Offene technische Abnahme V18
1. Vollständigen Big-Number-Typ für alle Economy-, Save-, Prestige- und Exportpfade einführen; aktuelle Number-Pfade schützen vor NaN/Infinity, sind oberhalb 2^53 aber nicht integer-exakt.
2. Passive Hardwarefunde und dedizierte Gaming-GPU-Laser-Meilensteinquelle ergänzen.
3. 7-/30-Tage-Balanceexport mit mindestens fünf realen Prestiges erneut ausführen, sobald das Linux-Rollup-Optional-Paket verfügbar ist; im aktuellen Checkout blockiert `@rollup/rollup-linux-x64-gnu` Vitest/Vite.
4. Produktionszerlegung im UI um explizite Item-Effektzeilen und die klickbare KI-Modell-Ausrüstungsansicht erweitern.

## 2026-09-25 – Economy completion pass

Umgesetzt im lokalen Completion-Pass: Analyse-Affordability/ETA, passive Schaltkreisfunde, Titan-/GPU-Laser-Meilensteinfunde, Equipment-Sockelvertrag (1. Prestige / Fertigung I), Daten-/Forschungs-Itemeffekte und Save-v19-Migration. Noch offen für die vollständige A–H-Abnahme: zentraler Präzisions-/Big-Number-Pfad, deterministische 7-/30-Tage-Balance-Simulation mit fünf Prestiges sowie finale Simulator-Exports und komplette CI-Abnahme.

### Precision follow-up after v19
- Added `ScientificNumber` mantissa/exponent arithmetic for hardware costs, geometric bulk costs and max-buy comparisons.
- Hardware purchases now reject unsafe integer counts instead of silently rounding them.
- Remaining precision work: migrate persisted Credits/Data/INT and telemetry resource snapshots away from raw `number` before claiming full arbitrary-precision economy support.

## Economy completion v19.3
- [x] Datenkosten/Bestand/Fehlmenge/Ansparzeit in Werkstatt für Module, Items und Upgrades sichtbar.
- [x] Craft-Buttons prüfen Daten, Module, Komponenten und Bauplanfragmente konsistent mit der Domainlogik.
- [x] Fertigung-II-Rabatt zentral getestet für Komponenten- und Daten-Upgrade-Kosten.
- [x] ScientificNumber um Add/Subtract/Divide und JSON-Roundtrip erweitert.
- [ ] Persistente Credits/Data/INT vollständig auf ScientificNumber migrieren; bis dahin bleibt der Legacy-`number`-State der dokumentierte Precision-Blocker.

- [x] Credit-/Daten-Ausgaben der Kernsysteme auf einen gemeinsamen atomaren ScientificNumber-Pfad vereinheitlicht (Training, Forschung, Analysen, Hardware, Crafting/Upgrades); Datenproduktion nutzt denselben Additionspfad.
- [ ] Persistente Credits/Data/INT vollständig von Legacy-`number` auf serialisierte Mantisse/Exponent-Werte migrieren; der gemeinsame Buchungspfad ist dafür vorbereitet, aber die GameState-Felder selbst sind noch `number`.

### Präzisionsmigration v20
- [x] Credits und Daten werden in zentralen Transaktionen zusätzlich als serialisierte ScientificNumber geführt.
- [x] Run-/Lifetime-Credits und INT-Bestände/-Ansprüche besitzen persistente `{m,e}`-Werte.
- [x] Prestige und INT-Knotenkäufe aktualisieren die Präzisionsspur atomar.
- [x] Save v19 → v20 migriert die Präzisionswerte; Export schreibt sie anonym mit aus.
- [ ] UI und Telemetrie verwenden weiterhin endliche `number`-Projektionen für Darstellung/Diagramme; diese sind bewusst nicht die autoritative Präzisionsquelle.

## A–H-Abnahmefortschritt v20.1

Dieser Durchgang schließt drei zuvor nur teilweise erfüllte Punkte: Labore III startet eine wegen Datenmangel wartende Queue nun später automatisch; die UI zeigt den letzten real verbuchten Analysefund; und der Balance-Export trennt Analysen, Komponenten, Crafting/Itemeffekte und Prestige-Knotenkäufe in eigene CSVs. Die zugehörigen Regressionstests wurden ergänzt. Offen bleiben die vollständige npm/Vitest-/Vite-Abnahme in einer Umgebung mit installierten Dependencies sowie eine erneute dokumentierte Langzeitsimulation auf genau diesem Stand.

## A–H Abschlussprüfung v20.2
- [x] Max-Hardwarekäufe vergleichen und belasten Credits oberhalb `1e300` gegen das persistente Scientific-Ledger statt gegen die UI-Projektion.
- [x] Produktionszerlegung zeigt die real angewendeten ausgerüsteten Itemeffekte getrennt nach Credits, Compute, Daten, Forschung, Training und Analyse.
- [ ] Vollständige npm-Abnahme (`typecheck`, `test`, `build`) erneut ausführen, sobald die npm-Abhängigkeiten lokal verfügbar sind; im übergebenen ZIP ist `node_modules` absichtlich ausgeschlossen.

## Final A–H acceptance status v20.3

The older V18/V19 open-item notes above are historical and are superseded by this section.

- **A Components analyses:** complete in code — independent slot, atomic start cost, online/offline/reload completion, completed-ID exactly-once guard, status/time/real reward UI, regression coverage.
- **B Data economy:** complete in code — repeatable research softcap, analyses, modules/items/upgrades, prestige-driven data/lab unlocks, affordability/shortage/ETA UI, atomic transactions.
- **C Credit/hardware pacing & precision:** complete in gameplay-critical paths — 15 classes, six fixed milestones each, exact scientific ledger, overflow-safe bulk/max purchase, scientific UI notation from `1e15`, save/export precision track. UI/telemetry charts intentionally use finite projections only.
- **D Prestige tree:** complete — exactly five branches × three nodes, branch-scaled costs/prerequisites and live effects.
- **E Items/equipment:** complete — six components with implemented sources, modules → items, rarity upgrades Common→Mythic, durable sockets/items and production-breakdown effects. Source metadata is now aligned with the actual milestone/passive implementations.
- **F Prestige reset:** complete — run resources/training/research reset, active work cancelled without refund, durable INT/nodes/components/modules/items/blueprints/achievements/lab upgrades retained, confirmation UI lists both sides.
- **G Balance acceptance:** complete for deterministic simulator/export — 7d active, 7d passive, 30d active, five real prestiges, ordered hardware progression and invalid-number checks; exports cover purchases, milestones, rates, research, analyses, component finds/consumption, crafting/item effects, INT and nodes.
- **H Repository acceptance:** implementation/docs/tests are present. The only unresolved verification is environmental: `npm ci` timed out in this sandbox, so full `npm run typecheck`, `npm test` and `npm run build` are not claimed as passed here. Run them on the developer machine before merge; fix any resulting failures rather than weakening tests.
