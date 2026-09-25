# Economy v7 – Hardwareidentität und INT

Alle abstimmbaren Werte stehen in `src/economy.ts`. Oberfläche, Simulation und Tests rufen dieselben Funktionen auf; angezeigte Preise werden nicht separat nachgebaut.

## Ressourcen

| Ressource | Verwendung | Prestige |
|---|---|---|
| Credits | Hardware, Training, Forschung, Crafting | zurückgesetzt |
| Compute | Leistung aus Hardware; wird vom Betriebsprofil aufgeteilt | Hardwarebestand zurückgesetzt |
| Daten | entstehen durch Nutzer; Training und Projekte | zurückgesetzt |
| Forschungspunkte | entstehen aus Forschungs-Compute; Projekte | bleiben erhalten |
| Komponenten/Baupläne | Items und Crafting | bleiben erhalten |
| INT / Intelligence | Singularitätsbaum und dauerhafter Creditbonus | bleibt erhalten |
| Axiome | reserviertes Feld für den späteren Meta-Layer | bleibt erhalten; noch nicht spielbar |
| Gems | Missionen/Achievements und Komfortangebote | bleibt erhalten |

## Hardware und Betriebsprofile

Der datengetriebene Katalog enthält 15 stabile IDs. Jede Klasse definiert in ihrer eigenen Konfiguration die sechs Schwellen **10, 25, 50, 100, 250 und 500**, einen individuellen Namen sowie einen klassentypischen Nebeneffekt (Tap, Daten, Nutzer, Overclock, Training, Automation, Forschung, Offline oder Synergie). Für Klasse `i` gilt:

`nextCost(i,n)=baseCost(i)×growth(i)^n`

`bulkCost(i,n,k)=baseCost(i)×growth(i)^n×(growth(i)^k−1)/(growth(i)−1)`

Max-Kauf wird logarithmisch geschätzt und danach in beide Richtungen gegen `bulkCost` korrigiert. Die sechs Meilensteine erhöhen den Compute der jeweiligen Klasse kontrolliert um +12 %, +16 %, +22 %, +30 %, +42 % und +60 % multiplikativ. Sie sind ausdrücklich keine generische Verdopplung. Ein Klassen-Upgrade verdoppelt weiterhin ausschließlich diese Klasse.

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

## Prestige und INT

Nur reguläre Produktion und Taps erhöhen `lifetimeEligibleCredits`. Missionen, Debug, Werbung und Auftragsbelohnungen tun das nicht.

`raw = 3 × max(0, log10(1 + eligible / 1.400.000.000))^1,5`

`claimable = floor(raw) − prestigeEntitlementClaimed`

Jeder Reset ist ab mindestens **1 INT** möglich. Insgesamt verdiente, verfügbare und ausgegebene INT werden getrennt gespeichert. Der permanente Creditfaktor ist additiv: `1 + 0,10 × totalINTEarned`; Ausgeben reduziert ihn nicht.

Der alte Spezialisierungsdialog wurde entfernt. Sechs regelverändernde INT-Upgrades verwenden `ceil(baseCost × growthRate^level)`: Impulsarchiv, Warmer Neustart, Labor-Kopplung, Autonome Beschaffung, Artefakt-Bus und Rekursives Labor. Voraussetzungen, Effekttext, Kosten und Maximalstufe liegen zentral in `BALANCE.prestigeUpgrades`.

## Zeit, Offline und Migration

Simulation verwendet zehnsekündige Ereignisschritte und absolute Endzeitpunkte. Das Grund-Offline-Limit beträgt acht Stunden; ein später Automationsknoten erhöht es auf maximal 24 Stunden. Debug-Zeitsprünge verschieben die gesamte Timeline, nicht nur `savedAt`.

Save v9 migriert v1–v8. Erkenntnis wird vollständig in INT übertragen. Bereits in alte pauschale Knoten investierte Punkte werden bei der v6-Migration kostenfrei in verfügbares INT zurückgezahlt; die frühere Spezialisierung bleibt nur als inaktives Migrationsfeld erhalten. Hardware, Items, Gems, Forschung und Timer bleiben erhalten. Bei älteren Saves beginnt die lokale Run-Telemetrie erst mit der Migration; fehlende Vergangenheit wird nicht rekonstruiert. Bestehende Saves werden bei der Migration nicht in den neuen Prolog gesetzt. Unbekannte oder beschädigte Saves werden nicht überschrieben.

## Bewusste Grenzen

Der spielbare Prioritätspfad reicht vom Start bis zum ersten Prestige. Drei Modulsockel, vier vollständige Loadouts, fünf deterministische Durchbruchswahlen, Prototyp-Rarität, mittlere/späte Rezepte und der Axiom-Reset sind noch nicht implementiert und werden deshalb weder in UI noch Roadmap als fertig markiert.

## Zeitbasierte Labore (Save v10)

Forschungsprojekte werden beim ausdrücklichen Start genau einmal bezahlt. Ihre Basisdauer ist zentral `180 s × 1,30^Rang`; die drei aktuellen Ränge 0, 8 und 20 ergeben 3 Minuten, rund 24 Minuten und rund 9,5 Stunden. Fortschritt verwendet ausschließlich die persistierte Simulationszeit (`startedAt`/`endsAt`) und wird deshalb online und offline identisch abgeschlossen. Ein Labor ist von Beginn an verfügbar, das zweite folgt über **Labor-Kopplung**, das dritte ist eine einmalige Komfortfreischaltung für 125 Gems. Ein Projekt kann weder parallel doppelt gestartet noch doppelt belohnt werden.

Training bleibt eine aktive Entscheidung und bezahlt Credits plus `2 × (Modellstufe + 1)` Daten. Die Arbeitskurve `30 × (Stufe + 1)^1,25` wächst polynomial; die tatsächliche Dauer ergibt sich aus Arbeit geteilt durch die im Betriebsprofil zugewiesene Compute-Trainingsrate. Qualitäts- und Effizienzgewinne besitzen weiterhin ihre dokumentierten Softcaps.

Animierte Ressourcenzahlen interpolieren nur den zuletzt gerenderten Anzeigewert über 350 ms. Economy, Kosten, Speicherdaten und Simulation verwenden unverändert den echten Zustandswert; bei Reduced Motion oder verborgenem Dokument wird sofort auf den echten Wert gesprungen.

## Save v12, Benennung und präzise INT-Effekte

Neue Kampagnen speichern vor dem Prolog einen ausschließlich lokal validierten KI-Namen; `AURA` ist der Vorschlag. Der Name ist kein Balancewert, bleibt bei Prestige erhalten und wird bei bestehenden Saves als `AURA` migriert, ohne das Tutorial erneut zu starten. Save v12 trennt Lese-, Validierungs- und Backupfehler: ungültige Originaldaten sperren Autosave, werden nach Möglichkeit separat gesichert und bleiben als manueller Recovery-Download verfügbar.

Die INT-Karte zeigt nun ausschließlich tatsächlich angewandte Wirkungen: Impulsarchiv speichert je Stufe Daten anhand des Tap-Meilensteinbonus, Warmer Neustart gibt je Stufe einen Taschenrechner, Labor-Kopplung öffnet auf Stufe 1 Labor 2, Autonome Beschaffung öffnet Autokauf und das 24-Stunden-Offline-Limit, Artefakt-Bus verstärkt ausgerüstete Itemeffekte je Stufe um 10 %, und Rekursives Labor gibt je Stufe 25 Startdaten. Kosten und Mathematik wurden nicht verändert.

## Save v13 – INT-Leiterplatte, Stufen 1–3

Der frühere sechsteilige, exponentiell bepreiste Entwurf wurde ersetzt. Alte Ausgaben werden bei der v12→v13-Migration vollständig als verfügbares INT zurückerstattet. Die 13 implementierten Knoten kosten nach ihrer Tiefe fest **1 / 8 / 64 INT**; ein Knoten wird genau einmal gekauft. Stufen 4–7 (512 / 4.096 / 32.768 / 262.144 INT) und der mögliche Abschluss für 2.097.152 INT sind noch nicht kaufbar und werden nicht als Attrappen angezeigt.

- **Impulsnetz:** `creditRate ohne temporäre Boni × min(0,20; floor(Taschenrechner/10) × 0,01)` wird nach dem normalen, weiterhin auf fünf reale Taps/s begrenzten Tap-Ertrag addiert. Der Zusatz speist seine eigene Rate nie zurück.
- **Hardware-Atlas:** Hardware-Compute wird nach der Summe der Klassen mit `1 + 0,10 × aktuell besessene Klassen` multipliziert. Der Besitz setzt sich beim Prestige zurück.
- **Rechenverbund:** Besitzt die direkte Vorgängerklasse mindestens 25 Einheiten, erhalten höchstens die ersten zehn Einheiten der nächsten Klasse jeweils +25 % Basis-Compute. Danach greifen wie bisher Klassenmeilensteine und Klassen-Upgrade.
- **Labore:** Basisplatz + INT-Platz + bezahlter Gem-Platz, hart auf drei begrenzt. Die Queue hält genau ein Projekt. Der Assistent versucht es nach Simulationsereignissen und bezahlt beim erfolgreichen Start exakt die normalen Kosten; andernfalls bleibt es sichtbar vorgemerkt.
- **Scanner/Recycling:** Scanner gibt je Klasse beim ersten Überschreiten von 10 einmalig pro Account 3 Komponenten + 1 Bauplanfragment. Recycling gibt bei 25/50 je Run 2/4 Komponenten. Persistente Schlüssel verhindern doppelte Vergabe durch Bulk, Reload oder erneutes Auslösen; nur die Recycling-Schlüssel werden beim Prestige gelöscht.
- **Overclock:** Ein freigeschalteter Umschalter wählt vor Aktivierung genau Credits, Training oder Forschung. 15-s-Dauer, 30 Taps und 90-s-Cooldown bleiben unverändert. Der Kanal ist eine temporäre additive +100-%-Familie und wird nicht mehrfach angewandt.
- **Rückkopplung:** Ein vergüteter Tap gibt während eines bezahlten Trainings höchstens eine Sekunde der regulären Trainingsrate. Ein 60-s-Fenster begrenzt alle Tap-Arbeit zusammen auf 30 Sekunden der regulären Rate; Offline-Zeit simuliert keine Taps.
- **Zweiter Modellsockel:** Die bereits vorhandenen Item-Slots werden integriert statt dupliziert. Bei mindestens einem ausgerüsteten Compute- und Credit-Item entstehen +5 % in der Credit-Itemfamilie; Training plus Experiment/Forschung gibt +10 % Forschung. Beide Kombinationen sind additiv in ihrer Familie und multiplizieren erst mit anderen benannten Familien.

Die Reihenfolge ist: Klassenbasis + begrenzter Rechenverbund → Klassenmeilensteine/Upgrade → Summe aller Klassen → additive globale Compute-Familie → Atlasfamilie → Profilaufteilung → Modell/INT/Item/temporäre Familien. Kein Ergebnis wird erneut als Eingang derselben Formel verwendet.

## Save v14 – Achievements, Aufträge und Gem-Shop

Lifetime-Zähler erfassen tatsächlich gekaufte Stückzahlen (einschließlich ×10/Max), jemals besessene Klassen, Meilensteine, Prestiges/INT, Trainings- und Forschungsereignisse, gezielt hergestellte beziehungsweise entdeckte Items, vergütete Taps, Overclocks sowie regulär produzierte Credits und Daten. Debug-Gaben verändern diese Produktionszähler nicht. Laborarbeitszeit ist die Summe aktiver Slots: Zwei gleichzeitig laufende Labore liefern in zehn Sekunden 20 Laborsekunden, online wie offline.

Achievement-Stufen geben einmalig 2/4/8/12 Gems und 2/4/8/12 Punkte. `researchAchievement = 1 + min(0,20; floor(Punkte/10) × 0,01)`. Dieser Faktor gehört zur Forschungsfamilie und beeinflusst Credits nicht. Abgeschlossene Projekte dürfen gegen ihre unveränderten Kosten wiederholt werden; ihre Freischaltwirkung wird nur beim ersten Abschluss eingetragen, jeder echte Laborabschluss zählt jedoch für Langzeitziele.

Aufträge speichern bei Ausgabe Ziel und Zähler-Baseline. Daily besitzt vier Aufgaben/3er-Bonus (4×2 + 4 = 12 Gems), Weekly fünf/4er-Bonus (5×5 + 20 = 45), Monthly fünf/4er-Bonus (5×15 + 45 = 120). Ein optional aktiver Auftrag darf vorkommen, ist wegen der Bonusgrenze aber nie Pflicht. Bei vollständiger Teilnahme ergeben sich in einem 30-Tage-Monat ungefähr **675 Gems** (360 Daily + rund 195 Weekly + 120 Monthly). Beim UTC-Wechsel werden erfüllte, nicht abgeholte Einzelaufgaben und ein erreichter Bonus genau einmal direkt gutgeschrieben.

Gem-Sinks: permanente Laborplätze kosten 900/2.700 Gems. Basisplatz + Parallel-Labor + zwei Gem-Plätze sind additiv bis maximal vier. Training 60 Gems/60 Minuten, Labor 80/60 Minuten und 120 garantierte Komponenten für 120 Gems sind wiederholbar. Boost-Restzeiten werden addiert und bei 24 Stunden gedeckelt. Der Laborboost zieht während seiner Laufzeit eine zusätzliche reale Sekunde von aktiven Projekttimern ab und funktioniert daher auch in Offline-Simulationsschritten.

Regelmäßige vollständige Teilnahme erreicht den ersten Gem-Laborplatz rechnerisch nach rund 40 Tagen ohne Achievement-Gems; gelegentliche Teilnahme mit nur Daily-Boni dauert deutlich länger. Damit konkurrieren kleinere Boosts sichtbar mit dem Sparziel, ohne eine Progressionsvoraussetzung zu sein.


## Langfristiges Modelltraining und Stabilität (24. September 2026)

Quality und Efficiency sind unabhängige, manuell gestartete Pfade. Das Arbeitsziel der nächsten Stufe ist zentral als `round(90 × 1,7^(level − 1))` Sekunden definiert. Kosten skalieren nur mit der Stufe des ausgewählten Pfads. Quality erhöht Umsatz pro Nutzer; Efficiency senkt Compute pro Nutzer.

Die Arbeitsrate kombiniert Basisrate, relativen Trainings-Compute, Modellbonus und `1 + B / (1 + 0,35 × B)` als Softcap zusätzlicher Boni. Online- und Offline-Zeit verwenden dieselbe elapsed-time-basierte Simulation. Interne Schritte sind auf 60 Sekunden begrenzt; nicht endliche Schritte werden verworfen.

## Trainings-Compute-Kopplung und gemessene Laufzeiten (Korrektur)

Das Arbeitsziel bleibt `round(90 × 1,7^(level − 1))`. Roher Trainings-Compute wird
aber nicht mehr linear als Multiplikator verwendet. Die Compute-Komponente lautet nun
`min(3, max(1, (Trainings-Compute / 0,15)^0,2))`. Die fünfte Wurzel erhält erkennbare
Hardwareverbesserungen, begrenzt sie aber mathematisch auf Faktor 3. Item-, Meilenstein-
und Modellboni werden anschließend über ihre bestehende Softcap angewendet.

Der gemeldete alte Fall `90 / 37,44` dauerte rechnerisch **2,40 Sekunden**. Im
reproduzierbaren Kontrolllauf mit 36 frühen Hardwarekäufen dauerte das erste Training
nach der Korrektur rechnerisch **41,48 Sekunden**. Training 17 lag bei **2.893,65
Sekunden**, Training 34 bei **201.859,86 Sekunden**. Die tatsächlichen
Simulationsabschlusszeiten lagen wegen der bewusst groben 60-Sekunden-Testaufrufe bei
60, 2.940 und 201.900 Sekunden; der Spieltick selbst berechnet den Abschluss innerhalb
eines Aufrufs exakt.

## Typisierte Komponenten und feste Forschungsaufträge (25. September 2026)

Die sechs Komponenten **Schaltkreise, Laser, Graphen, Titan-Schrauben, Nanoröhrchen und Quantenkerne** besitzen nun getrennte, persistente Bestände. Hardwareanalysen liefern Schaltkreise/Laser/Titan-Schrauben, Architekturstudien Graphen/Nanoröhrchen und Artefaktsuchen Graphen/Nanoröhrchen/Quantenkerne. Damit hat jede Rezeptzutat einen im normalen Spiel erreichbaren Grant-Pfad. Die exakten Quellengewichte und Rezepte je Seltenheit liegen ausschließlich in `BALANCE.components`, `BALANCE.componentSources` und `BALANCE.itemRecipes` in `src/economy.ts`. Herstellen zieht jede angezeigte Zutat und Bauplanfragmente atomar ab; Funde und Crafting werden mit Quelle beziehungsweise Zutaten protokolliert.

Save v16 migriert den alten untypisierten Komponentenbestand verlustfrei zu Schaltkreisen. Komponenten und Items bleiben – wie schon zuvor – beim INT-Prestige erhalten; nur ausdrücklich laufbezogene Recycling-Schlüssel werden zurückgesetzt.

Forschungsprojekte behalten ihre zentralen Credit-, Daten- und FP-Kosten. Ein Start verlangt alle drei Bestände und zieht sie vollständig genau einmal ab. `startedAt` und das aus der zentralen Rangformel berechnete `endsAt` werden beim Start gespeichert; spätere Forschungsboni ändern den laufenden Auftrag nicht rückwirkend. Die drei Projekte sind einmalig und die Oberfläche benennt ihre Freischaltwirkung entsprechend.

## Wiederholbare Forschung und Baupläne – 25. September 2026

Save v17 ergänzt fünf persistente Forschungslevel. Für ein Ziellevel `L` wird die beim Start unveränderlich gespeicherte Dauer als `min(baseSeconds × 1,22^(L−1), 259.200 s)` und der einmalig abgezogene Datenpreis als `ceil(baseDataCost × 1,28^(L−1))` berechnet. Die Basen liegen ausschließlich in `BALANCE.repeatableResearch`: Datenerzeugung 90 s/40 Daten, Materialanalyse 150 s/80, Bauplananalyse 210 s/140, Modellarchitektur 300 s/220 und Laborautomation 420 s/360. Laufende Slots speichern Ziellevel, präzise Dauer, Datenpreis, Start und Ende; spätere Boni verändern diese Werte nicht.

Die Effekte verwenden bestehende Mechaniken: Datenerzeugung multipliziert Nutzerdaten, Material- und Bauplananalyse erhöhen garantierte Analyseerträge, Modellarchitektur multipliziert Nutzerumsatz, Laborautomation erhöht Analysetempo und öffnet ab Stufe 1 die bestehende Einzelwarteschlange. Komponenten- und Forschungslevel bleiben beim INT-Prestige erhalten.

Drei konkrete Baupläne ersetzen das generische Rezept für alle Items: Quantenchip (Compute), Neural-ASIC (Credits) und Feldscanner (Analyse). Zutaten und Bauplanfragmente werden atomar geprüft und abgezogen. Titan-Schrauben sind garantiert über jede lange Hardwareanalyse (17 von 45 Basiskomponenten) sowie nach Freischaltung über Meilenstein-Recycling erreichbar; sie hängen nicht von einem Zufallswurf ab. Missionen und eigenständige passive Hardwarefunde sind weiterhin angekündigte, aber noch nicht implementierte Zusatzquellen. Offline abgeschlossene Analysen verwenden dagegen denselben garantierten Grantpfad wie aktive Analysen.

## Transaktionale Komponentenanalyse und Datensoftcap – 25. September 2026

Komponentenanalysen besitzen einen **eigenen einzelnen Analyseslot** und belegen keinen
Forschungslaborplatz. Ein Start prüft und reserviert Credit- und Datenkosten in derselben
reinen Zustandsoperation. Kurzanalysen kosten je nach Quelle 750/60, 1.500/120 oder
3.000/240 Credits/Daten; die langen Verträge kosten 12.000/900, 24.000/1.800 oder
48.000/3.600. Laufzeit, Kosten, Start und Ende werden im aktiven Vertrag gespeichert.
Ein Abbruch gibt bewusst nichts zurück. Ein bereits als abgeschlossen markierter,
aber durch einen alten/unterbrochenen Save noch aktiver Vertrag wird beim nächsten
Simulationsschritt entfernt und blockiert den Slot nicht dauerhaft.

Die Analyseoberfläche zeigt für beide Längen vorhandene und benötigte Ressourcen,
exakte Fehlmengen, effektive Dauer, garantierte Quellen und den Slotstatus. Forschung
und Analyse können parallel laufen. Analyse-Start und -Abbruch lösen außerdem sofort
einen transaktionalen Ereignis-Save aus; dadurch ging ein direkt nach dem Klick
neu geladener Start zuvor bis zum nächsten Autosave verloren.

Der Forschungsbonus auf Datenerzeugung ist nicht mehr unbegrenzt linear. Der rohe
Bonus `Stufe × 0,08` läuft durch denselben zentralen Softcap mit Schwelle 0,8:
`1 + softcap(Stufe × 0,08; 0,8)`. Daten bleiben über Training, Forschung und Analysen
mehrfach verwendbar, ohne dass hohe Forschungsstufen die Datenrate linear entkoppeln.
Werte ab `1e15` werden in der UI konsistent wissenschaftlich dargestellt.

## V18 – Daten, Prestige und Fertigung
- Datenforschung: `1 + min(0.50, 0.02 × level)`; der Bonus ist additiv gedeckelt.
- Prestige: fünf Äste mit drei seriellen Knoten. Basiskosten 100/1.000/10.000 INT, multipliziert mit `10^branchIndex`.
- Datenarchiv: +10/+20/+30 % Datenproduktion. Compute-Netz: +2/+3/+5 % Compute je freigeschalteter Hardwareklasse. Analyse: +10/+20/+30 % Komponentenfunde, Stufe III garantiert mindestens einen seltenen Fund.
- Labore: zweiter Slot, Queue mit zwei Plätzen, Autostart der Queue. Fertigung: zweiter Sockel, −15 % Upgrade-Kosten, Modulrezepte.
- Komponenten → Module → Items: Compute-Bus und Daten-Gitter sind dauerhafte Zwischenprodukte. Item-Crafts und Rarity-Upgrades verbrauchen Daten atomar.
- Item-Raritäten reichen Common → Uncommon → Rare → Epic → Legendary → Mythic.
- Prestige bricht laufende Forschung und Analysen ohne Refund ab und setzt normale Forschung zurück; Komponenten, Module und Items bleiben erhalten.

## Economy completion pass (Save v19)

- Komponentenanalysen bleiben vollständig vom Forschungslabor getrennt. Datenkosten werden beim Start einmalig abgezogen; die UI zeigt Bestand, Fehlmenge und Daten-Ansparzeit.
- Passive Hardwarefunde: pro freigeschalteter Hardwareklasse entsteht 1 Schaltkreis je 3.600 Sekunden. Der Fortschritt wird als `passiveCircuitProgress` gespeichert und funktioniert online/offline deterministisch.
- Jeder neu überschrittene Hardware-Meilenstein gibt 1 Titan-Schraube; Gaming-GPU-Meilensteine geben zusätzlich 1 Laser. Damit haben die frühen Komponenten neben Analysen erreichbare Grind-Quellen.
- Ausrüstung: Sockel 1 wird mit dem ersten Prestige dauerhaft aktiv; `Fertigung I` schaltet Sockel 2 frei. Ausrüstungsboni auf Daten und Forschung werden in die Produktionsraten eingerechnet.
- Save-Schema 19 ergänzt den persistenten passiven Komponentenfortschritt; v18 wird explizit migriert.

### Scientific-number arithmetic boundary (v19 follow-up)
Hardware single/bulk cost math now has a normalized mantissa/exponent representation (`ScientificNumber`) before conversion into legacy UI/state numbers. This prevents overflow inside geometric cost/power calculations and gives max-buy an overflow-safe comparison path. Hardware counts are rejected if a purchase would exceed JavaScript's safe-integer range. Persisted resource balances are still numeric in save v19; therefore this is an arithmetic-boundary migration, not yet the final arbitrary-precision save schema.

### Datenpflichtige Fertigung – Abnahme v19.3
Werkstattaktionen verwenden jetzt denselben Transparenzvertrag wie Analysen/Forschung: Module, Item-Crafts und Item-Upgrades zeigen Datenkosten, aktuellen Datenbestand, Fehlmenge und aus der aktuellen Datenrate berechnete Ansparzeit. Item-Crafts berücksichtigen beim Aktivieren des Buttons zusätzlich fehlende Module, Komponenten und Bauplanfragmente. `itemUpgradeCost` ist die zentrale Kostenfunktion für Common → Uncommon → Rare → Epic → Legendary → Mythic und wendet Fertigung II auf Komponenten **und** Daten an.

`ScientificNumber` unterstützt zusätzlich Addition, Subtraktion, Division und JSON-Roundtrips als `{m,e}`. Damit steht die notwendige Arithmetik für die noch ausstehende persistente Ressourcenmigration bereit, ohne Werte > `1e308` in `Infinity` umzuwandeln.

### Atomare Ressourcenbuchungen
Credit-/Datenkosten für Training, Forschung, Analysen, Hardware und Fertigung laufen über `canAffordResources`/`spendResources`. Die Buchung prüft beide Währungen vorab und zieht sie gemeinsam über `ScientificNumber`-Subtraktion ab; Teilabbuchungen bei fehlenden Daten sind damit ausgeschlossen. Produktionsdaten werden über `addData` auf demselben sicheren Additionspfad verbucht.

### Save v20: persistente Präzisionsspur
Credits, Daten sowie die Prestige-/INT-Summen besitzen zusätzlich zu den UI-kompatiblen `number`-Projektionen eine serialisierte `{m,e}`-Darstellung (`exactEconomy`). Alle zentralen Credit-/Daten-Transaktionen und INT-Käufe/Prestige-Buchungen aktualisieren diese Präzisionsspur. Save v19 wird beim Laden verlustfrei aus den vorhandenen endlichen Werten nach v20 migriert. Balance-Exporte enthalten die exakten Mantissen/Exponenten zusätzlich zu den lesbaren Projektionen.

## A–H-Abnahmeblock v20.1

- **Labore III ist jetzt wirklich automatisch:** eine vorgemerkte Forschung wird nicht nur direkt nach einem Forschungsabschluss geprüft, sondern bei jedem Simulationsschritt erneut. War sie beim Vormerken/Abschluss wegen Datenmangel unbezahlbar, startet sie exakt dann, wenn Datenbestand und freier Slot reichen.
- Die Analyseansicht zeigt den letzten tatsächlich verbuchten Komponentenfund aus dem Abschlussereignis; Startkosten, Restzeit und laufender Status bleiben sichtbar.
- Der lokale Balance-Export enthält zusätzlich `analyses.csv`, `components.csv`, `crafting.csv` und `prestige-nodes.csv`. Damit sind Analysefunde, Komponentenquellen/-mengen, Herstellung/Upgrades/Itemeffekte und tatsächliche INT-Knotenkäufe getrennt auswertbar.
- Prestige-Knotenkäufe erzeugen dafür ein lokales `prestige-node-buy`-Ereignis mit Kosten, Ast, Tiefe und Effekt. Es findet kein Upload statt.

### A–H Abschlussprüfung v20.2

- Hardware-Max-Käufe verwenden nun das autoritative `exactEconomy.credits`-Ledger auch oberhalb der auf `1e300` begrenzten UI-Projektion. Die Suche nach der maximal kaufbaren Menge erfolgt deterministisch per exponentieller Eingrenzung plus Binärsuche; der exakte Scientific-Preis wird vom Ledger abgezogen.
- Hardware-Telemetrie protokolliert zusätzlich `exactCost` in wissenschaftlicher Schreibweise, damit ein UI-Cap nicht als echter Kaufpreis exportiert wird.
- Die Produktionszerlegung weist Itemboni getrennt für Credits, Compute, Daten, Forschung, Training und Analyse aus.

## A–H acceptance closure v20.3

The binding economy contract is now represented in code rather than only in roadmap notes: 15 hardware classes each retain milestones 10/25/50/100/250/500; component source labels match their implemented passive/milestone/analysis paths; prestige reset/retention has an explicit regression; and every positive component ingredient used by an item recipe maps to an implemented source. Balance export also records upgrade component consumption explicitly (`upgradeComponent`, `upgradeComponentCost`) instead of only the data cost.

The authoritative large-value resource ledger remains serialized as normalized mantissa/exponent values while finite `number` projections are retained for rendering and charts. This is intentional: JavaScript Number is not integer-exact beyond `2^53 - 1`, so gameplay-critical balances and max-buy decisions must not depend on the projection.

## Progression V2 (Save v21)
- Achievement-Familien sind langfristige, dynamische Karten mit bis zu zehn Stufen. Eine abgeschlossene Stufe wird nicht als neue Karte dupliziert; dieselbe Karte zeigt das nächste Ziel und übernimmt den Lifetime-Fortschritt.
- Missionsumfang: 6 Daily, 12 Weekly, 30 Monthly. Der Generator verwendet freigeschaltete Metriken und progressive Wiederholungen derselben Quest-Familie (Stufe II+ mit höherem Ziel), statt 48 isolierte Mechaniken zu benötigen.
- Hardware-Mastery: jede der 15 Klassen behält die Schwellen 10/25/50/100/250/500. Ab 100 Einheiten wird der individuelle Autobuyer dieser Klasse dauerhaft nutzbar; er kauft alle 5 Sekunden und respektiert die globale Credit-Reserve.
- Der INT-Baum wurde von 15 auf 40 Knoten erweitert. Die bestehenden fünf Äste bleiben das Fundament und reichen nun bis Tiefe 8. Späte Knoten skalieren Daten, Compute, Analyse- und Forschungsgeschwindigkeit sowie Itemeffekte; Labore V lässt die Forschungsqueue Prestige überleben und Fertigung V öffnet den dritten Item-Sockel.
- Die neuen Tiefen kosten bis 1e19 INT und sind bewusst als Monatsziele angelegt. Ein zweiter Prestige-Layer (Singularity/Axiom) bleibt eine spätere Ebene und ist in v21 noch nicht implementiert.
- Der alte einmalige ×2-Klassenkauf bei 15 Einheiten wird in v21 nicht mehr angeboten. Bestehende Legacy-Saves behalten bereits gekaufte Klassen-Upgrades zur Rückwärtskompatibilität; neue Progression läuft ausschließlich über 10/25/50/100/250/500-Mastery.
