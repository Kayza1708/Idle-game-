# Durchgehende Mobile-Gestaltung

Basis: main a5051ed (einschließlich Mac-Build-/Menüscrollfix). Keine Balance-, Save-, Zeit-, Kaufpreis-, Ressourcenzugangs- oder Resetänderungen.

## Referenzen und Designentscheidung

Offizielle Storeseiten samt Screenshotlinks:

- https://play.google.com/store/apps/details?id=com.fluffyfairygames.idleminertycoon
- https://play.google.com/store/apps/details?id=com.TechTreeGames.TheTower

Abgeleitetes Gestaltungsprinzip für unser Spiel: zentrale Spielfläche, direkt erreichbare Upgrades, kompakte Übersichten und vertiefte Informationen auf Tap. Eigene Pixelgrafiken und eigene Gestaltung; keine Fremdassets integriert. Dies ist eine Designentscheidung, kein Nachweis besserer Retention.

## Umgesetzt

| Bereich | Änderung |
| --- | --- |
| Action | CSS-Würfel durch vorhandene Pixelhardware ersetzt, Motiv folgt höchster besessener Klasse; vor erstem Kauf illustrative Taschenrechnerdarstellung ohne Hardwaregrant. Kleinere Bühne mit Impuls/Overclock und Dropinteraktion. |
| Hardware | Sparzielkarten für nächste Klasse/Meilenstein sowie Nächster-Kauf-Text aus Übersicht entfernt. Alle 15 bezahlten Klassen und Mengenmodi bleiben. Kaufaction zusätzlich im Hardware-Detailsheet. Meilensteinregeln bleiben; Details auf Tap erreichbar. |
| Modell | Kompakte Modell-/Equipmentzeile und direkte Trainingsöffnung. Automation aufklappbar. |
| Navigation | Kleine semantische SVGs und einheitliche Typografie; fünf bestehende Ziele bleiben. |
| Menü | Kompaktes zweispaltiges Bottom Sheet, scrollbarer begrenzter Inhalt, Closebutton. |
| Forschung | Aufklappbare Bereiche; Anfangsprojekte/laufende Bereiche initial offen. Gebietsstufenlinks und Automation hinter Disclosure. Keine automatischen Forschungsstarts. |
| Inventar | Kürzere Tabnamen, kompaktere Komponenten-/Itemkarten; Schmieden/Automation sowie Build-/Forge-/Recyclingdetails aufklappbar. Aktionen/Kosten bleiben zugänglich. |
| Unterfenster | Gemeinsame Gestaltung für Detail-/Equipment-/Profilfenster, Shopbestätigung, Rückkehrbericht, Namenseingabe und Storydialoge. |
| Weitere Ansichten | Kompaktere Missionen, Season, Prestige, Analyse, Shop und Progressionskarten. |

Eigene Styles in src/mobile-ui.css, nach style.css geladen. Legacy-CSS bleibt für nicht überschriebene funktionale Layoutverträge; künftige Bereinigung ist separat. Detaillierte Wirtschaftszahlen werden nicht überall in Übersichten wiederholt. Große Sammlungen und lange Detailinhalte haben weiter interne Scrollbereiche. Keine Behauptung, sämtliche Informationen könnten auf einen Bildschirm passen.

## Bestätigte Abnahme

1.350 Tests in 96 Dateien bestanden, inklusive vier neuer Render-/Ladeverträge. Zwei alte Next-Purchase-Textverträge an die ausdrücklich gewünschte Entfernung angepasst; Compute-/Bulk-Kaufmathematik weiterhin geprüft. Typecheck, Source-Path-Check, Build und Diffcheck bestanden. Keine Domainänderung. Hauptbundlewarnung weiterhin vorhanden; zusätzlicher UI-Stylesheetumfang dokumentiert statt verborgen.

## Offene visuelle Abnahme

Keine echte Browser-/iOS-Abnahme: lokale Browserdatei fehlt; offizieller Playwright-Chromiumdownload liefert kein gültiges ZIP. Die bereitgestellten Screenshotpfade sind nicht vorhanden. Render-/Quelltests prüfen keine Pixelgeometrie oder tatsächliche Touchgesten. Daher keine Aussage über gemessene Scrollreduktion, gemessene Touchzielgeometrie, endgültige visuelle Qualität oder V1-Gerätefreigabe.

Vor Freigabe jeweils DE/EN bei 360/390/430 × 844 sowie einem niedrigen 360 × 640 Viewport:

1. Frischer Save: Header/Impuls/Modell/Training und erste Kaufzeile sichtbar; 15 Hardwareaktionen erreichbar, fehlende Credits blockieren weiter. x1/x10/MAX und aktueller Preis stimmen.
2. Hardwareblatt: öffnen, kostenpflichtig kaufen, fehlende Credits, Klasse/Meilenstein-/Materialdetails. Keine Touchgrants durch Sheetöffnung.
3. Menü: alle Einträge/Close erreichbar, Scroll bei niedriger Höhe, Safe Area und reduzierte Bewegung.
4. Forschung: Bereiche auf-/zuklappen, Projektblatt, bezahlter Start, Labwechsel, Queue und Automation. Tutorial-data-generation bleibt sichtbar.
5. Inventar: alle 20 Materialien und 30 Baupläne/Itemtypen, Ausrüstung, Kosten/Fertigen, Forge-/Recyclingdisclosures, Slotgrenzen.
6. Prestige/Challenge: Map-Pan/Zoom, Nodekosten, Bestätigung und Resetinformation. Kein Tap-Einkommen während anderer Views.
7. Missionen/Season/Shop: Claim, letzter Trackeintrag, Kaufbestätigung, alle Währungen/Buttons ohne Überbreite.
8. Profil/Settings/Rückkehr/Namens-/Storydialog: scrollbarer Inhalt, Close/Escape, Fokus und Keyboard; bei großer Schrift nichts abschneiden.

Kein automatischer Merge und kein Release. Nach Merge: git pull --ff-only && npm run build && npx cap sync ios && npx cap open ios.
