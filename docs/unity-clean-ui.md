# Ruhige Hauptansichten und gleich große Ausrüstung · 26.10.2026

Die dauerhafte `PREPARED TEST SAVE`-Fußzeile ist aus der Spieloberfläche entfernt. Das interne QA-Merkmal bleibt für Diagnose und Balanceauswertungen im Save erhalten; ein finanzierter Teststand wird dadurch nicht zum natürlichen Spielstand. Die hier dokumentierten neuen Bilder stammen ausdrücklich aus isolierten vorbereiteten Prüfsaves. Speicherfehler und die aktive Challenge-Isolation bleiben sichtbar.

Automatisches Speichern war bereits vorhanden und bleibt unverändert: alle5s, sofort nach bestätigten Transaktionen und beim Appwechsel/Pausieren/Beenden. Manuelles Speichern im Hamburger-Menü ist optional. Ein neuer UI-Test verifiziert tatsächlichen Dateifortschritt und passive Einnahmen nach6s ohne Speicherklick, einschließlich erneutem Einlesen über den atomaren Savevertrag. Keine zusätzlichen synchronen Saves pro Tick.

Die Labor-Trainingstaste verwendet dieselbe goldene Oberfläche wie Hardwarekäufe,104×44 logische Einheiten innerhalb einer54hohen Modellzeile. Alte konkurrierende Mindesthöhen sind entfernt, Fettschrift und Textgrößen sind abgestimmt. Modell, aktive Trainingsrestzeit und Produktion bleiben verbunden.

Die Ausrüstung zeigt zwei symmetrische Dreierreihen um den Original-KI-Kern. Modellname darüber, Produktion und kompakter Detailzugang darunter; die technischen Q/E/G-Kürzel stehen in der Trainingsansicht statt ständig im Modellbild. Alle sechs Sockel und freigeschaltete Universalsockel verwenden88×88 und dieselbe sichtbare Außenabmessung. Die gemeinsame Rahmenkomponente normalisiert auch die tatsächlichen Dreiecks-/Kreis-/Viereckkonturen, nicht nur deren leere RectTransforms. Originale Slotformen, Seltenheitsfarben, Itemgrafiken und Zentrierung bleiben erhalten. Die Universalsockel werden einzeln erst bei bestehendem K10-Zugang bzw. erforderlichem Modelllevel erzeugt; ohne Zugang verschwindet die gesamte Zusatzreihe. Keine Unlock-Regel oder Savebelegung geändert.

Forschung verwendet das vorhandene Forschungssymbol als Bereichsbild statt eines zweiten großen Datenkristalls. Datenkosten besitzen nur ein kleines20er Ressourcenicon; die inneren Kostenlayouts blähen dieses nicht mehr auf. Startaktion, Kostenprüfung, automatische Warteschlange, Restzeit und Details bleiben erhalten.

## Bilder und Prüfung

`docs/media/unity-clean-ui/`: tatsächliche Labor-/Forschungs-/leere und belegte Ausrüstungsbilder DE/EN bei320/390/430px sowie freigeschaltete Universalsockel. Die unveränderten historischen Vorherbilder dienen der Gestaltungseinordnung; Fortschrittsstand und Navigation können abweichen. Keine Mockups, Bildbearbeitung oder neuen Fremdassets. Vorhandene Originalgrafiken und Fontlizenzen unverändert. Reproduzierbar über `CleanPresentationTests`, `MetaVisualSectionTests` und `scripts/package-unity-clean-ui.py`.

Kleinste Ansichten selbst angesehen: Training bleibt innerhalb seiner Zeile, die sechs Sockel sind symmetrisch und gleich groß, Fund-/Itemgrafiken bleiben innerhalb ihrer gemeinsamen Rahmen. Forschung trennt Thema und Ressourcenkosten; Namen und Startaktionen sind ohne doppelte Großicons erkennbar. Vorhandener Scroll-/Safe-Area-Vertrag statt Überlagerung der unteren Navigation. **111/111PlayMode** (517,22s), **142/142EditMode** (125,82s), Typecheck, **1937/1937Vitest in147Dateien** und Produktionsbuild bestanden. Drei neue UI-Tests prüfen echtes automatisches Speichern/Reload, versteckte Testfußzeile, Trainingsgeometrie/-farbe, unterschiedliche Forschungs-/Kostenicons, tatsächliche Meshaußenmaße aller Sockelformen und automatisches Ein-/Ausblenden über echte `MetaRules.Select`-Modellwechsel; der dritte prüft die gesamte Mira-Textseite nach Reload. Bestehende Item-/Slot-/Save-/Offline-/Animationsfälle bleiben grün. [Maschinenlesbare Nachweise](unity-clean-ui.verification.json). Simulatornachweis folgt getrennt.

## Weitere optische Prioritäten

1. Unterreiter über Schmiede/Forschung/Shop hinweg einheitlich verdichten; die derzeitigen zweizeiligen Reiter sind bedienbar, beanspruchen aber viel Höhe.
2. Laufende Labore und Trainingsaufträge mit gemeinsamen kompakten Zustands-/Restzeitanzeigen darstellen; Details sekundär halten.
3. Kostenabstände und Textgrößen in älteren Shop-/Analyse-/Detailansichten an die geprüften kompakten Kostenicons angleichen.
4. Lange Übersetzungen, Itemnamen und große Bestände auf realen Geräten weiter abnehmen; keine pauschale Behauptung, jede übrige Ansicht sei bereits fertig gestaltet.

Neue Illustrationen, eine weitere Effektserie und Balanceänderungen gehören nicht zu diesem Abschnitt. Physische Touch-, Audio- und60fps-Abnahme bleibt getrennt vom Simulator-/Editorbild.

## Zusätzlicher nativer Befund: Mira nach Reload

Der erste native Build0ceb38d5 machte im normal fortgesetzten Save den neu erschienenen Prestige-Hinweis sichtbar. Dabei war der Mira-Text abgeschnitten. Ein gezielter A/B-Test reproduzierte das nach Reload: benötigte Texthöhe76,78, verfügbar58. Die Sprechblase hatte vor dem endgültigen Canvaslayout gemessen und danach keine neue Textbreite berücksichtigt. Sie misst jetzt nach dem Layout erneut und ändert Höhe/Offsets nur bei tatsächlicher Änderung; weder forcierter Canvasrebuild noch Storyfortschritt aus dem Layout. DE/EN320/390/430 nach tatsächlichem Reload geprüft, gesamte aktuelle Textseite passt und `Story.open` bleibt unverändert. Die sechs zusätzlichen Mira-Bilder zeigen bewusst einen wiedergeöffneten Dialog im vorbereiteten Teststand.

Separates bestehendes Quellproblem: `src/story.ts` definiert `prestige-ready` nur als deutschen Funktionstext; auch die bisherigen generierten sieben Unity-Sprachkopien sind deshalb deutsch. Die englische UI-Aufnahme zeigt diese unveränderte Quellkopie neben englischen Bedienaktionen. Eine fehlende Quellübersetzung wird hier nicht als bereits abgeschlossene Lokalisierung ausgegeben.

## Bildauswahl

Alle Nachherbilder hier sind tatsächliche Unity-Aufnahmen aus isolierten Prüfsaves. Der normale Simulator-Spielstand wird dafür nicht verändert.

| Ansicht | Vorher (historisch) | Nachher |
| --- | --- | --- |
| Labor | [Ausgangsstand](media/unity-clean-ui/before-labor-de-390.png) | [Kompakte goldene Trainingstaste](media/unity-clean-ui/labor-de-390.png) |
| Ausrüstung | [Frühere Anordnung](media/unity-clean-ui/before-equipment-de-390.png) | [Sechs gleiche Sockel mit Originalitems](media/unity-clean-ui/loadout-filled-de-390.png) |
| Forschung | [Doppelte Datenmotive](media/unity-clean-ui/before-research-de-390.png) | [Themenbild und kleine Kosten](media/unity-clean-ui/research-de-390.png) |
| Mira nach Reload | Fehler numerisch und im privaten nativen Bild von0ceb38d5 nachgewiesen | [Vollständige Seite bei320px](media/unity-clean-ui/mira-prestige-de-320.png) |
