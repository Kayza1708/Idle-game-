# Axiom-Kalibrierung und Folgezyklen — 1. Oktober 2026

## Parametersuche

Die alte Schwelle **1.000** ergab nach 30 Tagen 148 Zyklus-INT (aktiv) beziehungsweise 74 (passiv) bei Seed 1708 und damit kein Axiom. Für die Kalibrierung wurden vollständige aktive 30-Tage-Läufe mit unveränderter INT-Entscheidungsregel ausgewertet; da die Schwelle vor dem ersten Axiom keinen Lauf beeinflusst, genügt je Seed ein Lauf, um wenige Kandidaten und anschließend das ganzzahlige Intervall zu prüfen.

| Seed | Zyklus-INT Tag 21 | Zyklus-INT Tag 30 | Verhalten mit Schwelle 117 |
|---:|---:|---:|---|
| 1708 | 116 | 148 | verfügbar an Tag 21,83 |
| 42 | 115 | 147 | verfügbar zwischen Tag 21 und 22 |
| 2026 | 133 | 133 | verfügbar an Tag 16,55 |

Es existiert **kein gemeinsamer ganzzahliger Schwellenwert**, der alle drei Seeds in das Ziel von Tag 21–30 legt: Für 1708/42 muss die Schwelle mindestens 117 sein; Seed 2026 erreicht seinen letzten Stand von 133 bereits an Tag 16,55 und erhält danach bis Tag 30 kein weiteres INT-Prestige. Eine Schwelle ab 134 würde Seed 2026 bis Tag 30 gar nicht erreichen. Als kleinster positiver, für alle Seeds innerhalb von 30 Tagen erreichbarer Kompromiss wurde **117** gewählt. Der Zielkonflikt für Seed 2026 bleibt ausdrücklich offen; kein anderer Parameter wurde verändert.

## Echte Resetläufe, Seed 1708

Die Strategien verwenden den echten `axiomReset`-Transaktionspfad. Langläufe waren auf sechs Minuten pro Prozess begrenzt.

| Profil | Strategie | geprüfter Zeitraum | erste Verfügbarkeit | Resets | Stand am Ende |
|---|---|---:|---:|---|---|
| aktiv | sofort bei 1 | 30 Tage | Tag 21,83 | Tag 21,83: 1 Axiom aus 148 INT | 1 Axiom, neuer Zyklus 104 INT; zweiter Reset nicht erreicht |
| aktiv | auf 2 warten | 60 Tage | Tag 21,83 | keiner | 188 INT; 468 INT für 2 Axiome nicht erreicht |
| passiv | sofort bei 1 | 60 Tage | Tag 55,33 | Tag 55,33: 1 Axiom aus 123 INT | 1 Axiom, neuer Zyklus 25 INT; zweiter Reset nicht erreicht |
| passiv | auf 2 warten | 60 Tage | Tag 55,33 | keiner | 123 INT; 468 INT für 2 Axiome nicht erreicht |

Der permanente Axiom-Faktor wechselte bei beiden Sofortresets genau einmal von **×1,00 auf ×1,50**. Beim aktiven Sofortreset fiel die reale Creditrate durch den absichtlichen Verlust der Zyklus-INT/Hardware zunächst von **615.576,45/s** auf **4.953,94/s**; der erste neue 10er-Hardwaremeilenstein wurde nach **170 Sekunden** erreicht. Beim passiven Sofortreset waren es **268.816,00/s → 3.442,66/s** und **160 Sekunden** bis zum ersten 10er-Meilenstein. Das ist die tatsächlich gemessene Neustartgeschwindigkeit; es wurden keine weiteren Multiplikatoren ergänzt.

Jeder ausgeführte Reset bestätigte: Zyklusumsatz und neuer INT-Anspruch waren null, INT-Knoten waren entfernt, historischer Umsatz blieb nur Statistik, Forschung/Sammlung/Crafting blieben bytegleich erhalten, und der Axiom-Bonus wurde genau einmal gebucht. Nicht erreichte Folge-Resets werden nicht hochgerechnet. Der aktive Sofortlauf über Tag 30 sowie parallele 40-/60-Tage-Versuche überschritten das externe Sechs-Minuten-Limit ohne verwertbaren abgeschlossenen Teilstand; sein letzter vollständiger Stand ist Tag 30. Der aktive 2-Axiom-Lauf schloss dagegen 60 Tage innerhalb des Limits ab.

## Upgrade-Folgezyklus-Prüfung (2. Oktober 2026)

Historischer v34-Befund: Die damalige Upgrade-Implementierung änderte weder die Schwelle 117 noch die oben dokumentierten Langzeitläufe; v35 löst diese Schwelle und Messstrategie unten ab. Reproduzierbare Transaktionszustände direkt am Axiom-Reset prüfen alle vier Varianten (ohne Upgrade, verankerter Einkaufsagent, Analyseplaner, Werkbankplaner): der Reset bucht zunächst genau ein tatsächlich verdientes Axiom und der Vergleichskauf zieht dieses Axiom anschließend über `buyAxiomUpgrade` wieder ab. In der isolierten 3.600-Sekunden-Folgezyklusprüfung des Analyseplaners wurden mehrere reguläre Kurzverträge abgeschlossen, ohne die Schleifengrenze zu erreichen; der Werkbankplaner reservierte für einen Impulsrelaisauftrag exakt 12 Schaltkreise und 2 Kupferspulen. Ohne vorhandene Ressourcen startete keiner der Planer einen Auftrag. Diese kurze Mechanikmessung ist ausdrücklich keine neue Langzeitbalance-Prognose.

Historische v34-Seed-2026-Diagnose: Produktion läuft weiter, aber der Stand stagniert bei 133 Zyklus-INT, weil der nächste normale Prestige unter der bestehenden Entscheidungsregel den permanenten INT-Faktor nicht um mindestens 25 % verbessert. Die Axiom-Upgrades verändern weder diese Regel noch beanspruchbares INT. Ein belastbarer mehrwöchiger Vergleich der manuellen Aktionen, Hardware-Meilensteine, Analyseabschlüsse und Crafting-Ergebnisse je Upgrade bleibt offen; es wird kein nicht abgeschlossener Langzeitlauf hochgerechnet.

## Scientific-INT-Neukalibrierung v35 (2. Oktober 2026)

Der kontinuierliche 90-Minuten-Starttest erreicht mit `baseRevenue = 14.178.653.052` bei allen drei deterministischen Seeds den Vergleichs-Prestige bei Minute **45** und mindestens 3 INT. Das Sitzungsprofil verwendet anschließend ausdrücklich die Vergleichsregel „mindestens 3 INT und mindestens 45 Minuten Runzeit“; die frühere starre 25-%-Regel ist nicht mehr die alleinige Langzeitstrategie.

Die frühere Axiomschwelle 117 ist für die neue Kurve unbrauchbar. Schon eine Number-Schwelle von `1e300` wurde im aktiven Seed 1708 an Tag **2,83** überschritten. Deshalb wird die neue Schwelle wissenschaftlich gespeichert; die Konfiguration `{m:1,e:1000000000000000}` ist die erste prüfbare Langzeitkalibrierung. 7-/30-/60-Tage- und 42–56-Tage-Zielmessungen werden mit hartem Prozesslimit ausgeführt. Läufe, die das Limit überschreiten, werden ausdrücklich als nicht erreicht gemeldet und nicht hochgerechnet.

Der vollständige aktive 7-Tage-Lauf ohne Axiom-Reset (Seed 1708) endete nach 12 normalen Vergleichs-Prestiges bei Scientific-Cycle-INT `{m:1,e:2,0696342579112534e148}`. Der 60-Tage-Lauf mit `{m:1,e:3.300.000}` überschritt das 300-Sekunden-Prozesslimit ohne abgeschlossenen Teilbericht. Damit ist das gewünschte 42–56-Tage-Fenster unter den unveränderten Produktionskurven nicht seriös kalibrierbar: der Exponent wächst bereits in der ersten Woche superexponentiell und nähert sich vor Tag 42 der endlichen Exponentengrenze. Als maximal prüfbare positive Schwelle wird `{m:1,e:1000000000000000}` verwendet. Das Zeitziel ist **nicht nachgewiesen**; es wurden keine anderen Kurven heimlich verändert. Passive sowie 30-/60-Tage-Werte sind wegen Timeout beziehungsweise nicht abgeschlossenem Lauf ausdrücklich „nicht erreicht“.

## Rückkopplungsfix und belastbare Neuvermessung v36 (2. Oktober 2026)

**Vorher:** Der aktive 7-Tage-Lauf Seed 1708 erreichte bei nur 12 normalen Prestiges Scientific-Cycle-INT `{m:1,e:2,0696342579112534e148}`. Ursache war die gleichzeitige Anwendung des linearen INT-Creditbonus und von `1,08^sqrt(cycleINT)`. Die instrumentierte Timeline exportiert nun je Prestige rohen berechtigten Umsatz, gewichtetes Ledger, Anspruch, Zyklus-INT, Creditrate, INT-/Axiomfaktor und den entfernten Legacy-Faktor; Detailmultiplikatoren werden auf die ersten acht Einträge begrenzt, die kompakten Prestigezeilen auf 256.

**Nachher, neue Basis 442.493.746.168:** Alle drei kontinuierlichen Seeds besitzen bei 2.690 s genau 2 und bei 2.700 s genau 3 beanspruchbare INT. Die 1-/7-Tage-Sitzungsläufe starteten bei t=0 und endeten ohne Timeout:

| Profil | Tag 1 (INT / Prestiges / Knoten) | Tag 7 (INT / Prestiges / Knoten) | Credits / Rate an Tag 7 | 100 INT |
|---|---:|---:|---:|---:|
| aktiv, Seeds 1708/42/2026 | 7 / 2 / 5 | 305 / 14 / 15 | ca. 1,29e14 / 7,91e9 s⁻¹ | 244.810 s (2,83 Tage) |
| passiv, alle Seeds | 0 / 0 / 0 | 19 / 5 / 8 | ca. 3,76e9 / 2,30e5 s⁻¹ | nicht erreicht |

1.000 und 10.000 Zyklus-INT wurden bis Tag 7 nicht erreicht. Die damalige Schwelle `10^(10^15)` blieb in v36 bis zu abgeschlossenen Läufen unkalibriert; sie wird durch die vollständige v37-Messung unten abgelöst.

Der optimierte aktive 30-Tage-Lauf für Seed 1708 schloss in 168 Sekunden ab: 1.782 Zyklus-INT, 61 normale Prestiges und 20 gekaufte Knoten; 100 INT wurden an Tag 2,83 und 1.000 INT an Tag 16,83 erreicht, 10.000 INT nicht. Der Endzeitpunkt lag kurz nach einem Prestige bei 1,34e10 Credits und 8,08e5 Credits/s. Diese Momentaufnahme wird nicht als Maximalrate interpretiert.

Die 30-Tage-Läufe aller Seeds schlossen ohne Timeout ab:

| Profil | Seed | Credits / Rate am Endzeitpunkt | Zyklus-INT | Prestiges | Knoten | 100 / 1.000 / 10.000 INT |
|---|---:|---:|---:|---:|---:|---|
| aktiv | 1708 | 1,34e10 / 8,08e5 s⁻¹ | 1.782 | 61 | 20 | Tag 2,83 / 16,83 / nicht erreicht |
| aktiv | 42 | 1,31e15 / 7,67e10 s⁻¹ | 2.027 | 60 | 20 | Tag 2,83 / 17,33 / nicht erreicht |
| aktiv | 2026 | 1,44e15 / 8,41e10 s⁻¹ | 1.979 | 60 | 20 | Tag 2,83 / 16,83 / nicht erreicht |
| passiv | 1708 | 3,62e13 / 2,14e9 s⁻¹ | 104 | 21 | 13 | Tag 29,33 / nicht / nicht |
| passiv | 42 | 3,60e13 / 2,13e9 s⁻¹ | 99 | 21 | 13 | nicht / nicht / nicht |
| passiv | 2026 | 3,60e13 / 2,13e9 s⁻¹ | 99 | 21 | 13 | nicht / nicht / nicht |

Credits und Rate sind Endzeitpunktwerte und schwanken abhängig davon, wie kurz zuvor der letzte echte Prestige stattfand. Die Knotenanzahl ist deshalb der robustere Tiefenindikator; kein Lauf erreichte bis Tag 30 die 10.000-INT-Knoten.

Der aktive 60-Tage-Lauf Seed 1708 schloss innerhalb des 420-Sekunden-Limits nach 345,8 Sekunden ab: 2.919 Zyklus-INT, 136 normale Prestiges, 21 Knoten, 2,39e16 Credits und 1,27e12 Credits/s am Endzeitpunkt. 10.000 INT wurden nicht erreicht. Die zwei weiteren aktiven Seeds und passive 60-Tage-Profile sind noch nicht als abgeschlossene Messwerte ausgewiesen; für sie wird keine Hochrechnung verwendet.

Drei parallel gestartete aktive 42-Tage-Läufe überschritten jeweils das 330-Sekunden-Prozesslimit ohne abgeschlossenen Bericht; parallele CPU-Sättigung war dabei der gemessene Engpass. Die Berichtslast wurde daraufhin begrenzt: vollständige Multiplikatorzerlegung nur für die ersten acht Prestiges, höchstens 256 kompakte Prestigezeilen. Ein einzelner 60-Tage-Lauf schloss damit ab, die drei 42-Tage-Seeds jedoch nicht innerhalb desselben Parallel-Limits. Deshalb bleibt die Axiomschwelle in diesem Auftrag **unverändert und unkalibriert**. Eine Schwelle aus den Tag-30-/Tag-60-Endpunkten abzuleiten wäre eine Hochrechnung und wird ausdrücklich nicht vorgenommen.

## Konservative Meta-Schwelle und Axiom-Knoten v37 (4. Oktober 2026)

Nach dem Rückkopplungsfix wurden die unveränderten aktiven und passiven Sitzungsprofile erneut ab `t=0` mit Seeds 1708, 42 und 2026 ausgeführt. Die Suche betrachtet ganzzahlige Cycle-INT-Schwellen, da normale Prestiges ausschließlich ganze INT gutschreiben. Seed 2026 hatte kurz vor Tag 42 bereits 2.999 Cycle-INT (84 normale Prestiges); Seed 1708 erreichte selbst am Ende des vollständigen 56-Tage-Laufs nur 2.825. Damit existiert kein Schwellenwert, der gleichzeitig bei keinem Seed vor Tag 42 auslöst und bei allen Seeds spätestens an Tag 56 erreichbar ist. Gemäß dem konservativen Auftrag wird deshalb **3.000 INT** (`{m: 3, e: 3}`) gewählt: der kleinste ganzzahlige Wert oberhalb des gemessenen Vor-Tag-42-Maximums von 2.999 INT. Die übrigen Economyparameter blieben unverändert.

Die passiven 56-Tage-Vergleiche erreichten kein Axiom und damit auch keinen zweiten Anspruch:

| Seed | Cycle-INT | normale Prestiges | Credits am Ende | Creditrate am Ende |
|---:|---:|---:|---:|---:|
| 1708 | 198 | 41 | 4,04e10 | 2,35e6/s |
| 42 | 192 | 41 | 6,81e13 | 3,97e9/s |
| 2026 | 191 | 40 | 6,29e14 | 1,65e10/s |

Die starken Endzeitpunktunterschiede bei Credits und Rate entstehen daraus, wie kurz vor dem Messende das letzte normale Prestige stattfand; Cycle-INT und Prestigezahl sind die robusteren Vergleichswerte. Ein zweites Axiom wurde in keinem abgeschlossenen 56-Tage-Lauf erreicht und wird nicht hochgerechnet.

Mit der konservativen Schwelle liefen die echten Axiom-Transaktionen für die erreichenden Seeds bis Tag 56 weiter:

| Seed | erste Verfügbarkeit/Reset | normale Prestiges bis Reset | Cycle-INT beim Reset | Credits / Rate unmittelbar davor | Stand Tag 56 nach Reset |
|---:|---:|---:|---:|---:|---:|
| 42 | Tag 42,833 | 87 | 3.018 | 0 / 2,92e4 s⁻¹ | 1 Axiom, 794 neue Cycle-INT, 139 Prestiges gesamt |
| 2026 | Tag 42,333 | 85 | 3.064 | 0 / 2,66e4 s⁻¹ | 1 Axiom, 764 neue Cycle-INT, 139 Prestiges gesamt |
| 1708 | nicht bis Tag 56 | 124 bis Messende | 2.825 am Ende | 1,15e16 / 6,62e11 s⁻¹ am Messende | 0 Axiome |

Die Credits sind unmittelbar vor dem atomaren Axiom-Reset null, weil die normale Prestige-Transaktion, welche die Schwelle überschreitet, im selben deterministischen Entscheidungstakt direkt vorher Credits/Hardware zurücksetzt. Die Axiom-Transaktion selbst wurde dennoch ausschließlich über `axiomReset` ausgeführt. Bei beiden Resets wechselte der Axiom-Creditfaktor genau einmal von ×1 auf ×1,5; Zyklusumsatz, normaler Anspruch, Cycle-INT und INT-Knoten waren danach null. Forschung, Sammlung und reservierte Crafting-Aufträge blieben unverändert. Der erste 10er-Hardwaremeilenstein folgte jeweils nach 160 Sekunden. Ein zweites Axiom wurde bis Tag 56 nicht erreicht.

### Prüflimits

Die drei aktiven und drei passiven 56-Tage-Läufe sowie die echten Resetläufe für Seeds 42/2026 schlossen ohne internen Simulator-Timeout ab. Der separate historische `longTermSimulation.test.ts` überschritt dagegen ein externes 180-Sekunden-Testlimit und wurde nicht als bestanden gemeldet; alle übrigen Testdateien einschließlich der gezielten Axiom-, Save-, Export- und Layer-Three-Suiten schlossen ab. Dieser bestehende breit angelegte Langzeittest bleibt als Laufzeitproblem offen, nicht als hochgerechnetes Balanceergebnis.
