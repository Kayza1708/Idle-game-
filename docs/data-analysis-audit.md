# Auftrag 3 — Data und Analyseverträge

## Grundlage und Abhängigkeit

Frisch gefetchtes `origin/main`: `99c10eec1c5fbcc5417186d671e7d3747ba178ec`. PR #82 war bei Beginn **offen, nicht integriert**. Dieser Auftrag verwendet gemäß Vorgabe dessen finalen Head `d8d5a29605a7e2d92bbe7dc16ba8f1f59c5e24a9` als abhängige Grundlage. Branch `codex/data-analysis-contracts`; Draft gegen `main`, abhängig von [PR #82](https://github.com/Kayza1708/Idle-game-/pull/82). Keine automatische Integration, keine Veränderung der Vorgängerbranches.

## Data: Vorher / Nachher

Vorher: `1 + 4B/(B+4)`, explizite Obergrenze `4.999999999999999`.
Nachher: `1 + B` für `B <= 4`; sonst `5 + sqrt(4(B-4))`. Stetig, monoton, unbeschränkt. ScientificNumber-Vergleich, Addition, Subtraktion, Multiplikation und Wurzel; keine native Konvertierung für Produktion oder wirtschaftliche Entscheidungen.

| B | Vorher | Nachher |
|---|---:|---:|
| 0 | 1 | 1 |
| 0,25 | 1,235294 | 1,25 |
| 1 | 1,8 | 2 |
| 4 | 3 | 5 |
| 10 | 3,857143 | 9,898979 |
| 100 | 4,846154 | 24,595918 |
| 1e1000 | unter 5 | ungefähr 2e500 |

`dataProductionQuote`: Grundrate `0.1 sqrt(Users)`, alle ursprünglichen Quellen, rohe Summe, angewendeter Faktor, Challenge-Faktor und Data/s. `dataRateScientific`, Produktionsdetails/Export und tatsächliche Kauf-/Item-/Research-Vergleiche verwenden diesen Pfad. Quellen bleiben Meilensteine, dataGeneration, syntheticData, Meilensteinsynergie, höchster Datenarchiv-I–III-Beitrag, vorhandene tiefe Archivbeiträge, ausgerüstete Items nach unveränderter Synergiepotenz und Modellsynergie. Data-Crunch bleibt ×0,1. Keine neue Quellenmultiplikation.

Archiv I–III ersetzt den niedrigeren Beitrag: +0,25 / +0,60 / +1,25 zu B. Die bestehenden Erweiterungsbeiträge VI–VIII bleiben +1,5 / +2,5 / +4 innerhalb der bisherigen additiven Erweiterungssumme. Die DE/EN-Texte nennen diese Beiträge statt fiktiver unabhängiger Data-Multiplikatoren. Vorschauen nennen Data/s vorher/nachher und relativen Zuwachs, einschließlich Verringerung beim Itemwechsel und Hinweis auf gleiche gerundete Anzeige. Trainingsfaktor bleibt `max(0.5,1/(1+B))`, vorhandene UI erklärt ausdrücklich maximal 50 % vor Aufrundung.

Credit-/User-Formeln bleiben unverändert. Durch mehr produzierte Lifetime-Data kann die vorhandene Credit-Synergie innerhalb eines Intervalls stärker wachsen. Die Großzahl-Regression prüft deswegen den bestehenden wissenschaftlich integrierten Mittelwert und setzt keine konstante Start-Creditrate voraus. Data-Integration ist zwischen Ereignissen konstant; Creditrate kann sich dabei verändern.

## Analyseverträge

| Typ | Kurz vorher → nachher | Lang vorher → nachher | Grunddauer kurz/lang | Kurzfaktor alt → neu |
|---|---:|---:|---:|---:|
| Hardware | 57.623 → 250 Data | 900 → 4.800 Data | 10 min / 4 h | 1/24 → 1/24 |
| Architektur | 300 → 500 Data | 3.600 → 6.400 Data | 30 min / 8 h | 1/24 → 1/16 |
| Artefakte | 1.200 → 2.000 Data | 14.400 → 19.200 Data | 2 h / 24 h | 1/24 → 1/12 |

Langkosten sind exakt 80 % von zeitlich äquivalenten Kurzaufträgen. Datenpipeline folgt separat: `ceil(Basispreis ×0.8)`, also kurz/lang Hardware 200/3.840, Architektur 400/5.120, Artefakte 1.600/15.360. Keine Creditkosten; unabhängiger Slot bleibt unverändert.

Die lange Basis bleibt Hardware 45 Komponenten/1 Bauplanfragment, Architektur 20 Komponenten/2 Forschungsfragmente, Artefakte 20 Komponenten/2 Bauplanfragmente/6 % Itemwurfchance. Der Kurzfaktor gilt für alle vier Basisgrößen. Er benutzt Grunddauern **vor** Geschwindigkeitsboni. Keine neue RNG-Probe: ein Wurf je ausgegebener ganzer Komponente; vorhandener Itemwurf nur, wenn seine Chance positiv ist. Gewichte, Itemseltenheiten und Pity bleiben erhalten.

`analysisQuote` liefert Zugang, Slot, Sperrgrund, wissenschaftliche Fehlmenge, Kosten, reguläre/startbezogene Dauer, Grundbelohnungen und deren Restbuchung, Möglichkeiten und zusätzliche Effekte. Domain, UI und Export verwenden sie. `analysisRewardQuote` berechnet dieselben ganzzahligen und fraktionalen Ergebnisse für Vorschau und Abschluss. Mengenboni werden genau einmal angewendet; bestehende globale Analyse-Reste bleiben erhalten.

**Zusätzliche Effekte getrennt:** Analyse III garantiert weiterhin mindestens eine seltene Komponente. Falls die regulären Materialwürfe keine enthalten, ergänzt der bestehende Pfad genau ein Graphen. Das ist keine Grundbelohnung und wird weder nach Grunddauer neu kalibriert noch entfernt. Materialkartierung bleibt der gespeicherte Startfaktor; der vorhandene Abschluss rundet je positive finale Komponentenmenge ab. Konkrete Materialtypen sind Wahrscheinlichkeiten, keine garantierten Funde. Kleine Chancen werden mit drei signifikanten Stellen angezeigt, damit seltene Quellen nicht als 0,0 % erscheinen.

Neue Starts speichern `contractVersion:2`, den Grundbelohnungsfaktor, bezahlte Kosten und Startdauer/Endzeit. Save 45 migriert historische Aufträge auf `contractVersion:1`, kurz 1/24/lang 1; Kosten und Zeitpunkte bleiben identisch. Hauptspiel und gespeichertes Hauptspiel einer Challenge werden unabhängig migriert. Alte Training-/Research-/Crafting-Aufträge bleiben unverändert. Aktuelle fehlende, unbekannte oder widersprüchliche Verträge werden abgewiesen. Bestehende Import-/Backup-/Datenschutz-/Größen-/Abbruchschutzregeln bleiben erhalten.

Der Forschungsdirektor wurde nicht verändert: jeder nächste Start prüft den tatsächlichen aktuellen Bestand, Budget, Reserve und Priorität erneut. Wartende Aufträge reservieren keine Data. UI erklärt den gemeinsamen Bestand und dass die Reserve ausschließlich eine Direktorgrenze ist, keine Abbuchung oder globale Sperre.

## Frische Profile — tatsächliche Messung

Rohwerte und Entscheidungen: `data-analysis-proof.json`, reproduzierbar mit `scripts/data-analysis-proof.ts`. Gemeinsamer Early-Game-Helfer `prepareEarlyHardwareDecision` besitzt eine optionale Auftrag-3-Priorität; seine ursprüngliche Standardstrategie bleibt unverändert. Zwei Profile: `newGame`, 50 reguläre Startcredits, null Hardware, exakt eine reale Tapaktion pro aktiver Sekunde, insgesamt 5.400 Taps, Entscheidungen alle zehn Sekunden, RNG=0,5. Keine Grants, Claims, vorbereiteten Items, gesammelten Weltdrops, Offline-Vorlauf oder Resets.

Hardwarestrategie A kauft pro Entscheidung höchstens eine Einheit nach maximalem marginalem Credit/s pro Credit. Modell zuerst prüft einmal Training (abwechselnd Q/E), dann einmal Forschung (dataGeneration bis 2, danach modelArchitecture bis 1), dann den ersten kurzen Hardwareauftrag. Analyse zuerst spart bis zur entdeckten SBC und 250 Data für diesen ersten Auftrag; anschließend gilt dieselbe Modell-/Forschungsfolge. Keine automatische zweite Analyse. Crafting wird mangels erlerntem Rezept und Komponenten in dieser bewusst begrenzten Policy nicht gestartet; keine erfundene Erreichbarkeit dieser Familie.

| Tatsächliches Ergebnis nach höchstens 90 aktiven Minuten | Modell zuerst | Analyse zuerst |
|---|---:|---:|
| Erster Trainingsstart / Abschluss | 1:20 / 2:50 | 7:00 / 8:30 |
| Erste Forschung / Abschluss | 11:20 / 14:20 | 11:40 / 14:40 |
| Kurze Hardwareanalyse / Abschluss | 7:30 / 17:30 | 6:40 / 16:40 |
| Data/s am Ende | 376,945834 | 319,839727 |
| Erzeugte Data | 659.749,494180 | 573.775,495480 |
| Training ausgegeben | 4.562 | 3.414 |
| Forschung ausgegeben | 1.285 | 1.285 |
| Analyse ausgegeben | 250 | 250 |
| Herstellung ausgegeben | 0 | 0 |
| Data-Endbestand | 653.652,494180 | 568.826,495480 |
| Trainingsabschlüsse / Forschungsabschlüsse / Analyseabschlüsse | 16 / 3 / 1 | 15 / 3 / 1 |
| Entscheidungen mit Data-Mangel: Training / Forschung / Analyse / Herstellung | 17 / 102 / 75 / 124 | 9 / 115 / 81 / 137 |

**Erfüllt:** erste Forschung und kurze Hardwareanalyse erreichbar; frühe Prioritäts-/Warteentscheidungen real. **Nicht bestätigt:** dauerhaft knappe Data und Unbezahlbarkeit aller vier Familien. 439 bzw. 426 der 541 Entscheidungen haben genügend Data für die jeweils beobachteten drei nächsten Angebote; Forschungsziele und erste Analyse sind dann vielfach schon erfüllt. Das beweist keine gleichzeitige Zahlung und keine dauerhafte Strategie. Es zeigt aber erheblichen Überschuss unter dieser endlichen Policy. Ohne Craftingzugang und ohne länger laufende Alternativstrategie kann das vierte Konkurrenzziel nicht abgenommen werden. Keine Parameter wurden nach Messung angepasst.

Finale zwei Profilläufe zusammen 12.844 Sekunden. Einschließlich vorheriger Werkzeug-/Erfassungsdurchläufe (10,826 / 9,980 / 14,085 Sekunden) bleibt die gesamte Profilrechenzeit unter 60 Sekunden und dem gemeinsamen Fünf-Minuten-Budget. Der erste Durchlauf wurde wegen fehlerhafter Ereignisidentifikation verworfen: Telemetrie besitzt keine `id`; Referenzvergleich erfasst die tatsächlichen neuen Ereignisse. Danach wurde die Herstellungsquote samt Data- und Zutaten-/Bauplanmangel ergänzt, ohne Aktions-/Parameteränderung. Alle korrekten Durchläufe liefern identische Starts/Abschlüsse und Endbestände. Kein Tages-/Monatsprofil.

## Explizit vorbereitete Vergleichsquoten

Ein Taschenrechner, dataGeneration-Level 1/20/100, sonst frisches Modell: **keine natürliche spätere Progression**.

| Level | Data/s → nächstes Level | Relativer Gewinn | Faktor |
|---|---:|---:|---:|
| 1 | 0,125555 → 0,148155 | 18 % | 1,18 |
| 20 | 1,539039 → 1,644396 | 6,845668 % | 14,464256 |
| 100 | 836,296187 → 908,404311 | 8,622319 % | 7.859,712447 |

Die abnehmende Grenzwirkung bezieht sich auf zusätzliche Einheiten B; ein exponentiell wachsender Forschungsbeitrag kann trotzdem ähnlich hohe relative Produktionszuwächse erzeugen. Festgelegte Analysepreise stehen in jedem Vergleich. Keine Langzeitkalibrierung behauptet.

## Prüfungen und Grenzen

- Typecheck bestanden.
- 298 gezielte Regressionen in elf Dateien bestanden, 12,20 Sekunden; jeder Befehl `timeout 300`. Dateiliste unten und im kurzen CI-Zweig. Keine Gesamtsuite.
- Production-Build bestanden (5,10 Sekunden finaler Vite-Build, 105 Module); `git diff --check` bestanden. Bekannte Warnung: Hauptbundle über 500 kB (711,51 kB), keine unangeforderte Bundle-Umstellung.
- Chromium-Appprüfung 360/390/430 px × DE/EN: sechs Vertragskarten, echte Starts mit 250 Data und Pipeline-Architektur mit 400 Data, gespeicherter Faktor/Reload, Slot- und Mangelgründe, tatsächliche Data-Vorschau, Touchhöhen mindestens 44 px und keine gemessene horizontale Überbreite. Rohdaten `data-analysis-browser.json`; explizit vorbereitete Browserressourcen, keine Progressionsmessung.
- Protected-parameter Fixture vom abhängigen Head: alle Parameter außer sechs explizit festgelegten Analysepreisen und sechs korrigierten Archivtexten identisch, alle Itemdefinitionen identisch. Zusätzlich ursprüngliche technische Pfade, Director, Save/Challenges, Exportlimits und atomare Hardwarekäufe geprüft.
- ScientificNumber bleibt binary64-Mantisse (~15–16 signifikante Stellen), keine exakte Dezimalarithmetik. Relative Integrationsprüfungen 2e-10 wegen logarithmischer Potenzen bei sehr hohen Exponenten; einfache endliche Abzüge bis 1e-10 absolut. Fraktionale Analysebuchung verwendet die unveränderte 16-ULP-Normalisierung am Integer-Rand, die keine Gratisitemwürfe erzeugt.
- Keine offenen reproduzierten Vertragsfehler im geprüften Umfang. Natürliche langfristige Konkurrenz, vollständige Gesamtabnahme, reale Safari-/Native-Abnahme und bekannte Bundlegröße bleiben offen.

```sh
timeout 300 npm test -- src/dataAnalysisContracts.test.tsx src/analysis.test.ts src/training.test.ts src/researchIntegration.test.ts src/trainingCosts.test.ts src/technicalBugs.test.ts src/saveValidation.test.ts src/challengeIsolation.test.ts src/balanceExportContracts.test.ts src/durableStorage.test.ts src/purchaseMath.test.ts
npm run typecheck
npm run build
git diff --check
node_modules/.bin/vite-node --script scripts/data-analysis-proof.ts docs/data-analysis-proof.json
python scripts/browser-data-analysis.py /workspace/work/data-analysis/browser-final.json
```
