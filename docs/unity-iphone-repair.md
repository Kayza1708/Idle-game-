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

## Nativer Zwischenvergleich auf cae3ac22

Gleicher ARM64-Simulator, gleiche Auflösung, identischer vorbereiteter Zustand, gleiche Development-/Debug-Konfiguration und Aufnahme. Editor und Xcode-Compiler waren für beide Messungen geschlossen. Die vorgesehene Zielbildrate ist Teil der Korrektur (`-1` → `60`). Die Vorbereitung setzt den KI-Namen über die echte Runtime; dadurch bleibt in beiden Läufen der Willkommensdialog geöffnet. Gemessen sind also die drei Ansichten **mit ihrer jeweiligen echten Mira-Darstellung**; dies ist keine Messung eines vollständig geschlossenen Tutorials.

| Nachher, Simulator Development/Debug | Labor/Hardware | Training | Forschung |
|---|---:|---:|---:|
| Framezeit Mittel | 17,010 ms | 17,273 ms | 18,419 ms |
| Framezeit p95 | 19,962 ms | 18,333 ms | 31,709 ms |
| GC-Allokationen / Frame Mittel | 168.338 B | 163.636 B | 170.129 B |
| Simulation Mittel | 1,565 ms | 1,788 ms | 1,492 ms |
| Anzeige Mittel | 1,052 ms | 0,619 ms | 2,674 ms |
| Größter Save | 103,705 ms | 104,691 ms | 104,641 ms |
| Neue UI-Knoten stationär | 0 | 0 | 0 |

Rohdaten: `Builds/performance-review/after-cae/`. **Noch kein stabiler 60-fps-Nachweis**: Save-Spitzen und Forschungsframes überschreiten das Budget weiterhin. Weitere Untersuchung läuft; diese Grenzen werden nicht durch bestandene Funktionstests verdeckt.

Der native Echtzeit-Frischstart hat zusätzlich einen abgeschnittenen Tutorial-Zielbutton nach fokussiertem Hardwarekauf gefunden. `failed-guide-cae3ac22.mp4`/das zugehörige Bild bleiben als Fehlerbelege erhalten; sie sind kein erfolgreicher Abnahmemitschnitt. Ein kompletter Raycast-Test für Mira → Hardware → Training → Forschung wurde dafür ergänzt. Die vorherige vollständige Suite bestand mit 81/81, deckte diese durchgängige echte Trefferfolge aber noch nicht ab.

Weitere Korrekturen nach dem nativen Zwischenlauf: Die Führung setzt ihren Scrollzustand nur beim tatsächlichen Wechsel zurück in den begleitenden Modus zurück. Labor-Sichtbarkeit hat einen eindeutigen Besitzer; unveränderte Navigation darf einen zwischenzeitlichen Sichtbarkeitswechsel nicht verdecken. Der Portrait-Test verwendet die aktive Editor-Zielgruppe auch nach iOS-Export und prüft die realen Displayabmessungen. Die vollständige neue Raycastfolge bis zum Forschungsstart besteht. Wiederholte Null-/Eins-Konvertierungen und JSON-Pfad-/Literalallokationen sind reduziert; der validierte Save-Envelope wird ohne zweiten Parserdurchlauf gelesen. Pending wird weiterhin vollständig deserialisiert und validiert. Optionale Save-Untermarker trennen Validierung, Hash, Kodierung, Flush, Pending-Prüfung und Commit. Ein neuer EditMode-Fall prüft die gemeinsame Anzeigeprojektion exakt gegen alle bisherigen Produktionsraten der Prestige-Fixtures; vollständiger Lauf 136/136 bestanden.

Die zusätzliche vollständige Web-Regression nach den sachlichen Dialogkorrekturen besteht: **146 Dateien / 1.902 Tests**, Typecheck und Produktionsbuild erfolgreich. Die Sparmaßnahmen am Save-Pfad behalten ausdrücklich die vollständige Pending-Deserialisierung/-Validierung bei; es gibt keinen ungeprüften schnellen Speicherweg.

## Anschlussauftrag: kompakter Header und Tutorial-Layout

Die eingefügte Aufgabenbeschreibung vom 23.10. wurde vollständig gelesen. Die darin genannten vier Screenshots sind in der zugänglichen Anlage nicht enthalten (nur Text); vorhandene native und neu gerenderte Unity-Bilder bilden die überprüfbare Ausgangsbasis. TypeScript-Referenzen tatsächlich gelesen: `ResourceBar`/`TapSurface`/`HardwareStore` in `Panels.tsx`, `TutorialFocus.tsx`, `TutorialFinger.tsx`, `Dialogue.tsx` sowie zugehörige Layoutregeln in `style.css`, `mobile-ui.css`, `pixel-game.css`.

- Die separate Titel-/Speicherzeile ist aus dem normalen Layout entfernt; vier gleich gewichtete Ressourcenspalten und ein 44er Hamburger teilen eine 52er Kopfzone. Manuelles Speichern bleibt im Menü und in Einstellungen. Erfolgreiche Autosaves erzeugen keine permanente Fußzeile; Fehler, Challenges und markierte Teststände bleiben sichtbar.
- Mira besitzt einen einzigen, vom Shell-Layout bemessenen Dock unterhalb der Ressourcen, außerhalb des Scrollinhalts. Portrait und Blase bleiben zusammen; kein Umbetten zwischen unterschiedlich gesteuerten Parents, keine negativen Layoutabstände. Kurze Textseiten, Namensfeld, Validierung, Confirm/Skip/Continue und gespeicherte Storyzustände bleiben verbunden.
- Der eigene Pixel-Finger übernimmt die Silhouette der TypeScript-Komponente. Er folgt dem wirklichen Ziel bzw. dessen Navigation/Führung und berücksichtigt Scroll-Clip, Layoutänderungen, Skip und reduzierte Bewegung. Er empfängt keine Raycasts und schreibt keinen Spielzustand; kein `ForceUpdateCanvases` pro Frame.
- Labor: randlose vorhandene Originalzeichnung, bestehender Aspekt-/Crop-Mechanismus, entfernte permanente Tapbeschriftung und deren Band; kompakte Modell-/Trainingszeile mit beschrifteten Ressourcenraten. Keine zusätzliche Grafikfläche.
- Hardware: 72er Zeilen, 44er Originalmotive, einheitlich 98 breite Kaufbereiche mit mindestens 44er Kaufaktion; sichtbare ×1/×10/MAX-Wahl nach bestehenden Domainregeln. Gesamtpreis statt Bestand/Preis-Fraktion.
- Lernkarten: gemeinsames Prefab, unterschiedliche Originalmotive für drei Trainingsarten, untergeordnetes 44er Informationsziel im Kopf; laufende Arbeit zeigt Fortschritt/Restzeit ohne deaktivierte große Startfläche oder irreführende Folgekosten. Verwaltung bleibt im Menü.

Zwischenprüfungen: fünf gezielte PlayMode-Fälle bestanden, einschließlich echter Raycasts bis Forschungsstart, Skip/Resume/Reload, 30 Ansichtswechseln ohne doppelte Mira-/Fingerkomponenten sowie gleichbleibender Hardware-Kaufgeometrie und drei vollständig sichtbaren Hardwarezeilen bei echtem 390×846-Display. DE/EN-Game-View-Bilder für 320/390/430 und ×1/×10/MAX erzeugt und repräsentative Bilder selbst angesehen. Danach den sichtbar zu hohen Infobutton im gemeinsamen Headerlayout korrigiert. Finaler Gesamtlauf, neue native Aufnahme mit Finger und erneute Profilaufnahme sind noch offen. Keine visuelle oder Performance-Fertigmeldung.

## Optimierter nativer Zwischenstand 945f98e9 (getrennte Konfiguration)

Xcode `ReleaseForProfiling`, IL2CPP `Release`/Clang `-O3`, weiterhin Unity Development Player. **Nicht dieselbe Konfiguration wie die vorherige Debug-Tabelle**; daraus keine alleinige Code-Speedup-Zahl ableiten. Gleicher Simulator, 1206×2622, gleiche vorbereitete drei Ansichten, Editor/Compiler während der Messung geschlossen, keine Videoaufnahme.

| Simulator, optimiert | Labor/Hardware | Training | Forschung |
|---|---:|---:|---:|
| Frame Mittel | 16,667 ms | 16,666 ms | 16,667 ms |
| Frame p95 | 17,283 ms | 17,294 ms | 17,301 ms |
| Größter Frame | 29,101 ms | 25,275 ms | 27,616 ms |
| GC / Frame Mittel | 131.403 B | 116.714 B | 119.185 B |
| UI-Refresh Mittel | 0,223 ms | 0,108 ms | 0,337 ms |
| Größter Save | 19,931 ms | 20,041 ms | 24,697 ms |
| Neue UI-Knoten stationär | 0 | 0 | 0 |

Zusätzliche **vorbereitete** Inputphasen, keine natürliche Progressionsabnahme: 30 echte Tap-Transaktionen und 20 Hardwarekäufe über bestehende Buttonaktionen. Mittel 16,919/17,627 ms; größte Frames 49,386/50,034 ms; größte Saves 21,760/28,007 ms. Es bleiben sichtbare Transaktionsspitzen. Rohdaten: `Builds/performance-review/after945-release/`.

Die echte `.raw`-Auswertung lädt das vom Editor bereitgestellte Fenster von **2.000 Frames**, nicht die gesamte längere Datei. Darin 58 Save-Marker: Pending-Vollprüfung insgesamt 584,331 ms (10,075 ms/Aufruf), Encode 209,472 ms (3,612 ms/Aufruf), Validate 109,085 ms (1,881 ms/Aufruf), Commit 101,796 ms (1,755 ms/Aufruf), OriginalHash 42,719 ms (0,737 ms/Aufruf), Flush 38,664 ms (0,667 ms/Aufruf). Dateiflush ist somit nicht die dominierende gemessene Ursache. Layout und CanvasUpdate.Layout sind verschachtelte Marker und dürfen nicht addiert werden. Das Fenster umfasst überwiegend die zusätzlichen Eingabephasen; kein unzulässiger Layout-Vergleich mit den ersten drei Baselinephasen.

Daraufhin wird beim Lesen ungeescapter JSON-Strings auf unnötige StringBuilder verzichtet; dieselbe UTF-16-/Kontrollzeichenprüfung bleibt erhalten. Escapes laufen weiter über den vollständigen Parser. Vollständige EditMode-Regression nach dieser Änderung: **137/137 bestanden**, einschließlich unbekannter Felder, fehlerhafter Originale, numerischer Koerzierung und neuer Gegenproben für rohe/escapte Surrogate. Pending-Deserialisierung, Domainvalidierung, Prüfsummen, Konkurrenzprüfung, fsync, atomarer Replace und Backup bleiben erhalten. Der Performancegewinn dieser letzten Änderung muss im nächsten nativen Stand gemessen werden.

## Tatsächlicher natürlicher Einstieg im Simulator

`fresh-tutorial-945f98e9.mp4`: echter ungeschnittener Simulator-Mitschnitt, Standardstart mit 50 Credits, keine Zuschüsse, keine beschleunigte Uhr, separater Entwicklungs-Save. Die Automatisierung trifft die echten EventSystem-Raycasts und sendet Pointer-Down/Up/Click; der Namenswert wird programmgesteuert ins echte InputField gesetzt. Eine reale iOS-Tastatureingabe wurde damit **nicht** abgenommen. Ereignisprotokoll im gleichnamigen Ordner: Name, Tap, Hardware, Training, Forschung; natürliche Drohne bei 91,278 s genau einmal eingesammelt; Reload bei 94,237 s mit erhaltenem Namen, Intro-Verbrauch und einem Drop. Der ursprüngliche Protokolltext nennt `Application.buildGUID` fälschlich „commit“; das ist eine Unity-Build-ID. Der tatsächliche Git-Commit ist **945f98e9e35e58f6b5e5cd00ab8a10367eded4e4**, anhand Exportmanifest und installierter App-Metadaten. Die Beschriftung im Entwicklungsharness ist inzwischen korrigiert.

AVFoundation konnte die Aufnahme dekodieren; Kontrollframes vor/nach Hardware, Training, Forschung und Reload wurden angesehen. **Keine Audiospur vorhanden**. Der Mitschnitt belegt die grundlegende Führung, enthält aber noch den danach korrigierten festen Kartenhöhen-/Textseitenstand und ersetzt deshalb nicht den ausstehenden endgültigen Mitschnitt.

Weitere konkrete Layoutkorrektur: Ein Bild mit intrinsischer Spritehöhe darf nicht die bevorzugte Kartenhöhe bestimmen. `LearningCard` liefert die tatsächliche Inhaltshöhe über den bestehenden uGUI-Layoutvertrag; Namen und Wirkungstexte können umbrechen. Der Pixel-Finger wird nach der Canvas-Layoutphase positioniert, versteckt sich bei Menüs/Itemfenstern und verweist bei Hardware direkt auf den Kaufbutton. Forschungsüberschrift und Laborbelegung sind getrennte Textzeilen. Die Tests prüfen jetzt tatsächliche Game-View-Displaygrößen statt ausschließlich RenderTexture-Wechsel; neun gezielte Fälle bestanden vor dem letzten zusätzlichen Mira-Padding. Der vollständige Schlusslauf folgt noch.

Beim konkreten TS-Tapflächenabgleich wurde zusätzlich ein historisch fehlender Consumer sichtbar: Der TS-Halte-Repeater (3/s) ist in der Unity-Tapfläche nicht angebunden. Dieser Auftrag untersagt neue Funktionen; die bestehenden Einzel-Taps bleiben unverändert. Mira zeigt deshalb für diesen Schritt nur die tatsächlich unterstützte Tap-Anweisung. Quelltexte/Katalog/Balance werden dafür nicht umgeschrieben. Der fehlende Consumer bleibt ausdrücklich im Backlog und ist kein abgenommenes Migrationskriterium.
