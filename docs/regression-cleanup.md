# Regression cleanup – 12. Oktober 2026

Basis: `main` nach PR #86, Commit `5b55782c5430f0ed21d3044e142233b2152faee5`.

## Befund und Änderungen

Die 30 Fehler des früheren breiten Teillaufs wurden einzeln klassifiziert: 28 veraltete Testverträge/Fixtures, eine zu strenge Mantissenassertion und ein bestätigter Tutorial-Fehler. Die vollständige Liste mit Begründungen steht in `regression-cleanup-audit.json`.

Die korrigierten Fixtures führen Blueprint-Lernen, Projektzugang, Challenge-Zugang, Autostarter und Foundry-Kauf ausdrücklich aus. Challenge-Ziele entstehen aus Produktion; vorbereitetes Geld finanziert Hardware und gilt nicht als natürlicher Progressionsnachweis. Forge prüft Bezahlung, unverändertes Item vor Ablauf und Effekt nach Ablauf. Vorgängerparameter bleiben über die vorhandene Projektion geschützt; neue Katalogeinträge werden nicht als versehentliche Parameteränderung behandelt. ScientificNumber-Einzeldebits bleiben exakt; nur die Summation mehrerer Debits verwendet eine relative Toleranz von 1e-12.

Vier bestätigte Produktfehler sind korrigiert:

1. Tutorial-Crafting nennt Blueprint-Lernen, fehlende Fragmente und echte Zutaten einschließlich Module über den vorhandenen lokalisierten Fehltext. Es behauptet keine generelle Hardwareanalyse-Pflicht mehr.
2. Forschung zeigt bei der Challenge-Regel „Bereich wechseln“ eine gesperrte Karte und einen passenden deaktivierten Detail-CTA. Die Domain-Sperre bestand bereits.
3. Diagnoseexporte mit ungültigen Ressourcenprojektionen brechen nicht mehr am Forschungssnapshot ab. Dieser wird als `null` mit `researchContractError` ausgegeben; ungültige native Ressourcen werden weiterhin `null`. Es werden keine künstlichen Forschungsquotes erzeugt und keine Saves verändert.
4. `crafting.csv` bewahrt bei Item-Aufwertungen die Legacy-Circuit-Kosten und ergänzt `upgradeMaterials` mit dem vollständig protokollierten Materialbeleg. Die neue Spalte steht am Ende; bestehende Spalten behalten ihre Position.

Keine Economy-Werte, Kosten, Belohnungen, Save-Versionen oder Resetverträge wurden geändert.

## Zwei Testläufe mit unterschiedlicher Aussage

- `npm test`: sämtliche Standardregressionen, einschließlich Exporten, ScientificNumber-Grenzen, Save-/Challenge-Isolation, Worker-Reaktionsfähigkeit und kurzen Hardware-Kauftests. Keine Branch-Sonderbehandlung ist für den neuen PR erforderlich.
- `npm run test:campaigns`: explizite Profile in `balanceCampaigns`, `layerOneSimulation`, `layerThreeSimulation` und `longTermSimulation`. `SIM_MODE=DEEP` aktiviert zusätzlich die längeren Horizonte. Reine Preis-/Katalogtests wurden in Standarddateien erhalten, nicht mit den Kampagnen ausgeblendet.

CPU-intensive Balancekampagnen verwenden Worker. Normale Worker erhalten 30 Sekunden Budget; Langzeitprofile ausdrücklich 110 Sekunden bei 120 Sekunden Testlimit. Bei Budgetende wird der Worker terminiert und der Test schlägt fehl. Das Limit verändert weder Simulationszeit noch Domain-Schritte. Der isolierte Layer-One-Simulator hat bereits eine feste Schrittobergrenze. Der manuelle CI-Lauf hat zusätzlich 15 Minuten Joblimit.

Die Kampagnen wurden nur auf Erkennbarkeit der vier Dateien geprüft, nicht ausgeführt. Ihre alten Timing- und Diagnose-Assertions bleiben sichtbar und können weiterhin scheitern. Sie sind offene Mess-/Kalibrierungsaufgaben und kein grüner Balance-Nachweis. Exakte frühere 60-Minuten-Werte wurden im kurzen Run nicht als aktuelle Abnahmekriterien ausgegeben; dort werden reale, begrenzte Fortschritts- und Formelverträge geprüft.

## Grenzen

Wochen-/Monatsprogression, natürliche Material-/Item-Pfade und 690 Challenge-Stufen sind weiterhin unkalibriert. SSR-Prüfungen sind keine Browserabnahme. Keine neue Browser- oder Geräteprüfung, keine langen Simulationen, kein Merge und kein Deployment in diesem Auftrag. Der Build meldet weiterhin die vorhandene Chunk-Größenwarnung.

Die endgültigen Prüfzahlen stehen im Übergabeeintrag in `NEXT_STEPS.md` und im Audit-JSON.
