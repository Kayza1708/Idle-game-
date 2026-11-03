# Seiten und Unterseiten · gemeinsamer Mobile-Cleanup

## Umgesetzt

- Gemeinsame Seitenpräsentation für Hauptseiten und Detaildialoge: ruhige, rahmenlose Listen und Nebenaktionen, gleichmäßige Seitenabstände und flexible Breiten. Die Gold-/Mint-Flächen der eigentlichen Kauf-/Startaktionen, eigene Itemgrafiken und die fachliche Darstellung des INT-/Axiomnetzes bleiben gezielt erkennbar.
- Hauptmenü in vier kleine Bereiche mit zweispaltigen Einträgen gegliedert. Vorhandene Routen und Freischaltungen bleiben erreichbar; Rückkehr zum vorherigen Kontext bleibt erhalten.
- Modellübersicht: feste Platzverteilung zwischen Modellbild, Text, Details und Aktionen; Aktivieren wird auf kleinen Geräten nicht mehr auf 0–24 Pixel zusammengedrückt. Lange Modelltitel erhalten natürliche Höhe.
- Forschung: leere Laborplätze auf 64 statt 94 Layoutpunkte komprimiert und leere Zeitstriche entfernt. Belegte/weiterlaufende Labore behalten ihre vollständigen Statusinformationen.
- Produktion: Kennzahlen zuerst, tatsächliche Faktoren und Hardwarequellen einzeln aufklappbar. Keine Veränderung an den zugrunde liegenden Rechenfunktionen.
- Dauerhafter Fortschritt: kurze Übersicht; vollständige Statistik und sämtliche Hardware-Mastery-Werte separat aufklappbar.
- Einstellungen: Zahlenformate auf zwei Spalten verteilt, verständlicher Hinweis bei nicht unterstützter Haptik. Lautstärke, Datenschutz und sichere Reset-Bestätigung bleiben erhalten.
- Profil: nicht funktionsfähige kosmetische Rahmen-Vorschau mit vorläufigen Preisen entfernt; echte Profilidentität, lokale Badges, Erfolge, Namensänderung und Nachrichten bleiben bestehen.
- Ziele: Kategorien in zwei Spalten; Gem-Unterseiten verwenden umgebrochene Reiter.
- Claim-Hinweise kleiner und innerhalb der jeweiligen Aktion positioniert.

Es wurden keine Economy-Werte, Speicherschemata, Kauf-/Claim-Regeln oder SDK-Anbindungen verändert. Die kleinen preisfreien Homescreen-Links bleiben erhalten. Der Echtgeld-Store und Online-Anbieter werden weiterhin nur in dem tatsächlich verfügbaren Zustand angezeigt.

## Breiten- und Unterseitenprüfung

`WholeUiCleanupTests` prüft 70 Ansichtsvarianten in Deutsch und Englisch jeweils bei 320, 390 und 430 Pixeln: **420 erfolgreiche Ansichtsprüfungen**. Enthalten sind sämtliche vorhandenen Hauptseiten, die fünf Werkstattbereiche, Profilnavigation, alle Gem-Unterseiten, Forschungsbereiche, Trainings-/Forschungsdetails, Modelldetails, Produktionsquellen, vollständige Statistik, Missionen, Season-Unterseiten/Sammlung, Company-Unterseiten, Challenge-Regeln, Lizenzen sowie Item-, Komponenten-, Blueprint-, INT- und Axiomdetails.

Geprüft werden seitliche Ränder aktiver Texte und Buttons sowie Mindest-Touchgrößen. Die absichtlich verschiebbare Netzwerk-Welt ist von der Seitenrandprüfung ausgenommen; ihre eigentlichen Detaildialoge werden mitgeprüft. Die Präparationen verwenden ausschließlich isolierte temporäre Spielstände. Gesammelte Layoutfehler: **0**. Die sieben gezielten Tests einschließlich Statistik-/Exportabläufen sowie Shop und Homescreen sind bestanden.

[Ausgewählte aktuelle Ansichten](media/all-pages-cleanup/) liegen im Repository; der Prüfablauf erzeugt zusätzlich Aufnahmen am Seitenanfang und -ende.

## Abschließende Abnahme

Der vollständige PlayMode-Lauf umfasste **152 Tests: 149 bestanden, 3 fehlgeschlagen**. Die drei Befunde wurden anschließend gezielt korrigiert: einzeilige Netzwerk-Werkzeugtexte, die neue flache Dialogfläche als korrekter Testvertrag und eine stabile Drohnen-Vorbereitung über echte verstrichene Vordergrundzeit. **Alle 8 Tests der anschließenden Nachprüfung sind bestanden**, einschließlich sämtlicher drei zuvor fehlgeschlagenen Fälle. Ein weiterer vollständiger 152er-Lauf wurde danach nicht gestartet.

Der aktuelle **macOS-Build ist erfolgreich** (250.603.015 Bytes). [Prüfmanifest](all-pages-cleanup.verification.json); Roh-XML, Logs und App lokal unter `unity-acceptance/all-pages-cleanup-20261102/`. Die früheren EditMode-Zahlen gelten weiter als historische Belege; Gameplay-/Economy-Dateien wurden hier nicht geändert. Keine Veröffentlichung oder neue SDK-Anbindung.
