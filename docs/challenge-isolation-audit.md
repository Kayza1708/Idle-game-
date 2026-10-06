# Auftrag 4: isolierte Challenge-Runs

Basis: `06d39de`, Draft-PR [#66](https://github.com/Kayza1708/Idle-game-/pull/66), noch nicht gemergt. Eigener Folgebranch `codex/isolated-challenge-runs`, PR-Basis `codex/run-start-auto-prestige`. #66 muss zuerst integriert werden; der Vorgängerbranch wurde nicht verändert. ScientificNumber/Kauf-Fix `47d706d` und Zutatenreservierungen/Validierung `d9c8bb3` sind enthalten. Kein behaupteter neuer Main-Abgleich.

## Ursache und reproduzierbarer Vergleich

Die bisherigen `startRunChallenge`, `abortRunChallenge` und `completeRunChallenge` verwendeten `resetRun` direkt auf dem Hauptspiel. Dabei gingen abgeschlossene Forschung und laufende Labore/Analysen verloren; es existierte keine Hauptspiel-Kopie. Der Start setzte außerdem 0 Credits und `hardware=1`, obwohl alle Hardwaremengen 0 waren. No-Taps konnte weder produzieren noch den ersten Taschenrechner bezahlen.

Der Vorher-Test verwendet die Originalfunktionen aus `06d39de`, echte Forschungs-, Item-, Ausrüstungs- und Kaufaktionen sowie einen erfolgreich validierten Hauptspielstand: `blueprints`, ein aktives Datenerzeugungs-Labor, ein seltener ausgerüsteter Quantenchip, 50 Credits. Ergebnis: Challenge und Abbruch haben keine Forschung und kein aktives Labor; Challenge hat 0 Credits, Hardware-Zähler 1, tatsächliche Taschenrechner 0. `buyHardwareClass(...,'calculator',1)` bleibt unverändert. Der temporäre Vorher-Test wurde nicht ins Produkt übernommen.

Nachher-Reproduktion: `challengeIsolation.test.ts`, insbesondere Start/Kauf sowie Start → 300 Sekunden Simulation → Abbruch/Erfolg. Challenge beginnt mit exakt 50 Credits und 0 Hardware; der echte Kauf zieht 15 Credits ab, übrig bleiben 35, danach entsteht positive Produktion. Das Hauptspiel entspricht dem separaten regulären passiven Referenzlauf: Forschung, Ausrüstung, Produktion, bezahlte Automationskäufe und reguläre Jobabschlüsse bleiben erhalten. Erfolg ergänzt ausschließlich die bisherigen ersten Challenge-Sterne und die bestehenden Clear-/Bestzeit-Metadaten. Wiederholung erhöht Clears, nicht Sterne.

## Zustands- und Zeitvertrag

- Der sichtbare `GameState` ist während des Runs der eigenständige Challenge-Zustand. `challengeSession.main` enthält den vollständigen Hauptspielzustand; `anchor` entspricht dessen `savedAt`. Hauptzustand und Challenge besitzen getrennte Ressourcen, Inventare, Ausrüstung, Jobs, Zähler und ScientificNumber-Ledger.
- Die vorhandenen Challenge-Definitionen erlauben keine ausdrücklich definierten geerbten Economy-Boni. Die Übernahme-Whitelist enthält ausschließlich kosmetische Einstellungen/Namen, Kampagnenidentität und die vorhandene Uhr. INT, Axiome, Nodes, Mastery, Items, Module, Forschung, Kauf-/Produktionsboni und Automation werden nicht aus dem Hauptspiel übernommen. Keine neuen Challenge-Regeln oder Belohnungen hinzugefügt; die fünf bisherigen Einschränkungen gelten weiter.
- Die zentrale bestehende Run-Initialisierung vergibt einmal 50 Credits/0 Hardware; das ist kein Produktions-, INT-, berechtigter Umsatz- oder Questfortschritt. Challenge erhält keine gemeinsam ausgebbaren Gems. Laden setzt bestehende Bestände nicht erneut auf 50.
- `advance` und `advanceTo` verwenden für beide Zustände dieselbe vorhandene Simulation. Das Hauptspiel erhält stets `active=false`; seine vorhandenen Jobs und Offline-Automationen laufen nach ihren normalen Regeln weiter. Challenge-Taps, aktive Zeit und Challenge-Modifikatoren erreichen es nicht.
- `advanceTo` berücksichtigt die individuelle bestehende Offline-Kapazität und konsumiert auch verlorene Wall-Time. Nach jedem Fortschritt werden der aktualisierte Hauptzustand, der Zeitanker und sein kumulierter Produktions-/Abschlussbericht gemeinsam ersetzt. Rückkehr synchronisiert noch offene Zeit und stellt diesen aktualisierten Zustand wieder her. Weder Reload noch doppelte Lifecycle-Signale spielen bereits konsumierte Zeit erneut ab.
- Erfolg/Abbruch entfernen den aktiven Run. Challenge-Bestände und Ergebnisse werden verworfen; normale Hauptspiel-Resets, Gem-Shop und Hauptspiel-Claims sind im Challenge-Aktionspfad und den tatsächlichen Domaintransaktionen gesperrt. Challenge-Missionsablauf verteilt ebenfalls keine Claim-Gems.
- Die Rückkehrübersicht zeigt bereits gebuchte Hauptspielproduktion und reguläre Abschlüsse, einschließlich normaler passiver Ausgaben; sie vergibt nichts erneut. Abbruch verlangt eine Bestätigung. DE/EN zeigen Regel, 1-INT-Fortschritt, tatsächliche erste/repetierte Sterne und „Hauptspiel läuft passiv weiter“.

Die bestehende ScientificNumber-Präzision bleibt unverändert: binäre Mantisse mit ungefähr 15–16 signifikanten Dezimalstellen, sicherer ganzzahliger Exponent; keine beliebig exakte Dezimalarithmetik. Ein Hauptledger von `1e1000` bleibt durch Challenge/Save/Reload/Abbruch werttreu erhalten.

## Save v41 und bekannte ältere Runs

Das zusätzliche Hauptspiel und der Zeitanker erfordern Save v41. Ein einzelner validierter Envelope enthält beide Zustände und Reservierungen; derselbe Validierungspfad schützt Serialize, Load und Import. Er prüft auch rekursiv Hauptspiel, Challenge-ID/Run, Referenzen, Ledger, Reservierungen, Bericht und Zeitanker. Verschachtelte Sessions, fehlendes Hauptspiel und widersprüchliche Anker werden abgewiesen. Ein ungültiger Import ändert weder laufenden Stand noch Hauptsave/Backups.

Alte Challenge-Saves hatten keinen historischen Hauptspielzustand. Die ursprüngliche v24-Metadatenform `id/startedAt` und die spätere Form mit Run-ID/Umsatzbasis werden erkannt und geprüft. Ihr Run wird ohne Erfolgsbelohnung beendet; sämtliche noch bekannten gültigen gespeicherten Ressourcen, Items und Jobs werden erhalten. Die Migration erfindet keinen historischen Hauptfortschritt, keinen getrennten rückwirkenden Challenge-Anteil und kein neues Startkapital. Die DE/EN-Warnung erklärt die fehlende historische Wiederherstellbarkeit. Unbekannte IDs oder beschädigte Metadaten werden nicht durch diesen Weg still gelöscht.

Bei beschädigtem IndexedDB-Hauptsave kann ein gültiges Backup angezeigt werden, aber automatisch gespeichert wird dann nicht. Original und Backups bleiben unverändert; das beschädigte Original ist exportierbar. Eine ausdrücklich importierte gültige Datei kann die Speichersperre aufheben. Das wurde im echten Browser mit beschädigtem eingebettetem Hauptinventar und anschließendem Challenge-Kauf geprüft.

## Kurze technische Abnahme

Node 22 gemäß vorhandener Cloud-Einrichtung. Keine Parameter für Produktion, Preise, Forschung, Analyse, Prestige, Drops oder Offline-Regeln geändert.

Gezielte Suite (höchstens 300 Sekunden Wall-Time):

```sh
timeout 300s npx vitest run src/challengeIsolation.test.ts src/challengeUi.test.tsx src/retention.test.ts src/saveValidation.test.ts src/storage.test.ts src/durableStorage.test.ts src/mobileIntegration.test.ts src/mobileMetaPolish.test.ts src/prestigeSeasonMobile.test.ts src/gemShop.test.ts src/season.test.ts src/onboarding.test.ts src/progression.test.ts src/progressionV2.test.ts src/atomicCrafting.test.ts src/crafting.test.ts
```

Die gezielte Suite umfasst 198 Tests in 16 Dateien. Ein vorheriger Entwicklungslauf mit 197 Tests bestand in 8,80 Sekunden; der zusätzliche kurze Jobtest prüft ausdrücklich alle vier regulären Abschlüsse samt Reload und Wiederholungsfreiheit. Neue Challenge-Simulationen umfassen nur 30–610 Sekunden mit vorbereiteten gültigen Zuständen und regulär gestarteten/reservierten Jobs. Die Erfolgsfälle bereiten den berechtigten Zielumsatz über den echten Ledger-Helfer vor; sie prüfen die Transaktion, keine natürliche Challenge-Progression oder Balance. Der kurze Vergleich verwendet identische 30-Sekunden-Grenzen und deterministische Drops; die vorhandenen Einkaufsentscheidungen im Hauptspiel bleiben identisch.

Zusätzlich gezielte kurze Clock-/Simulationsfälle, ohne den mehrstündigen Offline-Cap-Fall zu starten:

```sh
timeout 300s npx vitest run src/clock.test.ts -t 'for ten seconds|autosave-style|without inventing|does not mutate nested'
npm run typecheck
npm run build
git diff --check
```

Finale Ergebnisse und Commit-ID werden im Folge-PR dokumentiert. Der bestehende PR-Workflow `.github/workflows/ci.yml` startet pauschal `npm test`; deshalb verhindert `[skip ci]` im Commit dessen automatischen Start für diesen Auftrag. Der Workflow und die Tests bleiben unverändert. Es wird keine grüne GitHub-CI oder Gesamtabnahme behauptet. Keine Assertions entfernt, keine Tests deaktiviert; die bewusst begrenzte Testauswahl ist keine Gesamtsuite.

Chromium bei 390×844: regulärer Challenge-Kauf, gesperrter Shop, Abbruch ablehnen/bestätigen, echte Hauptspiel-Rückkehrübersicht, Reload und beschädigter Nested-Main mit unveränderten IndexedDB-Original-/Backupwerten. Touch-Buttons mindestens 44 px, kein horizontaler Überlauf, keine Page-Errors. Belegter mobiler Lauf: Hauptspiel startet mit 35 Credits/1 bezahltem Taschenrechner, kehrt mit 38,37056544602372 Credits/1 Taschenrechner zurück; keine Challenge-Hardware übernommen und keine Abbruch-Sterne.

## Offen und ausdrücklich nicht abgenommen

Keine pauschale Gesamtsuite, FAST-/DEEP-Kampagne, 7-/30-/60-Tage-Simulation oder Langzeitbalancebewertung gestartet. Die auf Basis `06d39de` dokumentierten Schicht-3-Referenzabweichungen bleiben bestehen und werden hier nicht neu vermessen: Forschungsgrenze 361 statt 313, Analysegrenze 57700 statt 59132. Das akzeptierte Analysezeitfenster 840–1800 Sekunden und seine 870 Sekunden werden nicht verändert. Langzeitbalance bleibt separat offen; grüne gezielte Techniktests bestätigen sie nicht. Historisch vor Einführung der Isolation verlorener Hauptfortschritt ist aus alten Challenge-Saves nicht rekonstruierbar.
