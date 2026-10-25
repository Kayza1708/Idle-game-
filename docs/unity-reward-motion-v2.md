# Truhen, Gumball und mobile Mira-Sprechblase · 25.10.2026

## Befund und gezielte Änderung

Ausgangsstand: `72b6b719` auf `codex/unity-rewrite`, PR154 offen als Draft; Remote-main `05376eff`. Keine bestehenden Arbeitsänderungen überschrieben. TypeScript, Capacitor-ios, Originalgrafiken und normale Saves bleiben erhalten.

Der alte Truhenrenderer schnitt das perspektivische Original entlang einer horizontalen Linie. Das anschließende Verformen dieses Ausschnitts, eine generierte gestreifte Innenseite und eine separate Muldengeometrie ergaben widersprüchliche Perspektiven. Der alte Renderer ist aus dem Prefab entfernt. Stattdessen zeigen 24 abgestimmte Öffnungszeichnungen vier Original-Farbstufen mit jeweils sechs Posen. Der Korpus wird über eine gemeinsame Basis registriert; der Deckel bleibt in den Zeichnungen am hinteren Scharnier. Die offene Truhe bleibt beim Herauskommen der tatsächlichen Beute sichtbar.

Der Gumball-Automat verwendet eine abgeleitete leere Maschine, eine registrierte Kurbel und separat bewegte Kapseln im Glas. Keine zusätzlichen kreisenden Kugeln über bereits eingezeichneten Kugeln und keine zur Linie gestauchte Ausgabetür. Ablauf: kurzer mechanischer Vorlauf, Kurbelumdrehung, Ausgabe am tatsächlichen Fach, Fall/Abfedern, Anheben, getrennte Original-Kapselhälften, echte Ergebnisdarstellung. Beim Abgleich der ersten Aufnahme wurde ein tatsächlicher Zustandsfehler gefunden und behoben: Nach einer Truhe blieb die Kapsel transparent. Ihre Farbe wird jetzt beim Vorbereiten zurückgesetzt; die Regression prüft ausdrücklich Truhe → Gumball. Der Hälftenzuschnitt liegt an der tatsächlichen Naht statt an der Mitte des Atlasfelds. Eine weitere Sichtprüfung korrigierte den Abstand der abgestellten Truhe zu den Materialzahlen; eine geometrische UI-Regression schützt diesen Abstand. Auch der erste bereits geladene Common-Frame erhält explizit seine tatsächliche Spritehöhe statt kurz auf ein Quadrat gestreckt zu werden.

Mira verwendet eine gemeinsame kompakte Sprechblase im automatischen Tutorial und in der Storyansicht. Portrait, kurze Textseite und untere Aktionen liegen innerhalb derselben Fläche. „Weiter“/„Überspringen“ bleiben mindestens44 logische Einheiten hoch; Namenswahl ergänzt ein Eingabefeld. Der laufende Spielinhalt und Navigation bleiben außerhalb der Box bedienbar. Dialoge werden seitenweise gelesen; Namensregeln, Ereignisse, Skip/Resume und Speicherung bleiben unverändert.

## Grafik und technische Umsetzung

- uGUI bleibt erhalten. Neue Grafiken sind einzelne Runtime-Assets, keine Bildschirmmockups.
- `Art/chest-opening-v2.png`: eigener mit Imagegen anhand des eigenen `ShopChests.png` erzeugter24-Posen-Atlas,1536×1024. Sechs chronologische Posen je Typ; Point Filtering, keine Mips/Kompression. Separate Sprite-Assets mit registriertem Basispivot. Die Bildgenerierung hielt die Zeilenabstände nicht exakt ein; ein blindes6×4-Raster zeigte in der Sichtprüfung Nachbarstreifen. Der Editor erkennt deshalb pro Spalte vier tatsächlich getrennte Konturen und erzeugt daraus nicht überlappende Sprite-Rechtecke. Kein Retuschieren der Belegbilder.
- `Art/capsule-machine-empty-v2.png`: eigene abgeleitete Grafik aus dem eigenen `CapsuleMachine.png`; Maschinenidentität bleibt erhalten, feste Kugeln und Kurbelplatte entfernt. Die Originale bleiben erhalten.
- Kapselhälften stammen aus dem vorhandenen eigenen `MobileSprites.png`; keine externen Spielgrafiken oder Archero-Assets übernommen. Die neuen generierten Ableitungen wurden für dieses Projekt erstellt; bisherige Herkunfts-/Lizenznachweise der Originale gelten weiter. Keine fremde Assetlizenz hinzugefügt.
- Reproduzierbarer Editor-Schritt: `IdleIntelligence.Editor.BuildRewardMotionV2.Build`. Sprite-Assets werden durch den Unity-Editor erzeugt; keine handgeschriebenen Sprite-Metadaten. Bestehende GUIDs bleiben erhalten.
- Zeit basiert auf tatsächlicher verstrichener Zeit. Die Darstellung besitzt keinen Grant-Callback. Kauf/Öffnung wird vor der Animation atomar gespeichert; reine Darstellung verändert keinen Bestand.
- Ein wiederverwendbares Belohnungsfenster, begrenzte zwölf Kapseln, keine Effektwarteschlange. Wiederholung ersetzt die Darstellung, nicht die bereits gespeicherte Transaktion. Navigation/Background/Schließen brechen kosmetisch ab; Kürzen überspringt zur Endphase. Reduzierte Bewegung zeigt direkt das gespeicherte Ergebnis.
- Vorhandene tatsächliche Spielclips `gumball-turn`/`gumball-open` und Truhenfeedback verwenden unveränderte Audioeinstellungen. Kein nachträglicher Videosound, keine simulierte Sprachausgabe.

## Prüfstand und Belege

Unity6000.3.26f1, lokaler macOS-Editor, tatsächliche laufende Szene `Assets/Scenes/IdleIntelligence.unity`. Offizielle installierte uGUI-/Sprite-/Unity-CLI-Skills und Referenzen verwendet. CLI1.0.0-beta.14 ist aktuell, meldet aber keinen verbundenen Pipeline-Editor. Deshalb vorhandene Editor-/PlayMode-Testanbindung mit laufenden Frames, echten Game-View-Captures und Console-Logs verwendet; keine Live-MCP-Steuerung behauptet. Vor jedem Batch wurde auf einen laufenden Unity-Editor geprüft.

Alle finanzierten Aufnahmen verwenden isolierte temporäre Saves und eine sichtbare Unity-Teststandbeschriftung. Normale Spielstände wurden nicht finanziert oder zurückgesetzt. PNGs und Video enthalten tatsächliche Unity-Ausgabe ohne Bildnachbearbeitung, Zwischenbildberechnung oder künstliche Zeitlupe. Die Videoframes verwenden ihre gemessenen Originalzeitstempel. Ton wird während des Laufs aus Unity abgegriffen.

- Finaler vollständiger PlayMode-Lauf: **97/97 bestanden**,437,13s, Batch-Exit0. Enthält echte gespeicherte Truhen-/Gumball-Transaktionen, Truhe→Gumball-Sichtbarkeit, rasche Folgeaktionen, Tabwechsel, reduzierte Bewegung, Reload, alle Sprach-/Speicher- und bisherigen Spielregressionen.
- Finaler vollständiger EditMode-Lauf: **142/142 bestanden**,126,88s, Batch-Exit0. Zusätzliche Verträge gegen überlappende Atlasrechtecke, falsche Common-Erstgröße und doppelte Kapselband-Ausschnitte.
- `npm run typecheck`, **1937/1937 Vitest in147 Dateien**, `npm run build`: Exit0. Bestehende Vite-Chunkgrößenwarnung, keine TypeScript-/Balanceänderung.
- Tatsächlich angesehen:31 rohe Game-View-PNGs einschließlich Vorherbild; DE/EN jeweils320/390/430 für Mira-Namenswahl/Dialog, offene Truhe, Kapselausgabe und tatsächliche unterschiedliche Resultate. Konturstreifen, unsichtbare Kapsel, doppelte Halbringe und überlappende Materialzahlen vor finaler Aufnahme korrigiert.
- [Echte Truhensequenz](media/unity-reward-motion-v2/chest.mp4):4,303s, eine tatsächliche Unity-Audiospur.
- [Echter Gumball-Ablauf](media/unity-reward-motion-v2/gumball.mp4):4,813s, eine tatsächliche Unity-Audiospur. Die endgültigen ausgegebenen Videos wurden zusätzlich zurückdekodiert und ihre Phasen geprüft.
- Erster Gesamtlauf96/97: veralteter `StoryNamePrompt`-Testzugriff nach Konsolidierung auf die gemeinsame Box; anschließend auf den tatsächlichen `MiraCoach.Speech`-Verbraucher umgestellt, dieselbe erwartete Quelle für alle sieben Sprachen beibehalten. Vorbereitete Gumball-Aufnahme zunächst korrekt vom echten Prestige-Unlock abgewiesen; nur den isolierten Teststand vervollständigt, keine Freischaltregel geändert.

## Spieltest

1. Szene `Assets/Scenes/IdleIntelligence.unity` öffnen, Play starten. Beim frischen Start zeigt Mira die Namenswahl, danach kurze Dialogseiten mit Aktionen in derselben Box.
2. Vorhandenen Fortschritt erhalten. Über das Menü den Markt öffnen und eine verfügbare freie oder bezahlbare Truhe öffnen. Deckel und Korpus müssen zusammenbleiben; die offene Truhe hält, während die gespeicherten Funde austreten.
3. Nach dem bestehenden Prestige-Unlock über den vorhandenen Shopzugang den Gumball-Automaten öffnen. Bei ausreichenden Gems bzw. einem vorhandenen Gutschein ziehen. Besonders direkt nach einer Truhe prüfen: Kapsel muss sichtbar aus dem Fach kommen und sich in zwei saubere Hälften öffnen.
4. Kürzen, Schließen oder Tabwechsel während der Darstellung verwenden; Ergebnis bleibt einmal gespeichert. Effekte deaktivieren: statisches Ergebnis ohne Bewegungssequenz. Keine Werbung erfolgreich simulieren.

## Grenzen

Die Beurteilung bezieht sich auf die tatsächlich angesehenen Editorbilder/-frames und laufenden Aufnahmen, nicht allein auf Tests. Die Truhe verwendet bewusst gezeichnete Pixel-Art-Posen; die Beute- und Kapselbewegung läuft zeitkontinuierlich. Physischer iPhone-Touch, Lautsprecher und60-fps-/Wärmeabnahme sind hiermit nicht nachgewiesen. Der bisher installierte Simulatorplayer wird durch Editoränderungen allein nicht aktualisiert. Allgemeine Markt-/Shopverdichtung und historische Sprachfallbacks außerhalb dieses Abschnitts bleiben separat.
