# Schicht-1-Balance-Messung

Reproduzierbarer 24-h-Basisloop; Start mit einem Taschenrechner, ohne Training, Forschung, Items, Questbelohnungen, Taps und Prestigeeffekte. Strategie A kauft den bezahlbaren Einzelkauf mit kürzester Amortisation (Tie-Break: Klassen-ID); Strategie B spart nach jedem Erstkauf direkt auf die nächste Klasse.

| Klasse | Vorher A | Nachher A | Vorher B | Nachher B |
|---|---:|---:|---:|---:|
| calculator | 11.5 s | 17.5 s | nicht erreicht | nicht erreicht |
| sbc | 110.6 s | 132.3 s | 180.0 s | 180.0 s |
| pc | 298.0 s | 510.3 s | 364.6 s | 634.5 s |
| gpu | 639.6 s | 1622.0 s | 605.2 s | 1535.4 s |
| rig | 1237.9 s | 3472.2 s | 942.8 s | 2435.5 s |
| server | 2508.5 s | 10974.6 s | 1523.5 s | 7025.6 s |
| farm | 4990.2 s | 13176.2 s | 2461.0 s | 7816.8 s |
| campus | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| cloud | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| liquid | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| subsea | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| orbital | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| lunar | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| dyson | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |
| matrioshka | nicht erreicht | nicht erreicht | nicht erreicht | nicht erreicht |

### Vorher · Strategie A

Meilensteine: calculator 10 @ 47.0 s; calculator 25 @ 143.0 s; sbc 10 @ 185.6 s; sbc 25 @ 380.9 s; pc 10 @ 434.9 s; calculator 50 @ 444.8 s; pc 25 @ 785.9 s; gpu 10 @ 875.7 s; sbc 50 @ 952.4 s; gpu 25 @ 1514.5 s; rig 10 @ 1769.2 s; pc 50 @ 1882.1 s; calculator 100 @ 2928.4 s; rig 25 @ 3246.6 s; server 10 @ 3554.6 s; gpu 50 @ 3782.4 s; sbc 100 @ 6188.2 s; server 25 @ 6396.7 s; farm 10 @ 7061.5 s; rig 50 @ 8346.7 s; pc 100 @ 13145.0 s; farm 25 @ 15399.5 s; server 50 @ 24272.3 s; gpu 100 @ 55449.6 s.
Längste Sparphasen: 1320.6 s, 1312.3 s, 1291.0 s, 1279.0 s, 1257.3 s, 1198.7 s, 1163.3 s, 1162.3 s, 1154.3 s, 1148.1 s.
Erstkäufe/Anteile/Amortisation: calculator: 11.5 s, 100.0 %, 11.5 s; sbc: 110.6 s, 33.8 %, 15.0 s; pc: 298.0 s, 28.1 %, 20.0 s; gpu: 639.6 s, 27.0 %, 26.7 s; rig: 1237.9 s, 21.6 %, 50.0 s; server: 2508.5 s, 22.9 %, 80.0 s; farm: 4990.2 s, 24.1 %, 123.1 s.

### Nachher · Strategie A

Meilensteine: calculator 10 @ 75.7 s; calculator 25 @ 224.9 s; sbc 10 @ 243.5 s; sbc 25 @ 662.8 s; pc 10 @ 892.6 s; calculator 50 @ 997.2 s; pc 25 @ 2406.2 s; gpu 10 @ 2783.7 s; sbc 50 @ 2893.2 s; rig 10 @ 5211.2 s; gpu 25 @ 5617.1 s; pc 50 @ 8063.8 s; calculator 100 @ 13308.8 s; rig 25 @ 13660.6 s; server 10 @ 16014.2 s; farm 10 @ 17065.2 s; gpu 50 @ 18056.8 s; sbc 100 @ 23177.7 s; server 25 @ 31398.9 s; rig 50 @ 41750.4 s; farm 25 @ 42281.6 s.
Längste Sparphasen: 1411.9 s, 1387.4 s, 1343.1 s, 1313.4 s, 1293.5 s, 1270.3 s, 1235.7 s, 1194.8 s, 1183.8 s, 1155.5 s.
Erstkäufe/Anteile/Amortisation: calculator: 17.5 s, 100.0 %, 17.5 s; sbc: 132.3 s, 35.8 %, 18.0 s; pc: 510.3 s, 26.0 %, 50.0 s; gpu: 1622.0 s, 27.7 %, 100.0 s; rig: 3472.2 s, 33.9 %, 100.0 s; server: 10974.6 s, 23.6 %, 566.7 s; farm: 13176.2 s, 52.6 %, 123.1 s.

### Vorher · Strategie B

Meilensteine: nicht erreicht.
Längste Sparphasen: 937.5 s, 580.7 s, 337.6 s, 240.6 s, 184.6 s, 180.0 s.
Erstkäufe/Anteile/Amortisation: sbc: 180.0 s, 92.3 %, 15.0 s; pc: 364.6 s, 90.2 %, 20.0 s; gpu: 605.2 s, 90.0 %, 26.7 s; rig: 942.8 s, 87.1 %, 50.0 s; server: 1523.5 s, 87.9 %, 80.0 s; farm: 2461.0 s, 88.4 %, 123.1 s.

### Nachher · Strategie B

Meilensteine: nicht erreicht.
Längste Sparphasen: 4590.0 s, 900.9 s, 900.1 s, 791.2 s, 454.5 s, 180.0 s.
Erstkäufe/Anteile/Amortisation: sbc: 180.0 s, 90.9 %, 18.0 s; pc: 634.5 s, 90.1 %, 50.0 s; gpu: 1535.4 s, 90.0 %, 100.0 s; rig: 2435.5 s, 90.0 %, 100.0 s; server: 7025.6 s, 89.0 %, 566.7 s; farm: 7816.8 s, 86.5 %, 123.1 s.

### Kontrollmessung mit allen bisherigen Systemen

1 Tag aktiv, Seed 1708: 0 erreichte Hardwareklassen, 0 Prestiges, invalid=false. Die Parameter anderer Systeme wurden nicht verändert.

Klassen ohne Zeitangabe sind im Messhorizont ausdrücklich **nicht erreicht**. Die zwei geforderten 2–5-Minuten-Sparphasen vor Klasse 5 wurden von Strategie A nicht erreicht; kontinuierlich rentable Kleinkäufe zerlegen das Sparen in kürzere Intervalle. Dieser Zielkonflikt wird nicht als Erfolg gewertet.
