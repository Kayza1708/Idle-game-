# iPhone-Test: gezielte Hauptansichts- und Performancekorrekturen · 23.10.2026

## Umgebung und Ausgangsstand

Der tatsächlich verbundene „iPhone 16 Pro“-Eintrag ist laut `devicectl` **Reality simulated**. Getestet wird ein **iPhone-16-Pro-Simulator, iOS 27.0, ARM64**, UDID `2F5C4B2F-A725-45B9-881D-16DA5BD50057`, auf einem M4-Mac. Kein physisches iPhone ist nachgewiesen. Unity exakt **6000.3.26f1**, Xcode 27.0. Die normale Unity-App hat Bundle-ID `com.kayza1708.idleintelligence.unity`; ihr Ausgangs-Info.plist weist den installierten Spielcode **a5a59bdd0182de426bd64f0aadfaea913a662931** und Plattform `iPhoneSimulator` aus. Die bisherige Capacitor-App und das unversionierte `ios/` bleiben erhalten.

Arbeitsbranch `codex/unity-rewrite`; vorherige PR #153 bereits gemergt. Ein lokaler Fast-forward wurde von der automatischen Freigabe als Merge abgelehnt und ausgelassen. Arbeitsbaum und `origin/main` hatten beim Start denselben Dateiinhalt. Folge-Draft: [#154](https://github.com/Kayza1708/Idle-game-/pull/154), kein Merge/Release.

Die im Auftrag erwähnten drei Screenshots wurden in diesem Turn nicht als zugängliche Dateien übermittelt. Der installierte Simulatorstand wurde deshalb direkt untersucht und ein eigenes echtes Vorher-Bild aufgenommen. Keine Behauptung, die drei Dateien gesehen zu haben.

## Gemessene Baseline vor Optimierung

Instrumentierungscommit **b5bb7a2b8002f80dd1f84367bb72580097811317** enthält ausschließlich opt-in Entwicklungsmarker/-aufnahme. Nativer Development-Export und Xcode-Simulatorbuild erfolgreich. Eine separate App `com.kayza1708.idleintelligence.profile` verwendet einen isolierten, ausdrücklich **vorbereiteten** Save: 1e8 Credits, 1e6 Daten, zehn Taschenrechner, deaktivierte Story. Kein natürlicher Fortschrittsnachweis. Die normale App und ihr Save werden nicht ersetzt.

Unity Profiler: binäres `.raw`, ProfilerRecorder, FrameTimingManager. Pro Ansicht zwei Sekunden Aufwärmen und zehn Sekunden Messung, 1206 × 2622 Pixel. Kein Deep Profiling. Die Aufnahme selbst verursacht zusätzlichen Aufwand; Vorher/Nachher verwenden dieselbe Instrumentierung. `Main Thread` enthält Wartezeiten; die eigenen Marker erfassen den jeweiligen Arbeitsschritt.

| Vorher, Simulator | Labor/Hardware | Training | Forschung |
|---|---:|---:|---:|
| Framezeit Mittel | 51,960 ms | 34,712 ms | 49,179 ms |
| Framezeit p95 | 82,463 ms | 53,399 ms | 83,238 ms |
| GPU Mittel, Simulator | 0,204 ms | 0,173 ms | 0,193 ms |
| GC-Allokationen / Frame Mittel | 3.409.280 B | 1.210.597 B | 1.739.456 B |
| Simulation `Idle.Tick`, Mittel | 11,358 ms | 7,267 ms | 10,485 ms |
| Anzeige `Idle.UIRefresh`, Mittel | 9,913 ms | 6,168 ms | 9,845 ms |
| Größter atomarer Save | 181,937 ms | 186,202 ms | 200,555 ms |

In den stationären Messphasen wurden **keine neuen UI-Knoten** erzeugt. Das Problem darf deshalb nicht pauschal als Hierarchie-Neuerzeugung pro Tick bezeichnet werden. Wiederholte Berechnungen, Zeichenketten, Hierarchiescans und Dateizugriffe sind nachgewiesen. `Canvas.BuildBatch` liegt im Mittel unter 0,01 ms. Der zunächst abgefragte Recorder `UI.Layout` existiert nicht; dessen Nullwerte sind **kein Layoutnachweis**. Die tatsächliche verfügbare Markierung heißt `Layout` in `UI Layout`.

Lokale Rohbelege: `IdleIntelligence/Builds/performance-review/before/` (`frames.csv`, `summary.json`, `environment.txt`, `available-counters.txt`, ca. 1,12 GB `unity-profiler.raw`). Das echte Vorher-Bild liegt daneben unter `before-user-save.png`. Rohprofile/Builds werden nicht in Git aufgenommen.

## Gezielte Korrekturen

- Unveränderliche große Zahlen: neutrale Operationen und gemeinsame Null/Eins sowie Standardformatierung ohne wiederholten Neuaufbau; exakte Restterme bleiben erhalten. Neutrale, unbenutzte Forschungs-/Hardwarezweige überspringen. Keine Formel-/Preisänderungen.
- Labor und Navigation: Referenzen und Produktionsprojektionen wiederverwenden; keine Produktionsberechnung viermal pro Renderframe. Sprachkomponenten nach UI-Erzeugung registrieren statt alle Texte jeden Frame zu suchen. Unveränderte lokalisierte Texte überspringen teure Eltern-/Regexarbeit.
- Hardwarepreise nach Bestand/Kaufmenge/Challenge zwischenspeichern; Lernkarten rechnen statische Angebote begrenzt neu und aktualisieren sichtbare Karten gezielt. Aktiver Fortschritt und Bezahlbarkeit bleiben separat aktuell.
- Diagnosedatei höchstens einmal pro Sekunde schreiben; Pause, Fokusverlust, Fehler und sauberer Abschluss sichern zusätzlich. Das letzte Diagnose-Checkpoint kann daher bis zu einer Sekunde fehlen. **Spieltransaktionen bleiben synchron und atomar vor dem kosmetischen Feedback gespeichert.**
- Unveränderte bereits validierte Savebytes per SHA-256 prüfen statt sie vor jedem Schreibvorgang nochmals vollständig zu deserialisieren. Pending-Payload wird weiter vollständig validiert, dauerhaft geflusht und atomar mit Backup ersetzt; zweiter Konkurrenzcheck bleibt. Unbekannte/beschädigte/externe Saves bleiben gesperrt.
- Native Zielbildrate explizit 60; zuvor war sie `-1`. Das ist eine Darstellungs-/Laufzeitvorgabe, kein Fortschrittsmultiplikator. Fortschritt bleibt UTC-/Elapsed-Time-basiert.
- Mira: Originalportrait, gemeinsame Sprechblase, kurze Seiten, Weiter/Skip/Namenswahl, begleitende nicht modale Führung. Verwaltung/Kapitelarchiv bleibt über das Menü erreichbar; Company erklärt den frühen Einstieg nicht mit.
- Tutorial-Fortsetzen vor Name/Prolog verweist auf vorhandene Zustände statt unbekannte IDs. Erfüllte Aktionshinweise werden durch das aktuelle Ziel ersetzt; keine alten Hardwarehinweise vor Training/Forschung. TS/C# und gemeinsame Referenzen gleich geändert, Intro-Verbrauch/Belohnungen bleiben gespeichert.
- Drohne: irreführende dekorative Zweitdrohne entfernt; tatsächliche Signaltransaktion trägt das Originalmotiv samt bewegter 96 × 62 Trefferfläche. Dekorative Kinder empfangen keine Raycasts. Kein erfundener Werbeerfolg.
- Training/Forschung: gemeinsames `LearningCard`-Prefab mit Originalmotiv, Name/Level, Wirkung, tatsächlichen Kosten, Dauer, Start, untergeordneten Details und Fortschritt. Forschungsbelegung/Queue sichtbar, automatische Einreihung unverändert. Verwaltungs-/Shoprouten bleiben im Hamburger-Menü; keine Verwaltungswand vor dem Forschungskatalog. Technische Anforderungs-IDs werden in Forschungsnamen übersetzt.

## CI und Abnahmefortschritt

Der gemergte Ausgangs-PR war nicht grün. Linux-CI zeigte konkrete Unterschiede in niedrigen wissenschaftlichen Resttermen. Die Referenzprüfung erlaubt eng begrenzt binäre Rundungsunterschiede in abgeleitetem, angesammeltem INT. Bei vorbereiteten Lifetime-Eingaben wird die negative Summe vorheriger Kosten **an ihrer eigenen Größenordnung** verglichen, nicht am künstlichen 1e80-Guthaben. Gegenproben erkennen weiter kleine Zahlungen bei großen Guthaben. Andere Guthaben, Transaktionen, Zeitpunkte, IDs und INT-Vergaben bleiben exakt geprüft. Keine Laufzeitformel wurde dafür verändert.

Bisher nach Korrektur: vollständiger EditMode-Lauf **135/135**, Typecheck erfolgreich, **146 Vitest-Dateien / 1.901 Tests** und Web-Produktionsbuild erfolgreich. Ein vollständiger finaler PlayMode-Lauf sowie nativer Nachhervergleich und Echtzeit-Aufnahme laufen noch. Diese Zeile wird mit den tatsächlichen Endergebnissen ersetzt; sie ist keine Fertigmeldung.

## Noch nicht abgenommen

Physisches iPhone 16 Pro mit stabilen 60 fps, thermischer Dauerlauf, reales Touch-/Audio-/Haptikverhalten und native Produktionsintegrationen sind eigenständige Abnahmen. Simulator-GPU-Zeiten ersetzen keine Messung auf einem Gerät. Keine neuen Werbe-/Kauf-SDKs, keine Veröffentlichung.
