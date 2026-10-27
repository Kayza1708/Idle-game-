# Truhenscharnier und vollständige Komponentenübersicht · 23.10.2026

Auf `codex/unity-rewrite`, bestehender offener Draft-PR #154. Ausgangsstand `96f628d8`. Keine Änderungen an Economy, Saveformat 22, Dropregeln, Preisen oder Transaktionen. TypeScript, Capacitor und persönliche Spielstände bleiben erhalten.

## Umsetzung

- Der Originaldeckel dreht perspektivisch um eine feste hintere Scharnierachse. Die Außenfläche wechselt zur ausgearbeiteten Stahlinnenseite. Zwei Scharniergehäuse und die dunkle eingefasste Truhenöffnung bleiben zusammen mit dem Originalkörper sichtbar.
- Erst nach der vollständigen Öffnung steigen die tatsächlich gespeicherten Funde aus der Truhenmündung auf. Die ganze weiterhin offene Truhe setzt sich unterhalb des Ergebnisses ab. Der Deckel wird nicht wegverschoben und der Körper verschwindet nicht bei der Enthüllung.
- Die native Sichtprüfung zeigte noch eine Überlappung von Itemname und Komponentenicons. Im Korrekturcommit `7660b235` sind Titel, Item, Name und Fundreihe räumlich getrennt; ein zusätzlicher PlayMode-Vertrag prüft die tatsächlichen Weltgrenzen statt nur feste Positionswerte.
- Die Beleg-/Transaktionslogik bleibt unverändert: bezahlen und atomar speichern, dann darstellen. Animationen vergeben nichts. Kürzen, Schließen, Navigation, erneute Aktion und Reload bleiben möglich. Reduzierte Bewegung/Effekte aus zeigt die offene Truhe und das echte Ergebnis statisch.
- Inventar und Materialansicht teilen ein persistentes Raster aus fünf Spalten und vier Reihen. Alle 20 Komponenten inklusive Nullbestand sind gleichzeitig sichtbar. Originalicon und kompakte Bestandszahl; jedes Feld öffnet die vorhandenen Details. Synthese ist dort mit tatsächlichen Kosten/Voraussetzungen erreichbar. Die lange Liste einzelner Synthesebuttons entfällt.
- Raster und Kacheln sind wiederverwendbare Prefabs. Bestandsänderungen aktualisieren vorhandene Labels, erzeugen nicht alle Kacheln neu. Touchziele mindestens 44 logische Einheiten.
- Bei der Sichtprüfung entdeckte falsche Ausschnitte der Erweiterungskomponenten korrigiert: die autoritativen TS-Artzuordnungen verwenden ein 4×3-Erweiterungsatlas statt des bisherigen 5×2-Zuschnitts. Beide Originaltabellen werden vom Editorbuilder gelesen; GUIDs bleiben erhalten. Kein neuer Gameplaykatalog.

## Tatsächliche visuelle Prüfung

Echte Unity-Game-Views bei 320×694, 390×846 und 430×932, jeweils DE/EN. Alle sechs Inventarbilder selbst angesehen: vier vollständige Reihen, echte unzerschnittene Motive, leere und hohe Bestände, Modell und Navigation weiter erreichbar. Details bleiben durch Antippen zugänglich. Der isolierte Teststand ist sichtbar als **PREPARED TEST SAVE** markiert; Gems/Komponenten wurden ausschließlich dort vorbereitet.

Die Vorher-/Nachher-Clips zeigen jeweils eine echte bezahlte legendäre Truhe, einschließlich Ausgang, Öffnung und tatsächlichem Ergebnis. Originale Einzelbilder mit gemessenen Framezeitpunkten wurden ohne Zwischenbilder oder Retiming codiert. Die Audiospur ist die gleichzeitig aufgezeichnete echte Unity-Mischung (48 kHz, Stereo); keine nachträglich hinzugefügten Effekte.

- [Vorher](media/unity-chest-components/chest-before.mp4)
- [Nachher mit Spielaudio](media/unity-chest-components/chest-after.mp4)
- [Offene Truhe](media/unity-chest-components/chest-open.png), [Ergebnis](media/unity-chest-components/chest-result.png)
- [Inventar vorher](media/unity-chest-components/inventory-before-de-390.png)
- Inventar: [DE 320](media/unity-chest-components/inventory-de-320.png), [DE 390](media/unity-chest-components/inventory-de-390.png), [DE 430](media/unity-chest-components/inventory-de-430.png), [EN 320](media/unity-chest-components/inventory-en-320.png), [EN 390](media/unity-chest-components/inventory-en-390.png), [EN 430](media/unity-chest-components/inventory-en-430.png).

Visuelle Beurteilung getrennt von Tests: Die feste Verbindung, sichtbare Innenseite und offene Mulde machen die mechanische Öffnung gegenüber der vorherigen Deckelverschiebung nachvollziehbar. Das tatsächliche Item bleibt der Blickfang; keine zusätzlichen Glows/Blitze. Korrigierte Iconausschnitte und verkürzte große Zahlen verbessern die Übersicht. Die Konstruktion bleibt eine perspektivisch projizierte uGUI-Spriteanimation, kein 3D-Modell. Markttexte besitzen weiterhin historische Sprachfallbacks; deren umfassende Überarbeitung ist nicht Teil dieses Abschnitts.

## Nachweise

- Unity 6000.3.26f1, tatsächlicher Import/Compile und Prefabbuilder erfolgreich.
- Vollständige EditMode-Suite: **139/139 bestanden**, `/tmp/idle-chest-edit.xml`.
- Gezielte PlayMode-Prüfung: **13/13 bestanden**, einschließlich Industrie und gemeinsamer Truhen-/Kapselpräsentation; nach visuellen Korrekturen **3/3** erneut bestanden.
- Vollständiger PlayMode-Lauf vor der nativen Abstandskorrektur: **89/89 bestanden**, Exitcode 0, `/tmp/idle-chest-play-final.xml` (382,59 s). Nach Abstandskorrektur gezielt **3/3 bestanden**, `/tmp/idle-chest-spacing-target.xml`; abschließender vollständiger Endlauf **89/89 bestanden**, Exitcode 0, `/tmp/idle-chest-spacing-full-play.xml` (447,59 s).
- `npm run typecheck`, **1.902 Vitest-Tests in 146 Dateien**, `npm run build`: bestanden. Bestehende Bundlegrößenwarnung bleibt erhalten.
- Neue Verträge prüfen TS-Spritekoordinaten, genau ein Scharnier/Truheninneres, alle 20 sichtbaren Kacheln, Wiederverwendung, kostenpflichtige Synthese, tatsächliches Scharnier statt Z-Rotation/Translation, offene Truhe während Enthüllung, Abbruch/reduzierte Bewegung und gespeicherten Reload ohne erneute Belohnung.

## Assets und Herkunft

Originale ShopChests und Komponentenatlas unverändert weiterverwendet; bestehende Herkunft/Lizenzen gelten. Vier neue `chest-inner-*.png` sind eigene aus der Originalsilhouette erzeugte mechanische Innenansichten, Punktfilter, keine Mipmaps. Stahlrand und Scharniergehäuse sind eigene uGUI-Geometrie. Keine externen Grafikpakete, Fonts oder SDKs hinzugefügt. Prefab-/Sprite-Erzeugung erfolgt über Unity-Editor-APIs; alle Metadateien gehören ins Repository.

## Nachspielen

`IdleIntelligence/Assets/Scenes/IdleIntelligence.unity` in Unity 6000.3.26f1 öffnen, Play im Hochformat. **Items → Inventar**: alle Komponenten oberhalb der Modell-/Ausrüstungskomposition; ein Feld antippen für Bestand und Synthese. **Material** zeigt dasselbe Raster. **Menü → Markt**: eine verfügbare Truhe mit dem eigenen tatsächlichen Bestand kaufen; erst Deckelöffnung, dann Funde beobachten. Es gibt keine Gratisfreischaltung für den normalen Save. Die automatischen Reviews verwenden ausschließlich explizite temporäre Testdateien.

Editoraufnahme und Layouttests ersetzen keine physische iPhone-Abnahme. Der zuvor installierte Simulatorstand und dessen Performancebefunde bleiben gesondert im [iPhone-Reparaturbericht](unity-iphone-repair.md). Aus diesem Abschnitt folgt keine pauschale Fertigmeldung der Migration oder der Geräteperformance.

## Nativer Nachweis und aktueller Installationsstand

Unity-Simulatorexport und Xcode **ReleaseForProfiling / iPhoneSimulator ARM64 / CODE_SIGNING_ALLOWED=NO** für `fb077a63` erfolgreich. Echte 20,363-s-Aufnahme `IdleIntelligence/Builds/chest-component-review/chest-components-native-fb077a63.mp4`, vollständig und unverändert, **ohne Audiospur** (simctl-Recorder). Der Editorclip oben enthält dagegen tatsächliches Spielaudio. Native Sichtprüfung bei 1206×2622 einschließlich Dynamic Island/Safe Area: alle 20 Komponenten sichtbar; echte bezahlte legendäre Truhe, vorher gespeicherter Beleg, befestigter offener Deckel, tatsächliches Item, Bestandsänderung und Inventarrückkehr. Das native Bild deckte die oben korrigierte Namensüberlappung auf; es ist deshalb ausdrücklich der Zwischenstand, kein Nachweis für finale Abstände. [Unverändertes natives Inventarbild](media/unity-chest-components/native-inventory-fb077a63.png).

Die normale Unity-App wurde mit `fb077a63` installiert und gestartet. Vor dem Start waren **12 Unity-Dateien und 15 Capacitor-Dateien bytegleich**; aktuelle Originale separat in `Builds/iOS-ChestComponents-fb077a63/current-originals/` erhalten. Capacitor-`ios/` und die frühere Webapp wurden nicht verändert oder gestartet.

Der finale Abstandscode **7660b235** ist separat nach `Builds/iOS-ChestComponents-Final/` exportiert; Xcode ReleaseForProfiling erfolgreich. Der zusätzliche echte native Lauf `IdleIntelligence/Builds/chest-component-review/chest-components-native-final-7660b235.mp4` dauert 22,015 s und besitzt keine Audiospur. [Tatsächliches finales Ergebnisbild](media/unity-chest-components/native-result-final-7660b235.png): Itemname und Komponentenreihe sind klar getrennt. Die vollständige Sequenz hat bezahlten/gespeicherten Beleg, offene befestigte Truhe, tatsächliche Beute und Inventarrückkehr nachgewiesen. Vorbereitete Ressourcen ausschließlich im separaten Caches-Testsave.

Auch die normale Unity-App ist mit **7660b2351ec05230a6af381b2e921beddfb4fae6** installiert und gestartet; Saveversion 22, gültige Prüfsumme, `prepared=false`. Vor dem finalen Start wurden **14 Unity-Originaldateien und 15 Capacitor-Dateien bytegleich** nachgewiesen. Der Mac war zwischenzeitlich gesperrt; nach Entsperrung scheiterte die Koordinatenbedienung der Desktopanbindung weiterhin mit `noWindowsAvailable`. Statt die laufende App ungeprüft zu beenden, wurde der tatsächliche nach Fokusverlust geschriebene atomare Save kontrolliert (gültige Prüfsumme, aktueller Zeitstempel; `OnApplicationPause`/`OnApplicationFocus` speichern), im Hintergrund erneut separat gesichert und dann ohne explizites Beenden aktualisiert. Keine ältere Sicherung zurückgeschrieben. Privater Nachweis/Originale: `Builds/iOS-ChestComponents-Final/controlled-background-originals/`, `installed-provenance.json`.
