# Auftrag 9D – wirksame Item-Builds

Stand: 11. Oktober 2026. Basis frisch gefetchtes `origin/main` **7b265cb**, gemergter PR #79. Neuer Branch `codex/9d-effective-item-builds`; Vorgängerbranches unverändert, kein Merge. Draft-PR gegen main wird unten verlinkt.

## Vertrag und Integration

`BALANCE.itemCombinations` ist das zentrale Register mit stabilen IDs. Die reine `itemCombinationQuote` liefert Anforderungen, fehlende Ausrüstung, aktiv/deaktiviert und tatsächlichen Beitrag. Domain, Produktionszerlegung, Equipment-Dialog und Economy-Export verwenden dieselbe Quote.

| ID | Tatsächlich benötigte Ausrüstung | Zusätzlicher Beitrag |
| --- | --- | --- |
| `parallel-architecture` | processor: quantum-chip; core: tensor-core | ×1,20 einmal auf die gesamte reguläre Compute-Produktion |
| `learning-pipeline` | processor: photonic-array; core: logic-seed | +0,50 zur Trainingskostensumme B |
| `material-mapping` | research: field-scanner; core: memory-crystal | floor(n ×1,25) je positiver garantierter Komponenten-Endmenge |

Beide existierenden Instanzen müssen in kompatiblen, geöffneten Slots ausgerüstet sein. Inventarbesitz genügt nicht. Common genügt, Seltenheit/Level/Forge ändern nur bestehende Einzelwirkungen. Jede Kombination wirkt einmal; keine rekursive Berechnung. No-Items deaktiviert die drei neuen Beiträge. Hauptspiel und Challenge werden getrennt ausgewertet. Keine zusätzlichen Slots, Zuschüsse oder automatische Ausrüstung im Spiel.

Die bestehenden effektbasierten Kombinationen stehen ebenfalls im Register und im Dialog: `compute-credit-link` unverändert +0,08 zur Credit-Itemfamilie, `training-research-link` unverändert +0,12 zur Forschungs-Itemfamilie. Ihr ursprüngliches Profilmatching bleibt erhalten, einschließlich eines Rare-Items mit beiden passenden Effekten. Die bisherigen No-Items-Semantiken dieser alten Beiträge wurden nicht umgeschrieben.

Compute enthält einen zusätzlichen Faktor im vorhandenen Produkt, keinen direkten Credit- oder Data-Faktor. Users und Credits folgen den vorhandenen Funktionen. Data kann über die vorhandene Users-Abhängigkeit indirekt steigen. Kein Doppelbonus in Creditfamilie oder Data-Bonussumme.

Training verwendet weiterhin `max(0.5, 1/(1+B))` und die vorhandene wissenschaftliche Aufrundung. Der Vergleich entfernt ausschließlich den neuen B-Beitrag und behält Einzelwirkungen. Bereits gestartete Kosten/Dauer bleiben unverändert. Der Dialog zeigt beide Tracks, gerundete Preise und den erreichten Deckel, aus dem unveränderten zentralen Deckelwert abgeleitet.

Analysen speichern `combinationFactor` bei jedem tatsächlichen Start, auch über den vorhandenen Planer/Queuepfad. Abschluss verwendet ausschließlich den gespeicherten Faktor. Alte Aufträge ohne Feld erhalten 1. Saveversion bleibt 42; explizite Werte außer 1/1,25 werden abgelehnt. Reload/Offlineabschluss vergütet einmal. Legacy-Introaufträge werden weiterhin ohne Belohnung beendet.

Das bisher garantierte Komponentenbudget wird mit unveränderten Ziehungen auf Komponentenarten verteilt; anschließend bleibt die vorhandene Rare-Garantie erhalten. Erst auf diese regulären Endmengen wird je Art der neue Faktor angewendet. Es gibt keine zusätzliche Ziehung, keine veränderte Zufallsfolge und keinen Faktor auf Fragmente, zufällige Itemfunde, passive Hardwarekomponenten oder Weltdrops. Bruchreste des regulären Budgets bleiben unverändert. Beispiel: 1/3/4/7 wird 1/3/5/8; kein Abrunden nur auf der Gesamtsumme.

## Tatsächlicher technischer Vergleich

Explizit vorbereitete identische Ressourcen-/Prestigezustände, Common Level 0/Forge 0. Slots werden im Nachweisskript regulär gekauft, Items durch bestehende Domainfunktion angelegt und regulär ausgerüstet. Produktion, Training und Analyse verwenden echte Domainfunktionen. **Keine natürliche Progressionsmessung und kein Nachweis der natürlichen Beschaffung oder Balance.**

Die Referenz ohne neue Kombination stammt aus den tatsächlichen Economy-/Analysefunktionen von main 7b265cb auf demselben vorbereiteten Zustand, nicht aus einer rückwärts berechneten Rate. Referenz: `src/testSupport/itemBuildsBaseline.json`. Vergleich: [item-builds-proof.json](item-builds-proof.json), Reproduktion `npx vite-node --script scripts/item-builds-proof.ts work/item-builds-proof.json`.

| Vergleich, vorhandene Einzelwirkungen beibehalten | Ohne neuen Beitrag | Mit neuem Beitrag |
| --- | ---: | ---: |
| Compute/s, Quantenchip + Tensor-Kern | 1,42229208 | 1,706750496 |
| Users/s, dieselben Instanzen | 1,4917125182 | 1,7900550218 |
| Credits/s, dieselben Instanzen | 5,6248017739 | 6,7497621287 |
| Data/s, bestehende indirekte Formel | 0,1221356835 | 0,1337929378 |
| Training B, Photonenfeld + Logik-Saat | 0,1696 | 0,6696 |
| Trainingsstart, gerundete Data | 13 | 9 |
| Trainingsstart mit bereits erreichtem 50-%-Deckel | 8 | 8 |
| Garantierte Schaltkreise, lange Hardwareanalyse, identische RNG-Folge | 45 | 56 |
| Bauplanfragmente derselben Analyse | 1 | 1 |

Der isolierte Compute-Beitrag beträgt exakt ×1,20. Reguläres Anlegen des zweiten Items verändert zusätzlich dessen ursprünglichen Einzelbeitrag: Quantenchip allein 1,31917104 → vollständige Kombination 1,706750496 Compute/s. Diese beiden Vergleiche werden im Rohbericht getrennt ausgewiesen.

Tatsächlicher Trainingsauftrag speichert 9 Data und unverändert 90 Sekunden Arbeit. Ledgerdifferenz 8,999999999925734 entspricht der bestehenden Binary64-Subtraktionspräzision bei 1 Mio. vorbereiteten Data; Quote und gespeicherte wissenschaftliche Kosten stimmen überein. Kein neuer Rundungspfad. Ablegen verändert den laufenden Auftrag nicht. Analysefaktor 1,25 bleibt nach Ablegen/Reload erhalten, offline 56 Schaltkreise, erneuter Abschluss vergütet nichts.

## Gezielte Prüfung

Nur gezielter Vitestlauf, jede Ausführung unter fünf Minuten:

```sh
timeout 300 npm test -- src/itemCombinations.test.tsx src/trainingCosts.test.ts src/analysis.test.ts src/equipmentDialog.test.ts src/coreLoop.test.ts src/specialItems.test.ts src/completeItemRecipes.test.ts src/saveValidation.test.ts src/balanceExportContracts.test.ts
npm run typecheck
npm run build
git diff --check
```

152 Tests bestehen (abschließender Lauf: 21,94 s). Abgedeckt: passende/falsche/fehlende Ausrüstung, Inventar allein, No-Items, feste Werte trotz Verbesserungen; Compute/Core Loop ohne direkten Doppelbonus; beide Trainingsquotes/Abzug/Deckel/laufende Dauer; alle drei Analysearten, Rundung, gespeicherter Faktor, Ausrüstungswechsel, Reload/Offline/einmaliger Abschluss, alte Aufträge und Saveablehnung; tatsächlicher zufälliger Itemfund, passive Komponenten/Weltdrops unverändert; getrennte Challengequotes/Export; bestehende Einzel-/Kombinationseffekte und alle bisherigen BALANCE-Werte.

Der SHA-256 der JSON-serialisierten ursprünglichen BALANCE-Werte (neues Register ausgeschlossen) ist unverändert: `6c692caa268841af8a610dca7def0281d3715c5cf444bf3e2a812837e123e00f`. Rezepte, Preise, Hardwarekurven, Research-, Prestige- und Axiomparameter unverändert.

Browser: `scripts/browser-item-builds.py` (47,37 s), 390×844, DE/EN, sechs Kombination-/Sprachfälle, echte Ausrüstungsklicks, zunächst unvollständig und danach aktiv, tatsächlicher Trainingsstart für 9 Data in beiden Sprachen sowie separate Deckelzustände 8→8. Alle fünf Karten pro Ansicht geometrisch geprüft: Text innerhalb der Karten, kein horizontaler Seitenoverflow, keine Pageerrors. [Protokoll und 16 Screenshots](screenshots/item-builds/results.json). Die Screenshots warten nach dem Scrollen auf eine stabile Darstellung; eine zunächst direkt nach dem Scrollen abgeschnittene Anfangsbeschriftung ist in den finalen Aufnahmen vollständig. Keine unbelegte DOM-Overflow-Ursache behauptet.

Typecheck/Build/Diffcheck bestehen. Die bestehende Vite-Warnung zum großen Bundle bleibt. Keine Gesamtsuite, FAST/DEEP oder Tages-/Monatskampagne. Commits mit `[skip ci]` vermeiden die pauschale CI-Gesamtsuite.

## Offene Bewertung

Die vorgegebenen festen Beiträge sind implementiert, nicht kalibriert. Kombinationen können sich mit bisherigen Einzel-, Forschungs- und Progressionswirkungen überlagern; Trainingsrundung/Deckel und per-Art-Materialrundung begrenzen sichtbaren Nutzen. Natürliche Erreichbarkeit, Langzeit-/Axiombalance und bekannte Schicht-3-Referenzabweichungen bleiben offen. Keine zusätzlichen Beschaffungsquellen eingebaut.
