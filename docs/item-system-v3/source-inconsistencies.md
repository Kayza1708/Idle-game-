# Konkrete Bestandswidersprüche vor vollständiger V3-Freigabe

Diese Liste ist keine vollständige Migration und kein Grund, unabhängige Arbeit anzuhalten. Aktuelle Funktionen, tatsächliche UI-Aktionen und gemeinsame Referenzen werden gegen Kommentare/alte Berichte geprüft; keine erfundenen Ersatzpreise.

## Klassenupgrade

`src/economy.ts` nennt die alten Klassenupgradefelder in einem Kommentar „migration-only; no new ×2 purchase is offered“. Das tatsächliche Verhalten ist anders: `HardwareMaterialDetails` in `src/ProgressionDetails.tsx` wird aus `HardwareStore` eingebunden, zeigt nach50Einheiten eine Kaufaktion und `src/App.tsx` führt `buyClassUpgrade` aus. Reiner TS-Domaintest bestätigt die bezahlte Transaktion und das zusätzliche50er-Paket. Der bestehende native Audit hat dagegen bewusst nur erhaltene alte ×2-Wirkungen als portiert dokumentiert; ein entsprechender neuer nativer Kaufverbraucher wurde nicht gefunden.

Für den Komponenten-Zähler ist der tatsächliche TS-Kauf explizit markiert, allgemeine Zuschüsse/Rückgewinnungen bleiben ausgeschlossen. Der native Receipt-Typ kennt diese Quelle, besitzt aber damit noch keine neue Kaufaktion. Vor vollständiger V3-/Spielerfreigabe den tatsächlichen Erwerbs-/Kosten-/Resetvertrag und seine native Erreichbarkeit abschließen; kein Haken allein wegen des vorhandenen Legacyfaktors. Preise bleiben bis dahin unverändert. Dies ist keine belegte externe Plattformblockade.

## Archiv und alte Diagnoselisten

V3-Archivlernen/-Herstellung nutzt inzwischen das vorhandene I04-/Legacyrecht; atomare Original-/Webmigration bleibt separat offen. Alte Baseline-Diagnosetexte sind teilweise aus dem früheren Prestigekatalog; sie dürfen nicht als aktueller60/24-Preiskatalog/Kaufsperre verwendet werden. Siehe `baseline-notes.md` und `contracts.md`. Eingefrorene historische Rohberichte nicht nachträglich umschreiben.

## Bibliothekskombination: Analysebereich
Die V3-Vorgabe verlangt jeden fünften bezahlten Analyseabschluss als zusätzlichen Bauplanfortschritt im tatsächlich zugehörigen Bereich. Der bestehende Forschungsbereichskatalog ordnet ausschließlich Forschungsprojekt-IDs zu; Analyse-IDs hardware/architecture/artifact besitzen dort keine ausdrückliche Zuordnung. Reguläre Analysen vergeben globale Fragmente, keine solchen Bereichspunkte. Eine belastbare Analyse-/Bereichszuordnung vor vollständiger Kombinationsfreigabe ergänzen/klären; nicht kommentarlos einen zufälligen Bereich oder globale Ersatzfragmente vergeben. Basisfähigkeit des Scanners und unabhängige Verbraucher weiterbearbeiten.

### Präzisierung zum Klassenupgrade-Reset
Der aktuelle `normalResetV2` und Axiomreset leeren die wirksamen `classUpgrades`, behalten aber `materials.classUpgrades`. `classUpgradePreview` sperrt einen weiteren Kauf auch anhand dieses erhaltenen Materialbelegs. Damit ist die aktive Kaufwirkung nicht einfach ein dauerhaftes Upgrade; bei einem nativen neuen Kaufweg wären diese getrennten Erhaltungsregeln sichtbar zu erklären oder ausdrücklich neu zu entscheiden. Keine still erfundene permanente×2-Wirkung oder wiederholbare Extra-Meilensteinvergabe. Analyse-/W08- und andere unabhängige Verbraucher werden weiterbearbeitet.

## Zyklusobservatorium: gleiche Kosten-ID
`itemMaterialFamilies[cycle-observatory]` enthält `quantumCores` sowohl als Basis- wie als Seltenmaterial. Das bestehende Source-Kostenobjekt überschreibt bei seltenen Eingaben die Basiszuweisung; Native entspricht dem. W04 übernimmt×0,75/Rundung der tatsächlich geltenden Eingaben, erfindet aber keine zusätzlichen additiven Kosten. Vor vollständiger Katalogfreigabe diese bestehende Kostenkollision ausdrücklich entscheiden; gemeinsame1260Levelkostenreferenzen halten den Befund nachvollziehbar.
