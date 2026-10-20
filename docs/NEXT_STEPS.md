# Nächste Schritte · 20.10.2026

## Unity: laufende funktionale Migration

Branch `codex/unity-rewrite`, Unity `6000.3.26f1`, Szene `IdleIntelligence/Assets/Scenes/IdleIntelligence.unity`. [Play-Anleitung](unity-playable-slice.md), [Arbeitsregeln](../IdleIntelligence/AGENTS.md), [Abnahmeliste](unity-functional-acceptance.md).

Forschung/Industrie, isolierte V2-Challenges, Statistiken/Mastery, Achievements/Profil, UTC-Missionen/Tagesbonusboxen und die drei V2-Seasons sind im dokumentierten Umfang implementiert und geprüft. [Missionsbericht](unity-missions.md), [Season-Bericht](unity-seasons.md). Der gesamte Rewrite ist weiter offen.

1. Abschnitt 5c ist ergänzt: [Gumball und Gem-Angebote](unity-gems.md) mit tatsächlichen Boost-/Upgradeverbrauchern. Legacy-/Webimport bleibt Abschnitt 8. [Markt/Truhen/Rotation](unity-market.md) sind als 5b bereits portiert. [Aktive Drops](unity-signals.md) samt Missionsproduzenten sind als 5a bereits implementiert und geprüft.
2. Abschnitt 6b ist ergänzt: [Werbe-/Forschungsskipverträge](unity-ads.md), Limits, gespeicherte Aufträge, Creditboost und echte Werbefrei-Verbraucher. [Vorbereitete Kaufverträge 6a](unity-purchases.md) mit Restore/Widerruf, dauerhaften Rechten und Save-v14-Erhaltung sind ergänzt. Keine SDKs oder vorgetäuschten Käufe.
3. Abschnitt 7: vollständige Kapitel/Mira/Tutorial, sieben Sprachen, alle Einstellungen, vorhandenes Audio und unterstützte Haptik. Namenspolicy und erster Profil-/KI-Name sind bereits portiert.
4. Abschnitt 8: expliziter validierter Webimport mit Originalkopie und Erhaltung unbekannter Daten, Export/Recovery, Rückkehr-/Diagnose-/Balanceberichte und restliche Speicherverträge.
5. Danach gemeinsamer optischer Feinschliff und tatsächliche Geräte-/Player-/Releaseprüfung. TypeScript und Backups erhalten; nichts mergen oder veröffentlichen.

Die bisherigen TypeScript-/iOS-Releasepunkte unten bleiben erhalten; während der Unity-Einrichtung keinen ungeprüften Pull/Sync über lokale Bestände ausführen.

Aktueller Arbeitsstand: Bereinigung, Startbildschirm und Namensfilter nach dem gemergten frühen Balancing aus PR #125. Historische Iterationsprotokolle liegen in der Git-Historie. [Aktuelle Roadmap](ROADMAP.md), [Bereinigungsnachweis](cleanup-loading-names.md).

1. Nach Merge auf dem Mac `git pull`, anschließend `npm ci` und `npm run ios:prepare`. Der Befehl baut vor dem Capacitor-Sync; ein fehlgeschlagener Build darf nicht durch einen separaten Sync alter `dist`-Dateien umgangen werden.
2. Auf einem echten iPhone starten: Prestigenetz (Ziehen, Pinch, Kauf), Craft-/Fusionsbewegung einschließlich schneller Wiederholung, reduzierte Bewegung, Hintergrundwechsel und Share-Sheet prüfen. Vor eigenen Resettests einen Spielstand exportieren. Die Repository-Bereinigung löscht keine Geräte-Spielstände.
3. Frische aktive/gelegentliche Runs und mehrere Prestiges spielen. Balance-ZIP mit Buildversion, Run-Historie und Ereignissen exportieren. Frühere technische Prüfzustände und vorgegebene Ressourcen sind keine natürliche Balanceabnahme.
4. Native Werbung und Käufe nur als eigenen Integrationsauftrag anschließen; Produkte/Preise im Store, echte Abschluss-/Abbruchfälle, Serverprüfung und Restore gemeinsam abnehmen. Vorbereitete Produktkarten sind keine aktiven Käufe.
5. Vor Store-Einreichung die offenen Geräte-, Datenschutz-, Lokalisierungs- und Langzeitpunkte der Roadmap abarbeiten.

## Wartung

- `npm run typecheck`: Pfadprüfung, vorhandene statische Runtime-Assets und TypeScript inklusive ungenutzter Deklarationen.
- `npm test`: reguläre Regressionen. Historische Save-/Regeltests bleiben dort, wo sie noch aktive Schutzverträge prüfen.
- `npm run test:campaigns`: vier separat gehaltene Langzeitdateien; auch über den manuellen GitHub-Workflow ausführbar. Nicht mit ungenutzten Tests verwechseln.
- `npm run build`: vollständiger Produktionsbuild; die bekannte Hauptbundle-Größenwarnung ist noch offen.
- `node scripts/cleanup-loading-audit.mjs`: Browser mit installiertem Playwright/Chromium; Start vor/nach JS, verzögerte Save-Ladung, Tipps, Reduced Motion, Namensablehnung, Speichern/Reload und Startfehler-Wiederholung. Browserpfade können über Umgebungsvariablen angegeben werden.
- `src/moderation/blockedTerms.json` und `reservedNames.json`: gepflegte Listen, Quellen/Lizenz in `NOTICE.md` und in den App-Einstellungen. Keine automatische, ungeprüfte Aktualisierung aus dem Internet.

- `node scripts/network-forge-audit.mjs`: echte App-Aktionen auf drei mobilen Browserbreiten mit finanzierten Testzuständen, Screenshots und kurzem Craft-/Fusionsclip.
