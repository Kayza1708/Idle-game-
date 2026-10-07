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

## Auftrag 9B.1 – mobile Zutatenkarten

PR #78 war am 7. Oktober weiterhin offen, Head adc4bd5. Nachbesserung auf dem vorhandenen Branch, kein zusätzlicher PR, kein Force-Push und kein Merge.

### Reproduktion und Befund

Das ursprüngliche `scripts/browser-blueprints.py` reproduziert im DE/EN-Durchlauf bei 390 px die links beschnittenen englischen Glyphen auf adc4bd5. [Vorher](screenshots/blueprints-mobile/en-390-before.png) und [gemessene ursprüngliche Button-/Textrechtecke](screenshots/blueprints-mobile/before-layout.json).

Die konkrete alte UI-Konstruktion war eine eingerückte native Liste mit unstrukturierten direkten Textknoten im Standardbutton: Name, ×-Zeichen, Menge und gegebenenfalls Fehlmenge teilten eine Inline-Zeile. Sie übernahmen globale Button-Großschreibung/Typografie, hatten keine eigenen begrenzten Textbereiche und keine Icon-/Mengenspuren. Die Screenshotprüfung zeigt den Beschnitt; die DOM-Textrechtecke lagen trotzdem innerhalb der Buttons. Ein negativer Außenabstand oder eine horizontale DOM-Überbreite als Ursache ist damit **nicht** belegt. Der genaue ursprüngliche Chromium-Paintauslöser wurde nicht bis zur Browserengine isoliert; die belegte problematische Markup-/Darstellungskonstruktion wird vollständig ersetzt, statt eine unbewiesene Overflow-Erklärung zu behaupten.

### Korrektur

`RecipeIngredient` ist eine reine Darstellung. Die vorhandene Craftingquote liefert weiterhin Bedarf und Fehlmengen; Inventarbestand und bestehender Zahlenformatter liefern die Anzeige. Keine Änderungen an Domain, Rezepten, Kosten, Migration, Saves oder Economy.

- Eine Spalte unter 390 px, zwei ab 390 px mit `minmax(0, 1fr)`.
- Karten und Gridkinder `min-width: 0`; eigener 32-px-Icontrack plus begrenzter Texttrack.
- Vollständiger Name in einem eigenen Block ohne geerbte Button-Großschreibung; darunter Bestand, Bedarf und Fehlmenge in getrennten, vollständig umbrechenden Zeilen. Keine Ellipsis und kein horizontaler Kartenscroll.
- Bestehende `ComponentArt`-Zuordnungen. Module verwenden die bereits vorhandene Werkbankillustration `ActivityArt('workbench')`; der Katalog besitzt keine dedizierten Modul-Atlaszellen. Keine erfundenen Koordinaten.
- Lernstatus und einmaliger Lernpreis bleiben separate Bereiche. Der bestehende Data-Preis ist ausdrücklich als Herstellungskosten beschriftet. Lern-/Herstellungsbuttons mindestens 44 px.

[Nachher, englische Zutaten 390 px](screenshots/blueprints-mobile/after/en-390-ingredients.png). Auch »Superconductors« wird bei dieser Breite vollständig auf zwei Zeilen umgebrochen.

### Tatsächliche Prüfungen

Das **vorhandene** Browserskript ist auf 360/390/430 px × DE/EN erweitert. Alle sechs Itemrezepte und beide Modulrezepte werden in jedem Kontext geprüft: 65 Itemzutaten + 8 Modulzutaten, insgesamt 438 reguläre Kartenprüfungen. Jede Karte prüft tatsächliche Icon-/Text-/Zeilenrechtecke, enthaltene Elemente, Icon-/Namensabstand, getrennte Namen/Mengen, überlappungsfreie Mengenzeilen, horizontale Karten-/Seitenbegrenzung und 44-px-Buttons. Eine/zwei Spalten wird aus dem berechneten Gridstyle geprüft.

Zusätzlich 390 Präsentationsprüfungen mit sehr langen ungetrennten Namen und langen wissenschaftlichen Texten bis e+1000. Diese **DOM-only-Anzeigetexte** werden anschließend wiederhergestellt und niemals in Spielstand oder Domainledger geschrieben. Sie sind keine gültigen riesigen diskreten Komponentenbestände oder Gratisressourcen.

Je Kombination echte bestätigte Lernaktion (4 → 0 Fragmente), zwei bezahlte Quantenchipaufträge und ein bezahlter Compute-Bus-Auftrag. Die gespeicherten tatsächlichen Zutatenabzüge und Reservierungen werden geprüft. Ressourcen/Freischaltungen sind vorbereitete technische Fixtures; kein Simulationslauf oder Progressionsnachweis. Keine JavaScriptfehler. [Vollständiges Protokoll mit allen Karten](screenshots/blueprints-mobile/after/results.json).

Normale Browser-/Aktionsprüfung bei Höhe 844 px. Die lange einspaltige 360-px-Zutatenübersicht wird nur für den Übersichtsscreenshot bei Höhe 1600 px aufgenommen und anschließend auf 844 px zurückgestellt; die Karten-/Aktionsassertions verwenden die reguläre mobile Höhe. Weitere normale Viewport-Screenshots liegen im gleichen Ordner. Screenshotkontrolle DE/EN an allen drei Breiten: kein erneut sichtbarer Beschnitt in den neuen Zutatenkarten.

Sechs gezielte UI-Tests `src/recipeIngredient.test.tsx` prüfen die echten Quote-Mengen, DE/EN-Namen, vorhandenen Icons, wissenschaftliche Darstellung und reine Eingaben. Typecheck, Production-Build und Diffprüfung bestanden. Keine Gesamtsuite, Domain-/Simulationskampagne oder FAST/DEEP; alle Testläufe unter fünf Minuten.

Verbleibende Grenzen: ursprünglicher browserinterner Paintauslöser nicht abschließend isoliert; bekannte Vite-Chunkwarnung sowie Schicht-3-/Langzeit-/Axiombalance bleiben offen. Im geprüften neuen Layout wurden keine Zutatenfehler nachgewiesen. Die zuvor offene mobile Darstellungsabweichung ist für die genannten Breiten/Sprachen behoben.
