## 2026-10-16 · Kommerzialisierung V1

- `BALANCE.commerce` zentralisiert Einkommen-Pass ×2, 10 Gems/Video, 300 s Drohnen-Credits, 600 s Laborvideo, 2 Gems/min Laborabschluss sowie Ticket-/Cooldownzeiten und garantierte Paketinhalte.
- `BALANCE.adLimits`: 5 Gem-Videos, 12 Drohnen, 6 Laborvideos pro UTC-Tag. Drohne mit 10 Minuten Cooldown. Werbefrei behält alle Quoten.
- Starter: 300 Gems, 120 Circuits, 80 Coils und drei garantierte Rare-Items für unterschiedliche Grundformen. Builder: 1.200 Gems + 300 Circuits + 200 Coils. Lab: 600 Gems + 200 Circuits. Gem-Pakete: 100/550/1.200/2.600. Keine lokal erfundenen Echtgeldpreise.
- Drohnen sind kein prestige-berechtigtes Einkommen. Permanente Produktionsverdopplung gilt auf Credits, Taps und Offline-Produktion und wird nicht mehrfach angewendet.
- Preise und Quoten sind erste Balancewerte, noch keine durch Langzeit-/Umsatzdaten kalibrierten Release-Werte. [Vollständiger Vertrag](commercialization-v1.md).

# Aktuell: Prestige/Axiome V2 (Save 60)

Die untenstehenden älteren Abschnitte dokumentieren frühere Vertragsstände. Für neue Spiele und migrierte Saves gelten `BALANCE.progression` und der [vollständige V2-Katalog](prestige-axiom-concept-v2.md), einschließlich aller 60 INT- und 24 Axiompreise.

- Credits verdienen INT abschnittsweise: E += F × ((R_neu/C0)^p − (R_alt/C0)^p). R bleibt über normale Prestiges erhalten; ein Kauf ändert nur künftige Buchungen. p = 0,50 + 0,04×A01 + 0,02×I10, höchstens 0,72. Auszahlung einmalig als floor(E) abzüglich bereits beanspruchter INT.
- Credits erhalten den Faktor (1+Zyklus-INT)^(0,10+0,04×I05+0,04×I10). Axiome verstärken Credits mit (1+A)^(2+0,15×min(6,A02)) × 1,25^max(0,A02−6). A02 kostet nach sechs Stufen 1458×3^(L−6) für den nächsten Kauf; kein unbegrenzter INT-Exponent.
- Erste Axiome ab 30 unterschiedlichen Knoten und 1e6 Zyklus-INT; spätere Schwelle 1e6×(1+A), Auszahlung floor(sqrt(INT/Schwelle)). Normale Prestiges setzen diese Zyklusuhr nicht zurück.
- Erkenntnis ab Laborzugang: 0,002×sqrt(max(aktueller INT;0,02×historischem Höchstwert)) pro Sekunde, danach I08 und D01. Der Seed von 1.000 wird genau einmal gebucht. Modelle kosten ceil(1000×2,2^Anzahl), Upgrades ceil(40×1,22^Level×0,9^D02).
- Quality/Efficiency kosten 300×2,4^(Ziel−1) Credits; Integration 500×2,5^(Ziel−1) Credits plus 100×1,5^G Daten. Q/E-Wirkungen flachen nach Level 50 logarithmisch ab. Integration verstärkt numerische Itemwerte um 1,005^G, mit T10 1,007^G.
- Analysemenge steigt mit Materialforschung; Kosten bezahlter Aufträge bleiben eingefroren. Synthese schafft jede der 20 Komponenten gezielt über Daten und Arbeit. Seltenheitsgarantien und Recycling können keine zusätzlichen gebundenen Materialkosten erfinden.
- Vor einem Axiom werden ungestartete Reservierungen freigegeben und erst danach Daten/Credits gelöscht. Laufende Forschung/Fertigung/Analysen behalten bezahlte Inputs; dynamische Geschwindigkeit verwendet immer nur die aktuell aktive KI.

Siehe [Implementierung und verbleibende Abnahme](prestige-v2-implementation.md). Frühere Balancing-Simulationen unter V59 sind kein Nachweis für das Tempo der V2-Economy.

---

## Schmiede ohne Ausbau-Level (v59)

Die separate Stations-Aufbaureihe ist aus dem Spielablauf entfernt. Mit dem bestehenden Zugang (erster Prestige + Fertigung I) startet die erste Item-Veredelung direkt; bezahlt werden ausschließlich die bekannten Itemkosten. `BALANCE.forgeItemLimit = 20` erhält den bisherigen maximalen Item-Forge-Deckel, ohne Stations-Level als Hürde. Bereits bezahlte Stations-Geschwindigkeitsboni und eingefrorene laufende Aufträge bleiben erhalten. Kein Währungs-Refund, keine Gratisbelohnung. Die alten Level-Felder und Migrationsfunktionen bleiben für gespeicherte Aufträge kompatibel; die App bietet keinen Stations-Ausbau mehr an.

Neue Missionen wählen kein Stations-Ausbauziel mehr. v58→v59 übernimmt den verbleibenden Fortschritt unerfüllter Ausbauziele als Item-Veredelungsziel; abholbare und beanspruchte Aufgaben bleiben unverändert. Gleiche Regeln gelten für den gespeicherten Hauptspielstand einer Challenge.

## 2026-10-15 · Shop V1, Save v58

Neue Parameter ausschließlich in `BALANCE.shop` / `BALANCE.adLimits.shopChest`. Common/Rare/Epic/Legendary kosten 60/180/450/1200 Gems, enthalten garantiert 30–54/75–120/140–240/300–500 Komponenten und haben 8/22/40/100 % Itemchance. Bedingte Seltenheiten und Materialgewichte sind vor dem Kauf sichtbar. Keine direkt verkauften Mythic- oder speziellen Relay/Archive-Items.

Eine freie Common-Kiste alle 24 Stunden ab erfolgreicher Abholung; drei zusätzliche erfolgreiche Videos pro eigenem 24-Stunden-Fenster. Tagesangebote wechseln UTC, werden beim ersten Besuch eingefroren und führen einmaligen Stock. Tägliches garantiertes Rare-Item: 500 Gems. Ein Materialpaket täglich −40 % vom realen Normalpreis. Regulärer Graphen-Kauf: exakt 40 für 80 Gems. Weitere feste Pakete und vorbereitete Echtgeld-Produktinhalte stehen im zentralen Balance-Objekt.

Dies sind initiale V1-Parameter, keine gemessene Live-Economy/Retention-Prognose. Gegenstücke bleiben die bestehenden Material- und Fusions-/Upgrade-Sinks. Bestehende Produktion, Dropfrequenz, Crafting-/Fusionskosten und reale Bezahlfunktionen werden nicht geändert. Details/Tests: [shop-rework.md](shop-rework.md).

## 2026-10-14 · Erweiterte Kapselgewinne (vorläufig)

Die vorherige 1%-Item/99%-Komponenten-Tabelle wird ersetzt: 1 % Items, 35 % Komponenten, 45 % Credits, 14 % Data, 4,75 % kleine Gems und 0,25 % Gem-Jackpot. Preis bleibt 10 Gems. Kleine Gems 2–8; Jackpot 20×Preis = 200. Credits/Data: gleichverteilte 15–60 Sekunden ihrer aktuellen Rate, mindestens 100 Credits/5 Data. Credits zählen nicht als prestigegeeigneter Produktionsverdienst. Alle Werte liegen in `BALANCE.capsuleMachine`; sonstige Produktions-, Hardware- und Resetformeln unverändert.

Komponenten verwenden dieselbe zugängliche World-Tabelle und Mengenklassen. Ihr sortenspezifischer Erwartungswert ist jetzt `0.35 × p × (a+b)/2`. Direkter Gem-Rückfluss 0,7375 je Zug, mittlere Gem-Senke 9,2625; übriger Beutewert und Video-Fortschritt sind nicht kalibriert. Atomare Belastung vor Gewinn, sichere Ganzzahlen, eingefrorene wissenschaftliche Quittung, Save v55 ohne rückwirkenden Grant. Vollständiger Reset-/Provider-/Prüfvertrag: [reward-presentation.md](reward-presentation.md). **Neue Tabelle ist ungemessene Balanceannahme.**

## 2026-10-14 · Einführungsaufträge und ruhigere sichtbare Drops

`BALANCE.introTrainingSeconds=20`, `introResearchSeconds=20`: Erstes Qualitätstraining und Datenerzeugung 1 kosten im jeweiligen aktiven Tutorialschritt einmalig null Daten. Nur erster Run, keine Challenges; Start konsumiert permanenten Save-v54-Nachweis. Bereits bezahlte Altaufträge bleiben unverändert, keine Erstattung. Alle weiteren Preise/Zeitkurven bleiben regulär. Das erste Einführungslabor benötigt keinen SBC; andere UI-Zugänge werden nicht freigeschaltet.

`worldDropSeconds=90`, `worldDropMinimumSeconds=30`, `worldDropVisibleSeconds=12`, `worldDropMaxVisible=1`. Neue Drops frieren beim Spawn den Mengenfaktor `max(30,90/dropBonus)/max(8,45/dropBonus)` ein. Materialmenge (bei Bruchteilen unverzerrt gerundet), Credit-/Data-Zeitwerte und bestehende Core-Itemchance werden damit skaliert; alte Drops behalten Faktor 1. So bleibt der erwartete Nachschub unter gleichbleibendem Build/Sammelverhalten vergleichbar, obwohl weniger Drops erscheinen. Passive Beschaffung und die 1%-Kapsel-Itemchance bleiben unverändert. Weniger Zufallsproben/verpasste Drops/Quests können dennoch natürliche Fortschrittszeiten ändern. Neue Werte sind unkalibrierte Designannahmen, keine gemessene Langzeitbalance. Vollständiger Vertrag: `pixel-polish.md`.

## 2026-10-13 · KI-Kapselautomat (vorläufige Balance)

Alle Parameter stehen in `BALANCE.capsuleMachine`: 10 Gems pro Zug, exakt 1% Item / 99% Komponenten, keine Pity. Komponenten werden aus der zugänglichen World-Tabelle gewählt: bedingte Chance ≥10% → 3–12, ≥1% bis <10% → 2–5, darunter → 1–2; die Menge ist jeweils gleichverteilt. Erwartungswert einer Komponentensorte mit bedingter Chance p und Mengenintervall [a,b] pro Zug: `0.99 × p × (a+b)/2`. Bestehende Seltenheitschancen gelten innerhalb des 1%-Itempools; alle zugänglichen Itemtypen haben gleiche Chance. Sonderitems bleiben ausgeschlossen, erweiterte Items erfordern ihre bisherigen Bauplan-/Zugangsgates.

Freischaltung nach erstem Prestige, kein Zug in Challenges. Gems und Beute werden atomar gebucht; Wiederholen einer gespeicherten Draw-ID zahlt nichts doppelt. Bestand und Quittung bleiben über beide Resets, Challenges starten leer und stellen den Hauptstand wieder her. `BALANCE.adLimits.capsule=6` zählt nur erfolgreich abgeschlossene, eindeutige Video-Transaktionen. Ohne echten Anbieter ist Video deaktiviert. Preis, Mengen und Limit sind neue, **noch nicht langfristig kalibrierte** Designannahmen; übrige Produktions-/Kosten-/Zeitformeln bleiben unverändert. Vertrag und Abnahmelücken: `pixel-capsule-ui.md`.

## 2026-10-13 · Datenvertrag für normale Prestiges

Ab diesem Stand bleibt **das ungenutzte Datenguthaben bei normalem Prestige erhalten**, einschließlich `exactEconomy.data` oberhalb des nativen Zahlenbereichs. Die Preview führt Daten unter `kept` und nicht unter `reset`. Start-Credits, Hardware, Modelllevel und Jobabbruch bleiben unverändert. Bereits bezahltes Training und Analysen werden weiterhin ohne Erstattung beendet; Forschung, Crafting und Forge behalten ihre gespeicherten Verträge. Axiom-Reset löscht Daten weiterhin ausdrücklich; neue Challenges starten ohne Hauptspiel-Daten.

Keine Produktion, Preise, Zeitkurven oder Effekthöhen wurden angepasst. Die Beschleunigung nach einem Prestige durch behaltene Daten ist eine beabsichtigte Vertragsänderung; ihre Langzeitbalance wurde hier nicht neu kalibriert. Keine nachträgliche Gutschrift historisch gelöschter Daten und keine Save-Schemaänderung. Die natürliche Fortschrittsmessung verbucht nur den tatsächlichen Vorher-minus-Nachher-Verlust in der Resetbilanz, keine pauschale Löschung mehr.

## Einmalige Forschung→Crafting-Brücke – 12. Oktober 2026

`BALANCE.firstBlueprintResearchFragments = 4`: Der erste tatsächlich bezahlte Hauptspielabschluss von `blueprints` vergibt vier vorhandene Bauplanfragmente. Dauerhafter Save-v49-Nachweis (`unearned` → `pending` → `consumed`), kein zweiter Grant bei Prestige/Axiom/Reload/Challenge. Bereits abgeschlossene Altprojekte bekommen keine nachträgliche Gutschrift; bezahlte noch laufende Altprojekte bleiben berechtigt. Sicherer Ganzzahlbestand: bei fehlender Kapazität bleibt die ganze Auszahlung pending bis nach einem Verbrauch.

Blueprint-Lernen, Module, Materialien, 1.800 Data und Chipzeit bleiben regulär zu bezahlen. Keine Preis-/Zeit-/Produktions-/Prestigeformeländerung. In den acht erneuten natürlichen Zwei-Stunden-Profilen wird der Chip in allen vier aktiven Runs nach 67:30–68:30 Minuten fertig; passive Sitzungsruns erreichen das Projekt noch nicht. Kontrollierter Itemvergleich: +10,4 % passive Credits/s gegenüber dem Relais, dessen Tapbursts separat bestehen bleiben. Kein Nachweis allgemeiner Builddominanz oder Monatsbalance.

Vollständiger Vertrag und Grenzen: `blueprint-research-bridge.md`; Messdaten: `blueprint-bridge-profiles.json` und `blueprint-bridge-comparison.json`.

# Economy v7 – Hardwareidentität und INT

Alle abstimmbaren Werte stehen in `src/economy.ts`. Oberfläche, Simulation und Tests rufen dieselben Funktionen auf; angezeigte Preise werden nicht separat nachgebaut.

## Ressourcen

| Ressource | Verwendung | Prestige |
|---|---|---|
| Credits | Hardware und vorhandene Crafting-/Kaufaktionen; kein Training | zurückgesetzt |
| Compute | Produktionsrate aus Hardware; vollständig für Users genutzt | Hardwarebestand zurückgesetzt |
| Daten | entstehen durch Nutzer; Training und Projekte | zurückgesetzt |
| Forschungspunkte | entstehen aus Forschungs-Compute; Projekte | bleiben erhalten |
| Komponenten/Baupläne | Items und Crafting | bleiben erhalten |
| INT / Intelligence | Singularitätsbaum und dauerhafter Creditbonus | bleibt erhalten |
| Axiome | `floor(sqrt(cycleINTEarned / threshold))` | bleiben erhalten; permanenter Creditfaktor `1 + 0,5 × totalAxiomsEarned` |
| Gems | Missionen/Achievements und Komfortangebote | bleibt erhalten |

## Einheitlicher Run-Start

`BALANCE.runStartCredits = 50` ist das Startkapital eines neuen Spielstands, eines normalen Prestiges und eines Axiom-Resets. `runStartContract`/`initializeRun` setzen native Credits und das kanonische ScientificNumber-Ledger gemeinsam auf 50 sowie sämtliche Hardwarebestände auf null. Die Vorschauen verwenden denselben Vertrag. Diese Zuweisung ist keine Einnahme: Produktions-, Umsatz-, INT-, Quest- und Telemetrie-Einnahmezähler erhalten keinen Zuschlag. Laden und Offline-Fortschritt initialisieren gültige bestehende Spielstände nicht erneut.

Ein wirksam freigeschalteter und aktivierter Taschenrechner-Autobuyer bezahlt den ersten Taschenrechner im vorhandenen Einkaufsintervall über `buyHardwareClass`. Nur bei vollständig leerem Hardwarebestand entfällt für diesen Kauf die prozentuale Creditreserve; danach gelten wieder die üblichen Reserven. Es gibt keine kostenlose Hardware. Ein Reset beginnt auch die Einkaufstimer neu.

Der Prestige-Agent benötigt neben seiner Axiom-Freischaltung und Aktivierung einen wirksamen, aktivierten Einkaufsagenten für den ersten Taschenrechner. Er prüft den aktuellen wissenschaftlichen INT-Anspruch, den normalen Mindestanspruch von einem INT, Mindestlaufzeit und die vorhandenen getrennten Warteoptionen. Er ruft ausschließlich `prestige` auf. Hardware wird erst bei einem späteren regulären Einkaufstermin gekauft. Axiom-Resets entfernen INT-Freischaltungen; gespeicherte Autobuyer-Schalter allein aktivieren sie nicht wieder. Die bestehende effektive Freischaltungsabfrage berücksichtigt erhaltene permanente Freischaltungen.

Hardwarepreise, Produktionskurven, Prestigeformeln, Rezepte, Drops und alle übrigen Resetregeln sind unverändert. Das bewusst eingeführte 50-Credit-Startkapital verschiebt die erste Hardwareanalyse von zuvor gemessenen 890 auf 870 aktive Sekunden. Die ausdrücklich akzeptierte Designentscheidung passt deshalb das übergeordnete Ziel von 15–30 auf **14–30 aktive Minuten** an: bisheriger Testvertrag **880–1800 Sekunden**, jetzt **840–1800 Sekunden**. Beide echten Simulationsstrategien starten weiterhin bei `t=0` ohne vorgeschaltete Offline-Produktion; geändert wird ausschließlich die Analyse-Timinguntergrenze, keine Economy-Parameter oder weiteren Ressourcenprüfungen. Eine grüne technische Suite bestätigt keine Langzeitbalance; deren optionale Bewertung bleibt separat sichtbar.

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

Seit Auftrag 7A bedient die gesamte wirksame Hardwareleistung Nutzer. Compute ist eine Rate, keine auszugebende Währung. Training, Forschung und Analysen laufen parallel; ihre bezahlten Startkosten und festen Endzeiten bleiben unverändert.

`users = totalCompute × efficiency × bestehende Kapazitätsmodifikatoren / computePerUser`

`credits/s = users × baseRevenuePerUser × bestehende Quality-/Creditfaktoren`

`data/s = sqrt(users) × baseDataPerSecond × bestehende komprimierte Data-Boni × Challenge-Faktor`

Die Forschungsrate nutzt ebenfalls die volle Compute-Rate als Eingang ihrer bestehenden Potenzformel. Das verändert weder die festen Forschungszeiten noch Startkosten. Jeder additive, multiplikative oder exponentielle Beitrag bleibt in seiner bestehenden Faktorposition. Der gemeinsame `economySnapshot` rekonstruiert Compute, Users und Credits mit denselben Operanden; Users entsprechen immer der vollständig genutzten Kapazität (100 %).

Alte gespeicherte Betriebsprofile bleiben gültig, haben aber keine Produktionswirkung. Ihre historischen Anteile sind nur Kompatibilitätsdaten und keine aktiven Exportparameter. Die Oberfläche zeigt stattdessen: „Die gesamte Hardware bedient Nutzer. Training und Forschung laufen parallel.“ Vorher/Nachher und Grenzen: [Core-Loop-Audit](core-loop-audit.md).

## Modelltraining und Softcaps

Training für Qualität oder Effizienz kostet ausschließlich Data: ungerundete Basis `15 × 1,75^(Ziellevel−1)`, feste Dauer `min(90 × 1,35^(Ziellevel−1), 72 Stunden)`. Ziellevel wird pro Track berechnet. `trainingRate = 1`; Hardware, Taps, Items und temporäre Boni verändern die laufende Dauer nicht.

Seit Auftrag 7B gilt zentral `B = Summe vorhandener wirksamer Trainingskostenbeiträge`, `Faktor = max(0,5; 1/(1+B))`, `Startkosten = ceil(ungerundete Basis × Faktor)`. +20 % Beitrag ergibt Faktor 1/1,2, nicht −20 % Kosten. Keine einzelnen Beiträge oder Basiskosten vorab runden. Der Deckel betrifft den Faktor; nach Aufrundung kann die tatsächliche Preisersparnis kleiner sein (15 Data × 0,5 → 8 Data).

Ausgerüstete Trainings-Items samt vorhandener Qualitäts-/Level-/Schmiede-/Prestigeskalierung, Rig-/Lunar-Trainingsmeilensteine, Graph-Durchbruch sowie aktive Trainingsboosts/Trainings-Overclock tragen genau einmal bei. Keine neuen Bonusquellen. Quelle für Quelle und Vorher/Nachher: [Trainingskosten-Audit](training-cost-audit.md).

Vorschau und Start verwenden `trainingCostQuote`; der Start reserviert Data einmal und speichert Basis, Quellen, Faktor und wissenschaftliche Kosten. Queues reservieren nichts und prüfen erst beim regulären tatsächlichen Start. Bestehende aktive Jobs bleiben auch nach Itemwechsel, Upgrade, Ablauf, Reload oder Import unverändert; historische Jobs ohne Kostenbasis bleiben ladbar, ihre nicht gemessene Rabattbasis wird nicht erfunden. Explizite Gem-Zeitverkürzungen bleiben separate bezahlte Aktionen.

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

Die drei ersten Projekte verbrauchen gemeinsam Credits, Daten und Forschungspunkte. Ihre Freischaltwirkung ist absichtlich noch klein; Module, Durchbruchswahlen und Rezepte bleiben als nächste Ausbaustufe in der Roadmap. Tap-Ertrag ist `max(1, 20 % der passiven Rate ohne temporäre Boni × Qualitäts-Tapfaktor)` und auf fünf vergütete Impulse/s begrenzt. Overclock addiert +100 % im gewählten Kanal; Training-Overclock trägt ausschließlich zu neuen Data-Startkosten bei.

Gleichartige Prozente innerhalb von Compute-, Credit-, Training-, Forschungs- oder temporären Familien werden addiert. Erst zwischen benannten Familien wird multipliziert. Trainingskosten summieren ausschließlich die dokumentierten wirksamen Beiträge, einschließlich vorhandener Itemverstärkungen; kein zusätzlich erfundener Prestige-Trainingsmultiplikator.

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

Training bleibt zeitbasiert und bezahlt ausschließlich die Data-Startkosten des zentralen Helfers. Bestehende Quality-/Efficiency-Softcaps bleiben unverändert. Trainingsboni wirken seit Auftrag 7B auf zukünftige Startkosten, nicht auf die Dauer; Relay-/Archiv-Skalierung bleibt separat offen.

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

Die Reihenfolge ist: Klassenbasis + begrenzter Rechenverbund → Klassenmeilensteine/Upgrade → Summe aller Klassen → additive globale Compute-Familie → Atlasfamilie → volle Users-Kapazität → Modell/INT/Item/temporäre Familien. Kein Ergebnis wird erneut als Eingang derselben Formel verwendet.

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

## Early active start and automatic Overclock (2026-10-05)
- New saves begin with zero owned hardware and therefore zero passive Credit production; existing versioned saves are unchanged.
- A base active impulse grants 1 Credit before existing tap, research, item, critical, and prestige multipliers so the first Calculator can be earned actively.
- Overclock now triggers automatically every 100 paid active impulses and retains the existing 15-second ×2 Credit effect; the counter immediately starts its next cycle.


## Prestige-Bonus- und Season-Kurve (6. Oktober 2026)
- Alte INT-Bonusformel: `1 + 0,5 × log10(1 + Zyklus-INT)`.
- Neue INT-Bonusformel: `1 + 0,55 × ln(1 + Zyklus-INT)`. Die Kurve ist weiterhin logarithmisch und verwendet ausschließlich tatsächlich im aktuellen Axiom-Zyklus verdiente INT; Ausgeben im Baum reduziert sie nicht.

| INT | Alt | Neu | Verbesserung |
|---:|---:|---:|---:|
| 1 | ×1.151 | ×1.381 | +20.1 % |
| 5 | ×1.389 | ×1.985 | +42.9 % |
| 10 | ×1.521 | ×2.319 | +52.5 % |
| 25 | ×1.707 | ×2.792 | +63.5 % |
| 50 | ×1.854 | ×3.163 | +70.6 % |
| 100 | ×2.002 | ×3.538 | +76.7 % |
| 250 | ×2.200 | ×4.039 | +83.6 % |
| 500 | ×2.350 | ×4.419 | +88.1 % |
| 1000 | ×2.500 | ×4.800 | +92.0 % |

Die 50 Season-Level verwenden weiterhin nur vorhandene Reward-Typen (Gems, Komponenten und das bestehende Boot-Sequence-Artefakt). Free-Claims bleiben anhand der bisherigen Levelnummern gespeichert. Premium ist weiterhin nur Vorschau und nicht claimbar, solange keine verifizierte native Entitlement-Integration existiert. Die zentralen Mengen und Komponentenfolgen liegen in `BALANCE.seasonRewards`.

## Isolierte Challenge-Runs (Auftrag 4, Save v41)

Challenges starten unabhängig mit dem zentralen Startvertrag 50 Credits/0 Hardware. Startkapital ist keine Produktion, kein berechtigter Umsatz, kein INT- oder Questfortschritt. Hauptspielressourcen, Forschung, Jobs, Items und Ausrüstung bleiben separat erhalten. Es werden ausschließlich kosmetische Einstellungen/Namen, Kampagnenidentität und Uhr übernommen; der vorhandene Challenge-Katalog definiert keine geerbten Economy-Boni. Die bisherigen fünf Einschränkungen, Zielanspruch 1 INT, ersten Sterne, Clears und Bestzeiten bleiben unverändert. Keine Preis-, Produktions-, Forschungs-, Analyse-, Prestige- oder Drop-Parameter geändert.

Das Hauptspiel läuft mit der vorhandenen Simulation passiv (`active=false`) und seiner bestehenden Offline-Kapazität weiter. Aktualisierter Hauptzustand und Zeitanker werden gemeinsam gespeichert; Rückkehr/Reload buchen Zeit nicht doppelt. Erfolg übernimmt nur die bestehenden Sterne/Abschlussmetadaten, Abbruch keine Belohnung. Challenge-Bestände werden nicht übertragen. Hauptspiel-Resets, Gem-Shop und Hauptspiel-Claims sind während des Runs gesperrt.

Save v41 validiert beide Zustände inklusive Reservierungen und Uhr gemeinsam. Alte Challenge-Saves ohne historischen Hauptzustand werden ohne Erfolgsbelohnung beendet und behalten ihren noch bekannten gültigen Stand, mit ausdrücklicher DE/EN-Warnung; verlorener Fortschritt wird nicht erfunden. Details, kurze Tests und Grenzen: [Challenge-Isolationsaudit](challenge-isolation-audit.md). Die bekannten Schicht-3-Ressourcenreferenzen und die offene Langzeitbalance bleiben unverändert und sind durch diese gezielte technische Abnahme nicht bestätigt.

## Permanente Forschungsbereiche (Auftrag 7C)

Neue Accounts sehen nur `dataGeneration`, `modelArchitecture` und `blueprints`. Interne Projektvoraussetzungen bleiben bestehen; Offene Baupläne und die unabhängige Hardwareanalyse bleiben vor Prestige erreichbar. Weitere vorhandene Forschungs-IDs sind exakt einem Bereich zugeordnet:

| Regulärer Node-Kauf | Permanenter Bereich | Vorhandene Projekte |
|---|---|---|
| `dataArchive1` | Datenwissenschaft | syntheticData, dataFlywheel |
| `computeNet1` | Modell-/Systemarchitektur | computeOptimization, userScaling, hardwareIntegration, commercialization, networkEffects, parallelArchitecture, hardwareCoDesign, recursiveLearning, tapAmplification, alignment |
| `analysis1` | Material-/Bauplanforschung | materialAnalysis, blueprintAnalysis, dropProtocols |
| `labs1` | Laborautomation | operations, labAutomation, autonomousScience |

`researchAccess` prüft denselben Bereich für Domainstart, Queue, regulären Autostart, Vorschau und UI. Ein erfolgreicher bezahlter Node-Kauf fügt das permanente Accountfeld `researchAreas` einmal hinzu. Normaler Prestige und Axiom-Reset erhalten diesen Zugang. Die übrigen Nodewirkungen behalten ihren bestehenden Vertrag: insbesondere verliert ein Axiom-Reset INT-Nodes samt deren Produktions-/Slot-/Queuewirkungen. Ein erneuter Kauf öffnet denselben Bereich nicht nochmals und erzeugt keinen zusätzlichen Forschungsbonus.

Save v41 erhält das additive optionale Feld ohne Versionswechsel. Die gemeinsame Load-/Import-Migration erkennt fehlende alte Felder und öffnet nur durch Nodes, positive Forschungsstufen, abgeschlossene Projekte, aktive Jobs oder Queueeinträge belegte Bereiche. Kosten, Bestände und gespeicherte Endzeiten bleiben erhalten. Ein gespeichertes Challenge-Hauptspiel wird separat migriert; neue Challenge-Runs erben keinen Accountzugang. Unbekannte oder doppelte Bereichs-IDs werden abgewiesen.

Die UI bündelt freigeschaltete Bereiche, einmalige Abschlüsse kompakt und genau eine deterministische Vorschau (Daten → Architektur → Material → Automation) mit direktem Node-Detail-Link. Alle bisherigen Forschungszeiten, Kosten, Effekte und Nodepreise/-voraussetzungen bleiben unverändert. [Audit und kurze Abnahme](research-area-audit.md).

## Auftrag 8A – Credit-only Hardware und erste Preisrunde

Alle 15 Klassen sind regulär allein gegen ihre tatsächlichen wissenschaftlichen Creditkosten kaufbar. UI-Sichtbarkeit erzeugt keine Discovery/Mastery/Rewards; der erste erfolgreiche Kauf tut dies. Bestehende Five-Hardware-Challenge-Regel und Automations-Unlocks bleiben separat wirksam. Gemeinsame Sparziele zeigen nächste unbesessene Klasse und nächsten Meilenstein der höchsten passenden besessenen Klasse, echte Bulk-Kosten/Fehlmenge/Wirkung; ETA nur endlich bei positiver aktueller Rate, keine Prognose künftiger Käufe/Taps.

Nur baseCost geändert: SBC 180→6.000, PC 5.000→100.000, GPU 100.000→4.000.000, Rig 1.000.000→75.000.000, Server 51.000.000→79.900.000. Calculator 15, Farm 80.000.000 und alle späteren Preise sowie Wachstum/Compute/Meilensteine/Data/Training/Forschung/Prestige/Drops unverändert. Preise strikt aufsteigend.

Frische 50-Credit-Runs ab t=0, ein regulärer Tap pro Sekunde, Entscheidungen alle zehn Sekunden, alternierendes bezahlbares Q/E-Training, Datenerzeugung maximal Level 2; keine Grants/Offline/Items/Analysen/Prestiges. Strategie A erste Käufe: SBC 3:30, PC 13:10, GPU 31:50, Rig 52:50, Server 52:30. Erste vier neue Ziele erreicht; Serverziel ≥90 Minuten offen, da die unverändert 80 Mio. teure Farm bereits 52:10 erreicht wird. Strategie B: 4:10 / 9:10 / 18:40 / 37:10 / 39:30. Genau drei Kalibrierungsrunden, kumulierte Rechenlaufzeit 22,78 Sekunden. Kein Monatsbalance-/Human-Spielzeitnachweis. Details/Rohdaten/Vertragsgrenzen: [Hardware-Audit](hardware-early-audit.md).

### Nachbesserung 8B – Server/Farm

Nur server.baseCost 79,9 Mio.→15 Mrd. und farm.baseCost 80 Mio.→120 Mrd. geändert. Alle anderen Werte/Preise/Wachstum/Compute/Meilensteine/Research/Prestige unverändert; aufsteigend 75 Mio. Rig <15 Mrd. Server <120 Mrd. Farm <1e14 Campus. Nach genau drei Preisrunden, echte frische 180-Minuten-Simulation mit unverändertem 8A-Profil: A Rig 52:10, Server 116:30, Farm 171:40; B Server 76:40, Farm 140:10. Alle neuen begrenzten Zielvorgaben erfüllt, keine natürliche-/Langzeitbalance behauptet. [Runden, Raten, echte Sparfenster und INT-Beobachtung](hardware-early-8b-audit.md).

## Auftrag 8C – attraktiver erster Prestige mit mindestens drei INT

Das 45–75-Minuten-Ziel gilt für einen attraktiven ersten Prestige mit ≥3 INT; 1 INT darf früher erreichbar sein, kein Zeitgate. Einziger neuer Balanceparameter: prestigeBaseRevenue 442.493.746.168→**765100329.5513278**. Ableitung aus echtem gebuchten SCI-cycleEligibleCredits von Profil A bei 60:00: `{m:6.88590296596195,e:9}` ÷ 9. Anspruchsfunktion/Rundung, kumulative Gewichtung/beanspruchter Anspruch, INT-Creditbonus, Nodepreise, Axiomwerte und alle anderen Economywerte unverändert. 8B Server/Farm 15 Mrd./120 Mrd. werden ohne weitere Hardwarekalibrierung in den neuen main-basierten PR übernommen.

No-Prestige-Messungen mit identischem frischen 8B-Profil: A ≥1/≥3 INT alt 117:40/172:27, neu 45:14/60:00; B alt 158:37/≥3 nicht bis 180:00, neu 44:56/59:14. Ein gemeinsamer Parameter. Tatsächlicher A-Reset 60:00 für 3 INT, 50 Credits/0 Hardware, Einkaufsagent regulär für 1 INT, Reserve 25 %, echte erste Autobuyer-Käufe nach 10 s (Calculator 15 Credits) und 70 s (SBC 6.000 Credits). Verdienter INT-Creditfaktor 1,76246189861594 bleibt beim Ausgeben unverändert. [Ableitung, Neustart-Meilensteine und Grenzen](first-prestige-audit.md). Alte Hardwaremessungen bleiben ausdrücklich ohne Prestige; keine Langzeit-/Axiombalance bestätigt.

## Auftrag 9A – kanonische Relais-/Archivverbesserung

specialItemEffectQuote verwendet S = itemEffectFor(effektive Instanz) / itemEffectFor(dieselbe Instanz Common/Level 0/Forge 0) im gleichen Kontext und mit gleichen bisherigen Bonusregeln; gemeinsame Verstärker werden nicht erneut multipliziert. Relais weiterhin jeder zehnte tatsächlich vergütete manuelle Tap, reguläre passive Creditrate ×2S Sekunden. Archiv addiert 0,25S ausschließlich bei neuen berechtigten Einnahmen, keine rückwirkende Bewertung oder Credit-/Datawirkung. Tatsächliche Ausrüstung/No-Items werden zentral berücksichtigt; bisherige Stapelungs-/Reset-/Fusionregeln bleiben bestehen. Upgrade/Forge verwenden unveränderte bezahlte Kosten-/Domainpfade, jetzt mit realem Effekt. Kein Preis/Rezept/Drop/Slot/Hardware/Forschung/Prestige/Axiom verändert.

Commonbasis unverändert 2 s/+25 %. Forge 1: 2,24 s/+28 %; reguläre erste Aufwertung Uncommon/Level 1: 2,714 s/+33,925 %. Domain/Details/Verbesserungsvorschau/Export teilen denselben reinen Quote, inklusive inaktiv/potenziell und zukünftiger Einnahmen. [Audit, vorbereitete Vergleichsdaten und mobile Abnahme](special-items-audit.md). Keine natürliche Progressions-/Langzeitbalancebehauptung.

## Auftrag 9B – einmaliges Bauplanlernen

Die unveränderten Rezeptwerte `blueprints` sind jetzt einmalige Lernpreise: Quantenchip 4, Neural-ASIC/Feldscanner/Datenprisma je 5. Herstellung kostet anschließend 0 Fragmente bei unveränderten anderen Zutaten, Zeiten und Ergebnissen. Preis-0-Rezepte behalten ihre bisherigen Zugangsflags. Gelernte stabile Rezept-IDs bleiben über normalen Prestige/Axiom erhalten, getrennt je Haupt-/Challenge-Kontext. Save 42 migriert nur belegten alten Besitz; historische Fragmentreservierungen bleiben bezahlt und werden nicht nachträglich erstattet. [Vollständiger Vertrag, Migration und technische Abnahme](blueprint-learning-audit.md). Keine Drop-/Produktions-/Preis-/Kurvenänderung.


## Auftrag 9C – vollständiger Itemrezeptkatalog (11. Oktober 2026)

Die sechs bestehenden Rezepte bleiben bytegleich in ihrem Katalogvertrag. Hinter ihnen folgen `photonic-array`, `memory-crystal`, `logic-seed`, `tensor-core`, `lab-drone`. Ihre Werte stehen ausschließlich in `BALANCE.itemRecipes` in `src/economy.ts`; [festgelegter Katalog, Quellen und technische Abnahme](item-recipes-audit.md). Alle fünf verlangen den abgeschlossenen Forschungsdurchbruch `blueprints` (Offene Baupläne), einmaliges Lernen gegen 6/6/6/8/10 Fragmente und anschließend 0 Herstellungsfragmente/0 Credits. Data: 1200/1800/1500/3000/3600; Dauer: 900/1200/900/1800/1800 Sekunden. Ergebnis je Einheit Common, Level 0, effektiver Forge 0. Alle nicht genannten Zutaten bleiben 0; die bestehenden pluralen Inventar-IDs `neuralCrystals`/`quantumCores` werden verwendet.

Dies ist ein vorgegebener Ausgangskatalog, keine bestätigte Balance. Keine Parametersuche; bestehende Itemeffekte, Dropraten, Module und Economy-Kurven unverändert. Alle Zutaten besitzen implementierte Quellen. Technischer Nachweis mit vorbereiteten Ressourcen, kein Beleg natürlicher Erreichbarkeit.


## Auftrag 1 – technische Reparaturen (11. Oktober 2026)

Keine BALANCE-Parameter geändert. Equipmentslots behalten belegte reguläre Freischaltungen permanent (0–3); Axiom entfernt normale Nodes samt übrigen Wirkungen. Hardwareintegration verwendet die höchste entdeckte Klasse bei unveränderter Formel. Archiv dupliziert jeden vierten passiven Fund über eigenen persistierten Zähler, getrennt von Analyse-Bruchresten. Vordergrundaktionen/Ticks/Speichern verwenden gemeinsamen Lifecycle-Kontext; Hintergrund bleibt passiv.

Intervallproduktion integriert dieselbe zeitabhängige Data-Synergy wissenschaftlich; Prestige-/Axiomanspruch, Schwellen und Axiom-Bestände/Käufe bleiben wissenschaftlich. Native Projektionen ausdrücklich begrenzt, keine wirtschaftlichen Caps. Save 43 migriert nur belegte Slots, startet alten Archivzähler bei null und erhält Analyse-Bruchteile/Inventar/Challenge-Isolation. [Ursachen, tatsächlicher Vorher-/Nachher-Nachweis, Genauigkeitsgrenzen und CI-Vertrag](technical-bugs-audit.md). Kein natürlicher Progressions- oder Langzeitbalance-Nachweis.

## Auftrag 2 – geltender Forschungsvertrag, Save 44 (11. Oktober 2026)

Diese Änderung ersetzt die historischen breiten Forschungsgebiete und die wirkungslose Research-Points-Produktion. 26 Projekte gehören fünf Themen an; Anfang weiterhin nur dataGeneration/modelArchitecture/blueprints. Projektzugänge werden je Node-Stufe dauerhaft erworben. Alle bisherigen Kategorien/Basen und fachlichen Voraussetzungen bleiben bestehen. Neue Schlüssel kosten wissenschaftlich `ceil(categoryBaseData × 1.85^24)` und haben 24 Stunden Grunddauer; die Parameter sind vorläufig, keine bestätigte Monatsbalance.

Laborleistung verwendet die tatsächlich angewendete wissenschaftliche Summe B aus Research-Items/kanonischen Verstärkern, bestehender Kombination, Research-Hardwaremeilensteinen, Achievement-Research, Deep Labs und autonomousScience (+0,02/Level). Faktor `1 + ln(1+B)`; Labbonus/Research-Overclock jeweils ×2; Startdauer `max(60 Sekunden, Grunddauer / Faktor / temporäre Faktoren)`. Kosten/Quellen/Dauer/Endzeit werden eingefroren. Research Points sind ausschließlich historischer Save-/Exportbestand, ohne Produktion oder Kaufvertrag.

labs2 erlaubt zwei regulär automatisch startende wartende Aufträge, operations erhöht auf vier. labs3 erlaubt einen expliziten Wiederholungsauftrag. labs4 + researchScheduling erlaubt den standardmäßig ausgeschalteten Direktor mit maximal sechs endlichen Zielen, explizitem wissenschaftlichem Run-Budget und 0/25/50/75-%-Reserve. Online/Offline-Prüfung alle zehn Sekunden; Queue vor Direktor vor Wiederholung, aktualisierte Kosten je Labor, keine Abbuchung manueller Starts gegen das Direktorbudget.

Zukünftiges Training: alignment ×0,90 und die ersten sechs erfolgreichen Run-Starts mit modelTransfer zusätzlich ×0,50; Kosten und Rate 1 bleiben. Zukünftige Analyse mit dataPipeline kostet aufgerundete 80 %. distributedInference aktiviert den unveränderten einmaligen Nachbarklassen-Link. Item-Abschluss mit materialRecycling gibt 5 % der reservierten Komponenten pro Exemplar mit eigenen Bruchteilresten zurück; keine weiteren Ressourcen. Normale/Axiom-Resets setzen nur neue Run-Ausgaben/Startzähler zurück; permanente Forschung/Zugänge und laufende Endzeiten bleiben. Nach Axiom bleiben Konfigurationen gespeichert, fehlende Nodes werden regulär zurückgekauft.

[26-ID-Matrix, effektive Verbraucher, Save-/Legacyvertrag und technische Vorher/Nachher-Proben](research-integration-audit.md). Hardwarepreise, übrige Core-/Data-/Drop-/Rezept-/Item-/INT-/Axiomparameter unverändert. Die in PR #80 vorhandene, beim Merge verschwundene Compute-Kombination ist mit ihren bestehenden ×1,20 wieder angeschlossen. Keine natürliche Freischaltzeit oder Langzeitbalance aus vorbereiteten Fixtures abgeleitet.

## Auftrag 3 — Data-Produktion und Analysevertrag (11. Oktober 2026)

Abhängige Grundlage PR #82, Head `d8d5a29`, noch nicht gemergt. Die bisherigen Data-Quellen bleiben additive Beiträge B: Data/s = `0.1 × sqrt(Users) × (1 + softBonus(B)) × Challengefaktor`; `softBonus(B)=B` bis 4, sonst `4+sqrt(4(B−4))`. Die bisherige Obergrenze unter ×5 entfällt; vollständig ScientificNumber, unveränderte Lifetime-Data-/Credit-Synergie.

Reguläre Analysepreise kurz/lang: Hardware 250/4.800 Data, Architektur 500/6.400, Artefakte 2.000/19.200. Grunddauern bleiben 10 min/4 h, 30 min/8 h, 2 h/24 h. Lang kostet 80 % zeitlich äquivalenter Kurzaufträge. Datenpipeline folgt als separater `ceil(Basispreis×0.8)`-Schritt. Lange Grundbelohnungen unverändert; kurze Grundkomponenten, beide Fragmentarten und Itemchance skalieren nach regulärem Grunddauerverhältnis 1/24, 1/16, 1/12. Bestehende analysis3-Garantie und Start-Materialkartierung sind zusätzliche Effekte, nicht Teil dieser Grundskalierung.

Save 45 speichert neue Verträge v2; historische Aufträge erhalten v1 und behalten 1/24-Kurzbelohnung, bezahlte Kosten/Endzeit und alle Reste. Keine Erstattungen, neuen Slots, Wiederholungen oder weiteren Währungen. Geschützte Preise und Formeln unverändert. Audit/Profilrohwerte: `data-analysis-audit.md`, `data-analysis-proof.json`. Zwei echte 90-Minuten-Profile erreichen erste Forschung/Hardwareanalyse, zeigen aber erheblichen Data-Endüberschuss; **dauerhafte Knappheit ist nicht bestätigt**, keine nachträgliche Kalibrierung.

## Auftrag 4 — bestehende Itemprogression verbinden

Alle neuen Parameter liegen in `BALANCE`: elf explizite `itemMaterialFamilies`, Zusatzmengen `itemUpgradeMaterials` nach **Zielseltenheit** Uncommon 4/0, Rare 12/0, Epic 30/2, Legendary 75/8, Mythic 180/25. Primärer Itemkanal entscheidet; Speicherkristall ist Credit → Wafer/Supraleiter. Relais → Spulen/Supraleiter; Archiv → Neuralkristalle/Quantenkerne; Feldscanner → Graphen/Quantenkerne; Data-/Research-/Trainingfamilie → Linsen/Neuralkristalle. Bestehende Data-/Schaltkreisformel, Manufacturing-II-Rabatt, Itemqualität/Level/Forge und Fusionsregeln bleiben erhalten. Zusatzmaterialien werden nicht durch den bisherigen Rabatt reduziert.

`blueprintMasteryCosts=[10,25,60,150]`, Faktoren `[1,.95,.90,.85,.80]`: nur direkte zukünftige Itemzutaten, `ceil(Basis×Faktor)` je Exemplar (positive Zutat mindestens 1), dann Menge multiplizieren. Data, Module, Zeit, Lernen, Aufwertung und Forge bleiben gleich. Stufenkäufe verlangen tatsächliches Crafting und aktuellen Zugriff; Wissen überlebt beide Resets, frische Challenges beginnen bei 0. Aufträge speichern ihre tatsächliche Stufe; Materialrecycling bleibt 5 % der wirklich reservierten Zutaten. Manuelle `researchFragmentConversionRate=10` verlangt alle drei regulären Durchbrüche und aktuelle Bestände/Revision.

Die bisherige fünfteilige Sammlerwirkung von Datenprisma/Feldscanner verwendet permanente tatsächliche Materialentdeckungen; dieselben Typen und derselbe Faktor, kein Horten des letzten Exemplars nötig. Preise, Hardware-/Produktions-/Trainings-/Forschungs-/INT-/Axiomformeln, Drops und übrige Währungen unverändert. Vollständiger Parametervergleich gegen finalen #83-Head schützt jedes bisherige Balancefeld. [Quellenmatrix, tatsächliche Zahlungen, 120-Minuten-Profile und offene Balance](item-grind-audit.md); feste Ausgangswerte sind keine bestätigte Langzeitbalance.


## Auftrag 5: Materialwirtschaft, Geräte, Schmieden und Challenges (12.10.2026)

Alle neuen Ausgangswerte liegen in `src/economy.ts`. Genau 20 stabile Materialien in fünf Familien; alte IDs/Bestände/Quellen erhalten. Bezahlt erschlossene Familien, zusätzliche Basis-Zufallstypen erst ab PC, andere neue Typen mit ihrem bezahlten Familienzugang, Fokus ×3 Gewicht/×0,8 Menge, Vertrag v3 eingefroren. Hardwarepakete auf sechs bezahlten Kanten je Klasse/Run, Frontier/Quanten ×0,1 mit persistenten Bruchresten; Altbelohnungen in derselben Quote. Reaktivierter bezahlter Klassenupgrade mit ursprünglichem Creditpreis/×2-Effekt nach 50 Einheiten und einmaligem zusätzlichem 50er-Paket.

19 Geräte ergänzen die elf bestehenden Typen; sämtliche alten Rezept-/Effektwerte bleiben erhalten. Neue Primärrollen verwenden kanonische Itemstärke, maximal 0,6; Rare/Legendary verwenden vorhandene zusätzliche Kanäle. Entdeckung und einmaliges Lernen/Meisterschaft bleiben getrennt. Zehn bezahlte Forschungsabschlüsse je Bereich → deterministischer zugänglicher Bauplan, sonst Fragment; eingesammelte Drops 1 % Entdeckung, Rare+ Zerlegung 5/10/20/30 % Fragmentversuch. Keine Funditems lernen automatisch Baupläne.

Drei permanente Schmieden, fünf Ausbaustufen mit beauftragten Kosten, Geschwindigkeit 1/1,25/1,6/2,1/2,8 und Forgegrenze 4/8/12/16/20. Forge zeitgebunden, Kosten/Dauer erst beim Start eingefroren; zwei unbezahlte Wartestellen sperren Instanzen. Rückgewinnung höchstens 60 % belegter Komponenten einschließlich bereits ausgezahlter Craft-Recyclinganteile; Fusion kombiniert Belege ohne Vervielfachung. Keine anderen Kosten erstattet. Beide Resets erhalten Materialbestände, Zugänge, Wissen, Schmieden und Forgeaufträge; nur Hardwarepaketmarken und gerätespezifische Runzähler werden erneuert.

Zehn Challengefamilien ×69 feste wissenschaftliche Stufen, sechs Kapitel, keine Vermögensskalierung. Kurven: Credits 1e6·10^(0,30·(Stufe−1)), Data 1e3·10^(0,20·…), Compute/Users 1e2·10^(0,25·…), Mindest-INT ceil(10^(0,15·…)); Familienfaktoren 1. Eigener Familienbonus im Run deaktiviert; Rewardanteil 0,08·ln(1+höchste absolvierte Stufe) verstärkt nur einen bestehenden spezifischen Bonusanteil. Frische 50 Credits ohne Ressourcen/Jobs, zulässige permanente Boni/Forschung und unveränderliche Loadoutkopien, Hauptspiel separat passiv. Normalprestige nur bei ausgewiesenem Mindest-INT, Axiom gesperrt.

Zentrale Tabellen, tatsächliche Quellen/Verbraucher, kurze vorbereitete Nachweise und offene Grafik-/Kisten-/Balancegrenzen: [Audit](material-builds-audit.md), Katalog (historischer Nachweis: Git-Historie vor Bereinigung), Domainnachweis (historischer Nachweis: Git-Historie vor Bereinigung). Keine Behauptung natürlicher Erreichbarkeit aller 69 Stufen.

## PR #85 correction: catalogue v2 / save v48

New runs cap Quality/Efficiency prerequisites at `ceil(stage/8)` (maximum 9); production curves remain. Existing catalogue v0/v1 runs retain their old objectives. Serial Science adds completed research spending `100×1.22^(stage−1)` and, from chapter 2, alternating areas. Supply-chain chapters require 1/1/2/2/3/3 locally manufactured types and existing per-stage generated-Data goals. Actual purchased entry classes by chapter: SBC/PC/GPU/server/campus/orbital. Shared automation thresholds are total first-completion stages 21/42/70/140/245/350; prior ownership is retained. All new numbers are provisional, not naturally calibrated.

Hands Off rewards offline budget and the existing memory-item bonus; Bare Metal rewards Mastery; Fragmented Network rewards selected connection output. Selected network successors are fixed per new run. Fusion retains the first selected base's ID/level/Forge/counter and combines material receipts. New analysis snapshots preserve fractional amplified yields per material; old jobs retain their old policy. The original training, research, hardware, INT and Axiom base parameters are not retuned. See [transaction/reset details](challenge-corrections.md).

## Achievements/Quests V1 – 12. Oktober 2026

Schwellen und Missionsbasismengen zentral in BALANCE. Itementdeckung bis 30; bezahlte Baupläne bis 28; sieben neue permanente Sammlungs-/Infrastruktur-/Challengefamilien. Spätere Credits-/Data-/Crafting-/Training-/Forschungsstufen erhöht; Start-Farming-Familien aus Katalog entfernt, Claims erhalten. Neue Missionsmengen skalieren in sechs Hardware-Entdeckungsbändern mit 1/2/4/8/16/32; Wiederholungsstufen ×2. Produktionsbudget 2/14/60 Stunden ohne temporären Boost, fix bei Erzeugung. Optionale neue Objectives, feste neue Task-Gems statt Multiplikation nach Wiederholungsstufe. Neue Gem-Maxima mit Periodenbonus 18/90/570. Save v50 erhält alte laufende Aufgaben und Claims. Verträge, Zahlen und nicht kalibrierte Annahmen: `achievements-quests-v1.md`.

## Messung fester früher Loadouts und Questclaims – 12. Oktober 2026

27 begrenzte natürliche Zwei-Stunden-Profile; keine Änderung an Schwellen, Preisen, XP-/Gembudgets oder Formeln. Leere Questperioden (kein Aufgabenpool/required=0) dürfen keinen Bonus buchen; bestehende ausgezahlte Rewards unverändert. Frühe Wochen-/Monatsproduktion und Achievement-Produktionsrückkopplung bleiben Kalibrierungsbedarf. Ergebnisse, mathematische Wirkung, Reset-/Claimvertrag und konkrete Folgeschritte: `build-quest-progression-findings.md`.

## Wochen-/Monatskapitel und Achievementkurve – 12. Oktober 2026

Neue Perioden: eine Produktionsaufgabe pro Metric; Mindestband 0/2/2, Bandvorgriff 0/+1/+2 (max5), Frontierstride 0/4/2. Längere wiederholte Arbeitsziele reservieren zusätzliche Lifetime-Abschnitte, Größen ×2. Normale Anzahl/Bonusschwellen und Gem-/Material-/XPbudgets unverändert. Achievement-Produktionsfaktor ersetzt durch `1+0.25*ln(1+P/100)`; Forschungsbonus bleibt separat auf20% begrenzt. Auch Altaccounts verwenden neuen Faktor, ihre Claims/Gems/Punkte und laufenden Quests bleiben. Save v51 für konkrete Hardwaretargets. Kleine natürliche Gegenmessung belegt weniger frühe Ausschüttung; echte Wochen-/Monats-ETA weiter offen. Vollständige Verträge: `quest-chapters-and-achievements.md`.

## Buildintegration — 12. Oktober 2026

Der Photonenfeld-Bauplan kostet nun **4 statt 6 Fragmente**. Der unveränderte einmalige Vier-Fragment-Receipt aus bezahlter Blueprints-Forschung ermöglicht damit Chip **oder** Trainingitem, nicht beide. Zutaten, 1.200 Data, Compute-Bus, 900s Fertigung sowie spätere Rezepte bleiben unverändert; keine alten Zahlungen zurückrechnen. Natürliche Gegenmessung und offene Langzeitgrenzen: `build-equipment-integration.md`.

Ausrüstungseffekte verwenden einheitlich Eigentum, richtige Kategorie und erworbenen Kategorieplatz. Gesperrte historische Referenzen bleiben erhalten, liefern bis zum regulären Erwerb jedoch keine Effekte. Neue Forschung friert ihre Faktoren beim Start ein; alte Jobs/Income/INT werden nicht neu bewertet. Die Vorschau zeigt tatsächliche Training-Datazahlungen und Laborfaktoren, keine fiktive Trainingsbeschleunigung.

## Tagesbonuskisten — 12. Oktober 2026

Der Tagesbonus ersetzt sein sofortiges Materialpaket durch eine gespeicherte Kiste. Pakete/Gems/Season-XP behalten ihre Mengen; beim Öffnen ist eine bereits beim Verdienen zugängliche Familie wählbar. Die bestehende 1%-Bauplanchance wird beim Verdienen eingefroren (Discovery, kein Gratislernen; bekannter Treffer → Fragment). Kein neuer Preis oder Hardwaregate.

Neue Grenzen in BALANCE: 32 Pendingkisten, höchstens 1.000 Einheiten pro eingefrorenem Komponentenbetrag als Savevertragsgrenze. Ein neues Overflowreceipt wird mit der höchsten gespeicherten Familie automatisch geöffnet; unsicherer Ganzzahlgrant lässt Receipt bzw. den kompletten Overflowbonusclaim unverändert. Save52/Reset-/Challenge-/Migrationsvertrag: `bonus-box-flow.md`. Natürliche Langzeitwirkung ist unkalibriert.

## 2026-10-14 · Modell/Schmiede v56 (neuer Vertrag)

Zukünftiges Q/E-Training bezahlt Credits: `ceil(300*2.4^(Ziellevel-1)*max(.5,1/(1+B)))`; zuvor bezahltes Data-Training behält seinen Vertrag. Intro bleibt gratis. Herstellung neuer Items sofort Common Lv1; Module und zuvor bezahlte alte Itemjobs bleiben zeitgebunden. Lv1–69 unabhängig von Seltenheit (Levelwirkung0.18 und Manufacturing-Faktor0.85 ebenfalls zentral, historische Levelwirkung getrennt eingefroren): Datenbasis100, Wachstum1.22; Materialbasis2, Wachstum1.075; seltene Familienzutaten ab25 alle10 Level, Manufacturing-II-Rabatt. Rezeptkomplexität clamp(sqrt(Rezeptdata/1800),1,16), Basismaterial halbierte aufgerundete Schaltkreismenge. Seltenheit durch Drei-zu-eins-Fusion, höchstes Level/Forge erhalten, Kostenbelege addieren; Recycling maximal3/5 bezahlt, keine Data/Module. Neue normale Zufalls-/Kapselitems Common, historische Seltenheit erhalten. Manufacturing VI/VII/VIII öffnen zusätzliche Familie-Sockel4/5/6; neuer Modellarchivknoten520INT, Tiefe9, nach LabsVIII/ManufacturingVIII erhält Modell und Training nur bei normalem Prestige. Axiom/Challenge ausgenommen.

Save56 migriert alte Lv0-Basis aufLv1 ohne Effektverlust, erhält Outlierpower über einen Alt-Faktor, friert alte Jobs und konvertiert Hauptsave/Challengekopien konsistent. Alle Zahlen zentral in BALANCE. Vorhandene Herstellungsdauern/Data-Trainingwerte gelten weiterhin ausschließlich für Altverträge. Mathematische Details, offene Precision-/Forge-Anreize, UI, Reset- und Prüfvertrag: [model-forge-v1.md](model-forge-v1.md). Credit300/2.4, Itemkurven und Archivpreis sind **noch unkalibrierte Designannahmen**.

## 2026-10-14 · Einzelstation und Serienfertigung v57

Eine Veredelungsstation (Maximum 5) statt drei neu ausbaubarer Stationen; bestehende Preise, Geschwindigkeiten und Item-Forgegrenzen der ersten Station bleiben unverändert. Save57 übernimmt die höchste historische Stufe; zusätzliche frühere Ausbaustufen bleiben als validierter `legacyFoundryLevels`-Fortschritt (0–10) erhalten. Bezahlte Nebenaufträge und bestehende Queues laufen unter ihren bisherigen Verträgen aus. Keine neuen Starts/Upgrades für Station 2/3. Infrastrukturmissionen verwenden die verbliebenen realen Ausbaustufen; industrielle Achievements zusätzlich die höchste Item-Forge-Stufe, damit bisherige Schwellen weiterhin erreichbar sind. Alte Missionen/Claims erhalten, ohne Nachzahlung.

Neuer zentraler Prestige-Knoten `batchFabrication`: 100 INT, Tiefe3, nach `manufacturing2`, benötigt Prestige; schaltet ×3/×10/×100 Itemherstellung frei. Der Domainpfad verweigert mehrere Items vor Erwerb atomar. Einzelfertigung und alte bezahlte Craftverträge bleiben erhalten; Module behalten ihren bisherigen Domainvertrag. Keine sonstige Neukalibrierung. Preis/Progressionswirkung sind noch nicht natürlich gemessen. Details: [mobile-forge-research-v2.md](mobile-forge-research-v2.md).

## 2026-10-18 · Sofort-Items / Seasons 1–3

Item-Crafting und Fusion sind sofortige atomare Transaktionen. Rezeptkosten bleiben erhalten, Item-Warteschlangen entfallen; bezahlte alte Aufträge werden beim Upgrade auf v63 ohne zweite Zahlung fertiggestellt. Module und Veredelung behalten ihre Prozesse.

`BALANCE.seasonV2` enthält die ersten drei Themen, 50 Belohnungsstufen pro Season, Free/Premium-Itemraritäten und Belohnungswerte. Pro Season: Free 1.200 Gems, 20 Kisten, 3 Items; Premium zusätzlich 4.500 Gems, 20 höherwertige Kisten und 13 Items. Das Finale garantiert Epic (Free) bzw. Legendary (Premium). Kisten verwenden bestehende Shop-Lootregeln.

Die ersten drei Stufen der sechs frühen Kernforschungen dauern 30/60/90 Sekunden vor Boni; Daten-Basiskosten werden auf 30/60/120 begrenzt, anschließend gilt das vorhandene Preiswachstum. Einführung 20 Sekunden; bezahlte Jobs unverändert. Gem-Videoabrufe: 10 Gems, jeder zehnte erfolgreiche Abruf 30; bestehend fünf Abrufe pro Tag, kein Zählerfortschritt bei Abbruch/Replay. Alle neuen Werte stehen in `BALANCE.seasonV2`.

[Details, Berechtigungen und Migration](instant-items-seasons.md).

## 2026-10-18 · Temporäres Gem-Angebot

`BALANCE.commerce.gemVideoCooldownMs = 600000`: Nach einem erfolgreichen Gem-Abruf gilt eine gespeicherte Zehn-Minuten-Frist (`commerce.gemNextAt`). Die Karte verschwindet während dieser Frist und bei ausgeschöpfter Tagesquote. Abbruch/Fehler bleiben ohne neue Frist. Bestehende fünf Abrufe pro Tag, 10 Gems regulär und 30 beim zehnten erfolgreichen Abruf bleiben erhalten. Werbefrei nutzt dieselben Grenzen. Das optionale Feld ist im bestehenden Save v63 validiert und rückwärtskompatibel.


## 2026-10-18 · Frühe Progression, Beta 9

Basispreis/Wachstum: SBC 2.000/1,16; PC 30.000/1,17; GPU 1 Mio./1,18; Rig 15 Mio./1,19; Server 2 Mrd./1,20. Geräteproduktion, Meilensteine, Grundumsatz, Trainings- und INT-/Axiom-Formeln unverändert. Acht frühe Forschungsreihen haben fünf Einstiegsstufen mit 30/60/90/150/240 s und Kostenbasiskappen 30/60/120/180/250 Daten, weiterhin multipliziert mit Levelwachstum; Kommerzialisierung und Hardware-Integration sind jetzt enthalten. Projektzeiten Operations/Blueprints/Alignment: 180/150/450 s. Bereits bezahlte Arbeitsverträge bleiben gespeichert. Keine Saveversion- oder Entitlement-Konvertierung.

Im aktiven Vergleich: erste ganze INT etwa 39–42 min, erster gewählter Reset mit drei INT etwa 49–54 min; weniger häufige Rückkehrprofile brauchen länger. Der Export zeigt nun echte V2-Forschungsangebote statt Legacy-Preisen. [Methodik, vollständige Vorher/Nachher-Werte und Grenzen](early-balance-rework.md).
## Unity-Referenzexport · 19.10.2026

Der erste Unity-Abschnitt übernimmt bestehende Werte ohne Balanceänderung. `npm run unity:export` erzeugt `IdleIntelligence/Assets/IdleIntelligence/Core/Balance.g.cs` und gemeinsame Referenzfälle aus dem laufenden TypeScript-Code; `npm run unity:check` erkennt veraltete Exporte. Der Port enthält Startkapital, Hardwarepreise und Meilensteine, frühe Produktionsfaktoren, Taps/Overdrive, Qualität/Effizienz und fünf frühe Wiederholforschungen einschließlich der bisherigen Tutorialangebote. Keine separat handgepflegten C#- oder Inspectorwerte. Die Grenzen und tatsächliche Paritätsprüfung stehen in [unity-playable-slice.md](unity-playable-slice.md); fehlende Systeme sind keine neue Balanceentscheidung. Die nachfolgenden TypeScript-Balanceaufzeichnungen bleiben gültig.


## Unity-Itemabschnitt · 19.10.2026

Keine Balanceänderung. `ItemBalance.g.cs` und 509 zusätzliche gemeinsame Fälle werden aus `economy.ts` und den bestehenden Domainfunktionen exportiert: alle 30 Itemtypen/sechs Seltenheiten, Rezept-/Meisterschafts-/Levelkosten, Komponenten/Module/Analysen, Materialpakete, Slots, Kombinationen, bedingte Effekte und Fusionserhaltung. Die originalen Seltenheitsfarben kommen aus `ItemPresentation.tsx`. Verteilte bestehende Regeln werden übernommen, nicht still bereinigt. Testvorräte für vollständige Katalogprüfung und Animationsaufnahme existieren ausschließlich in Tests. Fehlende Verbraucher/Erwerbswege bleiben in der Migrationsliste offen und führen zu keiner neuen Ersatzbalance.


## Unity-INT-Abschnitt · 19.10.2026

Keine Balanceänderung. Der reproduzierbare `PrestigeBalance.g.cs`-Export übernimmt alle 60 Knoten, Originalpreise/-formeln, tatsächliche Effekte, Reset-/Erhaltungsregeln und Netzgeometrie. Auch die im aktuellen TypeScript noch vorhandenen zusätzlichen gemeinsamen Itembonus-Poolbeiträge W01 +0,40 / W02 +0,75 / W06 +1,25 werden unverändert übernommen und sichtbar dokumentiert. Gemeinsame 370 technische Fälle und ein getrennter natürlicher frischer Lauf prüfen den Port; keine erhöhten Testbestände im regulären Spiel. Axiome und neue KI-Modelle bleiben offen. [Details und Prüfgrenzen](unity-int-prestige.md).


## Unity-Axiome und Modelle · 19.10.2026

Keine Balanceänderung und keine neuen Formeln. `MetaBalance.g.cs` übernimmt den aktuellen 24-Knoten-/10-Modell-Katalog samt Originalpreisstaffeln, A02-Tail und bestehenden Recoveryregeln reproduzierbar. Axiom-, Modell-, Slot-, Trainings-, Budget- und Planereffekte werden an die bestehenden Unity-Transaktionen angeschlossen. 323 zusätzliche gemeinsame technische Fälle, darunter mehrere Axiomzyklen, tatsächliche Erkenntnisproduktion und Restmengen, prüfen die Übernahme. Das Erkenntnisarchiv erhält keinen erfundenen Lern-/Gratisweg. [Umfang und fehlende Verbraucher](unity-axioms-models.md).


### Gumball-Tickets – 22.10.2026

Zusätzliche, lokale Belohnungswährung (nicht ungeprüft serverseitig transferierbar) für **eine normale Ziehung pro Gutschein**. Kein Gem-Abzug, kein Ad-Verbrauch, keine zusätzliche Chance auf besondere Gegenstände beim Ziehen. Unabhängige Bonuschance in Common/Rare/Epic/Legendary-Truhen: 5%/10%/20%/30%, tägliche Bonusbox 0,25%. 1 garantierter Gutschein Free Season Level 30, 1 zusätzlicher Premium Season Level 40; beide auf die bestehenden Rewards aufgesetzt. Wallet-Grenze: 999 verfügbare Tickets. Quelle: `BALANCE.gumballVouchers` in `src/economy.ts`. Alle Werte vor Produktion anhand echter Tests und Loot-Inflationssimulation überprüfen. Token sind lokal und dürfen nicht zu Cloudflare-Trades/Gems gemintet werden.

## Beauftragtes Online-Handelslimit · 23.10.2026

`BALANCE.companyTradeDailyLimit = 5`: fünf abgeschlossene Spielertransaktionen je Spieler und UTC-Kalendertag, für beide Teilnehmer gemeinsam über Warenhandel, Gutscheinhandel und Geschenke. Offene/abgelehnte/stornierte/abgelaufene Angebote verbrauchen nichts. Migration 0009 setzt das Limit atomar mit Escrow/Transfer durch; das ist eine ausdrücklich beauftragte neue Regel, keine Änderung bestehender Itempreise. Keine Produktionsmigration ausgeführt.

## Beauftragte Dark-Lab-/Axiom-Items · 23.10.2026

Sechs zusätzliche IDs **hinter** den bestehenden 30; deren Werte bleiben erhalten. `lateMetaItemCatalog` ist die einzige Balancequelle, einschließlich Rezepten und Primär-Caps:

| ID | Zugang | Rezept: Fragmente / Daten | Neuer Verbraucher / Cap je Item |
|---|---|---|---|
| darklab-resonator | Geheimlabor | 32 / 2 Mio. | Erkenntnisrate +35% maximal |
| model-echo-core | Geheimlabor; aktives Modell für Effekt | 48 / 4 Mio. | Bonusanteil Modellkern +25% maximal |
| axiom-lattice | Geheimlabor und abgeschlossener Axiomreset | 80 / 12 Mio. | Axiomgewinn vor Abrunden +20% maximal |
| cycle-observatory | Geheimlabor und abgeschlossener Axiomreset | 96 / 18 Mio. | Forschung +30% maximal × min(1,Axiomzyklen/5) |
| entropy-sink | Geheimlabor | 64 / 8 Mio. | Compute +40% maximal × min(1,max(0,log10(unverbrauchte Erkenntnis))/6) |
| mnemonic-anchor | Geheimlabor und drei erworbene Modelle | 72 / 10 Mio. | Training +35% maximal × min(1,Modellzahl/5) |

Komponenten, Module, Sekundär-/Tertiärkanäle und Upgradeeffekte sind ebenfalls zentral definiert. Herstellung bleibt sofort, Common Lv.1; höhere Seltenheiten entstehen über Fusion und die vorhandenen freigeschalteten Zufallspools. Die Rezept-Rarität bezeichnet wie bisher den Kosten-/Arbeitsrang, keinen garantierten Herstellungsrang. Kein neuer Erwerbsweg für das weiterhin problematische Erkenntnisarchiv.

Sammlungs-Achievements erhalten **zusätzliche** Endstufen bei36 Itemtypen bzw.34 kostenpflichtigen Bauplänen. Die bisherigen30-/28-Schwellen und alle alten Claims bleiben unverändert. Die bestehende Reward-Indexbegrenzung verwendet dafür die schon vorhandene höchste Stufenbelohnung; keine alten Belohnungen werden erneut gewährt.

## Materialanalyse und INT-Planung · 26.10.2026

Expliziter Spielerauftrag: höhere Komponentenausbeute und nutzbare Analyseplanung vor dem Axiomfortschritt. Quelle bleibt ausschließlich `src/economy.ts`, Unity liest reproduzierbar erzeugte Daten.

| Analyse | Komponenten vorher → neu | Daten unverändert | Basisarbeit unverändert |
|---|---:|---:|---:|
| Hardware kurz | 12 → 24 | 250 | 10 min |
| Hardware lang | 360 → 720 | 6.000 | 4 h |
| Architektur kurz | 18 → 36 | 800 | 30 min |
| Architektur lang | 360 → 720 | 12.800 | 8 h |
| Artefakte kurz | 30 → 60 | 4.000 | 2 h |
| Artefakte lang | 450 → 900 | 48.000 | 24 h |

Nur neue Verträge: bereits bezahlte Analysen behalten ihre gespeicherten Einheiten und Restarbeit. Forschungs-, Fokus-, Familien-, Kombinationseffekte und Bruchteilsreste bleiben anwendbar. Fragmentmengen, Itemchancen, Seltenheitstabellen, Herstellungsrezepte und Preise unverändert. Bei gleicher Analysedauer liefert das System doppelt so viele Basis-Komponenten, keine doppelte Chance auf Items/Fragmente. Der relative Effizienzvorteil langer Analysen bleibt erhalten. Bei vollständig analyselimitierter Herstellung halbiert sich somit die nötige Analysezeit; andere Material-, Daten-, Rezept- und Modulengpässe bleiben bestehen. Es wird keine bestimmte Einzelkomponente garantiert, außer der bestehenden seltenen Zusatzgarantie durch W03.

F02 (weiterhin 100 INT) erweitert zusätzlich zur bestehenden Forschungsqueue die Analyseplanung auf sechs unbezahlte FIFO-Einträge. F03 (weiterhin 2.000 INT) erlaubt zusätzlich die Analyse-Wiederholung. Keine Vorgängerkaufsperren, keine neuen Knoten. Der bisherige Axiomzugang C02 bleibt ein alternativer Zugang zur gleichen Wiederholung und stapelt sich nicht. Wartende Analysen werden erst bei tatsächlich möglichem Start zum dann gültigen Preis bezahlt. Queue vor Wiederholung; fehlt Geld oder Zugang, wartet der erste Auftrag. Keine negative Datenbuchung durch das bisherige ungeprüfte direkte Starten eines Queueeintrags nach Abschluss.

Automatische Wiederholung achtet auf die bestehende gemeinsame Datenreserve und die geschützten Trainings-/Forschungsbudgets. Datenkompression wird auch bei der automatischen Bezahlbarkeitsprüfung korrekt berücksichtigt. Das Offline-Limit bleibt unverändert: Basis acht Stunden, mit vorhandenen Verbesserungen maximal 24 Stunden. Eine 24-Stunden-Analyse wird bei acht Stunden Offlinekapazität nur acht Stunden weiterbearbeitet. Keine Hintergrundsimulation außerhalb der angerechneten Zeit, kein zusätzlicher Offlinebonus und keine Belohnung durch UI/Animation. Sechs kurze Hardwareanalysen ergeben ohne Zusatzboni 144 Komponenten bei sechs echten Abbuchungen von je 250 Daten.

Komponenten-Zielsuche (z. B. gewünschter Bestand Graphen = 50) ist ausdrücklich ein späterer Ausbau; noch kein Zielplaner, keine erfundene garantierte Suche und keine bereits freigeschaltete Funktion.
