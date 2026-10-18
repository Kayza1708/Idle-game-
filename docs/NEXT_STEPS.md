# Nächste Schritte

Aktueller Arbeitsstand: Prestigenetz und Schmiedebewegung nach PR #126. [Aktuelle Abnahme und Vorschau](network-forge-motion.md). Historische Iterationsprotokolle liegen in der Git-Historie. [Aktuelle Roadmap](ROADMAP.md), [Bereinigungsnachweis](cleanup-loading-names.md).

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
