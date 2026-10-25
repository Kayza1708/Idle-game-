# Gemeinsame Gestaltung für INT-/Axiomnetz · 25.10.2026

Ausgang: `c722e941` auf `codex/unity-rewrite`, PR154 weiterhin offener Draft. Vorhandene lokale Dateien, TypeScript, Capacitor-ios und Saves bleiben erhalten. Gemeinsame uGUI-Anleitung samt ScrollView-Referenz angewandt; vorhandene Unity-Testanbindung verwendet, kein verfügbarer Live-Pipeline-Editor behauptet. Referenzen tatsächlich untersucht: vorheriger Unity-Netzscreen, aktuelle Labor-/Mira-/Itemoberfläche, `src/prestige-network.css` und die vorhandenen ursprünglichen Netz-Prefabs. Keine zusätzlichen Archero-Bilder oder Fremdassets für diesen Abschnitt verwendet.

## Gezielte Gestaltung

- Vorherige türkisfarbene Standardflächen und fremde Standardschrift ersetzt: vorhandener Stahlrahmen, gemeinsame Originalfonts und Farbwerte aus `GameTheme`. Ein Rahmen pro Knoten, kein zusätzliches Outline. Zentralkern mit passender Stahlfassung und vorhandenem eigenem Progressionssymbol.
- Reset, Knotenkauf und bestätigter Axiomreset verwenden die vorhandene goldene Hauptaktion. Ruhige gemeinsame Flächen für Werkzeugleiste, Bereichswahl und INT-/Axiomzugang statt großer türkisfarbener Einzelkästen.
- Knotentitel, Icons und Preise mit gemeinsamen Abständen und lesbarer Schrift. Lange Namen passen mit einer korrekt gemessenen Ellipse in eine Zeile; das Detail zeigt den vollständigen Namen ohne technische Knoten-ID. Gleiche Zahlenformatierung wie Ressourcenleiste/übriges Spiel.
- Eigene vorhandene semantische Icons aller60INT-/24Axiomknoten bleiben erhalten. Gekaufte Knoten Cyan/Mint, fehlende Kosten rot, bezahlbare grün, Maximalstufen gold. Verbindungen bleiben sichtbar und zurückhaltender.
- Ein Stahlfenster für Details, kompakter Kopf mit44er-Schließen, Originalmotiv, echte Beschreibung, Guthaben/Preis und Hauptaktion. Höhe folgt dem Inhalt; lange bestehende Automationsoptionen bleiben scrollbar innerhalb der Safe Area. Keine große leere Vollbildfläche.
- Die Netzhöhe reagiert auf den tatsächlich verfügbaren umgebenden Viewport, auch nach ausgeblendetem Tutorial oder Größenwechsel. Im Test muss erst die Unity-Canvas-Berechnung abgeschlossen sein; eine frühe Aufnahme vor deren Abschluss zeigte noch240 statt343 logischer Einheiten und wurde nicht als Endnachweis verwendet.

## Unveränderte Regeln

Keine Änderungen an `src/economy.ts`, Formeln, Preisen, Katalogen, Kaufvoraussetzungen, Reset-/Erhaltungsregeln oder Save23. Verbindungen erzeugen weiterhin keine Vorgängerkaufsperre. Bestehende Pan-/Pinch-/Zoomgrenzen, beide Netzebenen, Automationskontrollen, Companyzugang, reduzierte Bewegung und gespeicherte Transaktionen bleiben erhalten. Keine neue Animation, kein neues Grafik-/Fontpaket, kein SDK.

Wiederverwendbare Präsentation: `PrestigeNetworkSkin`, vorhandene `PrestigeNode`-/`PrestigeNetwork`-Prefabs, inhaltsabhängige `PrestigeDetailLayout`. Reproduzierbarer Prefab-Schritt: `IdleIntelligence.Editor.BuildPrestigeSkin.Build`; der ursprüngliche Erstellungsweg ruft dieselben gemeinsamen Styles auf.

## Tatsächliche Prüfung

Unity6000.3.26f1 importiert und kompiliert: Batch-Exitcode0. Vollständige EditMode-Suite142/142; vollständige PlayMode-Suite99/99. Nach den abschließenden reinen Werkzeugleisten-/Axiomrasterkorrekturen wurden die beiden UI-Tests erneut ausgeführt:2/2 bestanden; danach Prefabs erneut erzeugt und die vollständigen142EditMode-Tests bestanden. Der99er-Lauf liegt vor diesen letzten Präsentationskorrekturen, nicht danach.

24 echte Unity-Aufnahmen: INT/Axiome samt Details, jeweils320/390/430px und DE/EN. Bilder selbst auf Hierarchie, Rahmen, Zentrierung, lange Namen und fehlende Kosten geprüft. Sichtbare Schwächen korrigiert: frühzeitige Viewporthöhe, Silbenumbruch und mehrzeilige Werkzeugbeschriftung. Axiom-Bereichswahl jetzt2×2, INT3×2. Gekauft/bezahlbar/unbezahlbar gemeinsam dargestellt; Kauf ohne Vorgänger, gespeicherter Besitz und Gesten geprüft. [Vorher](media/unity-prestige-skin/before-int-de-390.png), [INT nachher](media/unity-prestige-skin/int-de-390.png), [Axiome](media/unity-prestige-skin/axiom-de-390.png), [Details](media/unity-prestige-skin/detail-int-de-390.png).

Kein neuer Simulatorbuild in diesem Abschnitt: installiert bleibt der vorherige Spielcode7a3eeb26. Die neuen Bilder stammen aus dem tatsächlichen Unity-Editor-Game-View, nicht vom physischen iPhone. Vorbereitete Prüfsaves sind ausschließlich temporär und als `PREPARED TEST SAVE` gekennzeichnet. Normalen Spielerstand nicht finanziert.

Erster TypeScript-Gesamtlauf:7 Test-/Worker-Timeouts bei6203s Laufdauer. Unveränderte Limits, keine Produktionskorrektur zur Umgehung. Kontrollierter Wiederholungslauf mit nur prozessgebundenem `caffeinate -i`:1937/1937 in147 Dateien bestanden,328,33s; Typecheck und Build erfolgreich. Bestehende Vite-Chunkwarnung bleibt.

## Abgrenzung

Visuelle Beurteilung und Funktionstests getrennt. Historische Übersetzungsfallbacks in Katalogbeschreibungen und einigen Netzbeschriftungen bleiben offen; diese Gestaltung behauptet keine neue vollständige Übersetzung. Vollständige Namen und Wirkungen sind in Details erreichbar. Physische Touch-/Zwei-Finger-/Lautsprecher-/Performanceabnahme bleibt separat. Keine übrigen Spielansichten umgestaltet, kein Merge/Publish.
