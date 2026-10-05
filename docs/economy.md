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
| Axiome | `floor(sqrt(cycleINTEarned / threshold))` | bleiben erhalten; permanenter Creditfaktor `1 + 0,5 × totalAxiomsEarned` |
| Gems | Missionen/Achievements und Komfortangebote | bleibt erhalten |

## Axiom-Resetvertrag

Nur durch bestätigte normale Prestiges erhaltene INT erhöhen `cycleINTEarned`. Verfügbares, ausgegebenes, hypothetisch beanspruchbares oder per Debug gesetztes INT zählt nicht. Historisch verdiente INT (`totalINTEarned`) bleiben getrennt erhalten; der normale INT-Creditbonus und die INT-Synergie verwenden ausschließlich `cycleINTEarned`. Der Axiom-Faktor wird separat mit dem normalen INT-Faktor multipliziert und beeinflusst weder Data noch Drops oder Forschungszeiten.

Ein Axiom-Reset löscht die normale Lauf-Economy, Training und Analysen, alle INT-Bestände und INT-Knoten sowie den Zyklus-Umsatz und dessen Anspruch. Aktive Forschung bleibt bestehen; die ohne `labs2` nicht mehr gültige Forschungsqueue wird entfernt. Sammlung, Module, Fragmente, Baupläne, Items, Ausrüstung und Plätze, reservierte Crafting-Aufträge, Forschung, Gems/Laborplätze sowie Meta-, Profil- und Storyfortschritt bleiben erhalten. Autobuyer-/Scanner-Einstellungen bleiben gespeichert, sind ohne ihren verlorenen Knoten aber wirkungslos.

### Aufgelöste Altmechaniken

- Das bisherige Feld `axioms` war ein ungenutzter Platzhalter. Es wird aus Kompatibilitätsgründen als Spiegel von `availableAxioms` fortgeführt; maßgeblich sind nun `availableAxioms`, `totalAxiomsEarned` und `axiomResetCount`.
- Der bisher kumulative `lifetimeEligibleCredits` darf wegen seines Statistikvertrags nicht zurückgesetzt werden. Der neue exakte Zähler `cycleEligibleCredits` ist deshalb die Grundlage des normalen INT-Anspruchs und verhindert, dass historischer Umsatz nach einem Axiom-Reset erneut INT erzeugt.
- `totalINTEarned` speicherte zuvor zugleich Historie und bonuswirksames INT. Es bleibt nun die Historie; `cycleINTEarned` steuert den aktuellen normalen Bonus.
- Die vorhandenen „Deep Prestige“-Funktionen sind tatsächlich späte INT-Knoten (`dataArchive4` usw.), kein zweiter Reset. Sie werden beim Axiom-Reset zusammen mit allen INT-Knoten entfernt.

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

Die Modellfaktoren werden in sämtlichen Produktionspfaden aus genau dieser
kontinuierlichen Abbildung berechnet; die später ergänzten Synergiefamilien ersetzen
den Softcap nicht. Zeitintervalle integrieren außerdem die während des Intervalls
anwachsende Lifetime-Datensynergie über eine deterministische, vom absoluten
Intervall unabhängige Stammfunktion. Dadurch liefern ein großer Simulationsaufruf und
beliebige Teilaufrufe dieselben Credits, auch wenn ein Save mitten im Schritt liegt.

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

**Aktuelle Konfiguration (stabilisiert am 29. September 2026):** Der historische
v17-Absatz beschreibt nicht mehr die heutige Progression. Maßgeblich sind zentral
`1,16^(L−1)` für die Dauer mit einem Cap von 48 Stunden sowie `1,32^(L−1)` für
den Datenpreis. Tests leiten Wachstum und Cap direkt aus `BALANCE` ab.

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

`ScientificNumber` unterstützt zusätzlich Addition, Subtraktion, Division und JSON-Roundtrips als `{m,e}`. Damit steht die notwendige Arithmetik für die noch ausstehende persistente Ressourcenmigration bereit, ohne Werte > `1000000000000000` in `Infinity` umzuwandeln.

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

## Mission Hub, Neural Seasons und Profil (v22)
- Home/Werkstatt besitzt einen ausklappbaren Mission Hub mit Daily/Weekly/Monthly-Tabs und zentralem Claim-Badge.
- Eine Neural Season dauert 30 Tage, besitzt 50 Level à 1.000 XP und erhält XP aus Missions-Claims/Periodenboni. Rewards sind Gems, garantierte Komponenten und auf Level 50 ein permanentes Season-Core-Artifact.
- Season-Artifacts, abgeschlossene Seasons, Inbox-Lesestatus und Profilname sind permanent im Save gespeichert und überstehen Prestige.
- Profilansicht bündelt Collection, Season-Historie, Lifetime-Statistiken, Inbox/Patch Notes und Einstellungen. Keine neue Season-Währung wird eingeführt.

## Retention progression v23
- Jede der 15 Hardwareklassen wechselt ab 500 Besitz in permanente Hardware-Mastery. Käufe oberhalb 500 erzeugen klassenspezifische Mastery-XP; `floor(sqrt(xp / 250))` bestimmt das Level. Jedes Level gibt +1 % Klassen-Compute bis maximal +50 %.
- Challenges sind permanente Account-Ziele mit Challenge Stars. Stars werden nur einmal beansprucht und bleiben über Prestige erhalten.
- Tiefe Prestige-Knoten erhalten zusätzliche Account-Gates: Tiefe 5 = 100 Achievement Points, Tiefe 6 = 10 Gesamt-Mastery, Tiefe 7 = 10 Challenge Stars, Tiefe 8 = 500 AP + 50 Mastery + 25 Stars.
- Collection/Profil zeigt Hardware-, Komponenten-, Item-, Season- und Artifact-Fortschritt sowie alle 15 Mastery-Level.

## Challenge Runs und Langzeitsimulation (v24)

Fünf optionale Challenge-Runs verwenden dieselbe Run-Economy mit echten Einschränkungen: `no-taps` deaktiviert Tap-Credits, `no-items` ignoriert ausgerüstete Itemeffekte, `five-hardware` begrenzt Käufe auf die ersten fünf Klassen, `data-crunch` multipliziert Datenproduktion mit 0,10 und `inflation` multipliziert Hardwarepreise mit 100. Ziel ist jeweils ein Anspruch von mindestens 1 INT. Abschluss gibt permanente Challenge Stars; Bestzeit und Clears bleiben über normale Prestiges erhalten.

Der bestehende Acceptance-Simulator bietet zusätzlich `simulateLongTermSuite(1708)` für 7/30/90/180 Tage aktiv und passiv. Simulator-Telemetrie wird während Langläufen auf die letzten 24 Snapshots kompaktiert, damit die Messung nicht quadratisch durch Diagnosehistorie wächst; die Economy-Regeln selbst bleiben identisch.

## Scaling & Synergy Pass
- Alte Hardware bleibt relevant: je 100 gehaltene Hardwareeinheiten erhöht ein gedeckelter Ownership-Faktor die Credit-Produktion; Klassen ab 500 Einheiten bilden zusätzlich einen multiplikativen Legacy-Infrastruktur-Faktor.
- Hardware-Mastery sammelt nun bei jedem Kauf XP statt erst oberhalb von 500 Einheiten. Der Mastery-Bonus wirkt direkt auf den Klassen-Compute.
- Compute-Netz IV/V verstärken die Legacy-Infrastruktur zusätzlich. Damit koppelt Prestige bewusst an breite Hardware-Builds.
- Ausgerüstete Items besitzen weiterhin einen klaren Basiseffekt, skalieren nun aber zusätzlich mit freigeschalteten Hardwareklassen, erreichten Meilensteinen, Rarität und Item-Level. Datenprisma-Builds erhalten zusätzlich Synergie aus gehaltenen seltenen Komponententypen.
- Komponentenanalysen zeigen die normalisierten Drop-Gewichte jeder möglichen Komponente sowie den aktuellen Fundbonus und die implementierte Quelle.
- Crafting-Buttons nennen bei Blockade die konkret fehlenden Komponenten, Module, Daten oder Bauplanfragmente.

## Challenge-Run-Abgrenzung (29. September 2026)

Die bestehende Prestigeformel und ihre Balancewerte bleiben unverändert. Challenge-Fortschritt wendet dieselbe Formel ausschließlich auf den seit Challenge-Start zusätzlich erzielten prestigeberechtigten Lifetime-Umsatz an; nicht berechtigte Reward- und Debug-Credits tragen weiterhin nichts bei.

## Dauerhafte KI-Ausrüstungsplätze (29. September 2026)

Nach dem ersten Prestige ist Platz 1 kostenlos. Platz 2 kostet **1e9 Credits**, Platz 3 nach Platz 2 **1e20 Credits**. Beide Käufe prüfen und subtrahieren mit `ScientificNumber`. Fertigung I beziehungsweise Fertigung V gewähren denselben zweiten beziehungsweise dritten Platz kostenlos; insgesamt bleiben höchstens drei Plätze aktiv.

## Zeitbasierte Werkbank (vorläufig)
Zwischenprodukte benötigen 60 Sekunden je Stück. Itemrezepte verwenden feste, rezeptgebundene Zeiten: Common 5 Minuten, Uncommon 15 Minuten, Rare 1 Stunde, Epic 4 Stunden, Legendary 12 Stunden und Mythic 24 Stunden. Zutaten werden beim Einreihen reserviert; die Werkbank verarbeitet einen aktiven und höchstens drei wartende Aufträge.

## Forschungsansicht und Datenkosten (2026-09-30)

- Forschungsprojekte – einmalig wie wiederholbar – reservieren beim erfolgreichen Start ausschließlich ihre bereits definierte Datenmenge. Frühere Credit- und Forschungspunkt-Komponenten wurden aus dem zentralen Balance-Vertrag entfernt; Analysen behalten ihre unveränderten Credit-/Datenkosten, Durchbrüche ihre Fragmentkosten.
- Der Startvertrag prüft Voraussetzung, freien Forschungsslot, bereits laufende/abgeschlossene Projekte und den exakten Datenbestand, zieht Daten genau einmal ab und speichert die beim Start berechnete Dauer im Laborauftrag. Ein erneuter Start desselben laufenden Projekts ist zustandsneutral.
- Der Analyseslot ist weiterhin unabhängig von sämtlichen Forschungslaboren. Kurz-/Langverträge, Belohnungsmengen, Fundgewichte und Drop-Raten wurden nicht verändert.

## Schicht 1: Credits → Hardware → Compute → Users → Credits (2026-09-30)

Alle 15 Hardwareklassen sind ohne Bestands-, Forschungs-, Modelllevel-, INT- oder Prestigevoraussetzung ausschließlich gegen Credits kaufbar. Die zentralen Parameter `baseCost`, `growth` und `compute` stehen in `BALANCE.hardware` in `src/economy.ts`; die Wachstumsfaktoren sind für Klasse 1–15 unverändert gemäß Vorgabe 1,17 bis 1,31. Für die kalibrierten Klassen 1–6 gelten Basispreise 15 / 180 / 5.000 / 100.000 / 1.000.000 / 51.000.000 und Basis-Compute 1 / 10 / 100 / 1.000 / 10.000 / 90.000. Spätere Basispreise/-produktionen wurden nicht als monatelang fertig balanciert bewertet.

Der Preis der nächsten Einheit bei Besitz `n` ist `baseCost × growth^n`. Ein Kauf von `k` Einheiten verwendet exakt dieselbe geometrische Reihe `cost(n) × (growth^k − 1) / (growth − 1)`. Preis, Summe, Vergleich und Abzug laufen als `ScientificNumber`; für `k=1` wird der Einzelpreis direkt zurückgegeben, um keinen Rundungsrest durch die Summenformel einzuführen. Meilensteine werden nur an 10/25/50/100/250/500 ausgewertet und beim Überschreiten einer Schwelle genau einmal protokolliert.

Das isolierte Messprofil setzt einen Taschenrechner voraus und bildet Compute, nutzbare Users-Kapazität und Creditrate ohne Training, Forschung, Items, Questbelohnungen, Taps oder Prestigeeffekte identisch ab. Es verändert das eigentliche Spiel nicht. Reale Vorher-/Nachher-Werte für Strategien A/B, Meilensteine, Produktionsanteile, Sparphasen, Amortisationen, nicht erreichte Klassen und die Kontrollmessung stehen in `docs/layer-one-balance.md` sowie maschinenlesbar in `docs/layer-one-balance.json`.

Ergebnis: Alle Zeitfenster für Erstkäufe der Klassen 1–5 werden erreicht; Klasse 6 liegt nach 10.974,6 Sekunden und damit nach drei Stunden. Die Erstkäufe 2–5 steigern die Rate in Strategie A um 55,8 %, 35,2 %, 38,3 % und 51,3 %, ihre Produktionsanteile bleiben unter 75 %. Die Zielvorgabe zweier einzelner Sparphasen von 2–5 Minuten vor Klasse 5 wird dagegen nicht erreicht: Die ROI-Strategie teilt diesen Zeitraum durch rentable Zwischenkäufe in kürzere Intervalle. Dieser Konflikt ist offen dokumentiert und wurde nicht durch künstliche Wartezeiten kaschiert.

## Schicht 2: Data-Produktion und Modelltraining (2026-09-30)

Die Hardwarepreise, Hardwareproduktion und Wachstumsfaktoren aus Schicht 1 bleiben unverändert. Data verwendet jetzt ausschließlich die nutzerbasierte Grundrate `0,1 × sqrt(users)`. Alle zusätzlichen prozentualen Data-Effekte aus Hardwaremeilensteinen, Forschung, Prestige, Items, Modell- und Data-Synergien werden als effektive Dezimalboni in `rawBonus` addiert. Daraus folgt `dataMultiplier = 1 + 4 × rawBonus / (4 + rawBonus)` und `dataPerSecond = baseDataPerSecond × dataMultiplier`. Ohne Bonus ist der Multiplikator 1; durch die explizite ScientificNumber-Obergrenze bleibt er auch bei extremen Werten strikt unter 5. Die Data-Crunch-Challenge bleibt als nachgelagerter Malus erhalten. Eine parallele lineare Nutzer-/Compute-Datenquelle existiert nicht mehr.

Quality und Efficiency besitzen getrennte Levelzähler. Für das jeweils nächste Track-Level `L` gelten `dataCost(L) = ceil(15 × 1,75^(L−1))` und `durationSeconds(L) = min(90 × 1,35^(L−1), 259.200)`. Training kostet keine Credits. Data wird beim Start über das exakte ScientificNumber-Ledger genau einmal abgezogen; ein aktiver Lauf blockiert einen zweiten Start. Die beim Start gespeicherte Dauer läuft mit real verstrichener Zeit und Rate 1 online wie offline. Compute-Zuteilung, Hardware, Taps, Overclock, Items, der alte Trainingsboost und der Trainingsgraph verkürzen diese Dauer nicht. Research- und Analysezeiten wurden nicht verändert. Prestige setzt laufendes Training wie zuvor zurück.

Save v30 migriert v29-Läufe verlustfrei proportional auf die neue feste Dauer, setzt deren historische Creditkosten auf null und entfernt einen eventuell laufenden alten Trainings-Zeitboost. Beschädigte oder inkompatible Saves folgen weiterhin dem bestehenden nicht überschreibenden Ladepfad.

Die echte 24-Stunden-Messung steht in `docs/layer-two-balance.md` und `docs/layer-two-balance.json`. Sie weist zwei Konflikte offen aus: Das erste Training startet mit der unveränderten Schicht-1-Hardwarekurve bereits nach 75 Sekunden statt nach 3–5 Minuten; anschließend wächst die Data-Rate in diesem aggressiven Hardwarelauf schneller als die frühen Trainingskosten, sodass die reinen Ansparpausen nicht monoton steigen. Die vorgegebenen Data-, Kosten- und Dauerformeln wurden nicht zur Beschönigung verändert.

## Schicht 3: Forschung und Analysen (2026-10-01)

Die Schicht-1-Hardwarekurve und die Schicht-2-Data-/Trainingsformeln wurden vor der Kalibrierung geprüft und bleiben unverändert. Wiederholbare Forschung ist explizit einer von vier zentralen Balancekategorien zugeordnet: Datenerzeugung (40 Data, 180 s), Material-/Bauplananalyse (100 Data, 600 s), modellbezogene Forschung (250 Data, 1.800 s) oder Automation (600 Data, 3.600 s). Für Stufe `L` gelten `ceil(baseData × 1,85^(L−1))` und `min(baseDuration × 1,35^(L−1), 259.200 s)`. Einmalprojekte verwenden Stufe 1 ihrer Kategorie. Voraussetzungen, Effekte und Laborplätze bleiben unverändert; Kosten sind ausschließlich Data.

Forschungsdauer und Data-Kosten werden beim Start fest in den Laborauftrag geschrieben. Ein bereits aktiver Laborboost wird einmal beim Start berücksichtigt; spätere Bonusänderungen verschieben `endsAt` nicht mehr. Forschung kann online, offline und über Reload genau einmal abschließen. Die vorhandene Prestige-Rücksetzung bleibt unverändert.

Analysen bleiben in ihrem unabhängigen Slot. Hardwareanalyse kostet kurz 75 Data/600 s und lang 900 Data/14.400 s; Architekturstudie 300 Data/1.800 s beziehungsweise 3.600 Data/28.800 s; Artefaktsuche 1.200 Data/7.200 s beziehungsweise 14.400 Data/86.400 s. Creditkosten wurden entfernt. Der bestehende Analyse-Tempoeffekt wird einmal beim Start in der gespeicherten Dauer berücksichtigt. Drop-Tabellen, Garantien, Freischaltungen und Belohnungen wurden nicht verändert; Wiederholen prüft und belastet Data erneut.

Die ursprüngliche 1-/7-Tage-Messung begann fälschlich erst nach acht Stunden Wandzeit. Diese Werte sind verworfen und werden vollständig durch die nachfolgende Schicht-3-Messkorrektur sowie `docs/layer-three-balance.md` Version 2 ersetzt.

### Schicht-3-Messkorrektur (2026-10-01)

Der Schicht-3-Bericht ist als Version 2 neu erzeugt. Neue Kampagnen beginnen nun bei `t=0` mit einer aktiven Sitzung; es werden keine Offline-Erträge vor dem ersten Spielmoment erzeugt. Zusätzlich werden Data-Entscheidungen einschließlich Bestand vor/nach dem Versuch, Kosten, Fehlmenge und ETA sowie Abschlüsse separat protokolliert. Die Forschungs-, Analyse-, Hardware-, Trainings-, Item- und Prestigeformeln wurden dabei nicht geändert.

Die fehlende frühe Herstellung war ein Simulatorproblem, keine unerreichbare Zutat: kurze Analysen wurden nur während der Sitzungen neu gestartet, der Simulator verwendete ausschließlich Hardwareanalysen und reservierte Zwischenprodukte für mehrere Rezepte. Gleichzeitig löschte ein freiwilliger Prestige vor dem ersten Craft den angesparten Laufbestand. Die korrigierte Strategie verfolgt das erste Rezept in stabiler Katalogreihenfolge, nutzt Artefaktsuchen für fehlende Bauplanfragmente, wechselt bei ausreichenden Data auf den vorhandenen Langauftrag und verschiebt freiwilliges Prestige bis nach dem ersten natürlichen Craft. Drop-Raten, Rezepte, Quellen und Ressourcen wurden nicht verändert.

Für Forschungsdauer bleibt ausschließlich der schon vor dieser Korrektur unterstützte aktive Laborboost maßgeblich: Er wird beim Start einmalig angewendet. Analysen wenden die vorhandenen Effekte `labLink`, Planning, ausgerüstete Analyseboni, Deep-Prestige und Laborautomation ebenfalls einmal beim Start an. Laufende Endzeiten bleiben danach unveränderlich.

## Schicht 3 v3: Frühstart und Impulsrelais (2026-10-01)

Die deterministische Suche über die echte 10-Sekunden-Entscheidungstimeline setzt ausschließlich zwei frühe Data-Kosten neu: Die Kategorie **Datenerzeugung** steigt von 40 auf **363 Data**, die **kurze Hardwareanalyse** von 75 auf **57.623 Data**. Mit 362 Data wäre Forschung bereits bei 290 Sekunden bezahlbar; 363 verschiebt sie auf 300 Sekunden. Mit 57.622 Data wäre die Hardwareanalyse bei 890 Sekunden bezahlbar; 57.623 verschiebt sie auf 900 Sekunden. Beide Grenzen gelten in Strategie A und B. Forschungswachstum, Dauern, alle übrigen Forschungskategorien, lange Hardwareanalyse, Architektur-/Artefaktverträge, Data-Produktion und Belohnungen bleiben unverändert.

Das neue Common-Item **Impulsrelais** kostet 12 Schaltkreise und 2 Kupferspulen, benötigt weder Data noch Fragmente oder Zwischenprodukte und belegt die Werkbank 300 Sekunden. Sein Bauplan wird beim echten Abschluss der ersten Hardwareanalyse permanent freigeschaltet. Ausgerüstet zählt jede Iteminstanz ihre vergüteten Taps persistent; jeder zehnte addiert mit `ScientificNumber` genau zwei Sekunden der aktuellen Creditproduktion zum regulären Tap-Einkommen. Der Bonus erzeugt keinen weiteren Tap, keine eigene Combo und ignoriert Seltenheit beziehungsweise Upgradehöhe. Der Prozessor-Slot verhindert Stapeln. Item, Freischaltung und Komponenten bleiben beim Prestige erhalten; Ausrüstung bleibt bis zum ersten Prestige gesperrt.

Der Bericht `docs/layer-three-balance.md` Version 3 misst Seeds 1708, 42 und 2026. Forschung startet bei 300 Sekunden, Hardwareanalyse bei 900, der Bauplan bei 1.500 und die Herstellung endet bei 1.800 aktiven Sekunden. Das Itemziel von 45–75 Minuten wird damit verfehlt: Das feste Rezept ist bei den vorhandenen echten Komponenten bereits nach 30 Minuten fertig. Es wurden weder künstliche Wartezeiten noch Drop-Anpassungen eingeführt.
## Prestige-Vorschau und Resetvertrag (1. Oktober 2026)

- `prestigePreview(state)` und der tatsächliche Reset verwenden denselben reinen Reset-Builder. Prestige ist ausschließlich an mindestens 1 neu beanspruchbare INT gebunden; es gibt keine Zeit-, Hardware- oder Forschungssperre.
- Der dauerhafte Creditfaktor ist `1 + 0,1 × totalINTEarned`. Ausgaben aus `unspentINT` ändern `totalINTEarned` und damit den Faktor nicht.
- Zurückgesetzt werden Credits, Data, Hardwarebestände, Klassen-Upgrades, Quality/Efficiency und Trainingsfortschritt. Forschungslabore und Forschungsqueue laufen mit ihren gespeicherten Endzeiten weiter. Aktives Training sowie aktive/wartende Analysen enden ohne Erstattung. Aktive und wartende Crafting-Aufträge einschließlich reservierter Zutaten bleiben unverändert.
- Erhalten bleiben außerdem Komponenten, Zwischenprodukte, Baupläne, Fragmente, Items, gültige Ausrüstung, gekaufte Equipment-Plätze, Gems, Achievements, Quest-/Season-Fortschritt, Prestige-Knoten und sämtliche dauerhaft verdiente INT. Der erste Prestige öffnet über `prestigeCount` genau einen kostenlosen Equipment-Platz.
- Historische Messung vor der unten dokumentierten INT-Kalibrierung: erste INT-Verfügbarkeit bei 765 s und normaler Simulatorentscheid bei 1.050 s. Diese beiden Prestigezeiten sind durch die neue Anspruchsschwelle ersetzt; die unveränderte Impulsrelais-Herstellung endet weiterhin bei 1.800 s.

## INT-Anspruchskurve (1. Oktober 2026)

Die einzige geänderte Konstante ist `prestigeThreshold`: **1.400.000.000 → 428.273.652.944**. Skala 3, Exponent 1,5, Logarithmusbasis 10, kumulativer Anspruch und der dauerhafte Bonus `1 + 0,1 × totalINTEarned` bleiben unverändert. Die echte 90-Minuten-Simulation verschiebt die erste INT-Verfügbarkeit von 12:45 auf 35:15 und den normalen 1,25-Bonusentscheid von 17:30 auf 45:00. Vollständige Messwerte stehen in `docs/int-curve-balance.md`.

## Frühe Prestige-Unlocks (1. Oktober 2026)

- `shoppingAgent` (1 INT): unabhängige 10-Sekunden-Autobuyer für Taschenrechner und SBC in dieser Reihenfolge. Die Einstellung ist standardmäßig aus; die gemeinsame Reserve beträgt 0/25/50/75 % des unmittelbar vor jedem Einzelkauf vorhandenen ScientificNumber-Creditbestands. Bestehende 500er-Mastery-Autobuyer bleiben separat erhalten und werden nicht doppelt ausgeführt.
- `trainingPlan` (3 INT): zwei persistente Vormerkungen zusätzlich zum aktiven Training. Track und Ziellevel werden gespeichert; Data wird erst beim echten Start erneut geprüft und einmal abgezogen. Der erste unbezahlbare Auftrag blockiert die Folge. Prestige löscht die Vormerkungen gemäß Resetvertrag.
- `componentScanner` (3 INT): verdoppelt das Gewicht eines aktuell über freigeschaltete Hardware zugänglichen passiven Materials und normalisiert die Tabelle. Fundintervalle und Fundzahl bleiben gleich; Analysen und Weltdrops bleiben unberührt. Die frühere, gleichnamige Meilenstein-Zusatzbelohnung wurde entfernt, damit keine Doppelwirkung entsteht.
- Alle drei IDs sind unabhängige Wurzelknoten, erst nach dem ersten Prestige kaufbar und bleiben einschließlich ihrer Einstellungen über weitere Prestiges erhalten. Die INT-Kurve und sämtliche Produktions-, Trainings-, Forschungs- und Craftingkurven sind unverändert.

## Axiom-Schwellenkalibrierung v34

Historische v34-Konfiguration: `BALANCE.axiom.threshold` wurde von **1.000 auf 117** geändert; dieser Wert ist durch v35 unten ausdrücklich abgelöst. Die Formel, der Grundbonus, die normale INT-Kurve und alle übrigen Economyparameter bleiben unverändert. Die Drei-Seed-Suche und echte Resetverläufe stehen in `docs/axiom-measurement.md`; Seed 2026 verhindert einen gemeinsamen Wert für das gewünschte 21–30-Tage-Fenster.

## Permanente Axiom-Upgrades v34 (2. Oktober 2026)

Die drei unabhängigen Einmalkäufe `anchoredShoppingAgent`, `analysisPlanner` und `craftingPlanner` kosten zentral jeweils `BALANCE.axiom.upgradeCost = 1`. Ein Kauf reduziert ausschließlich `availableAxioms` (und den kompatiblen Spiegel `axioms`); `totalAxiomsEarned`, die damalige Schwelle **117** und die damalige Anspruchsformel und der permanente Faktor `1 + 0,5 × totalAxiomsEarned` bleiben unverändert.

Der verankerte Einkaufsagent erweitert die zentrale effektive Unlock-Prüfung des vorhandenen Rechner-/SBC-Autobuyers. Analyse- und Werkbankplaner prüfen höchstens alle zehn Sekunden und rufen ausschließlich die bestehenden Start- beziehungsweise Reservierungstransaktionen auf. Fehlende Data/Zutaten, belegte Slots und volle Queues führen nur zum Warten. Planerwahl und Aktivierung bleiben über beide Resetebenen erhalten; normale Axiom-Resetabbrüche werden nicht umgangen.

## Gewichtete Langzeit-INT-Economy v35 (2. Oktober 2026)

Die alte logarithmische Anspruchskurve ist durch `floor(sqrt(weightedEligibleRevenue / 14.178.653.052))` ersetzt. Die Kalibrierung ergibt im kontinuierlichen aktiven 90-Minuten-Startlauf für Seeds 1708, 42 und 2026 den ersten Vergleichs-Prestige bei Minute 45; dabei werden mindestens 3 INT beansprucht. Berechtigte Credits werden beim Eingang unveränderlich mit dem dann aktiven INT-Ertragsfaktor im ScientificNumber-Ledger verbucht. Reward-, Shop- und Debug-Credits bleiben ausgeschlossen.

Der additive Faktor besteht aus Milestone Memory (+2 % je unterschiedlicher Run-Meilensteinkante, maximal +100 %), Model Synthesis (+3 % je Run-Training, maximal +150 %), Research Archive (+5 % je Run-Forschungsabschluss, maximal +200 %) und einem ausgerüsteten Erkenntnisarchiv (+25 %). Die drei Knoten kosten explizit 100/1.000/10.000 INT. Alle anderen bestehenden Knoten kosten nach Katalogtiefe 1/10/100/1.000/10.000/100.000/1e6/1e7; die frühen Werkzeugknoten bleiben 1/3/3. Diese Staffel ist eine Messgrundlage, keine bestätigte Endgame-Balance.

Das Common-Item Erkenntnisarchiv wird beim Kauf von Research Archive dauerhaft als Bauplan freigeschaltet. Es kostet 100 Schaltkreise, 20 Siliziumwafer und 5 Neuralkristalle, benötigt 3.600 Sekunden und verstärkt ausschließlich künftig verbuchte berechtigte Einnahmen. Run-Zähler werden beim normalen Prestige zurückgesetzt; das gewichtete Zyklusledger läuft weiter und wird nur beim Axiom-Reset geleert.

Die Axiomschwelle ist wegen der wissenschaftlichen INT-Größenordnung als ScientificNumber `{m:1,e:1000000000000000}` konfiguriert. Der Prestige-Agent kostet 2 Axiome, prüft im gemeinsamen Zeitfortschritt höchstens alle zehn Sekunden und ruft nur den normalen Prestige-Transaktionspfad auf. Mindestbelohnung, 15/30/60/120 Minuten sowie die Warteoption für Training/Analyse bleiben über Axiom-Resets erhalten. Er löst niemals einen Axiom-Reset aus.

## Credits–INT-Rückkopplung v36 (2. Oktober 2026)

Die Diagnose der echten Prestige-Timeline zeigte zwei gleichzeitige INT-Creditfaktoren: den linearen Faktor `1 + 0,1 × cycleINTEarned` und zusätzlich `intSynergy = 1,08^sqrt(cycleINTEarned)` im selben `creditRateScientific`-Produkt. Die dadurch beschleunigte Creditproduktion erhöhte den Wurzelanspruch, der folgende Prestige erhöhte wiederum beide Faktoren. Alte Einnahmen wurden dabei **nicht** neu bewertet: `addCreditsScientific` schreibt weiterhin ausschließlich den neu eingehenden Betrag mit dem zu diesem Zeitpunkt aktiven `intYieldFactor` ins gewichtete Ledger. Der Fehler war die doppelte, positive Rückkopplung auf zukünftige Credits.

Der einzige aktive normale INT-Creditbonus lautet nun `1 + 0,5 × log10(1 + cycleINTEarned)`. Der Logarithmus liest direkt das ScientificNumber-Feld `exactEconomy.cycleINTEarned`; der vollständige INT-Bestand wird nicht in `Number` umgewandelt. Damit ergeben 0/9/99/999 INT exakt ×1/×1,5/×2/×2,5. Ausgeben verändert die Basis nicht, ein Axiom-Reset setzt sie auf null. Der frühere `intSynergy` wird zu Diagnosezwecken noch berechnet, aber nicht mehr auf Credits angewendet.

Nach Entfernen der Doppelanwendung wurde ausschließlich `prestigeBaseRevenue` von **14.178.653.052** auf **442.493.746.168** kalibriert. Im kontinuierlichen aktiven Profil haben alle Seeds bei 2.690 Sekunden 2 INT und bei 2.700 Sekunden 3 INT; der erste Vergleichs-Prestige liegt damit ohne Economy-Zeitgate bei Minute 45. Anspruchsformel, gewichtete Ertragsfaktoren, Hardware/Data/Forschung/Drops und Baumpreise sind unverändert.

## Axiom-Knoten und kalibrierter Meta-Reset v37 (4. Oktober 2026)

Die Axiom-Anspruchsformel bleibt `floor(sqrt(cycleINTEarned / threshold))`; ausschließlich die zentrale ScientificNumber-Schwelle wird aus vollständigen 42-/56-Tage-Läufen kalibriert. Der Axiom-Reset leert atomar Credits, Data, Hardware/Klassen-Upgrades, Modell und Training samt Queue, Analysen, das normale INT-Entitlement, verfügbare/ausgegebene Zyklus-INT, INT-Knoten sowie Zyklusumsatz und Run-Zähler. Historische Axiome und Axiom-Knoten, Sammlung, Komponenten/Module/Baupläne/Items/Ausrüstung, permanente Slots, abgeschlossene und laufende Forschung, reservierte Crafting-Aufträge sowie Meta-, Profil- und Storyfortschritt bleiben erhalten. Die Forschungsqueue wird geleert, laufende Forschung behält ihre gespeicherten Endzeiten.

Die permanenten Knoten sind: `axiomResonance` (1 Axiom je Stufe, maximal 10), `axiomAutomation` (2 Axiome, einmalig) und `axiomArchive` (5 Axiome, einmalig). Resonanz schreibt ausschließlich neue berechtigte Einnahmen mit dem Quadrat von `1 + 0,1 × Stufe` ins gewichtete Ledger; nach der unveränderten Wurzelformel entspricht das +10 % künftigem Anspruch je Stufe und bewertet Altumsatz nicht neu. Das Archiv dupliziert deterministisch jeden vierten bereits ausgewürfelten passiven Komponentenfund und erzeugt dadurch keine zusätzlichen Fundwürfe. Automation nutzt alle zehn Sekunden ausschließlich den normalen Prestige-Transaktionspfad, mit separaten Warteoptionen für Training und Analyse; sie löst niemals Axiom-Prestige aus.

Die v37-Kalibrierung setzt `BALANCE.axiom.threshold` ausschließlich auf ScientificNumber `{m: 3, e: 3}` (3.000 Cycle-INT). Dies ist die kleinste ganzzahlige konservative Schwelle oberhalb der vor Tag 42 gemessenen 2.999 INT von Seed 2026. Ein gemeinsames 42–56-Tage-Fenster existiert nicht: Seed 1708 erreicht bis Tag 56 nur 2.825 INT. Die Schwelle bevorzugt deshalb ausdrücklich „nicht zu früh“ gegenüber einer künstlichen Angleichung der Seeds; Axiomformel, Axiombonus sowie Hardware-, Data-, Research- und Itemkurven blieben unverändert.

## Quest-Erreichbarkeit und Season-Übergang (5. Oktober 2026)

Dieser Auftrag ändert keine Ziele, Belohnungsmengen, Drop-Raten, Kosten oder Produktionsformeln. Die bestehende Aufgaben-Auswahl filtert weiterhin nach freigeschalteten Aktionen. Wird eine bereits erzeugte Aufgabe durch einen Reset wieder gesperrt (Forschung, Komponenten, Crafting, Drops, Fusion oder Schmiede), ersetzt die Periodenpflege sie durch die stets erreichbare bestehende Credit-Produktionsaufgabe. Die Gem-Belohnung der ersetzten Aufgabe bleibt unverändert; die neue Baseline beginnt beim Austausch, damit Fortschritt ausschließlich im gültigen Zeitraum zählt.

Beim Season-Wechsel werden keine XP übertragen. Die unmittelbar vorherige Season wird höchstens sieben Tage als Claim-Archiv gehalten; Claims verwenden dieselben bestehenden Reward-Definitionen und Ledger-IDs und können pro Level genau einmal erfolgen. Es gibt weiterhin keinen erfundenen Premium-Besitz oder Premium-Claimpfad.

## Zentraler Gem-Katalog v39 (5. Oktober 2026)

Alle neuen Preise und Mengen liegen in `BALANCE.gemShop`: Labor 3/4 kosten 500/1.500 Gems; Offline-Kapazität steigt sequenziell für 250/500/1.000 Gems auf 12/16/24 Stunden; Crafting-Verkürzungen kosten maximal 20/120 Gems für 30 Minuten/4 Stunden; Training maximal 15/45 Gems für 15 Minuten/1 Stunde; 50 Schaltkreise kosten 30 Gems und 10 Kupferspulen plus 10 Siliziumwafer kosten 60 Gems. Bei kürzerer realer Restzeit wird `ceil(Listenpreis × angewandte Sekunden / Angebotssekunden)` berechnet. Forschung besitzt bewusst keinen Verkürzungskauf.

Bestehende Besitzstände in `purchasedResearchLabs` bleiben erhalten und werden als Labor 3/4 interpretiert; beide Prestigearten erhalten gekaufte Laborplätze und Offline-Kapazität. Der bestehende Laborzeitbonus bleibt als unverändertes sonstiges Angebot erhalten. Das alte 120-Gem-Schaltkreispaket wurde durch das geforderte 30-Gem-Paket ersetzt; der bereits stillgelegte Training-Boost bleibt aus dem Katalog entfernt.
