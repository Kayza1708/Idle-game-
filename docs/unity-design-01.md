# Unity · erster visueller Abschnitt

Stand 21.10.2026. uGUI, Originalgrafiken und Save v21 erhalten. Keine Änderung an TypeScript, Domain, Balance oder Monetarisierungsanbietern. Weitere Bildschirme werden in diesem Abschnitt nicht einzeln neu gestaltet.

## Werkzeuge tatsächlich geprüft

- Installierte Skillpfade `.codex/skills`, Plugin-Cache sowie Repository-/Konfigurationseinträge geprüft: **kein Unity-SKILL.md vorhanden**, deshalb keine angeblich gelesenen Unity-Skillreferenzen. Kein Unity-MCP-Server/-Tool und kein entsprechendes Unity-Paket konfiguriert. Keine unaufgeforderte Plugin-/SDK-Installation.
- Installierter Editor: **6000.3.26f1**. CLI `-executeMethod`, EditMode und PlayMode nutzbar. Vor jedem Lauf Prozessprüfung, keine zweite Editorinstanz und keine Locklöschung.
- Konkreter erfolgreicher Vorher-Nachweis: `/tmp/idle-design-baseline3.xml`, 1/1. Echte Szene `IdleIntelligence`, tatsächlicher PlayMode, gespeicherter Hardwarekauf, Hierarchieexport und Consolemarker `DESIGN_CAPABILITY_PROOF`. Editorconsole über `-logFile` lesbar.
- Bilder sind tatsächliche Unity-uGUI-Renderbilder: aktive Szene, Original-Sprites, tatsächliche Texte/Controller; Canvas für die Aufnahme kurz in ScreenSpaceCamera an eine RenderTexture der Zielauflösung gebunden und danach zurückgestellt. Keine Browserbilder, Mockups oder nachträgliche Bildmontage. Es wird keine interaktive Unity-MCP-Console-/Game-View-Steuerung behauptet.
- Mitschnitt aus zeitgestempelten tatsächlichen Unity-Frames der bezahlten Tap-/automatischen Overdrivetransaktion. Bildfolge wird lediglich zu Video kodiert; die Animation erzeugt keine Belohnung.

## Gestaltung und gemeinsame Bausteine

`GameTheme` enthält ausschließlich Farben, Typografie und Flächengeometrie. Dunkles Blau als Grundfläche, helle Schrift, Mint für aktive Navigation, Gold für Kaufaktionen und Impulse. Genug/fehlend über vorhandene/benötigte Mengen sowie Grün/Rot, nicht allein durch Farbe vermittelt. 6/8/12-Punkt-Abstände, gerundete gemeinsame Flächen; keine zusätzlichen Außenrahmen über der alten Darstellung.

`ResourceBar`, `BottomNavigation` und `LaboratoryPanel` sind verbundene Prefabs. Die untere Fünfernavigation bleibt bei scrollendem Inhalt bestehen. Ressourcenwerte haben einen einzigen aktuellen Aktualisierungsweg. Die Laborbühne enthält die große echte Tapfläche, tatsächliche Produktionsraten, Ladung/Restzeit und Tapfeedback. Ein kompakter Modell-/Trainingsbereich öffnet die vorhandenen echten Ansichten. Auf kurzen Geräten wird die Bühne gekürzt; Hardware und weitere Inhalte bleiben scrollbar.

`ActionCard` und `HardwarePresentation` zeigen originale Hardwaregrafik, Bestand, Computegewinn und kompakte echte Kaufkosten. `CostStrip` verwendet für Rezept-/Upgradeangebote dieselben Bestand-/Bedarf-Farben und vorhandenen Materialicons. Ausführliche Materialnamen/Effekte bleiben in Details. Module ohne eigenes Originalicon erhalten keine erfundene Grafik; Kennzeichnung M1/M2… bleibt sichtbar.

`ItemPortrait`/`ShapeFrame` bleiben die gemeinsame Darstellung in Inventar, Ausrüstung, Details und vorhandenen Animationen. Sprite-Meshgrenzen werden für die Mitte berücksichtigt, Level steht getrennt unter dem Bild. Kreis, Dreieck, Quadrat und Diamant sowie alle sechs originalen Seltenheitsfarben bleiben erhalten; ungewöhnlich ist grün. Lange Detailtexte bestimmen ihre tatsächliche Scrollhöhe.

Der bestehende Szenen-Rebuild endet ebenfalls mit dem neuen Designpfad; kein zusätzlicher provisorischer Designmodus. Der Item-/Forgeumfang erhält nur die gemeinsamen Bausteine, keinen eigenständigen Komplettumbau.

## Originalfonts und Referenzen

IBM Plex Mono Regular/Bold und Silkscreen stammen aus den vorhandenen WOFF2-Dateien. Latin und Latin-Ext wurden mit fontTools 4.60.2/Brotli 1.2.0 zu Unity-TTF zusammengeführt; Lizenzen liegen daneben, Namen bleiben erhalten. Reproduktion: `scripts/prepare-unity-fonts.py`. IBM: 425 gemappte Codepoints, darunter deutsche/französische/portugiesische/polnische Akzente. Silkscreen: 222, auf die kurze Titelzeile beschränkt. Beliebige Unicode-Spielernamen sowie Symbolfallbacks auf echten Geräten bleiben gesonderte Font-/Geräteabnahme; der vorhandene Namensvertrag wird nicht verengt.

TypeScript-Anordnung berücksichtigt: zentrale Spielfläche, kompakter Modell-/Trainingsbereich, direkt folgende Hardware, persistente Fünfernavigation, gemeinsame Itemdetails. Siehe `mobile-ui-overhaul.md` und aktuelle TS-Komponenten. Im Repository wurde keine lokale Archero-Bilddatei gefunden. Ergänzende öffentlich dokumentierte Vergleichsanordnung: [Archero-Inventar](https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n), [Archero Store](https://apps.apple.com/us/app/archero/id1453651052). Gestaltungsableitung: kompakte obere Konten, bleibende untere Navigation, klare farbige Itemraster. Keine Fremdgrafik übernommen.

## Visuelle Prüfung und Abnahme

Vorherbilder wurden vor dem Umbau aufgenommen. Die ersten Bilder zeigten zu große Kopf-/Navigationsbereiche, kleine Itembilder und überlagerte Beschriftungen. Nach Sichtprüfung korrigiert: konkurrierende Wert-/Kostentexte entfernt, Headerbreite begrenzt, echte 44-px-Touchhöhe erhalten, Bild-/Levelbereiche getrennt, lange Details scrollbar, Hardwarekarten bei fehlendem Guthaben weiter sichtbar.

Aktuelle 320×568 / 390×844 / 430×932-Matrix für Deutsch und Englisch: Labor, Inventar und lange Itemdetails. Vorbereitete Bestände/alle Seltenheiten sind ausdrücklich als Testsave markiert; kein natürlicher Erwerbsnachweis und keine Freischaltung des ungeklärten Erkenntnisarchivs. Zusätzlich echte Ausrüstung und Reload sowie reduzierte Bewegung. Kleine Bildschirme benötigen Scrollen; untere Navigation bleibt fest. Keine physische iPhone-/Android-, Notch-/Touch- oder native Schriftfreigabe.

Aktueller vollständiger PlayMode-Lauf: **58/58**, Exit 0, keine übersprungenen Tests, `/tmp/idle-design-accepted-play.xml`. Compile erfolgreich. Typecheck, vollständiges Vitest **1.886/143 Dateien**, Sourcecheck und Web-Build bestanden; bestehende Bundlegrößenwarnung bleibt. Vollständiges EditMode **128/128**, Exit 0, `/tmp/idle-design-edit.xml`, einschließlich natürlichem Prestige und Saveverträgen. Nach der abschließenden reinen Sockelbeschriftung zusätzlich **1/1 Detailtest mit zwölf gemeinsamen Sourcefällen**, `/tmp/idle-design-detail-edit.xml`, Exit 0, und vollständiges aktuelles **58/58 PlayMode**.

Die endgültigen Bilder wurden nach den Korrekturen selbst angesehen: Ressourcenwerte ohne Doppeltext, klarer Hardwarebestand/-preis, lesbare lange deutsche/englische Details, getrennte Levelbeschriftung und gleichmäßige Zentrierung. Auf 320 px ist die Bühne kürzer und der erste Kauf sichtbar; weitere Inventarreihen/Details bleiben scrollbar. Navigation: bei 320 px 55,79 px hoch, Sichern 44,31 px; alle geprüften Grenzen innerhalb des Viewports. Die adaptive Bühnenhöhe wird pro Aufnahme zusätzlich gegen den aktuellen Viewport geprüft.

Der Mitschnitt besteht aus **60 tatsächlichen Unity-Frames**, 4,924 Sekunden gemessener Ablauf zwischen erster und letzter Aufnahme; anschließend H.264/VFR kodiert und vollständig dekodiert geprüft. Tapkontobewegung, Laborimpuls und automatischer Overdrive werden gezeigt. Reduzierte Bewegung separat statisch geprüft. Rohaufnahmen/Logs bleiben unter `/tmp/idle-design-*`; versionierte Medien und Prüfsummen in `unity-design-01-verification.json`.

- [Vorher 390](media/unity-design-01/before-labor-390.png)
- [Labor DE 320](media/unity-design-01/labor-de-320.png), [390](media/unity-design-01/labor-de-390.png), [430](media/unity-design-01/labor-de-430.png)
- [Labor EN 320](media/unity-design-01/labor-en-320.png), [390](media/unity-design-01/labor-en-390.png), [430](media/unity-design-01/labor-en-430.png)
- [Inventar DE](media/unity-design-01/items-de-390.png), [EN](media/unity-design-01/items-en-390.png), [echte Ausrüstung nach Reload](media/unity-design-01/equipped-reloaded.png)
- [Lange Details DE 320](media/unity-design-01/detail-de-320.png), [EN 320](media/unity-design-01/detail-en-320.png)
- [Echter Unity-Mitschnitt](media/unity-design-01/tap-overdrive.mp4), [reduzierte Bewegung](media/unity-design-01/reduced-motion.png)

## Mit Play überprüfen

Unity **6000.3.26f1**, Szene **`Assets/Scenes/IdleIntelligence.unity`**, Game View **390×844**, Play. Bestehende Saves laufen weiter; neue Kampagnen beginnen mit Mira/Namenswahl/Prolog. Untere Navigation: Labor, Training, Forschung, Items, INT. Im Labor Tap, tatsächliche Produktion und Hardwarekäufe testen; im Modell-/Trainingsbereich die echten Ansichten öffnen. Items → Inventar → Item öffnet das gemeinsame Detailfenster; Kosten/Anlegen/Ablegen/Upgrade verwenden weiterhin echte gespeicherte Transaktionen. Nicht durch Löschen von Saves neu starten. Vor jedem Batchlauf den Projekteditor schließen; keine zweite Instanz.

Automatisierte Bildfälle sind in `DesignReviewTests` ausdrücklich vorbereitet, vollständig isoliert und verändern keinen normalen Spielstand. Die Bildroutine und der Clip lassen sich über die PlayMode-Tests und `scripts/encode-unity-review.py` reproduzieren. Übrige optische Arbeit bleibt in `unity-visual-backlog.md`.
