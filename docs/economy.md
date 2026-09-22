# Economy – Prototyp 0.1

Diese Werte sind **vorläufig** und gelten nur für den ersten spielbaren Prototyp.

| Größe | Regel |
|---|---|
| Start | 1 Hardwareblock, 0 Credits, Modelllevel 0 |
| Preis des nächsten Blocks | `25 × 1,18^n` Credits, intern ungerundet |
| Compute/s | `10 × n × 2^floor(n/25)` |
| Qualität | `1,08^L` |
| Effizienz | `1,04^L` |
| Credits/s | `Compute/s × 0,1 × Qualität × Effizienz` |
| Trainingsrate | `Compute/s × 0,05` Arbeit/s, ohne Abzug vom Betrieb |
| Trainingsziel | `300 × 1,8^L` Arbeit |

Training wiederholt sich automatisch, übernimmt überschüssige Arbeit und berechnet Einkommen abschnittsweise mit dem jeweils aktuellen Level. Hardware wird einzeln gekauft. Zeitdifferenzen unter null zählen als null; Offline-Fortschritt ist auf 24 Stunden begrenzt.

Bewusst nicht enthalten: Prestige, Achievements, Items, Crafting, Gems, Werbung, Ranglisten und die umfassende 30-Tage-Balance.
