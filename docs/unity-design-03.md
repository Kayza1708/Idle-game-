# Unity · Labor und Itemdetails nach Zielbild

22.10.2026, Fortsetzung von Draft #142 auf `codex/unity-rewrite`, Basis `679253a7`. Zielbild: vom Benutzer bereitgestelltes „Idle Intelligence_ Labor und Quantenmodul.png“. Das Bild dient ausschließlich der verbindlichen visuellen Richtung; es ist kein Unity-Bildschirmhintergrund. Zahlen, Zustände und Beschriftungen stammen aus dem aktuellen Spiel.

## Umsetzung

- Dunkle, texturierte Stahlflächen mit abgestuften Pixelkanten und kleinen abgeschrägten Ecken. Neue einzelne Rasterassets für Stahlhaut, Goldaktion und mintfarbene Ausrüstungsaktion, als skalierbare Sprites. Keine eingebrannten Texte/Zahlen/Bedienelemente.
- Tatsächlich verwendetes `Resources/PixelUI/ActionButton.prefab`; gemeinsame `GameTheme`-Styles. Bestehende `LaboratoryPanel`, `ResourceBar`, `BottomNavigation`, `WorkshopScreen` und `ItemPortrait` bleiben wiederverwendbare Prefabs mit ihren bisherigen Referenzen.
- Labor: kompakte vier Konten, größere Original-Laborfläche mit dominantem Kern, Cyan-Ladung/-Energiezustand, kompakter Modell-/Trainingsbereich mit Originalmotiv und Goldaktion, größere Hardwaremotive und echte Kaufbuttons. Untere Navigation bleibt fest; alle Hardwareklassen bleiben scrollbar erreichbar.
- Itemdetails: eigener Titelbereich mit Platz für X, Seltenheit/Level, großes zentriertes Originalitem in **einem** bearbeiteten Seltenheitssockel, große wichtigste Wirkung, aktueller Ausrüstungs-/Levelvergleich, grüne Hauptaktion, kompakte Materialchips, deutlich deaktiviertes Upgrade und aufklappbare Zusatzaktionen. Keine doppelte Levelanzeige am großen Sockel. Vorhandene Kreis-/Dreieck-/Quadrat-/Universalsockelformen und sechs Original-Seltenheitsfarben bleiben erhalten.
- Ein deckender, rahmenloser Untergrund liegt unter genau einer texturierten Fensterhaut. Er verhindert das Durchscheinen anderer UI; es sind keine mehrfach ineinanderliegenden Stahlrahmen. Name, Seltenheit, Kosten, Vergleiche und Aktionen sind echte uGUI-Elemente.
- Lange deutsche Inventarnamen behalten den vorhandenen Umbruch am Bindestrich. Lange englische Fenstertitel erhalten eine eigene Zeile mit reserviertem Platz für das X.
- Der bisherige gemeinsame Mira-Dialoghost behält seine Schließen-Zeile. Die neue kompakte Item-Schließen-Darstellung verändert weder Storyregeln noch Skip-/Namensaktionen.

## Animation und Transaktionen

`PressMotion` bewegt ausschließlich die Beschriftung kurz nach unten; der Touchbereich schrumpft nicht. Die vorhandene ColorTint-Reaktion bleibt bestehen. `LabFeedback` konsumiert ausschließlich die bestätigte Tapquittung: tatsächlicher Betrag am Pointer, kurzer Aufstieg, Ladungsaufbau am Kern, begrenzter Aktivierungsimpuls und dezente Cyan-Energie während Overdrive. Keine Bildschirmblitze oder permanenten Itemglows.

`PanelMotion` blendet das Fenster weich ein; Sockel und Originalitem erscheinen abgestimmt, das Item leicht nach dem Rahmen. Maximal sechs kurze Pixelpartikel. Erfolgreiches Ausrüsten startet den kurzen Effekt am **tatsächlich gewählten neu aufgebauten Sockel**, nach erfolgreichem Speichern. Tabwechsel/Schließen/erneutes Öffnen brechen laufende Effekte ab. Reduzierte Bewegung/Effekte aus zeigen statische Zustände ohne Partikel. Effekte erzeugen keine Ressourcen, blockieren keine Aktion und wiederholen keine Transaktion. Vorhandene UI-/Kauf-/Unlockclips folgen den bestätigten Aktionen; Lautstärke, SFX-Stummschaltung und Sichtbarkeit bleiben wirksam.

Größenänderungen eines `ItemPortrait` binden keine Grafik neu und aktivieren keine Objekte während des uGUI-Clippings. Damit bleibt schnelle Herstellung/Fusion trotz Pixel-Snapping sicher; keine Änderung der Herstellungskosten oder Ergebnisregeln.

## Arbeitsmittel und reproduzierbarer Aufbau

Installiertes offizielles Unity-Agent-Plugin **0.1.8-beta** geprüft. Gelesen: `ui-ugui` und `references/scrollview-setup.md`; `sprite-editor` samt `templates.md`, `background.md`, `api_reference.md`; Pixel-Art-Sampling-Hinweise aus `2d-pixel-perfect`/`sprite-settings.cs`. Letzterer schließt UI-only-Kamerakonfiguration aus: der vorhandene Canvas Scaler bleibt, Canvas Pixel Perfect ist aktiviert, keine neue PixelPerfectCamera/Pipeline installiert. Kein Animations-Skill gehört zu den 32 installierten Skillverzeichnissen. Die Sequenzen verwenden deshalb die vorhandene Anbindung und die offiziellen APIs [AnimationCurve.Evaluate](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AnimationCurve.Evaluate.html) und [Time.unscaledDeltaTime](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Time-unscaledDeltaTime.html).

Bestehende Editor-Batch-/PlayMode-Anbindung weiterverwendet, keine behauptete Live-MCP-Anbindung. Editor exakt **6000.3.26f1**. Vor jedem Start außerhalb des eingeschränkten Prozessblicks auf laufende Unity-Hauptprozesse geprüft. Keine zweite Projektinstanz/Lockdateilöschung/Sitzungsneustarts.

`IdleIntelligence.Editor.ApplyPixelDesign.Build` importiert die neuen Texturen und speichert neue, eigenständige Spriteassets mit Rändern und Alpha-Zuschnitten. Vorhandene Sprite-Importer-Rechtecke/Pivots/IDs werden nicht umgeschrieben, `.meta` wird nicht von Hand bearbeitet. Die originalen Labor-/Hardware-/Itemtexturen erhalten ausschließlich gezielte Point-Sampling-Einstellungen. Ihre Bildpixel bleiben unverändert. Der bisherige Szenenaufbau ruft den neuen Abschnitt abschließend auf, sodass ein erneuter Aufbau nicht auf den provisorischen Look zurückfällt.

## Assets und Herkunft

Die drei Dateien in `Assets/IdleIntelligence/Resources/PixelUI/` wurden mit der eingebauten Bildgenerierung ausdrücklich für diesen Auftrag erstellt. Finalbilder wurden ins Repository kopiert; keine Projektverweise auf einen privaten Generierungs-Cache. Prompts, Quelldateien und Prüfsummen: `unity-design-03-assets.json`. Keine fremden Archero-Assets, Asset-Store-Pakete oder neuen Grafikbibliotheken übernommen. Der Qualitätsvergleich bedeutet keine Verwendung fremder Spielgrafiken.

Originale Labor-, Hardware-, Ressourcen-, Item- und Materialgrafiken bleiben aus dem bisherigen Repository. Herkunftsnachweise: `game-art-atlases.md`, `item-artwork-rework.md`, `artwork-integration.md`. IBM Plex Mono/Silkscreen bleiben mit ihren vorhandenen Lizenzen unter `Resources/Fonts/`; keine fremde Zielbildschrift ohne Lizenz übernommen. Die generative Herkunft der neuen Skins ist ausgewiesen; es wird keine erfundene Fremdlizenz/CC0-Zertifizierung behauptet.

## Visuelle Prüfung und tatsächliche Ergebnisse

Ausgangsstand vor Änderungen: vier bestandene PlayMode-/Aufnahmetests. Medien dieses Abschnitts: `media/unity-design-03/`, ausschließlich tatsächliche Unity-Renderbilder und zeitgestempelte echte Frames. Kein nachgebautes Browserbild, keine Mockupmontage und keine retuschierte Abnahme. Statische Fensterbilder entstehen nach dem Einblenden, der Mitschnitt zeigt die Übergänge selbst.

Vergleich mit dem Zielbild: dominanter Kern, dunkle ausgearbeitete Kanten, Goldkäufe/Training, Cyan-Energie, klares großes Item/Originalrarität, gut getrennte Text-/Kosten-/Aktionshierarchie. Sichtbare Korrekturen während der Arbeit: zu feine Kanten, ungünstiger Aufnahmezeitpunkt während der Einblendung, doppelte Levelanzeige, zu wenig Platz am X, schlecht erkennbare deaktivierte Upgrades, Kostenumbruch und übergroße Partikel an kleinen Slots.

Ein nativer Burst-Compilerabsturz wurde unter `/tmp/idle-design3-burst-crash.log` gesichert. Der betroffene Lauf wird nicht als bestanden gewertet. Folgeprüfungen verwenden das vom installierten Burst-Paket unterstützte **`--burst-disable-compilation` nur pro Prozess**. Keine Projekt-/Paketumschaltung und keine Umdeutung als Geräte- oder Burst-Abnahme. Der reine C#-Spielkern bleibt unverändert.

Endgültige Testresultate, Exitcodes und Medienprüfsummen: `unity-design-03-verification.json`. Die zwei zunächst gefundenen schnellen Craft-/Fusionsregressionen bleiben nachvollziehbar dokumentiert und werden durch gezielte sowie vollständige Nachläufe geprüft.

## Play-Anleitung und Abgrenzung

Editor **6000.3.26f1**, Projekt `IdleIntelligence/`, Szene **`Assets/Scenes/IdleIntelligence.unity`**, Game View **390×844**, **Play**. Zusätzlich 320×568 und 430×932 ansehen. Bestehende Saves laufen weiter; nicht löschen.

Labor an verschiedenen Stellen tippen, normale Ladung bis Overdrive aufbauen, tatsächliche Produktion/Kernzustand beobachten; Hardware über Goldbutton kaufen. Modell-/Trainingsbereich öffnet die bisherigen Systeme. Items → Inventar → Item: Wirkung/Vergleich lesen, Ausrüsten, tatsächlichen Sockel beobachten; Upgrade-Materialien und deaktivierte Aktion prüfen; Weitere Aktionen für Sperren/Schmieden/Fusion/Zerlegen öffnen. Bei 320 px innerhalb des Fensters scrollen. Sprache DE/EN und Effekte unter Forschung → Einstellungen wechseln. Ausrüstung nach Reload kontrollieren.

Vorbereitete Aufnahmezustände sind ausdrücklich `PREPARED TEST SAVE`, in eigenen temporären Saves. Sie beweisen keine natürlichen Erwerbswege. Unveränderte Sourceprobleme wie der Erkenntnisarchiv-Erwerb werden nicht umgangen.

Bewusste Abweichungen vom illustrativen Zielbild: vier echte Konten statt drei, tatsächliche Preise/Level/Beträge, originale lizenzierte Schrift und Originalmotive; auf kurzen Ansichten bleiben Hardware und längere Details scrollbar. Kein dauerhafter Strahlenkranz am Item, sondern begrenzte Revealpartikel. Physische iPhone-/Android-, Notch-, freie Unicode-Fontfallback- und native Haptikabnahme bleibt offen. Übrige Bildschirme folgen auf dieser Grundlage; keine pauschale Gestaltungs-/Releasefreigabe.

Abschließender Befund: **60/60 PlayMode**, **128/128 EditMode**, gezielte schnelle Werkstatt-Nachprüfung **3/3**, Ausgangsaufnahme **4/4**; Compile Exit 0. Typecheck, **1.886 Vitest-Tests in 143 Dateien**, Web-Build und vollständiges `unity:check` erfolgreich. Die letzten reinen Preis-/Skinänderungen sind zusätzlich im abschließenden vollständigen PlayMode-Lauf geprüft; der unveränderte Domain-/Savekern ist durch den vollständigen EditMode-Lauf belegt. Alle Asset-/Ordner-`.meta` vorhanden. `src/` und Saveformat unverändert.

Der neue Mitschnitt enthält **200 tatsächliche Unity-Frames**, **13,358 Sekunden gemessenen Ablauf**, H.264/VFR mit 13,40 Sekunden Containerdauer. Vollständig mit Zeitstempel-Passthrough dekodiert: 200 Frames, Exit 0. Drei normale Taps, automatische Overdrive-Aktivierung, gedrückter Kaufbutton mit echtem Kauf (10 → 11), Item-Reveal, Ausrüsten und Feedback am tatsächlichen Sockel; anschließend ausgerüstete Ansicht. Kein interpoliertes Video und keine nachgebauten UI-Bilder. Die Aufzeichnung ist **ohne Audiospur**; Clipaufrufe und Einstellungen bleiben im echten Audiocontroller angebunden, keine Behauptung einer aufgenommenen/gehörten Geräte-Audioprüfung.

| Ausgangsstand | Tatsächliche Umsetzung |
|---|---|
| [Labor vorher](media/unity-design-03/before-labor-de-390.png) | [Labor nachher](media/unity-design-03/labor-de-390.png) |
| [Quantenmodul vorher](media/unity-design-03/before-long-de-390.png) | [Quantenmodul nachher](media/unity-design-03/long-de-390.png) |
| [Sockel vorher](media/unity-design-03/before-items-de-320.png) | [Sockel nachher](media/unity-design-03/empty-de-320.png) |

Weitere Belege: [EN 320](media/unity-design-03/long-en-320.png), [DE 430](media/unity-design-03/labor-de-430.png), [tatsächliche Nachteile](media/unity-design-03/drawback-en.png), [reduzierte Bewegung](media/unity-design-03/reduced-motion.png), [echter Unity-Mitschnitt](media/unity-design-03/labor-items.mp4). Die nach Sichtprüfung korrigierte Preiszeile verwendet getrennte Layoutzellen für Originalmünze und Zahl; die drei Inventarreiter verwenden dieselbe Stahlhaut. Der verwendete generierte Panelentwurf hat minimale Resttransparenz; die rahmenlose deckende Füllung sorgt für ein vollständig deckendes Fenster unter einer einzigen texturierten Haut.
