# Release-Vorbereitung · Oberfläche und Bewegung

Ziel: ein gemeinsamer, bewusst gestalteter UI-Stand für iOS und Android. Ausgangspunkt ist der saubere Commit `a5671444`; keine Spielversion wird zurückgemischt. Dieser Auftrag veröffentlicht keinen Store-Build und ergänzt keine Kauf-, Werbe- oder Authentifizierungs-SDKs.

## Bestehende Gestaltung

- Dunkles Sci-Fi-Labor mit offener Fläche, Pixel-Art und schlanken technischen Akzenten.
- Maßgebliche Palette aus `GameTheme`: Hintergrund `#101724`, Flächen `#1D2A3B`, erhöhte Flächen `#293B50`, Text `#F0F6FF`, Sekundärtext `#A4B7CD`, Cyan `#38F3FF`, Gold `#FFC96B`. Statusfarben bleiben unverändert.
- Bewegung erklärt die aktive Identität und verfügbare Hauptaktionen; große permanente Effekte über allen Inhalten werden vermieden.

## Umsetzung

- Profil mit eigenem Vektorkonturrahmen, wirklichem Spielernamen, realen Fortschrittswerten und erspielten Abzeichen. Namensänderung und Postfach sind eigene aufklappbare Bereiche. Fehlerfelder erscheinen erst bei Bedarf.
- Aktiver Profil-Reiter ist sichtbar markiert. Namensfilter, erste KI-Namenswahl, Nachrichten und die bestehenden Speicheraktionen bleiben verbunden.
- `FlowAccent` zeichnet Rahmen und Lichtlauf als wiederverwendbares uGUI-Mesh. Maximal sechs sichtbare Effekte bewegen sich gleichzeitig, höchstens 20 Meshupdates pro Sekunde. Kein neuer Shader, keine Effekttextur, kein Partikelsystem und keine pro Tick erzeugten GameObjects.
- Zeitbasis ist verstrichene unskalierte Zeit. Reduzierte Bewegung und ausgeschaltete Effekte erzeugen ruhige statische Konturen; versteckte/gecullte Flächen und pausierte Anwendungen animieren nicht. Alle Dekorationen ignorieren Layout und Raycasts.
- Gemeinsame Hauptüberschriften, Dialogkonturen, Ausrüstungsdetails und Aktionen verwenden dieselben Akzente. Mira behält die echten Dialogaktionen auf einer ruhigen dunklen Fläche.
- Speicherwerkzeuge sind nach Wiederherstellung, Rückkehrberichten und Diagnose gegliedert. Cloud-Steuerelemente bleiben beim Neuaufbau anderer Speicherwerkzeuge bestehen. Vorschau und explizite Wiederherstellung verwenden weiterhin den bestehenden atomaren Originalschutz.
- Anzeigenamen verwenden die bestehende fette Schrift als Rückfall, wenn die Display-Schrift ihre Zeichen nicht enthält. Schriftframework und bestehende Asset-Stile bleiben erhalten.

## Abnahme

Erster Profil-/Funktionsdurchlauf: 8/8 PlayMode-Tests bestanden. Die erweiterte Abnahme umfasst **25/25 PlayMode-Tests**, darunter **492 Ansichtsprüfungen** (82 Varianten × DE/EN × 320/390/430 px). Erfasst sind zusätzlich Kaufbestätigung, Truhen-/Gumball-Informationen, Einzelchancen, Reset- und Kontolöschungsbestätigung, Profilbearbeitung/Postfach sowie geöffnete Speicherbereiche. Bestätigungen mit destruktiver Wirkung werden bei der Galerieprüfung abgebrochen.

Der neutrale Core im Profil und die vollständige Bewegungsaufnahme wurden anschließend in **3/3 gezielten Profiltests** geprüft. Die **248/248 EditMode-Verträge** für Logik, Übersetzungen und Speicher sind bestanden. Der zusätzliche vollständige PlayMode-Lauf ergab **154/155**: ein Startbildschirm-Test fand die Lokalisierungssuche über einen absichtlich deaktivierten Canvas. `GameRuntime.FlushLocalization` berücksichtigt jetzt inaktive Eltern und fehlende/gerade zerstörte UI-Objekte. Der bestehende Starttest bindet ausdrücklich einen neuen Text bei deaktiviertem Canvas und prüft seine englische Übersetzung. **13/13 Nachtests**, einschließlich aller **492 Ansichten**, Start, Profil, Recovery und Mira, sind anschließend erfolgreich. Kein erneuter vollständiger 155er-Lauf nach dieser gezielten Korrektur behauptet.

Der echte native macOS-Development-Player hat mit neuer temporärer Datei unter separater Playtest-App-Identität Start, echte Tutorialaktionen, Training und erneutes Laden erfolgreich geprüft. Seine bisherige Prüf-Coroutine startete nach einer festen Sekunde zu früh; sie wartet jetzt begrenzt auf den tatsächlichen Boot-Bereit-Zustand und liefert auch bei Zeitüberschreitung einen Fehlerbericht. Der normale Nutzerspielstand wurde nicht ausgewählt.

Abschlussbelege und Quellhashes: [Prüfmanifest](release-polish.verification.json). Der finale normale macOS-Build ist erfolgreich (250.620.503 Bytes), lokal unter `unity-acceptance/release-polish-20261103/IdleIntelligence-release-candidate.app`. Mobile Store-Artefakte werden nicht behauptet.

## Technische Release-Lücken für beide Plattformen

Die Bestandsaufnahme hat konkrete offene Voraussetzungen gezeigt:

| Bereich | Aktueller Befund |
| --- | --- |
| iOS/Android-Buildunterstützung | Editor 6000.3.26f1 enthält hier ausschließlich MacStandaloneSupport. iOS- und Android-Playerbau wurde damit nicht behauptet. Xcode 27 ist vorhanden. |
| App-Identität | `companyName` ist DefaultCompany; Android-ID ist `com.DefaultCompany.urp_2d`, iOS-ID fehlt im expliziten Mapping. Publisher-IDs/Signierung müssen vor einem Store-Build festgelegt werden. |
| Echtgeld-Käufe | `NativeStoreView` verwendet UnavailableShopNativeAdapter und UnavailablePurchaseVerifier. Keine echten Preise oder Kaufrechte werden erfunden. |
| Rewarded Ads | Der aktive Anbieter ist UnavailableRewardedVideoProvider. |
| Geräteabnahme | Sichere Bereiche, Hintergrund/Rückkehr, Leistung und native Funktionen benötigen anschließend Abnahme auf echten iOS-/Android-Geräten. |
| Langzeit-Balance | Die vorige Datenkosten-Kalibrierung ist geprüft; vollständige Item-/Prestige-/Axiom-Langzeitabnahme bleibt offen. |

Das sind echte Freigabeschranken für eine Store-Veröffentlichung; die optische Überarbeitung stellt ihre Erfüllung nicht dar.

## Angewandte Craft-Referenzen

Unity-Skills: `craft-game-floors` mit `art-direction.md` (bestehende Palette beibehalten), `vfx.md`, `game-shell.md` (bestehende Spielstruktur beibehalten) und `visual-scorecard.md`; Mechanik: `ui` → `ui-ugui` einschließlich `scrollview-setup.md`. Die 3D-Licht- und Materialrezepte wurden auf diese 2D/uGUI-Oberfläche nicht übertragen; Outline-Konsistenz ersetzt hier die Beleuchtungsachse.

Gelesene Unity-Primärdokumentation: [MaskableGraphic, uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.MaskableGraphic.html), [VertexHelper, uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.VertexHelper.html), [Application.runInBackground, Unity 6000.3](https://docs.unity.com/en-us/engine/6000.3/script-reference/unityengine/application/runinbackground).

## Visuelle Bewertung · 2D/uGUI-Oberfläche

Bewertet wurden der alte Profil-Screenshot des Wiederherstellungspunkts und anschließend drei tatsächliche Unity-Ansichten: Profil, Ausrüstungsdetail (Nahansicht) und Kaufbestätigung (aktive Aktion). Der erste Entwurf wurde nochmals verfeinert: kürzere Überschrift, aktiver Reiter, quadratischer Rahmen, neutrales Core-Emblem und kompaktere Kaufvorschau. Der Rahmenfilm stammt aus laufenden Unity-Frames; vor/nach der kompletten Aufnahme bleibt der Spielzustand identisch. Der Test belegt weiterlaufende Frames und stellt den vorherigen runInBackground-Wert wieder her.

Palette discipline: 4/5 — neue Konturen aus GameTheme; bestehende Art- und Seltenheitsfarben bleiben erhalten. Vorher 4/5.
Style uniformity: 4/5 — dieselben leichten Konturen und Titel auf Profil, Details, Dialogen und Aktionen. Vorher 3/5.
Lighting depth: 4/5 — für 2D als Outline-Konsistenz bewertet; ruhige Flächen, schmale Lichtakzente und klare Ebenen. Vorher 3/5.
Silhouette: 4/5 — Labor-Core, Truhe und ausgewähltes Item bleiben bei Handygröße erkennbar. Vorher 3/5.
UI intentionality: 4/5 — klares Profil, aktive Reiter, gegliederte Werkzeuge, dynamische Preishöhe und echte Gem-Grafik. Vorher 2/5.
Feedback visibility: 4/5 — Lauflicht an aktiver Identität/bereiten Aktionen; statische Variante und keine zusätzlichen Eingabeblocker geprüft. Vorher 3/5.

## Vorschauen

[Profil](media/release-polish/profile-de-390.png) · [Bewegungsdemo aus Unity](media/release-polish/profile-flow.gif) · [Profil bearbeiten](media/release-polish/profile-edit-de-390.png) · [Speicherwerkzeuge](media/release-polish/storage-de-320.png) · [Kaufbestätigung](media/release-polish/shop-purchase-confirmation-de-320.png) · [Itemdetail](media/release-polish/item-details-de-320.png) · [Reset-Bestätigung](media/release-polish/settings-reset-confirmation-de-320.png). Die finanzierten Galerieaufnahmen sind isolierte Testsaves; das frische Profil ist ohne zusätzliche Spielwährung aufgenommen.

## GitHub-Basis

PR #177 wurde während der Arbeit als gemergt bestätigt. Der Release-Branch `codex/release-ui-polish-20261103` basiert auf main `eb3fcb04`; dessen Baum ist identisch mit Wiederherstellungspunkt `a5671444`. Das Umschalten hat keine geprüften Quelldateien verändert.

## Befehle und Grenzen der Abnahme

Die npm-Vorabprüfungen `npm run typecheck`, `npm test -- --run`, `npm run build` wurden ausgeführt und enden mangels package.json mit ENOENT. Das Projekt bleibt Unity-only; es wird keine zweite Webversion angelegt. Native C#-Verträge, lizenzierte Unity-Tests, Builds und tatsächlicher Player-Smoke bilden die Abnahme. Laufzeitgeometrie und die bestehenden UI-Aktionen wurden verändert; keine Pakete, SDKs, neuen Fonts, Shader oder Core-/Economy-/Saveformatwerte wurden ergänzt. Die Media-Dateien sind echte Unity-Aufnahmen; die GIF-Datei wurde mit dem vorhandenen macOS-ImageIO aus den PNG-Frames kodiert.
