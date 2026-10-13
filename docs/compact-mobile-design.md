# Kompakte Informationshierarchie und radiales Prestige-Netz

Auf main 54686ec mit dem Mobile-Grunddesign aus #100 aufgebaut. Dieser Schritt verändert ausschließlich Anzeige, Layout und Navigation. Economy, Save, Simulation, Preis-, Unlock- und Resetfunktionen nicht geändert. prestigeTree.ts behält die unveränderten Kaufzustände, ersetzt aber die reine Darstellungsgeometrie.

## Designsystem

Night-Indigo/Oberflächen #172330, gedämpfte violette Prestigeverbindungen, Mint für ausreichende Ressourcen, Korallrot für Fehlmengen. Gemeinsame Spacing-/Radius-/Statusvariablen in mobile-ui.css. Pixel-Art bleibt; Kostenicons sind 12–18 px, Haupticons 30–42 px. Interaktive Materiallinks bleiben mindestens 44 px hoch. Farbe wird durch ✓/! und zugängliche Statusnamen ergänzt.

CostBadge zeigt Icon + Besitz / Benötigt, mit ScientificNumber-Vergleich ohne Begrenzung auf endliche Doubles. Material-/Modulchips übernehmen zusätzlich den Fehlbetrag aus dem bestehenden Transaktionsquote. Ungültige Mengen werden als ungültig/fehlend angezeigt, nicht als kostenlose Anforderung. Ein Badge startet oder bezahlt keine Aktion. Kompakte gerundete Zahlen sind Anzeige, nicht Kaufentscheidung.

## Ansichten

- Hardware: kompakte Creditschips am bestehenden bezahlten Kaufbutton.
- Training: Datachip, Effekt und Dauer; ausführliche Faktoren stehen außerhalb der Kaufbuttons hinter Trainingsdetails.
- Forschung: Datachip pro Projekt; Laborbonusquellen im Detailfenster aufklappbar.
- Analyse: Datachips; Farmziel-/Automationskonfiguration aufklappbar.
- Crafting/Module: geschlossene kompakte Rezeptzeilen statt 30 gleichzeitig ausgeklappter Formulare. Aufklappen zeigt Data- und Material-/Modulchips. Effekte und Mastery nochmals gezielt aufklappbar. Modul-/Tutoriallinks öffnen das relevante Disclosure vor Scroll/Fokus. Fragmentlernen-/Konversions-/historische Belege behalten ihre erklärenden Detailtexte.
- Forge: Datachip plus gleiche gemeinsame Materialchips.
- Inventar/Slots/Profile: kleinere Icons und Cards, konsistente Farben/Abstände; bestehende Tabs und Aktionen bleiben.
- Einstellungen: kompakte Label-/Controlzeilen, Audio-Slider mit Zahl, Togglezeilen. Unverfügbare Benachrichtigungen bleiben ehrlich deaktiviert und stehen wie Diagnose hinter einem Disclosure.
- Menü/Missionen/Season/Shop/Return/Story nutzen weiterhin das gemeinsame Grunddesign aus #100; dieser Schritt verfeinert Informationshierarchie statt deren Domainabläufe zu ändern.

## Prestige

46 echte Katalognodes in sechs radialen Hauptsektoren plus innerem Ring für separate Einstiegs-Nodes. Ausgangspunkt ist ein zentraler benannter AI-Kern. Tatsächliche Voraussetzungen steuern Verbindungslinien; unabhängige Nodes verbinden zum Kern. Linien enden am Node-Rand. Status unterscheidet locked/ready/affordable/owned, mit Kosten bzw. Haken. Preise und Verfügbarkeit unverändert. Pan/Pinch/Zoom bleiben; Einpassen berücksichtigt den größeren Canvas und Zentrieren setzt die Kernansicht wieder her.

Geometrieprüfung: 46 eindeutige Positionen, kein Node außerhalb des Canvas, minimaler Mittelpunktabstand 115 bei 88-px-Nodes. Einpassen rechnerisch bei 340/370/410 px innerer Breite geprüft. Das sind Modellkoordinaten, keine gemessenen Renderpixel. Beim Überblickszoom sind Nodes kleiner; für Details wieder heranzoomen.

## Abnahme

Vollsuite: 1.356 Tests / 97 Dateien bestanden. Nach kleiner Kamera-/Reveal-Nacharbeit 28 gezielte Kamera-/Kosten-/Nodeverträge sowie 20 Tutorial-/Material-/Übersichtsverträge erneut bestanden. Source-Path-Check, Typecheck, abschließender Build und Diffcheck grün. Neue Tests prüfen exakte Schwellen/Fehlmengen, ungültige Mengen, wissenschaftliche Werte jenseits 1e308, Layoutabstände und Connectorenden. Alte Text-/Zeilenpositionsverträge an die ausdrückliche neue Darstellung angepasst. Bestehende Domain-Regressionen bleiben. Hauptbundlewarnung besteht weiter.

Noch keine echte Mobile-/Browserabnahme: Screenshotpfade fehlen, lokale Browserdatei fehlt, letzter offizieller Browserdownload war kein gültiges ZIP. Keine gemessene Scrollreduktion oder endgültige Designqualität behauptet. Die App-weite 360/390/430px-DE/EN-Matrix aus mobile-ui-overhaul.md bleibt Pflicht vor Freigabe, ergänzt um: Kostenchips mit großen Mengen, Materiallink/Modul-Reveal, Rezeptaccordion, Trainingsdetails, alle radialen Sektoren, Einpassen/Zentrieren, Nodeblatt und Einstellungen bei Tastatur/hoher Schriftgröße. Keine Änderungen an nativem Projekt, kein Release und kein automatischer Merge.
