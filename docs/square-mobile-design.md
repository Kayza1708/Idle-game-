# Kantige Mobile-Designsprache und Tutorial im Layout

Basis: main f08dea8. Der aktive Mobile-Stylesheet ersetzt die bisherigen aufeinandergelegten Darstellungspatches. Keine Änderung an Economy, Preisen, Save, Shopquotes, Analyse, Forschung, Simulation oder Resetregeln.

## Einheitliche Gestaltung

Flache, rechteckige Flächen: Stahlblau als Hintergrund, gedämpftes Grün für Aktionen und Gold für Preise. Systemschrift, einheitliche Abstände, klare Trennlinien, kleine Pixel-Art-Icons und mindestens 44px-Aktionen. Radius null wird mit ausreichender Selektorspezifität im gesamten Appbaum und den Portal-Dialogen erzwungen, einschließlich pseudo-elementarer UI-Flächen und Slidergriffen. Pixelgrafiken selbst bleiben erhalten.

Hardware behält Preis-only und dieselbe Bezahlbarkeitsprüfung. Inventar behält Bild/Menge, Materialnamen auf Tap, Null-Zutatenfilter und quadratische Kostenschips. Shop ist eine Händlerliste mit festen Angebots-/Preisspalten und drei Kategorien; volle Wirkung und unveränderte Quote im gemeinsamen rechteckigen Detailfenster. Menü, Profil, Settings, Equipment, Research, Crafting, Missionen, Season, Prestige, Rückkehrbericht, Story und Namenseingabe bekommen denselben aktiven Skin. Karten, Buttons, Tabs und Nodes sind kantig; das radiale Netzwerk/Pan/Zoom bleibt.

Settings haben flache Label-/Feldzeilen. Die sieben rein vorbereiteten, funktionslosen Notification-Schalter sind entfernt. Der ehrliche Hinweis auf fehlende native Integration bleibt im Disclosure. Tatsächlich funktionierende Audio-/FX-/Haptik-/Sprachschalter und Save-/Diagnoseaktionen bleiben.

## Tutorialarchitektur

TutorialFocus rendert im Appbaum, nicht mehr als Body-Portal. App prüft dieselben Guidebedingungen und reserviert eine echte zweite Gridzeile zwischen Ressourcen und Spielinhalt. Content und Navigation rücken explizit in Zeile drei/vier. Die Erklärung hat einen internen Scrollbereich; beide Aktionen bleiben außerhalb davon. Keine festen Bildschirmkoordinaten oder transform-basierte Zentrierung der Hilfe.

ResizeObserver misst die Coachhöhe für den oberen Abstand eines geöffneten Detaildialogs. Dessen Backdrop beginnt unter der sichtbaren Hilfe, statt die Hilfe abzudunkeln. Der Ressourcenheader ist während eines Detaildialogs nicht interaktiv. Beim Zielwechsel werden Disclosure, Hervorhebung und Scroll/Fokus erst nach Viewwechsel gesetzt. Cleanup entfernt die Markierung am aktuellen Zielelement. Menü/Profil/Equipment/Rückkehrbericht zeigen keine Guidezeile.

## Tatsächliche Prüfungen

- Abschließender Source-Path-Check und Typecheck bestanden; keine Typfehler.
- Abschließender Build und Diffcheck bestanden. Die bestehende Hauptbundlewarnung bleibt.
- 32 gezielte UI-/Tutorial-/Meta-/Feedbacktests bestanden, einschließlich drei neuer Radius-/Grid-/Navigationsverträge.
- Vollsuite: 1.358 von 1.361 vorhandenen Fällen bestanden; drei Domainfälle erreichten ihre Zeitlimits. Isolierter Retry: 49 von 51 Fällen bestanden; der erste Resetfall aus passiveReturnProfile wurde bestätigt.
- Weiterhin Timeout: longTermInt.test.ts, „records the exact ledgers and applied versus removed INT multipliers“, 10s; runStart.test.ts, „caps large jumps and cannot recursively reset at one checkpoint“, 5s. Keine fehlgeschlagene fachliche Assertion in diesen Fällen. Ursachen nicht abschließend gemessen; Budgetgrenzen und Domaincode nicht verändert. Deshalb keine grüne Vollsuite behauptet.

Noch keine visuelle iPhoneabnahme: Die gelieferten Screenshotpfade sind nicht vorhanden; die zuvor versuchte Browserbereitstellung war blockiert. Source-/Renderverträge ersetzen keine echte Pixelgeometrie oder Touchprüfung. Vor Freigabe insbesondere 360×640, 390×844, 430×844, Safe Areas, große Schrift, aktive Guidezeile + Trainings-/Researchblatt, „Ziel zeigen“ über Tabs/Disclosures, Shopkosten und Settingskeyboard prüfen. Eine subjektive Qualitäts- oder native Gerätefreigabe ist nicht erfolgt.

Draft bleibt offen bis Geräteabnahme und vollständige CI-Prüfung. Kein automatischer Merge, kein Release.
