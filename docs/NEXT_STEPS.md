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

1. Vollständiges Lockfile in einer Umgebung mit Registry-Zugriff erzeugen, `npm ci`, Audit, Tests und Build ausführen und erst danach Browserbilder bei 390×844/Desktop aufnehmen.
2. Den ausgeführten v7-Kontrolllauf als eingechecktes Simulationswerkzeug ausbauen und Forschungsbedingungen der späteren Klassen kalibrieren.
3. Phase 2 mit drei Modulsockeln, gespeicherten Loadouts und deterministischen Durchbruchswahlen implementieren.

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
