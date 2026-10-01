# Schicht-2-Balance-Messung

Messung mit unveränderter Hardwarekurve aus Schicht 1. Custom-Basis-/Trainingsläufe laufen 24 Stunden in 5-Sekunden-Schritten mit echten Economy- und Kauf-Funktionen. Der passive Lauf nutzt das bestehende realistische Sitzungsprofil; der Kontrolllauf lässt Forschung und Analysen aktiv.

## Data-Grundrate

- 1 Users: 0,1 Data/s ohne Boni
- 100 Users: 1 Data/s ohne Boni
- 10.000 Users: 10 Data/s ohne Boni
- 1.000.000 Users: 100 Data/s ohne Boni

## Trainingsparameter

| Level | Datenkosten | Dauer |
|---:|---:|---:|
| 1 | 1.5000000e+1 | 90.0 s |
| 5 | 1.4100000e+2 | 298.9 s |
| 10 | 2.3100000e+3 | 1340.4 s |
| 20 | 6.2203500e+5 | 26951.6 s |
| 30 | 1.6756938e+8 | 259200.0 s |

## Tatsächliche Läufe

- Basis ohne Training: Creditrate 4.7957e+10 C/s; Data 9.1492e+3/s; Hardware {"sbc":95,"pc":310,"gpu":585,"rig":855,"server":1425,"farm":1500}.
- Aktiv, abwechselnd Quality/Efficiency: Q17/E17; Creditrate 7.4236e+12 C/s; Data 3.2145e+4/s; Hardware {"sbc":95,"pc":310,"gpu":585,"rig":855,"server":1425,"farm":1500,"campus":16490}.
- Trainingsstarts/-abschlüsse: quality L1: Start 75s, Abschluss 165s, tatsächliche Anspar-/Wartezeit 75.0s; efficiency L1: Start 165s, Abschluss 255s, tatsächliche Anspar-/Wartezeit 0.0s; quality L2: Start 255s, Abschluss 376.5s, tatsächliche Anspar-/Wartezeit 0.0s; efficiency L2: Start 380s, Abschluss 501.5s, tatsächliche Anspar-/Wartezeit 3.5s; quality L3: Start 505s, Abschluss 669.025s, tatsächliche Anspar-/Wartezeit 3.5s; efficiency L3: Start 670s, Abschluss 834.025s, tatsächliche Anspar-/Wartezeit 1.0s; quality L4: Start 835s, Abschluss 1056.43375s, tatsächliche Anspar-/Wartezeit 1.0s; efficiency L4: Start 1060s, Abschluss 1281.43375s, tatsächliche Anspar-/Wartezeit 3.6s; quality L5: Start 1285s, Abschluss 1583.9355625000003s, tatsächliche Anspar-/Wartezeit 3.6s; efficiency L5: Start 1585s, Abschluss 1883.9355625000003s, tatsächliche Anspar-/Wartezeit 1.1s; quality L6: Start 1885s, Abschluss 2288.5630093750005s, tatsächliche Anspar-/Wartezeit 1.1s; efficiency L6: Start 2290s, Abschluss 2693.5630093750005s, tatsächliche Anspar-/Wartezeit 1.4s.
- Passives realistisches Profil: Q3/E2, 0 Hardwareklassen, Creditrate 5.7444e+2 C/s.
- Kontrolle mit Forschung/Analysen: Q17/E17, Datenbestand 7.2953e+9, Forschung 34 Starts/33 Abschlüsse, Analysen 143; echte Forschungs- und Analysestarts konkurrieren in diesem Lauf mit Training um Data.

Das erste aktive Training startet nach 75 Sekunden und verfehlt damit das Ziel von 3–5 aktiven Minuten nach unten. Außerdem steigen die reinen Ansparpausen im 24-Stunden-Lauf nicht monoton, weil die unveränderte Hardwarekurve die Nutzer- und damit Data-Grundrate schneller erhöht als die frühen Trainingskosten. Beide Konflikte sind Messbefunde; die vorgegebenen Formeln wurden nicht still verändert. Prestige-, Item- und Hardware-Meilenstein-Boni für Training beschleunigen die feste Laufzeit absichtlich nicht mehr; Data-Boni aus Prestige, Items, Forschung und Meilensteinen bleiben erhalten, werden aber gemeinsam auf einen Multiplikator unter 5 abgeflacht.
