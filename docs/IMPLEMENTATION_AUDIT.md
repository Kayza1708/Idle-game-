# Implementierungs-Audit

## Umfang

- Geprüfter Ausgangs-Commit: `534bc5f` (`Add Layer-1/2/3 economy calibration docs and machine-readable balance outputs`).
- Arbeitsstand: bereitgestellter Checkout; `git remote -v` liefert keinen Remote. `git fetch --all --prune` lief deshalb ohne Fehler, aber auch ohne Remote-Daten. Ein Vergleich mit einem Serverstand war nicht möglich.
- Keine Balancewerte und keine Gameplay-Formeln wurden in diesem Audit geändert.
- Statusbegriffe: **bestätigt** = Codepfad plus passende automatisierte Prüfung; **konkreter Fehler** = reproduzierbarer Defekt; **nicht implementiert** = geforderter größerer Pfad fehlt; **nicht prüfbar** = Umgebung erlaubt keine belastbare Prüfung.

## 1. Speichern

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Asynchroner Save überschreibt keinen neueren In-Memory-Zustand | **bestätigt** | `SaveCoordinator` liest den aktuellen Zustand erst unmittelbar vor jedem Schreibvorgang und schreibt nie in den React-Zustand zurück. `durableStorage.test.ts` hält einen Write künstlich offen und bestätigt, dass Zustand 3 erhalten bleibt. |
| Maximal ein Schreibvorgang; anschließend neuester Stand gespeichert | **bestätigt** | `running`/`pending` koaleszieren parallele Requests zu einem aktiven und einem nachfolgenden neuesten Snapshot. Tests bestätigen `maxActive === 1`, Snapshots `[1,3]` und Reload des neuesten Zustands. |
| Laden vor Simulation und Autosave | **bestätigt** | Beide Timer-Effekte brechen bei `ready === false` ab. `ready` wird erst nach Local→IndexedDB-Migration, Durable-Load, Offline-Fortschritt und optionaler Persistierung gesetzt. |
| Realer IndexedDB-Lebenszyklus im Browser | **nicht prüfbar** | Kein Chromium, Chrome oder Firefox im Container. Die Transaktionslogik ist unit-getestet, aber Page-Lifecycle/Quota konnte nicht interaktiv geprüft werden. |

## 2. Komponenten

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Shop vergibt nutzbare Komponenten | **bestätigt** | `componentRewards.test.ts`: 120 Gems buchen atomar 120 Schaltkreise, aktualisieren Gesamt-/Lifetimebestand und sind unmittelbar im echten Modulrezept verbrauchbar. Unterdeckung ändert nichts. |
| Onboarding vergibt nutzbare Komponenten | **bestätigt** | Claim bucht 75 Schaltkreise und Claim-Status gemeinsam; zweiter Claim gibt denselben Zustand zurück. |
| Ad-Testpfad vergibt nutzbare Komponenten | **bestätigt** | Erfolgreicher, berechtigter Komponenten-Ad bucht zwei Schaltkreise; Transaktions-ID verhindert doppelte Callback-Belohnung. Cancel/Limit/fehlendes Prestige ändern nichts. |
| Kosten, Bestand und Claim atomar | **bestätigt** | Shop nutzt `spend(..., apply)`, Onboarding setzt Claim und Reward in einem reinen Zustandsübergang, Ads schreiben Transaktion und Reward gemeinsam. Gezielte Tests decken Unterdeckung und Doppelaufruf ab. |

## 3. Challenges und Onboarding

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Challenge zählt nur Einnahmen des aktuellen Runs | **bestätigt** | Fortschritt ist `lifetimeEligibleCredits - eligibleAtStart`; nicht berechtigte Credits zählen nicht. |
| Vorhandenes INT ermöglicht keinen Sofortabschluss | **bestätigt** | `retention.test.ts` startet aus einem reichen Account und erwartet Fortschritt 0, bis im Run neue berechtigte Einnahmen entstehen. |
| Wiederholung gibt keine weiteren Erstabschlusssterne | **bestätigt** | Nur `previous === 0` addiert Sterne; Wiederholung verbessert ausschließlich Count/Bestzeit. |
| Kein entferntes Klassen-Upgrade im Onboarding | **bestätigt** | Historische ID `class-upgrade` verlangt tatsächlich den weiterhin vorhandenen 25er-Taschenrechner-Meilenstein; Tests prüfen 24/25 und einmaligen Claim. |
| Kein fehlendes Einführungsexperiment | **bestätigt** | Tutorial fordert die echte kurze Hardwareanalyse; `intro` wird im Startpfad ausdrücklich abgewiesen und durch Test abgesichert. |
| Craft-Tutorial markiert echtes, freigeschaltetes Ziel | **konkreter Fehler → behoben** | Der Rezeptfinder ignorierte `craftAffordability.unlocked` und konnte so ein gesperrtes Rezept hervorheben. Er filtert nun auf freigeschaltete Rezepte und meldet eine fehlende Freischaltung ehrlich. Der Regressionstest prüft den gesperrten Zustand sowie das echte Impulsrelais-Ziel nach Bauplanfreischaltung. |

## 4. Forschung und Analysen

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Separate Slots und korrekte Sperrgründe | **bestätigt** | `analysis.test.ts` startet Analyse parallel zu belegtem Forschungslabor und prüft Data-Mangel, belegten Analyseslot und fehlendes SBC. |
| Verträge startbar, einmaliger Abzug/Abschluss | **bestätigt** | `researchEconomy.test.ts`, `analysis.test.ts` und `clock.test.ts` prüfen exakten Startabzug, Doppelklickschutz und genau einen Online-/Offline-/Reload-Abschluss. |
| Gespeicherte Endzeit unveränderlich | **bestätigt** | Tests ändern Laborautomation/Laborboost nach Start und vergleichen unverändertes `endsAt`. |
| Rare-Fallback gibt keinen Quantenkern garantiert | **bestätigt** | `guaranteeRare` fällt auf Graphen zurück; Test durchläuft alle Rare-Komponenten und bestätigt explizit `quantumCores === undefined`. |

## 5. Crafting und Equipment

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Keine unbeabsichtigte Instant-Herstellung | **bestätigt** | `craft` reserviert Ressourcen und stellt einen Werkbankauftrag ein; Items entstehen erst in `settleCrafting`. Der direkte `createItem`-Pfad ist auf ausdrücklich definierte Belohnungen, Drops, Fusion und Testwerkzeug begrenzt. |
| Reservierung, Queue, Abbruch und Offline-Abschluss | **bestätigt** | `crafting.test.ts` prüft Queue-Limit, Rückerstattung ausschließlich wartender Aufträge, Serienlauf und großen Offline-Sprung. |
| Ausrüsten, Ersetzen, Entfernen, Vergleich | **bestätigt** | `equipmentDialog.test.ts` prüft Slotgrenzen, Ersetzen ohne Itemverlust, Entfernen, Reload und Preview gegen echte Economy. |
| Keine Doppelbelegung/Mythic zu Common-Kosten | **bestätigt** | Slots sind nach Kategorie eindeutig; `crafting.test.ts` weist Mythic für Common-Rezept ab und bestätigt Common-Ergebnis bei Common-Kosten. |
| Impulsrelais-Vergleichstext | **konkreter Fehler → behoben** | Der Dialog hängte an den festen Zehn-Tap-Effekt fälschlich einen rarity-basierten `+8,0 %`-Wert. Eine reine Copy-Funktion zeigt nun nur den tatsächlichen festen Effekt; Regressionstest verhindert die Prozentanzeige. |

## 6. Darstellung

| Prüfpunkt | Status | Beleg |
|---|---|---|
| Fundkarten entsprechen gebuchten Materialien | **bestätigt** | `componentFind` bildet ausschließlich positive Deltas zwischen Vorher-/Nachher-Komponentenbestand ab; `RewardFeedback.test.ts` prüft exakte Schaltkreis-/Graphenmengen und korrektes Zusammenfassen. |
| Explizite Bildzuordnungen | **bestätigt** | Komponenten verwenden ein vollständiges `Record<ComponentId,...>`, bestehende Items explizite Atlaszellen; das Impulsrelais nutzt bewusst eine eigene CSS-Grafik statt einer falschen Zelle. TypeScript erzwingt vollständige Zuordnung. |
| Profil-Sammlungszähler | **konkreter Fehler → behoben** | `itemTypesTotal` war nach Ergänzung des Impulsrelais weiterhin hart auf 9 gesetzt. Der Wert wird nun aus dem echten Itemkatalog abgeleitet; Regressionstest erwartet 10. |
| Profil-Tabs, Dialogaktionen, Navigation bei 390 px | **nicht prüfbar** | CSS enthält mobile Regeln, 44-px-Aktionen, scrollbare Modale und einspaltige 390-px-Layouts. Ohne Browser ist dies kein bestätigter visueller Test. |
| Tutorial-Highlights verschwinden korrekt | **bestätigt** für Zustandslogik | Story-Tests prüfen echte Aktionen/Abschlüsse, kein vorzeitiges Weiterschalten, Skip/Resume und keine duplizierte Queue. Visuelle Positionierung bleibt mangels Browser nicht prüfbar. |
| Rückkehrbericht belohnt nicht erneut | **bestätigt** | `returnOverview.test.ts` lädt nach bereits abgerechneter Rückkehr erneut bei derselben Zeit und erwartet null neue Credits sowie unveränderten exakten Bestand. |

## Behobene Fehler (maximal drei)

1. Craft-Tutorial konnte ein noch gesperrtes Rezept als echtes Ziel hervorheben.
2. Equipment-Dialog zeigte beim festen Impulsrelais-Effekt einen erfundenen Seltenheits-Prozentwert.
3. Profil-Sammlung meldete trotz zehn Itemtypen weiterhin einen Gesamtwert von neun.

## Offene Punkte nach Priorität

1. **Browser-/Lifecycle-Prüfung:** kompletter neuer Run und IndexedDB-Lifecycle inklusive Background/Pagehide in einem echten Browser; im Container nicht möglich.
2. **390-px-Visualprüfung:** Profil-Tabs, Dialoge, Tutorial-Fokus, Analyse, Crafting und Equipment mit realer Pointer-/Fokusnavigation prüfen.
3. **Langzeitsuite:** separat mit größerem CI-Zeitbudget ausführen; ein lokaler Timeout ist kein Balance- oder Stabilitätsnachweis.

## Ausgeführte Prüfungen

- `npm run typecheck`
- `npm test -- --run src/tutorialGuide.test.ts src/retention.test.ts src/equipmentDialog.test.ts`
- `npm test -- --exclude src/longTermSimulation.test.ts`: 32 Dateien und 278 Tests bestanden.
- `npm run build`: Typecheck und Vite-Build bestanden; Vite meldet lediglich den bereits bestehenden Chunk-Größenhinweis.
- `timeout 120 npm test -- --run src/longTermSimulation.test.ts`: nach 120 Sekunden mit Exit 124 abgebrochen, bevor Vitest ein Ergebnis ausgab; deshalb **nicht prüfbar** in diesem Zeitbudget.
- Browser-Erkennung (`chromium`, `chromium-browser`, `google-chrome`, `firefox`): kein Browser im Container gefunden; der geforderte interaktive Durchlauf und die 390-px-Prüfung bleiben **nicht prüfbar**.

## Prestige-Nachprüfung (1. Oktober 2026)

- **Behoben:** Die bisherige Prestige-Karte behauptete fälschlich, laufende Forschung und Forschungsqueue würden gelöscht. Vorschau, Bestätigungsdialog und Mira-Text bilden jetzt den tatsächlichen Vertrag ab: Forschung und Crafting laufen weiter; Training und Analyse werden ohne Erstattung beendet.
- **Bestätigt:** Mindestens eine beanspruchbare INT ist die einzige Prestigesperre. Zweiter Aufruf und Reload erzeugen keine zusätzliche INT; ausgegebene INT reduzieren den Lifetime-Creditbonus nicht.
- **Bestätigt:** Komponenten, Module, Baupläne, Items, Equipment, Gems, Achievements, Quest-/Season-Zustand und reservierte Crafting-Aufträge bleiben erhalten. Der erste kostenlose Equipment-Platz entsteht genau einmal aus dem ersten Prestige.
- **Nicht prüfbar:** Das neue mobile Bestätigungsfenster konnte mangels Browser nicht bei 390 px visuell geprüft werden.
