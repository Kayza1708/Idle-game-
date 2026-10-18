# Sofort-Items und Seasons 1–3 · Beta 5

## Herstellung, Fusion und Ausrüstung

Item-Rezepte bezahlen die gesamte gewählte Menge atomar und liefern die Items im selben Zustandswechsel. Es entsteht kein Item-Auftrag. Fusion verbraucht drei gültige, ungeschützte Eingaben und liefert sofort die höhere Seltenheit; das höchste Eingabelevel und die Materialbasis bleiben erhalten. Eine separate Animation bestätigt den fertigen Vorgang; Überspringen oder Schließen verändert keine Belohnung. Module und Veredelung behalten ihre eigenen Werkprozesse.

Save v63 übernimmt bezahlte ältere Item-Aufträge einschließlich Warteschlange ohne zweite Abbuchung und beendet reservierte Fusionen genau einmal. Modulaufträge und bereits bezahlte Forschung behalten ihre Verträge. Beschädigte neue Kistenbestände oder doppelte Premium-Belege werden beim Laden zurückgewiesen.

Das Ausrüstungsfenster gruppiert Prozessor, Kern und Forschung in drei Spalten; Universalsockel stehen darunter. Kompatible Items, Produktionsvergleich und Anlegen-Aktion ersetzen das überlappende Sockelnetz.

## Drei vorbereitete Seasons

Je 30 Tage, 50 Stufen à 1.000 XP. Die Themen ändern Itemtypen und Präsentation; Fortschritt startet bei jedem Wechsel neu. Die vorherige Season hat sieben Tage Abholfrist. Spätere Seasons verwenden zyklisch die drei Belohnungsvorlagen; weitere Premium-Produkte müssen vor deren Verkauf ergänzt werden.

| Season | Thema | Garantierte Itemtypen im Pool |
| --- | --- | --- |
| S01 | Boot Sequence | Impulsrelais, Speicherkristall, Feldscanner |
| S02 | Neural Horizon | Quantenchip, Speicherkristall, Labordrohne |
| S03 | Quantum Ascension | Photonenarray, Logiksamen, Datenprisma |

| Inhalt pro kompletter Season | Kostenlos | Premium zusätzlich |
| --- | --- | --- |
| Gems | 1.200 | 4.500 |
| Kisten | 20, Common bis Epic | 20, Rare bis Legendary |
| Garantierte Items | 3, Uncommon/Rare/Epic | 13, Rare/Epic/Legendary |
| Finale Stufe 50 | Epic-Item, Epic-Kiste, 150 Gems, Artefakt | Legendary-Item, Legendary-Kiste, 600 Gems, Premium-Artefakt |

Weitere Stufen enthalten Komponenten. Bereits abgeholte alte Stufen bleiben abgeholt; die Umstellung zahlt keine Ersatzbelohnungen nach. Premium hat eigene Belege und kann nach verifiziertem Erwerb bereits erreichte Stufen nachträglich abholen. Besitz gilt für genau eine Season und wird bei Restore/Entzug berücksichtigt. Die drei vorbereiteten Produkte heißen `ai_singularity.season.01`, `.02`, `.03`; zukünftige Produkte sind nicht kaufbar.

Kisten gehen in einen dauerhaften Bestand (maximal 200) und können im Season-Pass oder in der Schmiede geöffnet werden. Bei vollem Bestand wird eine weitere Kistenbelohnung ohne Teilzahlung abgelehnt. Öffnen nutzt die Shop-Lootregeln und die bestehende Kistenanimation, verbraucht genau eine Kiste und verändert weder Gemkonto noch tägliche Gratis-Kiste. Der Bestand überlebt Prestige und Reload.

## Frühe Forschung und Videoangebot

Die ersten drei Stufen von Datenerzeugung, Materialanalyse, Bauplananalyse, Modellarchitektur, Compute-Optimierung und Nutzerskalierung benötigen vor Geschwindigkeitsboni 30/60/90 Sekunden. Der Basistarif für Daten wird auf 30/60/120 begrenzt; reguläres Preiswachstum bleibt wirksam. Die kostenlose Einführung bleibt bei 20 Sekunden. Höhere Stufen und bereits laufende Verträge werden nicht nachträglich beschleunigt.

Ein kleines Angebot unten links im Aktionsfeld ersetzt die große Versorgungsdrohnenkarte. Ein erfolgreich abgeschlossener Gem-Abruf gibt 10 Gems, jeder zehnte 30 Gems. Der Zähler bleibt über Tage und Prestige erhalten; Abbruch und doppelte Callbacks zählen nicht. Die bestehende Quote von fünf Gem-Abrufen pro Tag bleibt bestehen; Werbefrei nutzt dieselbe Quote. In Challenges ist das Angebot verborgen.

Echte Videos und Zahlungen benötigen weiterhin den nativen Anbieter, verifizierte Store-Produkte und Gerätetests. Ohne Anbieter bleibt das Angebot ehrlich deaktiviert. Es wurden keine neuen Werbe-/Kauf-SDKs eingebaut und keine echten Käufe im Test ausgelöst.

## Prüfung und Vorschau

Regressionstests prüfen Sofort-Transaktionen, Schutzregeln, Save-Migration, Kaufberechtigungen, getrennte Abholbelege, Fristende, volle Kistenbestände und Video-Wiederholschutz. `scripts/instant-season-audit.mjs` bedient die echte App mit einem klar synthetischen, finanzierten Testspielstand: Ausrüsten, Crafting-/Fusionsanimationen, Season-Vorschauen, Kiste abholen/öffnen, 320/390/430 px und reduzierte Bewegung. Das ist keine natürliche Balance-Messung und kein iPhone-Test.

Ausrüstung (historischer Nachweis: Git-Historie vor Bereinigung)
Kostenlose Season (historischer Nachweis: Git-Historie vor Bereinigung)
Premium Season (historischer Nachweis: Git-Historie vor Bereinigung)
Fusion (historischer Nachweis: Git-Historie vor Bereinigung)

Lokale Abnahme mit Node 22.23.3: Typecheck, 1.648 Tests in 118 Dateien und Produktionsbuild bestanden. Vite meldet weiterhin einen großen Hauptchunk; Geräteperformance ist noch separat zu messen.
