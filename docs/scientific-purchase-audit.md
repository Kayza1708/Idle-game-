# Audit: ScientificNumber und Hardwarekäufe

## Ursache und Reproduktion

Ausgangsstand: `1d0458d5397c3dd68aa719eb08f4eee450a0c65a`. Der erfolgreiche Fetch von `origin main` lieferte denselben Commit. Die Reparatur arbeitet auf diesem Stand.

`ScientificNumber.fromParts(1, 1.1)` behielt den gebrochenen Exponenten. Der Vergleich ordnete zuerst nach Exponent und bewertete deshalb `{m:1,e:1.1}` höher als den Preis `{m:1.5,e:1}`. Bei der anschließenden Subtraktion entstand eine negative Mantisse; der bisherige Konstruktor verwandelte sie in null. Die echte Transaktion `buyHardwareClass` lieferte so Hardware trotz Unterdeckung.

| Ergebnis der echten Domainfunktionen | Vorher | Nachher |
| --- | --- | --- |
| Guthaben | 12,589254117941675 Credits | 12,589254117941675 Credits |
| Credit-Ledger | `{m:1,e:1.1}` | `{m:1.2589254117941675,e:1}` |
| Taschenrechnerpreis | 15 Credits | 15 Credits |
| Kaufprüfung | bezahlbar | nicht bezahlbar |
| Hardwarebestand nach Aktion | 1 | 0 |
| Credits nach Aktion | 0 | 12,589254117941675 |

Reproduktion mit dem Regressionstest:

```bash
# Node 22 und installierte Repository-Abhängigkeiten verwenden.
npm test -- src/purchaseMath.test.ts -t 'refuses the audited'
```

## Reparatur und numerischer Vertrag

- Null wird ausschließlich als `{m:0,e:0}` dargestellt. Positive Werte haben `1 <= m < 10` und einen sicheren ganzzahligen Exponenten. Der gebrochene Exponentenanteil wird werttreu in die Mantisse übernommen. Auch native Subnormalzahlen bleiben darstellbar.
- Die vorhandene Bibliothek ist nicht vorzeichenbehaftet. Subtraktion bleibt bei null gesättigt; Transaktionen prüfen vorher die Deckung. Ungültige Factory-Eingaben, unzulässige Exponenten und Division durch null werfen Fehler statt Nullkosten zu erzeugen. Credit-/Data-Transaktionen weisen ungültige Ressourcen, Kosten und Mengen ohne Zustandsänderung ab.
- Die Mantisse bleibt IEEE-754 binary64, ungefähr 15–16 signifikante Dezimalstellen. Die Normalisierung verwendet 17 Dezimalstellen zur Skalierung. Dies ist keine beliebig exakte Dezimalarithmetik: sehr kleine Summanden/Abzüge relativ zu einem großen Wert können verschwinden; Differenzen von mehr als 16 Dezimalordnungen werden verworfen. Logarithmische Potenzen verlieren bei sehr großen Exponenten zusätzliche Genauigkeit. Die Tests vergleichen geometrische Summen innerhalb dieser Präzision, ohne eine Kauftoleranz einzuführen.
- Kaufprüfung und Abbuchung erhalten dasselbe `ScientificNumber`-Kostenobjekt. Die bestehende UI verwendet weiterhin `hardwareBulkCostScientific` und `hardwareCostScientific`. Große Guthaben werden vor der Kaufentscheidung nicht in native Zahlen projiziert; Kosten werden erst nach erfolgreicher wissenschaftlicher Abbuchung für Telemetrie projiziert.
- MAX sucht mit der echten geometrischen Gesamtsumme, prüft Menge und Folgemenge abschließend und respektiert das bestehende Safe-Integer-Limit. ×10 ist gegen zehn echte Einzeltransaktionen geprüft. Fehlgeschlagene/erneute Aktionen überziehen kein Guthaben.
- Gültige ältere Ledger-Paare werden an den zentralen Lese-/Schreibgrenzen und bei Save/Reload normalisiert. Ein nichtkanonisches Paar behält auch bei veraltetem Scalar-Schatten seinen Wert. Die vorhandene Legacy-Kompatibilität für direkte Scalar-Schreiber bleibt erhalten; gecappte Schatten ersetzen keine großen wissenschaftlichen Guthaben. Beschädigte Paare werden abgewiesen und der Originalsave bleibt für die bestehende Wiederherstellung erhalten. Saveversion und Speicherformat bleiben unverändert.

Hardwarepreise, Produktions- und Prestigeformeln, Drops und Resetregeln sind unverändert. `buyClassUpgrade` bleibt wie im Ausgangsstand deaktiviert. Zutatenreservierungen, Challenge-Isolation, Startercredits und Auto-Prestige gehören nicht zu dieser Reparatur.

## Validierung und Übergabe

- Typecheck: bestanden.
- Betroffene Tests: 222 Tests in neun Dateien bestanden; darin 115 neue Tests für Zahlenrepräsentation, Käufe und Persistenz.
- Echte mobile Browser-UI (Chromium, 390 × 844): importierter Legacy-Ledger wird werttreu normalisiert, der 15-Credit-Button ist bei 12,589254 Credits deaktiviert, die Domaintransaktion verändert den Zustand nicht.
- Die Integrations-Vorprüfung ohne Langzeitsimulation zeigt die bereits im Ausgangsstand nachgewiesenen drei Clock-Fehler und zwei Vite-Ladefehler. Diese unabhängigen Fehler werden nicht mit numerischen Änderungen oder abgeschwächten Assertions verdeckt.
- Production-Build: bestanden; bestehende Vite-Warnung wegen eines JavaScript-Chunks über 500 kB.
- Vollständige Testsuite (`npm test`): nach 686,75 Sekunden mit Exitcode 1 abgeschlossen. 55 Dateien: 52 bestanden, drei fehlgeschlagen. 559 Einzeltests bestanden, drei fehlgeschlagen; die beiden Vite-Suiten führten wegen Ladefehlern keine Assertions aus. Alle 115 neuen Regressionen bestehen. Die drei Fehler in `clock.test.ts` erwarten Credit-Produktion ohne Hardware; `mobileMetaPolish.test.ts` und `prestigeSeasonMobile.test.ts` scheitern am bereits vorhandenen Vite-SSR-Transformfehler bei `import.meta.url`. Zusätzlich besteht der bereits vorher beobachtete Vitest-RPC-Timeout für `onTaskUpdate`. Die Langzeitsimulation selbst beendet ihre technischen Assertions erfolgreich; ihre optionale Balancebewertung lautet weiterhin `FAIL`. Keine Prüfung wurde abgebrochen oder als bestanden ausgegeben, obwohl sie fehlschlug.
- PR-Erstellung: Der GitHub-API-Zugriff ist zunächst durch den Netzwerkproxy blockiert (`CONNECT 403` für `api.github.com`); Git-Fetch funktioniert. Keine Veröffentlichung und kein Merge.
