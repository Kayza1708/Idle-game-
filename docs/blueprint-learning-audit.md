# Auftrag 9B: Baupläne einmal lernen

Basis: frisch gefetchtes origin/main 2481577, gemergter PR #77. Eigener Branch `codex/permanent-learned-blueprints`; keine Abhängigkeit zu einem offenen Vorgänger und keine Vorgängeränderungen.

## Ursache und neuer Vertrag

Bisher multiplizierte `craftingRecipe` den Katalogwert `blueprints` mit der Auftragsmenge und reservierte ihn bei jeder Herstellung. Nun bleibt derselbe Katalogwert der einmalige Lernpreis. `blueprintQuote` ist rein; `learnBlueprint` prüft den aktuellen Bestand und Zugang erneut und bucht Besitz, Fragmente und das Ereignis in einer Zustandsoperation. Wiederholtes Lernen ist ohne Änderung. Die Herstellung, Queue und der Werkbankplaner verlangen denselben Zugang über diese Quote. Automation lernt keine kostenpflichtigen Rezepte.

| Stabile Rezept-ID | Einmaliger Lernpreis |
|---|---:|
| impulse-relay | 0, bestehende Hardwareanalyse-Freischaltung |
| quantum-chip | 4 |
| neural-asic | 5 |
| field-scanner | 5 |
| data-prism | 5 |
| insight-archive | 0, bestehende Forschungsarchiv-Freischaltung |

Das ist der vollständige aktuelle Rezeptkatalog. Preis-0-Rezepte benötigen keine Lerntransaktion. Die bisherigen Domainvoraussetzungen bleiben erhalten: Module benötigen Offene Baupläne; die beiden Spezialrezepte ihre ausdrücklichen Flags. Für die vier kostenpflichtigen Itemrezepte bestand zuvor keine zusätzliche Forschungsbedingung in der Domain; hier wird keine erfunden.

`learnedRecipes` speichert stabile IDs dauerhaft im jeweiligen Spielkontext. Normaler Prestige und Axiom behalten sie über ihren bestehenden Zustandserhalt. Neue Challenge-Runs beginnen ohne übernommenen Besitz. Komponenten, Module, wissenschaftliche Data-Abbuchung, Zeiten, Common-Ergebnisqualität und atomare Reservierung bleiben unverändert. Fragmente sind eine diskrete sichere Ganzzahl; Data verbleibt im bestehenden ScientificNumber-Ledger mit dessen dokumentierter Darstellungspräzision.

## Migration und beschädigte Zustände

Save-Version **41 → 42** trennt einen belegbar alten Stand ohne Besitzfeld von einem beschädigten aktuellen Stand. Bestehende ältere Versionsmigrationen laufen zuerst; anschließend wird jeder Kontext getrennt migriert. Nur fehlende historische Besitzfelder werden ergänzt. Gültige Inventaritems und aktive/wartende Itemaufträge belegen jeweils ihr Rezept; die beiden ausdrücklichen Spezialrezeptflags bleiben erhalten. Bereichs-/Forschungszugang allein belegt keinen bezahlten Bauplan. Ein Itemfund in einem neuen Version-42-Stand lernt kein Rezept automatisch.

Alte positive Fragmentreservierungen erhalten die Kennzeichnung `legacy-reserved`. Zutaten, vollständige gespeicherte Reservierung, Fortschritt und Endzeiten bleiben unverändert und werden gegen die historische Gesamtkostenquote validiert. Kein erneuter Abzug, keine nachträgliche Fragmenterstattung, auch bei späterem Abbruch eines wartenden historischen Auftrags. Die übrigen wartenden Zutaten werden nach dem vorhandenen Abbruchvertrag erstattet; aktive Aufträge bleiben nicht abbrechbar. Neue Aufträge haben Fragmentkosten 0.

Version 42 verlangt das Besitzfeld sowohl im aktiven als auch im gespeicherten Hauptzustand. Unbekannte/doppelte Rezept-IDs, unzulässige Reservierungsverträge oder Aufträge ohne belegten bezahlten Bauplan werden abgewiesen. Import/Load bleiben im vorhandenen gemeinsamen Validierungspfad; Fehler führen nicht zu einem Überschreiben des gültigen Hauptsaves oder der Backups. Die Lernaktion nutzt außerdem den sofortigen Event-Speicherpfad der Craftingaktionen.

## Reproduzierbarer Vorher/Nachher-Vergleich

Vorher, Quantenchip: Quelle main 2481577 `craftingRecipe`, 4 Fragmente pro Exemplar, damit 8 für zwei bzw. 20 für fünf. Alle anderen Zutaten identisch.

Nachher, vorbereiteter technischer Zustand: 4 Fragmente, 10.000 Data, 2 Compute-Bus und ausreichend Komponenten; kein Offline-Vorlauf und keine Hardwareproduktion. Lernen bezahlt exakt 4 Fragmente einmal. Zwei reguläre Aufträge bezahlen zusammen 3.600 Data, 2 Compute-Bus, 60 Schaltkreise und die übrigen unveränderten Rezeptkomponenten. Beide reservieren 0 Fragmente. Pro Exemplar weiterhin 300 Sekunden und Common; nach 600 Sekunden genau zwei Ergebnisse, nach wiederholtem Abschluss/Reload keine zusätzlichen Ergebnisse. Die Zustände sind vorbereitete technische Fixtures, keine natürliche Progressionsmessung.

Reproduktion: `npx vitest run src/blueprints.test.ts --maxWorkers=1`. Die bestehenden atomaren Tests behalten ihre Mengen-, Data-, Konkurrenz-, Abbruch- und Offlineassertions; ihr Setup lernt nun ausdrücklich oder gibt vorhandenen Besitz an. Nur Assertions zu wiederkehrenden Fragmenterstattungen/-reservierungen wurden entsprechend dem neuen Vertrag geändert.

## UI und Export

DE/EN-Karten unterscheiden fehlende Voraussetzung, einmaliges Lernen mit Preis/Bestand/Fehlmenge und dauerhaft gelernt. Die native Bestätigung nennt Fragmente vorher → nachher. Herstellungsrezepte zeigen keine Fragmentzutat. Laufende historische Reservierungen werden ausdrücklich als historisch benannt. Vorhandene ItemArt-Zuordnungen bleiben unverändert.

Der Export trennt kontextbezogene Besitz-/Lernquotes von fragmentfreien Herstellungskosten und historischen Jobreservierungen. `blueprint-learn` protokolliert Rezept, tatsächliche `paidFragments`, manuelle Quelle und Kontext; `crafting.csv` ergänzt `paidLearningFragments`. Die bestehende Timeline enthält getrennte Haupt-/Challenge-Ereignisse; die bisherigen Crafting-CSV-Zeilen beziehen sich auf das Hauptspiel. Keine vollständigen Savekopien oder Instanz-IDs werden für diesen Besitzexport ergänzt. ZIP-, Datenschutz-, Größen-, Abbruch- und Telemetriegrenzen bleiben bestehen. Ein aktueller Besitz ist keine Fundrate; verworfene Historie wird weiterhin als unvollständig ausgewiesen.

## Abnahme und Grenzen

174 gezielte Tests in zehn Dateien: Bauplanlernen, atomare Herstellung, Crafting, Savevalidierung, gemeinsame Vorschauen, bestehende Bedienmechaniken, Export, Challenge-Isolation, Storage und IndexedDB. Typecheck, Production-Build und `git diff --check` bestanden. Keine Gesamtsuite, FAST/DEEP oder Langzeitkampagne; jeder gezielte Lauf deutlich unter fünf Minuten.

Browserprüfung 390 × 844 px DE/EN mit tatsächlichen Pointeraktionen: einmaliges bestätigtes Lernen und zwei regulär bezahlte Herstellungsaufträge, gespeicherte Abzüge/Reservierungen geprüft, keine JavaScriptfehler und keine horizontale Überbreite. Vorbereitete Testressourcen ausdrücklich im [Protokoll](screenshots/blueprints/results.json) und [Browserskript](../scripts/browser-blueprints.py) gekennzeichnet. Sechs Screenshots unter `docs/screenshots/blueprints/`. Offen: In englischen Screenshots sind einzelne Zutatenbeschriftungen links teilweise beschnitten; Lernstatus, Bestätigung und Herstellungsbuttons sind bedienbar. Die Prüfung bestätigt diese Aktionen, keine vollständige visuelle Fehlerfreiheit. Diese Darstellungsabweichung wird nicht ohne Nachweis als bestehender Fehler bezeichnet.

Offen bleiben die bekannte Vite-Chunkgrößenwarnung, die Schicht-3-Referenzabweichungen 361/313 und 57.700/59.132 sowie optionale Langzeit-/Axiombalance. Keine neue Kalibrierung, keine bestätigte natürliche Progression oder vollständige Gesamtabnahme.
