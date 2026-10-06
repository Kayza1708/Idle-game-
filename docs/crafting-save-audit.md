# Audit: Atomare Zutatenreservierung und Spielstandvalidierung

## Ausgangsstand und Ursache

Branch `codex/atomic-crafting-save-validation` basiert auf dem erfolgreich abgerufenen `origin/main`, Commit `530b2e30a5c71e19e6ed757264b5e8532102158d`. Die vorausgesetzte Reparatur `47d706d` ist durch den gemergten PR #64 enthalten; es besteht keine offene PR-Abhängigkeit. Der Arbeitsbaum war vor Beginn sauber.

`craft` skalierte die Abbuchung für die Auftragsmenge, prüfte Module und Data aber mit der Einzelexemplar-Vorschau. Ein fehlgeschlagener `spendResources`-Aufruf wurde anschließend nicht erkannt: Komponenten/Module waren bereits im neuen Zustand abgezogen, und der Auftrag wurde trotzdem angelegt. Mengen wurden außerdem still abgerundet.

Die Savevalidierung prüfte zwar grundlegende Felder und wissenschaftliche Ledger, aber keine Itemtypen, Qualitäten, Instanz-IDs, Ausrüstung oder Crafting-Reservierungen. So gelangte ein unbekannter ausgerüsteter Itemtyp bis zum ungeschützten Katalogzugriff in der Produktionsberechnung.

## Vorher/Nachher mit echten Domainfunktionen

Fixture: Komponenten und Fragmente für fünf Quantenchips, nur ein Compute-Bus und 1800 Data. Aufruf: `craft(state, 'quantum-chip', 'common', 5)`.

| Ergebnis | Vorher auf `530b2e3` | Nachher |
| --- | --- | --- |
| Auftrag angenommen | ja, Menge 5 | nein, identischer Zustand |
| Compute-Bus-Bestand | 1 → −4 | 1 → 1 |
| Data | 1800 → 1800 | 1800 → 1800 |
| Unbekannter ausgerüsteter Itemtyp importiert | ja | verständlicher Validierungsfehler |
| anschließende Produktion | TypeError beim Lesen von `effect` | ungültiger Zustand wird vor Verwendung abgewiesen |

Mit Zutaten für exakt fünf werden 150 Schaltkreise, 60 Kupferspulen, 90 Siliziumwafer, 40 Titanbolzen, 10 Photoniklinsen, 5 Graphen, 5 Compute-Busse, 20 Bauplanfragmente und 9000 Data einmal reserviert. Nach 1500 Sekunden entstehen exakt fünf Quantenchips. Abschluss und Reload buchen keine weiteren Zutaten ab und duplizieren keine Ergebnisse.

Reproduktion:

```bash
npm test -- src/atomicCrafting.test.ts src/saveValidation.test.ts
```

## Reparatur und Speichervertrag

- Ein reiner Rezepthelfer berechnet sämtliche vorhandenen Kosten für die gesamte Menge. Vorschau, aktuelle Ressourcenprüfung, Reservierung und Savevalidierung teilen diese Berechnung. Bestehende Rezepte verlangen Komponenten, Module, Bauplanfragmente und Data; sie verlangen keine Credits oder Forschungsfragmente.
- Mengen sind positive sichere Ganzzahlen. Überläufe der skalierten diskreten Kosten, Ergebnis-IDs oder Gesamtlaufzeit werden abgewiesen. Die vorhandene Grenze von drei wartenden Aufträgen bleibt bestehen.
- Der neue Auftrag entsteht mit der vollständigen Reservierung in einer Zustandsoperation. Alle Voraussetzungen werden vor dem Abzug geprüft; fehlgeschlagene Aktionen geben den unveränderten Eingangszustand zurück. Data wird mit den reparierten wissenschaftlichen Ledgerhelfern geprüft und abgezogen.
- Auch Fusion prüft ihre drei eindeutigen Instanzen vor jeder Änderung; Itemerzeugung weist unbekannte Typen/Qualitäten und ID-Kollisionen ab. Upgrades und Forge buchen bei fehlgeschlagener wissenschaftlicher Zahlung weder Zutaten noch Fortschritt.
- Wartende Aufträge können wie bisher vollständig storniert werden; aktive Aufträge nicht. Erstattungen erhöhen kein Lifetime-Produktionskonto und halten große Data-Ledger wissenschaftlich, statt sie auf native Maximalwerte umzuschreiben.
- Gemeinsame Validierung schützt Serialize/Save, Load und Import vor unbekannten Katalog-IDs, negativen/ungültigen Mengen, mehrfachen Instanz-/Auftrags-IDs, falscher Ausrüstung und widersprüchlichen Rezeptreservierungen. Persistenz validiert vor der Simulation. Bestehende Migrationen bleiben erhalten; Saveversion 40 und Reservierungsformat sind unverändert. Beschädigte Reservierungen werden abgewiesen, statt gelöscht oder gratis ersetzt zu werden.
- Leere direkte Imports sind ungültig und liefern keinen kostenlosen neuen Ersatzspielstand. Nur ein fehlender lokaler Save startet weiterhin regulär ein neues Spiel.
- Ein fehlgeschlagener Import verändert weder den laufenden Zustand noch Hauptsave, Pending-Save oder Backups. Gültige laufende und teilweise abgeschlossene Aufträge bleiben samt ursprünglicher Gesamtreservierung erhalten.
- Zahlenpräzision bleibt wie in `docs/scientific-purchase-audit.md`: binary64-Mantisse, ungefähr 15–16 signifikante Dezimalstellen. Ein sehr kleiner Abzug oder eine Erstattung relativ zu einem extrem großen Guthaben kann außerhalb dieser Präzision liegen. Keine beliebig exakte Dezimalarithmetik wird behauptet.

Keine Änderung an Balancewerten, Rezepten, Drops, Produktionswerten, Prestige-/Resetregeln, Startercredits, Auto-Prestige oder Challenge-Isolation. Der komplette `BALANCE`-Block wurde zusätzlich bytegleich gegen `530b2e3` geprüft.

## Prüfungen

- Umgebung: Node 22.23.3, npm 10.9.9; derselbe installierte Abhängigkeitsstand für Ausgangs- und Abschlusslauf. Manifeste und Lockfile bleiben unverändert.
- Ausgangssuite auf `530b2e3`, vor Änderungen an `src/`: `npm test`, Exitcode 1, 816,49 Sekunden. 55 Dateien: 52 bestanden, drei fehlgeschlagen. 559 Tests bestanden, drei Clock-Assertions fehlgeschlagen. `mobileMetaPolish.test.ts` und `prestigeSeasonMobile.test.ts` führen wegen Vites `Cannot split a chunk that has already been edited` bei `import.meta.url` keine Assertions aus. Ein unhandled Runnerfehler: `[vitest-worker]: Timeout calling "onTaskUpdate"`. Diese Fehler sind auf diesem Ausgangsstand nachgewiesen, nicht nur aus Auftrag 1 übernommen.
- Die Langzeitsimulation besteht auf dem Ausgangsstand ihre technische Assertion. Ihre optionale Balancebewertung lautet `Overall: FAIL`; das ist kein grünes Balanceergebnis und keine neue Balancekalibrierung dieses Auftrags.
- Typecheck: bestanden, zusätzlich im Production-Build erneut ausgeführt.
- Betroffene Tests: 257 in elf Dateien bestanden; darin 71 neue Regressionen. Zahlen- und Kaufregressionen aus Auftrag 1 bestehen weiterhin.
- Integrations-Vorprüfung ohne die separate Langzeitsimulation: 620 Tests bestanden, dieselben drei Clock-Assertions und zwei Vite-Ladefehler; Exitcode 1. Danach ergänzte Regressionen bestehen im betroffenen Lauf. Dieser Vorlauf ersetzt nicht die vollständige Suite.
- Production-Build: bestanden; Vite meldet weiterhin einen JavaScript-Chunk über 500 kB.
- Echte Browser-App (Chromium, 390 × 844, feste Testzeit): beschädigter Itemimport zeigt den klaren Validierungsfehler; der anschließende echte JSON-Export enthält weiterhin das ursprüngliche leere Inventar, 1234 Credits und 1800 Data. IndexedDB-Hauptsave und Backupgenerationen bleiben bytegleich; keine `pageerror`-Ereignisse.
- `git diff --check`: bestanden.
- Ein erster Abschlusslauf wurde nach dem Review-Randfall „leerer direkter Import liefert einen neuen Spielstand“ gezielt beendet (Exitcode 143). Danach wurde die Importgrenze korrigiert und erneut durch Typecheck, betroffene Tests und Build geprüft. Dieser Zwischenlauf zählt nicht als Abnahme.
- Vollständige Abschluss-Suite auf unveränderten finalen Quelldateien: `npm test`, Exitcode 1, 834,25 Sekunden. 57 Dateien: 54 bestanden, drei fehlgeschlagen. 630 Tests bestanden, drei Clock-Assertions fehlgeschlagen; dieselben beiden Vite-Ladefehler und derselbe `onTaskUpdate`-RPC-Timeout wie auf dem Ausgangsstand. Alle 71 neuen Regressionen bestanden. Die Langzeitsimulation besteht ihre technische Assertion; ihre optionale Balancebewertung bleibt `Overall: FAIL`. Die Quellenprüfsummen vor/nach diesem Lauf sind identisch.
- Offen bleibt eine grüne Gesamtsuite: die belegten Clock-Assertions, der Vite-SSR-Transform und der Runner-RPC-Timeout brauchen getrennte Folgearbeiten. Keine erforderliche Abschlussprüfung ist blockiert oder unvollständig.

Keine Assertions abgeschwächt, keine Testdateien oder Prüfungen deaktiviert. Keine Veröffentlichung und kein Merge.
