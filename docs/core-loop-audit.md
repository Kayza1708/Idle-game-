# Auftrag 7A – volle Compute-Nutzung

## Ausgangsstand und Ursache

PR #71 ist gemergt. `origin/main` wurde erfolgreich abgeglichen; Ausgangscommit ist `af9575ce612b5980b400b3b2f0bf2dfe3e8f5284`, enthält `de33d29c4fbbef66dfbfdd3377bf0a57dc63696e`. Eigener Branch `codex/full-compute-user-capacity`; Vorgängerbranch unverändert, keine offene PR-Abhängigkeit.

`usersRateScientific` nutzte bisher nur den Inference-Anteil des alten Profils: 75 %, 60 % oder 65 %. `researchRateScientific` verwendete ebenfalls einen Profilanteil. Damit änderten wirkungslose Profilwerte die reale User-/Credit-Produktion. Feste Trainings-/Forschungs-/Analysezeiten benötigten diese Aufteilung bereits nicht.

## Vertrag und Änderung

Credits kaufen Hardware. Die Summe ihrer wirksamen Beiträge ergibt Compute/s; die komplette Rate bedient Users mit vorhandener Efficiency, Kapazitätsmodifikatoren und Compute-pro-User-Basis. Users ergeben Credits/s mit den bestehenden Quality-/Revenue-/Creditfaktoren. Keine doppelte Anwendung: Klassenbeiträge werden addiert, bestehende globale Faktoren einmal multipliziert, bestehende Potenzen behalten ihre Position.

Compute ist kein Guthaben. Jobs starten gegen dieselben Kosten und behalten ihre festen Endzeiten; kein Job entzieht Kapazität. Die Forschungsrate benutzt volle Compute als Eingang ihrer unveränderten Formel. Data behält die bestehende sqrt(Users)-Formel einschließlich Kompression: der höhere Wert entsteht ausschließlich durch die vollständige User-Kapazität, nicht durch Data-Kalibrierung.

Die Allocation-Helfer und aktive Profilaktion entfallen. Gespeicherte Profil-IDs samt Validierung/Migration bleiben unverändert; weder Saveformat noch Ressourcen werden zurückgesetzt. DE/EN-Hinweise ersetzen Effektbehauptungen. Domain, Produktionsdetails und Export verwenden denselben Snapshot mit `capacity` und `utilization: 1`. Der Export führt historische Profil-IDs ausschließlich unter wirkungsloser Kompatibilitätsmetadaten; ZIP, Datenschutz, Limits und Abbruch bleiben erhalten.

## Reproduktion auf identischen vorbereiteten Zuständen

`early`: neuer Stand, erster Taschenrechner regulär für 15 Credits gekauft. `hardware`: vorbereitete 1e6 Credits/Data, 25 Taschenrechner und ein SBC regulär bezahlt. `bonuses`: identischer Hardwarezustand, Quality 5, Efficiency 3, Modelllevel 8, Compute Optimization 2, User Scaling 2, Commercialization 3, Compute-Netz-Knoten 1 und zwei historische Axiome. Kein natürlicher Progressions- oder Langzeitlauf. Jeder Zustand wird mit allen drei gespeicherten Profilen gemessen, ohne Zeitfortschritt oder weitere Aktionen.

Originalmessung am unveränderten Ausgangsstand vor dem Fix; Nachmessung mit demselben Skript. Reproduktion: `npx vite-node --script scripts/core-loop-comparison.ts` (Node 22). Vollständige wissenschaftliche Daten einschließlich Data-Raten: [core-loop-comparison.json](core-loop-comparison.json). Für den Ausgangsstand dasselbe Skript gegen dessen `src/economy` ausführen.

| Zustand | Profil | Compute/s vorher = nachher | Users vorher | Users nachher | Credits/s vorher | Credits/s nachher |
|---|---|---|---|---|---|---|
| early | balanced | 1.105500000000000e+0 | 8.491182624621405e-1 | 1.132157683282854e+0 | 1.260940619756279e+0 | 1.681254159675038e+0 |
| early | training | 1.105500000000000e+0 | 6.792946099697123e-1 | 1.132157683282854e+0 | 1.008752495805023e+0 | 1.681254159675038e+0 |
| early | discovery | 1.105500000000000e+0 | 7.359024941338551e-1 | 1.132157683282854e+0 | 1.092815203788775e+0 | 1.681254159675038e+0 |
| hardware | balanced | 5.894517675585551e+1 | 4.636666720387111e+1 | 6.182222293849481e+1 | 1.748348349699425e+2 | 2.331131132932567e+2 |
| hardware | training | 5.894517675585551e+1 | 3.709333376309688e+1 | 6.182222293849481e+1 | 1.398678679759540e+2 | 2.331131132932567e+2 |
| hardware | discovery | 5.894517675585551e+1 | 4.018444491002162e+1 | 6.182222293849481e+1 | 1.515235236406168e+2 | 2.331131132932567e+2 |
| bonuses | balanced | 1.009977331722306e+2 | 1.125396170550766e+2 | 1.500528227401022e+2 | 2.468761895257974e+3 | 3.291682527010631e+3 |
| bonuses | training | 1.009977331722306e+2 | 9.003169364406130e+1 | 1.500528227401022e+2 | 1.975009516206378e+3 | 3.291682527010631e+3 |
| bonuses | discovery | 1.009977331722306e+2 | 9.753433478106640e+1 | 1.500528227401022e+2 | 2.139593642556909e+3 | 3.291682527010631e+3 |

## Präzision und kurze Prüfungen

ScientificNumber verwendet binäre Number-Mantissen, ungefähr 15–16 signifikante Stellen, keine beliebig exakte Dezimalarithmetik. Großzahlen werden wissenschaftlich weitergerechnet/exportiert. Kurze geteilte Zeitintervalle/Reload werden bei der vorhandenen numerischen Integration mit relativer Toleranz 1e-12 verglichen; keine Änderung am Integrator oder an bestehenden Assertions.

Gezielte Prüfungen: `coreLoop`, `sharedPreviews`, `balanceExportContracts`, `saveValidation`, `storage`, `durableStorage`, `researchEconomy`, `training`; separat kurze `economy`-Tests ohne den bestehenden 8-Stunden-/Großzeitsprung-Test `clamps negative time`. Der Lauf ist per `timeout 300` begrenzt. Die vorhandene Profil- und Exportparameter-Assertion wurde ausschließlich an den verbindlichen neuen Vertrag angepasst; keine Tests deaktiviert und keine Economy-Grenzen gelockert.

Ergebnis: 117 Tests in acht Dateien bestanden (4,23 Sekunden), separat 15 kurze Economy-Tests bestanden (0,70 Sekunden); ein bestehender 8-Stunden-/Großzeitsprung-Test durch die Auswahl bewusst nicht ausgeführt. Typecheck und Production-Build bestanden; `git diff --check` ohne Befund. Vite meldet weiterhin den Bundle-Hinweis über 500 kB (643,51 kB), kein Buildfehler. Diese Prüfungen werden unverändert auf dem finalen Commit wiederholt. Kein pauschales `npm test`, keine Gesamtsuite, FAST/DEEP oder Langzeitkampagne. CI startet laut Repositoryworkflow eine solche Gesamtsuite; `[skip ci]` vermeidet sie für diesen ausdrücklich beschränkten Auftrag.

## Offen und unverändert

Wirkungslose Trainingsboni bleiben Auftrag 7B. Bekannte Schicht-3-Referenzabweichungen (361/313 sowie 57700/59132) und Langzeitbalance bleiben separat offen; keine Referenzen, Hardwarepreise, Kurven, Forschungszeiten, Prestigeformeln oder Dropwerte angepasst. Frühere Balance-Messungen sind historische Messungen des damaligen Vertrags, kein Nachweis für die jetzt volle Kapazität. Grüne kurze Techniktests bestätigen keine Langzeitbalance.
