# Drohnenlieferungen · 26.10.2026

## Umsetzung

Die Labor-Drohne trägt wieder ein sichtbares Paket an zwei Aufhängungen. Drohne und Paket stammen aus dem vorhandenen Originalatlas `DeliveryDrone.png`; keine neuen Fremdassets und keine Bildbearbeitung. Die vorhandene Imagegen-Herkunft und Projekt-Rechtedokumentation gelten weiter, siehe [Originalasset-Nachweis](delivery-ui-corrections.md) und [Unity-Assetübernahme](unity-design-06.md). Der bisherige Sprite-Ausschnitt enthielt nur die Drohne. Der Paketbereich wird einmal aus derselben Textur als wiederverwendbarer Sprite gebunden. Touchziel: 96 × 106 logische Einheiten, Dekoration ohne Raycasts; Ziel folgt weiterhin der bewegten Drohne.

Ein erfolgreicher Sammelklick speichert zuerst die unveränderte `Signals.Claim`-Transaktion atomar. Erst danach erstellt `RewardPresentation` aus dem Zustand unmittelbar vor/nach der Transaktion die Anzeige: alle tatsächlich vergebenen Komponenten, Credits, Daten, neue Items mit Originalbild/Slotform/Seltenheit, neue Baupläne oder Fragmente. Kein geschätzter Vorschautext und kein zweiter Grant aus der Animation. Ein zuvor unbesuchtes Inventar darf die erste Itembelohnung nicht mehr durch uninitialisierte Portraitsprites abbrechen.

Die kosmetische Sequenz zeigt Freigabe, beschleunigten Paketfall, Landung, Drohnenabflug und eine örtliche Siegelauflösung mit dem vorhandenen Pixel-Impactsprite. Der gespeicherte Inhalt steigt aus dem Paket auf; das gemeinsame Stahlfenster zeigt große Fundicons, Namen und tatsächliche Beträge. Das Labor bleibt abgedunkelt erkennbar. Das Paket verwendet die vorhandene geschlossene Originalgrafik; die Öffnung ist eine Siegelauflösung, keine neue gezeichnete Offenpose oder Truhenscharnieranimation. Ein vorhandener Spielsound wird am Enthüllungsmoment abgespielt. Kein Vollbildblitz.

Die gemeinsame Anzeige hat höchstens eine laufende Sequenz. Weitere tatsächliche Lieferungen ersetzen deren kosmetische Darstellung, niemals deren bereits gespeicherte Vergabe. Schließen, Tabwechsel, Hintergrund und Fokusverlust brechen nur die Darstellung ab. Reduzierte Bewegung bzw. deaktivierte Effekte zeigen das lesbare statische Endergebnis. Nach Reload sind Sammelzähler, Inventar und Materialien erhalten; eine verbrauchte Drohne ist nicht nochmals einsammelbar. Abgelaufene oder wegen Speicherfehler nicht bestätigte Lieferungen zeigen keinen Erfolg. Werbung und Werbeentitlements bleiben unverändert; dieser Laborfund ist keine simulierte Anzeige.

## Nachweise

- Ausgangsbild: [Drohne ohne Paket](media/unity-drone-delivery/before-390.png). Historischer tatsächlicher Unity-Teststart, daher anderes Tutorial-/Fortschrittsstadium als die markierten neuen Teststände.
- Neue Labor- und Ergebnisbilder: `docs/media/unity-drone-delivery/`, Deutsch/Englisch bei 320/390/430 px; zusätzlich volle Core-Lieferung mit Item.
- [Echte Unity-Sequenz mit Originalspielaudio](media/unity-drone-delivery/drone-delivery.mp4), vorbereiteter isolierter temporärer Teststand. Aufnahme aus tatsächlichen Game-View-Frames mit ursprünglichen Zeitstempeln, keine interpolierten Frames, keine nachträglichen Effekte oder Ersatzsounds. `capture.json` enthält Framezahl, Zeitstempel, Audio-Probe und SHA256. Reproduzierbar mit `scripts/package-unity-drone.py` nach `SignalUITests`.
- Final: Unity6000.3.26f1 Import/Compile, **108/108PlayMode** (500,39s), **142/142EditMode** (125,70s), Typecheck, **1937/1937Vitest in147Dateien**, Produktionsbuild bestanden. Bekannte Web-Chunkwarnung unverändert. [Maschinenlesbare Nachweise](unity-drone-delivery.verification.json).
- Sechs gezielte Drohnentests: realer Raycast und genau einmal gespeicherter Fund; beschädigtes Original blockiert Vergabe; Bewegung/Expiry; DE/EN-Matrix mit Abbruch, reduziertem Modus und Reload; volle Core-Lieferung vor erstem Schmiedebesuch mit Item/allen Fundzeilen; echter Videolauf.
- Video:124Originalframes,6,451s, tatsächlicher48-kHz-Stereo-Spielton, vollständiger Audio-/Videodecode ohne Fehler. PNG-Readback begrenzt die Aufnahmebildrate; keine Geräte-60-fps-Behauptung.

## Visuelle Beurteilung und Grenzen

Die erste Iteration mit dunklem Vollbild und kleinen, weit auseinanderliegenden Fundschnitten wurde verworfen. Die zweite verwendet ein kompaktes gemeinsames Stahlfenster, größere Icons und sichtbare Namen. Fensterhöhe und Raster passen sich an Inhalt/Itemfund an; volle Lieferungen erhalten drei Spalten mit getrennten Beträgen und Namen statt vier schmaler Spalten. Der Countdown steht rechts neben dem Paket, die Überschrift erscheint erst nach der Landung. Auch der anfänglich entdeckte Item-/Ressourcenüberlauf wurde vor dem finalen Lauf korrigiert; kleine Standardlieferungen belegen keine große leere Fläche. Die tatsächlichen Bilder und mehrere zeitlich aufeinanderfolgende Frames wurden selbst angesehen. Paket und Fund sind erkennbar; kleine Schrift und lange Komponentennamen bleiben auch im vollen 320-px-Fund innerhalb der vorgesehenen Zeilen. Physische Geräteabnahme bleibt separat.

Unity-Editorbilder und Simulator sind keine Abnahme von physischem iPhone-Touch, Lautsprechern, Haptik oder stabilen Geräte-60-fps. Unveränderte Werbe-/Kaufanbieter bleiben unverfügbar. Saveversion23, Balancequelle und TypeScript-Version bleiben erhalten.

## Selbst spielen

Szene `IdleIntelligence/Assets/Scenes/IdleIntelligence.unity` öffnen → Play → Labor. Im normalen aktiven Spiel erscheint eine Drohne nach dem bestehenden, durch Dropqualität veränderten Intervall (Basis90s, Untergrenze30s), sichtbar für12s. Das Paket unter der Drohne antippen. Während des Ergebnisfensters laufen Produktion und Spielzeit weiter; × schließt sofort, Tabwechsel bricht nur die Präsentation ab. Einstellungen → reduzierte Bewegung/Effekte aus zeigt statt Flug und Paketfall sofort den tatsächlichen Fund. Kein finanziertes Testsave in den normalen Spielstand importieren. Core-/Cache-Funde sind weiterhin die ursprünglichen periodischen Varianten; keine erhöhte Dropchance für diese Umsetzung.

## Tatsächlich gestarteter lokaler Player

**5f8e647bac9e9589e932840a87a8e26caf1c2e00**, Unity6000.3.26f1/IL2CPP/ARM64, **iPhone16Pro-Simulator mit iOS27.0**. Separater Export und Xcode-`ReleaseForProfiling`-Build unter `Builds/iOS-Drone-5f8e647b/`, beide erfolgreich. Kein Signingwechsel, keine Veröffentlichung und kein Start der alten Web-App. Fünf frisch gesicherte Projekteinstellungen bytegenau restauriert; Exportnebenprodukte und eigene temporäre Testszenen getrennt im privaten Buildordner erhalten.

**20Unity-/15Capacitor-Originaldateien** vor Installation und nach Installation vor erstem Start bytegleich. Danach gültiger normaler Save23 mit `prepared=false`, erhaltene Identität/Inventar/Ausrüstung und regulärem Zeitfortschritt. Alle15Capacitor-Dateien auch nach Unity-Start unverändert. Private Originale und normales Spielstandbild bleiben unversioniert im ignorierten Buildordner. Das tatsächliche native1206×2622-Bild wurde angesehen: normale Laboransicht mit Safe Area sowie natürlich erschienene Drohne mit Paket und getrenntem Countdown. Dies ist ein Simulator-Rendersichtnachweis, keine automatisierte native Touch- oder physische Geräteabnahme.

Beide Code-CI-Prüfungen für5f8e647b erfolgreich: [test](https://github.com/Kayza1708/Idle-game-/actions/runs/40287843631/job/121455618038), [check](https://github.com/Kayza1708/Idle-game-/actions/runs/40287843346/job/121455617171). Ein nachfolgender Dokumentationscommit ändert den tatsächlich installierten Spielcode nicht.
