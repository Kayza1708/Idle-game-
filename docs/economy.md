# Economy Phase 1.1 – kontrolliertes Modelltraining

Alle abstimmbaren Zahlen stehen ausschließlich in `src/economy.ts`. UI, Simulation und Tests verwenden dieselben reinen Funktionen.

## Gemessene Ursache des alten Produktionssprungs

Der gemeldete Stand lässt sich hardwareseitig exakt als **3 Gaming-GPUs + 1 Heim-PC = 3.720 Compute** reproduzieren. Im alten Modell ergab Level 11 bereits `1,08^11 × 1,04^11 = 3,58945`. Zusammen mit nur `×1,03529` aus Credit-/Item-/Prestigefamilien entstanden `3.720 × 3,58945 × 1,03529 = 13.824 Credits/s`. Der dominante Faktor war damit nicht die Hardware, sondern die doppelte exponentielle Modellskalierung.

Die bisherige Mengenregel ×2 bei 10, 25 und 50 bedeutete kumulativ ×8. Sie wurde durch kontrollierte Faktoren ×1,5, ×1,5 und ×1,75 ersetzt; bei 50 Einheiten wirkt insgesamt ×3,9375. Der Wechsel zu einer neuen Klasse bleibt attraktiv, erzeugt aber nicht zusätzlich einen globalen Verdopplungssprung.

## Hardware

| Klasse | Basiskosten | Wachstum | Compute |
|---|---:|---:|---:|
| Taschenrechner | 10 | 1,15 | 1 |
| Einplatinencomputer | 180 | 1,15 | 12 |
| Heim-PC | 2.400 | 1,15 | 120 |
| Gaming-GPU | 32.000 | 1,15 | 1.200 |
| GPU-Rig | 450.000 | 1,15 | 12.000 |

`C_i(n)=b_i×r_i^n×d_i`; Bulk und Max verwenden dieselbe geometrische Summe. Gesamtcompute ist `Σ(n_i×p_i×M_i×U_i)×G_compute`. Kaufvorschauen berechnen einen vollständigen hypothetischen Zustand und zeigen tatsächliche Credits/s-Differenz, Zeit bis Bezahlbarkeit und Amortisation. Preise werden intern nicht gerundet.

## Manuelles Modelltraining

Training startet ausschließlich durch eine bezahlte Wahl. Es läuft danach online und offline bis genau einem Abschluss; Überlauf startet kein weiteres Training.

- Qualität: `Q(q)=1+0,08√q`. Sie erhöht den Wert pro Nutzer in der passiven Rate. Taps erhalten zusätzlich `1+0,04√q`, damit Qualität die aktive Spielweise gezielt begünstigt.
- Effizienz: `E(e)=1+0,08√e`. Sie repräsentiert die je Hardware versorgbare Nutzerzahl und wirkt in der passiven Rate.
- Arbeit: `30×1,55^(q+e)`.
- Creditpreis: `25×1,70^(q+e)`. Der Preis wird beim Start fest bezahlt und angezeigt.
- Trainingsrate: `0,12×H×G_prestige×G_training×F_training_temp`.

Damit ist die Modellfamilie abflachend statt doppelt exponentiell. Qualität und Effizienz werden beim Prestige zurückgesetzt. Der bestehende Rekursionsknoten gibt ein Qualitätslevel. Eine spätere Automatisierung darf Trainingsstarts übernehmen; Phase 1 startet weiterhin manuell.

## Produktionsreihenfolge

`R_passive = 1,0 × H × Q(q) × E(e) × G_prestige × G_achievement × G_credit × G_items × F_credit_temp`.

Innerhalb von Compute-, Credit-, Training- und Itemfamilien werden Prozentboni addiert; verschiedene Familien werden ausdrücklich multipliziert. Prestige wirkt je einmal auf Credits und Training, nie auf Compute. Temporäre Boni addieren kanalweise. Tap basiert auf der Rate ohne temporäre Boni. `productionBreakdown` liefert Hardwarebeiträge, Meilensteinfaktoren sowie jeden Multiplikator separat.

## Forschung und numerische Invarianten

Kurze Experimente geben 1/24 der Langmaterialien. Werte innerhalb von 16 skalierten Maschinen-Epsilon einer ganzen Zahl werden normalisiert; echte Reste bleiben erhalten. Somit sind 24 kurze und ein langes Experiment materialgleich und Zeitpartitionierung bleibt deterministisch.

## Save-Migration

Save v5 legt vor Migration ein v4-Backup an. Alte Modelllevel werden ohne Gesamtlevelverlust abwechselnd auf Qualität (`ceil(L/2)`) und Effizienz (`floor(L/2)`) verteilt. Vorhandener Teilfortschritt wird proportional in einen bereits bezahlten Qualitätslauf überführt; Credits werden dafür nicht erneut abgezogen. Hardware, Metaressourcen und die Simulationsuhr bleiben erhalten. Beschädigte oder unbekannte Saves werden weiterhin nicht überschrieben.
