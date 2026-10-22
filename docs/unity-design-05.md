# Inszenierung · Fusion zuerst, Modell und bestehende Aktionen

22.10.2026 · Arbeitsbranch `codex/unity-rewrite`, Basis `f1155291` (bereits gemergter PR #143). Lokale Backups, unversionierte Ausgangsdateien, TypeScript-Version und bestehende Saves bleiben erhalten. Keine Domain-/Balance-/Save-Schemaänderung, keine neuen Spielmechaniken, SDKs, Veröffentlichung oder Merge.

## Konkrete Referenzen und Vorgehen

Der bisherige Mitschnitt `media/unity-design-04/all-five-actions.mp4` wurde direkt dekodiert und anhand seiner Eingaben-/Bewegungs-/Ergebnisbilder untersucht. Befund: Der helle Werkstatthintergrund konkurrierte mit sehr kleinen Eingaben und Ergebnissen; die Verbindung dreier Items und die tatsächliche Verbesserung waren schwer lesbar.

Die verfügbaren lokalen Referenzen `Downloads/IMG_7498.PNG` (Archero-Fusion), `IMG_7497.PNG` (Modell/Ausrüstung) und `IMG_7499.PNG` (Itemdetail) wurden angesehen. Ableitung: Eingaben klar zuordnen, Hintergrund priorisieren, Ergebnis groß und farbig absetzen, Item und Seltenheit gemeinsam präsentieren. Keine Archero-Grafik ins Projekt übernommen. `IMG_7501.PNG` ist eine weitere Sci-Fi-Modulreferenz mit verbundenem Zentrum, keine Spielregelquelle.

Konkrete TypeScript-Vorlage: `src/EquipmentDialog.tsx`, `src/equipment.css` und `src/ItemPresentation.tsx`. Sechs Familiensockel um den vorhandenen Originalkern, Verbindungen, Name/Level, gesonderte Universalslots und echte Werte. Die Positionen der sechs Familiensockel sind aus dieser Komposition übernommen.

**Zuerst allein ausgearbeitet und geprüft:** `RecordFusionFirst`, Resultate `/tmp/idle-design5-fusion-first.xml` und `...first2.xml`, jeweils 1/1 bestanden. Nach der ersten Sichtprüfung wurden der kreuzförmige Impuls durch eine facettierte Pixelsilhouette und der bloße Zahlenvergleich durch eine benannte Wirkung ersetzt. Erst danach wurden Ergebnispräsentation und Effektbausteine auf die anderen Aktionen übertragen. Der abschließende Fusionsclip zeigt denselben Ablauf mit den danach korrigierten gemeinsamen Oberflächen.

Installiertes offizielles Unity-Agent-Plugin **0.1.8-beta**: `ui-ugui` samt ScrollView-Referenz; `sprite-editor` samt Templates/Background; `unity-cli` samt PlayMode-Verifikationsreferenz; UI-only-Abgrenzung und Sprite-Samplingreferenz von `2d-pixel-perfect`. Kein eigener Animations-Skill installiert. Die bestehende direkte Editor-/Batch-/Testanbindung wird weiterverwendet, keine behauptete Live-MCP-/Pipeline-Anbindung. Keine Kamera-/Paketinstallation für diese uGUI-Arbeit. Vor jedem Editorstart wurde auf laufende Hauptprozesse geprüft; keine zweite Projektinstanz oder Lockdateilöschung.

## Oberfläche

- **Gems:** Viertes Konto zeigt den tatsächlichen `Retention.gems`-Bestand und den vorhandenen Diamanten aus Zelle 1 des Originalressourcenatlas. Die alte interne Textreferenz heißt weiterhin `Users`, damit bestehende Szenenreferenzen erhalten bleiben; im Mobile Shell wird sie synchron ausschließlich mit Gems befüllt. Ein konkurrierender LateUpdate-Anzeigepfad ist entfernt. Die Nutzerberechnung bleibt unverändert und über Menü → Produktion / Nutzer erreichbar.
- **Menü:** Hamburger oben rechts, ausreichend großer Touchbereich. Einstellungen, Produktion/Nutzer, Save/Recovery, Profil, Missionen, Seasons, Markt, Gems, Belohnungen, Store, Fortschritt, Mira, Challenges, Ziele und freigeschaltete KI-Modelle führen zu vorhandenen Ansichten. Manuelles Speichern bleibt erreichbar. Kein Kauf-/Ad-Anbieter wird dadurch verfügbar.
- **Modell:** Der kompakte Modellbereich im Labor öffnet jetzt die vorhandene Inventar-/Ausrüstungsfunktion mit der zusammenhängenden Modellkomposition. Originalkern im Zentrum, sechs verbundene Familienplätze, Universalslots darunter, Name/Level und tatsächliche Q/E/G-/Produktionswerte. Training und Geheimes Labor bleiben separat über vorhandene Zugänge erreichbar.
- **Zentrierung:** `ItemArtMetrics` wird über den Editor aus den Alpha-Grenzen aller 30 Originalitems erzeugt. Der gemeinsame Porträtbaustein kompensiert transparente Ränder und erhält Form, Seltenheitsfarbe und einheitlichen sichtbaren Bildanteil. Belegte Universalslots behalten die tatsächliche Itemform. Keine Grafikpixel, Sprite-IDs, Pivots oder importierten Sprite-Rechtecke umgeschrieben. Der Modellkern erhält gezielt Point-Sampling; Bilddatei unverändert.
- Die ruhigen gemeinsamen Ressourcen-/Navigationsflächen bleiben erhalten. Keine neue flächige Designrunde für weitere Bildschirme.

## Inszenierung und Transaktionsvertrag

`ForgeSequence.prefab` ist eine wiederverwendbare, nicht blockierende Beleginszenierung. `ForgeAnimator` hält genau eine ersetzbare Sequenz; der frühere Ring-/Spark-Fusionspfad wurde entfernt.

**Fusion:** Drei tatsächliche Eingaben mit 94 Einheiten großen Porträts. Hintergrundabsenkung, 0,28 s Vorbereitung, danach 0,36 s beschleunigtes Zusammenführen. Kollision bei 0,64 s mit kurzer lokaler Spritefolge und synchronem vorhandenem Spielsound. Das Ergebnis erhält eine große 176-Einheiten-Präsentation, Originalmotiv, wirkliche Form/Farbe, Name, Seltenheit/Level und berechneten Vorher-/Nachherwert. Danach folgt es dem räumlichen Weg direkt zum sichtbaren Inventarregister. Gesamtdauer rund 2,02 s; es gibt keine Eingabesperre, Warteschlange oder Weiter-Taste. Reaktionen ersetzen nur den aktuell sichtbaren Beleg; alle erfolgreichen Transaktionen bleiben sofort gespeichert.

**Herstellung:** Dasselbe System verarbeitet tatsächliche Komponenten mit Mengen, bei Bedarf bis zu den acht im bestehenden Katalog verwendeten Materialarten. Komponenten bewegen sich zum Amboss, der lokale Maschinenimpuls ist schwächer als bei der Fusion; anschließend große Darstellung des real gespeicherten neuen Items und dessen Hauptwirkung. Kein Auffüllen mit erfundenen Materialien.

**Ausrüsten:** Originalitem vom Detailfenster zum tatsächlichen Zielsockel; kurzer Sprite-Einrasteffekt. Der zugehörige Modellkern und die echten aktuellen Werte reagieren gezielt. Keine Animation ändert die Ausrüstung oder vergibt Vorteile.

**Hardware:** Druckreaktion, kurzer lokaler Pixelimpuls am Hardwaremotiv, hervorgehobene tatsächliche Stückzahl, sofort neue Kosten/Compute/Produktionsrate. **Tippen:** sehr kleiner Impuls am Pointer und tatsächlicher Betrag; die Overdrive-Aktivierung ist deutlich stärker am Kern, der laufende Zustand bleibt zurückhaltend. Keine bildschirmfüllenden Blitze oder dauerhaften Zusatzglows.

Die acht aufeinander abgestimmten Effektsprites und die gestufte Energieleitung sind eigene Raster-Spriteassets, reproduzierbar aus `BuildForgeSequence.cs`: 48-Pixel-Impulssilhouetten und ungleich verteilte kantige Splitter, Point-Sampling. Keine improvisierte Menge rotierender Kreise. `PixelImpact` besitzt pro benanntem Anker nur einen ersetzbaren Spieler und setzt bereits im ersten Renderbild das echte Sprite.

Der vorhandene Herstellung-/Fusionssound wird bei aktivierten Effekten vom gespeicherten Beleg aus beim Zusammenstoß abgespielt; der automatische Sofortaufruf wird ausschließlich für diese sichtbaren Belege unterdrückt, damit kein doppelter Sound entsteht. Reduzierte Bewegung spielt den regulären Transaktionssound unmittelbar und zeigt das echte statische Ergebnis. Sound und Animation vergeben nichts. Abbruch, Tabwechsel, schnelle Wiederholung, reduzierte Bewegung und Reload behalten die gespeicherten Transaktionen.

## Funktionale Prüfung

Finale Resultate, Exitcodes, Medien-/Logprüfsummen und frühere gefundene Fehler stehen in `unity-design-05-verification.json` (nach Abschluss der Läufe). Der breite PlayMode-Lauf enthält die vorhandenen Save-/Domain-/UI-Regressionsprüfungen und neue Fälle für echte Gems, Menürouten, Modellzugang, achtteilige Herstellung, Fusionslevelerhalt und die erste korrekt gerenderte Impulsfolge. Vorbereitete Zustände ausschließlich in isolierten temporären Saves, sichtbar **PREPARED TEST SAVE**. Im Gesamtvideo entstehen aus zwei vorbereiteten Items und einer echten Herstellung die drei Fusionsitems.

Bekannte Prüfungsanbindung: Unity **6000.3.26f1**, macOS arm64. Der bekannte Prozessschalter `--burst-disable-compilation` bleibt für Unity-Prüfungen aktiv; keine Projekt-/Paketumschaltung. Keine Aussage über eine neue Burst-/Geräte-/Releasefreigabe.

## Visuelle Beurteilung

Die Beurteilung beruht auf tatsächlichen Renderbildern und zeitgestempelten Bewegungsphasen, getrennt von den Testzahlen:

- Gegenüber Abschnitt 04 sind Eingaben und Ergebnis wesentlich größer. Im abgedunkelten Werkstattbereich ist das Item jetzt der Blickfang; die Metall-/Laboridentität bleibt im Hintergrund erkennbar.
- Vorbereitung, beschleunigte Verbindung, kurzer Höhepunkt, benannte Verbesserung und Inventartransfer sind einzeln lesbar. Gemeinsame Bewegung statt unabhängiger gleichförmiger Skalierungen.
- Normale Taps, Kauf, Herstellung und Seltenheitsaufstieg haben unterschiedliche Intensität. Die seltenheitsabhängige Farbe bleibt beim Ergebnis erhalten.
- Modell und Slots sind wieder eine gemeinsame Komposition. Die ruhigen Leisten begrenzen die kräftigen Rahmen auf wichtige Inhalte.
- Sichtbar korrigiert: kreuzförmiger Erstentwurf des Impulses, fehlende Wirkungsbezeichnung, Alpha-Ränder der Items, veraltete Gem-Anzeige vor LateUpdate, erste Impulsframes ohne Sprite und verbliebene deutsche Fusions-/Menübeschriftungen.

Das ist eine konkrete Verbesserung gegenüber dem bisherigen Clip, keine pauschale Gleichsetzung mit Archero oder vollständige Geräte-/Gestaltungsfreigabe. Bei 320 px bleiben längere Werkstatt- und Modelldetails scrollbar. Typografie-/Touchwirkung auf echten Geräten, Fontfallback und native Audio-/Haptik bleiben separat zu prüfen. Die übrigen Bildschirme sind nicht neu gestaltet.

## Medien und Play

- [Neue Fusion](media/unity-design-05/04-fusion.mp4) · [bisherige Fusion](media/unity-design-04/04-fusion.mp4)
- [Gesamter echter Mitschnitt](media/unity-design-05/all-five-actions.mp4): Tippen/Overdrive → Hardware → Herstellung → Fusion → Ausrüsten → Modellansicht → Menü.
- Einzelclips: [Tippen](media/unity-design-05/01-tap-overdrive.mp4), [Hardware](media/unity-design-05/02-hardware.mp4), [Herstellung](media/unity-design-05/03-craft.mp4), [Ausrüsten](media/unity-design-05/05-equip.mp4), [Modell](media/unity-design-05/06-model.mp4), [Menü](media/unity-design-05/07-menu.mp4).
- [Labor/Gems](media/unity-design-05/labor-de-390.png), [Modell](media/unity-design-05/model-de-390.png), [Menü EN 320](media/unity-design-05/menu-en-320.png), [Fusion DE 320](media/unity-design-05/fusion-de-320.png), [Fusion EN 430](media/unity-design-05/fusion-en-430.png).

Alle Medien sind echte Unity-Kamera-/uGUI-Aufnahmen, mit echter Spiellogik, Saves und EventSystem-Aktionen. Keine Mockups, nachträglichen Effekte, Interpolation oder künstlich verlangsamte Wiedergabe. Das Audio stammt vom tatsächlich aufgenommenen Unity-AudioListener-Mix; keine nachträglich eingesetzten Clipdateien. Die Aufnahmeschleife verzichtet auf künstliche Pausen und hält Mindestzeiten vor/nach Aktionen nur zur Lesbarkeit des Nachweises ein. Native Touchaufnahme oder Geräte-Latenzmessung wird nicht behauptet.

Reproduktion: `ActionSequenceTests`, danach `python scripts/package-unity-actions.py` mit `imageio-ffmpeg==0.6.0`. Der Encoder nutzt eine 60-Hz-Zeitbasis für die tatsächlichen variablen Framezeiten; das bedeutet keine erzeugten 60 FPS. Die konkreten Framezahlen, Zeiten, Audioprobe und Video-Prüfsummen stehen neben den Medien.

Unity **6000.3.26f1**, Projekt `IdleIntelligence/`, Szene **`Assets/Scenes/IdleIntelligence.unity`**, Game View 390×844, **Play**. Bestehenden Save behalten. Rechts oben Menü öffnen; Produktion/Nutzer und Einstellungen prüfen. Im Labor Modellbereich anklicken, Sockel/Itemdetails ansehen; Training bleibt eigener Goldbutton. Unter Items eine regulär finanzierbare Herstellung/Fusion starten und das Ergebnis abwarten oder sofort weiterbedienen. Ausrüsten und Reload kontrollieren. Zusätzlich 320×568/430×932, DE/EN und reduzierte Bewegung prüfen.

Originalgrafiken und Fonts/Lizenzen bleiben aus Abschnitt 03 erhalten. Neue Impuls-/Leitungsassets sind eigener Code-/Rasterentwurf, kein Fremdasset und keine generierten Archero-Grafiken. `ItemArtMetrics` ist reine Darstellungsmetrik, keine zweite Balancingquelle. Quellprobleme wie der Erkenntnisarchiv-Erwerb bleiben unverändert getrennt dokumentiert.

## Endgültige Ergebnisse

- Breite PlayMode-Suite: **67/67**, Exit 0.
- Abschließende sieben gezielte Aktions-/UI-Prüfungen nach den letzten reinen Präsentationskorrekturen: **7/7**, Exit 0, einschließlich tatsächlicher Startsockel ohne Layoutsprung und direktem Inventartransfer.
- Unveränderter Domain-/Savekern: **128/128 EditMode**, Exit 0.
- Unity-Asset-/Prefab-Compile: Exit 0; finaler Runtimecode zusätzlich im letzten PlayMode-Lauf kompiliert.
- Typecheck, **1.886 Vitest-Tests in 143 Dateien**, Web-Build und vollständiges `unity:check`: erfolgreich. Nach finalen Statusübersetzungen: Native-Copy-Check **299 × sieben Sprachen**, Exit 0.
- Finaler Mitschnitt: **587 echte Frames**, **28.515 s** gemessene Dauer, tatsächliches Spielaudio. Alle acht Videodateien vollständig dekodiert, Framezahlen jeweils gegen den Originalbereich geprüft.
- Keine fehlenden `.meta`, `git diff --check` erfolgreich; `src/`, Packages/ProjectSettings und reine Domainverträge unverändert.

Zahlenformat bleibt die bestehende unabhängige Einstellung; ein Sprachwechsel ändert sie nicht stillschweigend. Geräte-/Releaseabnahme und die konkrete visuelle Beurteilung sind von diesen Testergebnissen getrennt.
