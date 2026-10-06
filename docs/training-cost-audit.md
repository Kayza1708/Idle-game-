# Auftrag 7B – Trainingsboni als Data-Startkosten

## Basis und Ursache

Repository ausschließlich Kayza1708/Idle-game-, AGENTS.md gelesen. Ausgangsarbeitsbaum sauber. PR #72 ist gemergt; erfolgreich abgeglichenes Main `39a503f0190fe8e14380bfed7fbd213dcc87bc66` enthält `d8050b153d685a430de7d63171739840f4121b4a`. Eigener Branch `codex/training-data-cost-bonuses`, keine offene PR-Abhängigkeit; Vorgängerbranch unverändert.

Seit der festen Trainingsrate 1 hatte kein Trainingsgeschwindigkeitsbonus einen Verbraucher. Kosten waren ausschließlich die Basisformel; Common-Trainingsitems hatten deshalb gesperrte Verbesserungen. Historischer Verbraucher vor der festen Rate (`9891ece^:src/economy.ts`, `trainingRate`) belegt Itemeffekte, Trainingsmeilensteine, Graph +0,2 und temporäre +1-Beiträge. Compute-Zuweisung ist seit 7A entfernt und wird nicht als Bonusquelle reaktiviert.

## Zentraler Vertrag

Ungerundete Basis: `15 Data * 1.75^(targetLevel - 1)`. `B` addiert die vorhandenen effektiven Beiträge, jeder genau einmal. Faktor `max(0.5, 1/(1+B))`; erst das Ergebnis `ceil(base * factor)`. +20 % entspricht Faktor 1/1,2, nicht pauschal −20 %. Dauer bleibt `min(90 * 1.35^(targetLevel - 1), 72h)`, keine Creditkosten. 15 × 0,5 wird zu 8 Data: tatsächliche Preisersparnis 46,67 %, obwohl der Faktor 50 % Rabatt erreicht.

`trainingCostQuote` ist der gemeinsame reine Helfer für Vorschau, tatsächlichen Start, Snapshot, Itemvergleich und Export. Start bezahlt einmal und friert `costBasis` mit Ziellevel, wissenschaftlicher ungerundeter Basis, B, Quellen und Faktor neben den bezahlten wissenschaftlichen Kosten ein. Telemetrie hat dieselben Werte und Auftrags-ID; `training.csv` ergänzt Basis/Faktor/B/Quellen. Laufende Aufträge benutzen nie aktuelle Bonuswerte. Die Queue reserviert nichts und prüft Ausrüstung/temporäre Boni erst beim regulären Start; die bestehende Simulation startet nach Abschluss im nächsten regulären Schritt, kein neuer Queue-Zeitvertrag.

Saveformat bleibt v41, additive optionale Kostenbasis. Ältere gültige Aufträge ohne diese Basis bleiben erhalten und werden als nicht historisch gemessen angezeigt. Neue Metadaten werden auf Ziellevel, Basis, Faktor, Quellensumme und bezahlte Kosten validiert. Widersprüchliche Imports werden abgewiesen. Keine rückwirkende Erstattung. Explizite `training-15m`/`training-1h`-Gemangebote behalten ihre getrennte bezahlte Zeitverkürzung.

## Quelleninventar – vorhandene IDs und Verbraucher

| IDs / Feld | Bestehender Wert und Berechnung | Bisher | Jetzt |
|---|---|---|---|
| `photonic-array`, `logic-seed` | primärer Trainingseffekt, Gewicht 1 | wirkungslos bei trainingRate 1 | ausgerüstete Instanz als B-Beitrag |
| `tensor-core` ab Rare | sekundärer Trainingseffekt, Gewicht 0,65 | wirkungslos | ausgerüstete Instanz als B-Beitrag |
| Itemqualität, `level`, `forge` | bestehendes `itemEffect = .08 * rarity.factor * (1+.18*level) * (1+.12*forge)` und `itemScalingMultiplier` | berechneter Wert ohne Trainingsverbraucher | unveränderte Werte über `itemEffectFor` |
| `analysis6` | vorhandenes Sekundärgewicht ×1,25, somit auf Rare+ Tensor-Core | Itemverstärkung ohne Trainingsverbraucher | innerhalb des Itembeitrags einmal; kein zusätzlicher Quelleneintrag |
| `manufacturing4/6/7/8` | vorhandene Fertigungsbeiträge 0,2/0,4/0,75/1,25; Itemwert ×(1+Summe) | `equippedBonus(training)` wirkungslos | innerhalb der Itemquelle einmal, kein zusätzlicher Rabatt |
| `rig` Schwellen 10/25/50/100/250/500 | Training 0,05/0,10/0,15/0,20/0,25/0,30 | Meilensteinbonus ohne Verbraucher | jede erreichte Kante addiert einmal |
| `lunar` dieselben Schwellen | Training 0,09/0,18/0,27/0,36/0,45/0,54 | ohne Verbraucher | jede erreichte Kante einmal |
| `graph` | bestehender Bonus 0,20 (`BALANCE.breakthroughs.graph[1]`) | ohne Wirkung | B +0,20 |
| `trainingBoostUntil` | historischer aktiver ×2-Term, also Beitrag 1 | gespeicherter alter Boost ohne Wirkung | B +1 nur vor Ablauf, ausschließlich neuer Start |
| aktiver Overclock, Kanal `training` | vorhandener +100-%-Term = Beitrag 1 | ohne Wirkung | B +1 während Aktivität, ausschließlich neuer Start |

`no-items` unterdrückt weiterhin ausgerüstete Itembeiträge. `analysis7` hat aktuell keinen Trainings-Tertiäreffekt zu verstärken. Forschungsregister haben keinen ausschließlich Trainingsgeschwindigkeit versprechenden Effekt: `modelArchitecture`/`recursiveLearning` wirken bereits auf Model-/Revenue-Synergy und bleiben unverändert. `trainingPlan` ist Queue-Freischaltung, `labs5` Autopilot, `modelSynthesis` INT-Ertrag: keine Rabattquellen. Keine erfundenen Research-/Prestige-/Durchbruchboni, keine Softcap-/Compute-Familie als zusätzliches B.

## Reproduzierbare Vorher/Nachher-Messung

Messung mit echten `trainingPreview`/`startTraining`, Quality-Ziellevel 1, gleiche vorbereitete Zustände. 1e6 Data und Komponenten sind kurze Testvorbereitung, keine Progressionsmessung. Common-Photonenfeld regulär ausgerüstet; Verbesserung regulär bezahlt (Upgrade und Forge). Kombiniert: gleiches Item, Rig 25, Lunar 10 und Graph. Vorher gegen die originale Economy-Datei des Basiscommits, importiert mit lediglich angepassten relativen Modulpfaden; unveränderte Transaktionen. Nachher: `npx vite-node --script scripts/training-cost-comparison.ts` (Node 22). Vollständige gespeicherte Kostenbasis: [training-cost-comparison.json](training-cost-comparison.json).

| Zustand | Data vorher | Data nachher | B | Faktor | Dauer vorher/nachher (s) | Credits vorher/nachher |
|---|---|---|---|---|---|---|
| none | 1.500000000000000e+1 | 1.500000000000000e+1 | 0 | 1 | 90 | 0 |
| graph | 1.500000000000000e+1 | 1.300000000000000e+1 | 0.2 | 0.8333333333333334 | 90 | 0 |
| common-item | 1.500000000000000e+1 | 1.400000000000000e+1 | 0.08 | 0.9259259259259258 | 90 | 0 |
| upgraded-forged-item | 1.500000000000000e+1 | 1.400000000000000e+1 | 0.1215872 | 0.8915936273167169 | 90 | 0 |
| temporary-boost | 1.500000000000000e+1 | 8.000000000000000e+0 | 1 | 0.5 | 90 | 0 |
| combined | 1.500000000000000e+1 | 1.000000000000000e+1 | 0.526 | 0.655307994757536 | 90 | 0 |

Das verbesserte Photonenfeld bleibt bei Ziellevel 1 auf 14 Data: höherer echter Beitrag, aber keine sofortige gerundete Ersparnis. DE/EN-Itemvergleich zeigt diese Gleichheit und den 50-%-Deckel ausdrücklich. Kostenverbesserungen sind wieder bedienbar; feste Relay-/Archiv-Typbelohnungen bleiben unverändert gesperrt.

## Präzision, Prüfungen und Grenzen

ScientificNumber nutzt binäre Number-Mantissen (~15–16 signifikante Stellen) und ganzzahlige Exponenten, keine beliebig exakte Dezimalarithmetik. Die Basis und Rabattmultiplikation bleiben wissenschaftlich; nur kleine Ergebnisse werden für `ceil` projiziert. Ab Exponent 16 liegt Einerrundung unter der Darstellungspräzision; keine native Großzahl-Konvertierung für Bezahlentscheidungen. Ziellevel 1501 mit Guthaben 1e1000 wird regulär bezahlt, gespeichert und wissenschaftlich exportiert.

Kurze gezielte Suite mit 300-s-Limit: Trainingkosten, bestehendes Training, Itemmechaniken, Equipment, Core-Loop, gemeinsame Vorschauen, Export, Savevalidierung, Storage und DurableStorage: 140 Tests bestanden (4,06 Sekunden). Typecheck, Production-Build und `git diff --check` bestanden; Build mit Hinweis auf bestehenden Chunk über 500 kB (647,65 kB). Zusätzlich 6 Gem-Shop-Tests bestanden (0,64 Sekunden), einschließlich unveränderter bezahlter Trainingszeitverkürzung, sowie 2 gezielt ausgewählte Queue-/Prestige-Regressionen (0,54 Sekunden); die übrigen 3 fachfremden Tests dieser Datei nicht ausgewählt. Insgesamt 148 bestandene gezielte Tests. Prüfungen werden auf finalem Commit wiederholt.

Keine Gesamtsuite, FAST/DEEP oder Langzeitkampagne. `[skip ci]` verhindert den pauschalen CI-Gesamtlauf entsprechend der Auftragsgrenze. Bekannte Schicht-3-Referenzabweichungen und Langzeitbalance bleiben offen, unverändert und nicht bestätigt. Keine Änderungen an Data-Produktion, Hardwarepreisen, Research-Freischaltungen, Forschungszeiten, INT/Axiom-Kurven oder Relay-/Archiv-Skalierung. Export-ZIP, Datenschutz, Größenlimits, Abbruch und begrenzte Telemetrie bleiben erhalten; fehlende historische Kostenbasis wird nicht erfunden.
