# Übergabe und nächste Schritte

## Aktueller Stand

Save v9 ergänzt sechs individuelle Meilensteine pro Hardwareklasse, additive INT-Progression, einen funktionsorientierten INT-Baum, lokale Run-Telemetrie und gespeicherten Story-/Tutorialfortschritt. Alle 90 Meilensteine liegen in der zentralen Hardwarekonfiguration.

## Letzter abgeschlossener Arbeitsauftrag

Der kurze Mira-Prolog, das überspringbare handlungsbasierte Tutorial, einmalige Fortschrittsdialoge und Miras Journal sind implementiert. Dialoge werden einzeln geordnet, blockieren die Simulation nicht und bestehende Saves überspringen den Prolog bei der v9-Migration.

## Bekannte Einschränkungen

- Module/Loadouts, deterministische Durchbruchswahlen, Prototyp-Items und Axiome sind dokumentierte Folgeschritte, keine fertigen Menüpunkte.
- Klassen 6–15 besitzen eigene Illustrationen, Rollen und Meilensteine; die Nebeneffekte Automation, Overclock, Offline und Synergie sind teilweise erst als Konfigurationsvertrag vorbereitet.
- Die aktuellen Tabellen in `balance-report.md` sind eine Vergleichsbasis der vorherigen Phase-1.1-Kurve; nach der Compute-Aufteilung ist ein neuer vollständiger Simulationslauf erforderlich.
- Für vor Save v8 liegende Kampagnenabschnitte existieren keine nachträglich rekonstruierbaren Ereignis-, Quellen- oder Offlinewerte; Exporte markieren diese Bereiche als nicht verfügbar.
- `mira-voss.png` war im bereitgestellten Repository-Stand weder im Root noch an anderer Stelle im Dateisystem vorhanden. Die Dialogkomponente verweist bereits ausschließlich auf den geforderten Zielpfad `public/assets/game/mira-voss.png`; die Originaldatei muss dort noch ergänzt werden, bevor die visuelle Abnahme erfüllt ist.
- Registry-Zugriff auf `vitest` antwortet in dieser Umgebung mit HTTP 403. Deshalb konnten `npm ci`, Vitest, Production-Build, Audit und Browser-Screenshots nicht ehrlich abgeschlossen werden. TypeScript-Typecheck lief erfolgreich.

## Nächste drei priorisierte Aufgaben

1. Vollständiges Lockfile in einer Umgebung mit Registry-Zugriff erzeugen, `npm ci`, Audit, Tests und Build ausführen und erst danach Browserbilder bei 390×844/Desktop aufnehmen.
2. Den ausgeführten v7-Kontrolllauf als eingechecktes Simulationswerkzeug ausbauen und Forschungsbedingungen der späteren Klassen kalibrieren.
3. Phase 2 mit drei Modulsockeln, gespeicherten Loadouts und deterministischen Durchbruchswahlen implementieren.

## Letzter tatsächlich ausgeführter Teststand

Am 24. September 2026 waren Typecheck und der kompilierte v7-Economy-Kontrolllauf erfolgreich. Der Kontrolllauf maß erste INT nach 22:52 aktiv beziehungsweise 115:15 passiv. Vitest/Build bleiben vom Registry-HTTP-403 abhängig; kein erzwungenes Audit-Fix wurde eingesetzt.

## Offene Designentscheidungen

- Rollen/Synergien und Freischaltbedingungen der Klassen 6–15 nach echten Langzeitmessungen.
- Konkrete Opportunitätskosten der vier geplanten Labor-Builds.
- Anforderungen und Resetumfang des späteren Axiom-Layers.
