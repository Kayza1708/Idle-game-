# Auftrag 9C – fünf fehlende Itemrezepte

Stand: 11. Oktober 2026. Ausschließlich `Kayza1708/Idle-game-`. Basis frisch gefetchtes `origin/main` **d7c4889fd49f8af5d1b9b71b53f89495d21bd3da**, gemergter PR #78, `864a60e` als Vorfahr geprüft. Neuer Branch `codex/9c-complete-item-recipes`, [Draft-PR #79](https://github.com/Kayza1708/Idle-game-/pull/79) gegen main, keine Vorgängerbranchänderungen und kein Merge.

## Vollständiger Katalog

Die bisherigen sechs IDs bleiben in Reihenfolge und sämtlichen Werten erhalten: `impulse-relay`, `quantum-chip`, `neural-asic`, `field-scanner`, `data-prism`, `insight-archive`. Die folgenden fünf stehen ausschließlich dahinter. Damit haben alle elf vorhandenen Itemtypen genau ein gültiges Common-Rezept.

| Neue ID / Name | Komponenten | Module | Data | Einmalige Lernfragmente | Sekunden | Einziger Common-Effekt nach Ausrüsten |
|---|---|---|---:|---:|---:|---|
| photonic-array / Photonenfeld | circuits 20, copperCoils 8, siliconWafers 12, photonicLenses 6 | computeBus 1 | 1200 | 6 | 900 | training |
| memory-crystal / Speicherkristall | circuits 16, siliconWafers 16, graphene 6, neuralCrystals 2 | dataLattice 1 | 1800 | 6 | 1200 | credits |
| logic-seed / Logik-Saat | circuits 12, siliconWafers 10, graphene 4, nanotubes 2, neuralCrystals 1 | dataLattice 1 | 1500 | 6 | 900 | training |
| tensor-core / Tensor-Kern | circuits 36, siliconWafers 20, titaniumBolts 12, graphene 6, nanotubes 4, superconductors 2 | computeBus 1, dataLattice 1 | 3000 | 8 | 1800 | compute |
| lab-drone / Labordrohne | circuits 24, copperCoils 12, titaniumBolts 16, photonicLenses 8, nanotubes 4, quantumCores 1 | computeBus 1, dataLattice 1 | 3600 | 10 | 1800 | research |

Alle fünf: **Forschungsdurchbruch „Offene Baupläne“ abgeschlossen**, Bauplan ausdrücklich einmal lernen, keine Credits, alle nicht genannten Komponenten 0. Pro Abschluss ein Common-Item mit Level 0 und effektivem Forge 0 (bestehender Instanzvertrag: fehlendes `forge` bedeutet 0). Die Singularformen neuralCrystal/quantumCore im Auftrag entsprechen den vorhandenen pluralen Inventar-IDs; keine neuen Komponententypen.

Diese Werte sind ein festgelegter Ausgangskatalog, **keine bestätigte Balance**. Keine Parametersuche oder Änderung bestehender Rezept-, Effekt-, Drop-, Modul- oder Economywerte.

## Integration, Besitz und Save

- `BALANCE.itemRecipes` bleibt die einzige Wertquelle. Das neue `research:'blueprints'` ist Voraussetzung, kein Bereichskauf und kein Besitzflag. `blueprintQuote` prüft diese Voraussetzung auch bei bereits gelerntem Rezept; `learnBlueprint` bleibt die atomare explizite Lernaktion.
- Bereichszugang allein erlaubt weder Lernen noch Crafting. Abgeschlossene Forschung erlaubt Lernen, ersetzt aber den bezahlten Bauplanbesitz nicht. Vorhandene sechs Rezeptvoraussetzungen unverändert.
- `craftingRecipe`, `craftingAffordability`, atomare Reservierung und `settleCrafting` bleiben die vorhandenen generischen Pfade. Keine Sonderaktion pro Item. Mehrfachaufträge reservieren die gesamte Menge einmal; Queues und Planer kaufen keine Baupläne automatisch.
- Queue, Werkbankplaner, Zielauswahl, Savevalidierung und Export leiten IDs aus dem erweiterten Katalog ab. Angeheftete Rezeptziele verwenden jetzt die tatsächliche gemeinsame Craftingquote statt einer unvollständigen Summe ohne Module/Zugang; ein ungelehrtes oder forschungsgesperrtes Rezept wird nicht als bereit bezeichnet.
- Save bleibt Version 42: aktuelle Besitzlisten müssen die neuen IDs nicht enthalten. Ein Fund lernt keinen Bauplan. Die bestehende Altbesitz-Migration löst belegte Inventaritems und Aufträge über **alle elf** `recipeIds` auf; Instanzen, Fragmente und historische Reservierungen werden nicht umgeschrieben. Kein zusätzlicher Migrationszuschuss.
- Hauptspiel und Challenge behalten getrennte Lernlisten/Migration. Unbekannte Besitz-, Ziel-, Planer- und Auftrags-IDs werden weiterhin abgewiesen; geschützte Load-/Importregeln bleiben bestehen.
- Bestehende ItemArt-Zuordnungen und responsive `RecipeIngredient`-Karten aus #78 unverändert. DE/EN zeigen Forschungsbedingung, dauerhaften Besitz, Einmalpreis auch bei Sperre/nach Lernen, vollständige Zutaten/Bestand/Bedarf/Fehlmengen, Module, Data, Dauer, Common/Level/Forge und den tatsächlich vorhandenen Common-Effekt. Effekte sind ausdrücklich an Ausrüsten gebunden; keine Rare-/Legendary-Zusatzeffekte im Common-Ergebnis.

## Tatsächlich implementierte Beschaffungsquellen

Alle zehn benötigten Komponenten haben positive Gewichte in den **ausgeführten** Pfaden `experiments.ts::componentGrant`/`completeExperiment` und `inventory.ts::claimLootDrop`. Hardwareanalyse, Architekturstudie und Artefaktsuche verlangen entdeckten Einplatinencomputer, freien Analyseslot und ihre bestehenden Data-Kosten. Aktive Weltdrops werden in `simulation.ts` erzeugt und am AI-Kern regulär eingesammelt. Gewichte sind relative Ziehungsgewichte, keine garantierten Mengen oder Zeitangaben.

| Komponente | Hardwareanalyse | Architekturstudie | Artefaktsuche | Aktiver Weltdrop | Passive Hardwarequelle ab entdeckten Klassen |
|---|---:|---:|---:|---:|---:|
| circuits | 450000 | 180000 | 80000 | 450000 | 1 |
| copperCoils | 300000 | 160000 | 70000 | 300000 | 2 |
| siliconWafers | 140000 | 190000 | 90000 | 140000 | 3 |
| titaniumBolts | 70000 | 130000 | 80000 | 70000 | 4 |
| photonicLenses | 25000 | 90000 | 100000 | 25000 | 5 |
| graphene | 9000 | 55000 | 110000 | 9000 | 6 |
| nanotubes | 4000 | 24000 | 70000 | 4000 | 7 |
| superconductors | 1500 | 9000 | 30000 | 1500 | 8 |
| neuralCrystals | 450 | 1800 | 9000 | 450 | 9 |
| quantumCores | 50 | 200 | 1000 | 50 | 10 |

Passive Ziehungen laufen aktiv/offline über `economy.ts::passiveComponentWeights`/`rollPassiveComponent` und `simulation.ts`. Anders als Analysen/Weltdrops ist dabei zunächst nur der nach entdeckten Hardwareklassen begrenzte Komponentenpräfix verfügbar. Weitere tatsächliche Grants: Titanlegierung bei Hardwaremeilensteinen, photonische Linsen bei Gaming-GPU-Meilensteinen, Graphen-Garantie mit Analyse-III. Diese Sonderquellen ersetzen keine Jackpot-Garantie für Kristalle/Kerne.

Module besitzen die vorhandenen regulären Rezepte (Offene Baupläne abgeschlossen, jeweils 60 s): Compute Bus kostet circuits 10, copperCoils 6, siliconWafers 4, titaniumBolts 4 und 250 Data; Data Lattice kostet graphene 6, nanotubes 3, photonicLenses 4, circuits 8 und 500 Data. Data stammt tatsächlich aus bestehender Hardware-/Nutzerproduktion (`dataRateScientific` und `simulation.ts`); Lernfragmente aus abgeschlossenen Hardwareanalysen/Artefaktsuchen (`completeExperiment`), mit bestehender Kurzlauf-/Restmengenlogik.

**Quellenlücken:** keine fehlende oder unimplementierte Quelle für die benötigten Zutaten, Module, Data oder Lernfragmente gefunden. Sehr kleine Gewichte für Neuralkristalle/Quantenkerne sind eine offene Beschaffungs-/Balancefrage. Keine Zuschüsse im Spielcode, keine Aussage über natürliche Erreichbarkeit.

## Kurzer technischer Nachweis

`scripts/item-recipes-proof.ts` bereitet pro Rezept ausdrücklich Rohkomponenten, Data (einschließlich bestehender Modulkosten und 100 Data Testreserve), Fragmente und Forschungsabschluss vor. Danach ausschließlich regulär: `learnBlueprint` → `craftModule`/`settleCrafting` → `craft` → Save/Reload → zeitlicher Abschluss → weiterer Reload. Der Testreserve werden keine neuen Spielquellen hinzugefügt. Produktionscode enthält keine Fixture-Zuschüsse.

Alle fünf gelernt (insgesamt **36 Fragmente**), benötigte Module selbst bezahlt/hergestellt (3 Compute Bus, 4 Data Lattice), fünf Itemherstellungen bezahlt (**11100 Data**, zusätzlich **2750 Data** für Module) und je genau ein korrektes Common-Item abgeschlossen. Fragmente werden bei der Herstellung nicht nochmals reserviert. Folgeherstellung, Mehrfachmengen, Mangel/konkurrierende Starts und partielle Reload-Abschlüsse sind separat getestet. Das bestehende ScientificNumber-Ledger behält seine Mantissenpräzision; technische Vergleiche berücksichtigen vorhandene Rundungsreste, ohne Preise oder Ledgerregeln zu ändern.

Maschinenlesbarer Nachweis: item-recipes-proof.json (historischer Nachweis: Git-Historie vor Bereinigung). Dies ist ausdrücklich ein **vorbereiteter technischer Nachweis**, keine natürliche Progressionssimulation.

## Prüfungen

- `timeout 300 npm test -- src/completeItemRecipes.test.ts src/blueprints.test.ts src/atomicCrafting.test.ts src/crafting.test.ts src/saveValidation.test.ts src/recipeIngredient.test.tsx src/itemEconomy.test.ts src/specialItems.test.ts src/balanceExportContracts.test.ts src/researchAreas.test.tsx`: **174 Tests in 10 Dateien bestanden, 8,28 s**. Unabhängige 9C-Akzeptanzwerte, elf eindeutige gültige Rezepte, alle fünf Lern-/Mangel-/Mengen-/Reload-/Planer-/Export-/Migrationsfälle. Referenzfixtures der alten sechs Rezepte und sämtlicher Itemeffekte wurden aus dem gefetchten `origin/main` d7c4889 erzeugt; Vergleich aller elf Typen, sechs Seltenheiten, Basis- und fortgeschrittenen Zustände. Zwei alte `itemEconomy`-Tests hatten noch den Vor-9B-Vertrag; jetzt ausdrückliches Lernen bzw. getrennte Lern-/Herstellungsquote.
- Typecheck und Production-Build bestanden. Bekannte Vite-Warnung für Bundle >500 kB bleibt offen. `git diff --check` bestanden.
- Technischer Nachweis: `timeout 300 node_modules/.bin/vite-node --script scripts/item-recipes-proof.ts docs/item-recipes-proof.json` bestanden.
- Browser: `timeout 300 python scripts/browser-item-recipes.py http://127.0.0.1:5179 docs/screenshots/item-recipes`. Chromium **390×844 DE/EN** (letzter Lauf 37,87 s), elf Karten, alle fünf neuen Forschungssperren, je fünf echte bestätigte Lernaktionen, je ein tatsächlicher Craft-Klick mit geprüfter Reservierung und regulärem Abschluss über beschleunigte Browserzeit; weiterer Reload ohne Duplikat. 732 Zutaten-Geometrieprüfungen in gesperrtem/gelerntem/abgeschlossenem Zustand. Keine horizontale Seitenüberbreite oder abgeschnittenen Zutaten. Nur für vollständige Kartenscreenshots wird die Aufnahmehöhe vorübergehend vergrößert; alle Aktionen/Geometrieprüfungen erfolgen bei 390×844. Vollständige neue Kartenscreenshots, Aktionsscreenshots und Messprotokoll (historischer Nachweis: Git-Historie vor Bereinigung) enthalten. Vorbereitete Testressourcen/Forschungsabschluss, keine natürliche Erreichbarkeit.
- Keine Gesamtsuite, FAST/DEEP oder Monatskampagne. **Abweichung offen dokumentiert:** Ein früherer erweiterter Testlauf nahm versehentlich `balanceReport.test.ts` mit auf und führte dessen bestehende 0,34-/1-Tages-Simulationsunit-Tests aus (gesamter Lauf 19,56 s). Das widersprach der gewünschten Kampagnenbegrenzung, wurde dem Nutzer gemeldet und ist im abschließenden gezielten Lauf ausgeschlossen. Kein eigenständiger Kampagnenauftrag oder Parameteroptimierung.

## Offen

Natürliche Beschaffungszeiten, Jackpot-Bedarf, Rezeptkosten und Herstellungszeiten sind **nicht balanciert oder als natürlich erreichbar bestätigt**. Bekannte Bundlewarnung und frühere Langzeit-/Schicht-3-Grenzen bleiben unverändert. Draft-PR nur zur Prüfung, nicht mergen.
