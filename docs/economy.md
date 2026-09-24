# Economy v6 – Compute-Aufteilung und kontrolliertes Modellwachstum

Alle abstimmbaren Werte stehen in `src/economy.ts`. Oberfläche, Simulation und Tests rufen dieselben Funktionen auf; angezeigte Preise werden nicht separat nachgebaut.

## Ressourcen

| Ressource | Verwendung | Prestige |
|---|---|---|
| Credits | Hardware, Training, Forschung, Crafting | zurückgesetzt |
| Compute | Leistung aus Hardware; wird vom Betriebsprofil aufgeteilt | Hardwarebestand zurückgesetzt |
| Daten | entstehen durch Nutzer; Training und Projekte | zurückgesetzt |
| Forschungspunkte | entstehen aus Forschungs-Compute; Projekte | bleiben erhalten |
| Komponenten/Baupläne | Items und Crafting | bleiben erhalten |
| Erkenntnis | Singularitätsbaum | bleibt erhalten |
| Axiome | reserviertes Feld für den späteren Meta-Layer | bleibt erhalten; noch nicht spielbar |
| Gems | Missionen/Achievements und Komfortangebote | bleibt erhalten |

## Hardware und Betriebsprofile

Der datengetriebene Katalog enthält 15 stabile IDs. Die ersten fünf bilden den spielbaren ersten Abschnitt; die Klassen 6–15 werden sequentiell sichtbar und bereiten Langzeitinhalte vor. Für Klasse `i` gilt:

`nextCost(i,n)=baseCost(i)×growth(i)^n`

`bulkCost(i,n,k)=baseCost(i)×growth(i)^n×(growth(i)^k−1)/(growth(i)−1)`

Max-Kauf wird logarithmisch geschätzt und danach in beide Richtungen gegen `bulkCost` korrigiert. Meilensteine bei 10/25/50 multiplizieren Klassen-Compute mit 1,5/1,5/1,75 (gesamt höchstens 3,9375); ein gekauftes Klassen-Upgrade verdoppelt ausschließlich diese Klasse.

`totalCompute = Σ(count × classCompute × milestones × classUpgrade) × globalComputeFamily`

Die Profile summieren sich jeweils exakt zu 1:

| Profil | Nutzer | Training | Forschung |
|---|---:|---:|---:|
| Ausgewogen | 75 % | 15 % | 10 % |
| Training | 60 % | 30 % | 10 % |
| Entdeckung | 65 % | 10 % | 25 % |

`users = inferenceCompute × efficiency / computePerUser`

`credits/s = users × 1,35 × quality × Prestige × Achievement × Creditfamilie × Items × temporäre Creditfamilie`

`data/s = users × 0,08`

`research/s = 0,12 × (researchCompute/10)^0,65 × (1 + 0,05×ln(1+data/100))`

## Modelltraining und Softcaps

Training beginnt nur nach einer bezahlten Wahl (Qualität oder Effizienz), kostet `25×1,7^(q+e)` Credits sowie `2×(Gesamtlevel+1)` Daten und benötigt `30×(Gesamtlevel+1)^1,25` Arbeit. Nur der Trainingsanteil des Profils erzeugt Arbeit. Ein Lauf arbeitet online/offline, behält Überlauf innerhalb des Abschlussereignisses und startet nie ungefragt den nächsten Lauf.

`softcap(x,k) = x` für `x≤k`, sonst `k + sqrt(k×(x−k))`.

`quality = 1 + softcap(0,04×q, 1,0)`

`efficiency = 1 + softcap(0,03×e, 0,75)`

Damit wurde die alte doppelte Exponentialwirkung `1,08^L×1,04^L` entfernt. Der gemeldete Altstand war **3 Gaming-GPUs + 1 Heim-PC = 3.720 Compute**; Level 11 lieferte bereits `3,58945` Modellfaktor und war der Hauptgrund für 13.824 Credits/s.

## Forschung, aktive Aktionen und Bonusfamilien

Die drei ersten Projekte verbrauchen gemeinsam Credits, Daten und Forschungspunkte. Ihre Freischaltwirkung ist absichtlich noch klein; Module, Durchbruchswahlen und Rezepte bleiben als nächste Ausbaustufe in der Roadmap. Tap-Ertrag ist `max(1, 20 % der passiven Rate ohne temporäre Boni × Qualitäts-Tapfaktor)` und auf fünf vergütete Impulse/s begrenzt. Overclock addiert +100 % in der temporären Credit- und Trainingsfamilie.

Gleichartige Prozente innerhalb von Compute-, Credit-, Training-, Forschungs- oder temporären Familien werden addiert. Erst zwischen benannten Familien wird multipliziert. Prestige wirkt einmal auf Credits und einmal auf Training, niemals nochmals auf Compute.

## Prestige

Nur reguläre Produktion und Taps erhöhen `lifetimeEligibleCredits`. Missionen, Debug, Werbung und Auftragsbelohnungen tun das nicht.

`raw = 3 × max(0, log10(1 + eligible / 1.400.000.000))^1,5`

`claimable = floor(raw) − prestigeEntitlementClaimed`

Der erste Reset braucht drei, spätere einen Anspruch. Der bereits abgeholte Formelanspruch ist unabhängig von verfügbaren/ausgegebenen Erkenntnissen. Der dauerhafte Faktor bleibt `1 + 0,35×totalInsightEarned^0,7`.

## Zeit, Offline und Migration

Simulation verwendet zehnsekündige Ereignisschritte und absolute Endzeitpunkte. Das Grund-Offline-Limit beträgt acht Stunden; ein später Automationsknoten erhöht es auf maximal 24 Stunden. Debug-Zeitsprünge verschieben die gesamte Timeline, nicht nur `savedAt`.

Save v6 ergänzt Daten, Forschungspunkte, Axiome, Profil, Projekte und alle Hardware-IDs. Migrationen v1–v5 werden vor dem Schreiben gesichert. Bestehende Hardware, Items, Gems, Erkenntnisse, Forschung und Timer bleiben erhalten. Alte Modelllevel werden konservativ auf Qualität/Effizienz verteilt. Unbekannte oder beschädigte Saves werden nicht überschrieben.

## Bewusste Grenzen

Der spielbare Prioritätspfad reicht vom Start bis zum ersten Prestige. Drei Modulsockel, vier vollständige Loadouts, fünf deterministische Durchbruchswahlen, Prototyp-Rarität, mittlere/späte Rezepte und der Axiom-Reset sind noch nicht implementiert und werden deshalb weder in UI noch Roadmap als fertig markiert.
