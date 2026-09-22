# Alpha-Economy 0.2

Alle abstimmbaren Zahlen stehen in `src/economy.ts` (`BALANCE`). Andere Module enthalten ausschließlich Regeln und stabile IDs.

## Basis und Prestige

Die Basisformeln bleiben: Blockpreis `25 × 1,18^n`, Compute `10 × n × 2^floor(n/25)`, Qualität `1,08^L`, Effizienz `1,04^L`, Credits/s `Compute × 0,1 × Qualität × Effizienz`, Training `Compute × 0,05` und Trainingsziel `300 × 1,8^L`. Mehrfachkäufe summieren jeden Einzelpreis.

Prestige-Anspruch ist `floor(3 × (Run-Umsatz / 1.000.000)^0,45)`, neue Erkenntnisse sind Anspruch minus jemals verdiente Erkenntnisse. Der permanente Faktor `1 + 0,35 × Erkenntnisse^0,7` wirkt je einmal auf Credits und Training. Der 18-Knoten-Baum hat sechs Äste und Kosten 1/3/10. Boni einer Familie addieren, Item-, Prestige-, Achievement- und Durchbruchsfamilien multiplizieren.

## Forschung und Items

Experimente dauern beim Start vier Stunden geteilt durch den dann gültigen Geschwindigkeitsfaktor. **Die gespeicherte Endzeit bleibt danach unverändert**. Belohnungen: Hardware 45 Komponenten + 1 Bauplan, Architektur 20 Komponenten + 2 Forschungsfragmente, Artefakt 20 Komponenten + 2 Baupläne und 20 % Itemchance. Komponentenreste werden als Bruchteil gespeichert.

Items haben Seltenheiten Common/Uncommon/Rare/Epic/Legendary (60/25/10/4/1 %) und Faktoren 1/1,15/1,35/1,65/2. Effekt: `5 % × Faktor × (1 + 0,1 × Level)`. Upgrade: `ceil(60 × 1,35^Level)`, maximal 10. Crafting und Zerlegung entsprechen den Alpha-Vorgaben. Zufallsfunde besitzen unabhängige Rare-/Epic-/Legendary-Zähler (20/50/100).

## Missionen, Boosts und Simulation

Tagesperioden verwenden UTC, Wochen beginnen Montag 00:00 UTC. Achievement-Schwellen 10⁴ bis 10⁹ vergeben je 20 Gems und 10 Punkte; Faktor `1 + 0,02 × Punkte^0,7`. Gem-Boosts verlängern bis 24 Stunden. Mock-Belohnungen werden erst nach Erfolg und je Transaktions-ID einmal vergeben.

Die ereignisorientierte Simulation teilt an Training, 10-Sekunden-Autokauf, Experimentabschluss und Boost-Ende. Offline sind je echter Abwesenheit maximal 24 Stunden möglich. Aktive Missionszeit entsteht nur bei sichtbarer Seite.

Entwickler-Zeitsprünge laufen auf einer dauerhaft gespeicherten Simulationsuhr. Ihr Offset gilt gemeinsam für Produktion, Experimente, Boost-Endzeiten und UTC-Missionsperioden. Dadurch läuft die Simulation nach einem Sprung, Prestige, Speichern oder Neuladen mit der nächsten realen Sekunde weiter, ohne Zeitstempel einzeln zurückzusetzen oder Zeit doppelt anzurechnen.

## Alpha-Vereinfachungen

- Zufall nutzt aktuell den Browser-Zufallsgenerator; die resultierenden Items werden sofort gespeichert.
- Der Belohnungsbericht fasst Credits, Trainings, Experimente und Autokäufe zusammen, ohne Einzel-Pop-ups.
- Die Daily-Komplettprämie ist in der Oberfläche noch nicht separat beanspruchbar; Einzelmissionen, Weekly-Missionen und das dauerhafte Postfach sind aktiv.
- Filter und detaillierter Vorher-/Nachher-Vergleich des Inventars sind für eine folgende UX-Runde vorgesehen; Ausrüsten aktualisiert Werte bereits sofort.
