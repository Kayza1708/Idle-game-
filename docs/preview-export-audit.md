# Auftrag 5: gemeinsame Vorschauen und lokaler Balanceexport

Basis: aktuelles, erfolgreich geholtes `origin/main`, Commit `8ed46e3`. PR #67 war
bereits gemergt; sein Commit `4725b090e84ae29c6db2bee9aedfbf181e5202ea` ist
enthalten. Eigener Branch `codex/shared-previews-balance-export`, Ziel `main`;
keine offene Vorgängerabhängigkeit. Repository-Root `/workspace/Idle-game-`,
Arbeitsbaum vor Beginn sauber, HTTPS-Remote Kayza1708/Idle-game-. AGENTS gelesen.

## Ursache und reproduzierbare Änderungen

- Hardwarevorschau übersah die beim bezahlten Kauf gewonnene Mastery-XP.
  Vorbereitung mit echten Käufen: 249 Taschenrechner, 30 SBC, Creditfixture 1e30
  (technischer Zahlenvergleich, keine natürliche Progressionsmessung).
  Nächster Taschenrechner: vorher +400,3657297056295 Compute/s, tatsächlich
  +433,8650572255053; jetzt Vorschau +433,8650572255053. Strukturprojektion und
  bezahlte Transaktion verwenden `hardwareOwnershipAfter`.
- Die alte Produktionsdiagnose zeigte bei Research-Overclock Creditfaktor 2;
  Produktion und neue Diagnose wenden korrekt 1 an, ohne Creditboost.
- Der rohe Itembonus wurde als fertiger Creditfaktor dargestellt. Rare Memory
  Crystal mit Manufacturing 4: Basis 1,172368, Exponent 1,05, angewendeter Faktor
  1,181726986947835. Die Diagnose zeigt diesen angewendeten Faktor; keine zweite
  Multiplikation mit dem rohen Bonus. Achievement-/Durchbruchfaktoren entsprechen
  ebenfalls den tatsächlichen Creditbeiträgen.
- Der Export behauptete `1 + 0.5 * log10(1 + cycleINT)`. Tatsächlich gilt
  `1 + BALANCE.prestigeBonusLogScale * ln(1 + cycleINT)`; bei 99 INT 3,532843602293451
  statt der aus der alten Exportformel abgeleiteten 2. Produktion unverändert.
- Forschungs-/Trainingskosten liefen bei hohen Levels vor der ScientificNumber-
  Konstruktion in natives Infinity. Darstellbare Kosten behalten die bisherige
  `ceil`-Rundung; oberhalb des nativen Bereichs wird dieselbe geometrische Formel
  wissenschaftlich gerechnet. Ein Einerschritt liegt dort unter der Präzision.
  Bereits reservierte Kosten werden optional als `dataCostExact` gespeichert und
  validiert; alte Aufträge behalten ihre vorhandenen Kosten. Kein Formatwechsel
  erforderlich (Save v41). Beispieltest: Training Level 2001, Forschung Level 10001.

Hardware-, Trainings- und Forschungsvorschau sowie ihre Transaktionen verwenden
nun dieselben reinen Kosten-/Ressourcen-/Auftragshelfer. Analyse nutzt weiterhin
`analysisAffordability`, `analysisBlockReason` und die zentrale Kostentabelle;
Crafting nutzt weiterhin die volle `craftingRecipe`/`craftingAffordability`.
Die bisherigen Entdeckungsanzeigen und Freischaltungen werden nicht neu kalibriert.
Fehlmengen sind wissenschaftlich, reservierte Zutaten/Startkosten und feste
Auftragsendzeiten sind sichtbar. Zufällige Komponenten werden als Möglichkeiten
mit Ziehungswahrscheinlichkeiten gezeigt, nicht als Funde. ETA ist null bei
fehlender positiver Rate oder mehr als MAX_SAFE_INTEGER Sekunden; keine Infinity-
Anzeige. Vorschau verändert weder State noch RNG noch Telemetrie. Jede tatsächliche
Aktion prüft den aktuellen Zustand neu; ungültige Ledger starten keinen Auftrag.
Prestige-/Axiom-Vorschauen bleiben am bestehenden gemeinsamen Run-Startvertrag.

## Produktions- und Exportvertrag

`economySnapshot` verwendet exakt die von den Produktionsfunktionen angewendeten
Operanden. Hardwareklassen werden summiert; Compute-Network-Verknüpfungen sind
additive Klassenbeiträge, Meilensteine/Klassenupgrades/Mastery Faktoren.
Inference-Anteil und Efficiency bilden die Users-Kapazität. Creditfaktoren sind
multiplikativ, einschließlich bereits ausgewerteter Potenzen. Data-Rohboni werden
addiert und danach gemeinsam komprimiert. Die Momentanrate ist kein Versprechen
für ein langes Intervall: Lifetime-Data-Synergie verändert sich während Produktion.
UI, Ereignisdiagnose und Export verwenden diesen Snapshot. Wissenschaftliche
Werte bleiben Mantisse/Exponent; native Werte sind begrenzte Anzeigeprojektionen.
Binary64-Mantisse: etwa 15–16 signifikante Dezimalstellen; ganzzahliger sicherer
Exponent. Keine beliebig exakte Dezimalarithmetik; kleine Summanden/Abzüge können
unterhalb dieser Präzision verschwinden, logarithmische Potenzen runden zusätzlich.

Lokales ZIP bleibt erhalten, Exportformat v3 / Report v2. `economy.json` enthält
unverändertes BALANCE und dokumentierte Formeln; Snapshot liefert die tatsächlich
angewendeten Faktoren auch für Effekte, deren Konstanten im Domaincode stehen.
Neue Ereignisse speichern wissenschaftliche Ledger/Raten, Quelle, Kontext und
Auftrags-ID. Forschungs-/Trainingsstarts und Abschlüsse sind zuordenbar, Analysen
haben ID/Start/Ende, Crafting-Reservierung wird ausschließlich beim Queuing gebucht.
Starts/Teilabschlüsse dokumentieren dieselbe Reservierung, sind keine erneuten
Abzüge; `resultQuantity` zählt pro abgeschlossenem Exemplar genau eins.
50 Startcredits stehen getrennt im Startvertrag/Reset-/Challenge-Start-Ereignis und
werden weder als Umsatz noch als Produktions- oder Questfortschritt gebucht.

Hauptspiel ist die bisherige Summary, aktive Challenge ein eigener Kontext mit
Jobs, Snapshot und eigenen Metriken. Timeline ordnet beide eindeutig zu. Nach
Rückkehr bleiben höchstens 500 Challenge-Ereignisse erhalten; Return dokumentiert
nur tatsächlich übertragene Sterne einmal. Challenge-Metrikfenster und individuelle
Snapshots werden nach Rückkehr nicht aufbewahrt; dies ist ausdrücklich als fehlend
markiert, verworfene Snapshots werden gezählt. Alte Ereignisse ohne Kontext werden
`unclassified`, nicht nachträglich als Hauptspiel oder Challenge erfunden.

Grenzen: je 500 Recent-/Permanent-Ereignisse, 300 ausgedünnte Snapshots, 200
Prestige-Histories, bestehende 15-Minuten-Metrikfenster/Archiv. Diagnose zählt
verworfene Ereignisse und Snapshots; seit diesem Fix bekannte verworfene
Ereignisbereiche werden ausgewiesen. Alte Bereichsenden bleiben unbekannt.
Inventarbestände sind keine Fundraten. Blockierte Aktionen sind einzelne beobachtete
Ereignisse, keine abgeleiteten vollständigen Engpassverläufe. Alte wissenschaftliche
Messwerte fehlen, native Metrikaggregate sind nicht nachträglich exakte SCI-Summen.

Downloads sind auf 8 MiB ZIP begrenzt; Überschreitung wird gemeldet, keine
stillschweigende Ausgabe eines unbegrenzten Archivs. Async-Export arbeitet aus
geklontem Zustand, gibt zwischen Dateien den Eventloop frei, meldet Fortschritt und
akzeptiert AbortSignal auch vor dem Klonen. Personenfelder werden gefiltert,
Jobs/Items ausdrücklich projiziert; kein vollständiger Save, Profil, KI-/Spielername,
Konto-/Geräteinfo und kein Upload. Separater Spielstandexport bleibt bestehen.

## Prüfungen

Abnahme des finalen Quellstands mit Node 22.23.3: Typecheck bestanden; 305 gezielte
Tests bestanden (275 in 14 Dateien, dazu 15 Export- und 15 Economy-Tests).
Drei Langzeitfälle bewusst nicht ausgewählt. Jede Suite unter fünf Minuten
(große Auswahl 6,66 s, einzelne Suiten unter 1,5 s). Production-Build bestanden
(80 Module); verbleibende Vite-Warnung: Hauptchunk 632,25 kB über 500 kB.
`git diff --check` bestanden. Auf dem Commit nochmals ausgeführt; Ergebnisse
im PR/Übergabetext. Kommandos:

```
timeout 300 npx vitest run src/sharedPreviews.test.ts src/balanceExportContracts.test.ts src/challengeIsolation.test.ts src/challengeUi.test.tsx src/saveValidation.test.ts src/storage.test.ts src/durableStorage.test.ts src/purchaseMath.test.ts src/researchEconomy.test.ts src/training.test.ts src/atomicCrafting.test.ts src/crafting.test.ts src/mobileMetaPolish.test.ts src/prestigeSeasonMobile.test.ts
timeout 300 npx vitest run src/balanceReport.test.ts -t '^(?!.*fixed-profile balance simulation)'
timeout 300 npx vitest run src/economy.test.ts -t '^(?!.*clamps negative time)'
npm run typecheck
npm run build
git diff --check
```

Zwei bestehende Tagesprofil-Tests sowie ein 8-Stunden-Cap-Test werden per gezielter
Namensauswahl nicht gestartet; keine Dateien ausgeschlossen, Assertions geändert
oder Tests deaktiviert. Keine Gesamtsuite, FAST/DEEP oder Langzeitkampagne.
Zusätzlicher einmaliger Vergleich der ursprünglichen Main-Produktionsfunktionen
gegen die refaktorierten Funktionen: 24 vorbereitete Zustände × vier
wissenschaftliche Raten, alle identisch; BALANCE vollständig identisch. Das
Vergleichsmodul wurde nur temporär aus `git show 8ed46e3:src/economy.ts` gelesen.

Chromium bei 390×844: DE/EN öffnen echte Produktions-/Auftragsdetails, 44 px
Summary-Ziele, keine horizontale Seitenüberbreite und keine Pageerrors. Der erste
Browser-Fixtureversuch traf den Namensdialog, weil die laufende App ihren ersten
Save schrieb; Fixture danach korrekt direkt über `persistDurableGame` gesetzt.
Keine Produktänderung wegen dieses Testaufbaufehlers.

Die bekannten Schicht-3-Referenzabweichungen (Forschungsgrenze 361 statt 313,
Analysegrenze 57700 statt 59132) und die offene optionale
Langzeitbalance bleiben unverändert. Referenzen und Economy nicht angepasst.
Die bestehende PR-CI startet pauschales `npm test`; der Commit erhält `[skip ci]`,
um die ausdrücklich untersagten Langzeitkampagnen nicht durch PR-Erstellung
anzustoßen. Keine vollständige Gesamtabnahme oder grüne Gesamt-CI behauptet.
