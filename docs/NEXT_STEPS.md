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

Der Arbeitsbranch `work` enthält Save v16 mit sechs typisierten Komponenten, zentralen Quellen/Rezepten, dem realen Komponentenatlas sowie dem erweiterten ZIP-Vertrag. Das Repository besitzt keinen konfigurierten Git-Remote und keinen lokalen `main`-Ref; ein Fetch oder Abgleich mit `main` war deshalb nicht möglich. Der Atlas lag bereits im Branch und wurde nicht ersetzt.

Als Nächstes sind ein gerenderter Mobile-Browsertest (Bestand, Funddarstellung, lange Rezeptzeilen, 44-px-Ziele) und der vollständige CI-Lauf nach Wiederherstellung des Registry-Zugriffs erforderlich. `npm ci` scheiterte konkret mit HTTP 403 beim Abruf von Vitest und entfernte die vorher nur teilweise vorhandenen Module. Die bestehenden historischen aktiven/passiven v7-Messungen bleiben deshalb unverändert; es wurden keine neuen Langlaufzahlen erfunden.
