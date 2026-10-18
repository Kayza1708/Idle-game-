# Auftrag 4 — Item-Grind und Bauplan-Meisterschaft

## Ausgangsbasis und Quellenmatrix vor Implementierung

Frisch gefetchtes `origin/main`: `99c10ee`. PR #82 und #83 sind offen. Neuer Branch `codex/item-grind-mastery` auf finalem #83-Head `a1fe0a724d8ccfeef9cd5148ef160dc681812230`, abhängig von #83 und dessen Voraussetzung #82. Keine Vorgängeränderung, keine automatische Integration.

Primär/sekundär/tertiär folgen exakt `itemTypes` / `itemEffectProfile`; Common/Uncommon hat nur Primär, Rare/Epic zwei, Legendary/Mythic drei Kanäle. Verbesserung: nächste Seltenheit und Level +1, bestehende Data-/Schaltkreisformeln. Fusion: drei gleiche ungeschützte Typ-/Seltenheitsinstanzen → nächste Seltenheit, Level 0/Forge 0; Relais-Tapzähler ebenfalls 0. Forge: konkrete Instanz Forge +1, bisheriges Maximum 20 und bisherige Kosten.

| Item-ID | Equipment | kanonische Kanäle | bestehendes Rezept | Verbesserung / Fusion / Forge | neue Materialfamilie |
|---|---|---|---|---|---|
| impulse-relay | processor | relay / relay / relay | 12 Schaltkreise, 2 Kupferspulen, 0 Data, 0 Fragmente; Hardwareanalyse-Bauplan | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Kupferspulen → Supraleiter |
| insight-archive | research | int-yield / int-yield / int-yield | 100 Schaltkreise, 20 Wafer, 5 Kristalle; bestehender Archiv-Freischaltpfad | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Neuralkristalle → Quantenkerne |
| quantum-chip | processor | compute / tap / research | vollständiges vorhandenes Rezept, 4 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Siliziumwafer → Supraleiter |
| neural-asic | processor | credits / compute / tap | vorhandenes Rezept, 5 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Siliziumwafer → Supraleiter |
| photonic-array | processor | training / tap / credits | vorhandenes Rezept, Offene Baupläne, 6 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Photonische Linsen → Neuralkristalle |
| memory-crystal | core | credits / data / research | vorhandenes Rezept, Offene Baupläne, 6 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Siliziumwafer → Supraleiter |
| logic-seed | core | training / research / tap | vorhandenes Rezept, Offene Baupläne, 6 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Photonische Linsen → Neuralkristalle |
| tensor-core | core | compute / training / credits | vorhandenes Rezept, Offene Baupläne, 8 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Siliziumwafer → Supraleiter |
| field-scanner | research | experiment / drop / research | vorhandenes Rezept, 5 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Graphen → Quantenkerne |
| lab-drone | research | research / data / drop | vorhandenes Rezept, Offene Baupläne, 10 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Photonische Linsen → Neuralkristalle |
| data-prism | research | data / credits / research | vorhandenes Rezept, 5 Lernfragmente | nächste Seltenheit+Level / drei Duplikate / Forge≤20 | Photonische Linsen → Neuralkristalle |

Materialquellen laut tatsächlichen Verbrauchern: alle zehn Typen haben positive Gewichte in jeder regulären Hardware-/Architektur-/Artefaktanalyse; Zugang nach Entdeckung SBC, unabhängiger Slot, aktuelle Data-Kosten. Alle zehn haben positive Gewichte in manuell eingesammelten Weltdrops; Zufallschancen, keine Typgarantie. Schaltkreise zusätzlich passive Funde nach entdeckten Klassen, Salvage, vorhandene Quest-/Shop-/Ad-Grantpfade. Titanlegierung aus Hardwaremeilensteinen; photonische Linsen zusätzlich GPU-Meilensteine. `analysis3` ergänzt bei Bedarf Graphen als Seltenheitsgarantie. Seltene Familienmaterialien sind erreichbar als Chance nach SBC, besitzen keine zusätzliche harte Einzeltyp-Sperre; keine sichere ETA. Bestehende Hardwarequellen, Drops und alle Gewichte bleiben unverändert.

Befund: `rareComponentTypesOwned` zählt aktuell Graphen/Nanoröhrchen/Supraleiter/Neuralkristalle/Quantenkerne mit positivem **jetzigem** Bestand. `itemScalingMultiplier` verwendet diese Zahl für Datenprisma/Feldscanner. Diese vorhandene Sammlerwirkung wird auf belegte dauerhafte Entdeckung derselben fünf Typen umgestellt, ohne neuen Faktor oder Aufnahme photonischer Linsen in diese bestehende Fünfergruppe.

## Implementierter Vertrag

Zentrale, explizite Familien und Zielpreise in `BALANCE`; `itemImprovementPreview` liefert sämtliche Kosten/Fehlmengen, wissenschaftliche Data-Kosten und kanonische Beiträge vorher/nachher. `upgrade` prüft den aktuellen Bestand, bezahlt über denselben ScientificNumber-Ledger und alle Komponenten atomar. UI-Tickets verhindern doppelte Aufwertung einer veralteten Instanz. Die bisherigen Schaltkreis-/Dataformeln einschließlich Manufacturing-II-Rabatt bleiben unverändert; der Rabatt verändert die fest vorgegebenen neuen Familienmengen nicht. Forge/Fusion behalten Preise, Schutzregeln und Ergebnisformeln.

Meisterschaft 0–4 kostet inkrementell 10/25/60/150 Fragmente. `blueprintMasteryQuote` verlangt Zugang, nötigen gelernten Bauplan und regulären Herstellungsnachweis. Kaufen benötigt die erwartete Stufe; erneute alte Tickets bezahlen nichts. Zutaten werden je Exemplar `ceil(Basismenge × Faktor)` gerechnet und erst danach multipliziert. Data, Module, Zeit und andere Verbesserungspfade bleiben gleich. Reservierungen speichern die bezahlte Meisterschaft; spätere Käufe verändern weder laufende Aufträge noch Warteschlange/Erstattung. Recycling verwendet diese tatsächlichen Mengen. Beispiel: 20 Quantenchips bei Stufe 1 reservieren 580 Schaltkreise und erhalten bei vorhandenem Materialrecycling insgesamt 29 zurück, niemals die unreduzierte Basis. Beim kleinen Relais runden 12 Schaltkreise/2 Spulen bei Stufe 1 weiter auf 12/2; erst spätere Stufen senken einzelne Ganzzahlzutaten.

Manuelle Fragmentumwandlung verlangt alle drei tatsächlich erworbenen bestehenden Durchbrüche. Quote enthält vollständige Vorher-/Nachher-Bestände, Kosten, Menge und Revision. Domain prüft zusätzlich dieselben Bestände/Revision; wiederholte oder veraltete Tickets, Brüche, negative Mengen und Ganzzahlüberläufe werden abgewiesen.

Entdeckungen entstehen durch `grantComponents`; Vorschauen/Kaufangebote erzeugen keine Entdeckung. Dieselben bisherigen fünf seltenen Typen verstärken Datenprisma/Feldscanner mit derselben Formel. Ausgeben des letzten Exemplars senkt die Sammlung nicht. Meisterschaft, Lernbesitz und Herstellung bleiben bei beiden regulär ausgeführten Resets erhalten; frische Challenges beginnen separat ohne Hauptspielwissen.

Save 46: alte Meisterschaft 0 und Konvertierungsrevision 0, Entdeckung nur aus belegtem positivem Bestand/verlässlichen gespeicherten Entdeckungen. Reguläres Crafting wird nur aus expliziten kontextbezogenen `crafting_completed`-Ereignissen oder bereits abgeschlossenen Einheiten eines vorhandenen Auftrags nachgewiesen, niemals aus Itembesitz, Fusion oder allgemeinen Lifetime-Itemtypen. Historische Zähler beginnen konservativ bei einem belegten Exemplar pro Typ; sie rekonstruieren keine unbekannte Gesamtmenge. Alte Instanzen, Reservierungen, Ressourcen und Endzeiten bleiben erhalten. Aktuelle unbekannte IDs, widersprüchliche Stufen/Herstellungsnachweise und manipulierte Reservierungen werden abgelehnt; die vorhandene Import-/Recovery-Sperre bleibt bestehen.

DE/EN in vorhandenen Rezept-/Itemdetails: responsive Zutatenkarten, Quellen mit SBC-Voraussetzung, echte Kurz-/Langanalysequotes und Zufallschancen ohne erfundene ETA, vier Meisterschaften und genau ein angeheftetes Herstellungs-/Aufwertungs-/Meisterschaftsziel. Die erhaltene Instanz erscheint mit tatsächlicher Grafik, Seltenheit/Level/Forge und ihren vorhandenen Kanälen; zukünftige Beiträge werden ausdrücklich als Ausrüstungsbeiträge bezeichnet. Spezialitems verwenden ihren bisherigen kanonischen Text. Bestehende Sounds/Haptik bei erfolgreichen Aktionen; automatische und Offline-Ergebnisse sind gebündelt, Rückkehrberichte auf 100 sichtbare Gruppen begrenzt. Anzeigen vergeben keine Ressourcen.

Export je Kontext ergänzt dieselben reinen Meisterschafts-, Herstellungs-, Konvertierungs- und Effektquotes, Entdeckungen und tatsächlich erhaltene Ausgabenereignisse. Verbesserungsquotes sind auf 100 Instanzen begrenzt mit expliziter Auslassungszahl; die bisherigen Telemetrie-/Datenschutz-/Größen-/Abbruchgrenzen bleiben erhalten. Die Ausgabenhistorie ist ausdrücklich unvollständig, sobald Ereignisse verdrängt wurden. Keine neue automatische Übertragung.

## Begrenzte echte Spielerpfade

Genau zwei frische Profile, je 120 aktive Minuten; zusammen **36,160 Sekunden Rechenzeit**, Budget 300 Sekunden. Vollständige Parameter/Checkpoints/Bestände in item-grind-profiles.json (historischer Nachweis: Git-Historie vor Bereinigung), ausführbarer fester Pfad in `scripts/item-grind-proof.ts`. Beide starten mit regulären 50 Credits, null Hardware, identischem Seed 1708, einem echten Tap und maximal einem echten Weltdrop-Sammeln je Sekunde. Alle zehn Sekunden jede Aktionsfamilie höchstens einmal prüfen; gleiche Hardwareentscheidung nach marginalem Credit-Ertrag. Keine Grants, Belohnungsclaims, freien Freischaltungen, vorbereiteten Items, Resets oder Parametersuche.

| Messung | A: Training/Forschung zuerst | B: erste Analyse/Crafting zuerst |
|---|---:|---:|
| Erstes Training | 1:20 | 6:50 |
| Erste Kurzanalyse, Start → Ende | 7:30 → 17:30 | 6:30 → 16:30 |
| Relais, Start → Ende | 17:30 → 22:30 | 16:30 → 21:30 |
| Data regulär generiert | 2.001.699,896 | 1.896.365,124 |
| Data Training | 5.710 | 5.690 |
| Data Forschung | 2.604 | 2.604 |
| Data Analyse | 250 | 250 |
| Data Crafting | 0, bestehendes Relaisrezept | 0, bestehendes Relaisrezept |
| Bauplanfragmente / Meisterschaft | 0 / 0 | 0 / 0 |

Beide stellen exakt ein Relais regulär her und bestehen Reload. Für dieses erste Ziel fehlen am Ende keine Zutaten. Für Meisterschaft 1 fehlen weiterhin **10 Bauplanfragmente**: eine Hardware-Kurzanalyse vergibt mit dem bisherigen Bruchteilledger noch keinen ganzen Bauplanfragmentbestand. Die feste Strategie wiederholt Analysen nicht. Andere Rezepte verlangen weiterhin ihre Lernfragmente, Module und individuellen Zutaten. Relaisbesitz schaltet Ausrüstung vor Prestige nicht frei. Dieser eng begrenzte Pfad bestätigt weder Erreichbarkeit aller elf Builds noch langfristige Fragment-/Data-Knappheit oder Monatsbalance. Data-Ausgaben sind tatsächlich gemessene Ledgerverschiebungen; die wenigen nativen Summationsreste unter 1e-9 werden in der Tabelle gerundet, JSON bewahrt Rohwerte.

## Technischer Verbesserungsnachweis mit vorbereiteten Ressourcen

Browserfixture: ausdrücklich vorbereitete Komponenten/Data/Module, abgeschlossene Voraussetzung und ein regulär gelerntes, bezahltes und abgeschlossenes Quantenchip-Rezept. Kein natürlicher Spielerpfad. Die bezahlte Aufwertung Common Level 0 → Uncommon Level 1 kostet **81 Schaltkreise + 4 Siliziumwafer + 750 Data**. Im gleichen vorbereiteten Kontext steigt der kanonische Compute-Ausrüstungsbeitrag **0,084800 → 0,1150736** (+8,48 % → +11,50736 %); Common erhält keine Rare-Kanäle. Meisterschaft 1 bezahlt anschließend genau 10 Fragmente. Ein neuer Quantenchip reserviert 29 statt 30 Schaltkreise, unverändert 1 Compute-Bus/1.800 Data/300 s, und endet als Common Level 0/Forge 0. Reload bezahlt und vervielfacht nichts.

ScientificNumber-Grenzfixture `1e400` prüft gültigen wissenschaftlichen Ledger, denselben Subtraktionsoperator wie die Zahlung und endliche begrenzte Anzeige. Eine Ausgabe von 750 liegt bei `1e400` unter der vorhandenen Mantissenauflösung; der Test behauptet deshalb keine nativ messbare Differenz dort. Bei gewöhnlichen vorbereiteten Beständen werden echte Kosten/Bestandsdifferenzen geprüft. Die bestehende Zahlenrepräsentation und Economyformeln werden nicht verändert.

## Quellen und offene Punkte

Alle benötigten Familienkomponenten besitzen tatsächlich implementierte Analyse-/Weltdropquellen; keine Quellenlücke, kein Ersatzgrant eingebaut. Der vorhandene Komponentenatlas v2 hat zehn passende Motive; alle elf Itemtypen behalten ihre vorhandenen v1/v2-/Spezialgrafiken. Für diese Erweiterung fehlt kein benötigtes Motiv. Feste Preise/Meisterschaften sind der beauftragte Ausgangskatalog, keine bestätigte langfristige Balance. Mehrere seltene Materialmengen bleiben zufallsabhängig; keine garantierte ETA. Data ist am Ende beider begrenzten Profile reichlich vorhanden, eine langfristige Data-Knappheit wird ausdrücklich nicht behauptet. Bestehende Vite-Warnung über den großen Hauptchunk bleibt offen.

## Tatsächlich ausgeführte Abnahme

- `timeout 300 npx vitest run --maxWorkers=2` mit `itemGrind`, `atomicCrafting`, `crafting`, `blueprints`, `specialItems`, `itemEconomy`, `itemCombinations`, `saveValidation`, `challengeIsolation`, `balanceExportContracts`, `dataAnalysisContracts`, `audio`, `RewardFeedback`, `returnOverview`, `durableStorage`, `storage`: **280 Tests in 16 Dateien**, vollständig grün, letzter gemeinsamer Lauf 11,33 s. Neue Tests prüfen auch wirklich erhöhte Prestige-/Axiom-Resetzähler, verschiedene reduzierte alte/neue Reservierungen und rekonstruierte v15-Bestände. Gezielte Export-/Rückerstattungsnachprüfung nach der letzten Exportergänzung ebenfalls grün.
- `npm run typecheck`, `timeout 300 npm run build`, `git diff --check`: bestanden. Build enthält den aktuellen Typecheck; Vite meldet die bestehende Hauptchunkgröße, keinen Buildfehler.
- `timeout 300 python3 scripts/browser-item-grind.py …`: **360/390/430 px jeweils DE/EN**, sechs vollständig bestandene echte UI-Aufwertungen, Meisterschaftskäufe und nachfolgende Crafting-Aufträge. Alle Ressourcenabbuchungen aus Quotes bestätigt; reservierter Auftrag nach Reload gleich, Abschluss und weiteres Reload genau einmal. Quellenkarte öffnet oberhalb des vorherigen Itemdialogs; empfangene Instanz sichtbar und schließbar. Neue Meisterschaftsbuttons jeweils 44 px. Zutatenkarten/Seite ohne Überbreite, keine Laufzeitfehler. Strukturiertes Browserprotokoll (historischer Nachweis: Git-Historie vor Bereinigung).
- `timeout 300 npx vite-node --script scripts/item-grind-proof.ts docs/item-grind-profiles.json`: nur die oben beschriebenen zwei Profile, keine Gesamtsuite, FAST/DEEP-, Tages- oder Monatskampagne.

Die neue Branch erhält ausschließlich den kurzen betroffenen CI-Testpfad, keine pauschale Test-Suite oder manuell ausgelösten Langzeitjobs. Frühere branchspezifische Checks bleiben bestehen. Abschließend erneut gefetchtes main bleibt `99c10ee`; #82/#83 weiterhin offen mit denselben Heads. Draft-Abhängigkeit bleibt nötig.

Implementierungscommit `23659632f4de6ba74aee92f877db81984f4dcc48`; [Draft-PR #84 gegen main](https://github.com/Kayza1708/Idle-game-/pull/84), ausdrücklich abhängig von #83/#82, nicht gemergt. [Kurzer CI-Lauf am Implementierungscommit](https://github.com/Kayza1708/Idle-game-/actions/runs/38168156866) erfolgreich.
