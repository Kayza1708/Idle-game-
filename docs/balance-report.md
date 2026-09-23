# Balancebericht Phase 1.1

Stand: 23. September 2026. Gemessen wurde mit dem echten Economy-/Simulationskern, ohne Gems, Werbung oder Debug. Training wurde bei jeder Kaufentscheidung abwechselnd als Qualität/Effizienz gestartet, sofern bezahlbar. **ROI** kauft die beste unmittelbare Compute/Kosten-Relation; **Neu** bevorzugt die neueste bezahlbare Klasse. Profil A entscheidet alle 10 Sekunden, tappt 3/s und aktiviert Overclock. Profil B entscheidet alle 60 Sekunden ohne Taps.

## Zwei Stunden

| Profil | Strategie | Prestige-Zeiten | Stand nach 2 h | Modell |
|---|---|---|---|---|
| A aktiv | ROI | 54:08 / 94:01 | 816.669 Compute, 28,02 Mrd. Lifetime-Umsatz | Q16 / E16 |
| A aktiv | Neu | 38:13 / 55:09 / 73:23 / 92:49 / 113:21 | 840.867 Compute, 86,63 Mrd. | Q15 / E14 |
| B gelegentlich | ROI | keiner | 366.766 Compute, 2,03 Mrd. | Q16 / E16 |
| B gelegentlich | Neu | 113:53 | 14.654 Compute, 13,01 Mrd. | Q3 / E2 |

Die neue Kurve ist bewusst langsamer: Der aktive ROI-Erstprestige verschob sich von 24:41 auf 54:08, weil `1,08^L×1,04^L` entfernt wurde und Trainingsstarts Credits/Entscheidungen verlangen. Es gibt nicht mehr automatisch bei jedem Abschluss einen neuen Lauf. „Neu“ bleibt schneller als ROI, erreicht aber nicht mehr binnen 13 Minuten den ersten Reset. Profil B zeigt weiterhin zu lange Prestigezeiten; weitere Kalibrierung muss Hardwarepreise und Prestige gemeinsam betrachten, nicht Modellboni wieder exponentiell machen.

## Sieben Tage Rückkehrer

Sieben Zyklen aus fünf sichtbaren Minuten, fünf ROI-Käufen und acht Stunden Offline ergaben 1.216,5 Compute, 132,67 Mio. berechtigten Umsatz, Q4/E3 und noch keinen Prestige. Offline schließt einen gestarteten Lauf ab, startet aber keinen neuen. Das ist die beabsichtigte Entscheidungsgrenze, zeigt aber auch, dass Rückkehrer mehr klare Max-Kauf- und Trainingsentscheidungen benötigen.

## Wartezeiten und Timeline

Im aktiven Profil erfolgen Kauf-/Trainingsentscheidungen im 10-Sekunden-Raster; im gelegentlichen Profil im 60-Sekunden-Raster. Trainingsstarts lagen aktiv zunächst bei 0:10 Q, 1:10 E, 1:50 Q, 2:00 E und danach zunehmend weiter auseinander. Gelegentlich lagen die ersten Starts bei 1:00 Q, 3:00 E, 5:00 Q und 7:00 E. Diese Zeitpunkte sind tatsächliche Simulationsergebnisse, keine UI-Vorschau.

## Offene Balancearbeit

Zielkorridor für den ersten aktiven Prestige ist vorerst 40–60 Minuten, gelegentlich 90–120 Minuten. Damit bleiben Hardwarekauf, Trainingswahl und Overclock mehrere Zyklen relevant. Menschliche Browsertests müssen bestätigen, dass zwischen bezahlbaren Käufen keine mehrminütigen Leerphasen entstehen. Der Rückkehrerpfad und die Strategiedifferenz bleiben offen; die Roadmap markiert Phase 1 deshalb nicht als vollständig abgenommen.
