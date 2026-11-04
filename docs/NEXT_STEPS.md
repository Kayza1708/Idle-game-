## Mobile UI · Draft-PR

UI-Überarbeitung auf Unity-only main übertragen. [Prüfbericht](unity-mobile-ui-refactor.md). Testzahlen und Screenshots stammen aus dem ursprünglichen lokalen Stand; die PR-Basis benötigt erneute Unity-Abnahme. Keine Balance-/Saveänderungen übernommen.


## Einheitlicher Unity-Stand · aktueller Auftrag

- GitHub-main `ccfb38df` ist die gemeinsame native Basis; ältere lokale Quellen separat gesichert.
- GitHub-/V3-Abgleich: [Audit](unified-game-audit.md).
- Shopgalerie und illustrierte Ausrüstung abgenommen: 242/242 EditMode, 148/148 PlayMode, erfolgreicher macOS-Build und 12 DE/EN-Ansichten bei 320/390/430 px.
- Kein Merge und keine Veröffentlichung im Rahmen dieses Auftrags.

- [x] Native Tests und lokaler macOS-Build dieses Arbeitsstands nachgewiesen.
- Neuer Auftrag vom 03.11.2026: Commit und GitHub-Upload ausdrücklich freigegeben; aktueller Abgleich in [GitHub-Status](github-status.md).

## Shop-Nachbesserung · Gem-Grafiken und passende Breiten

- [x] Vorhandene violette Gem-Sprites bei Guthaben, bezahlten Produktpreisen und Kauf-/Gumball-Aktionen eingebunden.
- [x] Tagesangebote auf ein zweispaltiges Raster und Shop-Reiter auf vollständig sichtbare Zeilen umgestellt.
- [x] 13/13 betroffene PlayMode-Prüfungen bestanden, inklusive Fensterverkleinerung ohne Neuaufbau, Preislesbarkeit und echten Kauf-/Save-Abläufen.
- [x] DE/EN bei 320/390/430 px geprüft; [aktuelle Aufnahmen](media/shop-gems-fit/).
- [x] Aktueller macOS-Build erfolgreich (250.597.159 Bytes); [Prüfmanifest](shop-gems-fit.verification.json). Die 242/148-Gesamttestzahlen oben gehören zum vorherigen abgeschlossenen Stand.

## Homescreen · Mini-Automat am Aktionsrand

- [x] Kleiner anklickbarer Gumball-Automat rechts unten im Aktionsbereich; sichtbar nach dem ersten Prestige gemäß bestehender Freischaltung.
- [x] Kompakte 76×44-Preisbox mit Gem-Sprite löst direkt die vorhandene Capsule-Transaktion aus; das Hauptmotiv bleibt antippbar.
- [x] 13/13 betroffene PlayMode-Prüfungen bestanden: Freischaltung, echte Touch-Treffer, normale/kurze Handygrößen, Doppeltipp, fehlende Gems, reduzierter Bewegungseffekt und Save-Rollback.
- [x] DE/EN bei 320×568, 320×694, 390×846 und 430×932 geprüft; [Aufnahmen](media/home-gumball/).
- [x] Aktueller macOS-Build erfolgreich (250.598.183 Bytes); [Prüfmanifest](home-gumball.verification.json).

## Korrektur: kleine Homescreen-Links ohne Preise

- [x] Den großen 76×128-Automatenblock durch einen transparenten 44×52-Touchbereich mit nur 30×36 großer Automatengrafik ersetzt.
- [x] Preisbox und direkte Ziehung auf dem Homescreen vollständig entfernt; der Automat öffnet ausschließlich die Gumball-Seite.
- [x] Links gegenüber einen kleinen „Ohne Ads“-Zugang zum vorhandenen Werbefrei-Angebot ergänzt; nach erstem Prestige sichtbar, bei aktivem Werbefrei-Recht ausgeblendet.
- [x] 14/14 betroffene PlayMode-Tests bestanden; echte Touchs, keine Abbuchung beim Navigieren, freie Hauptaktion, einzeilige Beschriftungen und DE/EN bei vier Handygrößen geprüft.
- [x] [Aktuelle Ansichten](media/tiny-home-links/). Die frühere Preisbox-Variante ist damit abgelöst.
- [x] Aktueller macOS-Build erfolgreich (250.599.719 Bytes); [Prüfmanifest](tiny-home-links.verification.json).
- Bestehende Einschränkung: Der Echtgeld-Store ist nicht angeschlossen; der Link öffnet das Angebot ohne erfundene Preise oder Kaufrechte.

## Alle übrigen Seiten und Unterseiten aufräumen

- [x] Gemeinsame rahmenlose Darstellung, kompakte Navigation und flexible Breiten umgesetzt.
- [x] Modell-/Laborübersicht korrigiert; Produktion und Statistik übersichtlich aufklappbar.
- [x] 420 mobile Ansichtsprüfungen ohne seitliche Layoutfehler und sieben gezielte Regressionen bestanden.
- [x] [Umsetzung und Vorschauen](all-pages-cleanup.md) dokumentiert.
- [x] 152er-Gesamtlauf ausgewertet; alle drei Befunde korrigiert und in 8/8 Nachtests bestätigt. Aktueller macOS-Build erfolgreich. [Genaue Abnahme](all-pages-cleanup.verification.json). Kein erneuter vollständiger 152er-Lauf nach den lokalen Korrekturen.

## Native Balance · 2026-11-03

- Neue Tuningwerte: `Assets/IdleIntelligence/Core/EconomyBalance.cs`; [Begründung und Vorher/Nachher](economy.md).
- Forschung ×4 und zusätzlich ×1,15 je vorhandenem Level; reguläre Item-Rezepte Daten ×6; Levelup-Daten ×4.
- Nächste Kalibrierung: tatsächliche Materialbeschaffung und Itemkäufe über mehrere Prestigezyklen simulieren; anschließend Hardware-ROI und Loadout-Multiplikatoren bewerten.
- Keine vollständige Endgame-Balance behauptet; die bisherige UI-Matrix deckt 70 Varianten bei drei Breiten in DE/EN ab, nicht jeden denkbaren Savezustand.

- [x] Balance-Abnahme: 248/248 EditMode, 3/3 Schmiede-PlayMode und aktueller lokaler macOS-Build erfolgreich. [Prüfmanifest](balance/verification.json). Gesamte PlayMode-Suite wurde für diese Balanceänderung nicht erneut ausgeführt.

## GitHub-Upload · 2026-11-03

- [x] Aktuelles GitHub-main abgerufen: `ccfb38df`, identisch mit der lokalen Ausgangsbasis. Keine offenen PRs vor dem Upload.
- [x] Alle fertigen lokalen UI-, Grafik- und Balanceänderungen für einen gemeinsamen Branch zusammengestellt.
- [x] Gemeinsamer Codecommit `3532142c` gepusht und mit GitHub identisch bestätigt; [PR #177](https://github.com/Kayza1708/Idle-game-/pull/177) erstellt.
- [x] Zusätzlicher Gesamtlauf ausgewertet: 151/152 bestanden. Gefundenen Preisumbruch korrigiert; 7/7 Nachtests einschließlich erneuter 420er-Matrix bestanden. Native GitHub-CI des ersten Codecommits erfolgreich. [Abschlussbericht](github-status.md).

## Release-Vorbereitung · aktueller Auftrag

- Profil, animierte Rahmen und geordnete Speicherwerkzeuge: [Arbeits- und Prüfbericht](release-polish.md).
- 248/248 EditMode, 25/25 Zieltests, 492 Ansichtsprüfungen, 13/13 Nachtests nach gefundenem Bootfehler und isolierter echter Player-Smoke bestanden. Gesamtlauf davor: 154/155; genaue Einordnung im Bericht.
- [x] Aktuelle Vorschauen, Bewegungsdemo und visuellen Bewertungsbogen geprüft: [Bericht](release-polish.md).
- iOS-/Android-Storefreigabe hat konkrete offene Build-, Identitäts-, Anbieter- und Geräte-Gates. Keine Storefreigabe oder SDK-Anbindung behaupten.

- [x] Visueller Kandidat einschließlich finalem normalem macOS-Build (250.620.503 Bytes) und echtem isolierten Player-Smoke nachgewiesen: [Manifest](release-polish.verification.json).
- [ ] Für iOS/Android zunächst mobile Editor-Module, endgültige App-/Publisher-Identitäten, Anbieteranbindung und Geräteabnahme bearbeiten; kein Store-Release freigegeben.

## Kräftigere Farbanimation · 2026-11-03

- [x] Sichtbarer Cyan–Violett–Pink-Verlauf, umlaufende Energie und pulsierender Profil-Core umgesetzt; reduzierte Bewegung berücksichtigt.
- [x] 6/6 gezielte PlayMode-Tests, finale Bildprüfung und lokaler macOS-Build erfolgreich. [Animation und Nachweis](vivid-animation.md).

## Animiertes Ringmaterial · 2026-11-04

- [x] Außenring mit eigener fließender violetter Shader-Oberfläche statt Orbit-Linien umgesetzt; Core und Profilname bleiben unverändert.
- [x] 6/6 gezielte Unity-Tests einschließlich echtem Pixelvergleich und aktueller Bildprüfung bestanden. [Demo und Prüfbericht](dark-matter-ring.md).

## Mehrteilige Item-Rezepte und Grind · 2026-11-04

- [x] Alle 42 Rezepte geprüft: sechs Einstiegsrezepte unverändert, 36 reguläre Materialrezepte zentral neu abgestuft; Midgame 4–5 und spätes Spiel fünf verschiedene Komponenten.
- [x] Mengen deutlich erhöht; Meisterschaft, atomare Abbuchung aller Zutaten, bezahlte Materialbasis und unveränderte Legacy-Rezepte geprüft. [Preise und Einordnung](economy.md#materialrezepte--4-november-2026).
- [x] Fünf Plätze in Vorschau und Schmiedeanimation passen bei 320/390/430 Pixeln in DE/EN; Fusion bleibt bei drei Itemplätzen.
- [ ] Tatsächliche Sammeldauer und Endgame-Loadouts über mehrere Prestige-/Axiomzyklen mit bezahlten Quellen langfristig kalibrieren; die Preistabelle ist kein Stundenversprechen.

## Mathematisches Wirtschaftsmodell · 2026-11-04

- [x] Produktions-, Preis-, Forschungs-, Trainings-, Item- und Prestigeformeln dokumentiert; Hardware-/Forschungs-/Exponenten-Audit reproduzierbar hinterlegt. [Modell](economy-math.md).
- [x] Freie Materialstaffel durch inverse Kalibrierung aus Quellenoptimierung, Lernkurve und Tier-Zeitziel ersetzt; bis fünf Zutaten, sechs Starterrezepte erhalten.
- [x] Neun echte Materialbeschaffungsläufe mit drei Seeds und vorfinanzierten Daten: späte Beispiele 8,65–12,06 Tage. Kein vollständiger Kampagnenbeweis; Herkunft der Testmittel ist dokumentiert.
- [x] Scanner-Lernbonus begrenzt, echte Zähler erhalten; Überlauf bei extremen Trainingsleveln abgesichert. 257/257 finale EditMode-Tests und 4/4 Schmiede-PlayMode-Tests bestanden.
- [ ] Vollständig bezahlte Kampagnen bis zu mehreren Axiomzyklen, verschiedene Offline-Besuchsrhythmen und maximale Loadouts weiter abnehmen. Material-Referenztests ersetzen diese offene Aufgabe nicht.
