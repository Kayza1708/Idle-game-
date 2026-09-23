# Reproduzierbarer Balancebericht – Phase 1

Stand: 23. September 2026. Die Messung kompiliert den echten Economy-/Simulationskern und verwendet Seed `0,5` für Zufallsentscheidungen. Keine Werbung, Gems oder Debug-Ressourcen. Kaufentscheidungen erwerben je Intervall die beste sofortige marginale Compute/Credit-Rendite (**ROI**) oder bevorzugen die neueste bezahlbare Klasse (**Neu**). Das intensive Profil ist kein angenommener Durchschnittsspieler.

## Erste 60–120 Minuten

| Profil | Strategie | SBC / PC / GPU / Rig entdeckt | Erstes Item | Prestige 1 / 2 | längste Kaufpause | Tap / passiv |
|---|---|---|---:|---:|---:|---:|
| A: Entscheidung 10 s, 3 Taps/s, Overclock sofort | ROI | 1:30 / 4:10 / 7:10 / 10:30 | 2:31 | 24:41 / 43:09 | 10 s | 8,50 Mrd. / 16,21 Mrd. |
| A | Neu | 1:30 / 3:10 / 4:50 / 6:30 | 2:31 | 13:18 / 19:47 | 10 s | 8,79 Mrd. / 15,98 Mrd. |
| B: Entscheidung 60 s, keine Taps | ROI | 9:00 / 25:00 / 43:00 / 63:00 | 10:01 | 102:03 / – | 60 s | 0 / 13,02 Mrd. |
| B | Neu | 9:00 / 19:00 / 29:00 / 39:00 | 10:01 | 64:53 / 87:15 | 60 s | 0 / 24,64 Mrd. |

Profil A/ROI trifft das Prestigeziel 20–30 Minuten. „Neu“ ist deutlich schneller und zeigt, dass die Strategien noch nicht gleichwertig sind. Profil B verfehlt 35–60 Minuten leicht bis deutlich; dessen absichtlich nur einzelner Kauf pro Minute unterschätzt den ×10/Max-Spieler. Erste Items liegen aktiv etwas vor und gelegentlich nach dem Ziel 3–7 Minuten. Diese Abweichungen sind offen und müssen mit menschlichen Kaufmustern kalibriert werden, nicht mit künstlichen Timern.

## Rückkehrer, sieben Tage

Profil C simuliert täglich fünf sichtbare Minuten, fünf ROI-Käufe und danach acht Stunden Offline-Fortschritt. Nach sieben Sitzungen: 1,055 Mrd. berechtigter Umsatz, 1.088 Compute, Taschenrechner/SBC/PC entdeckt, noch kein Prestige. Das Ergebnis zeigt: fünf Käufe je Rückkehr sind zu restriktiv; die UI muss Max-Kauf klar vermitteln. Offline erzeugte Produktion, nicht Anwesenheitstage, wurde angerechnet.

## Produktionsverlauf und Ressourcen

Im aktiven ROI-Lauf kamen bis zum zweiten Prestige 34,4 % des berechtigten Umsatzes aus Taps und 65,6 % aus passiver Produktion; 27 Overclocks wurden aktiviert. Neue Runs starteten dank ×1,76 Prestigefaktor deutlich schneller. Das Einführungsexperiment ist die erste Itemquelle; spätere Materialien stammen ausschließlich aus Experimenten, Gem-Ausgaben waren in diesen Profilen null.

Vorschauzeiten in der UI nehmen keine künftigen Käufe an. Die Tabellen sind tatsächliche Strategieläufe. Weitere Seeds ändern das garantierte Einführungsexperiment nicht; zufällige Langzeitdrops beeinflussten die hier gemessenen Prestigezeiten nicht.
