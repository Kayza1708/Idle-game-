# Nächste Schritte

## Unity-Rewrite · lokaler Arbeitszweig

Einrichtung auf `codex/unity-rewrite`: Unity `6000.3.26f1`, Projekt `IdleIntelligence/`. [Arbeitsregeln](../IdleIntelligence/AGENTS.md), [Migrationsliste und Prüfstand](unity-migration.md), [vollständiger Dateikatalog](unity-source-inventory.md).

1. Den ersten Abschnitt in `Assets/Scenes/IdleIntelligence.unity` mit Unity 6000.3.26f1 öffnen und anhand der [Play-Anleitung](unity-playable-slice.md) testen. Einrichtung ist separat in `ab67478` gesichert; aktueller Umfang samt Prüfnachweisen ist dokumentiert. Der gesamte Rewrite ist weiter offen.
2. Materialbelohnungen bezahlter Hardwarekäufe und -meilensteine, restliche Forschung/Jobs/Queues und zusätzliche Fortschrittsfelder mit gemeinsamen TypeScript-Fixtures ergänzen. Keine Balancewerte ändern; `npm run unity:check` vor jedem Port prüfen.
3. Versionierten, expliziten Web-Save-Import und Recovery-/Exportoberfläche entwickeln, bevor vorhandene Web-Saves übernommen werden. Das jetzige Format speichert ausschließlich den Slice; unbekannte/beschädigte Originale bleiben gesperrt. Weitere Uhr-/Resume-/Crash-/Gerätefälle und später Challengeisolation prüfen.
4. Items/Forge/Modelle, INT/Prestige/Axiome, Automation, Challenges, Meta/Seasons und vorbereitete Shopschnittstellen gemäß vollständiger Migrationsliste ergänzen. Bestehende TypeScript-Systeme erhalten.
5. Vollständige mobile UI, Story/Namensprüfung, sieben Sprachen, originale Fonts, Animation, Audio, Barrierefreiheit und Geräteprüfung abschließen. Native Werbung/Käufe, Veröffentlichung, Merge und Entfernen der TypeScript-Version erfordern einen neuen Auftrag.

Die bisherigen TypeScript-/iOS-Releasepunkte unten bleiben erhalten; während der Unity-Einrichtung keinen ungeprüften Pull/Sync über lokale Bestände ausführen.

Aktueller Arbeitsstand: Bereinigung, Startbildschirm und Namensfilter nach dem gemergten frühen Balancing aus PR #125. Historische Iterationsprotokolle liegen in der Git-Historie. [Aktuelle Roadmap](ROADMAP.md), [Bereinigungsnachweis](cleanup-loading-names.md).

1. Nach Merge auf dem Mac `git pull`, anschließend `npm ci` und `npm run ios:prepare`. Der Befehl baut vor dem Capacitor-Sync; ein fehlgeschlagener Build darf nicht durch einen separaten Sync alter `dist`-Dateien umgangen werden.
2. Auf einem echten iPhone starten: Ladebildschirm, bestehender Spielstand, gesperrte/erlaubte Namen, Einstellungen, Crafting/Fusion und Share-Sheet prüfen. Vor eigenen Resettests einen Spielstand exportieren. Die Repository-Bereinigung löscht keine Geräte-Spielstände.
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
