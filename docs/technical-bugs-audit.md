# Auftrag 1 – bestätigte technische Bugs

11. Oktober 2026. Basis frisch gefetchtes `origin/main` **7b265cb**. Neuer Branch `codex/confirmed-technical-bugs`, Vorgängerbranches unverändert. Alle fünf Befunde auf unverändertem main durch tatsächliche Domainfunktionen reproduziert. Kein Merge, keine Economy-Kalibrierung oder Designänderung. Draft-PR [#81](https://github.com/Kayza1708/Idle-game-/pull/81) erstellt, offen und nicht gemergt. Implementierungscommit `decf74a`.

## Ursachen und tatsächliche Vorher-/Nachherwerte

| Befund | Ursache auf main | Reparatur und überprüftes Ergebnis |
| --- | --- | --- |
| P0 Equipment/Axiom/Save | Slotzahl hängt nur an aktuellen Nodes und Creditkäufen. Axiom löscht Nodes, behält Items. | Permanente `unlockedEquipmentSlots`, beim regulären Node-/Creditkauf und vor Reset festgehalten. 2→1 mit Serializefehler wird 2→2 mit gültigem Reload; ebenso drei Slots. Nodes und übrige Nodewirkungen verschwinden weiterhin. |
| P1 Vordergrundzeit | `App.update` synchronisiert Aktionen mit passivem `advanceTo`. Native Hintergrundstatus wird beim Tick nicht berücksichtigt. | Gemeinsamer Lifecycle-Aktivstatus für Aktionen/Ticks/Speichern; Restzeit vor Hintergrundwechsel aktiv abschließen, Rückkehr passiv abschließen. 300 Aktionen über 30 s: vorher 0, danach 30,000000000000156 aktive Sekunden, numerisch 30. Doppelte Signale konsumieren keine zusätzliche Zeit. |
| P1 Hardwareintegration | Letzte Discovery statt höchster Hardwaretier. | Höchsten Index aller Discoveries verwenden, bestehende Formel unverändert. Cloud→Calculator: Faktor vorher 1,12→1 und Compute 51.367.680→50.817.886,57/s; danach Faktor 1,12→1,12 und Compute 51.367.680→56.916.032,96/s. Preview und Produktionszerlegung stimmen mit Kauf überein. |
| P1 Axiom-Archiv | Duplikate verwenden den Analyse-Bruchrest `componentRemainder`. | Eigener persistierter Modulo-vier-Zähler `archivePassiveFindCount`. Bei Analyse-Bruchrest 0,75 war bereits erster passiver Fund doppelt und Rest danach 0; jetzt erster Fund einfach, Analyse-Bruchrest weiterhin 0,75. Je vier Funde genau fünf Komponenten, keine zusätzliche RNG-Ziehung. |
| P2 Scientific-Integration/Vorschau | Native Antiderivative überläuft; oberhalb 1e100 wird ein begrenzter Startfaktor eingesetzt. Vorschau quadriert projizierten Anspruch nativ. | Data-Faktor wissenschaftlich über dieselbe zeitabhängige Formel integrieren, Anspruch/Schwellen/Payout wissenschaftlich halten. 1-s-Fixture: unveränderte Rate 8,632863895678305e5985; bisher Gutschrift 1,6812541596750383e300, jetzt 8,632863895678305e5985. Weitere Fixture: vorher RangeError bei Advance, jetzt Abschluss bei 1 s. Prestigevorschau vorher Infinity, Axiomvorschau RangeError; jetzt gültige wissenschaftliche Werte und endliche begrenzte Anzeigeprojektionen. |

[Rohvergleich](technical-bugs-proof.json), Reproduktion: `npx vite-node --script scripts/technical-bugs-proof.ts work/technical-bugs-after.json after`. Die Vorherphase wurde auf separatem unverändertem Checkout von main 7b265cb ausgeführt, mit identischem Skript und Phase `before` (passiver Aktionskontext wie damalige App). **Explizit vorbereitete technische Fixtures, keine natürliche Progressionsmessung.**

## Save-, Slot- und Resetvertrag

Saveversion **43**: dauerhafter Slotbesitz 0–3, Archivzähler 0–3, wissenschaftliche Axiom-Bestände. Ein neues Spiel beginnt weiterhin ohne Equipmentplätze; erster Prestige öffnet den bestehenden ersten Platz. Reguläre Nodefreischaltungen und bezahlte Creditplätze zählen, doppelte Käufe sowie vierte Plätze werden abgelehnt. `equipmentSlotCount` bleibt die gemeinsame Funktion für Domain, Vorschauen, UI und Saveprüfung.

Alte Saves übernehmen ausschließlich vorhandene Belege: aktuelle Nodefreischaltungen einschließlich unterstützter `:1`-IDs, gekaufte Plätze und tatsächlich vorhandene kompatible ausgerüstete Instanzen. Fehlende/ unbekannte Instanzen, inkompatible Slots und doppelte IDs bleiben ungültig. Kein Item wird neu erstellt. Ein bereits früher verlorener, im Save durch keinerlei Beleg mehr erkennbarer Platz kann nicht rekonstruiert werden. Archivzähler beginnt bei null, vorhandene Analyse-Bruchteile bleiben unverändert. Hauptspiel und Challenge werden separat migriert; neue Challenges erben keine Accountslots oder Archivbestände.

Axiom-Anspruch, Payout, Bestände, Kaufprüfung und Produktionsfaktor verwenden wissenschaftliche Werte. Kleine ganze Axiommengen werden bei Addieren/Subtrahieren über dezimal dekodierte Integerarithmetik erhalten; Bruchteile werden nicht auf einen Kaufpreis aufgerundet. Ein gültiger Bestand knapp unter 1 kann auch nach Reload keinen Preis von 1 bezahlen. Die bisherigen kleinen Kauf-/Payoutwerte bleiben identisch. Native Kompatibilitätsfelder sind ausdrücklich auf 1e300 begrenzte Projektionen, keine Entscheidungsgrundlage; die tatsächlichen Werte bleiben im Save. Keine neuen Preise oder Bonusformeln.

## Zeit und numerische Integration

Browser und Native-Signale benutzen das bestehende Lifecycle-Gate. Der Hintergrundwechsel verbucht nur die bis dahin offene Vordergrundzeit aktiv; danach sind Aktionen, Ticks und Saves passiv. Beim Vordergrundwechsel wird zunächst die Hintergrundzeit passiv abgewickelt. IndexedDB-Autosaves erhalten denselben Kontext, statt den letzten Vordergrundbruchteil passiv zu speichern. Die bestehenden Challenge-Zeitanker konsumieren die Hauptspielzeit weiterhin ausschließlich passiv.

Die Integration berechnet den Mittelwert der unveränderten Lifetime-Data-Formel in log(1+D)-Koordinaten mit normalisiertem exponentiellem Maß. Es gibt keinen nativen Großzahl-Antiderivativ und keinen 1e100-Abbruch. Adaptive Simpson-Quadratur: relatives Ziel 1e-12 plus 32×EPS×(1+|log10(Teilintegral)|) für logarithmische Binary64-Rundung, maximal Tiefe 20. Exponentielle Restbeiträge unter 1e-16 des bisherigen Integrals liegen unter der Mantissenpräzision. Das ist eine begründete numerische Genauigkeitsgrenze; kein wirtschaftlicher Cap. Winzige Intervalle verwenden den Mittelpunkt nur bei entsprechend winziger Faktoränderung; nicht mehr darstellbare Data-Zuwächse ändern den Faktor innerhalb derselben bestehenden Mantissenpräzision nicht.

Tests vergleichen eine veränderliche kleine Rate zusätzlich mit 10.000 unabhängigen Mittelpunkt-Zeitsamples (Toleranz 2e-8), kurze geteilte Advances/Reload mit 1e-11 und extreme Exponenten um 6000 mit 2e-10. Letzteres berücksichtigt den Verlust einiger Stellen bei logarithmischen Potenzen. Eine separate schnell veränderliche Fixture oberhalb 1e308 liegt zwischen Start-/Endrate und ist bei geteilten Advances gleich. Der 8,63e5985-Vergleich ist innerhalb der vorhandenen Mantissenpräzision konstant, weil dessen Data-Zuwachs gegenüber 1e400 Lifetime-Data nicht darstellbar ist; daraus wird keine allgemeine konstante Rate abgeleitet. Integerabstände oberhalb der 15–16-stelligen Mantisse sind weiterhin nicht beliebig exakt darstellbar.

## Tatsächlich ausgeführte Prüfungen

- **206 gezielte Tests bestanden**, abschließender Lauf 8,59 s. Vitestprüfungen: technische Regressionen, Core Loop, Mobile-Lifecycle, Prestigevorschau, Savevalidierung, wissenschaftliche Kaufmathematik, Axiom-Upgrades, Clock, Challenge-Isolation und Durable Storage. Jeder Befehl mit `timeout 300`, keine Gesamtsuite.
- Typecheck und Production-Build bestanden. Bestehende Vite-Bundlewarnung (>500 kB) erhalten.
- `git diff --check` bestanden.
- Kurzer echter App-/IndexedDB-Lauf mit kontrollierter Uhr und realen Pointer-Taps: ohne Aktionen 3, mit 15 vergüteten Taps 3,0000000000000013 aktive Sekunden. 2 s Hintergrundzeit plus 0,5 s Vordergrund ergeben ausschließlich +0,5 aktive Sekunden. Native- und Browser-Duplikate, native Hintergrundticks bei sichtbarem Dokument, keine Pageerrors. [Protokoll](technical-bugs-browser.json), `scripts/browser-active-clock.py`. Native-Signale im Browser emuliert, kein Gerätebuild.

Die vollständige BALANCE-JSON ist gegenüber main unverändert: SHA-256 `6c692caa268841af8a610dca7def0281d3715c5cf444bf3e2a812837e123e00f`. Ein Regressionstest prüft dies. Rezepte, Drops, Produktionsbasen, Preis- und Bonusparameter unverändert.

Fünf bestehende `clock.test.ts`-Fälle schlugen auch auf unverändertem main fehl: ihre `operations`-Fixture besaß den seit der Forschungsbereichstrennung erforderlichen Automationszugang nicht. Die Fixture kauft diesen jetzt über regulären Prestige-/Nodepfad. Sämtliche ursprünglichen Assertions bleiben erhalten und bestehen wieder. Fehlgeschlagene Entwicklungsprüfungen wurden korrigiert, nicht als bestanden gezählt.

CI: Für genau diesen Branch ersetzt ein bedingter Schritt den pauschalen `npm test` durch dieselben gezielten Regressionen mit 300-s-Limit. Bestehende Installation, Typecheck und Build bleiben aktiv; andere PRs behalten ihren bisherigen Testschritt. Keine `[skip ci]`-Pauschalsperre. Keine Gesamtsuite, FAST/DEEP oder Tages-/Monatskampagne ausgelöst.

### CI-Installationsabweichung

Der erste kurze CI-Lauf brach vor allen Prüfungen bei `npm ci` ab: Die bereits in package.json deklarierten Capacitor-Pakete fehlten als Paket-Einträge im Lockfile. Außerdem verwendete .nvmrc Node 20, während das vorhandene Projekt/Capacitor CLI Node 22 fordert. Lockfile mit den vorhandenen Erklärungen synchronisiert, .nvmrc auf die bestehende 22.x-Vorgabe ausgerichtet. 99 fehlende Lockeinträge ergänzt; keine vorhandene gelockte Paketversion geändert oder entfernt und package.json unverändert. Keine neuen SDK-Erklärungen oder nativen Features eingeführt. Typecheck und Build bleiben ungekürzt; die Tests dieses Branches bleiben auf 300 Sekunden begrenzt.

## Offene Grenzen

Keine verbleibende reproduzierte Fehlfunktion aus den fünf beauftragten Befunden nach der gezielten Abnahme. Nicht mehr belegbarer historischer Slotbesitz und verlorene Items werden nicht erfunden. Bestehende wissenschaftliche Mantissenpräzision, Bundlewarnung und frühere nicht beauftragte Balance-/Referenzabweichungen bleiben offen. Keine Langzeitbalance oder natürliche Erreichbarkeit bestätigt.
