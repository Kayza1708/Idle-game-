# Ruhige Ressourcenleiste und fünf echte Aktionssequenzen

22.10.2026 · `codex/unity-rewrite`, Ausgangsstand `6677432c` (Merge von #142, zuvor geprüftes Design `853f0230`). Lokale Backups, TypeScript und unversionierte Ausgangsdateien bleiben erhalten. Kein Merge, keine Veröffentlichung und keine neue Plattform-/SDK-Integration.

## Gestaltung

Die aktuelle TypeScript-Referenz `src/style.css` (Ressourcen-/Navigationsregeln ab Zeile 447) verwendet eine gemeinsame Fläche, schmale Trennlinien und einen klaren aktiven Zustand. Unity übernimmt diese Gliederung mit den bisherigen Originalgrafiken:

- Eine gemeinsame 52 Einheiten hohe Ressourcenfläche mit vier Konten, kleinen Originalicons, lesbaren Werten und dezenten vertikalen Trennern. Keine Pixelrahmen um einzelne Konten.
- Eine gemeinsame untere Navigationsfläche; fünf Icons in einheitlichen 28×28-Flächen, kurze Labels, Cyanlinie und ruhige aktive Fläche. Keine dekorativen Einzelrahmen. Bestehende SafeArea und ausreichend große Touchziele bleiben erhalten.
- Starke Stahl-/Seltenheitsrahmen bleiben auf Items, wichtige Fenster und Hauptaktionen konzentriert. Original-Labor, Hardwaremotive, Goldkäufe, Schriftpaar und Grundanordnung bleiben erhalten.

`CalmChrome.Apply` bearbeitet die vorhandenen Hierarchien und speichert `ResourceBar`/`BottomNavigation` über den Editor. `ApplyPixelDesign.Build` ruft diesen Schritt abschließend auf; ein erneuter Aufbau setzt den gemeinsamen Chrome nicht auf die Einzelkästen zurück. `MobileShell` aktualisiert nur den aktiven Zustand. Keine Spriteimporter-Rechtecke, Pivots oder `.meta` von Hand geändert; keine neuen Grafikassets oder Fremdlizenzen.

## Aktionssequenzen und Sicherheitsvertrag

1. **Tippen:** Pointerposition und bestätigter tatsächlicher Betrag bleiben maßgeblich. Auch gewöhnliche Taps erhalten einen kurzen Kernimpuls; Ladung, Aktivierung und laufender Overdrive bleiben sichtbar und räumlich am Kern verankert. Ein ersetzbarer Betrag/Impuls statt unbeschränkt wachsender Effekte.
2. **Hardware:** Druckreaktion am Kaufbutton; erfolgreicher Stückzahlanstieg löst einen kurzen Impuls am Originalmotiv und eine Hervorhebung der Stückzahlzeile aus. Preis, Compute und Produktionsrate stammen weiterhin direkt aus dem Spielzustand. `HardwarePresentation` beobachtet den gespeicherten Zustand und kauft selbst nichts.
3. **Herstellung:** Konkrete Materialicons und Mengen des tatsächlichen Angebots werden vorab angezeigt. Nur tatsächlich verbrauchte Komponenten fliegen zum Amboss; keine Wiederholung eines beliebigen Materials, um drei Effekte zu füllen. Begrenzte Maschinenenergie/Partikel, danach Originalitem mit tatsächlichem Seltenheitsrahmen.
4. **Fusion:** Genau die drei ausgewählten Itemkopien verlassen die drei Sockel, bewegen sich zum Amboss und verbinden sich. Enthüllt wird die gespeicherte Ergebnis-ID, Seltenheit und erhaltene Stufe. Kurzer Effekt in der tatsächlichen Ergebnisfarbe, kein bildschirmfüllender Blitz.
5. **Ausrüsten:** `EquipFlight` übernimmt nach erfolgreichem Save eine Kopie von Item, Startposition und tatsächlichem Zielsockel. Das Item fliegt vom Detailfenster zum neu aufgebauten Zielsockel, rastet ein und zeigt kurz seine wirkliche Hauptwirkung. Der Zielinhalt und die Transaktion sind bereits gespeichert. Keine Belohnung durch Flug oder Abschluss.

Herstellung/Fusion ersetzen jeweils genau eine aktive Sequenz, ohne Eingaben zu sperren. Jeder erfolgreiche erneute Klick führt seine reguläre Transaktion sofort aus; der neueste Beleg ersetzt nur die Animation. Keine Animationswarteschlange. Navigation, Moduswechsel oder Deaktivieren räumen Geister/Partikel auf. Reduzierte Bewegung/Effekte aus zeigen unmittelbar den echten Endzustand. Speicher- und Domainkern, Preise, RNG und Saveformat bleiben unverändert.

## Arbeitsmittel

Installiertes offizielles Unity-Agent-Plugin **0.1.8-beta**: `ui-ugui` samt `references/scrollview-setup.md`, `sprite-editor` samt `templates.md` und `background.md`, UI-only-/Samplingabgrenzung von `2d-pixel-perfect` samt `sprite-settings.cs`, `unity-cli` samt `references/build-run-test.md`. Kein eigener Animations-Skill im installierten Katalog. Keine neue PixelPerfectCamera und keine Pipeline-/Paketinstallation für diese uGUI-Arbeit.

Die vorhandene direkte Editor-/Batch-/PlayMode-Anbindung verwendet genau **6000.3.26f1**. Vor Starts wird außerhalb des eingeschränkten Prozessblicks auf Unity-Hauptprozesse geprüft. Kein zweiter Editor und keine Lockdateilöschung. Der aus Abschnitt 03 bekannte Prozessschalter `--burst-disable-compilation` bleibt für Prüfungen bestehen; keine Änderung der Projekt-/Paketkonfiguration und keine neue Burst-/Gerätefreigabe.

## Abnahme und echte Medien

Die neuen `ActionSequenceTests` verwenden isolierte temporäre Saves, gekennzeichnet als **PREPARED TEST SAVE**. Ressourcen und zwei passende Fusionsitems sind vorbereitete Testmittel; ein drittes Item entsteht im sichtbaren Herstellungsschritt. Kein Nachweis natürlicher Erwerbswege. Eingaben laufen über echte Unity-Buttons/Pointerhandler; alle Spielaktionen und Saves laufen im tatsächlichen Runtime. Es ist ein zeitgestempelter Unity-Kamera-/uGUI-Mitschnitt im Editor, keine physische Touchaufnahme.

Gesamtvideo: [alle fünf Aktionen in Reihenfolge](media/unity-design-04/all-five-actions.mp4).

Einzelclips mit jeweils Ausgangszustand, Bewegung und Ergebnis:

- [01 Tippen und Overdrive](media/unity-design-04/01-tap-overdrive.mp4)
- [02 Hardwarekauf](media/unity-design-04/02-hardware.mp4)
- [03 vollständige Herstellung](media/unity-design-04/03-craft.mp4)
- [04 vollständige Fusion](media/unity-design-04/04-fusion.mp4)
- [05 Ausrüsten](media/unity-design-04/05-equip.mp4)

Die Aufnahme enthält **tatsächliches Spielaudio**: ein ausschließlich in der Testassembly befindlicher `ReviewAudioCapture` liest den echten Unity-`AudioListener`-Mix über `OnAudioFilterRead`. Ein separater Testlistener vermeidet die Mehrdeutigkeit der mehreren vorhandenen AudioSources auf dem Runtimeobjekt. Nicht stumme 48-kHz-Stereo-Samples werden aufgezeichnet, ohne Clipdateien nachträglich als Ersatz abzuspielen. Die Einzelclips enthalten die entsprechenden Zeitbereiche desselben Mixes. Kodierung H.264/VFR und AAC, keine Interpolation, künstliche Verlangsamung oder nachträglichen Effekte. Absolute Sample-/Framezeiten unterliegen Audioblock- und Renderlatenz; das ist keine messtechnische Geräte-Latenzabnahme.

`video-metadata.json`, `times.txt`, `segments.txt` und `audio-probe.txt` dokumentieren tatsächliche Frames, Bereiche, Zeiten und Audioquelle. Herstellung/Fusion werden im Gesamtvideo nicht unterbrochen; die Einzelclipgrenzen liegen jeweils vor Beginn und nach Ende der Sequenzen.

Sichtprüfung: DE/EN bei **320×568, 390×844 und 430×932**; kompakte Leiste, Navigation, Herstellung und Itemdetails. Zusätzlich vorhandene vollständige Designregression für lange Namen, leere/belegte/gesperrte Slots, rote Nachteile und Materialmangel. [Labor vorher](media/unity-design-04/before-labor-de-390.png), [Labor nachher](media/unity-design-04/labor-de-390.png), [EN 320](media/unity-design-04/labor-en-320.png), [Herstellung](media/unity-design-04/craft-de-390.png), [lange Namen](media/unity-design-04/long-en-320.png).

Erste nicht gültige Aufnahmebilder mit noch offenem Mira-Dialog wurden verworfen. Der korrigierte Test schließt das Intro über reguläre Narrative-Aktionen und prüft ausdrücklich, dass kein automatischer Dialog die Aufnahme verdeckt. Ein anfänglicher Test-Compilerfehler und die erste ungeeignete Audio-Probeanordnung werden nicht als bestandene Prüfungen gewertet.

## Selbst testen

Unity **6000.3.26f1**, Projekt `IdleIntelligence/`, Szene **`Assets/Scenes/IdleIntelligence.unity`**, Game View 390×844, **Play**. Bestehenden Save behalten. Labor tippen bis Overdrive, Hardware kaufen, unter Items einen regulär gelernten/finanzierbaren Bauplan herstellen. Fusion über drei gleiche abgelegte, ungeschützte Items wählen; danach Inventar → Item → Ausrüsten. Material-/Slotregeln gelten unverändert. Bei 320 px Inhalte scrollen; Navigation bleibt fest. DE/EN und Effekte in Forschung → Einstellungen wechseln. Kein Testzustand wird automatisch in einen Benutzersave übernommen.

## Verbleibende Grenzen

Echte Geräte-/Notch-/Touch-Ergonomie, Fontfallback, native Haptik, Systemaudioverhalten und Burst-/Releaseabnahme bleiben offen. Die übrigen Bildschirme erhalten keine pauschale neue Designabnahme. Die Quellenprobleme wie der Erkenntnisarchiv-Erwerb bleiben getrennt dokumentiert. Originalfonts und alle Grafiklizenzen aus Abschnitt 03 gelten unverändert.

Reproduktion der Medien nach `ActionSequenceTests`: `python scripts/package-unity-actions.py` mit `imageio-ffmpeg==0.6.0`. Die vorhandene tatsächliche Framekodierung `scripts/encode-unity-review.py` wird wiederverwendet; Einzelclipgrenzen kommen aus `segments.txt`. Im finalen Gesamtvideo: **415 Frames, ca. 37,53 s** gemessene Dauer, **48-kHz-Stereo-Spielton**. Der Audioprobe erfasste 3.606.528 tatsächliche Samples mit Peak 0,1560596. Die sechs Videos wurden vollständig dekodiert und die Framezahlen gegen die Originalbereiche geprüft.

Der abschließende Kaufnachweis berücksichtigt, dass `GameRuntime.Act` vor dem Kauf regulär die seit dem letzten Tick verstrichene Produktion berechnet. Er prüft die echte Abbuchung, steigenden Folgekosten und sofort gespeicherte Stückzahl; genaue Preis-/Transaktionsparität bleibt durch die unveränderten gemeinsamen Domainreferenzen abgedeckt. Ein zwischenzeitlich zu strenger Test ohne diesen Zeitfortschritt wurde korrigiert, ohne die Produktion zu verändern. Ein nach Abschluss noch sichtbarer unbenutzter Materialplatz wurde nach Sichtprüfung entfernt und regressionsgeprüft.

## Endgültige Prüfergebnisse

- Unity-Import/Prefabaufbau: Exit 0; der finale C#-Stand kompiliert in den abschließenden Testläufen.
- Vollständiger finaler PlayMode-Lauf: **63/63 bestanden**, Exit 0, 170,485 s.
- Vollständiger EditMode-Lauf: **128/128 bestanden**, Exit 0, 357,267 s.
- `npm run typecheck`, `npm test` (**1.886 Tests in 143 Dateien**), `npm run build` und `npm run unity:check`: erfolgreich. Der bekannte Web-Bundlegrößenhinweis bleibt eine Warnung. Nach Ergänzung der zwei reinen Statusübersetzungen: Native-Copy-Check **288 × sieben Sprachen**, Exit 0.
- Sechs Videos vollständig dekodiert; jeweilige Framezahlen entsprechen exakt den Originalbereichen.
- `git diff --check`, Datei-/Ordner-Metadaten und unveränderte `src/`, Packages/ProjectSettings geprüft. Kein Save-Schema- oder Balancewechsel.

Log-/Resultat-/Medienprüfsummen und Abgrenzungen: [unity-design-04-verification.json](unity-design-04-verification.json). Tatsächlich geprüfte Plattform: **macOS arm64, Unity Editor 6000.3.26f1**. Keine Geräte-/Releasefreigabe.
