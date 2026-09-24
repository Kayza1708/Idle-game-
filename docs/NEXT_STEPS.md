# Übergabe und nächste Schritte

## Aktueller Stand

Save v6 erweitert den vorhandenen Phase-1-Kern ohne Rewrite: drei Compute-Profile, Nutzer, Daten, Forschungspunkte, drei bezahlbare Projekte, Softcap-Training und der vollständige 15-Klassen-Katalog sind mit der bestehenden Simulation, UI und Migration verbunden. Der erste Run bis Singularität bleibt die priorisierte spielbare Strecke.

## Bekannte Einschränkungen

- Module/Loadouts, deterministische Durchbruchswahlen, Prototyp-Items und Axiome sind dokumentierte Folgeschritte, keine fertigen Menüpunkte.
- Klassen 6–15 besitzen IDs, Rollen und Economy-Werte, aber ihr Langzeitbalancing und individuelle Synergien sind noch nicht abgenommen.
- Die aktuellen Tabellen in `balance-report.md` sind eine Vergleichsbasis der vorherigen Phase-1.1-Kurve; nach der Compute-Aufteilung ist ein neuer vollständiger Simulationslauf erforderlich.
- Registry-Zugriff auf `vitest` antwortet in dieser Umgebung mit HTTP 403. Deshalb konnten `npm ci`, Vitest, Production-Build, Audit und Browser-Screenshots nicht ehrlich abgeschlossen werden. TypeScript-Typecheck lief erfolgreich.

## Nächste drei priorisierte Aufgaben

1. Vollständiges Lockfile in einer Umgebung mit Registry-Zugriff erzeugen, `npm ci`, Audit, Tests und Build ausführen und erst danach Browserbilder bei 390×844/Desktop aufnehmen.
2. Eine eingecheckte Simulation für aktiv/gelegentlich/offline sowie vier Builds ergänzen und Prestige-Schwelle/Projektkosten anhand der Ergebnisse kalibrieren.
3. Phase 2 mit drei Modulsockeln, gespeicherten Loadouts und deterministischen Durchbruchswahlen implementieren.

## Letzter tatsächlich ausgeführter Teststand

Am 24. September 2026 war `npm run typecheck` erfolgreich. `npm ci` scheiterte reproduzierbar am Registry-HTTP-403 für die direkte Entwicklungsabhängigkeit `vitest`; dadurch waren `npm test` und `npm run build` nicht ausführbar. Ein erzwungenes Audit-Fix wurde nicht eingesetzt.

## Offene Designentscheidungen

- Rollen/Synergien und Freischaltbedingungen der Klassen 6–15 nach echten Langzeitmessungen.
- Konkrete Opportunitätskosten der vier geplanten Labor-Builds.
- Anforderungen und Resetumfang des späteren Axiom-Layers.
