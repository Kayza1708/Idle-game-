# Unity · Überarbeitung des ersten Designabschnitts

Stand: 22.10.2026. Fortsetzung nach gemergtem PR #141 (`2a85e0dd`), Arbeitsbranch `codex/unity-rewrite`. Die ursprünglichen unversionierten Backups, Simulationsdateien und `ios/` bleiben unberührt. Keine Economy-, Saveformat-, Originalgrafik- oder SDK-Änderung. Übrige Bildschirme erhalten keinen neuen Designentwurf.

## Offizielles Unity-Plugin

Das offizielle [Unity-Agent-Plugin](https://github.com/Unity-Technologies/unity-agent-plugin) wurde nach dessen [Installationsanleitung](https://github.com/Unity-Technologies/unity-agent-plugin#installation) installiert:

```sh
codex plugin marketplace add Unity-Technologies/unity-agent-plugin --json
codex plugin add unity@unity-agent-plugin --json
```

Verifiziert: `unity@unity-agent-plugin`, installiert und aktiviert, **0.1.8-beta**, unter `~/.codex/plugins/cache/unity-agent-plugin/unity/0.1.8-beta`. Die Konfiguration wurde vorher nach `/tmp/idle-unity-plugin-config-before.toml` gesichert; hinzugefügt wurden nur dieser Marketplace und dessen aktivierter Plugin-Eintrag. Keine laufende Codex-Sitzung wurde neu gestartet oder umgestellt. Für die automatische Skill-Erkennung eine **neue Codex-Sitzung nach Abschluss dieses Auftrags öffnen**; bestehende parallele Sitzungen können unverändert weiterlaufen. Die installierten Skilldateien wurden in dieser Sitzung direkt gelesen und angewendet.

Verwendete Anleitungen: `ui` → `ui-ugui`, dessen `references/scrollview-setup.md`; `sprite-editor` samt `references/templates.md` und `background.md`; `2d-pixel-perfect` samt `references/sprite-settings.cs`; `unity-cli` samt PlayMode-Verifikationsschleife. Gezielte Änderungen bestehender uGUI-Hierarchien, vorhandener Canvas Scaler, unveränderte Originalsprite-Importer und GUIDs. Die Pixel-Perfect-Kamera-Anleitung schließt UI-only-Ansichten ausdrücklich aus. Der bestehende Legacy-Text-/Lokalisierungsvertrag bleibt erhalten; keine pauschale TMP-Umstellung.

Die separate Unity-CLI ist **1.0.0-beta.13** (`~/.unity/bin/unity`); ihre lesende Updateprüfung meldet beta.14, ohne Installation. `unity status --project-path … --format json` meldete `STATUS_NO_INSTANCES`. `com.unity.pipeline` fehlt im Projekt; deshalb wird keine Live-CLI-/MCP-Steuerung behauptet. Die funktionierende Anbindung bleibt der installierte Editor **6000.3.26f1** mit Batch-/PlayMode-Testläufen. Vor jedem Start wurde außerhalb des eingeschränkten Prozessblicks geprüft, dass kein Unity-Hauptprozess läuft; keine zweite Projektinstanz, keine Lockdateilöschung.

## Tatsächliche Änderungen

- Generierte gemeinsame UI-Fläche auf kleine Ecken reduziert; bestehendes Asset und Referenzen erhalten. Kein zusätzlicher Rahmen über alten Flächen.
- Header-Speichern als kleines Vektorsymbol mit großer transparenter Trefferfläche; zusätzlicher ausdrücklicher Befehl **Forschung → Einstellungen → Jetzt speichern**. Schreibsperren bleiben wirksam.
- Modell/Training als flache kompakte Zugänge. Tutorialhinweise bleiben bei aktivem Tutorial sichtbar; übersprungene/abgeschlossene Führung beansprucht keine dauerhafte Laborfläche.
- Ausrüstung und Inventar verwenden dieselbe Portrait-Komponente, Artgröße, Zentrierung, Seltenheitsfarbe und tatsächliche Itemform. Auch belegte Universalslots behalten die Itemform. Gesperrte Slots bilden eine kompakte Schlossreihe; konkrete Freischaltung im Detail statt technischer Knoten-IDs.
- Inventar zeigt keine dort irrelevante Komponenten-/Fragmentzeile oder Herstellungsoptionen. Herstellung/Fusion, Bewegungsoption und Mengenwahl bleiben in den zuständigen Ansichten bzw. Itemaktionen vorhanden.
- Itemdetails: lokalisierter Name, Seltenheit/Level, Wirkung, kontextbezogener Vergleich, kompakte vorhandene/benötigte Materialkosten und klare Hauptaktion. Unveränderte Werte entfallen; tatsächliche Nachteile bleiben rot. Vergleich beim Anlegen gegen die aktuelle Ausrüstung, beim ausgerüsteten Item gegen dessen nächstes Level. Alternative Zielsockel ändern zuerst die Vorschau; erst die Hauptaktion führt die gespeicherte Transaktion aus.
- Sperren, Schmieden, Zerlegen und Fusionswahl unter **Weitere Aktionen**. Scrollbarer Detailinhalt bleibt erreichbar. Zusätzliche Texthöhe verhindert das Abschneiden der letzten Vergleichszeile; neue lokalisierte Labels werden bereits bei Initialisierung übersetzt.
- Tapfeedback verwendet den Pointer-Ort und den tatsächlichen Creditunterschied der erfolgreichen, bereits gespeicherten Tapaktion. Keine nachträgliche Schätzung aus passiver Produktion. Keine Belohnung im Effektcode.
- Overdrive zeigt goldenen Kernring und Badge, einen kurzen Aktivierungsimpuls und zurückhaltende umlaufende Energie. Kein Bildschirmblitz und kein globales Zoomen. Reduzierte Bewegung/Effekte aus: statischer Kernzustand und stationäres Tapfeedback. Tabwechsel beendet laufende Anzeigeeffekte; Reload spielt keinen Aktivierungsimpuls nach.

## Visuelle Abnahme und Belege

Tatsächliche Unity-uGUI-Bilder mit Originalgrafiken; Canvas vorübergehend an eine RenderTexture der Zielauflösung gebunden, anschließend zurückgestellt. Keine Browseransicht, Montagen oder nachgebauten Bilder. Ausgangsbilder wurden vor Änderungen durch drei bestandene Editor-/PlayMode-Nachweise erstellt. Die Medien dieses Durchlaufs liegen unter `media/unity-design-02/` (**38 Original-PNGs, ein Video und dessen Zeitprotokoll**); die Ausgangsserie des Vorgängerabschnitts bleibt erhalten.

Geprüft werden 320×568, 390×844 und 430×932, Deutsch/Englisch, Labor, leere/belegte Sockel, Schlossreihe, längster kanonischer deutscher Itemname, Spezialeffekt und tatsächlicher schlechterer Ausrüstungswechsel. Teststände sind ausdrücklich als `PREPARED TEST SAVE` markiert, in temporären separaten Saves; kein natürlicher Erwerbsnachweis des Erkenntnisarchivs.

Bei Sichtprüfung korrigiert: abgeschnittene letzte Vergleichszeile, doppelte Profil-/Gerätewirkung, große sekundäre Aktionsflächen, verzögert übersetzte neu erzeugte Labels und zu kleine tatsächliche Touchflächen beim Herunterskalieren. Detailaktionen besitzen eine größere transparente Trefferfläche als die sichtbare kompakte Hauptaktionsfläche. Es wird keine physische Geräteabnahme behauptet.

## Play-Anleitung

1. Editor **6000.3.26f1**, Projekt `IdleIntelligence/`, Szene **`Assets/Scenes/IdleIntelligence.unity`** öffnen; Game View 390×844, zusätzlich 320×568 und 430×932. **Play**.
2. Labor: an verschiedenen Punkten tippen, Ladung bis zur bestehenden Schwelle aufbauen, Aktivierung am Kern und tatsächliche Produktion beobachten. Unter Einstellungen Effekte deaktivieren; Zustand bleibt sichtbar, Bewegung entfällt.
3. Items → Inventar: leere/belegte Sockel und Schloss-Symbole öffnen. Item öffnen: Vergleich lesen, gegebenenfalls unter Weitere Aktionen einen anderen Zielsockel wählen, dann Anlegen bestätigen. Ausgerüstetes Item zeigt Ablegen und nächstes Level. Kosten rot/grün zeigen tatsächlichen Bestand/Bedarf.
4. Weitere Aktionen aufklappen; Sperren/Schmieden/Zerlegen/Fusionswahl bleiben bedienbar. Bei kleinem Bildschirm innerhalb des Detailfensters scrollen. Schließen kehrt in die bestehende Ansicht zurück.
5. Forschung → Einstellungen: Sprache DE/EN umschalten, Jetzt speichern verwenden. Play beenden/neu starten; Ausrüstung und Einstellungen bleiben im vorhandenen Save. Keine Originalstände löschen. Batchtests nur bei geschlossenem Projekteditor starten.

## Prüfresultate

Vollständiges EditMode: **128/128**, vollständiges PlayMode vor abschließenden Textkorrekturen: **59/59**, anschließende gezielte UI-/Medienprüfung: **4/4**. Auch der letzte vollständige PlayMode-Lauf besteht mit **59/59 auf dem abschließenden Quellstand**; Medienprüfsummen stehen in `unity-design-02-verification.json`. **Typecheck, 1.886 Vitest-Tests in 143 Dateien, Web-Build und vollständiges `unity:check` erfolgreich.** Editor-/Prefab-Compile Exitcode 0; der letzte UI-Stand wurde beim PlayMode-Start erneut importiert/kompiliert. Frühere Fehlversuche bleiben im Bericht erklärt: fehlender CanvasRenderer am neuen Vektoreffekt behoben; historische Erwartung erzwungenen Scrollens an den nun expliziten Aufklappweg angepasst.

## Abgrenzung

Keine Übertragung des Designs auf sämtliche übrigen Ansichten. Reale Notches/Safe Areas, Touchgeräte, Unicode-Spielernamen/Fallbackfonts und Plattform-Haptik bleiben Geräteabnahme. Originale Sprachfallbacks und unerreichbarer Erkenntnisarchiv-Neuerwerb bleiben getrennte Sourceprobleme. Nächste optische Themen stehen zentral in `unity-visual-backlog.md`.

Fontnachprüfung: IBM Plex Mono Regular/Bold weiterhin je 425 gemappte Codepoints, Silkscreen 222; deutsche Umlaute/ß und DE-/EN-Texte vorhanden, beide Originallizenzen unverändert mitgeführt. `→` ist in diesen Fontdateien nicht enthalten und wird im tatsächlich geprüften macOS-Editor durch Fallback gerendert; plattformübergreifende Symbol-/Namensfallbacks bleiben ausdrücklich Geräteabnahme. Die neuen Schloss-/Speichersymbole benötigen keine Fontglyphe.

Medienauswahl: [Labor DE 320](media/unity-design-02/labor-de-320.png), [Labor EN 430](media/unity-design-02/labor-en-430.png), [Inventar DE 320](media/unity-design-02/empty-de-320.png), [belegter Sockel DE 390](media/unity-design-02/equipped-de-390.png), [langes Item EN 390](media/unity-design-02/long-en-390.png), [echter Nachteil](media/unity-design-02/drawback-en.png), [Schlossbedingung](media/unity-design-02/locked-en-390.png), [Tap-/Overdrive-Mitschnitt](media/unity-design-02/tap-overdrive.mp4), [reduzierte Bewegung](media/unity-design-02/reduced-motion.png). Mitschnitt: **100 tatsächliche Frames, 8,177 Sekunden Messzeit**, H.264/VFR, 390×844, gespeicherte vorbereitete Ladung 96, drei normale Taps und vierter Tap aktiviert Overdrive. Vollständige Dekodierung mit Zeitstempel-Passthrough bestätigt 100 Frames / 8,20 Sekunden Containerdauer; keine interpolierten Zwischenbilder.
